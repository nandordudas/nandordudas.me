import type { Game } from '~~/lib/physics-engine/game'

import createDebug from 'debug'

import { type Events, physicsEngineEvents } from './events'

import { createGame } from '~~/lib/physics-engine'

createDebug.enable('worker:*')

const debug = createDebug('worker:2d-physics-engine')

// @ts-expect-error Property 'debug' does not exist on type 'typeof globalThis'.
globalThis.debug = debug

let game: Game | null = null

physicsEngineEvents.on('setup', (offscreenCanvas) => {
  game = createGame({ offscreenCanvas, scale: 1 })
})

physicsEngineEvents.on('start', () => {
  if (!game)
    throw new Error('Game not initialized')

  game.start()
})

export function errorHandler(event: ErrorEvent): void {
  physicsEngineEvents.emit('error', event)
}

export function messageEventHandler(event: MessageEvent<{
  type: keyof Events
  data: Events[keyof Events]
}>): void {
  physicsEngineEvents.emit(event.data.type, event.data.data)
}
