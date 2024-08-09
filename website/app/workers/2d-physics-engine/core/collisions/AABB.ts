import type { Vector2D } from '2dpe/core/physics/vector-2d'
import type { Vector2DBasicContract } from '2dpe/core/physics/vector-2d/types'

/**
 * Axis-Aligned Bounding Box
 */
export class AABB {
  constructor(
    /**
     * @readonly
     */
    public readonly min: Vector2DBasicContract,

    /**
     * @readonly
     */
    public readonly max: Vector2DBasicContract,
  ) { }

  intersects(_other: AABB): boolean { return false }
  contains(_point: Vector2D): boolean { return false }
  expand(_margin: number): this { return this }
}
