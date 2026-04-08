import z from "zod"
import { SessionID } from "../session/schema"

export const TeamPhase = z.enum(["team-plan", "team-prd", "team-exec", "team-verify", "team-fix"])
export type TeamPhase = z.infer<typeof TeamPhase>

export const TerminalPhase = z.enum(["complete", "failed", "cancelled"])
export type TerminalPhase = z.infer<typeof TerminalPhase>

export const TaskStatus = z.enum(["pending", "in_progress", "completed", "failed"])
export type TaskStatus = z.infer<typeof TaskStatus>

export const TeamTask = z.object({
  id: z.string(),
  teamName: z.string(),
  subject: z.string(),
  description: z.string(),
  status: TaskStatus,
  owner: z.string().optional(),
  claimToken: z.string().optional(),
  claimVersion: z.number().int().positive().default(1),
  phase: TeamPhase.optional(),
  result: z.string().optional(),
  error: z.string().optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
  completedAt: z.string().optional(),
})
export type TeamTask = z.infer<typeof TeamTask>

export const WorkerStatus = z.enum(["idle", "busy", "error", "disconnected"])
export type WorkerStatus = z.infer<typeof WorkerStatus>

export const Worker = z.object({
  name: z.string(),
  teamName: z.string(),
  sessionID: SessionID.zod.optional(),
  role: z.string(),
  status: WorkerStatus.default("idle"),
  turnCount: z.number().int().nonnegative().default(0),
  pid: z.number().int().positive().optional(),
  alive: z.boolean().default(true),
  lastHeartbeat: z.string(),
  currentTaskId: z.string().optional(),
  inbox: z.string().optional(),
})
export type Worker = z.infer<typeof Worker>

export const MailboxMessage = z.object({
  id: z.string(),
  teamName: z.string(),
  fromWorker: z.string(),
  toWorker: z.string().optional(),
  body: z.string(),
  delivered: z.boolean().default(false),
  notified: z.boolean().default(false),
  createdAt: z.string(),
})
export type MailboxMessage = z.infer<typeof MailboxMessage>

export const TeamManifest = z.object({
  schemaVersion: z.literal("1.0").default("1.0"),
  teamName: z.string(),
  leaderSessionID: SessionID.zod,
  taskDescription: z.string(),
  phase: TeamPhase.default("team-plan"),
  active: z.boolean().default(true),
  createdAt: z.string(),
  maxFixAttempts: z.number().int().positive().default(3),
  currentFixAttempt: z.number().int().nonnegative().default(0),
  workerCount: z.number().int().positive(),
  workerRole: z.string().default("executor"),
})
export type TeamManifest = z.infer<typeof TeamManifest>

export const TeamEvent = z.object({
  id: z.string(),
  teamName: z.string(),
  type: z.string(),
  worker: z.string().optional(),
  taskId: z.string().optional(),
  reason: z.string().optional(),
  phase: TeamPhase.optional(),
  createdAt: z.string(),
  data: z.record(z.string(), z.unknown()).optional(),
})
export type TeamEvent = z.infer<typeof TeamEvent>

export const PhaseTransitions = z.object({
  from: TeamPhase.or(TerminalPhase),
  to: TeamPhase.or(TerminalPhase),
  at: z.string(),
  reason: z.string().optional(),
})
export type PhaseTransitions = z.infer<typeof PhaseTransitions>

export const TeamState = TeamManifest.extend({
  phaseTransitions: PhaseTransitions.array().default([]),
})
export type TeamState = z.infer<typeof TeamState>

export const TEAM_STATE_DIR = ".opencode/team"

export const PHASE_AGENTS: Record<TeamPhase, string[]> = {
  "team-plan": ["analyst", "planner"],
  "team-prd": ["product-manager", "analyst"],
  "team-exec": ["executor", "designer", "test-engineer"],
  "team-verify": ["verifier", "quality-reviewer", "security-reviewer"],
  "team-fix": ["executor", "build-fixer", "debugger"],
}

export const TRANSITIONS: Record<TeamPhase, Array<TeamPhase | TerminalPhase>> = {
  "team-plan": ["team-prd"],
  "team-prd": ["team-exec"],
  "team-exec": ["team-verify"],
  "team-verify": ["team-fix", "complete", "failed"],
  "team-fix": ["team-exec", "team-verify", "complete", "failed"],
}

export function isTerminalPhase(phase: TeamPhase | TerminalPhase): phase is TerminalPhase {
  return TerminalPhase.options.includes(phase as TerminalPhase)
}

export function isValidTransition(
  from: TeamPhase,
  to: TeamPhase | TerminalPhase,
): boolean {
  return TRANSITIONS[from]?.includes(to) ?? false
}

export function getPhaseInstructions(phase: TeamPhase): string {
  switch (phase) {
    case "team-plan":
      return "PHASE: Planning. Use /analyst for requirements, /planner for task breakdown. Output: task list with dependencies."
    case "team-prd":
      return "PHASE: Requirements. Use /product-manager for PRD, /analyst for acceptance criteria. Output: explicit scope and success metrics."
    case "team-exec":
      return "PHASE: Execution. Use /executor for implementation, /test-engineer for tests. Output: working code with tests."
    case "team-verify":
      return "PHASE: Verification. Use /verifier for evidence collection, /quality-reviewer for review. Output: pass/fail with evidence."
    case "team-fix":
      return "PHASE: Fixing. Use /debugger for root cause, /executor for fixes. Output: fixed code, re-verify needed."
  }
}
