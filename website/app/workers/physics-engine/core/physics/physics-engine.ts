import type { World } from './world'
import type { CollisionDetector } from '2dpe/core/collisions/collision-detector'
import type { CollisionResolver } from '2dpe/core/collisions/collision-resolver'

import { scalar } from '2dpe/helpers'

export class PhysicsEngine {
  constructor(
    /**
     * @readonly
     */
    public readonly world: World,

    /**
     * @readonly
     */
    public readonly collisionDetector: CollisionDetector,

    /**
     * @readonly
     */
    public readonly collisionResolver: CollisionResolver,
  ) { }

  /**
   * Loop through all bodies and update their position, calls the `move` method
   */
  update(deltaTime: number): void {
    this.applyForces(deltaTime)

    // TODO: check resolveCollisions method below, check move method necessary
    // for (const body of this.world.bodies)
    //   body.move(deltaTime)

    this.collisionDetector.detectCollisions(this.world.bodies)
    this.resolveCollisions(deltaTime)
  }

  applyForces(deltaTime: number): void {
    for (const body of this.world.bodies)
      body.applyGravity(this.world.gravity.multiply(scalar(deltaTime)))
  }

  resolveCollisions(deltaTime: number): void {
    for (const collision of this.collisionDetector.collisions)
      this.collisionResolver.resolve(collision)

    // TODO: specify which bodies to update in children classes
    for (const body of this.world.bodies)
      body.updatePosition(deltaTime)
  }
}
