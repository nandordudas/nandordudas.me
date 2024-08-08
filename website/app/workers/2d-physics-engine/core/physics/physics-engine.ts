import type { World } from './world'
import type { CollisionDetector } from '2dpe/core/collisions/collision-detector'
import type { CollisionResolver } from '2dpe/core/collisions/collision-resolver'

export class PhysicsEngine {
  constructor(
    /**
     * @readonly
     */
    public readonly world: World,

    /**
     * @readonly
     */
    public readonly collisionDetector: CollisionDetector | null = null,

    /**
     * @readonly
     */
    public readonly collisionResolver: CollisionResolver | null = null,
  ) { }

  /**
   * Loop through all bodies and update their position, calls the `move` method
   */
  update(deltaTime: number): void {
    for (const body of this.world.bodies)
      body.move(deltaTime)
  }

  applyForces(_deltaTime: number): void { }
  resolveCollisions(): void { }
}
