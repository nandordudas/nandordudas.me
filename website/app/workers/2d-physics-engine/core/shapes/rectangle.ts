import type { Renderer } from '2dpe/core/game/renderer'
import type { Body } from '2dpe/core/physics/body'

import { Shape } from './shape'

export class Rectangle extends Shape {
  constructor(
    public readonly width: number = 0,
    public readonly height: number = 0,
  ) {
    super()
  }

  override display(renderer: Renderer, body: Body): void {
    renderer.drawRect({
      height: this.height,
      position: body.position,
      width: this.width,
    })
  }
}
