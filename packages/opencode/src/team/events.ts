import { BusEvent } from "@/bus/bus-event"
import z from "zod"
import { TeamManifest, TeamTask, Worker, MailboxMessage } from "./types"

export const TeamEvent = {
  Created: BusEvent.define("team.created", z.object({ teamName: z.string(), manifest: TeamManifest })),
  TaskCreated: BusEvent.define("team.task-created", z.object({ task: TeamTask })),
  TaskClaimed: BusEvent.define("team.task-claimed", z.object({ task: TeamTask, worker: z.string() })),
  TaskTransitioned: BusEvent.define(
    "team.task-transitioned",
    z.object({ task: TeamTask, from: z.string(), to: z.string() }),
  ),
  WorkerRegistered: BusEvent.define("team.worker-registered", z.object({ worker: Worker })),
  MessageSent: BusEvent.define("team.message-sent", z.object({ message: MailboxMessage })),
  PhaseAdvanced: BusEvent.define(
    "team.phase-advanced",
    z.object({ teamName: z.string(), from: z.string(), to: z.string(), reason: z.string().optional() }),
  ),
}
