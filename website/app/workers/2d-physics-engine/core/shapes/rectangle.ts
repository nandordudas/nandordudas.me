import type { Renderer } from '../game/renderer'

import { Shape } from './shape'

export class Rectangle extends Shape {
  constructor(
    public readonly width: number = 0,
    public readonly height: number = 0,
    public readonly position: Coordinates2D,
  ) {
    super()
  }

  override display(renderer: Renderer): void {
    renderer.drawRect({
      height: this.height,
      position: this.position,
      width: this.width,
    })
  }
}
