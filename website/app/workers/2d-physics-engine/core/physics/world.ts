import type { Body } from './body'
import type { Vector2D } from './vector-2d'

export class World<T extends Body = Body> {
  bodies: T[] | null = null
  readonly gravity: Vector2D | null = null

  updatePositions(_deltaTime: number): void { }
  addBody(_body: T): void { }
  removeBody(_body: T): void { }
  clear() { }
}
