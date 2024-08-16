export type Constructor<T> = new (...args: any[]) => T

export type Scalar = number
export type Radian = number

export interface Coordinates2D {
  x: number
  y: number
}

export type Array2D = [number, number]

export type CoordinatesOrScalar = Scalar | Coordinates2D
