import fs from "fs/promises"
import path from "path"
import { TeamEvent, TEAM_STATE_DIR } from "../types"
import { eventsPath } from "./io"
import { randomUUID } from "crypto"

export async function appendEvent(
  directory: string,
  teamName: string,
  type: string,
  opts?: {
    worker?: string
    taskId?: string
    reason?: string
    phase?: string
    data?: Record<string, unknown>
  },
): Promise<TeamEvent> {
  const p = eventsPath(directory, teamName)
  await fs.mkdir(path.dirname(p), { recursive: true })
  const event: TeamEvent = {
    id: randomUUID(),
    teamName,
    type,
    worker: opts?.worker,
    taskId: opts?.taskId,
    reason: opts?.reason,
    phase: opts?.phase as any,
    createdAt: new Date().toISOString(),
    data: opts?.data,
  }
  const line = JSON.stringify(event) + "\n"
  await fs.appendFile(p, line)
  return event
}

export async function readEvents(directory: string, teamName: string): Promise<TeamEvent[]> {
  const p = eventsPath(directory, teamName)
  try {
    const raw = await fs.readFile(p, "utf-8")
    return raw
      .split("\n")
      .filter(Boolean)
      .map((line) => JSON.parse(line) as TeamEvent)
  } catch {
    return []
  }
}

export async function readEventsByType(
  directory: string,
  teamName: string,
  type: string,
): Promise<TeamEvent[]> {
  const events = await readEvents(directory, teamName)
  return events.filter((e) => e.type === type)
}
