import type { BoxBody } from './body.box'
import type { Rendering } from 'canvas'
import type { Renderer } from '~/workers/canvas/lib/core/rendering/renderer'

import { Shape } from './shape'

interface DrawBoxOptions {
  stroke?: Rendering.Color
  fill?: Rendering.Color
  radii?: Rendering.Radii
}

export class Box extends Shape {
  static draw<T extends BoxBody>(
    renderer: Renderer<Rendering.Context2D>,
    body: T,
    options: DrawBoxOptions = {},
  ): void {
    const { stroke = 'white', fill = 'tomato', radii = 0 } = options
    const context = renderer.context

    context.beginPath()
    context.roundRect(body.position.x, body.position.y, body.width, body.height, radii)
    context.fillStyle = fill
    context.fill()
    context.strokeStyle = stroke
    context.stroke()
  }
}
