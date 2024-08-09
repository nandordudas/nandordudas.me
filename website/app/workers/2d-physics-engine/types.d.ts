declare global {
  import type { Debugger } from 'debug'

  /**
   * Temporary used, it will be removed in the future. It follows the pattern as
   * `worker:2d-physics-engine`, is enabled by default.
   */
  declare const debug: Debugger

  type Brand<T, B> = T & { __brand: B }

  type Constructor<T> = new (...args: any[]) => T

  type Intersection<T extends any[]> = T extends [infer First, ...infer Rest]
    ? First & Intersection<Rest>
    : unknown

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

  type Point2D = [number, number]

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

  type Scalar = Brand<number, 'scalar'>
  type Radians = Brand<number, 'radians'>
  type Degree = Brand<number, 'degree'>
}

export { }
