import type { Coordinate } from '../types'

import { random } from '../helpers'

/**
 * This class is immutable, meaning its methods always return new instances.
 */
export class Vector implements Coordinate {
  x: number
  y: number

  static zero(): Vector {
    return new Vector(0, 0)
  }

  static distance(v1: Vector, v2: Coordinate): number {
    return v1.subtract(v2).length
  }

  static dot(v1: Coordinate, v2: Coordinate): number {
    return v1.x * v2.x + v1.y * v2.y
  }

  static randomize(from: Coordinate, to: Coordinate): Vector {
    return new Vector(random(from.x, to.x), random(from.y, to.y))
  }

  /**
   * @alias Vector#magnitude
   */
  get length(): number {
    return this.magnitude()
  }

  /**
   * @alias Vector#normalize
   */
  get unit(): Vector {
    return this.normalize()
  }

  get isZero(): boolean {
    return this.x === 0 && this.y === 0
  }

  constructor(x: number, y: number)
  constructor(coords: Coordinate)
  constructor(xOrCoords: number | Coordinate, y?: number) {
    if (typeof xOrCoords === 'number') {
      this.x = xOrCoords
      this.y = y!
    }
    else {
      this.x = xOrCoords.x
      this.y = xOrCoords.y
    }
  }

  toString(): string {
    return `${this.constructor.name}(${this.x}, ${this.y})`
  }

  add(v: Coordinate): Vector {
    return new Vector(this.x + v.x, this.y + v.y)
  }

  subtract(v: Coordinate): Vector {
    return this.add({ x: -v.x, y: -v.y })
  }

  multiply(scalar: number): Vector {
    return new Vector(this.x * scalar, this.y * scalar)
  }

  divide(scalar: number): Vector {
    return this.multiply(1 / scalar)
  }

  clone(): Vector {
    return new Vector(this.x, this.y)
  }

  magnitudeSquared(): number {
    return this.x * this.x + this.y * this.y
  }

  /**
   * @alias Vector#length
   */
  magnitude(): number {
    return Math.sqrt(this.magnitudeSquared())
  }

  /**
   * @alias Vector#unit
   */
  normalize(): Vector {
    const magnitude = this.magnitude()

    if (magnitude > 0)
      return this.multiply(1 / magnitude)

    return new Vector(0, 0)
  }

  normal(): Vector {
    return new Vector(-this.y, this.x)
  }

  /**
   * @throws Will throw {@link DivideByZeroError} if `x` is zero.
   */
  slope(): number {
    if (this.x === 0)
      throw new Error('Cannot calculate slope when `x` is zero.')

    return this.y / this.x
  }

  /**
   * @modifies This vector instance.
   */
  invertX(): this {
    this.x *= -1

    return this
  }

  /**
   * @modifies This vector instance.
   */
  invertY(): this {
    this.y *= -1

    return this
  }

  /**
   * @modifies This vector instance.
   */
  invert(): this {
    return this.invertX().invertY()
  }

  toArray(): [number, number] {
    return [this.x, this.y]
  }
}
