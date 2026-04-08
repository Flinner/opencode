import {
  TeamPhase,
  TerminalPhase,
  TeamState,
  TeamManifest,
  isTerminalPhase,
  isValidTransition,
  TRANSITIONS,
  TerminalPhase as TP,
} from "./types"
import { readTeamState, writeManifest } from "./state"
import { appendEvent } from "./state/events"

export async function advancePhase(
  directory: string,
  teamName: string,
  to: TeamPhase | TerminalPhase,
  reason?: string,
): Promise<{ ok: boolean; newState?: TeamState; error?: string }> {
  const state = await readTeamState(directory, teamName)
  if (!state) return { ok: false, error: "Team not found" }
  if (isTerminalPhase(state.phase)) return { ok: false, error: `Already in terminal phase: ${state.phase}` }

  const from = state.phase
  if (!isValidTransition(from, to)) {
    return { ok: false, error: `Invalid transition: ${from} -> ${to}` }
  }

  const isTerminal = isTerminalPhase(to)
  const manifest: TeamManifest = {
    ...state,
    phase: to as TeamPhase,
    active: !isTerminal,
    currentFixAttempt: to === "team-fix" ? state.currentFixAttempt + 1 : state.currentFixAttempt,
  }

  if (to === "team-fix" && manifest.currentFixAttempt > manifest.maxFixAttempts) {
    manifest.phase = "failed" as any
    manifest.active = false
  }

  await writeManifest(directory, manifest)
  await appendEvent(directory, teamName, "phase-transition", {
    phase: to as any,
    reason,
    data: { from, to },
  })

  const newState = await readTeamState(directory, teamName)
  return { ok: true, newState: newState! }
}

export async function getNextPhases(
  directory: string,
  teamName: string,
): Promise<Array<TeamPhase | TerminalPhase>> {
  const state = await readTeamState(directory, teamName)
  if (!state) return []
  if (isTerminalPhase(state.phase)) return []
  return TRANSITIONS[state.phase] ?? []
}

export async function canTransition(
  directory: string,
  teamName: string,
  to: TeamPhase | TerminalPhase,
): Promise<boolean> {
  const state = await readTeamState(directory, teamName)
  if (!state || isTerminalPhase(state.phase)) return false
  return isValidTransition(state.phase, to)
}
