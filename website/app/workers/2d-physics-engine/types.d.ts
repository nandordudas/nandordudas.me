declare interface Coordinates2D {
  readonly x: number
  readonly y: number
}

declare type Point2D = readonly [number, number]

declare interface InputBinding {
  action: string
  key: string
}

declare global {
  import type { Debugger } from 'debug'

  declare const debug: Debugger
}

export {}
