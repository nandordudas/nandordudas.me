import type { Coordinates2D, RotationDirection } from './types'

import { clamp, isNumber, randomBetween } from './utils'

/**
 * A 2D vector class representing a vector in 2D space.
 *
 * @class
 * @public
 * @example
 * const vector = Vector2D.create(1, 2)
 * vector.add({ x: 2, y: 4 }) // Vector2D { x: 3, y: 6 }
 * vector.subtract({ x: 2, y: 4 }) // Vector2D { x: 1, y: 2 }
 * vector.multiply({ x: 2, y: 4 }).divide({ x: 2, y: 2 }) // Vector2D { x: 1, y: 4 }
 * Vector2D.isZero(vector) // false
 */
export class Vector2D {
  /**
   * @private
   * @static
   * @readonly
   * @property The value of PI.
   * @default Math.PI
   */
  static readonly TAU = Math.PI * 2

  /**
   * @private
   * @static
   * @readonly
   * @property The pool of vector instances.
   * @default []
   */
  static readonly #pool: Vector2D[] = []

  /**
   * @private
   * @static
   * @readonly
   * @property The maximum pool size.
   * @default 100
   */
  static readonly #POOL_LIMIT = 100

  /**
   * @private
   * @static
   * @readonly
   * @property The pool of vector instances.
   * @default new Map<Vector2D, Coordinates2D>()
   */
  static readonly #instances = new WeakMap<Vector2D, Coordinates2D>()

  /**
   * @private
   * @static
   * @readonly
   * @property The constructor key for the class.
   * @default Symbol(this.constructor.name)
   */
  static readonly #constructorKey = Symbol(this.constructor.name)

  /**
   * A static, Vector2D object representing the zero vector (0, 0).
   *
   * @public
   * @static
   * @returns {Vector2D} The zero vector.
   * @example
   * Vector2D.zero() // Vector2D { x: 0, y: 0 }
   */
  static zero(): Vector2D {
    return Vector2D.create(0, 0)
  }

  /**
   * A static, Vector2D object representing the unit vector (1, 1).
   *
   * @public
   * @static
   * @returns {Vector2D} The unit vector.
   * @example
   * Vector2D.unit() // Vector2D { x: 1, y: 1 }
   */
  static unit(): Vector2D {
    return Vector2D.create(1, 1)
  }

  /**
   * Creates a new `Vector2D` instance from the given coordinates.
   *
   * @public
   * @static
   * @param {number} x The x-coordinate of the vector.
   * @param {number} y The y-coordinate of the vector.
   * @returns {Vector2D} The newly created `Vector2D` instance.
   * @throws {TypeError} Will throw when the coordinates are invalid.
   * @example
   * Vector2D.create(1, 2) // Vector2D { x: 1, y: 2 }
   * Vector2D.create(3, 4) // Vector2D { x: 3, y: 4 }
   */
  static create(x: number, y: number): Vector2D {
    if (!isNumber(x) || !isNumber(y))
      throw new TypeError(`Invalid coordinates: ${x}, ${y}`)

    if (this.#pool.length > 0) {
      const instance = this.#pool.pop()!

      instance.x = x
      instance.y = y

      return instance
    }

    return new Vector2D(this.#constructorKey, x, y)
  }

  /**
   * Calculates the dot product of two vectors.
   *
   * @public
   * @static
   * @param {Coordinates2D} v The first vector.
   * @param {Coordinates2D} w The second vector.
   * @returns The dot product of two vectors.
   * @example
   * Vector2D.dotProduct({ x: 1, y: 2 }, { x: 3, y: 4 }) // 11
   * Vector2D.dotProduct({ x: 1, y: 2 }, { x: 2, y: 1 }) // 4
   */
  static dotProduct(v: Coordinates2D, w: Coordinates2D): number {
    return v.x * w.x + v.y * w.y
  }

  /**
   * Calculates the cross product of two vectors.
   *
   * @public
   * @static
   * @param {Coordinates2D} v The first vector.
   * @param {Coordinates2D} w The second vector.
   * @returns {number} The cross product of two vectors.
   * @example
   * Vector2D.crossProduct({ x: 1, y: 2 }, { x: 3, y: 4 }) // -2
   * Vector2D.crossProduct({ x: 1, y: 2 }, { x: 2, y: 1 }) // 0
   */
  static crossProduct(v: Coordinates2D, w: Coordinates2D): number {
    return v.x * w.y - v.y * w.x
  }

  /**
   * Clamps the vector's `x` and `y` components to the specified range.
   *
   * @public
   * @static
   * @param {Coordinates2D} v The vector to clamp.
   * @param {number} min The minimum value for the clamped components.
   * @param {number} max The maximum value for the clamped components.
   * @returns {Vector2D} The vector with its components clamped to the specified range.
   * @throws {Error} Will throw when `min` is greater than or equal to `max`.
   * @example
   * Vector2D.clamp({ x: 1, y: 2 }, 0, 10) // { x: 1, y: 2 }
   * Vector2D.clamp({ x: 1, y: 2 }, 0, 1) // { x: 1, y: 1 }
   * Vector2D.clamp({ x: 1, y: 2 }, 0, 0) // throws Error
   */
  static clamp(v: Coordinates2D, min: number, max: number): Vector2D {
    const x = clamp(v.x, min, max)
    const y = clamp(v.y, min, max)

    return Vector2D.create(x, y)
  }

  /**
   * Calculates the midpoint between two vectors.
   *
   * @public
   * @static
   * @param {Coordinates2D} v The first vector.
   * @param {Coordinates2D} w The second vector.
   * @returns {Coordinates2D} The midpoint between two vectors.
   * @example
   * Vector2D.midpoint({ x: 1, y: 2 }, { x: 3, y: 4 }) // { x: 2, y: 3 }
   * Vector2D.midpoint({ x: 1, y: 1 }, { x: 2, y: 2 }) // { x: 1.5, y: 1.5 }
   */
  static midpoint(v: Coordinates2D, w: Coordinates2D): Coordinates2D {
    const x = (v.x + w.x) / 2
    const y = (v.y + w.y) / 2

    return { x, y }
  }

  /**
   * It checks if the vector is zero.
   *
   * @public
   * @returns {boolean} Whether the vector's `x` and `y` components are zero.
   * @example
   * const vector = Vector2D.create(0, 0)
   * vector.isZero() // true
   * Vector2D.zero().isZero() // true
   * Vector2D.unit().isZero() // false
   */
  static isZero(coordinates: Vector2D): boolean {
    return coordinates.x === 0 && coordinates.y === 0
  }

  /**
   * @private
   * @readonly
   * @property The instance of the coordinates.
   */
  get #instance(): Coordinates2D {
    return Vector2D.#instances.get(this)!
  }

