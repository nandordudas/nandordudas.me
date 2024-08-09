import type { Vector2D } from './vector-2d'
import type { Shape } from '2dpe/core/shapes/shape'

import { Vector2DBasic } from './vector-2d/vector-2d-basic'

/**
 * @abstract
 */
export abstract class Body {
  velocity: Vector2DBasic = Vector2DBasic.zero
  acceleration: Vector2DBasic = Vector2DBasic.zero

  /**
   * @readonly
   */
  readonly inverseMass: number

  constructor(
    public position: Vector2D,

    /**
     * @readonly
     */
    public readonly shape: Shape,

    /**
     * @readonly
     */
    public readonly mass: number,

    /**
     * @readonly
     */
    public readonly friction: number = 1.0,
  ) {
    this.inverseMass = mass === 0 ? 0 : 1 / mass
  }

  /**
   * @abstract
   */
  abstract move(deltaTime: number): void

  isInstanceOf = <T extends Body>(type: new (...args: any[]) => T): boolean => this instanceof type

  applyGravity(gravity: Vector2D): void {
    this.acceleration = this.acceleration.add(gravity)
  }

  onMove(): void { }
  onCollision(): void { }
}
