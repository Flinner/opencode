import { Show, For } from "solid-js"
import { useSync } from "@tui/context/sync"
import { useRoute } from "@tui/context/route"
import { Session as SessionApi } from "@/session"

interface TabBarProps {
  tabs: string[]
  activeIndex: number
  onSelect: (sessionID: string) => void
  onClose: (sessionID: string) => void
}

export function TabBar(props: TabBarProps) {
  const sync = useSync()
  const route = useRoute()

  const theme = () => (globalThis as any).__opencodeTheme ?? {}

  const getTitle = (sessionID: string) => {
    const session = sync.session.get(sessionID)
    if (!session) return "Session"
    const title = session.title
    if (SessionApi.isDefaultTitle(title)) return "New chat"
    return title.length > 24 ? title.slice(0, 21) + "..." : title
  }

  return (
    <box height={1} width="100%" flexDirection="row" overflow="hidden">
      <For each={props.tabs}>
        {(tabId, i) => {
          const isActive = () => i() === props.activeIndex
          const isCurrent = () => route.data.type === "session" && route.data.sessionID === tabId

          return (
            <box
              flexDirection="row"
              alignItems="center"
              paddingLeft={1}
              paddingRight={1}
              onMouseDown={(evt) => {
                evt.stopPropagation()
                if (evt.button === 1) {
                  props.onClose(tabId)
                } else if (evt.button === 0) {
                  props.onSelect(tabId)
                }
              }}
            >
              <Show when={isActive() || isCurrent()}>
                <text fg={theme().text || "white"}>{isActive() ? "─" : " "}</text>
              </Show>
              <Show when={!isActive() && !isCurrent()}>
                <text fg={theme().textMuted || "gray"}> </text>
              </Show>
              <text fg={isActive() ? theme().text || "white" : theme().textMuted || "gray"}>{getTitle(tabId)}</text>
              <text
                fg={theme().textMuted || "gray"}
                onMouseDown={(evt) => {
                  evt.stopPropagation()
                  evt.preventDefault()
                  props.onClose(tabId)
                }}
              >
                {" ×"}
              </text>
            </box>
          )
        }}
      </For>
    </box>
  )
}
