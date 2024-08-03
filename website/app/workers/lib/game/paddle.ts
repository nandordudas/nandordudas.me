import { Vector } from '../vector'

import { Particle } from './particle.base'

export class Paddle extends Particle {
  get length(): number {
    return this.end.y - this.start.y
  }

  // eslint-disable-next-line complexity
  constructor(
    public override readonly id: string,
    public override start = new Vector(0, 0),
    public override end = new Vector(0, 0),
    public velocity = new Vector(0, 0),
    public width = 2,
    public override color = 'rgba(255, 99, 71, 0.5)', // tomato
  ) {
    super(id, color, start, end)
  }

  public override draw(context: OffscreenCanvasRenderingContext2D): void {
    this._drawLine(context, {
      start: new Vector(this.start.x, this.start.y),
      end: new Vector(this.end.x, this.end.y),
      color: this.color,
      lineWidth: this.width,
    })
  }

  public move(dt: number): void {
    this._reposition(dt)
  }

  private _reposition(_dt: number): void {
    this.start = this.start.add(this.velocity)
    this.end = this.end.add(this.velocity)
  }
}
