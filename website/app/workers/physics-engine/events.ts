import type { Emitter } from 'mitt'
import type { Game } from '~~/lib/physics-engine/game'

import { createEventBus } from './event-bus'
import { sendMessage } from './utils'

import { createGame } from '~~/lib/physics-engine'

export const physicsEngineEvents = createEventBus<{
  error: ErrorEvent
  stop: void
  ping: void
  setup: OffscreenCanvas
  start: void
  scale: number
}>()

export type Events = typeof physicsEngineEvents extends Emitter<infer T> ? T : never

physicsEngineEvents.on('error', event => debug('error in worker', event))
physicsEngineEvents.on('stop', () => debug('stop'))
physicsEngineEvents.on('ping', () => sendMessage({ type: 'pong' }))

let scale = 1

physicsEngineEvents.on('scale', value => scale = value)

let game: Game | null = null

physicsEngineEvents.on('setup', offscreenCanvas => game = createGame({ offscreenCanvas, scale }))

physicsEngineEvents.on('start', () => {
  if (!game)
    throw new Error('Game not initialized')

  game.start()
})
