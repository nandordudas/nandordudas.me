import type { Shape } from '2dpe/core/shapes/shape'

import { Vector2D } from './vector-2d'

/**
 * @abstract
 */
export abstract class Body {
  velocity: Vector2D = Vector2D.zero()
  acceleration: Vector2D = Vector2D.zero()

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

  applyGravity(): void { }
  onMove(): void { }
  onCollision(): void { }
}
