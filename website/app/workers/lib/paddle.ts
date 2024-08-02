import type { Ball } from './ball'

import { Vector } from './vector'
import { Wall } from './wall'

export class Paddle extends Wall {
  public speed: number = 4
  public readonly width: number = 1
  private targetY: number = 0
  private isActive: boolean = false
  private centerY: number

  get height(): number {
    return this.end.y - this.start.y
  }

  constructor(...params: ConstructorParameters<typeof Wall>) {
    super(...params)

    this.centerY = (this.start.y + this.end.y) / 2
    this.targetY = this.centerY - (this.end.y - this.start.y) / 2
  }

  override move(): void {
    if (this.id === 'left')
      return

    this.reposition()
  }

  override reposition(): void {
    const speed = this.speed
    const direction = Math.sign(this.targetY - this.start.y)
    const distance = Math.abs(this.targetY - this.start.y)

    if (distance > speed) {
      const movement = direction * speed

      this.start = this.start.add(new Vector(0, movement))
      this.end = this.end.add(new Vector(0, movement))
    }
    else {
      const movement = this.targetY - this.start.y

      this.start = this.start.add(new Vector(0, movement))
      this.end = this.end.add(new Vector(0, movement))
    }
  }

  followBall(ball: Ball, context: OffscreenCanvasRenderingContext2D): void {
    if (!this.isActive || this.id === 'left')
      return

    const paddleX = this.end.x
    const offset = Math.abs(paddleX - ball.position.x)

    if (Math.abs(ball.velocity.x) < 0.001)
      return

    const ballPosition = ball.position.add(new Vector(0, ball.radius))
    let arrivalPoint = ballPosition.y + (offset - (ballPosition.x - paddleX)) * (ball.velocity.y / ball.velocity.x)

    // Adjust for bounces
    arrivalPoint = context.canvas.height - Math.abs(
      Math.abs(arrivalPoint) % (context.canvas.height * 2) - context.canvas.height,
    )

    // Clamp the arrival point to keep the paddle within the canvas
    const paddleHeight = this.end.y - this.start.y
    const halfPaddleHeight = paddleHeight / 2

    // Set the target to center the paddle on the arrival point
    this.targetY = Math.max(
      halfPaddleHeight,
      Math.min(context.canvas.height - halfPaddleHeight, arrivalPoint),
    ) - halfPaddleHeight
  }

  setActive(active: boolean): void {
    this.isActive = active

    if (!active)
      this.targetY = this.centerY - (this.end.y - this.start.y) / 2
  }
}
