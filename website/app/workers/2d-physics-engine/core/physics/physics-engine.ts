import type { World } from './world'
import type { CollisionDetector } from '../collisions/collision-detector'
import type { CollisionResolver } from '../collisions/collision-resolver'

export class PhysicsEngine {
  constructor(
    public readonly world: World,
    public readonly collisionDetector: CollisionDetector | null = null,
    public readonly collisionResolver: CollisionResolver | null = null,
  ) { }

  update(_deltaTime: number): void { }
  applyForces(_deltaTime: number): void { }
  resolveCollisions(): void { }
}
