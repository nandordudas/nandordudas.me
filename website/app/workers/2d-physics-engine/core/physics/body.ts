import type { Shape } from '../shapes/shape'

import { Vector2D } from './vector-2d'

export class Body {
  velocity: Vector2D = Vector2D.zero()
  readonly acceleration: Vector2D = Vector2D.zero()
  readonly inverseMass: number

  constructor(
    public position: Vector2D,
    public readonly shape: Shape,
    public readonly mass: number,
    public readonly friction: number = 1.0,
  ) {
    this.inverseMass = mass === 0 ? 0 : 1 / mass
  }

  applyGravity(): void { }
  isInstanceOf = <T extends Body>(type: new (...args: any[]) => T): boolean => this instanceof type
  onMove(): void { }
  onCollision(): void { }
}
