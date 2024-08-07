import type { Rectangle } from '../../core/shapes/rectangle'

import { Body } from '../../core/physics/body'
import { Vector2D } from '../../core/physics/vector-2d'

export class Paddle extends Body {
  constructor(
    public override position: Vector2D,
    public override readonly shape: Rectangle,
    public override readonly mass: number,
    public override readonly friction: number = 1.0,
  ) {
    super(position, shape, mass, friction)
  }

  move(deltaTime: number): void {
    this.velocity = this.velocity.add(this.acceleration.multiplyScalar(deltaTime))
    this.position = this.position.add(this.velocity.multiplyScalar(deltaTime))
    this.acceleration = Vector2D.zero()
  }
}
