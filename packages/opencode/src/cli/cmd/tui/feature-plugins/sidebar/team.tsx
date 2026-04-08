import type { TuiPlugin, TuiPluginApi, TuiPluginModule } from "@opencode-ai/plugin/tui"
import { createResource, createMemo, For, Show, Switch, Match, createSignal, onCleanup } from "solid-js"
import { Team } from "@/team/service"
import { isTerminalPhase } from "@/team/types"

const id = "internal:sidebar-team"

interface TeamSummary {
  name: string
  phase: string
  active: boolean
  workerCount: number
  taskCount: number
  pendingCount: number
  doneCount: number
}

function TeamPanel(props: { api: TuiPluginApi }) {
  const [open, setOpen] = createSignal(false)
  const theme = () => props.api.theme.current
  const [tick, setTick] = createSignal(0)

  const [teamDetails] = createResource(tick, async (): Promise<TeamSummary[]> => {
    const names = await Team.listTeams()
    const results = await Promise.all(
      names.map(async (name): Promise<TeamSummary | null> => {
        try {
          const state = await Team.getState(name)
          if (!state) return null
          const tasks = await Team.getTasks(name)
          return {
            name,
            phase: state.phase,
            active: state.active,
            workerCount: state.workerCount,
            taskCount: tasks.length,
            pendingCount: tasks.filter((t) => t.status === "pending").length,
            doneCount: tasks.filter((t) => t.status === "completed" || t.status === "failed").length,
          }
        } catch {
          return null
        }
      }),
    )
    return results.filter((t): t is TeamSummary => t !== null)
  })

  const phaseColor = (phase: string, th: ReturnType<typeof theme>) => {
    if (phase === "complete") return th.success
    if (phase === "cancelled") return th.textMuted
    if (isTerminalPhase(phase as any)) return th.error
    if (phase === "team-exec") return th.warning
    return th.text
  }

  const hasActive = createMemo<boolean>(() => (teamDetails() ?? []).some((t) => t.active))

  const interval = setInterval(() => setTick((t) => t + 1), 5000)
  onCleanup(() => clearInterval(interval))

  return (
    <Show when={!teamDetails.loading && (teamDetails() ?? []).length > 0}>
      <box>
        <box flexDirection="row" gap={1} onMouseDown={() => setOpen((x) => !x)}>
          <Show when={(teamDetails() ?? []).length > 1}>
            <text fg={theme().text}>{open() ? "▼" : "▶"}</text>
          </Show>
          <text fg={theme().text}>
            <b>Team</b>
            <Show when={!open()}>
              <span style={{ fg: theme().textMuted }}>
                {" "}
                ({(teamDetails() ?? []).length} team{(teamDetails() ?? []).length !== 1 ? "s" : ""}
                {hasActive() ? ", " + (teamDetails() ?? []).filter((t) => t.active).length + " active" : ""})
              </span>
            </Show>
          </text>
        </box>
        <Show when={(teamDetails() ?? []).length <= 1 || open()}>
          <For each={teamDetails() ?? []}>
            {(team) => (
              <box flexDirection="column" gap={0} paddingLeft={2}>
                <box flexDirection="row" gap={1}>
                  <text fg={phaseColor(team.phase, theme())}>•</text>
                  <text
                    fg={theme().text}
                    wrapMode="word"
                    onMouseDown={() => {
                      props.api.command.trigger("team status " + team.name)
                    }}
                  >
                    {team.name}
                  </text>
                  <text fg={theme().textMuted}>[{team.phase}]</text>
                </box>
                <box flexDirection="row" gap={1} paddingLeft={2}>
                  <text fg={theme().textMuted}>
                    {team.workerCount}w {team.taskCount}t{" "}
                    <Switch
                      fallback={
                        team.pendingCount > 0
                          ? team.pendingCount + " pend"
                          : team.doneCount + "/" + team.taskCount + " done"
                      }
                    >
                      <Match when={team.pendingCount === 0 && team.doneCount === 0}>idle</Match>
                    </Switch>
                  </text>
                </box>
              </box>
            )}
          </For>
        </Show>
      </box>
    </Show>
  )
}

const tui: TuiPlugin = async (api) => {
  api.slots.register({
    order: 150,
    slots: {
      sidebar_content(_ctx, _props) {
        return <TeamPanel api={api} />
      },
    },
  })
}

const plugin: TuiPluginModule & { id: string } = {
  id,
  tui,
}

export default plugin
