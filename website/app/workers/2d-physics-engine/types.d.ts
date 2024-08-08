declare global {
  import type { Debugger } from 'debug'

  /**
   * Temporary used, it will be removed in the future. It follows the pattern as
   * `worker:2d-physics-engine`, is enabled by default.
   */
  declare const debug: Debugger

  interface Coordinates2D {
    /**
     * @readonly
     */
    readonly x: number

    /**
     * @readonly
     */
    readonly y: number
  }

  /**
   * @readonly
   */
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

  type GenericObject<T = unknown> = Record<string | symbol, T>
}

export { }
