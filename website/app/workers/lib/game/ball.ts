import type { MoveableProps } from './type'

import { Vector } from '../vector'

import { Particle } from './particle.base'

export class Ball extends Particle implements MoveableProps {
  public readonly elasticity: number = 1.0
  public readonly friction: number = 0.0

  constructor(
    public override readonly id: string,
    public position = new Vector(100, 100),
    public velocity = new Vector(0, 0),
    public radius = 4,
    public override color = 'tomato',
  ) {
    super(id, color)
  }

  public move(dt: number): void {
    this._reposition(dt)
  }

  public override draw(context: OffscreenCanvasRenderingContext2D): void {
    this._drawArc(context, {
      position: this.position,
      radius: this.radius,
      color: this.color,
    })
  }

  private _reposition(_dt: number): void {
    this.position = this.position.add(this.velocity) // .multiply(dt)
  }
}
