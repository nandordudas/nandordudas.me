import type { Body } from './body'
import type { ShapeRenderer } from './renderer.shape'

import { Shape } from './shape'

interface CircleConstructorProps {
  radius?: number
}

export class Circle extends Shape implements CircleConstructorProps {
  /**
   * @default 4
   */
  readonly radius: number = 4

  constructor(props: CircleConstructorProps = {}) {
    super()
    Object.assign(this, props)
  }

  override draw(renderer: ShapeRenderer, body: Body): void {
    renderer.drawPoint({
      position: body.position,
      radius: this.radius,
    })
  }
}
