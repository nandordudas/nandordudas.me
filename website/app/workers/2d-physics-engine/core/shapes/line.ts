import type { Renderer } from '2dpe/core/game/renderer'
import type { Body } from '2dpe/core/physics/body'
import type { Vector2D } from '2dpe/core/physics/vector-2d'

import { Shape } from './shape'

export class Line extends Shape {
  constructor(
    /**
     * @readonly
     */
    public readonly start: Vector2D,

    /**
     * @readonly
     */
    public readonly end: Vector2D,
  ) {
    super()
  }

  /**
   * Draws the line
   * @override
   */
  override display(renderer: Renderer, _body: Body): void {
    renderer.drawLine({
      start: this.start,
      end: this.end,
    })
  }
}
