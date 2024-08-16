import type { Array2D, Coordinates2D, CoordinatesOrScalar } from './types'

export function isArray2D(coordinates: Coordinates2D | Array2D): coordinates is Array2D {
  return Array.isArray(coordinates) && coordinates.filter(isNumber).length === 2
}

export function isNumber(value: unknown): value is number {
  return typeof value === 'number' && !Number.isNaN(value) && Number.isFinite(value)
}

export function isCoordinates2D(value: unknown): value is Coordinates2D {
  return typeof value === 'object' && value !== null && 'x' in value && 'y' in value
}

export function toCoordinates2D(coordinatesOrScalar: CoordinatesOrScalar): Coordinates2D {
  if (isCoordinates2D(coordinatesOrScalar))
    return { x: coordinatesOrScalar.x, y: coordinatesOrScalar.y }

  return { x: coordinatesOrScalar, y: coordinatesOrScalar }
}

export function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value))
}

export function randomBetween(min: number, max: number, asFloat = true): number {
  if (asFloat)
    return Math.random() * (max - min) + min

  return Math.floor(Math.random() * (max - min + 1) + min)
}
