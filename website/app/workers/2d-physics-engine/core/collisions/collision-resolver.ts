import type { Body } from '2dpe/core/physics/body'

/**
 * @abstract
 */
export abstract class CollisionResolver<T extends Body = Body> {
  /**
   * @abstract
   */
  abstract resolve(collision: Collision): void

  postResolve(_bodyA: T, _bodyB: T) { }
}
