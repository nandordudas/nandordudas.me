import type { Game } from '~~/lib/physics-engine/game'

import createDebug from 'debug'
import mitt, { type Emitter, type EventType } from 'mitt'

import { createGame } from '~~/lib/physics-engine'

createDebug.enable('worker:*')

const debug = createDebug('worker:2d-physics-engine')

// @ts-expect-error Property 'debug' does not exist on type 'typeof globalThis'.
globalThis.debug = debug

let emitter = null

const eventBus = EventBus<{
  error: ErrorEvent
  stop: void
  ping: void
  setup: OffscreenCanvas
  start: void
}>()

let game: Game | null = null

eventBus.on('error', event => debug('error in worker', event))
eventBus.on('stop', () => debug('stop'))
eventBus.on('ping', () => sendMessage({ type: 'pong' }))
eventBus.on('setup', (offscreenCanvas) => {
  game = createGame({ offscreenCanvas, scale: 1 })
})
eventBus.on('start', () => game?.start())

export function errorHandler(event: ErrorEvent): void {
  eventBus.emit('error', event)
}

function EventBus<Events extends Record<EventType, unknown>>() {
  emitter ??= mitt<Events>()

  return emitter as Emitter<Events>
}

type Events = typeof eventBus extends Emitter<infer T> ? T : never

interface MessageEventPayload {
  type: keyof Events
  data: Events[keyof Events]
}

export function messageEventHandler(event: MessageEvent<MessageEventPayload>): void {
  eventBus.emit(event.data.type, event.data.data)
}

interface SendEvents {
  pong: void
}

export function sendMessage<K extends keyof SendEvents>({
  type,
  data,
  transfer = [],
}: { type: K, data?: SendEvents[K], transfer?: Transferable[] },
): void {
  const options: WindowPostMessageOptions = { transfer }

  postMessage({ type, data }, options)
}
