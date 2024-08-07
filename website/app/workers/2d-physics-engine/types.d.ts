declare global {
  import type { Debugger } from 'debug'

  declare const debug: Debugger

  interface Coordinates2D {
    readonly x: number
    readonly y: number
  }

   type Point2D = readonly [number, number]

   interface CoordinatesRange {
     start: Coordinates2D
     end: Coordinates2D
   }

   interface Positioned {
     position: Coordinates2D
   }

   interface Rectangular extends Positioned {
     width: number
     height: number
   }

   interface InputBinding {
     action: string
     key: string
   }
}

export {}
