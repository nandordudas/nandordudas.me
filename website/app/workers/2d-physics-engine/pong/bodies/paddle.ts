import type { Vector2D } from '../../core/physics/vector-2d'
import type { Rectangle } from '../../core/shapes/rectangle'

import { Body } from '../../core/physics/body'

export class Paddle extends Body {
  constructor(
    public override position: Vector2D,
    public override readonly shape: Rectangle,
    public override readonly mass: number,
    public override readonly friction: number = 1.0,
  ) {
    super(position, shape, mass, friction)
  }

  move(_deltaTime: number): void { }
}
