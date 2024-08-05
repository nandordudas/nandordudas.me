import { Vector } from './vector'

export class Line implements Contracts.Line, Contracts.Body {
  public readonly id: string

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

  public readonly start: Vector
  public readonly end: Vector

  public get length(): number {
    return this.end.subtract(this.start).magnitude()
  }

  constructor(
    id: string,
    start: Vector | Contracts.Coordinate,
    end: Vector | Contracts.Coordinate,
  ) {
    this.id = id
    this.start = start instanceof Vector ? start : new Vector(start)
    this.end = end instanceof Vector ? end : new Vector(end)
  }
}
