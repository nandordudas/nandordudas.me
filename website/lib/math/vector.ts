import type { CoordinateContract } from './type'

import { DivideByZeroError } from './errors'
import { random } from './utils'

export class Vector implements CoordinateContract {
  public x: number
  public y: number

  public static zero(): Vector {
    return new Vector(0, 0)
  }

  public static distance(v1: Vector, v2: CoordinateContract): number {
    return v1.subtract(v2).length
  }

  public static dot(v1: CoordinateContract, v2: CoordinateContract): number {
    return v1.x * v2.x + v1.y * v2.y
  }

  /**
   * @alias Vector#magnitude
   */
  public get length(): number {
    return this.magnitude()
  }

  /**
   * @alias Vector#normalize
   */
  public get unit(): Vector {
    return this.normalize()
  }

  public get isZero(): boolean {
    return this.x === 0 && this.y === 0
  }

  constructor(x: number, y: number)
  constructor(coords: CoordinateContract)
  constructor(xOrCoords: number | CoordinateContract, y?: number) {
    if (typeof xOrCoords === 'number') {
      this.x = xOrCoords
      this.y = y!
    }
    else {
      this.x = xOrCoords.x
      this.y = xOrCoords.y
    }
  }

  public toString(): string {
    return `${this.constructor.name}(${this.x}, ${this.y})`
  }

  public add(v: CoordinateContract): Vector {
    return new Vector(this.x + v.x, this.y + v.y)
  }

  public subtract(v: CoordinateContract): Vector {
    return this.add({ x: -v.x, y: -v.y })
  }

  public multiply(scalar: number): Vector {
    return new Vector(this.x * scalar, this.y * scalar)
  }

  public divide(scalar: number): Vector {
    return this.multiply(1 / scalar)
  }

  public clone(): Vector {
    return new Vector(this.x, this.y)
  }

  public magnitudeSquared(): number {
    return this.x * this.x + this.y * this.y
  }

  /**
   * @alias Vector#length
   */
  public magnitude(): number {
    return Math.sqrt(this.magnitudeSquared())
  }

  /**
   * @alias Vector#unit
   */
  public normalize(): Vector {
    const mag = this.magnitude()

    if (mag > 0)
      return this.multiply(1 / mag)

    return new Vector(0, 0)
  }

  public normal(): Vector {
    return new Vector(-this.y, this.x)
  }

  /**
   * @throws Will throw {@link DivideByZeroError} if `x` is zero.
   */
  public slope(): number {
    if (this.x === 0)
      throw new DivideByZeroError()

    return this.y / this.x
  }

  public randomize(from: Vector, to: Vector): Vector {
    return new Vector(random(from.x, to.x), random(from.y, to.y))
  }

  /**
   * @modifies This vector instance.
   */
  public invertX(): Vector {
    this.x *= -1

    return this
  }

  /**
   * @modifies This vector instance.
   */
  public invertY(): Vector {
    this.y *= -1

    return this
  }

  /**
   * @modifies This vector instance.
   */
  public invert(): Vector {
    return this.invertX().invertY()
  }

  public toArray(): [number, number] {
    return [this.x, this.y]
  }
}
