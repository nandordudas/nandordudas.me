import { Vector2D } from '2dpe/core/physics/vector-2d'
import { World } from '2dpe/core/physics/world'

export class PongWorld extends World {
  /**
   * @override
   * @readonly
   */
  override readonly gravity: Vector2D = Vector2D.create(0, 0)
}
