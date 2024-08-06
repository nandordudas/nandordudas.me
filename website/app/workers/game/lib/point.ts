import type { Vector } from './vector'
import type { Identifiable, PositionId, Positioned } from '../types'

export class Point implements Positioned, Identifiable<PositionId> {
  readonly id: PositionId

  constructor(public position: Vector) {
    this.id = this.createId()
  }

  protected createId(): PositionId {
    return `${this.constructor.name}-${Math.random().toString().substring(2, 16)}` as PositionId
  }
}

export class Ball extends Point {
  public static readonly friction = 0.0
  public static readonly acceleration = 1.0
  public static readonly elasticity = 1.0
  public static readonly radius = 4

  constructor(
    override position: Vector,
    public velocity: Vector,
    public acceleration: Vector,
  ) {
    super(position)
  }

  update(deltaTime: number): void {
    this.#reposition(deltaTime)
  }

  // 0.0168 = 60fps
  #reposition(deltaTime: number): void {
    this.acceleration = this.acceleration.unit.multiply(Ball.acceleration)
    this.velocity = this.velocity.add(this.acceleration.multiply(deltaTime))
    this.position = this.position.add(this.velocity.multiply(deltaTime))
  }
}
