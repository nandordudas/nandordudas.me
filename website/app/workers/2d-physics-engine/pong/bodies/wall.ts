import type { Vector2D } from '2dpe/core/physics/vector-2d'
import type { Line } from '2dpe/core/shapes/line'

import { Body } from '2dpe/core/physics/body'

export class Wall extends Body {
  constructor(
    public override position: Vector2D,

    /**
     * @override
     * @readonly
     */
    public override readonly shape: Line,

    /**
     * @override
     * @readonly
     */
    public override readonly mass: number,

    /**
     * @override
     * @readonly
     */
    public override readonly friction: number = 1.0,
  ) {
    super(position, shape, mass, friction)
  }

  override move(_deltaTime: number): void {
    // Wall is static
  }

  unit(): Vector2D {
    return this.shape.end.subtract(this.shape.start)
  }
}
