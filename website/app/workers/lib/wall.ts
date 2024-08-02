import type { Drawable, Moveable } from './types'

import { Vector } from './vector'

export class Wall implements Drawable, Moveable {
  public position: Vector = new Vector(0, 0)
  public velocity: Vector = new Vector(0, 0)
  public acceleration: Vector = new Vector(0, 0)
  public friction: number = 0.0

  constructor(
    public start: Vector,
    public end: Vector,
    public color: string | CanvasGradient | CanvasPattern = 'white',
    public readonly id: string = '',
  ) {}

  draw(context: OffscreenCanvasRenderingContext2D): void {
    context.beginPath()
    context.moveTo(this.start.x, this.start.y)
    context.lineTo(this.end.x, this.end.y)

    context.strokeStyle = this.color

    context.stroke()
    context.closePath()
  }

  move(): void {}

  reposition(): void {}

  unit(): Vector {
    return this.end.subtract(this.start).normalize()
  }
}
