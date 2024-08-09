import type { Body } from './body'
import type { Vector2D } from './vector-2d'

import { REAL_WORLD_GRAVITY } from '2dpe/constants'

import { Vector2DBasic } from './vector-2d/vector-2d-basic'

export class World<T extends Body = Body> {
  bodies: T[] = []

  /**
   * @readonly
   */
  readonly gravity: Vector2DBasic = Vector2DBasic.zero

  updatePositions(_deltaTime: number): void { }

  addBody(body: T): void {
    this.bodies.push(body)

    REAL_WORLD_GRAVITY.add<Vector2D>(1 as Scalar)
  }

  /**
   * Calls `addBody` for each body
   */
  addBodies(bodies: T[]): void {
    for (const body of bodies)
      this.addBody(body)

    // World.realWorldGravity
  }

  removeBody(body: T): void {
    this.bodies = this.bodies.filter(item => item !== body)
  }

  clear() {
    this.bodies = []
  }
}
