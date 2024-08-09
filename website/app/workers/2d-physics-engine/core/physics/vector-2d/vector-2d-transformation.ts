import type { Vector2DBasicContract, Vector2DContract, Vector2DTransformationContract } from './types'

import { Vector2DTrigonometric } from './vector-2d-trigonometric'

export class Vector2DTransformation extends Vector2DTrigonometric implements Vector2DTransformationContract {
  limit<T extends Vector2DContract>(min: Scalar, max: Scalar): T {
    const magnitude = this.magnitude()

    if (magnitude === 0)
      throw new TypeError('A vector with zero magnitude cannot be limited')

    if (magnitude < min)
      return this.multiply(min / magnitude as Scalar)

    if (magnitude > max)
      return this.multiply(max / magnitude as Scalar)

    const Ctor = this.constructor as Constructor<T>

    return new Ctor(this.x, this.y)
  }

  lerp<T extends Vector2DContract>(other: T, t: Scalar): Vector2DContract {
    const difference = other.subtract(this)

    return this.add(difference.multiply(t))
  }

  reflect<T extends Vector2DBasicContract>(normal: T): Vector2DContract {
    const dot = this.dot(normal)
    const reflection = normal.multiply(2.0 * dot as Scalar)

    return this.subtract(reflection)
  }
}
