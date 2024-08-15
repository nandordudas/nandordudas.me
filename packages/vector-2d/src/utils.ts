import type { Array2D, CoordinateKey, Coordinates, Coordinates2D, NumberOrCoordinates } from './types'

/**
 * Checks if the value is a number. Is a type guard function.
 *
 * @param {unknown} value The value to check.
 * @returns {boolean} If the value is a number, `false` otherwise.
 * @example
 * isNumber(5) // true
 * isNumber('5') // false
 * isNumber(null) // false
 * isNumber(undefined) // false
 * isNumber(Number.NaN) // false
 */
export function isNumber(value: unknown): value is number {
  return typeof value === 'number' && !Number.isNaN(value) && Number.isFinite(value)
}

/**
 * Checks if the value is a 2D array. Is a type guard function.
 *
 * @param {unknown} coordinates The value to check.
 * @returns {boolean} If the value is a 2D array, `false` otherwise.
 * @example
 * isArray2D([1, 2]) // true
 * isArray2D([1]) // false
 * isArray2D([1, 2, 3]) // false
 */
export function isArray2D(coordinates: unknown): coordinates is Array2D {
  return Array.isArray(coordinates) && coordinates.filter(isNumber).length === 2
}

/**
 * Checks if the value is an object. Is a type guard function.
 *
 * @param {unknown} value The value to check.
 * @returns {boolean} If the value is an object, `false` otherwise.
 * @example
 * isObject({}) // true
 * isObject({ x: 1 }) // true
 * isObject([]) // true
 * isObject(null) // false
 */
export function isObject(value: unknown): value is object {
  return typeof value === 'object' && value !== null
}

/**
 * Checks if the object has a property. Is a type guard function.
 *
 * @template T The object type.
 * @template K The property key type.
 * @param {T} obj The object to check.
 * @param {K} prop The property to check.
 * @returns {boolean} If the object has the property, `false` otherwise.
 * @example
 * hasProperty({ x: 1 }, 'x') // true
 * hasProperty({ x: 1 }, 'y') // false
 */
export function hasProperty<T extends object, K extends PropertyKey>(obj: T, prop: K): obj is T & Record<K, unknown> {
  return prop in obj
}

/**
 * Checks if the object has a property with a specific type. Is a type guard function.
 *
 * @template T The object type.
 * @template K The property key type.
 * @template V The property value type.
 * @param {T} obj The object to check.
 * @param {K} prop The property to check.
 * @param {(value: unknown) => value is V} type The type guard function.
 * @returns {boolean} If the object has the property with the specific type, `false` otherwise.
 * @example
 * hasPropertyWithType({ x: 1 }, 'x', value => typeof value === 'number') // true
 * hasPropertyWithType({ x: 1 }, 'x', value => typeof value === 'string') // false
 * hasPropertyWithType({ x: 1 }, 'y', value => typeof value === 'number') // false
 */
export function hasPropertyWithType<
  T extends object,
  K extends PropertyKey,
  V,
>(obj: T, prop: K, type: (value: unknown) => value is V): obj is T & Record<K, V> {
  return hasProperty(obj, prop) && type(obj[prop])
}

/**
 * Checks if the value is a 2D vector coordinates. Is a type guard function.
 *
 * @param {unknown} value The value to check.
 * @returns {boolean} If the value is a 2D vector coordinates, `false` otherwise.
 * @example
 * isCoordinates2D({ x: 1, y: 2 }) // true
 * isCoordinates2D({ x: 1 }) // false
 * isCoordinates2D([1, 2]) // false
 */
export function isCoordinates2D(value: unknown): value is Coordinates2D {
  return isObject(value)
    && hasPropertyWithType(value, 'x', isNumber)
    && hasPropertyWithType(value, 'y', isNumber)
}

type MapKey = { numberOrCoordinates2D: number } | Coordinates

/**
 * A cache for 2D vector coordinates.
 */
const coordinatesCache = new WeakMap<MapKey, Coordinates2D>()

/**
 * Converts a number or 2D vector coordinates to 2D vector coordinates. It uses a cache for number keys.
 *
 * @param {NumberOrCoordinates} numberOrCoordinates2D The number or 2D vector coordinates to convert.
 * @returns {Coordinates2D} The 2D vector coordinates.
 * @throws {Error} Will throw when input is not a number or a 2D vector coordinates.
 * @example
 * toCoordinates2D(5) // { x: 5, y: 5 }
 * toCoordinates2D({ x: 1, y: 2 }) // { x: 1, y: 2 }
 * toCoordinates2D([1, 2]) // { x: 1, y: 2 }
 * toCoordinates2D({ x: 1 }) // throws Error
 */
