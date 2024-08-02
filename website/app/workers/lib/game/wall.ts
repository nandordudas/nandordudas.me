import { Vector } from '../vector'

import { drawLine } from './helpers'
import { Particle } from './particle.base'

export class Wall extends Particle {
  constructor(
    public override readonly id: string,
    public override start = new Vector(0, 0),
    public override end = new Vector(0, 0),
    public override color = 'transparent',
    public readonly segments: number[] = [],
  ) {
    super(id, color, start, end)
  }

  public override draw(context: OffscreenCanvasRenderingContext2D): void {
    drawLine(context, {
      end: this.end,
      start: this.start,
      color: this.color,
      dashed: this.segments,
    })
  }
}
