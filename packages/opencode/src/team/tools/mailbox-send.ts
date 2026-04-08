import z from "zod"
import { Effect } from "effect"
import { Tool } from "@/tool/tool"
import { Team } from "../service"

const parameters = z.object({
  team_name: z.string().describe("The team name"),
  from_worker: z.string().describe("Sender worker name"),
  to_worker: z.string().optional().describe("Recipient worker name (omit for broadcast)"),
  body: z.string().describe("Message body"),
})

type MyMetadata = {
  messageId?: string
  teamName: string
}

export const MailboxSendTool = Tool.defineEffect<typeof parameters, MyMetadata, never>(
  "team_mailbox_send",
  Effect.gen(function* () {
    return {
      description: "Send a message to a specific worker or broadcast to all workers in the team.",
      parameters,
      async execute(params: z.infer<typeof parameters>, ctx: Tool.Context<MyMetadata>) {
        if (params.to_worker) {
          const msg = await Team.sendMessage({
            teamName: params.team_name,
            fromWorker: params.from_worker,
            toWorker: params.to_worker,
            body: params.body,
          })
          return {
            title: `Message sent to ${params.to_worker}`,
            metadata: { messageId: msg.id, teamName: params.team_name },
            output: [
              `Message sent`,
              `From: ${params.from_worker}`,
              `To: ${params.to_worker}`,
              `Message ID: ${msg.id}`,
              `Body: ${params.body}`,
            ].join("\n"),
          }
        } else {
          await Team.broadcast({
            teamName: params.team_name,
            fromWorker: params.from_worker,
            body: params.body,
          })
          return {
            title: `Broadcast sent`,
            metadata: { teamName: params.team_name },
            output: [
              `Broadcast sent to all workers`,
              `From: ${params.from_worker}`,
              `Body: ${params.body}`,
            ].join("\n"),
          }
        }
      },
    } satisfies Tool.DefWithoutID<typeof parameters, MyMetadata>
  }),
)
