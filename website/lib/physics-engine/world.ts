import type { Body } from './body'

import { Vector2D } from './vector-2d'

export class World<T extends Body = Body> {
  readonly gravity: Vector2D = Vector2D.zero()

  private _bodies: T[] = []

  get bodies(): T[] {
    return this._bodies
  }

  addBody(body: T): void {
    this._bodies.push(body)
  }

  removeBody(body: T): void {
    this._bodies = this.bodies.filter(item => item !== body)
  }

  resetBodies(): void {
    this._bodies = []
  }
}
