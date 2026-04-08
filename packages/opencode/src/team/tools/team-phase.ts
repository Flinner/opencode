import z from "zod"
import { Effect } from "effect"
import { Tool } from "@/tool/tool"
import { Team } from "../service"
import { TeamPhase, TerminalPhase } from "../types"

const parameters = z.object({
  team_name: z.string().describe("The team name"),
  action: z.enum(["get", "advance"]).default("get").describe("Get current phase or advance to next"),
  to: z
    .enum(["team-plan", "team-prd", "team-exec", "team-verify", "team-fix", "complete", "failed"])
    .optional()
    .describe("Target phase when advancing"),
  reason: z.string().optional().describe("Reason for the phase transition"),
})

type MyMetadata = {
  teamName: string
  phase?: string
  ok?: boolean
}

export const TeamPhaseTool = Tool.defineEffect<typeof parameters, MyMetadata, never>(
  "team_phase",
  Effect.gen(function* () {
    return {
      description: "Get or advance the team phase. Phases: team-plan → team-prd → team-exec → team-verify → team-fix (loop) → complete/failed.",
      parameters,
      async execute(params: z.infer<typeof parameters>, ctx: Tool.Context<MyMetadata>) {
        if (params.action === "get") {
          const state = await Team.getState(params.team_name)
          if (!state) {
            return { title: "Team not found", metadata: { teamName: params.team_name }, output: `Team ${params.team_name} not found` }
          }
          const nextPhases = await Team.getNextPhases(params.team_name)
          const instructions = Team.getPhaseInstructions(state.phase as TeamPhase)
          const agents = Team.getPhaseAgents(state.phase as TeamPhase)

          return {
            title: `Phase: ${state.phase}`,
            metadata: { teamName: params.team_name, phase: state.phase },
            output: [
              `Team: ${params.team_name}`,
              `Current phase: ${state.phase}`,
              `Active: ${state.active}`,
              `Fix attempts: ${state.currentFixAttempt}/${state.maxFixAttempts}`,
              "",
              `Phase agents: ${agents.join(", ")}`,
              "",
              `Instructions: ${instructions}`,
              "",
              `Valid next phases: ${nextPhases.join(", ") || "none (terminal)"}`,
            ].join("\n"),
          }
        } else {
          if (!params.to) {
            return { title: "Missing target phase", metadata: { teamName: params.team_name }, output: "Specify 'to' phase when advancing" }
          }
          const result = await Team.advancePhase(params.team_name, params.to as TeamPhase | TerminalPhase, params.reason)
          if (!result.ok) {
            return {
              title: `Phase advance failed: ${params.to}`,
              metadata: { teamName: params.team_name, ok: false },
              output: `Failed to advance phase: ${result.error}`,
            }
          }
          return {
            title: `Phase advanced to ${params.to}`,
            metadata: { teamName: params.team_name, newPhase: params.to, ok: true },
            output: [
              `Phase advanced successfully`,
              `New phase: ${params.to}`,
              `Team active: ${result.newState?.active ?? false}`,
            ].join("\n"),
          }
        }
      },
    } satisfies Tool.DefWithoutID<typeof parameters, MyMetadata>
  }),
)
