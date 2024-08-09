import type { Vector2DAlgebraContract, Vector2DBasicContract } from './types'

import { Vector2DBasic } from './vector-2d-basic'

export class Vector2DAlgebraic extends Vector2DBasic implements Vector2DAlgebraContract {
  dot<T extends Vector2DBasicContract>(other: T): Scalar {
    return this.x * other.x + this.y * other.y as Scalar
  }

  cross<T extends Vector2DBasicContract>(other: T): Scalar {
    return this.x * other.y - this.y * other.x as Scalar
  }

  magnitudeSquared(): Scalar {
    return this.dot(this)
  }

  magnitude(): Scalar {
    return Math.hypot(this.x, this.y) as Scalar
  }

  normalize<T extends Vector2DBasicContract>(): T {
    return this.divide(this.magnitude())
  }
}
