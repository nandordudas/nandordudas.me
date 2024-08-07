import type { EventType } from 'mitt'

import { EventBus } from './core/events/event-bus'
import { InputHandler } from './core/input/input-handler'
import { Vector2D } from './core/physics/vector-2d'
import { Rectangle } from './core/shapes/rectangle'
import { sendMessage } from './helpers'
import { Paddle } from './pong/bodies/paddle'
import { PongCollisionDetector } from './pong/pong.collision-detector'
import { PongCollisionResolver } from './pong/pong.collision-resolver'
import { PongGame } from './pong/pong.game'
import { PongPhysicsEngine } from './pong/pong.physics-engine'
import { PongRenderer } from './pong/pong.renderer'
import { PongWorld } from './pong/pong.world'

const PADDLE_MASS = 100
const PADDLE_HEIGHT = 100
const PADDLE_WIDTH = 10
const PADDLE_PADDING = 10

interface PongGameState {
  score: number
}

interface Events extends Record<EventType, unknown> {
  error: ErrorEvent
  ping: void
  setup: OffscreenCanvas
  loadState: PongGameState
  start: void
  moveUp: void
  moveDown: void
  stop: void
}

let game: PongGame<PongGameState, Events> | null = null

const gameState: PongGameState = {
  score: 0,
}

const eventBus = EventBus<Events>()

eventBus.on('error', event => debug('error in worker', event))
eventBus.on('ping', () => sendMessage('pong'))
eventBus.on('loadState', state => debug(state))
eventBus.on('start', () => game?.start())

const world = new PongWorld()
const inputHandler = new InputHandler(eventBus)

inputHandler.bindInput('moveDown', () => debug('move down'))
inputHandler.bindInput('stop', () => debug('stop'))

const paddleShape = new Rectangle(PADDLE_WIDTH, PADDLE_HEIGHT)

eventBus.on('setup', (offscreenCanvas) => {
  eventBus.off('setup')

  const { width, height } = offscreenCanvas
  const paddleStart = (height - PADDLE_HEIGHT) / 2

  const leftPaddle = new Paddle(Vector2D.fromArray([PADDLE_PADDING, paddleStart]), paddleShape, PADDLE_MASS)
  const rightPaddle = new Paddle(Vector2D.fromArray([width - PADDLE_PADDING, paddleStart]), paddleShape, PADDLE_MASS)

  world.addBody(leftPaddle)
  world.addBody(rightPaddle)

  inputHandler.bindInput('moveUp', () => game?.movePaddle(leftPaddle))
  inputHandler.bindInput('moveDown', () => game?.movePaddle(leftPaddle))
  inputHandler.bindInput('stop', () => game?.movePaddle(leftPaddle))

  game = new PongGame(
    new PongRenderer(offscreenCanvas),
    inputHandler,
    new PongPhysicsEngine(
      world,
      new PongCollisionDetector(),
      new PongCollisionResolver(),
    ),
  )

  sendMessage('gameInit', gameState)
  debug('game', game)
})

export function messageEventHandler({ data }: MessageEvent<Events>): void {
  eventBus.emit(data.type as keyof Events, data.data)
}

export function errorHandler(event: ErrorEvent): void {
  eventBus.emit('error', event)
}

debug('loaded')
