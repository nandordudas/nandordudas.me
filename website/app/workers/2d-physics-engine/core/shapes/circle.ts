import type { Renderer } from '2dpe/core/game/renderer'
import type { Body } from '2dpe/core/physics/body'

import { Shape } from './shape'

export class Circle extends Shape {
  constructor(
    /**
     * @readonly
     */
    public readonly radius: number = 0,
  ) {
    super()
  }

  /**
   * Draws the circle
   * @override
   */
  override display(renderer: Renderer, body: Body): void {
    renderer.drawPoint({
      position: body.position,
      radius: this.radius,
    })
  }
}
