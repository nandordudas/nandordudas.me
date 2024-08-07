import type { Body } from '../physics/body'

export class CollisionResolver<T extends Body = Body> {
  resolveCollisions(_bodyA: T, _bodyB: T) { }
  postResolve(_bodyA: T, _bodyB: T) { }
}
