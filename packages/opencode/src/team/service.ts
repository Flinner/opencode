import { Effect, Layer, ServiceMap } from "effect"
import { randomUUID } from "crypto"
import { SessionID } from "@/session/schema"
import {
  TeamManifest,
  TeamTask,
  TeamPhase,
  Worker,
  MailboxMessage,
  TeamState,
  TerminalPhase,
  getPhaseInstructions as getPhaseInstructions_,
  PHASE_AGENTS,
} from "./types"
import {
  ensureTeamDir,
  writeManifest,
  readTeamState,
  listTeams as listTeamsState,
  createTask,
  claimTask as claimTask_,
  transitionTask as transitionTask_,
  releaseTaskClaim as releaseTaskClaim_,
  readTasks as readTasks_,
  registerWorker as registerWorker_,
  updateWorkerHeartbeat as updateWorkerHeartbeat_,
  updateWorkerStatus as updateWorkerStatus_,
  readWorkers as readWorkers_,
  sendMessage as sendMessage_,
  broadcastMessage as broadcastMessage_,
  readMailbox as readMailbox_,
  markMessageNotified as markMessageNotified_,
  markMessageDelivered as markMessageDelivered_,
} from "./state"
import { advancePhase as advancePhase_, getNextPhases as getNextPhases_ } from "./phase-controller"
import { InstanceState } from "@/effect/instance-state"
import { makeRuntime } from "@/effect/run-service"
import { Bus } from "@/bus"
import { Log } from "@/util/log"
import { TeamEvent } from "./events"

export namespace Team {

  const log = Log.create({ service: "team" })

  export interface Interface {
    readonly create: (input: {
      taskDescription: string
      workerCount: number
      workerRole: string
      leaderSessionID: SessionID
    }) => Effect.Effect<TeamManifest>
    readonly getState: (teamName: string) => Effect.Effect<TeamState | null>
    readonly listTeams: () => Effect.Effect<string[]>
    readonly addTask: (input: {
      teamName: string
      subject: string
      description: string
      owner?: string
    }) => Effect.Effect<TeamTask>
    readonly claimTask: (input: {
      teamName: string
      taskId: string
      worker: string
      expectedVersion: number
    }) => Effect.Effect<{ ok: boolean; task?: TeamTask; claimToken?: string; reason?: string }>
    readonly transitionTask: (input: {
      teamName: string
      taskId: string
      from: "pending" | "in_progress" | "completed" | "failed"
      to: "pending" | "in_progress" | "completed" | "failed"
      claimToken: string
      result?: string
      error?: string
    }) => Effect.Effect<{ ok: boolean; task?: TeamTask; reason?: string }>
    readonly releaseTask: (input: {
      teamName: string
      taskId: string
      worker: string
      claimToken: string
    }) => Effect.Effect<{ ok: boolean; reason?: string }>
    readonly getTasks: (teamName: string) => Effect.Effect<TeamTask[]>
    readonly registerWorker: (input: {
      teamName: string
      role: string
      sessionID?: SessionID
    }) => Effect.Effect<Worker>
    readonly updateHeartbeat: (input: {
      teamName: string
      worker: string
      pid: number
      turnCount: number
      alive: boolean
    }) => Effect.Effect<Worker | null>
    readonly updateWorkerStatus: (input: {
      teamName: string
      worker: string
      status: "idle" | "busy" | "error" | "disconnected"
      currentTaskId?: string
    }) => Effect.Effect<Worker | null>
    readonly getWorkers: (teamName: string) => Effect.Effect<Worker[]>
    readonly sendMessage: (input: {
      teamName: string
      fromWorker: string
      toWorker: string
      body: string
    }) => Effect.Effect<MailboxMessage>
    readonly broadcast: (input: {
      teamName: string
      fromWorker: string
      body: string
    }) => Effect.Effect<void>
    readonly getMailbox: (teamName: string, worker: string) => Effect.Effect<MailboxMessage[]>
    readonly markNotified: (input: {
      teamName: string
      worker: string
      messageId: string
    }) => Effect.Effect<void>
    readonly markDelivered: (input: {
      teamName: string
      worker: string
      messageId: string
    }) => Effect.Effect<void>
    readonly advancePhase: (
      teamName: string,
      to: TeamPhase | TerminalPhase,
      reason?: string,
    ) => Effect.Effect<{ ok: boolean; newState?: TeamState; error?: string }>
    readonly getNextPhases: (teamName: string) => Effect.Effect<Array<TeamPhase | TerminalPhase>>
    readonly getPhaseInstructions: (phase: TeamPhase) => string
    readonly getPhaseAgents: (phase: TeamPhase) => string[]
  }

