import { EventBus } from './core/events/event-bus'
import { InputHandler } from './core/input/input-handler'
import { PongCollisionDetector } from './pong/pong.collision-detector'
import { PongCollisionResolver } from './pong/pong.collision-resolver'
import { PongGame, type PongGameState } from './pong/pong.game'
import { PongPhysicsEngine } from './pong/pong.physics-engine'
import { PongRenderer } from './pong/pong.renderer'
import { PongWorld } from './pong/pong.world'

const eventBus = new EventBus()
const inputHandler = new InputHandler(eventBus)

const game = new PongGame(
  new PongRenderer(document.createElement('canvas').transferControlToOffscreen()),
  inputHandler,
  new PongPhysicsEngine(
    new PongWorld(),
    new PongCollisionDetector(),
    new PongCollisionResolver(),
  ),
)

const gameState: PongGameState = {}

game.loadState(gameState)

eventBus.on('start', () => game.start())
eventBus.on('pause', () => game.pause())
eventBus.on('stop', () => game.stop())

inputHandler.bindInput('moveUp', 'ArrowUp')
inputHandler.bindInput('moveDown', 'ArrowDown')
inputHandler.bindInput('start', 'Space')

eventBus.emit('start')
