import type { Body } from './body'

import { CollisionDetector } from './collision-detector'

export class CustomCollisionDetector extends CollisionDetector {
  detectCollisions(_bodies: Body[]): void {
    // throw new Error('Method not implemented.')
  }

  protected checkCollision(_bodyA: Body, _bodyB: Body): void {
    throw new Error('Method not implemented.')
  }
}
