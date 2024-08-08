import type { Renderer } from '2dpe/core/game/renderer'
import type { Body } from '2dpe/core/physics/body'

import { Shape } from './shape'

export class Line extends Shape {
  constructor(
    /**
     * @readonly
     */
    public readonly start: Coordinates2D,

    /**
     * @readonly
     */
    public readonly end: Coordinates2D,
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
