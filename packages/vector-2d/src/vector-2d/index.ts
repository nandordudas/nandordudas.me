import { clamp, isNumber, randomBetween } from '../utils'

type RotationDirection = 'clockwise' | 'counterclockwise'
interface Coordinates2D { x: number, y: number }

/**
 * @class
 * @todo pooling instances to reduce garbage collection pressure: create
 * @todo memoization if they are called frequently on the same vector instances: isZero, isOnAxes, isEqualTo
 */
export class Vector2D {
  static #pool: Vector2D[] = []

  /**
   * @private
   * @static
   */
  static readonly #instances = new WeakMap<Vector2D, Coordinates2D>()

  /**
   * @private
   * @static
   */
  static readonly #constructorKey = Symbol(this.constructor.name)

  /**
   * A static, Vector2D object representing the zero vector (0, 0).
   *
   * @public
   * @static
   * @returns {Vector2D} The zero vector.
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
   */
  static dotProduct(v: Coordinates2D, w: Coordinates2D): number {
    const result = v.x * w.x + v.y * w.y

    return result
  }

  /**
   * Calculates the cross product of two vectors.
   *
   * @public
   * @static
   * @param {Coordinates2D} v The first vector.
   * @param {Coordinates2D} w The second vector.
   * @returns {number} The cross product of two vectors.
   */
  static crossProduct(v: Coordinates2D, w: Coordinates2D): number {
    const result = v.x * w.y - v.y * w.x

    return result
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
   */
  static clamp(v: Coordinates2D, min: number, max: number): Vector2D {
    const x = clamp(v.x, min, max)
    const y = clamp(v.y, min, max)
    const result = new Vector2D(Vector2D.#constructorKey, x, y)

    return result
  }

  /**
   * Calculates the midpoint between two vectors.
   *
   * @public
   * @static
   * @param {Coordinates2D} v The first vector.
   * @param {Coordinates2D} w The second vector.
   * @returns {Coordinates2D} The midpoint between two vectors.
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
   * The `x` segment of the coordinates, mirroring the value from the static
   * `zero` or `unit` properties if used directly.
   *
   * @public
   * @readonly
   * @property The `x` segment of the coordinates.
   */
  get x(): number {
    return this.#instance.x
  }

  /**
   * The `y` segment of the coordinates, mirroring the value from the static `zero` or `unit` properties if used
   * directly.
   *
   * @public
   * @readonly
   * @property The `y` segment of the coordinates.
   */
  get y(): number {
    return this.#instance.y
  }

  /**
   * Sets the `x` segment of the coordinates.
   *
   * @param {number} value The value to set the `x` segment to.
   */
  set x(value: number) {
    this.#instance.x = value

    this.#invalidateCache()
  }

  /**
   * Sets the `y` segment of the coordinates.
   *
   * @param {number} value The value to set the `y` segment to.
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
   */
  #calculateNewCoordinates(direction: RotationDirection): [number, number] {
    return direction === 'clockwise' ? [this.y, -this.x] : [-this.y, this.x]
  }

  /**
   * The private constructor of the Vector2D class. This constructor cannot be called with the `new` keyword. Use the
   * static `Vector2D.create()` method to create new instances.
   *
   * @private
   * @constructor
   * @param {symbol} key The key of the instance.
   * @param {number} x The `x` segment of the coordinates.
   * @param {number} y The `y` segment of the coordinates.
   * @throws {TypeError} When called with `new` keyword.
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
   * Converts the vector to a string representation.
   *
   * @public
   * @override
   * @returns {string} The string representation of the vector in the format `Vector2D { x: X, y: Y }`, where X and Y
   * are the vector's `x` and `y` components.
   */
  toString(): string {
    const result = `Vector2D { x: ${this.x}, y: ${this.y} }`

    return result
  }

  /**
   * Converts the vector to a JSON object.
   *
   * @public
   * @returns {Coordinates2D} The JSON representation of the vector.
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
   */
  lerpTo(other: Coordinates2D, t: number): this {
    if (t < 0 || t > 1)
      throw new RangeError('t must be between 0 and 1')

    this.x = this.x * (1 - t) + other.x * t
    this.y = this.y * (1 - t) + other.y * t

    return this
  }

  /**
   * Calculates the squared magnitude of the vector.
   *
   * @public
   */
  magnitudeSquared(): number {
    if (this.#cachedMagnitudeSquared !== null)
      return this.#cachedMagnitudeSquared

    this.#cachedMagnitudeSquared = this.x * this.x + this.y * this.y

    return this.#cachedMagnitudeSquared
  }

  /**
   * Calculates the magnitude of the vector.
   *
   * @public
   * @returns {number} The magnitude of the vector.
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
   */
  randomize(min: Coordinates2D, max: Coordinates2D, asFloat = true): this {
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
   */
  release(): void {
    Vector2D.#pool.push(this)
  }
}
