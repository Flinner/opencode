type Listener = (...args: any[]) => void

class GlobalTabEmitter {
  private listeners: Map<string, Set<Listener>> = new Map()

  on(event: string, listener: Listener) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set())
    }
    this.listeners.get(event)!.add(listener)
  }

  off(event: string, listener: Listener) {
    this.listeners.get(event)?.delete(listener)
  }

  emit(event: string, ...args: any[]) {
    this.listeners.get(event)?.forEach((l) => l(...args))
  }
}

export const TabEvents = new GlobalTabEmitter()
