export type Array2D = [number, number]
export interface Coordinates2D { x: number, y: number }
export type Coordinates = Array2D | Coordinates2D
export type NumberOrCoordinates = number | Coordinates
export type CoordinateKey = keyof Coordinates2D
export type RotationDirection = 'clockwise' | 'counterclockwise'
