import type { Shape } from './core/shapes/shape'

import { Direction } from './constants'
import { EventBus } from './core/events/event-bus'
import { InputHandler } from './core/input/input-handler'
import { Vector2D } from './core/physics/vector-2d'
import { Circle } from './core/shapes/circle'
import { Rectangle } from './core/shapes/rectangle'
import { sendMessage } from './helpers'
import { Ball } from './pong/bodies/ball'
import { Paddle } from './pong/bodies/paddle'
import { PongCollisionDetector } from './pong/pong.collision-detector'
import { PongCollisionResolver } from './pong/pong.collision-resolver'
import { PongGame } from './pong/pong.game'
import { PongPhysicsEngine } from './pong/pong.physics-engine'
import { PongRenderer } from './pong/pong.renderer'
import { PongWorld } from './pong/pong.world'

// #region Types
interface PongGameState {
  score: number
}

interface Events extends GenericObject {
  error: ErrorEvent
  ping: void
  setup: OffscreenCanvas
  loadState: PongGameState
  start: void
  moveUp: void
  moveDown: void
  stop: void
}
// #endregion

// #region Constants
const PADDLE_MASS = 100
const PADDLE_HEIGHT = 200
const PADDLE_WIDTH = 4
const PADDLE_PADDING = 10
/*  */
const BALL_MASS = 1
const BALL_RADIUS = 4
// #endregion

// #region Variables
let game: PongGame<PongGameState, Events> | null = null

const gameState: PongGameState = {
  score: 0,
}

/**
 * @readonly
 */
const shapes = {
  leftPaddle: new Rectangle(PADDLE_WIDTH, PADDLE_HEIGHT),
  rightPaddle: new Rectangle(PADDLE_WIDTH, PADDLE_HEIGHT),
  ball: new Circle(BALL_RADIUS),
} as const satisfies Readonly<GenericObject<Shape>>

const eventBus = EventBus<Events>()
const world = new PongWorld()
const inputHandler = new InputHandler(eventBus)
// #endregion

// #region Event handlers
eventBus.on('error', event => debug('error in worker', event))
eventBus.on('ping', () => sendMessage('pong'))
eventBus.on('loadState', state => game?.loadState(state))
eventBus.on('start', () => game?.start())
eventBus.on('setup', (offscreenCanvas) => {
  // Dispose event listener, same as once.
  eventBus.off('setup')

  const paddleStart = (offscreenCanvas.height - PADDLE_HEIGHT) / 2

  /**
   * @readonly
   */
  const positions = {
    leftPaddle: Vector2D.create(PADDLE_PADDING, paddleStart),
    rightPaddle: Vector2D.create(offscreenCanvas.width - PADDLE_PADDING - PADDLE_WIDTH, paddleStart),
    ball: Vector2D.create(100, 100),
  } as const satisfies Readonly<GenericObject<Vector2D>>

  const ball = new Ball(positions.ball, shapes.ball, BALL_MASS)
  const leftPaddle = new Paddle(positions.leftPaddle, shapes.leftPaddle, PADDLE_MASS)
  const rightPaddle = new Paddle(positions.rightPaddle, shapes.rightPaddle, PADDLE_MASS)

  // Order matters, items ordered last will be drawn on top.
  world.addBodies([leftPaddle, rightPaddle, ball])

  inputHandler.bindInput('moveUp', () => game?.movePaddle(rightPaddle, Direction.Up))
  inputHandler.bindInput('moveDown', () => game?.movePaddle(rightPaddle, Direction.Down))
  inputHandler.bindInput('stop', () => game?.movePaddle(rightPaddle, Direction.Stop))

  game = new PongGame(
    new PongRenderer(offscreenCanvas),
    inputHandler,
    new PongPhysicsEngine(
      world,
      new PongCollisionDetector(),
      new PongCollisionResolver(),
    ),
  )

  game.updateRendering(gameState)
  sendMessage('gameInit', gameState)
})
// #endregion

/**
 * {@link https://developer.mozilla.org/en-US/docs/Web/API/Worker/error_event|Worker: message event}
 * @example
 * addEventListener('message', messageEventHandler)
 */
export function messageEventHandler({ data }: MessageEvent<Events>): void {
  eventBus.emit(data.type as keyof Events, data.data)
}

/**
 * {@link https://developer.mozilla.org/en-US/docs/Web/API/Worker/message_event|Worker: error event}
 * @example
 * addEventListener('error', errorHandler)
 */
export function errorHandler(event: ErrorEvent): void {
  eventBus.emit('error', event)
}

debug('loaded')
