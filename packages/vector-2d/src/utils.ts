import type { Array2D, CoordinateKey, Coordinates, Coordinates2D, NumberOrCoordinates } from './types'

export function isNumber(value: unknown): value is number {
  return typeof value === 'number' && !Number.isNaN(value) && Number.isFinite(value)
}

export function isArray2D(coordinates: unknown): coordinates is Array2D {
  return Array.isArray(coordinates) && coordinates.filter(isNumber).length === 2
}

export function isObject(value: unknown): value is object {
  return typeof value === 'object' && value !== null
}

export function hasProperty<T extends object, K extends PropertyKey>(obj: T, prop: K): obj is T & Record<K, unknown> {
  return prop in obj
}

export function isCoordinates2D(value: unknown): value is Coordinates2D {
  return isObject(value)
    && hasProperty(value, 'x')
    && hasProperty(value, 'y')
    && isNumber(value.x)
    && isNumber(value.y)
}

type MapKey = { numberOrCoordinates2D: number } | Coordinates

const coordinatesCache = new WeakMap<MapKey, Coordinates2D>()

/**
 * @throws Will throw when input is not a number or a 2D vector coordinates.
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

function createWeakMapKey(numberOrCoordinates2D: NumberOrCoordinates): MapKey {
  if (isNumber(numberOrCoordinates2D)) {
    if (!numberKeys.has(numberOrCoordinates2D))
      numberKeys.set(numberOrCoordinates2D, { numberOrCoordinates2D })

    return numberKeys.get(numberOrCoordinates2D)!
  }

  return numberOrCoordinates2D
}

/**
 * @throws Will throw when `min` is greater than or equal to `max`.
 */
export function clamp(value: number, min: number, max: number) {
  if (min >= max)
    throw new Error('Min must be less than or equal to max')

  // Math.min(max, Math.max(min, ))
  return Math.max(min, Math.min(max, value))
}

export function isDefined<T>(value: T | null | undefined): value is T {
  return value !== null && value !== undefined
}

export function isCoordinateKey(key: string): key is CoordinateKey {
  return key === 'x' || key === 'y'
}

export function randomBetween(min: number, max: number, asFloat = true): number {
  if (min > max)
    throw new Error('Min must be less than or equal to max')

  if (min === max)
    throw new Error('Min and max cannot be equal')

  if (asFloat)
    return Math.random() * (max - min) + min

  return Math.floor(Math.random() * (max - min + 1) + min)
}
