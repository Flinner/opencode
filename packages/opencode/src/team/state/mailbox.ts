import fs from "fs/promises"
import path from "path"
import { MailboxMessage, TEAM_STATE_DIR } from "../types"
import { mailboxPath } from "./io"
import { randomUUID } from "crypto"

export async function readMailbox(directory: string, teamName: string, worker: string): Promise<MailboxMessage[]> {
  const p = mailboxPath(directory, teamName, worker)
  try {
    const raw = await fs.readFile(p, "utf-8")
    return JSON.parse(raw) as MailboxMessage[]
  } catch {
    return []
  }
}

export async function writeMailbox(
  directory: string,
  teamName: string,
  worker: string,
  messages: MailboxMessage[],
): Promise<void> {
  const p = mailboxPath(directory, teamName, worker)
  await fs.mkdir(path.dirname(p), { recursive: true })
  await fs.writeFile(p, JSON.stringify(messages, null, 2))
}

export async function sendMessage(
  directory: string,
  teamName: string,
  fromWorker: string,
  toWorker: string,
  body: string,
): Promise<MailboxMessage> {
  const messages = await readMailbox(directory, teamName, toWorker)
  const msg: MailboxMessage = {
    id: randomUUID(),
    teamName,
    fromWorker,
    toWorker,
    body,
    delivered: false,
    notified: false,
    createdAt: new Date().toISOString(),
  }
  messages.push(msg)
  await writeMailbox(directory, teamName, toWorker, messages)
  return msg
}

export async function broadcastMessage(
  directory: string,
  teamName: string,
  fromWorker: string,
  body: string,
  allWorkers: string[],
): Promise<void> {
  for (const worker of allWorkers) {
    if (worker !== fromWorker) {
      await sendMessage(directory, teamName, fromWorker, worker, body)
    }
  }
}

export async function markMessageNotified(
  directory: string,
  teamName: string,
  worker: string,
  messageId: string,
): Promise<void> {
  const messages = await readMailbox(directory, teamName, worker)
  const updated = messages.map((m) => (m.id === messageId ? { ...m, notified: true } : m))
  await writeMailbox(directory, teamName, worker, updated)
}

export async function markMessageDelivered(
  directory: string,
  teamName: string,
  worker: string,
  messageId: string,
): Promise<void> {
  const messages = await readMailbox(directory, teamName, worker)
  const updated = messages.map((m) => (m.id === messageId ? { ...m, delivered: true } : m))
  await writeMailbox(directory, teamName, worker, updated)
}

export async function popUndeliveredMessages(
  directory: string,
  teamName: string,
  worker: string,
): Promise<MailboxMessage[]> {
  const messages = await readMailbox(directory, teamName, worker)
  const undelivered = messages.filter((m) => !m.delivered)
  return undelivered
}
