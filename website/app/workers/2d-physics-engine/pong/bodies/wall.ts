import type { Vector2D } from '2dpe/core/physics/vector-2d'
import type { Rectangle } from '2dpe/core/shapes/rectangle'

import { Body } from '2dpe/core/physics/body'

export class Wall extends Body {
  constructor(
    public override position: Vector2D,

    /**
     * @readonly
     */
    public override readonly shape: Rectangle,

    /**
     * @readonly
     */
    public override readonly mass: number,

    /**
     * @readonly
     */
    public override readonly friction: number = 1.0,
  ) {
    super(position, shape, mass, friction)
  }

  override move(_deltaTime: number): void {
    // throw new Error('Method not implemented.')
  }
}
