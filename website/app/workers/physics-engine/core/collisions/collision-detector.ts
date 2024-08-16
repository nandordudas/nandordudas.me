import type { Body } from '2dpe/core/physics/body'

/**
 * @abstract
 */
export abstract class CollisionDetector<T extends Body = Body> {
  #collisions: Collision[] = []

  get collisions(): Collision[] {
    return this.#collisions
  }

  /**
   * @abstract
   */
  abstract detectCollisions(bodies: T[]): void

  /**
   * @abstract
   */
  abstract checkCollision(bodyA: T, bodyB: T): void

  resetCollisions(): void {
    this.#collisions = []
  }

  broadPhase(_bodies: T[]) { }
  narrowPhase(_bodyA: T, _bodyB: T) { }
}