  export class Service extends ServiceMap.Service<Service, Interface>()("@opencode/Team") {}

  export const layer = Layer.effect(
    Service,
    Effect.gen(function* () {
      const bus = yield* Bus.Service

      const createFn: Interface["create"] = Effect.fn("Team.create")(function* (input) {
        const directory = yield* InstanceState.directory
        const teamName = `team-${randomUUID().slice(0, 8)}`
        const manifest: TeamManifest = {
          schemaVersion: "1.0",
          teamName,
          leaderSessionID: input.leaderSessionID,
          taskDescription: input.taskDescription,
          phase: "team-plan",
          active: true,
          createdAt: new Date().toISOString(),
          maxFixAttempts: 3,
          currentFixAttempt: 0,
          workerCount: input.workerCount,
          workerRole: input.workerRole,
        }
        yield* Effect.promise(() => ensureTeamDir(directory, teamName))
        yield* Effect.promise(() => writeManifest(directory, manifest))
        yield* bus.publish(TeamEvent.Created, { teamName, manifest })
        log.info("team created", { teamName, workerCount: input.workerCount })
        return manifest
      })

      const getStateFn: Interface["getState"] = Effect.fn("Team.getState")(function* (teamName) {
        const directory = yield* InstanceState.directory
        return yield* Effect.promise(() => readTeamState(directory, teamName))
      })

      const listTeamsFn: Interface["listTeams"] = Effect.fn("Team.listTeams")(function* () {
        const directory = yield* InstanceState.directory
        return yield* Effect.promise(() => listTeamsState(directory))
      })

      const addTaskFn: Interface["addTask"] = Effect.fn("Team.addTask")(function* (input) {
        const directory = yield* InstanceState.directory
        const task = yield* Effect.promise(() =>
          createTask(directory, {
            teamName: input.teamName,
            subject: input.subject,
            description: input.description,
            owner: input.owner,
          }),
        )
        yield* bus.publish(TeamEvent.TaskCreated, { task })
        return task
      })

      const claimTaskFn: Interface["claimTask"] = Effect.fn("Team.claimTask")(function* (input) {
        const directory = yield* InstanceState.directory
        const result = yield* Effect.promise(() =>
          claimTask_(directory, {
            teamName: input.teamName,
            taskId: input.taskId,
            worker: input.worker,
            expectedVersion: input.expectedVersion,
          }),
        )
        if (result.ok) {
          yield* bus.publish(TeamEvent.TaskClaimed, { task: result.task, worker: input.worker })
        }
        return result
      })

      const transitionTaskFn: Interface["transitionTask"] = Effect.fn("Team.transitionTask")(function* (input) {
        const directory = yield* InstanceState.directory
        const result = yield* Effect.promise(() =>
          transitionTask_(directory, {
            teamName: input.teamName,
            taskId: input.taskId,
            from: input.from,
            to: input.to,
            claimToken: input.claimToken,
            result: input.result,
            error: input.error,
          }),
        )
        if (result.ok) {
          yield* bus.publish(TeamEvent.TaskTransitioned, { task: result.task!, from: input.from, to: input.to })
        }
        return result
      })

      const releaseTaskFn: Interface["releaseTask"] = Effect.fn("Team.releaseTask")(function* (input) {
        const directory = yield* InstanceState.directory
        return yield* Effect.promise(() =>
          releaseTaskClaim_(directory, input.teamName, input.taskId, input.worker, input.claimToken),
        )
      })

      const getTasks: Interface["getTasks"] = Effect.fn("Team.getTasks")(function* (teamName) {
        const directory = yield* InstanceState.directory
        return yield* Effect.promise(() => readTasks_(directory, teamName))
      })

      const registerWorkerFn: Interface["registerWorker"] = Effect.fn("Team.registerWorker")(function* (input) {
        const directory = yield* InstanceState.directory
        const worker = yield* Effect.promise(() =>
          registerWorker_(directory, input.teamName, input.role, input.sessionID),
        )
        yield* bus.publish(TeamEvent.WorkerRegistered, { worker })
        return worker
      })

      const updateHeartbeatFn: Interface["updateHeartbeat"] = Effect.fn("Team.updateHeartbeat")(function* (input) {
        const directory = yield* InstanceState.directory
        return yield* Effect.promise(() =>
          updateWorkerHeartbeat_(directory, input.teamName, input.worker, input.pid, input.turnCount, input.alive),
        )
      })

      const updateWorkerStatusFn: Interface["updateWorkerStatus"] = Effect.fn("Team.updateWorkerStatus")(function* (
        input,
      ) {
        const directory = yield* InstanceState.directory
        return yield* Effect.promise(() =>
          updateWorkerStatus_(directory, input.teamName, input.worker, input.status, input.currentTaskId),
        )
      })

      const getWorkers: Interface["getWorkers"] = Effect.fn("Team.getWorkers")(function* (teamName) {
        const directory = yield* InstanceState.directory
        return yield* Effect.promise(() => readWorkers_(directory, teamName))
      })

      const sendMessageFn: Interface["sendMessage"] = Effect.fn("Team.sendMessage")(function* (input) {
        const directory = yield* InstanceState.directory
        const msg = yield* Effect.promise(() =>
          sendMessage_(directory, input.teamName, input.fromWorker, input.toWorker, input.body),
        )
        yield* bus.publish(TeamEvent.MessageSent, { message: msg })
        return msg
      })

      const broadcastFn: Interface["broadcast"] = Effect.fn("Team.broadcast")(function* (input) {
        const directory = yield* InstanceState.directory
        const workers = yield* Effect.promise(() => readWorkers_(directory, input.teamName))
        yield* Effect.promise(() =>
          broadcastMessage_(
            directory,
            input.teamName,
            input.fromWorker,
            input.body,
            workers.map((w) => w.name),
          ),
        )
      })

      const getMailboxFn: Interface["getMailbox"] = Effect.fn("Team.getMailbox")(function* (teamName, worker) {
        const directory = yield* InstanceState.directory
        return yield* Effect.promise(() => readMailbox_(directory, teamName, worker))
      })

      const markNotifiedFn: Interface["markNotified"] = Effect.fn("Team.markNotified")(function* (input) {
        const directory = yield* InstanceState.directory
        yield* Effect.promise(() =>
          markMessageNotified_(directory, input.teamName, input.worker, input.messageId),
        )
      })

      const markDeliveredFn: Interface["markDelivered"] = Effect.fn("Team.markDelivered")(function* (input) {
        const directory = yield* InstanceState.directory
        yield* Effect.promise(() =>
          markMessageDelivered_(directory, input.teamName, input.worker, input.messageId),
        )
      })

      const advancePhaseFn: Interface["advancePhase"] = Effect.fn("Team.advancePhase")(function* (
        teamName,
        to,
        reason,
      ) {
        const directory = yield* InstanceState.directory
        return yield* Effect.promise(() => advancePhase_(directory, teamName, to, reason))
      })

      const getNextPhasesFn: Interface["getNextPhases"] = Effect.fn("Team.getNextPhases")(function* (teamName) {
        const directory = yield* InstanceState.directory
        return yield* Effect.promise(() => getNextPhases_(directory, teamName))
      })

      return Service.of({
        create: createFn,
        getState: getStateFn,
        listTeams: listTeamsFn,
        addTask: addTaskFn,
        claimTask: claimTaskFn,
        transitionTask: transitionTaskFn,
        releaseTask: releaseTaskFn,
        getTasks,
        registerWorker: registerWorkerFn,
        updateHeartbeat: updateHeartbeatFn,
        updateWorkerStatus: updateWorkerStatusFn,
        getWorkers,
        sendMessage: sendMessageFn,
        broadcast: broadcastFn,
        getMailbox: getMailboxFn,
        markNotified: markNotifiedFn,
        markDelivered: markDeliveredFn,
        advancePhase: advancePhaseFn,
        getNextPhases: getNextPhasesFn,
        getPhaseInstructions: (phase) => getPhaseInstructions_(phase),
        getPhaseAgents: (phase) => PHASE_AGENTS[phase] ?? [],
      })
    }),
  )

