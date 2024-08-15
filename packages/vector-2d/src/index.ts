import 'reflect-metadata'

import type { Array2D, CoordinateKey, Coordinates, Coordinates2D, NumberOrCoordinates } from './types'

import { clamp, isArray2D, isCoordinateKey, isCoordinates2D, isDefined, randomBetween, toCoordinates2D } from './utils'

/**
 * Ninety degrees in radians.
 */
const NINETY_DEGREES = Math.PI / 2

/**
 * @throws Will throw when called with the `new` keyword.
 * @deprecated
 */
export class Vector2D {
  // #region Static properties
  static readonly #instances = new WeakMap<Vector2D, Coordinates2D>()
  static readonly #constructorKey = Symbol(this.constructor.name)
  // #endregion

  // #region Static methods
  static fromArray(...coordinates: Array2D): Vector2D {
    if (!isArray2D(coordinates))
      throw new TypeError('Invalid coordinates')

    return new Vector2D(Vector2D.#constructorKey, ...coordinates)
  }

  static fromObject(coordinates: Coordinates2D): Vector2D {
    if (!isCoordinates2D(coordinates))
      throw new TypeError('Invalid coordinates')

    return new Vector2D(Vector2D.#constructorKey, coordinates.x, coordinates.y)
  }

  static fromAngle(angleInRadians: number, length = 1): Vector2D {
    const cosAngle = Math.cos(angleInRadians)
    const sinAngle = Math.sin(angleInRadians)

    return new Vector2D(
      Vector2D.#constructorKey,
      cosAngle * length,
      sinAngle * length,
    )
  }

  /**
   * @throws Will throw when input is not a number or a 2D vector coordinates.
   */
  static create(x: number, y: number): Vector2D
  static create(coordinates: Coordinates2D): Vector2D
  static create(coordinates: Array2D): Vector2D
  static create(numberOrCoordinates: NumberOrCoordinates, y?: number): Vector2D {
    numberOrCoordinates = toCoordinates2D(numberOrCoordinates)

    return new Vector2D(
      Vector2D.#constructorKey,
      numberOrCoordinates.x,
      y ?? numberOrCoordinates.y,
    )
  }

  /**
   * @throws Will throw when input is not a number or a 2D vector coordinates.
   */
  static round(v: NumberOrCoordinates): Vector2D {
    v = toCoordinates2D(v)

    return new Vector2D(
      Vector2D.#constructorKey,
      Math.round(v.x),
      Math.round(v.y),
    )
  }

  /**
   * @throws Will throw when input is not a number or a 2D vector coordinates.
   */
  static floor(v: NumberOrCoordinates): Vector2D {
    v = toCoordinates2D(v)

    return new Vector2D(
      Vector2D.#constructorKey,
      Math.floor(v.x),
      Math.floor(v.y),
    )
  }

  /**
   * @throws Will throw when input is not a number or a 2D vector coordinates.
   */
  static ceil(v: NumberOrCoordinates): Vector2D {
    v = toCoordinates2D(v)

    return new Vector2D(
      Vector2D.#constructorKey,
      Math.ceil(v.x),
      Math.ceil(v.y),
    )
  }

  /**
   * @throws Will throw when input is not a number or a 2D vector coordinates.
   */
  static add(v: NumberOrCoordinates, w: NumberOrCoordinates): Vector2D {
    v = toCoordinates2D(v)
    w = toCoordinates2D(w)

    return new Vector2D(
      Vector2D.#constructorKey,
      v.x + w.x,
      v.y + w.y,
    )
  }

  /**
   * @throws Will throw when input is not a number or a 2D vector coordinates.
   */
  static subtract(v: NumberOrCoordinates, w: NumberOrCoordinates): Vector2D {
    v = toCoordinates2D(v)
    w = toCoordinates2D(w)

    return new Vector2D(
      Vector2D.#constructorKey,
      v.x - w.x,
      v.y - w.y,
    )
  }

  /**
   * @throws Will throw when input is not a number or a 2D vector coordinates.
   */
  static multiply(v: NumberOrCoordinates, w: NumberOrCoordinates): Vector2D {
    v = toCoordinates2D(v)
    w = toCoordinates2D(w)

    return new Vector2D(
      Vector2D.#constructorKey,
      v.x * w.x,
      v.y * w.y,
    )
  }

  /**
   * @throws Will throw when collinear vectors are passed.
   * @throws Will throw when input is not a number or a 2D vector coordinates.
   */
  static divide(v: NumberOrCoordinates, w: NumberOrCoordinates): Vector2D {
    v = toCoordinates2D(v)
    w = toCoordinates2D(w)

    if (w.x === 0 || w.y === 0)
      throw new TypeError('Division by a collinear vector is not allowed')

    return new Vector2D(
      Vector2D.#constructorKey,
      v.x / w.x,
      v.y / w.y,
    )
  }

  /**
   * @throws Will throw when input is not a number or a 2D vector coordinates.
   */
  static dotProduct(v: Coordinates, w: Coordinates): number {
    v = toCoordinates2D(v)
    w = toCoordinates2D(w)

    return v.x * w.x + v.y * w.y
  }

  /**
   * @throws Will throw when input is not a number or a 2D vector coordinates.
   */
  static crossProduct(v: Coordinates, w: Coordinates): number {
    v = toCoordinates2D(v)
    w = toCoordinates2D(w)

    return v.x * w.y - v.y * w.x
  }

  /**
   * @throws Will throw when input is not a number or a 2D vector coordinates.
   */
  static linearInterpolation(v: Coordinates, w: Coordinates, t: number): Vector2D {
    v = toCoordinates2D(v)
    w = toCoordinates2D(w)

    const difference = Vector2D.subtract(w, v)

    return Vector2D.add(v, Vector2D.multiply(difference, t))
  }

  /**
   * @throws Will throw when input is not a number or a 2D vector coordinates.
   */
  static clamp(
    vector: Coordinates,
    min: NumberOrCoordinates,
    max: NumberOrCoordinates,
  ): Vector2D {
    vector = toCoordinates2D(vector)
    min = toCoordinates2D(min)
    max = toCoordinates2D(max)

    const clampedVector = new Vector2D(
      Vector2D.#constructorKey,
      clamp(vector.x, min.x, max.x),
      clamp(vector.y, min.y, max.y),
    )

    return new Vector2D(
      Vector2D.#constructorKey,
      clampedVector.x,
      clampedVector.y,
    )
  }

  /**
   * @throws Will throw when input is not a number or a 2D vector coordinates.
   */
  static magnitudeSquared(vector: Coordinates): number {
    vector = toCoordinates2D(vector)

    return vector.x * vector.x + vector.y * vector.y
  }

  /**
   * @throws Will throw when input is not a number or a 2D vector coordinates.
   */
  static magnitude(vector: Coordinates): number {
    vector = toCoordinates2D(vector)

    return Math.hypot(vector.x, vector.y)
  }

  /**
   * @throws Will throw when collinear vectors are passed.
   */
  static normalize(vector: Coordinates): Vector2D {
    const magnitude = Vector2D.magnitude(vector)

    return Vector2D.divide(vector, magnitude)
  }

  /**
   * @throws Will throw when invalid coordinate key is passed.
   * @throws Will throw when input is not a number or a 2D vector coordinates.
   */
  static invert(vector: Coordinates, coordinate?: CoordinateKey): Vector2D {
    vector = toCoordinates2D(vector)

    if (isDefined(coordinate)) {
      if (!isCoordinateKey(coordinate))
        throw new TypeError(`Invalid coordinate key: ${coordinate}`)

      if (coordinate === 'x') {
        return new Vector2D(
          Vector2D.#constructorKey,
          -vector.x,
          vector.y,
        )
      }

      return new Vector2D(
        Vector2D.#constructorKey,
        vector.x,
        -vector.y,
      )
    }

    return new Vector2D(
      Vector2D.#constructorKey,
      -vector.x,
      -vector.y,
    )
  }

  /**
   * @throws Will throw when input is not a number or a 2D vector coordinates.
   */
  static swap(vector: Coordinates): Vector2D {
    vector = toCoordinates2D(vector)

    return new Vector2D(
      Vector2D.#constructorKey,
      vector.y,
      vector.x,
    )
  }

  /**
   * @throws Will throw when invalid direction is passed.
   */
  static normal(
    vector: Coordinates,
    direction: 'clockwise' | 'counter-clockwise' = 'clockwise',
  ): Vector2D {
    vector = toCoordinates2D(vector)

    if (direction === 'clockwise') {
      return new Vector2D(
        Vector2D.#constructorKey,
        -vector.y,
        vector.x,
      )
    }

    if (direction === 'counter-clockwise') {
      return new Vector2D(
        Vector2D.#constructorKey,
        vector.y,
        -vector.x,
      )
    }

    throw new TypeError(`Invalid direction: ${direction}`)
  }

  /**
   * @throws Will throw when input is not a number or a 2D vector coordinates.
   */
  static isZero(vector: Coordinates): boolean {
    vector = toCoordinates2D(vector)

    return vector.x === 0 && vector.y === 0
  }

  /**
   * @throws Will throw when input is not a number or a 2D vector coordinates.
   */
  static isParallel(v: Coordinates, w: Coordinates, epsilon = Number.EPSILON): boolean {
    v = toCoordinates2D(v)
    w = toCoordinates2D(w)

    return Math.abs(Vector2D.crossProduct(v, w)) <= epsilon
  }

  /**
   * @throws Will throw when input is not a number or a 2D vector coordinates.
   */
  static isPerpendicular(v: Coordinates, w: Coordinates, epsilon = Number.EPSILON): boolean {
    v = toCoordinates2D(v)
    w = toCoordinates2D(w)

    return Vector2D.dotProduct(v, w) <= epsilon
  }

  /**
   * @throws Will throw when min is greater than or equal to max.
   * @throws Will throw when zero vector is passed.
   * @throws Will throw when input is not a number or a 2D vector coordinates.
   */
  static limit(vector: Coordinates, min: number, max: number): Vector2D {
    vector = toCoordinates2D(vector)

    if (Vector2D.isZero(vector))
      throw new TypeError('Cannot limit zero vector')

    const magnitude = Vector2D.magnitude(vector)
    const clampedMagnitude = clamp(magnitude, min, max)
    const coefficient = clampedMagnitude / magnitude

    return Vector2D.multiply(vector, coefficient)
  }

  /**
   * @throws Will throw when input is not a number or a 2D vector coordinates.
   */
  static randomize(min: Coordinates, max: Coordinates, asFloat = true): Vector2D {
    min = toCoordinates2D(min)
    max = toCoordinates2D(max)

    if (min.x >= max.x || min.y >= max.y)
      throw new Error('Min must be less than or equal to max')

    return new Vector2D(
      Vector2D.#constructorKey,
      randomBetween(min.x, max.x, asFloat),
      randomBetween(min.y, max.y, asFloat),
    )
  }

  /**
   * @throws Will throw when collinear vectors are passed.
   * @throws Will throw when input is not a number or a 2D vector coordinates.
   */
  static reflect(vector: Coordinates, normal: Coordinates): Vector2D {
    const normalizedNormal = Vector2D.normalize(normal)
    const coefficient = Vector2D.dotProduct(vector, normalizedNormal)
    const reflection = Vector2D.multiply(normalizedNormal, 2 * coefficient)

    return Vector2D.subtract(vector, reflection)
  }

  static project(vector: Coordinates, normal: Coordinates): Vector2D {
    const dotProduct = Vector2D.dotProduct(vector, normal)
    const normalDotNormal = Vector2D.dotProduct(normal, normal)
    const coefficient = dotProduct / normalDotNormal

    return Vector2D.multiply(normal, coefficient)
  }

  /**
   * @throws Will throw when input is not a number or a 2D vector coordinates.
   */
  static distanceSquared(v: NumberOrCoordinates, w: NumberOrCoordinates): number {
    v = toCoordinates2D(v)
    w = toCoordinates2D(w)

    return Vector2D.magnitudeSquared(Vector2D.subtract(v, w))
  }

  /**
   * @throws Will throw when coordinate key is invalid.
   * @throws Will throw when input is not a number or a 2D vector coordinates.
   */
  static distance(
    v: NumberOrCoordinates,
    w: NumberOrCoordinates,
    coordinate?: CoordinateKey,
  ): number {
    v = toCoordinates2D(v)
    w = toCoordinates2D(w)

    if (isDefined(coordinate)) {
      if (!isCoordinateKey(coordinate))
        throw new TypeError(`Invalid coordinate key: ${coordinate}`)

      return Math.abs(v[coordinate] - w[coordinate])
    }

    return Vector2D.magnitude(Vector2D.subtract(v, w))
  }

  /**
   * Returns the angle (in radians) from the X axis to a point.
   *
   * @throws Will throw when input is not a number or a 2D vector coordinates.
   */
  static angle(v: NumberOrCoordinates, axis: CoordinateKey = 'x'): number {
    v = toCoordinates2D(v)

    if (!isCoordinateKey(axis))
      throw new TypeError(`Invalid coordinate key: ${axis}`)

    if (axis === 'x')
      return Math.atan2(v.y, v.x)

    return Math.atan2(v.x, v.y) + NINETY_DEGREES
  }

  /**
   * Returns the angle (in radians) from the X axis to a point.
   *
   * @throws Will throw when input is not a number or a 2D vector coordinates.
   */
  static angleTo(
    v: NumberOrCoordinates,
    w: NumberOrCoordinates,
    coordinate?: CoordinateKey,
  ): number {
    v = toCoordinates2D(v)
    w = toCoordinates2D(w)

    const angle = Math.atan2(w.y - v.y, w.x - v.x)

    if (isDefined(coordinate)) {
      if (!isCoordinateKey(coordinate))
        throw new TypeError(`Invalid coordinate key: ${coordinate}`)

      // Adjust to the y-axis
      return coordinate === 'x' ? angle : (angle + NINETY_DEGREES)
    }

    return angle
  }

  /**
   * @throws Will throw when input is not a number or a 2D vector coordinates.
   */
  static rotate(vector: Coordinates, angleInRadians: number): Vector2D {
    vector = toCoordinates2D(vector)

    const cosAngle = Math.cos(angleInRadians)
    const sinAngle = Math.sin(angleInRadians)

    const rotatedVector = new Vector2D(
      Vector2D.#constructorKey,
      vector.x * cosAngle - vector.y * sinAngle,
      vector.x * sinAngle + vector.y * cosAngle,
    )

    return new Vector2D(Vector2D.#constructorKey, rotatedVector.x, rotatedVector.y)
  }

  /**
   * @throws Will throw when input is not a number or a 2D vector coordinates.
   */
  static midpoint(v: Coordinates, w: Coordinates): Vector2D {
    return Vector2D.add(v, Vector2D.divide(Vector2D.subtract(w, v), 2))
  }

  /**
   * @throws Will throw when input is not a number or a 2D vector coordinates.
   */
  static isEqual(v: Coordinates, w: Coordinates, epsilon = Number.EPSILON): boolean {
    v = toCoordinates2D(v)
    w = toCoordinates2D(w)

    return Math.abs(v.x - w.x) <= epsilon * Math.max(1, Math.abs(v.x), Math.abs(w.x))
      && Math.abs(v.y - w.y) <= epsilon * Math.max(1, Math.abs(v.y), Math.abs(w.y))
  }
  // #endregion

  // #region Getters and setters
  get #instance(): Coordinates2D {
    return Vector2D.#instances.get(this)!
  }

  get x(): number {
    return this.#instance.x
  }

  get y(): number {
    return this.#instance.y
  }

  set x(value: number) {
    this.#instance.x = value
  }

  set y(value: number) {
    this.#instance.y = value
  }
  // #endregion

  // #region Constructor
  private constructor(key: symbol, x: number, y: number) {
    if (key !== Vector2D.#constructorKey)
      throw new Error('Vector2D must be created using Vector2D.create()')

    Vector2D.#instances.set(this, { x, y })
  }
  // #endregion

  // #region instance methods
  clone(): Vector2D {
    return new Vector2D(Vector2D.#constructorKey, this.x, this.y)
  }

  /**
   * @throws Will throw when input is not a number or a 2D vector coordinates.
   */
  isZero(): boolean {
    return Vector2D.isZero(this)
  }

  /**
   * @throws Will throw when invalid coordinate key is passed.
   */
  isOnAxis(axis?: CoordinateKey): boolean {
    if (!isDefined(axis))
      return this.x === 0 || this.y === 0

    if (!isCoordinateKey(axis))
      throw new TypeError(`Invalid coordinate key: ${axis}`)

    return this[axis] === 0
  }

  /**
   * @throws Will throw when input is not a number or a 2D vector coordinates.
   */
  isEqualTo(other: Coordinates, epsilon = Number.EPSILON): boolean {
    return Vector2D.isEqual(this, other, epsilon)
  }

  /**
   * @throws Will throw when input is not a number or a 2D vector coordinates.
   */
  magnitudeSquared(): number {
    return Vector2D.magnitudeSquared(this)
  }

  /**
   * @throws Will throw when input is not a number or a 2D vector coordinates.
   */
  magnitude(): number {
    return Vector2D.magnitude(this)
  }

  /**
   * @throws Will throw when input is not a number or a 2D vector coordinates.
   */
  dotProduct(other: Vector2D): number {
    return Vector2D.dotProduct(this, other)
  }

  /**
   * @throws Will throw when input is not a number or a 2D vector coordinates.
   */
  crossProduct(other: Vector2D): number {
    return Vector2D.crossProduct(this, other)
  }

  /**
   * @throws Will throw when vector is zero.
   * @throws Will throw when collinear vectors are passed.
   */
  normalize(): this {
    const { x, y } = Vector2D.normalize(this)

    this.x = x
    this.y = y

    return this
  }

  /**
   * @throws Will throw when invalid coordinate key is passed.
   * @throws Will throw when input is not a number or a 2D vector coordinates.
   */
  invert(coordinate?: CoordinateKey): this {
    const { x, y } = Vector2D.invert(this, coordinate)

    this.x = x
    this.y = y

    return this
  }

  /**
   * @throws Will throw when input is not a number or a 2D vector coordinates.
   */
  swap(): this {
    const { x, y } = Vector2D.swap(this)

    this.x = x
    this.y = y

    return this
  }

  /**
   * @throws Will throw when invalid direction is passed.
   * @throws Will throw when input is not a number or a 2D vector coordinates.
   */
  normal(direction: 'clockwise' | 'counter-clockwise' = 'clockwise'): this {
    const { x, y } = Vector2D.normal(this, direction)

    this.x = x
    this.y = y

    return this
  }

  /**
   * @throws Will throw when input is not a number or a 2D vector coordinates.
   */
  round(): this {
    const { x, y } = Vector2D.round(this)

    this.x = x
    this.y = y

    return this
  }

  /**
   * @throws Will throw when input is not a number or a 2D vector coordinates.
   */
  floor(): this {
    const { x, y } = Vector2D.floor(this)

    this.x = x
    this.y = y

    return this
  }

  /**
   * @throws Will throw when input is not a number or a 2D vector coordinates.
   */
  ceil(): this {
    const { x, y } = Vector2D.ceil(this)

    this.x = x
    this.y = y

    return this
  }

  add(other: NumberOrCoordinates): this {
    const { x, y } = Vector2D.add(this, other)

    this.x = x
    this.y = y

    return this
  }

  /**
   * @throws Will throw when input is not a number or a 2D vector coordinates.
   */
  subtract(other: NumberOrCoordinates): this {
    const { x, y } = Vector2D.subtract(this, other)

    this.x = x
    this.y = y

    return this
  }

  /**
   * @throws Will throw when input is not a number or a 2D vector coordinates.
   */
  multiply(other: NumberOrCoordinates): this {
    const { x, y } = Vector2D.multiply(this, other)

    this.x = x
    this.y = y

    return this
  }

  /**
   * @throws Will throw when collinear vectors are passed.
   * @throws Will throw when input is not a number or a 2D vector coordinates.
   */
  divide(other: NumberOrCoordinates): this {
    const { x, y } = Vector2D.divide(this, other)

    this.x = x
    this.y = y

    return this
  }

  /**
   * @throws Will throw when collinear vectors are passed.
   * @throws Will throw when input is not a number or a 2D vector coordinates.
   */
  reflectInPlace(normal: Vector2D): this {
    const { x, y } = Vector2D.reflect(this, normal)

    this.x = x
    this.y = y

    return this
  }

  /**
   * @throws Will throw when input is not a number or a 2D vector coordinates.
   */
  isParallelTo(other: Vector2D, epsilon = Number.EPSILON): boolean {
    return Vector2D.isParallel(this, other, epsilon)
  }

  /**
   * @throws Will throw when input is not a number or a 2D vector coordinates.
   */
  isPerpendicularTo(other: Vector2D, epsilon = Number.EPSILON): boolean {
    return Vector2D.isPerpendicular(this, other, epsilon)
  }

  /**
   * @throws Will throw when zero vector is passed.
   * @throws Will throw when input is not a number or a 2D vector coordinates.
   */
  limit(min: number, max: number): this {
    const { x, y } = Vector2D.limit(this, min, max)

    this.x = x
    this.y = y

    return this
  }

  /**
   * @throws Will throw when input is not a number or a 2D vector coordinates.
   */
  randomize(): this {
    const { x, y } = Vector2D.randomize(this, this)

    this.x = x
    this.y = y

    return this
  }

  /**
   * @throws Will throw when input is not a number or a 2D vector coordinates.
   */
  projectOnto(normal: Vector2D): this {
    const { x, y } = Vector2D.project(this, normal)

    this.x = x
    this.y = y

    return this
  }

  /**
   * @throws Will throw when input is not a number or a 2D vector coordinates.
   */
  distanceSquared(other: NumberOrCoordinates): number {
    return Vector2D.distanceSquared(this, other)
  }

  /**
   * @throws Will throw when coordinate key is invalid.
   * @throws Will throw when input is not a number or a 2D vector coordinates.
   */
  distance(other: NumberOrCoordinates, coordinate?: CoordinateKey): number {
    return Vector2D.distance(this, other, coordinate)
  }

  /**
   * Returns the angle (in radians) from the X axis to a point.
   *
   * @throws Will throw when input is not a number or a 2D vector coordinates.
   */
  angleTo(other: NumberOrCoordinates, coordinate?: CoordinateKey): number {
    return Vector2D.angleTo(this, other, coordinate)
  }

  /**
   * Returns the angle (in radians) from the X axis to a point.
   *
   * @throws Will throw when input is not a number or a 2D vector coordinates.
   */
  angle(axis?: CoordinateKey): number {
    return Vector2D.angle(this, axis)
  }

  /**
   * @throws Will throw when input is not a number or a 2D vector coordinates.
   */
  rotate(angleInRadians: number): this {
    const { x, y } = Vector2D.rotate(this, angleInRadians)

    this.x = x
    this.y = y

    return this
  }

  /**
   * @throws Will throw when input is not a number or a 2D vector coordinates.
   */
  midpointWith(vector: Coordinates): this {
    const { x, y } = Vector2D.midpoint(this, vector)

    this.x = x
    this.y = y

    return this
  }

  toString(): string {
    return `${this.constructor.name}(${this.x}, ${this.y})`
  }

  toArray(): Readonly<Array2D> {
    return Object.freeze<Array2D>([this.x, this.y])
  }

  toObject(): Readonly<Coordinates2D> {
    return Object.freeze<Coordinates2D>({ x: this.x, y: this.y })
  }
  // #endregion
}
