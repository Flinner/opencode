import z from "zod"
import { Effect } from "effect"
import { Tool } from "@/tool/tool"
import { Team } from "../service"
import { SessionID } from "@/session/schema"

const parameters = z.object({
  team_name: z.string().describe("The team name"),
  role: z.string().default("executor").describe("Worker role (e.g., 'executor', 'verifier')"),
  session_id: SessionID.zod.optional().describe("The worker's session ID"),
})

type MyMetadata = {
  workerName: string
  teamName: string
}

export const WorkerRegisterTool = Tool.defineEffect<typeof parameters, MyMetadata, never>(
  "team_worker_register",
  Effect.gen(function* () {
    return {
      description: "Register a worker session with a team. Workers must register before they can claim tasks.",
      parameters,
      async execute(params: z.infer<typeof parameters>, ctx: Tool.Context<MyMetadata>) {
        const worker = await Team.registerWorker({
          teamName: params.team_name,
          role: params.role,
          sessionID: params.session_id,
        })

        return {
          title: `Worker registered: ${worker.name}`,
          metadata: { workerName: worker.name, teamName: params.team_name },
          output: [
            `Worker registered`,
            `Name: ${worker.name}`,
            `Role: ${worker.role}`,
            `Team: ${params.team_name}`,
            `Status: ${worker.status}`,
            "",
            `Use ${worker.name} as the 'worker' parameter in team_task_claim and team_mailbox_* tools.`,
          ].join("\n"),
        }
      },
    } satisfies Tool.DefWithoutID<typeof parameters, MyMetadata>
  }),
)
