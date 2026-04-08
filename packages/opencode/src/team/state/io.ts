import fs from "fs"
import path from "path"
import { Global } from "@/global"
import { AppFileSystem } from "@/filesystem"
import { Effect } from "effect"
import { TeamState, TeamManifest, TEAM_STATE_DIR, isTerminalPhase, isValidTransition, TeamPhase, TerminalPhase } from "../types"
import { randomUUID } from "crypto"

export function teamDir(directory: string): string {
  return path.join(directory, TEAM_STATE_DIR)
}

export function manifestPath(directory: string, teamName: string): string {
  return path.join(teamDir(directory), teamName, "manifest.json")
}

export function tasksPath(directory: string, teamName: string): string {
  return path.join(teamDir(directory), teamName, "tasks.json")
}

export function workersPath(directory: string, teamName: string): string {
  return path.join(teamDir(directory), teamName, "workers.json")
}

export function mailboxPath(directory: string, teamName: string, worker: string): string {
  return path.join(teamDir(directory), teamName, "mailbox", `${worker}.json`)
}

export function eventsPath(directory: string, teamName: string): string {
  return path.join(teamDir(directory), teamName, "events.jsonl")
}

export function lockPath(directory: string, teamName: string, resource: string): string {
  return path.join(teamDir(directory), teamName, "locks", `${resource}.lock`)
}

export async function readManifest(directory: string, teamName: string): Promise<TeamManifest | null> {
  const fs = await import("fs/promises")
  const p = manifestPath(directory, teamName)
  try {
    const raw = await fs.readFile(p, "utf-8")
    return JSON.parse(raw) as TeamManifest
  } catch {
    return null
  }
}

export async function writeManifest(directory: string, manifest: TeamManifest): Promise<void> {
  const fs = await import("fs/promises")
  const p = manifestPath(directory, manifest.teamName)
  await fs.mkdir(path.dirname(p), { recursive: true })
  await fs.writeFile(p, JSON.stringify(manifest, null, 2))
}

export async function readTeamState(directory: string, teamName: string): Promise<TeamState | null> {
  const manifest = await readManifest(directory, teamName)
  if (!manifest) return null
  const { PhaseTransitions } = await import("../types")
  try {
    const { readEvents } = await import("./events")
    const events = await readEvents(directory, teamName)
    const transitions = events
      .filter((e) => e.type === "phase-transition")
      .map((e) => ({
        from: e.data?.from as TeamPhase | TerminalPhase,
        to: e.data?.to as TeamPhase | TerminalPhase,
        at: e.createdAt,
        reason: e.reason,
      }))
    return { ...manifest, phaseTransitions: transitions }
  } catch {
    return { ...manifest, phaseTransitions: [] }
  }
}

export async function ensureTeamDir(directory: string, teamName: string): Promise<void> {
  const fs = await import("fs/promises")
  await fs.mkdir(path.join(teamDir(directory), teamName, "mailbox"), { recursive: true })
  await fs.mkdir(path.join(teamDir(directory), teamName, "locks"), { recursive: true })
}

export async function listTeams(directory: string): Promise<string[]> {
  const fs = await import("fs/promises")
  const td = teamDir(directory)
  try {
    const entries = await fs.readdir(td)
    return entries.filter((e) => e !== "locks" && e !== "mailbox")
  } catch {
    return []
  }
}
