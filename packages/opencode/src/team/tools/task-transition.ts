import z from "zod"
import { Effect } from "effect"
import { Tool } from "@/tool/tool"
import { Team } from "../service"

const parameters = z.object({
  team_name: z.string().describe("The team name"),
  task_id: z.string().describe("The task ID"),
  from: z.enum(["pending", "in_progress", "completed", "failed"]).describe("Current status"),
  to: z.enum(["pending", "in_progress", "completed", "failed"]).describe("Desired status"),
  claim_token: z.string().describe("Claim token from team_task_claim"),
  result: z.string().optional().describe("Result text (for completed tasks)"),
  error: z.string().optional().describe("Error message (for failed tasks)"),
})

type MyMetadata = {
  taskId: string
  ok: boolean
}

export const TaskTransitionTool = Tool.defineEffect<typeof parameters, MyMetadata, never>(
  "team_task_transition",
  Effect.gen(function* () {
    return {
      description: "Transition a task to a new status (pending → in_progress → completed/failed). Requires a valid claim_token from team_task_claim.",
      parameters,
      async execute(params: z.infer<typeof parameters>, ctx: Tool.Context<MyMetadata>) {
        const result = await Team.transitionTask({
          teamName: params.team_name,
          taskId: params.task_id,
          from: params.from,
          to: params.to,
          claimToken: params.claim_token,
          result: params.result,
          error: params.error,
        })

        if (!result.ok) {
          return {
            title: `Transition failed: ${params.task_id}`,
            metadata: { taskId: params.task_id, ok: false },
            output: `Failed to transition task: ${result.reason}`,
          }
        }

        return {
          title: `Task transitioned: ${params.task_id}`,
          metadata: { taskId: params.task_id, newStatus: params.to, ok: true },
          output: [
            `Task transitioned successfully`,
            `Task ID: ${params.task_id}`,
            `New status: ${params.to}`,
            ...(params.result ? [`Result: ${params.result}`] : []),
            ...(params.error ? [`Error: ${params.error}`] : []),
          ].join("\n"),
        }
      },
    } satisfies Tool.DefWithoutID<typeof parameters, MyMetadata>
  }),
)
