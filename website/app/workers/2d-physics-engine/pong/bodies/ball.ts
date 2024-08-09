import type { Circle } from '2dpe/core/shapes/circle'

import { Body } from '2dpe/core/physics/body'
import { Vector2D } from '2dpe/core/physics/vector-2d'

export class Ball extends Body {
  override velocity = Vector2D.create(100, 100)

  constructor(
    public override position: Vector2D,

    /**
     * @override
     * @readonly
     */
    public override readonly shape: Circle,

    /**
     * @override
     * @readonly
     */
    public override readonly mass: number,

    /**
     * @override
     * @readonly
     */
    public override readonly friction: number = 1.0,
  ) {
    super(position, shape, mass, friction)
  }

  /**
   * Moves the ball in the given delta time with the current velocity
   * @override
   */
  override move(deltaTime: number): void {
    const displacement = this.velocity.add(this.acceleration).multiply(deltaTime as Scalar)

    this.position = this.position.add(displacement)
  }

  reset(): void { }
}
