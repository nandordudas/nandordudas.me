export class Vector2D implements Coordinates2D {
  static normal(): Vector2D { return Vector2D.zero() }
  static zero(): Vector2D { return Vector2D.zero() }
  static distance(): number { return 0 }
  static dotProduct(): number { return 0 }
  static crossProduct(): number { return 0 }
  static randomize(): Vector2D { return Vector2D.zero() }
  static random(_x: number, _y: number): Vector2D { return Vector2D.zero() }
  /*  */
  static create(x: number, y: number): Vector2D
  static create(coordinates: Coordinates2D): Vector2D
  static create(coordinates: Point2D): Vector2D
  static create(xOrCoordinates: number | Coordinates2D | Point2D, y?: number): Vector2D {
    if (typeof xOrCoordinates === 'number')
      return new Vector2D(xOrCoordinates, y!)
    else if (Vector2D.#isPoint2D(xOrCoordinates))
      return Vector2D.fromArray(xOrCoordinates)
    else
      return Vector2D.fromObject(xOrCoordinates)
  }

  static fromObject({ x, y }: Coordinates2D): Vector2D { return new Vector2D(x, y) }
  static fromArray([x, y]: Point2D): Vector2D { return new Vector2D(x, y) }

  static fromAngle(angle: number, magnitude: number): Vector2D {
    return new Vector2D(magnitude * Math.cos(angle), magnitude * Math.sin(angle))
  }

  static #isPoint2D(coordinates: Coordinates2D | Point2D): coordinates is Point2D {
    return Array.isArray(coordinates) && coordinates.filter(Number.isFinite).length === 2
  }

  get length() { return 0 }
  get unit() { return Vector2D.zero() }
  get isZero() { return false }

  private constructor(
    public readonly x: number,
    public readonly y: number,
  ) { }

  add(_vector: Vector2D): Vector2D { return Vector2D.zero() }
  subtract(_vector: Vector2D): Vector2D { return Vector2D.zero() }
  multiply(_vector: Vector2D): Vector2D { return Vector2D.zero() }
  divide(_vector: Vector2D): Vector2D { return Vector2D.zero() }
  /*  */
  addScalar(_scalar: number): Vector2D { return Vector2D.zero() }
  subtractScalar(_scalar: number): Vector2D { return Vector2D.zero() }
  multiplyScalar(_scalar: number): Vector2D { return Vector2D.zero() }
  divideScalar(_scalar: number): Vector2D { return Vector2D.zero() }
  /*  */
  magnitudeSquared(): number { return 0 }
  magnitude(): number { return 0 }
  slope(): number { return 0 }
  angle(): number { return 0 }
  /*  */
  normalize(): Vector2D { return Vector2D.zero() }
  clone(): Vector2D { return Vector2D.zero() }
  /*  */
  toString(): string { return '' }
  toArray(): Point2D { return [0, 0] }
  toObject(): Coordinates2D { return { x: 0, y: 0 } }
  /*  */
  swap(): this { return this }
  invertX(): this { return this }
  invertY(): this { return this }
  invert(): this { return this }
  rotate(): this { return this }
}