  export const defaultLayer = layer.pipe(Layer.provide(Bus.layer))

  const { runPromise } = makeRuntime(Service, defaultLayer)

  export async function create(input: {
    taskDescription: string
    workerCount: number
    workerRole: string
    leaderSessionID: SessionID
  }) {
    return runPromise((svc) => svc.create(input))
  }

  export async function getState(teamName: string) {
    return runPromise((svc) => svc.getState(teamName))
  }

  export async function listTeams() {
    return runPromise((svc) => svc.listTeams())
  }

  export async function getTasks(teamName: string) {
    return runPromise((svc) => svc.getTasks(teamName))
  }

  export async function getWorkers(teamName: string) {
    return runPromise((svc) => svc.getWorkers(teamName))
  }

  export async function sendMessage(input: {
    teamName: string
    fromWorker: string
    toWorker: string
    body: string
  }) {
    return runPromise((svc) => svc.sendMessage(input))
  }

  export async function advancePhase(
    teamName: string,
    to: TeamPhase | TerminalPhase,
    reason?: string,
  ) {
    return runPromise((svc) => svc.advancePhase(teamName, to, reason))
  }

  export async function addTask(input: {
    teamName: string
    subject: string
    description: string
    owner?: string
  }) {
    return runPromise((svc) => svc.addTask(input))
  }

