import z from "zod"
import { Effect } from "effect"
import { Tool } from "@/tool/tool"
import { Team } from "../service"

const parameters = z.object({
  team_name: z.string().describe("The team name"),
})

type MyMetadata = {
  teamName: string
  phase?: string
  taskCount?: number
  workerCount?: number
}

export const TeamStatusTool = Tool.defineEffect<typeof parameters, MyMetadata, never>(
  "team_status",
  Effect.gen(function* () {
    return {
      description: "Get the full status of a team including tasks, workers, and phase information.",
      parameters,
      async execute(params: z.infer<typeof parameters>, ctx: Tool.Context<MyMetadata>) {
        const [state, tasks, workers] = await Promise.all([
          Team.getState(params.team_name),
          Team.getTasks(params.team_name),
          Team.getWorkers(params.team_name),
        ])

        if (!state) {
          return { title: "Team not found", metadata: { teamName: params.team_name }, output: `Team ${params.team_name} not found` }
        }

        const taskLines = tasks.map((t) => {
          const owner = t.owner ? ` @${t.owner}` : ""
          const token = t.claimToken ? ` [token:${t.claimToken.slice(0, 8)}...]` : ""
          return `  ${t.id}: ${t.status}${owner}${token} — ${t.subject}`
        })

        const workerLines = workers.map((w) => {
          const task = w.currentTaskId ? ` working on ${w.currentTaskId}` : ""
          const hb = new Date(w.lastHeartbeat).toLocaleTimeString()
          return `  ${w.name} (${w.role}): ${w.status}${task} [hb:${hb}]`
        })

        return {
          title: `Team: ${params.team_name}`,
          metadata: { teamName: params.team_name, phase: state.phase, taskCount: tasks.length, workerCount: workers.length },
          output: [
            `=== Team: ${params.team_name} ===`,
            `Phase: ${state.phase} | Active: ${state.active} | Fix attempts: ${state.currentFixAttempt}/${state.maxFixAttempts}`,
            `Leader session: ${state.leaderSessionID}`,
            "",
            `--- Workers (${workers.length}) ---`,
            workerLines.join("\n") || "  (none)",
            "",
            `--- Tasks (${tasks.length}) ---`,
            taskLines.join("\n") || "  (none)",
            "",
            `Created: ${state.createdAt}`,
          ].join("\n"),
        }
      },
    } satisfies Tool.DefWithoutID<typeof parameters, MyMetadata>
  }),
)
