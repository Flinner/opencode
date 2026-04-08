import fs from "fs/promises"
import path from "path"
import { Worker, WorkerStatus, TEAM_STATE_DIR } from "../types"
import { workersPath } from "./io"
import { randomUUID } from "crypto"
import { SessionID } from "@/session/schema"

export async function readWorkers(directory: string, teamName: string): Promise<Worker[]> {
  const p = workersPath(directory, teamName)
  try {
    const raw = await fs.readFile(p, "utf-8")
    return JSON.parse(raw) as Worker[]
  } catch {
    return []
  }
}

export async function writeWorkers(directory: string, teamName: string, workers: Worker[]): Promise<void> {
  const p = workersPath(directory, teamName)
  await fs.mkdir(path.dirname(p), { recursive: true })
  await fs.writeFile(p, JSON.stringify(workers, null, 2))
}

export async function registerWorker(
  directory: string,
  teamName: string,
  role: string,
  sessionID?: SessionID,
): Promise<Worker> {
  const workers = await readWorkers(directory, teamName)
  const name = `worker-${workers.length + 1}`
  const worker: Worker = {
    name,
    teamName,
    sessionID,
    role,
    status: "idle",
    turnCount: 0,
    alive: true,
    lastHeartbeat: new Date().toISOString(),
    currentTaskId: undefined,
    inbox: undefined,
  }
  workers.push(worker)
  await writeWorkers(directory, teamName, workers)
  return worker
}

export async function updateWorkerHeartbeat(
  directory: string,
  teamName: string,
  name: string,
  pid: number,
  turnCount: number,
  alive: boolean,
): Promise<Worker | null> {
  const workers = await readWorkers(directory, teamName)
  const worker = workers.find((w) => w.name === name)
  if (!worker) return null
  worker.pid = pid
  worker.turnCount = turnCount
  worker.alive = alive
  worker.lastHeartbeat = new Date().toISOString()
  await writeWorkers(directory, teamName, workers)
  return worker
}

export async function updateWorkerStatus(
  directory: string,
  teamName: string,
  name: string,
  status: WorkerStatus,
  currentTaskId?: string,
): Promise<Worker | null> {
  const workers = await readWorkers(directory, teamName)
  const worker = workers.find((w) => w.name === name)
  if (!worker) return null
  worker.status = status
  worker.currentTaskId = currentTaskId
  worker.lastHeartbeat = new Date().toISOString()
  await writeWorkers(directory, teamName, workers)
  return worker
}

export async function getWorker(directory: string, teamName: string, name: string): Promise<Worker | null> {
  const workers = await readWorkers(directory, teamName)
  return workers.find((w) => w.name === name) ?? null
}

export async function removeWorker(directory: string, teamName: string, name: string): Promise<void> {
  const workers = await readWorkers(directory, teamName)
  const filtered = workers.filter((w) => w.name !== name)
  await writeWorkers(directory, teamName, filtered)
}

export async function getIdleWorkers(directory: string, teamName: string): Promise<Worker[]> {
  const workers = await readWorkers(directory, teamName)
  return workers.filter((w) => w.status === "idle" && w.alive)
}
