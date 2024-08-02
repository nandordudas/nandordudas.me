import type { Drawable, Moveable } from './types'
import type { Vector } from './vector'

import { FRICTION, TAU } from './constants'

export class Ball implements Drawable, Moveable {
  constructor(
    public position: Vector,
    public velocity: Vector,
    public acceleration: Vector,
    public radius: number,
    public color: string | CanvasGradient | CanvasPattern,
    public friction: number = FRICTION,
    public elasticity: number = 1.0,
  ) {
    this.velocity = this.velocity.add(this.acceleration).multiply(1 - this.friction)
  }

  move(): void {
    this.reposition()
  }

  reposition(): void {
    this.acceleration = this.acceleration.normalize().multiply(this.acceleration.x)
    this.velocity = this.velocity.add(this.acceleration).multiply(1 - this.friction)
    this.position = this.position.add(this.velocity)
  }

  draw(context: OffscreenCanvasRenderingContext2D): void {
    context.beginPath()
    context.arc(this.position.x, this.position.y, this.radius, 0, TAU)

    context.fillStyle = this.color

    context.fill()
    context.closePath()

    this._drawVelocity(context)
  }

  private _drawVelocity(context: OffscreenCanvasRenderingContext2D, color = 'lime', factor = 10): void {
    context.beginPath()

    context.moveTo(this.position.x, this.position.y)
    context.lineTo(this.position.x + this.velocity.x * factor, this.position.y + this.velocity.y * factor)

    context.strokeStyle = color
    context.lineWidth = 0.5

    context.stroke()
    context.closePath()
  }
}
