import type { Array2D } from './types'

import { Vector2D } from './vector-2d'

interface GetItemClosestToParams<T> {
  referenceVector: Vector2D
  items: T[]
  getCoordinates: (item: T) => Array2D
}

interface ClosestToParams<T extends readonly Vector2D[]> {
  referenceVector: Vector2D
  vectors: T
}

export function closestTo<const T extends readonly Vector2D[], R = T extends { length: 0 } ? null : Vector2D>({
  referenceVector,
  vectors,
}: ClosestToParams<T>): R {
  if (vectors.length === 0)
    return null as R

  return vectors.reduce((closest, current) => {
    const closestDistance = closest.distance(referenceVector)
    const currentDistance = current.distance(referenceVector)

    return currentDistance < closestDistance ? current : closest
  }) as R
}

export function getItemClosestTo<T extends Vector2D>({
  referenceVector,
  items,
}: GetItemClosestToParams<T>): T | null {
  if (items.length === 0)
    return null

  const closestIndex = items.reduce((closestIdx, item, currentIdx) => {
    const vector = items[closestIdx]!
    const closestDistance = Vector2D.create(vector.x, vector.y).distance(referenceVector)
    const currentDistance = Vector2D.create(item.x, item.y).distance(referenceVector)

    return currentDistance < closestDistance ? currentIdx : closestIdx
  }, 0)

  return items[closestIndex]!
}
