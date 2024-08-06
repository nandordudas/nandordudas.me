import type { Coordinate, CoordinateRange, CoordinateRangeId, Identifiable } from '../types'

import { Vector } from './vector'

export class Line implements CoordinateRange, Identifiable<CoordinateRangeId> {
  readonly id: CoordinateRangeId

  start: Vector
  end: Vector

  get length(): number {
    return this.end.subtract(this.start).magnitude()
  }

  constructor(start: Coordinate, end: Coordinate)
  constructor(start: Vector, end: Vector) {
    this.id = this.createId()
    this.start = start instanceof Vector ? start : new Vector(start)
    this.end = end instanceof Vector ? end : new Vector(end)
  }

  protected createId(): CoordinateRangeId {
    return `${this.constructor.name}-${Math.random().toString().substring(2, 16)}` as CoordinateRangeId
  }
}

export class Wall extends Line {
  unit(): Vector {
    return this.end.subtract(this.start).unit
  }
}

export class Net extends Line {}

export class Paddle extends Wall {}
