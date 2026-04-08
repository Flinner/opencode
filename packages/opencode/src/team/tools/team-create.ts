import z from "zod"
import { Effect } from "effect"
import { Tool } from "@/tool/tool"
import { Team } from "../service"

const parameters = z.object({
  task_description: z.string().describe("A description of the overall task to be accomplished by the team"),
  worker_count: z.number().int().positive().describe("Number of worker agents to spawn"),
  worker_role: z.string().default("executor").describe("Role for workers (e.g., 'executor', 'test-engineer')"),
})

type MyMetadata = {
  teamName: string
}

export const TeamCreateTool = Tool.defineEffect<typeof parameters, MyMetadata, never>(
  "team_create",
  Effect.gen(function* () {
    return {
      description: "Create a new team session with multiple worker agents. Use this to coordinate parallel work on a complex task.",
      parameters,
      async execute(params: z.infer<typeof parameters>, ctx: Tool.Context<MyMetadata>) {
        const manifest = await Team.create({
          taskDescription: params.task_description,
          workerCount: params.worker_count,
          workerRole: params.worker_role,
          leaderSessionID: ctx.sessionID as any,
        })

        return {
          title: `Team created: ${manifest.teamName}`,
          metadata: { teamName: manifest.teamName },
          output: [
            `Team created: ${manifest.teamName}`,
            `Workers: ${manifest.workerCount} × ${manifest.workerRole}`,
            `Phase: ${manifest.phase}`,
            `Directory: .opencode/team/${manifest.teamName}/`,
            "",
            "Next: Use /team-spawn to start workers, then /team-phase to advance through planning → exec → verify.",
          ].join("\n"),
        }
      },
    } satisfies Tool.DefWithoutID<typeof parameters, MyMetadata>
  }),
)
