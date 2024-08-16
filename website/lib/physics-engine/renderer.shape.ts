import type { Coordinates2D } from './types'

import { TAU } from './constants'
import { Renderer } from './renderer'

interface DrawPointParams {
  position: Coordinates2D
  radius: number
}

interface DrawLineParams {
  start: Coordinates2D
  end: Coordinates2D
}

interface DrawRectDefaultParams {
  position: Coordinates2D
  width: number
  height: number
}

type DrawRectParams =
  | { isRounded: true, radii: number } & DrawRectDefaultParams
  | { isRounded?: boolean } & DrawRectDefaultParams

export class ShapeRenderer extends Renderer {
  drawPoint({ position, radius }: DrawPointParams): void {
    this.context.beginPath()
    this.context.arc(position.x, position.y, radius, 0, TAU)
    this.context.fill()
  }

  drawLine({ start, end }: DrawLineParams): void {
    this.context.beginPath()
    this.context.moveTo(start.x, start.y)
    this.context.lineTo(end.x, end.y)
    this.context.stroke()
  }

  drawRect({ position, width, height, isRounded = false }: DrawRectParams): void {
    this.context.beginPath()

    if (isRounded)
      this.context.roundRect(position.x, position.y, width, height, 4)
    else
      this.context.rect(position.x, position.y, width, height)

    this.context.fill()
  }
}
