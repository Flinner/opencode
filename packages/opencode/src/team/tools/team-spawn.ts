import z from "zod"
import { Effect } from "effect"
import { Tool } from "@/tool/tool"
import { Session } from "@/session"
import { SessionPrompt } from "@/session/prompt"
import { MessageID } from "@/session/schema"
import { Team } from "../service"
import { Skill } from "@/skill"
import { randomUUID } from "crypto"
import { TabEvents } from "@/util/tab-events"

const parameters = z.object({
  team_name: z.string().describe("The team name"),
  count: z.number().int().positive().default(1).describe("Number of workers to spawn"),
  role: z.string().default("general").describe("Worker role (e.g., 'general', 'explore')"),
  model: z
    .string()
    .optional()
    .describe(
      "Optional: force all workers to use a specific model (e.g., 'claude-sonnet-4-20250514'). Otherwise uses leader's model.",
    ),
  prompt: z.string().optional().describe("Optional: custom system prompt override for workers"),
})

type MyMetadata = {
  teamName: string
  workerCount: number
}

export const TeamSpawnTool = Tool.defineEffect<typeof parameters, MyMetadata, never>(
  "team_spawn",
  Effect.gen(function* () {
    return {
      description:
        "Spawn N worker sessions for a team. Each worker registers with the team and enters a skill loop to poll for tasks.",
      parameters,
      async execute(params: z.infer<typeof parameters>, ctx: Tool.Context<MyMetadata>) {
        const teamState = await Team.getState(params.team_name)
        if (!teamState) {
          return {
            title: "Team not found",
            metadata: { teamName: params.team_name, workerCount: 0 },
            output: `Team ${params.team_name} not found`,
          }
        }

        const workerSkill = await Skill.get("worker")
        const skillContent = workerSkill?.content ?? ""

        const workerRole = "general"
        const leaderModel = ctx.extra?.model as { modelID?: string; providerID?: string } | undefined
        const resolvedModel = params.model
          ? { modelID: params.model as any, providerID: "opencode" as any }
          : leaderModel?.modelID
            ? { modelID: leaderModel.modelID as any, providerID: (leaderModel.providerID ?? "opencode") as any }
            : { modelID: "claude-sonnet-4-20250514" as any, providerID: "opencode" as any }

        const phase = teamState.phase
        const instructions = Team.getPhaseInstructions(phase as any)
        const agents = Team.getPhaseAgents(phase as any)

        const basePrompt =
          params.prompt ??
          [
            `You are a ${workerRole} worker on team ${params.team_name}.`,
            `Your team is in phase: ${phase}`,
            `Phase instructions: ${instructions}`,
            `Available phase agents: ${agents.join(", ")}`,
          ].join("\n")

        const systemPrompt = skillContent
          ? `${basePrompt}\n\n<skill_content name="worker">\n${skillContent}\n</skill_content>`
          : basePrompt

        const results: Array<{ workerName: string; sessionId: string; role: string }> = []
        const errors: string[] = []

        for (let i = 0; i < params.count; i++) {
          const workerName = `worker-${randomUUID().slice(0, 6)}`
          const messageID = MessageID.ascending()

          const session = await Session.create({
            parentID: ctx.sessionID,
            title: `${params.team_name}/${workerRole}#${i + 1}`,
            permission: [
              { permission: "todowrite", pattern: "*", action: "deny" as const },
              { permission: "task", pattern: "*", action: "deny" as const },
            ],
          })

          await Team.registerWorker({
            teamName: params.team_name,
            role: workerRole,
            sessionID: session.id,
          })

          TabEvents.emit("tabOpen", session.id)

          try {
            await SessionPrompt.prompt({
              messageID,
              sessionID: session.id,
              model: resolvedModel,
              agent: workerRole,
              tools: {
                team_mailbox_list: true,
                team_mailbox_send: true,
                team_task_claim: true,
                team_task_create: true,
                team_task_transition: true,
                team_status: true,
                team_phase: true,
              },
              parts: [
                {
                  type: "text",
                  text: systemPrompt,
                },
              ],
            })
          } catch (err) {
            errors.push(`${workerName}: ${err instanceof Error ? err.message : String(err)}`)
          }

          results.push({ workerName, sessionId: session.id, role: workerRole })
        }

        const output = [
          `Spawned ${results.length} workers for team ${params.team_name}`,
          ...results.map((w) => `  ${w.workerName}: session ${w.sessionId} (${w.role})`),
          "",
          skillContent ? "" : "Warning: $worker skill not found in registry.",
          errors.length > 0 ? `Errors: ${errors.join("; ")}` : "Workers are ready.",
          "Use team_phase to advance the team through phases.",
        ]
          .filter(Boolean)
          .join("\n")

        return {
          title: `Spawned ${results.length} workers`,
          metadata: { teamName: params.team_name, workerCount: results.length },
          output,
        }
      },
    } satisfies Tool.DefWithoutID<typeof parameters, MyMetadata>
  }),
)
