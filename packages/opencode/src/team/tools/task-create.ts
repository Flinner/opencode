import z from "zod"
import { Effect } from "effect"
import { Tool } from "@/tool/tool"
import { Team } from "../service"

const parameters = z.object({
  team_name: z.string().describe("The team name"),
  subject: z.string().describe("Short subject/title for the task"),
  description: z.string().describe("Detailed description of the task"),
  owner: z.string().optional().describe("Optional: assign to a specific worker"),
})

type MyMetadata = {
  taskId: string
  teamName: string
}

export const TaskCreateTool = Tool.defineEffect<typeof parameters, MyMetadata, never>(
  "team_task_create",
  Effect.gen(function* () {
    return {
      description: "Create a task within a team. Tasks are units of work that workers can claim and execute.",
      parameters,
      async execute(params: z.infer<typeof parameters>, ctx: Tool.Context<MyMetadata>) {
        const task = await Team.addTask({
          teamName: params.team_name,
          subject: params.subject,
          description: params.description,
          owner: params.owner,
        })

        return {
          title: `Task created: ${params.subject}`,
          metadata: { taskId: task.id, teamName: params.team_name },
          output: [
            `Task created: ${task.id}`,
            `Subject: ${task.subject}`,
            `Description: ${task.description}`,
            `Status: ${task.status}`,
            `Team: ${params.team_name}`,
          ].join("\n"),
        }
      },
    } satisfies Tool.DefWithoutID<typeof parameters, MyMetadata>
  }),
)
