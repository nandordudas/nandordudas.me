import type { Vector2D } from '../physics/vector-2d'

// Axis-Aligned Bounding Box
export class AABB {
  constructor(
    public readonly min: Vector2D,
    public readonly max: Vector2D,
  ) { }

  intersects(_other: AABB): boolean { return false }
  contains(_point: Vector2D): boolean { return false }
  expand(_margin: number): this { return this }
}
