import z from "zod"
import { Effect } from "effect"
import { Tool } from "@/tool/tool"
import { Team } from "../service"
import { SessionPrompt } from "@/session/prompt"

const parameters = z.object({
  team_name: z.string().describe("The team name"),
  force: z.boolean().default(false).describe("Force shutdown even if tasks are incomplete"),
})

type MyMetadata = {
  teamName: string
}

export const TeamShutdownTool = Tool.defineEffect<typeof parameters, MyMetadata, never>(
  "team_shutdown",
  Effect.gen(function* () {
    return {
      description: "Shutdown a team and signal all workers to stop. Workers will finish current tasks before exiting.",
      parameters,
      async execute(params: z.infer<typeof parameters>, ctx: Tool.Context<MyMetadata>) {
        const teamState = await Team.getState(params.team_name)
        if (!teamState) {
          return {
            title: "Team not found",
            metadata: { teamName: params.team_name },
            output: "Team " + params.team_name + " not found",
          }
        }

        if (!params.force) {
          const tasks = await Team.getTasks(params.team_name)
          const incomplete = tasks.filter((t) => t.status !== "completed" && t.status !== "failed")
          if (incomplete.length > 0) {
            return {
              title: "Cannot shutdown",
              metadata: { teamName: params.team_name },
              output: [
                "Team " + params.team_name + " has " + incomplete.length + " incomplete tasks.",
                "Use force=true to shutdown anyway.",
                "Incomplete: " + incomplete.map((t) => t.id).join(", "),
              ].join("\n"),
            }
          }
        }

        const workers = await Team.getWorkers(params.team_name)
        for (const worker of workers) {
          if (worker.sessionID) {
            try {
              SessionPrompt.cancel(worker.sessionID as any)
            } catch {}
          }
        }

        return {
          title: "Team shutdown: " + params.team_name,
          metadata: { teamName: params.team_name },
          output: [
            "Team " + params.team_name + " shutdown",
            "Workers signaled: " + workers.length,
            "Force: " + params.force,
          ].join("\n"),
        }
      },
    } satisfies Tool.DefWithoutID<typeof parameters, MyMetadata>
  }),
)
