import type { Vector2DBasicContract, Vector2DContract } from './types'

import { Vector2DAlgebraic } from './vector-2d-algebraic'
import { Vector2DBasic } from './vector-2d-basic'

export class Vector2DTrigonometric extends Vector2DAlgebraic {
  angle(): Scalar {
    return Math.atan2(this.y, this.x) as Scalar
  }

  rotate(angle: Radians): Vector2DBasicContract {
    const cos = Math.cos(angle)
    const sin = Math.sin(angle)

    return new Vector2DBasic(cos * this.x - sin * this.y, sin * this.x + cos * this.y)
  }

  distanceTo<T extends Vector2DBasicContract>(other: T): Scalar {
    const difference = this.subtract<Vector2DContract>(other)

    return Math.hypot(difference.x, difference.y) as Scalar
  }
}
