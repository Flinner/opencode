import z from "zod"
import { Effect } from "effect"
import { Tool } from "@/tool/tool"
import { Team } from "../service"

const parameters = z.object({
  team_name: z.string().describe("The team name"),
  task_id: z.string().describe("The task ID to claim"),
  worker: z.string().describe("Worker name (e.g., 'worker-1')"),
  expected_version: z.number().int().positive().default(1).describe("Expected claim version (pass 1 for unclaimed tasks)"),
})

type MyMetadata = {
  taskId: string
  ok: boolean
  claimToken?: string
}

export const TaskClaimTool = Tool.defineEffect<typeof parameters, MyMetadata, never>(
  "team_task_claim",
  Effect.gen(function* () {
    return {
      description: "Atomically claim a task from the team queue. Uses versioned claims to prevent race conditions. Only one worker can hold a claim at a time.",
      parameters,
      async execute(params: z.infer<typeof parameters>, ctx: Tool.Context<MyMetadata>) {
        const result = await Team.claimTask({
          teamName: params.team_name,
          taskId: params.task_id,
          worker: params.worker,
          expectedVersion: params.expected_version,
        })

        if (!result.ok) {
          return {
            title: `Claim failed: ${params.task_id}`,
            metadata: { taskId: params.task_id, ok: false },
            output: `Failed to claim task ${params.task_id}: ${result.reason}`,
          }
        }

        return {
          title: `Task claimed: ${params.task_id}`,
          metadata: { taskId: params.task_id, claimToken: result.claimToken, ok: true },
          output: [
            `Task claimed successfully`,
            `Task ID: ${params.task_id}`,
            `Claim token: ${result.claimToken}`,
            `Owner: ${result.task?.owner}`,
            "",
            "IMPORTANT: Store the claim_token. You must pass it when transitioning or releasing the task.",
          ].join("\n"),
        }
      },
    } satisfies Tool.DefWithoutID<typeof parameters, MyMetadata>
  }),
)
