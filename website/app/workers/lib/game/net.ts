import { Vector } from '../vector'

import { Wall } from './wall'

export class Net extends Wall {
  constructor(
    public override readonly id: string,
    public override start = new Vector(0, 0),
    public override end = new Vector(0, 0),
    public override color = 'rgba(255, 255, 255, 0.1)',
    public override readonly segments: number[] = [10, 10],
  ) {
    super(id, start, end, color, segments)
  }
}
