import type { Body } from './body'
import type { Collision } from './collision'

/**
 * - Broad Phase vs. Narrow Phase: Depending on the complexity of your collision
 * detection needs, you might want to implement a broad phase to quickly
 * identify potential collisions before performing detailed narrow phase checks.
 * - Manifold: For complex shapes, consider using a manifold to represent the
 * contact points and penetration depths between colliding bodies.
 */
export abstract class CollisionDetector<T extends Body = Body> {
  #collisions: Collision[] = []

  get collisions(): Collision[] {
    return this.#collisions
  }

  abstract detectCollisions(bodies: T[]): void
  protected abstract checkCollision(bodyA: T, bodyB: T): void

  addCollision(collision: Collision): void {
    this.#collisions.push(collision)
  }

  resetCollisions(): void {
    this.#collisions = []
  }
}
