import z from "zod"
import { Effect } from "effect"
import { Tool } from "@/tool/tool"
import { Team } from "../service"

const parameters = z.object({
  team_name: z.string().describe("The team name"),
  worker: z.string().describe("Worker name to check mailbox for"),
})

type MyMetadata = {
  teamName: string
  worker: string
  count: number
}

export const MailboxListTool = Tool.defineEffect<typeof parameters, MyMetadata, never>(
  "team_mailbox_list",
  Effect.gen(function* () {
    return {
      description: "List messages in a worker's mailbox. Use to check for pending messages and coordination signals from the leader or other workers.",
      parameters,
      async execute(params: z.infer<typeof parameters>, ctx: Tool.Context<MyMetadata>) {
        const messages = await Team.getMailbox(params.team_name, params.worker)
        const pending = messages.filter((m) => !m.delivered)

        if (pending.length === 0) {
          return {
            title: "Mailbox empty",
            metadata: { teamName: params.team_name, worker: params.worker, count: 0 },
            output: `No pending messages for ${params.worker}`,
          }
        }

        const lines = pending.map((m) =>
          [
            `---`,
            `ID: ${m.id}`,
            `From: ${m.fromWorker}`,
            `At: ${m.createdAt}`,
            m.body,
          ].join("\n"),
        )

        return {
          title: `Mailbox: ${pending.length} message(s)`,
          metadata: { teamName: params.team_name, worker: params.worker, count: pending.length },
          output: [
            `Mailbox for ${params.worker} (${pending.length} pending):`,
            ...lines,
          ].join("\n"),
        }
      },
    } satisfies Tool.DefWithoutID<typeof parameters, MyMetadata>
  }),
)