export function toCoordinates2D(numberOrCoordinates2D: NumberOrCoordinates): Coordinates2D {
  const key = createWeakMapKey(numberOrCoordinates2D)

  if (coordinatesCache.has(key))
    return coordinatesCache.get(key)!

  if (isNumber(numberOrCoordinates2D)) {
    coordinatesCache.set(key, { x: numberOrCoordinates2D, y: numberOrCoordinates2D })

    return { x: numberOrCoordinates2D, y: numberOrCoordinates2D }
  }

  if (isCoordinates2D(numberOrCoordinates2D)) {
    coordinatesCache.set(key, numberOrCoordinates2D)

    return numberOrCoordinates2D
  }

  if (isArray2D(numberOrCoordinates2D)) {
    coordinatesCache.set(key, { x: numberOrCoordinates2D[0], y: numberOrCoordinates2D[1] })

    return { x: numberOrCoordinates2D[0], y: numberOrCoordinates2D[1] }
  }

  throw new Error('Invalid coordinates')
}

const numberKeys = new Map<number, MapKey>()

/**
 * Creates a key for a number or 2D vector coordinates. It uses a cache for number keys.
 *
 * @param {NumberOrCoordinates} numberOrCoordinates2D The number or 2D vector coordinates to create a key for.
 * @returns {MapKey} The key for the number or 2D vector coordinates.
 * @example
 * createWeakMapKey(5) // { numberOrCoordinates2D: 5 }
 * createWeakMapKey({ x: 1, y: 2 }) // { x: 1, y: 2 }
 */
function createWeakMapKey(numberOrCoordinates2D: NumberOrCoordinates): MapKey {
  if (isNumber(numberOrCoordinates2D)) {
    if (!numberKeys.has(numberOrCoordinates2D))
      numberKeys.set(numberOrCoordinates2D, { numberOrCoordinates2D })

    return numberKeys.get(numberOrCoordinates2D)!
  }

  return numberOrCoordinates2D
}

/**
 * Clamps a value between a minimum and maximum value.
 *
 * @param {number} value The value to clamp.
 * @param {number} min The minimum value.
 * @param {number} max The maximum value.
 * @returns {number} The clamped value.
 * @throws Will throw when `min` is greater than or equal to `max`.
 * @example
 * clamp(5, 0, 10) // 5
 * clamp(-5, 0, 10) // 0
 * clamp(15, 0, 0) // throws Error
 */
export function clamp(value: number, min: number, max: number): number {
  if (min >= max)
    throw new Error('Min must be less than or equal to max')

  return Math.max(min, Math.min(max, value))
}

/**
 * Checks if the value is defined.
 *
 * @template T The value type.
 * @param {T | null | undefined} value The value to check.
 * @returns {value is T} If the value is defined, `false` otherwise.
 * @example
 * isDefined(5) // true
 * isDefined(null) // false
 * isDefined(undefined) // false
 */
export function isDefined<T>(value: T | null | undefined): value is T {
  return value !== null && value !== undefined
}

/**
 * Checks if the key is a coordinate key.
 *
 * @param {string} key The key to check.
 * @returns {boolean} If the key is a coordinate key, `false` otherwise.
 * @example
 * isCoordinateKey('x') // true
 * isCoordinateKey('y') // true
 * isCoordinateKey('z') // false
 */
export function isCoordinateKey(key: string): key is CoordinateKey {
  return key === 'x' || key === 'y'
}

/**
 * Generates a random number between the minimum and maximum values.
 *
 * @param {number} min The minimum value.
 * @param {number} max The maximum value.
 * @param asFloat If the result should be a float.
 * @returns {number} The random number.
 * @throws {Error} Will throw when `max` is not greater than `min`.
 * @example
 * randomBetween(0, 10) // 5.123
 * randomBetween(0, 10, 'integer') // 5
 * randomBetween(0, 0, 'integer') // throws Error
 */
export function randomBetween(min: number, max: number, asFloat: 'float' | 'integer' = 'float'): number {
  if (min >= max)
    throw new Error('Min must be less than max')

  const randomValue = Math.random() * (max - min) + min

  return asFloat === 'float' ? randomValue : Math.floor(randomValue)
}
