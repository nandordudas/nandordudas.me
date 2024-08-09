import type { Vector2DBasicContract, Vector2DContract, Vector2DCoordinateWithUtilityContract } from './types'

import { isPoint2D } from '2dpe/helpers'

import { Vector2D } from '../vector-2d'

import { Vector2DBasic } from './vector-2d-basic'

export class Vector2DBase implements Vector2DCoordinateWithUtilityContract {
  static fromArray(...coordinates: Point2D): Vector2DBase {
    return new Vector2DBase(...coordinates)
  }

  static fromObject({ x, y }: Coordinates2D): Vector2DBase {
    return new Vector2DBase(x, y)
  }

  static fromAngle(angle: Radians, length = 1 as Scalar): Vector2DBase {
    const cos = Math.cos(angle)
    const sin = Math.sin(angle)

    return new Vector2DBase(cos * length, sin * length)
  }

  static create(x: number, y: number): Vector2D
  static create(coordinates: Coordinates2D): Vector2D
  static create(coordinates: Point2D): Vector2D
  static create(xOrCoordinates: number | Coordinates2D | Point2D, y?: number): Vector2D {
    if (typeof xOrCoordinates === 'number')
      return new Vector2D(xOrCoordinates, y!)

    if (isPoint2D(xOrCoordinates))
      return new Vector2D(...xOrCoordinates)

    return new Vector2D(xOrCoordinates.x, xOrCoordinates.y)
  }

  constructor(
    public readonly x: number,
    public readonly y: number,
  ) { }

  isInstanceOf<T extends Vector2DContract>(type: Constructor<T>): boolean {
    return this instanceof type
  }

  toString(): string {
    return `${this.constructor.name}(${this.x}, ${this.y})`
  }

  toArray(): Point2D {
    return [this.x, this.y]
  }

  toObject(): Coordinates2D {
    return Object.freeze<Coordinates2D>(
      Object.create(null, {
        x: { value: this.x },
        y: { value: this.y },
      }),
    )
  }

  clone(): Vector2DBasicContract {
    return new Vector2DBasic(this.x, this.y)
  }
}
