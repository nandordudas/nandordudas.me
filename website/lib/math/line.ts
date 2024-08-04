import type { BodyContract, LineContract } from './type'

import { Vector } from './vector'

export class Line implements LineContract, BodyContract {
  /**
   * @default Vector.zero()
   */
  public readonly velocity: Vector = Vector.zero()

  /**
   * @default Vector.zero()
   */
  public readonly acceleration: Vector = Vector.zero()

  /**
   * @default Vector.zero()
   */
  public readonly position: Vector = Vector.zero()

  /**
   * @default Infinity
   */
  public readonly mass: number = Infinity

  public get length(): number {
    return this.end.subtract(this.start).magnitude()
  }

  constructor(
    public readonly start: Vector,
    public readonly end: Vector,
  ) { }
}
