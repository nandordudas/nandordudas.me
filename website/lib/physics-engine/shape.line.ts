import type { Body } from './body'
import type { ShapeRenderer } from './renderer.shape'

import { Net } from './body.net'
import { Shape } from './shape'
import { Vector2D } from './vector-2d'

interface LineConstructorProps {
  start?: Vector2D
  end?: Vector2D
}

export class Line extends Shape implements LineConstructorProps {
  readonly start: Vector2D = Vector2D.zero()
  readonly end: Vector2D = Vector2D.zero()

  constructor(props: LineConstructorProps = {}) {
    super()
    Object.assign(this, props)
  }

  override draw(renderer: ShapeRenderer, body: Body): void {
    if (body.isInstanceOf(Net))
      renderer.context.setLineDash([5, 5])

    renderer.drawLine({
      start: this.start,
      end: this.end,
    })

    // Reset the line dash
    renderer.context.setLineDash([0, 0])
  }
}
