import type { Vector2D } from './vector-2d'

interface FindClosestVectorParams<T extends readonly Vector2D[]> {
  referenceVector: Vector2D
  vectors: T
}

interface FindClosestItemParams<T> {
  referenceVector: Vector2D
  items: T[]
  getCoordinates: (item: T) => Vector2D
}

export function findClosestVector<T extends readonly Vector2D[]>({
  referenceVector,
  vectors,
}: FindClosestVectorParams<T>): T[number] | undefined {
  if (vectors.length === 0)
    return undefined

  return vectors.reduce((closest, current) =>
    current.distance(referenceVector) < closest.distance(referenceVector) ? current : closest, vectors[0]!)
}

export function findClosestItem<T>({
  referenceVector,
  items,
  getCoordinates,
}: FindClosestItemParams<T>): T | undefined {
  if (items.length === 0)
    return undefined

  return items.reduce((closest, current) =>
    getCoordinates(current).distance(referenceVector) < getCoordinates(closest).distance(referenceVector)
      ? current
      : closest, items[0]!)
}
