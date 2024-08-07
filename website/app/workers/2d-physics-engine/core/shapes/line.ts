import type { Renderer } from '2dpe/core/game/renderer'
import type { Body } from '2dpe/core/physics/body'

import { Shape } from './shape'

export class Line extends Shape {
  constructor(
    public readonly start: Coordinates2D,
    public readonly end: Coordinates2D,
  ) {
    super()
  }

  override display(renderer: Renderer, _body: Body): void {
    renderer.drawLine({
      start: this.start,
      end: this.end,
    })
  }
}
