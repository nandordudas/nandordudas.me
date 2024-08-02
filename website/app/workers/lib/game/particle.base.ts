import type { DrawableProps } from './type'

import { Vector } from '../vector'

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
}
