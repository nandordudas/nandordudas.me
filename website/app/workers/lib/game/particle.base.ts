import type { Coordinate, DrawableProps } from './type'

import { Vector } from '../vector'

interface DrawArcProps {
  position: Coordinate
  radius: number
  color: string | CanvasGradient | CanvasPattern
}

interface DrawLineProps {
  start: Coordinate
  end: Coordinate
  color: string | CanvasGradient | CanvasPattern
  lineWidth?: number
  dashed?: number[]
}

export abstract class Particle implements DrawableProps {
  constructor(
    public readonly id: string,
    public color: string = 'white',
    public start = new Vector(0, 0),
    public end = new Vector(0, 0),
  ) {}

  public abstract draw(_context: OffscreenCanvasRenderingContext2D): void

  public hasId(value: string): boolean {
    return this.id === value
  }

  public setPosition(start: Vector, end: Vector): void {
    this.start = start
    this.end = end
  }

  public unit(): Vector {
    return this.end.subtract(this.start).normalize()
  }

  protected _drawArc(context: OffscreenCanvasRenderingContext2D, options: DrawArcProps): void {
    const TAU = Math.PI * 2

    context.beginPath()
    context.arc(options.position.x, options.position.y, options.radius, 0, TAU)

    context.fillStyle = options.color
    context.strokeStyle = 'black'

    context.fill()
    context.stroke()
  }

  protected _drawLine(context: OffscreenCanvasRenderingContext2D, options: DrawLineProps): void {
    context.beginPath()
    context.setLineDash(options.dashed ?? [])
    context.moveTo(options.start.x, options.start.y)
    context.lineTo(options.end.x, options.end.y)

    context.strokeStyle = options.color
    context.lineWidth = options.lineWidth ?? 1

    context.stroke()
  }
}
