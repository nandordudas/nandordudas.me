import type { Shape } from '2dpe/core/shapes/shape'

import { scalar } from '2dpe/helpers'

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

  isInstanceOf<T extends Body>(type: Constructor<T>): boolean {
    return this instanceof type
  }

  applyGravity(gravity: Vector2D): void {
    this.acceleration = this.acceleration.add(gravity)
  }

  updatePosition(deltaTime: number): void {
    const damping = 0.99

    this.position = this.position.add(this.velocity.multiply(scalar(deltaTime)))
    this.velocity = this.velocity.multiply(scalar(damping ** deltaTime))
  }

  onMove(): void { }
  onCollision(): void { }
}
