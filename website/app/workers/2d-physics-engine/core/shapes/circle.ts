import type { Renderer } from '../game/renderer'

import { Shape } from './shape'

export class Circle extends Shape {
  constructor(
    public readonly position: Coordinates2D,
    public readonly radius: number = 0,
  ) {
    super()
  }

  override display(renderer: Renderer): void {
    renderer.drawPoint({
      position: this.position,
      radius: this.radius,
    })
  }
}
