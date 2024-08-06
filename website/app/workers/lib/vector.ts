import type { Coordinate } from './game/type'

export class Vector implements Coordinate {
  public static new(x: number, y: number): Vector {
    return new Vector(x, y)
  }

  public static dotProduct(v1: Coordinate, v2: Coordinate): number {
    return v1.x * v2.x + v1.y * v2.y
  }

  public static crossProduct(v1: Coordinate, v2: Coordinate): number {
    return v1.x * v2.y - v1.y * v2.x
  }

  public static distance(v1: Vector, v2: Coordinate): number {
    return v1.subtract(v2).magnitude()
  }

  constructor(
    public x: number,
    public y: number,
  ) {}

  public add(v: Coordinate): Vector {
    return new Vector(this.x + v.x, this.y + v.y)
  }

  public subtract(v: Coordinate): Vector {
    return new Vector(this.x - v.x, this.y - v.y)
  }

  public multiply(scalar: number): Vector {
    return new Vector(this.x * scalar, this.y * scalar)
  }

  public dot(v: Coordinate): number {
    return this.x * v.x + this.y * v.y
  }

  public magnitudeSquared(): number {
    return this.x * this.x + this.y * this.y
  }

  public magnitude(): number {
    return Math.sqrt(this.magnitudeSquared())
  }

  public normalize(): Vector {
    const mag = this.magnitude()

    return mag > 0 ? this.multiply(1 / mag) : new Vector(0, 0)
  }

  public normal(): Vector {
    return new Vector(-this.y, this.x)
  }

  public clone(): Vector {
    return new Vector(this.x, this.y)
  }

  public toJSON(): string {
    return `${this.constructor.name}(${this.x},${this.y})`
  }
}
