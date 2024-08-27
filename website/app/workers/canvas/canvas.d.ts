type __MessageEvent<T = any> = MessageEvent<T>

declare module 'canvas' {
  import type { ShapeType } from './lib/core/physics/body'

  declare namespace Utils {
    type Constructor<T = void> = new (...args: any[]) => T
    type Union<T extends any[]> = T extends [infer First, ...infer Rest] ? (First & Union<Rest>) : unknown

    type MessageEvent<T = any> = __MessageEvent<{
      type: keyof T
      data: T[keyof T]
    }>
  }

  declare namespace Math {
    type OverloadedMethod<T extends Vector2D> = Utils.Union<[
      (scalar: number) => T,
      <K extends T>(vector: K) => T,
    ]>

    export interface Coordinates2D { x: number, y: number }
    export interface ZeroCoordinates2D extends Coordinates2D { x: 0, y: 0 }

    export interface Vector2D {
      get x(): number
      get y(): number
      clone: () => Vector2D
      isEqualTo: <T extends Vector2D>(vector: T) => boolean
      isZero: () => this is Vector2D & ZeroCoordinates2D
      // TODO: Consider to create immutable methods
      add: OverloadedMethod<this>
      subtract: OverloadedMethod<this>
      multiply: OverloadedMethod<this>
      divide: OverloadedMethod<this>
      magnitude: () => number
      normalize: () => this
      dotProduct: <T extends Vector2D>(vector: T) => number
      crossProduct: <T extends Vector2D>(vector: T) => number
      distanceTo: <T extends Vector2D>(vector: T) => number
      [Symbol.iterator]: () => Generator<number>
    }
  }

  declare namespace Rendering {
    type Context2D = OffscreenCanvasRenderingContext2D | CanvasRenderingContext2D
    type RenderCallback = (deltaTime: number) => void
    type Color = string | CanvasGradient | CanvasPattern
    type Radii = number | DOMPointInit | (number | DOMPointInit)[]

    interface RendererContract<T extends Context2D> {
      get context(): T
      render: (callback: FrameRequestCallback) => void
      stop: () => void
    }
  }

  declare namespace Physics {
    type Vertices = [Math.Vector2D, Math.Vector2D, Math.Vector2D, Math.Vector2D]

    interface BodyBase {
      position: MathVector2D
      // velocity: Vector2D
      density: number
      isStatic: boolean
      restitution: number
      shapeType: ShapeType
    }
  }

  export type ReadyState = 'loading' | 'complete' | 'error'

  export interface Transferable {
    sendPort: MessagePort
    receivePort: MessagePort
    offscreenCanvas: OffscreenCanvas
  }
}
