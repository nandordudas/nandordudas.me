export interface Vector2D {
  x: number
  y: number
}

export class Vector implements Vector2D {
  static create(x: number, y: number): Vector {
    return new Vector(x, y)
  }

  static dotProduct(v1: Vector, v2: Vector): number {
    return v1.x * v2.x + v1.y * v2.y
  }

  static crossProduct(v1: Vector, v2: Vector): number {
    return v1.x * v2.y - v1.y * v2.x
  }

  static distance(v1: Vector, v2: Vector): number {
    return v1.subtract(v2).magnitude()
  }

  constructor(public x: number, public y: number) {}

  add(v: Vector2D): Vector {
    return new Vector(this.x + v.x, this.y + v.y)
  }

  subtract(v: Vector2D): Vector {
    return new Vector(this.x - v.x, this.y - v.y)
  }

  multiply(scalar: number): Vector {
    return new Vector(this.x * scalar, this.y * scalar)
  }

  dot(v: Vector): number {
    return this.x * v.x + this.y * v.y
  }

  magnitudeSquared(): number {
    return this.x * this.x + this.y * this.y
  }

  magnitude(): number {
    return Math.sqrt(this.magnitudeSquared())
  }

  normalize(): Vector {
    const mag = this.magnitude()

    return mag > 0 ? this.multiply(1 / mag) : new Vector(0, 0)
  }

  normal(): Vector {
    return new Vector(-this.y, this.x)
  }
}
