import type { Renderer } from '../game/renderer'

import { Shape } from './shape'

export class Line extends Shape {
  constructor(
    public readonly start: Coordinates2D,
    public readonly end: Coordinates2D,
  ) {
    super()
  }

  override display(renderer: Renderer): void {
    renderer.drawLine({
      start: this.start,
      end: this.end,
    })
  }
}
