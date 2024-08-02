import { Vector } from '../vector'

import { drawLine } from './helpers'
import { Particle } from './particle.base'

export class Paddle extends Particle {
  constructor(
    public override readonly id: string,
    public override start = new Vector(0, 0),
    public override end = new Vector(0, 0),
    public width = 2,
    public override color = 'rgba(255, 99, 71, 0.5)', // tomato
  ) {
    super(id, color, start, end)
  }

  public override draw(context: OffscreenCanvasRenderingContext2D): void {
    drawLine(context, {
      start: new Vector(this.start.x, this.start.y),
      end: new Vector(this.end.x, this.end.y),
      color: this.color,
      lineWidth: this.width,
    })
  }
}