  /**
   * The `x` segment of the coordinates.
   *
   * @public
   * @readonly
   * @property The `x` segment of the coordinates.
   * @example
   * const vector = Vector2D.create(1, 2)
   * vector.x // 1
   */
  get x(): number {
    return this.#instance.x
  }

  /**
   * The `y` segment of the coordinates.
   *
   * @public
   * @readonly
   * @property The `y` segment of the coordinates.
   * @example
   * const vector = Vector2D.create(1, 2)
   * vector.y // 2
   */
  get y(): number {
    return this.#instance.y
  }

  /**
   * Sets the `x` segment of the coordinates.
   *
   * @param {number} value The value to set the `x` segment to.
   * @example
   * const vector = Vector2D.create(1, 2)
   * vector.x = 3
   * vector.x // 3
   */
  set x(value: number) {
    this.#instance.x = value
  }

  /**
   * Sets the `y` segment of the coordinates.
   *
   * @param {number} value The value to set the `y` segment to.
   * @example
   * const vector = Vector2D.create(1, 2)
   * vector.y = 3
   * vector.y // 3
   */
  set y(value: number) {
    this.#instance.y = value
  }

  /**
   * Validates the axis for the operation.
   *
   * @private
   * @param {keyof Coordinates2D} axis The axis to validate.
   * @returns {void}
   * @throws {RangeError} Will throw when the axis is invalid.
   * @example
   * this.#validateAxis('x')
   * this.#validateAxis('y')
   * this.#validateAxis('z') // throws RangeError
   */
  #validateAxis(axis: keyof Coordinates2D): void {
    if (axis !== 'x' && axis !== 'y')
      throw new RangeError('Invalid axis for operation.')
  }

  /**
   * Validates the coordinate for the operation.
   *
   * @private
   * @param {keyof Coordinates2D} coordinate The coordinate to validate.
   * @returns {void}
   * @throws {RangeError} Will throw when the coordinate is invalid.
   * @example
   * this.#validateCoordinate('x')
   * this.#validateCoordinate('y')
   * this.#validateCoordinate('z') // throws RangeError
   */
  #validateCoordinate(coordinate: keyof Coordinates2D): void {
    if (coordinate !== 'x' && coordinate !== 'y')
      throw new RangeError('Invalid coordinates for operation.')
  }

  /**
   * Validates the direction for the operation.
   *
   * @private
   * @param {RotationDirection} direction The direction to validate.
   * @returns {void}
   * @throws {RangeError} Will throw when the direction is invalid.
   * @example
   * this.#validateDirection('clockwise')
   * this.#validateDirection('counterclockwise')
   * this.#validateDirection('diagonal') // throws RangeError
   */
  #validateDirection(direction: RotationDirection): void {
    if (direction !== 'clockwise' && direction !== 'counterclockwise')
      throw new RangeError('Invalid direction for operation.')
  }

  /**
   * The private constructor of the `Vector2D` class. It is only accessible within the class declaration.
   * Use the static `create` method to create a new instance.
   *
   * @private
   * @constructor
   * @param {symbol} key The private constructor key.
   * @param {number} x The x-coordinate of the vector.
   * @param {number} y The y-coordinate of the vector.
   * @throws {TypeError} Will throw when the coordinates are invalid.
   * @example
   * // The constructor is private and cannot be accessed from outside the class.
   * const vector = new Vector2D(Vector2D.#constructorKey, 1, 2)
   * // Use the static `create` method to create a new instance.
   * const vector = Vector2D.create(1, 2)
   */
  private constructor(
    readonly key: symbol,
    x: number,
    y: number,
  ) {
    if (key !== Vector2D.#constructorKey) {
      throw new TypeError(`Constructor of class 'Vector2D' is private and only accessible within the`
        + ` class declaration. Use 'Vector2D.create()' to create a new instance.`)
    }

    if (!isNumber(x) || !isNumber(y))
      throw new TypeError(`Invalid coordinates: ${x}, ${y}`)

    Vector2D.#instances.set(this, { x, y })
  }

  /**
   * Converts the vector to a string.
   *
   * @public
   * @returns {string} The string representation of the vector.
   * @example
   * const vector = Vector2D.create(1, 2)
   * vector.toString() // 'Vector2D { x: 1, y: 2 }'
   */
  toString(): string {
    return `Vector2D { x: ${this.x}, y: ${this.y} }`
  }

  /**
   * Converts the vector to a JSON object.
   *
   * @public
   * @returns {Coordinates2D} The JSON representation of the vector.
   * @example
   * const vector = Vector2D.create(1, 2)
   * vector.toJSON() // { x: 1, y: 2 }
   */
  toJSON(): Coordinates2D {
    return this.#instance
  }

  /**
   * Adds the current vector by the given vector component-wise.
   *
   * @public
   * @param {Coordinates2D} other The vector to add to the current vector.
   * @returns {Vector2D} The new vector after addition.
   * @example
   * const vector = Vector2D.create(1, 2)
   * vector.add({ x: 2, y: 4 }) // Vector2D { x: 3, y: 6 }
   * vector.add({ x: 2, y: 0 }) // Vector2D { x: 5, y: 6 }
   */
  add(other: Coordinates2D): Vector2D {
    return Vector2D.create(this.x + other.x, this.y + other.y)
  }

  /**
   * Adds a scalar to the current vector.
   *
   * @public
   * @param {number} scalar The scalar to add to the current vector.
   * @returns {Vector2D} The new vector after addition.
   * @example
   * const vector = Vector2D.create(1, 2)
   * vector.addScalar(2) // Vector2D { x: 3, y: 4 }
   * vector.addScalar(-1) // Vector2D { x: 0, y: 1 }
   */
  addScalar(scalar: number): Vector2D {
    return Vector2D.create(this.x + scalar, this.y + scalar)
  }

  /**
   * Subtracts the current vector by the given vector component-wise.
   *
   * @public
   * @param {Coordinates2D} other The vector to subtract from the current vector.
   * @returns {Vector2D} The new vector after subtraction.
   * @example
   * const vector = Vector2D.create(1, 2)
   * vector.subtract({ x: 2, y: 4 }) // Vector2D { x: -1, y: -2 }
   * vector.subtract({ x: 2, y: 0 }) // Vector2D { x: -1, y: 2 }
   */
  subtract(other: Coordinates2D): Vector2D {
    return Vector2D.create(this.x - other.x, this.y - other.y)
  }

  /**
   * Subtracts a scalar from the current vector.
   *
   * @public
   * @param {number} scalar The scalar to subtract from the current vector.
   * @returns {Vector2D} The new vector after subtraction.
   * @example
   * const vector = Vector2D.create(1, 2)
   * vector.subtractScalar(2) // Vector2D { x: -1, y: 0 }
   * vector.subtractScalar(-1) // Vector2D { x: 2, y: 3 }
   */
  subtractScalar(scalar: number): Vector2D {
    return Vector2D.create(this.x - scalar, this.y - scalar)
  }

  /**
   * Multiplies the current vector by the given vector component-wise.
   *
   * @public
   * @param {Coordinates2D} other The vector to multiply with the current vector.
   * @returns {this} The modified vector after multiplication.
   * @example
   * const vector = Vector2D.create(1, 2)
   * vector.multiply({ x: 2, y: 4 }) // Vector2D { x: 2, y: 8 }
   * vector.multiply({ x: 2, y: 0 }) // Vector2D { x: 2, y: 0 }
   */
  multiply(other: Coordinates2D): Vector2D {
    return Vector2D.create(this.x * other.x, this.y * other.y)
  }

  /**
   * Multiplies the current vector by a scalar.
   *
   * @public
   * @param {number} scalar The scalar to multiply with the current vector.
   * @returns {Vector2D} The new vector after multiplication.
   * @example
   * const vector = Vector2D.create(1, 2)
   * vector.multiplyScalar(2) // Vector2D { x: 2, y: 4 }
   * vector.multiplyScalar(0) // Vector2D { x: 0, y: 0 }
   */
  multiplyScalar(scalar: number): Vector2D {
    return Vector2D.create(this.x * scalar, this.y * scalar)
  }

  /**
   * Divides the current vector by the given vector component-wise.
   *
   * - If `other.x` is non-zero, `this.x` is set to `this.x / other.x`.
   * - If `other.x` is zero, `this.x` is set to `0`.
   * - If `other.y` is non-zero, `this.y` is set to `this.y / other.y`.
   * - If `other.y` is zero, `this.y` is set to `0`.
   *
   * @public
   * @param {Vector2D} other The vector to divide with the current vector.
   * @returns {Vector2D} The new vector after division.
   * @throws {RangeError} Will throw when `other.x` or `other.y` is zero.
   * @example
   * const vector = Vector2D.create(1, 2)
   * vector.divide({ x: 2, y: 4 }) // Vector2D { x: 0.5, y: 0.5 }
   * vector.divide({ x: 2, y: 0 }) // throws RangeError
   * vector.divide({ x: 0, y: 4 }) // throws RangeError
   * vector.divide({ x: 0, y: 0 }) // throws RangeError
   */
  divide(other: Vector2D): Vector2D {
    if (other.isOnAxes())
      throw new RangeError('Cannot divide by zero.')

    const newX = other.x === 0 ? 0 : this.x / other.x
    const newY = other.y === 0 ? 0 : this.y / other.y

    return Vector2D.create(newX, newY)
  }

  /**
   * Divides the current vector by a scalar.
   *
   * - If `scalar` is non-zero, `this.x` is set to `this.x / scalar`.
   * - If `scalar` is zero, `this.x` is set to `0`.
   * - If `scalar` is non-zero, `this.y` is set to `this.y / scalar`.
   * - If `scalar` is zero, `this.y` is set to `0`.
   *
   * @public
   * @param {number} scalar The scalar to divide with the current vector.
   * @returns {Vector2D} The new vector after division.
   * @throws {RangeError} Will throw when `scalar` is zero.
   * @example
   * const vector = Vector2D.create(1, 2)
   * vector.divideScalar(2) // Vector2D { x: 0.5, y: 1 }
   * vector.divideScalar(0) // throws RangeError
   */
  divideScalar(scalar: number): Vector2D {
    if (scalar === 0)
      throw new RangeError('Cannot divide by zero.')

    const newX = scalar === 0 ? 0 : this.x / scalar
    const newY = scalar === 0 ? 0 : this.y / scalar

    return Vector2D.create(newX, newY)
  }

  /**
   * Checks if the vector is on the specified axis or both axes.
   *
   * If `axis` is not provided, checks if both `x` and `y` components are zero. Otherwise, checks if the specified axis
   * component is zero.
   *
   * @public
   * @param {keyof Coordinates2D} axis The axis to check ('x' or 'y'). If omitted, checks both axes.
   * @returns {boolean} True if the vector is on the specified axis or both axes, false otherwise.
   * @throws {RangeError} If the provided axis is invalid.
   * @example
   * const vector = Vector2D.create(1, 2)
   * vector.isOnAxes() // false
   * vector.isOnAxes('x') // false
   * vector.isOnAxes('y') // false
   * Vector2D.zero().isOnAxes() // true
   */
  isOnAxes(axis?: keyof Coordinates2D): boolean {
    if (axis === undefined)
      return this.x === 0 || this.y === 0

    this.#validateAxis(axis)

    return this[axis] === 0
  }

  /**
   * It checks if the vector is zero.
   *
   * @public
   * @returns {boolean} Whether the vector's `x` and `y` components are zero.
   * @example
   * const vector = Vector2D.create(0, 0)
   * vector.isZero() // true
   * Vector2D.zero().isZero() // true
   * Vector2D.unit().isZero() // false
   */
  isZero(): boolean {
    return this.x === 0 && this.y === 0
  }

  /**
   * It checks if the vector is parallel to another vector.
   *
   * @public
   * @param {Coordinates2D} other The other vector.
   * @param threshold The threshold for the dot product. Defaults to `Number.EPSILON`.
   * @returns {boolean} Whether the vector is parallel to the other vector.
   * @example
   * const vector = Vector2D.create(1, 2)
   * vector.isParallelTo({ x: 2, y: 4 }) // true
   * vector.isParallelTo({ x: 2, y: -1 }) // false
   */
  isParallelTo(other: Coordinates2D, threshold = Number.EPSILON): boolean {
    const cross = Vector2D.crossProduct(this, other)

    return Math.abs(cross) <= threshold
  }

  /**
   * It checks if the vector is perpendicular to another vector.
   *
   * @public
   * @param {Coordinates2D} other The other vector.
   * @param threshold The threshold for the dot product. Defaults to `Number.EPSILON`.
   * @returns {boolean} Whether the vector is perpendicular to the other vector.
   * @example
   * const vector = Vector2D.create(1, 2)
   * vector.isPerpendicularTo({ x: 2, y: -1 }) // true
   * vector.isPerpendicularTo({ x: 2, y: 1 }) // false
   */
  isPerpendicularTo(other: Coordinates2D, threshold = Number.EPSILON): boolean {
    const otherVector = Vector2D.create(other.x, other.y)

    if (this.isZero() || otherVector.isZero())
      return false

    const dotProduct = Vector2D.dotProduct(this, other)

    return Math.abs(dotProduct) <= threshold
  }

  /**
   * It checks if the vector is equal to another vector.
   *
   * @public
   * @param {Coordinates2D} other The other vector or vectors coordinates to compare.
   * @param threshold The threshold for the difference. Defaults to `Number.EPSILON`.
   * @returns {boolean} Whether the vector is equal to the other vector.
   * @example
   * const vector = Vector2D.create(1, 2)
   * vector.isEqualTo({ x: 1, y: 2 }) // true
   * vector.isEqualTo({ x: 1, y: 2.0001 }) // false
   * vector.isEqualTo({ x: 1, y: 2.0001 }, 0.001) // true
   * vector.isEqualTo({ x: 1, y: 2.0001 }, 0.0001) // false
   */
  isEqualTo(other: Coordinates2D, threshold = Number.EPSILON): boolean {
    return Math.abs(this.x - other.x) <= threshold
      && Math.abs(this.y - other.y) <= threshold
  }

  /**
   * It linearly interpolates between two vectors.
   *
   * @public
   * @param {Coordinates2D} other The other vector.
   * @param {number} t A value between 0 and 1 representing the interpolation factor.
   * @returns {this} The modified vector after linear interpolation.
   * @throws {RangeError} Will throw when t is not between 0 and 1.
   * @example
   * const vector = Vector2D.create(1, 2)
   * vector.lerpTo({ x: 3, y: 4 }, 0.5) // Vector2D { x: 2, y: 3 }
   * vector.lerpTo({ x: 3, y: 4 }, 0.25) // Vector2D { x: 1.5, y: 2.5 }
   * vector.lerpTo({ x: 3, y: 4 }, 1) // Vector2D { x: 3, y: 4 }
   * vector.lerpTo({ x: 3, y: 4 }, -1) // throws RangeError
   */
  lerpTo(other: Coordinates2D, t: number): Vector2D {
    if (t < 0 || t > 1)
      throw new RangeError('t must be between 0 and 1')

    const newX = this.x * (1 - t) + other.x * t
    const newY = this.y * (1 - t) + other.y * t

    return Vector2D.create(newX, newY)
  }

  /**
   * Calculates the squared magnitude of the vector. Result is cached for subsequent calls.
   *
   * @public
   * @returns {number} The squared magnitude of the vector.
   * @example
   * const vector = Vector2D.create(3, 4)
   * vector.magnitudeSquared() // 25
   */
  magnitudeSquared(): number {
    return this.x * this.x + this.y * this.y
  }

  /**
   * Calculates the magnitude of the vector. Result is cached for subsequent calls.
   *
   * @public
   * @returns {number} The magnitude of the vector.
   * @example
   * const vector = Vector2D.create(3, 4)
   * vector.magnitude() // 5
   */
  magnitude(): number {
    return Math.hypot(this.x, this.y)
  }

  /**
   * Normalizes the vector.
   *
   * @public
   * @returns {Vector2D} New vector after normalization.
   * @example
   * const vector = Vector2D.create(1, 2)
   * vector.normalize() // Vector2D { x: 0.4472135954999579, y: 0.8944271909999159 }
   * Vector2D.zero().normalize() // Vector2D { x: 0, y: 0 }
   */
  normalize(): Vector2D {
    if (this.isZero())
      return Vector2D.zero()

    const magnitude = this.magnitude()

    return Vector2D.create(this.x / magnitude, this.y / magnitude)
  }

  /**
   * Inverts the vector on the specified axis.
   *
   * @public
   * @param {keyof Coordinates2D} axis Axis to check. Defaults to `undefined`.
   * @returns {this} The modified vector after linear inversion on the specified axis or both.
   * @throws {RangeError} Will throw when when the axis is invalid.
   * @example
   * const vector = Vector2D.create(1, 2)
   * vector.invert() // Vector2D { x: -1, y: -2 }
   * vector.invert('x') // Vector2D { x: -1, y: 2 }
   * vector.invert('y') // Vector2D { x: 1, y: -2 }
   * vector.invert('z') // throws RangeError
   */
  invert(axis?: keyof Coordinates2D): Vector2D {
    if (axis === undefined)
      return Vector2D.create(-this.x, -this.y)

    this.#validateAxis(axis)

    return Vector2D.create(
      axis === 'x' ? -this.x : this.x,
      axis === 'y' ? -this.y : this.y,
    )
  }

  /**
   * Swaps the `x` and `y` values.
   *
   * @public
   * @returns {Vector2D} New vector after swapping the `x` and `y` values.
   * @example
   * const vector = Vector2D.create(1, 2)
   * vector.swap() // Vector2D { x: 2, y: 1 }
   */
  swap(): Vector2D {
    return Vector2D.create(this.y, this.x)
  }

  /**
   * Rotates the vector in the specified direction.
   *
   * @public
   * @param {number} angleInRadians
   * @returns {Vector2D} New vector after rotation.
   * @example
   * const vector = Vector2D.create(1, 2)
   * vector.rotate(Math.PI / 2) // Vector2D { x: -2, y: 1 }
   * vector.rotate(Math.PI / 2) // Vector2D { x: -1, y: -2 }
   * vector.rotate(Math.PI / 2) // Vector2D { x: 2, y: -1 }
   * vector.rotate(Math.PI / 2) // Vector2D { x: 1, y: 2 }
   */
  rotate(angleInRadians: number): Vector2D {
    const cosAngle = Math.cos(angleInRadians)
    const sinAngle = Math.sin(angleInRadians)

    const newX = this.x * cosAngle - this.y * sinAngle
    const newY = this.x * sinAngle + this.y * cosAngle

    return Vector2D.create(newX, newY)
  }

  /**
   * Creates normal vector in the specified direction.
   *
   * @public
   * @param {Coordinates2D} direction Defaults to `counterclockwise`.
   * @returns {Vector2D} The modified vector after rotating in the specified direction by 90°.
   * @throws {RangeError} Will throw when input is not a rotation direction.
   * @throws {TypeError} Will throw when the vector is zero.
   * @example
   * const vector = Vector2D.create(1, 2)
   * vector.normal() // Vector2D { x: -2, y: 1 }
   * vector.normal('clockwise') // Vector2D { x: 2, y: -1 }
   * vector.normal('diagonal') // throws RangeError
   * Vector2D.zero().normal() // throws TypeError
   */
  normal(direction: RotationDirection = 'counterclockwise'): Vector2D {
    if (this.isZero())
      throw new TypeError('Cannot create normal vector from zero vector.')

    this.#validateDirection(direction)

    const [newX, newY] = direction === 'clockwise' ? [this.y, -this.x] : [-this.y, this.x]

    return Vector2D.create(newX, newY)
  }

  /**
   * Calculates the angle between the vector and the specified vector.
   *
   * @public
   * @param {Coordinates2D} vector The vector to calculate the angle to.
   * @param {keyof Coordinates2D} axis The axis to measure the angle relative to. Defaults to 'x'.
   * @returns {number} The angle between the vector and the specified vector in radians.
   * @throws {RangeError} Will throw when input is not a number or a 2D vector coordinates.
   * @example
   * const vector = Vector2D.create(1, 2)
   * vector.angleTo({ x: 1, y: 0 }) // 1.1071487177940904
   * vector.angleTo({ x: 1, y: 1 }, 'y') // 0.7853981633974483
   * vector.angleTo({ x: 1, y: 1 }, 'x') // 0.4636476090008061
   * vector.angleTo({ x: 1, y: 1 }, 'z') // throws RangeError
   */
  angleTo(vector: Coordinates2D, axis: keyof Coordinates2D = 'x'): number {
    this.#validateAxis(axis)

    const angle = axis === 'x'
      ? Math.atan2(vector.y, vector.x) - Math.atan2(this.y, this.x)
      : Math.atan2(vector.x, vector.y) - Math.atan2(this.x, this.y)

    return (angle + Vector2D.TAU) % Vector2D.TAU
  }

  /**
   * Rounds the `x` and `y` values.
   *
   * @public
   * @returns {Vector2D} New vector after rounding the `x` and `y` values.
   * @example
   * const vector = Vector2D.create(1.5, 2.5)
   * vector.round() // Vector2D { x: 2, y: 3 }
   */
  round(): Vector2D {
    return Vector2D.create(Math.round(this.x), Math.round(this.y))
  }

  /**
   * Floors the `x` and `y` values.
   *
   * @public
   * @returns {Vector2D} New vector after flooring the `x` and `y` values.
   * @example
   * const vector = Vector2D.create(1.5, 2.5)
   * vector.floor() // Vector2D { x: 1, y: 2 }
   */
  floor(): Vector2D {
    return Vector2D.create(Math.floor(this.x), Math.floor(this.y))
  }

  /**
   * Ceils the `x` and `y` values.
   *
   * @public
   * @returns {Vector2D} New vector after ceilling the `x` and `y` values.
   * @example
   * const vector = Vector2D.create(1.5, 2.5)
   * vector.ceil() // Vector2D { x: 2, y: 3 }
   */
  ceil(): Vector2D {
    return Vector2D.create(Math.ceil(this.x), Math.ceil(this.y))
  }

  /**
   * Truncates the `x` and `y` values.
   *
   * @public
   * @returns {Vector2D} New vector after truncating the `x` and `y` values.
   * @example
   * const vector = Vector2D.create(1.5, 2.5)
   * vector.trunc() // Vector2D { x: 1, y: 2 }
   */
  trunc(): Vector2D {
    return Vector2D.create(Math.trunc(this.x), Math.trunc(this.y))
  }

  /**
   * Limits the magnitude of the vector.
   *
   * @public
   * @param {number} min Minimum magnitude.
   * @param {number} max Maximum magnitude.
   * @returns {this} New vector with limited magnitude.
   * @throws {RangeError} Will throw when `min` is greater than or equal to `max`.
   * @example
   * const vector = Vector2D.create(1, 2)
   * vector.limit(0, 5) // Vector2D { x: 1, y: 2 }
   * vector.limit(0, 1) // Vector2D { x: 0.4472135954999579, y: 0.8944271909999159 }
   * vector.limit(5, 0) // throws RangeError
   */
  limit(min: number, max: number): Vector2D {
    if (min >= max)
      throw new RangeError('Cannot limit vector with min greater than max.')

    if (this.isZero())
      return this

    const magnitude = this.magnitude()
    const clampedMagnitude = clamp(magnitude, min, max)
    const coefficient = clampedMagnitude / magnitude

    return this.multiply({ x: coefficient, y: coefficient })
  }

  /**
   * Randomizes the `x` and `y` values.
   *
   * @public
   * @param {Coordinates2D} min Minimum coordinates to randomize.
   * @param {Coordinates2D} max Maximum coordinates to randomize.
   * @param asFloat Sets the random values to be floats or integers. Defaults to `true`.
   * @returns {Vector2D} New vector after randomization.
   * @throws {RangeError} Will throw when `min` is greater than or equal to `max`.
   * @example
   * const vector = Vector2D.create(1, 2)
   * vector.randomize({ x: 0, y: 0 }, { x: 10, y: 10 }) // Vector2D { x: 5, y: 7 }
   * vector.randomize({ x: 0, y: 0 }, { x: 10, y: 10 }, false) // Vector2D { x: 5, y: 7 }
   * vector.randomize({ x: 10, y: 10 }, { x: 0, y: 0 }) // throws RangeError
   */
  randomize(min: Coordinates2D, max: Coordinates2D, asFloat: Parameters<typeof randomBetween>[2] = 'float'): Vector2D {
    if (min.x >= max.x || min.y >= max.y)
      throw new RangeError('Cannot randomize vector with min greater than max.')

    const newX = randomBetween(min.x, max.x, asFloat)
    const newY = randomBetween(min.y, max.y, asFloat)

    return Vector2D.create(newX, newY)
  }

  /**
   * Clones the vector.
   *
   * @public
   * @returns {Vector2D} A new vector with the same `x` and `y` values.
   * @example
   * const vector = Vector2D.create(1, 2)
   * vector.clone() // Vector2D { x: 1, y: 2 }
   */
  clone(): Vector2D {
    return Vector2D.create(this.x, this.y)
  }

  /**
   * Reflects the vector to the specified normal.
   *
   * @public
   * @param {Vector2D} normal The normal to reflect to.
   * @returns {Vector2D} The new vector after reflecting to the specified normal.
   * @example
   * const vector = Vector2D.create(1, 2)
   * vector.reflectInPlace({ x: 1, y: 0 }) // Vector2D { x: 1, y: 0 }
   * vector.reflectInPlace({ x: 0, y: 1 }) // Vector2D { x: 0, y: 2 }
   * vector.reflectInPlace({ x: 1, y: 1 }) // Vector2D { x: 1.5, y: 1.5 }
   * vector.reflectInPlace({ x: 0, y: 0 }) // Vector2D { x: 1, y: 2 }
   */
  reflectInPlace(normal: Vector2D): Vector2D {
    const normalizedNormal = normal.normalize()
    const coefficient = 2 * Vector2D.dotProduct(this, normalizedNormal)
    const reflection = normalizedNormal.multiply({ x: coefficient, y: coefficient })

    return reflection.subtract(this)
  }

  /**
   * Projects the vector onto the specified normal.
   *
   * @public
   * @param {Coordinates2D} normal
   * @returns {Vector2D} The modified vector after projecting onto the specified normal.
   * @throws {TypeError} If the normal vector is zero.
   * @example
   * const vector = Vector2D.create(1, 2)
   * vector.projectOnto({ x: 1, y: 0 }) // Vector2D { x: 1, y: 0 }
   * vector.projectOnto({ x: 0, y: 1 }) // Vector2D { x: 0, y: 2 }
   * vector.projectOnto({ x: 1, y: 1 }) // Vector2D { x: 1.5, y: 1.5 }
   * vector.projectOnto({ x: 0, y: 0 }) // throws TypeError
   */
  projectOnto(normal: Coordinates2D): Vector2D {
    const normalDotNormal = Vector2D.dotProduct(normal, normal)

    if (normalDotNormal === 0)
      throw new TypeError('Cannot project onto zero vector.')

    const dotProduct = Vector2D.dotProduct(this, normal)
    const coefficient = dotProduct / normalDotNormal

    return Vector2D.create(normal.x * coefficient, normal.y * coefficient)
  }

  /**
   * Calculates the distance between two 2D vectors.
   *
   * @public
   * @param {Coordinates2D} vector The vector to calculate the distance to.
   * @returns {number} The distance between two 2D vectors.
   * @example
   * const vector = Vector2D.create(1, 2)
   * vector.distanceSquared({ x: 3, y: 4 }) // 8
   * vector.distanceSquared({ x: 3, y: 4 }, 'x') // 2
   * vector.distanceSquared({ x: 3, y: 4 }, 'y') // 2
   */
  distanceSquared(vector: Coordinates2D): number {
    const difference = this.subtract(vector)

    return difference.magnitudeSquared()
  }

  /**
   * Calculates the distance between two 2D vectors.
   *
   * @public
   * @param {Coordinates2D} vector The vector to calculate the distance to.
   * @param {keyof Coordinates2D} coordinate The coordinate to calculate the distance to.
   * @returns {number} The distance between two 2D vectors.
   * @throws {RangeError} Will throw when coordinate key is invalid.
   * @example
   * const vector = Vector2D.create(1, 2)
   * vector.distance({ x: 3, y: 4 }) // Math.sqrt(8)
   * vector.distance({ x: 3, y: 4 }, 'x') // 2
   * vector.distance({ x: 3, y: 4 }, 'y') // 2
   * vector.distance({ x: 3, y: 4 }, 'z') // throws RangeError
   */
  distance(vector: Coordinates2D, coordinate?: keyof Coordinates2D): number {
    if (coordinate === undefined)
      return Math.hypot(this.x - vector.x, this.y - vector.y)

    this.#validateCoordinate(coordinate)

    return Math.abs(this[coordinate] - vector[coordinate])
  }

  /**
   * Releases the `Vector2D` instance back to the pool.
   *
   * @public
   * @returns {void}
   * @example
   * const v = Vector2D.create(1, 2)
   * const w = Vector2D.create(3, 4)
   * const distance = v.distance(w)
   * v.release()
   * w.release()
   */
  release(): void {
    if (Vector2D.#pool.length >= Vector2D.#POOL_LIMIT)
      return

    Vector2D.#pool.push(this)
  }
}
