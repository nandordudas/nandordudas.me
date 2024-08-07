import type { Vector2D } from '../../core/physics/vector-2d'
import type { Circle } from '../../core/shapes/circle'

import { Body } from '../../core/physics/body'

export class Ball extends Body {
  constructor(
    public override position: Vector2D,
    public override readonly shape: Circle,
    public override readonly mass: number,
    public override readonly friction: number = 1.0,
  ) {
    super(position, shape, mass, friction)
  }

  reset(): void { }
}
