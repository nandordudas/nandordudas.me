import type { ScalarOrVector2D, Vector2DBasicContract } from './types'

import { Vector2DBase } from './vector-2d-base'
import { extractVector2DBasic } from './vector-2d.utils'

export class Vector2DBasic extends Vector2DBase implements Vector2DBasicContract {
  static readonly zero: Vector2DBasic = new Vector2DBasic(0, 0)

  static readonly one: Vector2DBasic = new Vector2DBasic(1, 1)

  constructor(
    public override readonly x: number,
    public override readonly y: number,
  ) {
    super(x, y)
    Object.freeze(this)
  }

  add<T extends Vector2DBasicContract>(scalarOrVector2D: ScalarOrVector2D): T {
    const other = extractVector2DBasic(scalarOrVector2D)

    return new (this.constructor as Constructor<T>)(this.x + other.x, this.y + other.y)
  }

  subtract<T extends Vector2DBasicContract>(scalarOrVector2D: ScalarOrVector2D): T {
    const other = extractVector2DBasic(scalarOrVector2D)

    return new (this.constructor as Constructor<T>)(this.x - other.x, this.y - other.y)
  }

  multiply<T extends Vector2DBasicContract>(scalarOrVector2D: ScalarOrVector2D): T {
    const other = extractVector2DBasic(scalarOrVector2D)

    return new (this.constructor as Constructor<T>)(this.x * other.x, this.y * other.y)
  }

  divide<T extends Vector2DBasicContract>(scalarOrVector2D: ScalarOrVector2D): T {
    const other = extractVector2DBasic(scalarOrVector2D)

    if (other.isOnAxis())
      throw new TypeError('Division by a collinear vector is not allowed')

    return new (this.constructor as Constructor<T>)(this.x / other.x, this.y / other.y)
  }

  isEquals<T extends Vector2DBasicContract>(other: T): boolean {
    return this.x === other.x && this.y === other.y
  }

  isZero(): boolean {
    return this.x === 0 && this.y === 0
  }

  isOnAxis(axis?: keyof Coordinates2D): boolean {
    if (!axis)
      return this.x === 0 || this.y === 0

    return this[axis] === 0
  }
}
