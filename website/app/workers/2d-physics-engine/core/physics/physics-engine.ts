import type { World } from './world'
import type { CollisionDetector } from '2dpe/core/collisions/collision-detector'
import type { CollisionResolver } from '2dpe/core/collisions/collision-resolver'

export class PhysicsEngine {
  constructor(
    public readonly world: World,
    public readonly collisionDetector: CollisionDetector | null = null,
    public readonly collisionResolver: CollisionResolver | null = null,
  ) { }

  update(deltaTime: number): void {
    for (const body of this.world.bodies)
      body.move(deltaTime)
  }

  applyForces(_deltaTime: number): void { }
  resolveCollisions(): void { }
}
