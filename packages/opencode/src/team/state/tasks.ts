import fs from "fs/promises"
import path from "path"
import { TeamTask, TaskStatus, TEAM_STATE_DIR } from "../types"
import { tasksPath, ensureTeamDir } from "./io"
import { randomUUID } from "crypto"
import { readLock, writeLock } from "./locks"

export async function readTasks(directory: string, teamName: string): Promise<TeamTask[]> {
  const p = tasksPath(directory, teamName)
  try {
    const raw = await fs.readFile(p, "utf-8")
    return JSON.parse(raw) as TeamTask[]
  } catch {
    return []
  }
}

export async function writeTasks(directory: string, teamName: string, tasks: TeamTask[]): Promise<void> {
  const p = tasksPath(directory, teamName)
  await fs.mkdir(path.dirname(p), { recursive: true })
  await fs.writeFile(p, JSON.stringify(tasks, null, 2))
}

export interface CreateTaskInput {
  teamName: string
  subject: string
  description: string
  owner?: string
  phase?: string
}

export async function createTask(directory: string, input: CreateTaskInput): Promise<TeamTask> {
  const tasks = await readTasks(directory, input.teamName)
  const task: TeamTask = {
    id: randomUUID(),
    teamName: input.teamName,
    subject: input.subject,
    description: input.description,
    status: "pending",
    owner: input.owner,
    claimToken: undefined,
    claimVersion: 1,
    phase: input.phase as any,
    result: undefined,
    error: undefined,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    completedAt: undefined,
  }
  tasks.push(task)
  await writeTasks(directory, input.teamName, tasks)
  return task
}

export interface ClaimTaskInput {
  teamName: string
  taskId: string
  worker: string
  expectedVersion: number
}

export interface ClaimResult {
  task: TeamTask
  claimToken: string
  ok: boolean
  reason?: string
}

export async function claimTask(
  directory: string,
  input: ClaimTaskInput,
): Promise<ClaimResult> {
  const lock = await readLock(directory, input.teamName, `task-${input.taskId}`)
  try {
    const tasks = await readTasks(directory, input.teamName)
    const task = tasks.find((t) => t.id === input.taskId)
    if (!task) return { task: null as any, claimToken: "", ok: false, reason: "Task not found" }
    if (task.status === "completed" || task.status === "failed") {
      return { task, claimToken: "", ok: false, reason: `Task is ${task.status}` }
    }
    if (task.status === "in_progress" && task.claimVersion !== input.expectedVersion) {
      return { task, claimToken: "", ok: false, reason: "Task already claimed by another worker" }
    }
    const claimToken = randomUUID()
    const updatedTasks = tasks.map((t) =>
      t.id === input.taskId
        ? { ...t, status: "in_progress" as TaskStatus, owner: input.worker, claimToken, claimVersion: t.claimVersion + 1, updatedAt: new Date().toISOString() }
        : t,
    )
    await writeTasks(directory, input.teamName, updatedTasks)
    const updated = updatedTasks.find((t) => t.id === input.taskId)!
    return { task: updated, claimToken, ok: true }
  } finally {
    await writeLock(directory, input.teamName, lock, false)
  }
}

export interface TransitionTaskInput {
  teamName: string
  taskId: string
  from: TaskStatus
  to: TaskStatus
  claimToken: string
  result?: string
  error?: string
}

export async function transitionTask(
  directory: string,
  input: TransitionTaskInput,
): Promise<{ ok: boolean; task?: TeamTask; reason?: string }> {
  const lock = await readLock(directory, input.teamName, `task-${input.taskId}`)
  try {
    const tasks = await readTasks(directory, input.teamName)
    const task = tasks.find((t) => t.id === input.taskId)
    if (!task) return { ok: false, reason: "Task not found" }
    if (task.claimToken !== input.claimToken) return { ok: false, reason: "Invalid claim token" }
    if (task.status !== input.from) return { ok: false, reason: `Task is ${task.status}, expected ${input.from}` }
    const updatedTasks = tasks.map((t) =>
      t.id === input.taskId
        ? {
            ...t,
            status: input.to,
            result: input.result ?? t.result,
            error: input.error ?? t.error,
            completedAt: input.to === "completed" || input.to === "failed" ? new Date().toISOString() : t.completedAt,
            updatedAt: new Date().toISOString(),
          }
        : t,
    )
    await writeTasks(directory, input.teamName, updatedTasks)
    return { ok: true, task: updatedTasks.find((t) => t.id === input.taskId) }
  } finally {
    await writeLock(directory, input.teamName, lock, false)
  }
}

export async function releaseTaskClaim(
  directory: string,
  teamName: string,
  taskId: string,
  worker: string,
  claimToken: string,
): Promise<{ ok: boolean; reason?: string }> {
  const lock = await readLock(directory, teamName, `task-${taskId}`)
  try {
    const tasks = await readTasks(directory, teamName)
    const task = tasks.find((t) => t.id === taskId)
    if (!task) return { ok: false, reason: "Task not found" }
    if (task.claimToken !== claimToken) return { ok: false, reason: "Invalid claim token" }
    if (task.owner !== worker) return { ok: false, reason: "Task owned by different worker" }
    const updatedTasks = tasks.map((t) =>
      t.id === taskId
        ? { ...t, status: "pending" as TaskStatus, owner: undefined, claimToken: undefined, updatedAt: new Date().toISOString() }
        : t,
    )
    await writeTasks(directory, teamName, updatedTasks)
    return { ok: true }
  } finally {
    await writeLock(directory, teamName, lock, false)
  }
}
