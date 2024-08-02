import { Vector } from '../vector'

import { Particle } from './particle.base'

export class Ball extends Particle {
  constructor(
    public override readonly id: string,
    public position = new Vector(100, 100),
    public radius = 4,
    public override color = 'tomato',
  ) {
    super(id, color)
  }

  public override draw(context: OffscreenCanvasRenderingContext2D): void {
    this._drawArc(context, {
      position: this.position,
      radius: this.radius,
      color: this.color,
    })
  }
}
