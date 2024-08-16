import { CustomCollisionDetector } from './collision-detector.custom'
import { CustomCollisionResolver } from './collision-resolver.custom'
import { Game } from './game'
import { PhysicsEngine } from './physics-engine'
import { setup } from './setup'

export { OffscreenCanvasScale } from './constants'

/**
 * @example
 * import { createGame, type OffscreenCanvasScale } from 'lib/physics-engine'
 *
 * try {
 *   const game = createGame({
 *     offscreenCanvas: new OffscreenCanvas(640, 480), // Given by the WebWorker
 *     scale: OffscreenCanvasScale.Original, // Can manage device pixel ratio
 *   })
 *
 *   game.start()
 * }
 * catch (error) {
 *   console.error(error)
 * }
 */
export function createGame(params: Parameters<typeof setup>[0]): Game {
  const { renderer, world } = setup(params)

  const collisionDetector = new CustomCollisionDetector()
  const collisionResolver = new CustomCollisionResolver()

  const physicsEngine = new PhysicsEngine({
    world,
    collisionDetector,
    collisionResolver,
  })

  const game = new Game({
    physicsEngine,
    renderer,
  })

  return game
}
