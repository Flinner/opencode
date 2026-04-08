import type { Argv } from "yargs"
import { cmd } from "./cmd"
import { bootstrap } from "../bootstrap"
import { Team } from "../../team/service"
import { Session } from "../../session"
import { UI } from "../ui"
import { TeamPhase, isTerminalPhase } from "../../team/types"

export const TeamCommand = cmd({
  command: "team",
  describe: "manage team sessions",
  builder: (yargs: Argv) =>
    yargs
      .command(TeamStartCommand)
      .command(TeamStatusCommand)
      .command(TeamShutdownCommand)
      .command(TeamListCommand)
      .demandCommand(),
  async handler() {},
})

export const TeamListCommand = cmd({
  command: "list",
  describe: "list active teams",
  builder: (yargs: Argv) => yargs.option("format", { type: "string", choices: ["table", "json"], default: "table" }),
  handler: async (args) => {
    await bootstrap(process.cwd(), async () => {
      const teams = await Team.listTeams()
      if (teams.length === 0) {
        UI.println("No active teams.")
        return
      }

      const states = await Promise.all(teams.map((name) => Team.getState(name)))
      const active = states.filter((s) => s?.active).length

      if (args.format === "json") {
        console.log(
          JSON.stringify(
            states.map((s) => ({
              teamName: s?.teamName,
              phase: s?.phase,
              active: s?.active,
              workerCount: s?.workerCount,
              createdAt: s?.createdAt,
            })),
            null,
            2,
          ),
        )
      } else {
        const header = "Team Name              Phase         Active  Workers  Created"
        UI.println(header)
        UI.println("─".repeat(header.length))
        for (const s of states) {
          if (!s) continue
          const name = s.teamName.padEnd(24)
          const phase = (s.phase as string).padEnd(14)
          const active = s.active ? "yes" : "no"
          const count = `${s.workerCount}`.padEnd(8)
          const created = new Date(s.createdAt).toLocaleDateString()
          UI.println(`${name} ${phase} ${active.padEnd(8)} ${count} ${created}`)
        }
        UI.println("")
        UI.println(`${active}/${teams.length} teams active.`)
      }
    })
  },
})

export const TeamStatusCommand = cmd({
  command: "status <teamName>",
  describe: "show detailed status of a team",
  builder: (yargs: Argv) => yargs.positional("teamName", { describe: "team name", type: "string", demandOption: true }),
  handler: async (args) => {
    await bootstrap(process.cwd(), async () => {
      const state = await Team.getState(args.teamName)
      if (!state) {
        UI.error(`Team not found: ${args.teamName}`)
        process.exit(1)
      }

      const [tasks, workers] = await Promise.all([Team.getTasks(args.teamName), Team.getWorkers(args.teamName)])

      UI.println(UI.Style.TEXT_SUCCESS_BOLD + `=== Team: ${args.teamName} ===` + UI.Style.TEXT_NORMAL)
      UI.println(`Phase:     ${state.phase}`)
      UI.println(`Active:    ${state.active}`)
      UI.println(`Fix:       ${state.currentFixAttempt}/${state.maxFixAttempts}`)
      UI.println(`Workers:   ${workers.length}× ${state.workerRole}`)
      UI.println(`Created:   ${state.createdAt}`)
      UI.println("")

      UI.println(UI.Style.TEXT_NORMAL_BOLD + "Workers:" + UI.Style.TEXT_NORMAL)
      if (workers.length === 0) {
        UI.println("  (none)")
      } else {
        for (const w of workers) {
          const task = w.currentTaskId ? ` working: ${w.currentTaskId}` : ""
          UI.println(`  ${w.name} (${w.role}): ${w.status}${task}`)
        }
      }
      UI.println("")

      UI.println(UI.Style.TEXT_NORMAL_BOLD + "Tasks:" + UI.Style.TEXT_NORMAL)
      if (tasks.length === 0) {
        UI.println("  (none)")
      } else {
        for (const t of tasks) {
          const owner = t.owner ? ` @${t.owner}` : ""
          UI.println(`  ${t.status.toUpperCase().padEnd(12)} ${t.id} ${t.subject}${owner}`)
        }
      }

      const pending = tasks.filter((t) => t.status === "pending").length
      const done = tasks.filter((t) => t.status === "completed" || t.status === "failed").length
      UI.println("")
      UI.println(`${done}/${tasks.length} tasks complete. ${pending} pending.`)
    })
  },
})

