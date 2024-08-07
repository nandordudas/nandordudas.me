import type { Body } from '2dpe/core/physics/body'

export class CollisionDetector<T extends Body = Body> {
  detectCollisions(_bodies: T[]) { }
  checkCollision(_bodyA: T, _bodyB: T) { }
  broadPhase(_bodies: T[]) { }
  narrowPhase(_bodyA: T, _bodyB: T) { }
}
