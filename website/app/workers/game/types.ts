export type Brand<K, T> = K & { __brand: T }

export interface Coordinate {
  readonly x: number
  readonly y: number
}

export interface Identifiable<T extends string = string> {
  readonly id: T
}

export type PositionId = Brand<string, 'Positioned'>

export interface Positioned {
  position: Coordinate
}

export type CoordinateRangeId = Brand<string, 'CoordinateRange'>

export interface CoordinateRange {
  start: Coordinate
  end: Coordinate
}

export type Particle =
  | Positioned
  | CoordinateRange