export const TeamShutdownCommand = cmd({
  command: "shutdown <teamName>",
  describe: "shutdown a team and stop all workers",
  builder: (yargs: Argv) => yargs.positional("teamName", { describe: "team name", type: "string", demandOption: true }),
  handler: async (args) => {
    await bootstrap(process.cwd(), async () => {
      const state = await Team.getState(args.teamName)
      if (!state) {
        UI.error(`Team not found: ${args.teamName}`)
        process.exit(1)
      }

      const workers = await Team.getWorkers(args.teamName)

      for (const w of workers) {
        await Team.sendMessage({
          teamName: args.teamName,
          fromWorker: "leader",
          toWorker: w.name,
          body: "SHUTDOWN: The team leader has requested shutdown.",
        })
      }

      await Team.advancePhase(args.teamName, "cancelled", "Leader shutdown command")

      UI.println(UI.Style.TEXT_SUCCESS + `Team ${args.teamName} shutdown.` + UI.Style.TEXT_NORMAL)
    })
  },
})

export const TeamStartCommand = cmd({
  command: "start <workers> <task>",
  describe: "start a new team with workers on a task",
  builder: (yargs: Argv) =>
    yargs
      .positional("workers", {
        describe: "Worker spec: N or N:role (e.g. '3' or '3:executor' or '2:executor,3:reviewer')",
        type: "string",
        demandOption: true,
      })
      .positional("task", { describe: "task description", type: "string", demandOption: true })
      .option("session", { type: "string", describe: "leader session ID (defaults to current)" }),
  handler: async (args) => {
    await bootstrap(process.cwd(), async () => {
      const specs = parseWorkerSpecs(args.workers as string)
      if (specs.length === 0) {
        UI.error("Invalid worker spec: " + args.workers)
        process.exit(1)
      }

      const totalCount = specs.reduce((sum, s) => sum + s.count, 0)
      const primaryRole = specs[0].role

      let leaderSessionID: any = (args as any).session
      if (!leaderSessionID) {
        const sessions = [...Session.list({ roots: true, limit: 1 })]
        if (sessions.length > 0) {
          leaderSessionID = sessions[0].id
        }
      }

      const manifest = await Team.create({
        taskDescription: args.task as string,
        workerCount: totalCount,
        workerRole: primaryRole,
        leaderSessionID,
      })

      UI.println(UI.Style.TEXT_SUCCESS_BOLD + `Team created: ${manifest.teamName}` + UI.Style.TEXT_NORMAL)
      UI.println(`Workers:     ${specs.map((s) => `${s.count}× ${s.role}`).join(", ")}`)
      UI.println(`Phase:      ${manifest.phase}`)
      UI.println(`Directory:  .opencode/team/${manifest.teamName}/`)
      UI.println("")
      UI.println("Next steps:")
      UI.println(
        `  1. opencode team spawn ${manifest.teamName} --count ${totalCount} --role ${primaryRole}  # start workers`,
      )
      UI.println(`  2. opencode team status ${manifest.teamName}  # check team`)
      UI.println(`  3. opencode team shutdown ${manifest.teamName}  # stop team`)
    })
  },
})

function parseWorkerSpecs(input: string): Array<{ count: number; role: string }> {
  return input
    .split(",")
    .map((seg) => seg.trim())
    .filter(Boolean)
    .map((seg) => {
      const colonIdx = seg.indexOf(":")
      if (colonIdx === -1) {
        const count = parseInt(seg, 10)
        return isNaN(count) ? null : { count, role: "executor" }
      }
      const countStr = seg.slice(0, colonIdx)
      const role = seg.slice(colonIdx + 1).trim() || "executor"
      const count = parseInt(countStr, 10)
      return isNaN(count) ? null : { count, role }
    })
    .filter((s): s is { count: number; role: string } => s !== null)
}
