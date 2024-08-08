import type { Rectangle } from '2dpe/core/shapes/rectangle'

import { Direction } from '2dpe/constants'
import { Body } from '2dpe/core/physics/body'
import { Vector2D } from '2dpe/core/physics/vector-2d'
import { clamp } from '2dpe/helpers'

export class Paddle extends Body {
  direction: Direction = Direction.Stop
  speed: number = 0
  canvasHeight: number = 450

  constructor(
    /**
     * @override
     */
    public override position: Vector2D,

    /**
     * @override
     */
    public override shape: Rectangle,

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
   * Moves the paddle in the given delta time with the current velocity, between
   * 0 and the canvas height
   * @override
   */
  override move(deltaTime: number): void {
    this.velocity = Vector2D.create(0, this.direction * this.speed)

    const displacement = this.velocity.multiplyScalar(deltaTime)
    const newY = clamp(this.position.y + displacement.y, 0, this.canvasHeight - this.shape.height)

    this.position = Vector2D.create(this.position.x, newY)
  }
}
