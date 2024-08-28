import type { CircleBody } from './body.circle'
import type { Rendering } from 'canvas'
import type { Renderer } from '~/workers/canvas/lib/core/rendering/renderer'

import { TAU } from './constants/shape.constants'
import { Shape } from './shape'

export interface DrawCircleOptions {
  stroke?: Rendering.Color
  fill?: Rendering.Color
}

export class Circle extends Shape {
  static #draw<T extends CircleBody>(
    renderer: Renderer<Rendering.Context2D>,
    body: T,
    options: DrawCircleOptions = {},
  ): void {
    const { stroke = 'white', fill = 'tomato' } = options
    const context = renderer.context

    context.beginPath()
    context.arc(body.position.x, body.position.y, body.radius, 0, TAU)
    context.fillStyle = fill
    context.fill()
    context.strokeStyle = stroke
    context.stroke()
  }

  static draw<T extends CircleBody>(
    renderer: Renderer<Rendering.Context2D>,
    options: DrawCircleOptions = {},
  ): (body: T) => void {
    return body => Circle.#draw(renderer, body, options)
  }
}
