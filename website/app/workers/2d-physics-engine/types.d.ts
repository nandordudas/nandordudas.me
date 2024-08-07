declare interface Coordinates2D {
  readonly x: number
  readonly y: number
}

declare type Point2D = readonly [number, number]

declare interface InputBinding {
  action: string
  key: string
}
