import type { Circle } from '2dpe/core/shapes/circle'

import { Body } from '2dpe/core/physics/body'
import { Vector2D } from '2dpe/core/physics/vector-2d'

export class Ball extends Body {
  override velocity = Vector2D.create(100, 100)

  constructor(
    public override position: Vector2D,
    public override readonly shape: Circle,
    public override readonly mass: number,
    public override readonly friction: number = 1.0,
  ) {
    super(position, shape, mass, friction)
  }

  override move(deltaTime: number): void {
    const displacement = this.velocity.multiplyScalar(deltaTime)

    this.position = this.position.add(displacement)
  }

  reset(): void { }
}
