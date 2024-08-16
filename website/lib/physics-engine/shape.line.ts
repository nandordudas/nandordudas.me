import type { Body } from './body'
import type { ShapeRenderer } from './renderer.shape'

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

  override draw(renderer: ShapeRenderer, _body: Body): void {
    renderer.drawLine({
      start: this.start,
      end: this.end,
    })
  }
}
