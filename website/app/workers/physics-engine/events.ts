import type { Emitter } from 'mitt'

import { createEventBus } from './event-bus'
import { sendMessage } from './utils'

export const physicsEngineEvents = createEventBus<{
  error: ErrorEvent
  stop: void
  ping: void
  setup: OffscreenCanvas
  start: void
}>()

physicsEngineEvents.on('error', event => debug('error in worker', event))
physicsEngineEvents.on('stop', () => debug('stop'))
physicsEngineEvents.on('ping', () => sendMessage({ type: 'pong' }))

export type Events = typeof physicsEngineEvents extends Emitter<infer T> ? T : never