  export async function claimTask(input: {
    teamName: string
    taskId: string
    worker: string
    expectedVersion: number
  }) {
    return runPromise((svc) => svc.claimTask(input))
  }

  export async function transitionTask(input: {
    teamName: string
    taskId: string
    from: "pending" | "in_progress" | "completed" | "failed"
    to: "pending" | "in_progress" | "completed" | "failed"
    claimToken: string
    result?: string
    error?: string
  }) {
    return runPromise((svc) => svc.transitionTask(input))
  }

  export async function getMailbox(teamName: string, worker: string) {
    return runPromise((svc) => svc.getMailbox(teamName, worker))
  }

  export async function broadcast(input: {
    teamName: string
    fromWorker: string
    body: string
  }) {
    return runPromise((svc) => svc.broadcast(input))
  }

  export async function getNextPhases(teamName: string) {
    return runPromise((svc) => svc.getNextPhases(teamName))
  }

  export function getPhaseInstructions(phase: TeamPhase): string {
    return getPhaseInstructions_(phase)
  }

  export function getPhaseAgents(phase: TeamPhase): string[] {
    return PHASE_AGENTS[phase] ?? []
  }

  export async function registerWorker(input: {
    teamName: string
    role: string
    sessionID?: SessionID
  }) {
    return runPromise((svc) => svc.registerWorker(input))
  }
}
