import fs from "fs/promises"
import path from "path"
import { lockPath } from "./io"
import { randomUUID } from "crypto"

export interface Lock {
  token: string
  resource: string
  createdAt: string
}

export async function acquireLock(
  directory: string,
  teamName: string,
  resource: string,
  ttlMs: number = 30000,
): Promise<Lock | null> {
  const p = lockPath(directory, teamName, resource)
  await fs.mkdir(path.dirname(p), { recursive: true })
  try {
    const existing = await fs.readFile(p, "utf-8").catch(() => null)
    if (existing) {
      const lock = JSON.parse(existing) as Lock
      const age = Date.now() - new Date(lock.createdAt).getTime()
      if (age < ttlMs) return null
    }
    const lock: Lock = { token: randomUUID(), resource, createdAt: new Date().toISOString() }
    await fs.writeFile(p, JSON.stringify(lock))
    return lock
  } catch {
    return null
  }
}

export async function readLock(
  directory: string,
  teamName: string,
  resource: string,
): Promise<Lock | null> {
  const p = lockPath(directory, teamName, resource)
  try {
    const raw = await fs.readFile(p, "utf-8")
    return JSON.parse(raw) as Lock
  } catch {
    return null
  }
}

export async function writeLock(
  directory: string,
  teamName: string,
  lock: Lock | null,
  held: boolean,
): Promise<void> {
  if (!lock) return
  if (held) return
  const p = lockPath(directory, teamName, lock.resource)
  try {
    await fs.unlink(p)
  } catch {
    // lock already released
  }
}

export async function releaseLock(
  directory: string,
  teamName: string,
  resource: string,
  token: string,
): Promise<boolean> {
  const lock = await readLock(directory, teamName, resource)
  if (!lock || lock.token !== token) return false
  const p = lockPath(directory, teamName, resource)
  try {
    await fs.unlink(p)
    return true
  } catch {
    return false
  }
}
