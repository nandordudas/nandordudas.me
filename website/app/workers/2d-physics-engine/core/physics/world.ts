import type { Body } from './body'

import { Vector2D } from './vector-2d'

export class World<T extends Body = Body> {
  bodies: T[] = []
  readonly gravity: Vector2D = Vector2D.zero()

  updatePositions(_deltaTime: number): void { }

  addBody(body: T): void {
    this.bodies.push(body)
  }

  addBodies(bodies: T[]): void {
    for (const body of bodies)
      this.addBody(body)
  }

  removeBody(body: T): void {
    this.bodies = this.bodies.filter(item => item !== body)
  }

  clear() {
    this.bodies = []
  }
}
