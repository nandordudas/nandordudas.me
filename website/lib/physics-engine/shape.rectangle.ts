import type { Body } from './body'
import type { ShapeRenderer } from './renderer.shape'

import { Shape } from './shape'

export interface RectangleConstructorProps {
  width?: number
  height?: number
}

export class Rectangle extends Shape implements RectangleConstructorProps {
  /**
   * @default 10
   */
  readonly width: number = 10
  /**
   * @default 40
   */
  readonly height: number = 40

  constructor(props: RectangleConstructorProps = {}) {
    super()
    Object.assign(this, props)
  }

  override draw(renderer: ShapeRenderer, body: Body): void {
    renderer.drawRect({
      width: this.width,
      height: this.height,
      position: body.position,
      isRounded: true,
      radii: 4,
    })
  }
}
