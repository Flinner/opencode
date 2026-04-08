import z from "zod"
import { Effect } from "effect"
import { Tool } from "@/tool/tool"
import { Session } from "@/session"
import { SessionPrompt } from "@/session/prompt"
import { Agent } from "@/agent/agent"
import { MessageID } from "@/session/schema"
import { Team } from "../service"
import { Skill } from "@/skill"
import { randomUUID } from "crypto"

const parameters = z.object({
  team_name: z.string().describe("The team name"),
  count: z.number().int().positive().default(1).describe("Number of workers to spawn"),
  role: z.string().default("executor").describe("Worker role (e.g., 'executor', 'test-engineer')"),
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

        const workerPrompts = await Promise.all(
          Array.from({ length: params.count }, async (_, i) => {
            const workerName = `worker-${randomUUID().slice(0, 6)}`
            const workerRole = params.role

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

            const agent = await Agent.get(workerRole)
            const model = params.model ? { modelID: params.model as any, providerID: "opencode" as any } : undefined

            const messageID = MessageID.ascending()

            const phase = teamState.phase
            const instructions = Team.getPhaseInstructions(phase as any)
            const agents = Team.getPhaseAgents(phase as any)

            const basePrompt =
              params.prompt ??
              [
                `You are ${workerName}, a ${workerRole} worker on team ${params.team_name}.`,
                `Your team is in phase: ${phase}`,
                `Phase instructions: ${instructions}`,
                `Available phase agents: ${agents.join(", ")}`,
              ].join("\n")

            const systemPrompt = skillContent
              ? `${basePrompt}\n\n<skill_content name="worker">\n${skillContent}\n</skill_content>`
              : basePrompt

            SessionPrompt.prompt({
              messageID,
              sessionID: session.id,
              model: model ?? { modelID: "unknown", providerID: "opencode" },
              agent: agent?.name ?? workerRole,
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
            }).catch(console.error)

            return {
              workerName,
              sessionId: session.id,
              role: workerRole,
            }
          }),
        )

        return {
          title: `Spawned ${workerPrompts.length} workers`,
          metadata: { teamName: params.team_name, workerCount: workerPrompts.length },
          output: [
            `Spawned ${workerPrompts.length} workers for team ${params.team_name}`,
            ...workerPrompts.map((w) => `  ${w.workerName}: session ${w.sessionId} (${w.role})`),
            "",
            "Workers loaded $worker skill and are polling for tasks.",
            skillContent ? "" : "Warning: $worker skill not found in registry.",
            "Use team_phase to advance the team through phases.",
          ]
            .filter(Boolean)
            .join("\n"),
        }
      },
    } satisfies Tool.DefWithoutID<typeof parameters, MyMetadata>
  }),
)
