import type { Body } from '2dpe/core/physics/body'

export class CollisionResolver<T extends Body = Body> {
  resolveCollisions(_bodyA: T, _bodyB: T) { }
  postResolve(_bodyA: T, _bodyB: T) { }
}
