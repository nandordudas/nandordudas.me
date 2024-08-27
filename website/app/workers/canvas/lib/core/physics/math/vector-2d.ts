import type { Math } from 'canvas'

import * as base from '~/workers/canvas/utils/helpers/base'
import * as check from '~/workers/canvas/utils/helpers/is'

export class Vector2D implements Math.Vector2D {
  static readonly #constructorSymbol = Symbol('Core.Physics.Math.Vector2D')

  static get zero(): Vector2D {
    const zeroVector = Vector2D.create(0, 0)

    return zeroVector
  }

  static create(
    x: number,
    y: number,
  ): Vector2D {
    const newVector = new Vector2D(this.#constructorSymbol, x, y)

    return newVector
  }

  static random(scale?: number, rng?: () => number): Vector2D
  static random<T extends Math.Vector2D>(vector: T, rng?: () => number): Vector2D
  static random<T extends Math.Vector2D>(
    value: number | T = 1,
    rng: () => number = Math.random,
  ): Vector2D {
    const randomVector = Vector2D.create(rng(), rng())
    const scaledVector = check.isNumber(value)
      ? randomVector.multiply(value)
      : randomVector.multiply(value as Math.Vector2D)

    return scaledVector
  }

  static midpoint<T extends Math.Vector2D>(
    v: T,
    w: T,
  ): Vector2D {
    const midpointVector = Vector2D.create((v.x + w.x) / 2, (v.y + w.y) / 2)

    return midpointVector
  }

  #x: number
  #y: number
  #cachedMagnitude: number | null = null

  get x(): number {
    return this.#x
  }

  get y(): number {
    return this.#y
  }

  constructor(
    symbol: symbol,
    x: number,
    y: number,
  ) {
    if (symbol !== Vector2D.#constructorSymbol)
      base.raiseError('Vector2D is not constructable', TypeError)

    base.assertIsNumber(x, 'Component x must be a number')
    base.assertIsNumber(y, 'Component y must be a number')

    this.#x = x
    this.#y = y
  }

  clone(): Vector2D {
    const clonedVector = Vector2D.create(this.#x, this.#y)

    return clonedVector
  }

  isZero(): this is Vector2D & Math.ZeroCoordinates2D {
    const isZeroVector = this.#x === 0 && this.#y === 0

    return isZeroVector
  }

  isEqualTo<T extends Math.Vector2D>(vector: T): boolean {
    const isVectorEqual = this.#x === vector.x && this.#y === vector.y

    return isVectorEqual
  }

  add(scalar: number): this
  add<T extends Math.Vector2D>(vector: T): this
  add<T extends Math.Vector2D>(value: number | T): this {
    if (check.isNumber(value)) {
      this.#x += value
      this.#y += value
    }
    else {
      this.#x += value.x
      this.#y += value.y
    }

    this.#cachedMagnitude = null

    return this
  }

  subtract(scalar: number): this
  subtract<T extends Math.Vector2D>(vector: T): this
  subtract<T extends Math.Vector2D>(value: number | T): this {
    if (check.isNumber(value)) {
      this.#x -= value
      this.#y -= value
    }
    else {
      this.#x -= value.x
      this.#y -= value.y
    }

    this.#cachedMagnitude = null

    return this
  }

  multiply(scalar: number): this
  multiply<T extends Math.Vector2D>(vector: T): this
  multiply<T extends Math.Vector2D>(value: number | T): this {
    if (check.isNumber(value)) {
      this.#x *= value
      this.#y *= value
    }
    else {
      this.#x *= value.x
      this.#y *= value.y
    }

    this.#cachedMagnitude = null

    return this
  }

  divide(scalar: number): this
  divide<T extends Math.Vector2D>(vector: T): this
  divide<T extends Math.Vector2D>(value: number | T): this {
    if (check.isNumber(value)) {
      this.#x /= base.divideComponent(this.#x, value)
      this.#y /= base.divideComponent(this.#y, value)
    }
    else {
      this.#x /= base.divideComponent(this.#x, value.x)
      this.#y /= base.divideComponent(this.#y, value.y)
    }

    this.#cachedMagnitude = null

    return this
  }

  magnitude(): number {
    if (this.#cachedMagnitude !== null)
      return this.#cachedMagnitude

    if (this.isZero())
      return 0
    this.#cachedMagnitude = Math.hypot(this.#x, this.#y)

    return this.#cachedMagnitude
  }

  normalize(): this {
    const magnitude = this.magnitude()

    if (magnitude === 0)
      return this

    const normalizedVector = this.divide(magnitude)

    return normalizedVector
  }

  dotProduct<T extends Math.Vector2D>(vector: T): number {
    if (this.isZero() || vector.isZero())
      return 0

    const dotProductResult = this.#x * vector.x + this.#y * vector.y

    return dotProductResult
  }

  crossProduct<T extends Math.Vector2D>(vector: T): number {
    if (this.isZero() || vector.isZero())
      return 0

    const crossProductResult = this.#x * vector.y - this.#y * vector.x

    return crossProductResult
  }

  distanceTo<T extends Math.Vector2D>(vector: T): number {
    const distance = Math.hypot(this.#x - vector.x, this.#y - vector.y)

    return distance
  }

  toString(): string {
    const stringRepresentation = `Vector2D(${this.x}, ${this.y})`

    return stringRepresentation
  }

  *[Symbol.iterator](): Generator<number> {
    yield this.#x
    yield this.#y
  }
}

export function vector(x = 0, y = 0): Vector2D {
  const newVector = Vector2D.create(x, y)

  return newVector
}
