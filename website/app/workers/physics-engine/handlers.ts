import createDebug from 'debug'

import { type Events, physicsEngineEvents } from './events'

createDebug.enable('worker:*')

const debug = createDebug('worker:2d-physics-engine')

// @ts-expect-error Property 'debug' does not exist on type 'typeof globalThis'.
globalThis.debug = debug

export function errorHandler(event: ErrorEvent): void {
  physicsEngineEvents.emit('error', event)
}

interface EventPayload {
  type: keyof Events
  data: Events[keyof Events]
}

export function messageEventHandler(event: MessageEvent<EventPayload>): void {
  physicsEngineEvents.emit(event.data.type, event.data.data)
}
