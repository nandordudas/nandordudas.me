import { clamp, isNumber, randomBetween } from '../utils'

type RotationDirection = 'clockwise' | 'counterclockwise'
interface Coordinates2D { x: number, y: number }

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
    return new Vector2D(Vector2D.#constructorKey, 0, 0).clone()
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
    return new Vector2D(Vector2D.#constructorKey, 1, 1).clone()
  }

  /**
   * Creates a new `Vector2D` instance from the given coordinates.
   *
   * @public
   * @static
   * @param {number} x The x-coordinate of the vector.
   * @param {number} y The y-coordinate of the vector.
   * @returns {Vector2D} The newly created `Vector2D` instance.
   * @example
   * Vector2D.create(1, 2) // Vector2D { x: 1, y: 2 }
   * Vector2D.create(3, 4) // Vector2D { x: 3, y: 4 }
   */
  static create(x: number, y: number): Vector2D {
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

    return new Vector2D(Vector2D.#constructorKey, x, y)
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
    if (this.#instances.has(coordinates)) {
      return this.#instances.get(coordinates)!.x === 0
        && this.#instances.get(coordinates)!.y === 0
    }

    const result = coordinates.x === 0 && coordinates.y === 0

    Vector2D.#instances.set(coordinates, { x: coordinates.x, y: coordinates.y })

    return result
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

    this.#invalidateCache()
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

    this.#invalidateCache()
  }

  /**
   * @private
   * @property The cached magnitude of the vector.
   */
  #cachedMagnitude: number | null = null

  /**
   * @private
   * @property The cached magnitude squared of the vector.
   */
  #cachedMagnitudeSquared: number | null = null

  /**
   * Clears the cache of the vector's magnitude and magnitude squared.
   *
   * @private
   * @returns {void}
   * @example
   * this.#invalidateCache() // Clears the cached magnitude and magnitude squared.
   */
  #invalidateCache(): void {
    this.#cachedMagnitude = null
    this.#cachedMagnitudeSquared = null
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
   * Calculates the new coordinates after rotation.
   *
   * @private
   * @param {RotationDirection} direction The direction to rotate.
   * @returns {[number, number]} The new coordinates after
   * @example
   * this.#calculateNewCoordinates('clockwise') // [this.y, -this.x]
   * this.#calculateNewCoordinates('counterclockwise') // [-this.y, this.x]
   */
  #calculateNewCoordinates(direction: RotationDirection): [number, number] {
    return direction === 'clockwise' ? [this.y, -this.x] : [-this.y, this.x]
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
   * @returns {this} The modified vector after addition.
   * @example
   * const vector = Vector2D.create(1, 2)
   * vector.add({ x: 2, y: 4 }) // Vector2D { x: 3, y: 6 }
   * vector.add({ x: 2, y: 0 }) // Vector2D { x: 5, y: 6 }
   */
  add(other: Coordinates2D): this {
    this.x += other.x
    this.y += other.y

    this.#invalidateCache()

    return this
  }

  /**
   * Subtracts the current vector by the given vector component-wise.
   *
   * @public
   * @param {Coordinates2D} other The vector to subtract from the current vector.
   * @returns {this} The modified vector after subtraction.
   * @example
   * const vector = Vector2D.create(1, 2)
   * vector.subtract({ x: 2, y: 4 }) // Vector2D { x: -1, y: -2 }
   * vector.subtract({ x: 2, y: 0 }) // Vector2D { x: -1, y: 2 }
   */
  subtract(other: Coordinates2D): this {
    this.x -= other.x
    this.y -= other.y

    this.#invalidateCache()

    return this
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
  multiply(other: Coordinates2D): this {
    this.x *= other.x
    this.y *= other.y

    this.#invalidateCache()

    return this
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
   * @returns {this} The modified vector after division.
   * @throws {RangeError} Will throw when `other.x` or `other.y` is zero.
   * @example
   * const vector = Vector2D.create(1, 2)
   * vector.divide({ x: 2, y: 4 }) // Vector2D { x: 0.5, y: 0.5 }
   * vector.divide({ x: 2, y: 0 }) // throws RangeError
   * vector.divide({ x: 0, y: 4 }) // throws RangeError
   * vector.divide({ x: 0, y: 0 }) // throws RangeError
   */
  divide(other: Vector2D): this {
    if (other.isOnAxes())
      throw new RangeError('Cannot divide by zero.')

    this.x = other.x === 0 ? 0 : this.x / other.x
    this.y = other.y === 0 ? 0 : this.y / other.y

    this.#invalidateCache()

    return this
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

    if (Vector2D.isZero(this) || Vector2D.isZero(otherVector))
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
  lerpTo(other: Coordinates2D, t: number): this {
    if (t < 0 || t > 1)
      throw new RangeError('t must be between 0 and 1')

    this.x = this.x * (1 - t) + other.x * t
    this.y = this.y * (1 - t) + other.y * t

    return this
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
    if (this.#cachedMagnitudeSquared !== null)
      return this.#cachedMagnitudeSquared

    this.#cachedMagnitudeSquared = this.x * this.x + this.y * this.y

    return this.#cachedMagnitudeSquared
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
    if (this.#cachedMagnitude !== null)
      return this.#cachedMagnitude

    this.#cachedMagnitude = Math.sqrt(this.magnitudeSquared())

    return this.#cachedMagnitude
  }

  /**
   * Normalizes the vector.
   *
   * @public
   * @returns {Vector2D} New vector after normalization.
   * @throws {TypeError} Will throw when the vector is zero.
   * @example
   * const vector = Vector2D.create(1, 2)
   * vector.normalize() // Vector2D { x: 0.4472135954999579, y: 0.8944271909999159 }
   * Vector2D.zero().normalize() // throws TypeError
   */
  normalize(): Vector2D {
    if (this.isZero())
      throw new TypeError('Cannot normalize zero vector.')

    const magnitude = this.magnitude()

    return new Vector2D(Vector2D.#constructorKey, this.x / magnitude, this.y / magnitude)
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
  invert(axis?: keyof Coordinates2D): this {
    if (axis === undefined) {
      this.x *= -1
      this.y *= -1

      return this
    }

    if (axis !== 'x' && axis !== 'y')
      throw new RangeError('Invalid axis for operation.')

    this[axis] *= -1

    return this
  }

  /**
   * Swaps the `x` and `y` values.
   *
   * @public
   * @returns {this} The modified vector after swapping the `x` and `y` values.
   * @example
   * const vector = Vector2D.create(1, 2)
   * vector.swap() // Vector2D { x: 2, y: 1 }
   */
  swap(): this {
    [this.x, this.y] = [this.y, this.x]

    return this
  }

  /**
   * Rotates the vector in the specified direction.
   *
   * @public
   * @param {number} angleInRadians
   * @returns {this} The modified vector after rotating in the specified direction.
   * @example
   * const vector = Vector2D.create(1, 2)
   * vector.rotate(Math.PI / 2) // Vector2D { x: -2, y: 1 }
   * vector.rotate(Math.PI / 2) // Vector2D { x: -1, y: -2 }
   * vector.rotate(Math.PI / 2) // Vector2D { x: 2, y: -1 }
   * vector.rotate(Math.PI / 2) // Vector2D { x: 1, y: 2 }
   */
  rotate(angleInRadians: number): this {
    const cosAngle = Math.cos(angleInRadians)
    const sinAngle = Math.sin(angleInRadians)

    const newX = this.x * cosAngle - this.y * sinAngle
    const newY = this.x * sinAngle + this.y * cosAngle

    this.x = newX
    this.y = newY

    return this
  }

  /**
   * Creates normal vector in the specified direction.
   *
   * @public
   * @param {Coordinates2D} direction Defaults to `counterclockwise`.
   * @returns {this} The modified vector after rotating in the specified direction by 90°.
   * @throws {RangeError} Will throw when input is not a rotation direction.
   * @throws {TypeError} Will throw when the vector is zero.
   * @example
   * const vector = Vector2D.create(1, 2)
   * vector.normal() // Vector2D { x: -2, y: 1 }
   * vector.normal('clockwise') // Vector2D { x: 2, y: -1 }
   * vector.normal('diagonal') // throws RangeError
   * Vector2D.zero().normal() // throws TypeError
   */
  normal(direction: RotationDirection = 'counterclockwise'): this {
    if (this.isZero())
      throw new TypeError('Cannot create normal vector from zero vector.')

    this.#validateDirection(direction)

    const [newX, newY] = this.#calculateNewCoordinates(direction)

    this.x = newX
    this.y = newY

    this.#invalidateCache()

    return this
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
    if (axis !== 'x' && axis !== 'y')
      throw new RangeError('Invalid axis for operation.')

    const angle = axis === 'x'
      ? Math.atan2(vector.y, vector.x) - Math.atan2(this.y, this.x)
      : Math.atan2(vector.x, vector.y) - Math.atan2(this.x, this.y)

    return (angle + 2 * Math.PI) % (2 * Math.PI)
  }

  /**
   * Rounds the `x` and `y` values.
   *
   * @public
   * @returns {this} The modified vector after rounding the `x` and `y` values.
   * @example
   * const vector = Vector2D.create(1.5, 2.5)
   * vector.round() // Vector2D { x: 2, y: 3 }
   */
  round(): this {
    this.x = Math.round(this.x)
    this.y = Math.round(this.y)

    return this
  }

  /**
   * Floors the `x` and `y` values.
   *
   * @public
   * @returns {this} The modified vector after flooring the `x` and `y` values.
   * @example
   * const vector = Vector2D.create(1.5, 2.5)
   * vector.floor() // Vector2D { x: 1, y: 2 }
   */
  floor(): this {
    this.x = Math.floor(this.x)
    this.y = Math.floor(this.y)

    return this
  }

  /**
   * Ceils the `x` and `y` values.
   *
   * @public
   * @returns {this} The modified vector after ceilling the `x` and `y` values.
   * @example
   * const vector = Vector2D.create(1.5, 2.5)
   * vector.ceil() // Vector2D { x: 2, y: 3 }
   */
  ceil(): this {
    this.x = Math.ceil(this.x)
    this.y = Math.ceil(this.y)

    return this
  }

  /**
   * Truncates the `x` and `y` values.
   *
   * @public
   * @returns {this} The modified vector after truncating the `x` and `y` values.
   * @example
   * const vector = Vector2D.create(1.5, 2.5)
   * vector.trunc() // Vector2D { x: 1, y: 2 }
   */
  trunc(): this {
    this.x = Math.trunc(this.x)
    this.y = Math.trunc(this.y)

    return this
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
  limit(min: number, max: number): this {
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
   * @returns {this} The modified vector after randomizing the `x` and `y` values.
   * @throws {RangeError} Will throw when `min` is greater than or equal to `max`.
   * @example
   * const vector = Vector2D.create(1, 2)
   * vector.randomize({ x: 0, y: 0 }, { x: 10, y: 10 }) // Vector2D { x: 5, y: 7 }
   * vector.randomize({ x: 0, y: 0 }, { x: 10, y: 10 }, false) // Vector2D { x: 5, y: 7 }
   * vector.randomize({ x: 10, y: 10 }, { x: 0, y: 0 }) // throws RangeError
   */
  randomize(min: Coordinates2D, max: Coordinates2D, asFloat: Parameters<typeof randomBetween>[2] = 'float'): this {
    if (min.x >= max.x || min.y >= max.y)
      throw new RangeError('Cannot randomize vector with min greater than max.')

    this.x = randomBetween(min.x, max.x, asFloat)
    this.y = randomBetween(min.y, max.y, asFloat)

    return this
  }

  /**
   * Clones the vector.
   *
   * @public
   * @returns {Vector2D} The cloned vector.
   * @example
   * const vector = Vector2D.create(1, 2)
   * vector.clone() // Vector2D { x: 1, y: 2 }
   */
  clone(): Vector2D {
    return new Vector2D(Vector2D.#constructorKey, this.x, this.y)
  }

  /**
   * Reflects the vector to the specified normal.
   *
   * @public
   * @param {Vector2D} normal The normal to reflect to.
   * @returns {this} The modified vector after reflecting to the specified normal.
   * @throws {TypeError} If the normal vector is zero.
   * @example
   * const vector = Vector2D.create(1, 2)
   * vector.reflectInPlace({ x: 1, y: 0 }) // Vector2D { x: 1, y: 0 }
   * vector.reflectInPlace({ x: 0, y: 1 }) // Vector2D { x: 0, y: 2 }
   * vector.reflectInPlace({ x: 1, y: 1 }) // Vector2D { x: 1.5, y: 1.5 }
   * vector.reflectInPlace({ x: 0, y: 0 }) // throws TypeError
   */
  reflectInPlace(normal: Vector2D): this {
    const normalizedNormal = normal.normalize()
    const coefficient = 2 * Vector2D.dotProduct(this, normalizedNormal)
    const reflection = normalizedNormal.multiply({ x: coefficient, y: coefficient })
    const result = reflection.subtract(this)

    this.x = result.x
    this.y = result.y

    return this
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
      return Math.sqrt(this.distanceSquared(vector))

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
