declare module 'physics-engine' {
  declare namespace Utils {
    export type Constructor<T = void> = new (...args: any[]) => T
    export type Union<T extends any[]> = T extends [infer First, ...infer Rest] ? (First & Union<Rest>) : unknown
    export type Prettify<T> = { [K in keyof T]: T[K] } & unknown
    export type PickArray<T, K extends readonly string[]> = Pick<T, K[number]>

    export type InterfaceWithoutMethods<T> = {
      [K in keyof T as T[K] extends (...args: any[]) => any ? never : K]: T[K]
    }

    /* export type IsProp<T, K extends keyof T> = T[K] extends (...args: any[]) => any
      ? never
      : K

    export type ExtractProps<T extends { prototype: unknown }> = {
      [k in keyof T['prototype']as IsProp<T['prototype'], k>]: T['prototype'][k]
    } */
  }

  export type Color = string | CanvasGradient | CanvasPattern
  export type Radii = number | DOMPointInit | (number | DOMPointInit)[]

  declare namespace Math {
    type OverloadedMethod<T extends Vector2D> = Utils.Union<[
      (scalar: number) => T,
      <K extends T>(vector: K) => T,
    ]>

    export interface Coordinates2D { x: number, y: number }
    export interface ZeroCoordinates2D extends Coordinates2D { x: 0, y: 0 }

    export interface Vector2D extends Coordinates2D {
      /*  */
      clone: () => Vector2D
      isZero: () => this is Vector2D & ZeroCoordinates2D
      add: OverloadedMethod<this>
      subtract: OverloadedMethod<this>
      multiply: OverloadedMethod<this>
      divide: OverloadedMethod<this>
      magnitudeSquared: () => number
      /**
       * @alias length
       */
      magnitude: () => number
      normalize: () => this
      dotProduct: <T extends Vector2D>(vector: T) => number
      crossProduct: <T extends Vector2D>(vector: T) => number
      distanceToSquared: <T extends Vector2D>(vector: T) => number
      distanceTo: <T extends Vector2D>(vector: T) => number
      /**
       * The `toArray` method does not need to be implemented.
       */
      [Symbol.iterator]: () => Generator<number>
    }
  }

  declare namespace Rendering {
    export type Context2D = OffscreenCanvasRenderingContext2D | CanvasRenderingContext2D

    export interface RendererContract<T extends Context2D> {
      context: T
      render: (callback: FrameRequestCallback) => void
      stop: () => void
    }
  }

  declare namespace PhysicsEngine {
    export interface PhysicsBodyContract {
      position: Math.Vector2D
      velocity: Math.Vector2D
      acceleration: Math.Vector2D
      mass: number
      inverseMass: number
      restitution: number
      isInstanceOf: <T extends PhysicsEngine>(type: Utils.Constructor<T>) => this is T
      update: (deltaTime: number) => void
      applyForce: (force: Math.Vector2D) => void
    }

    export interface RendererContract {
      context: OffscreenCanvasRenderingContext2D
      render: (callback: FrameRequestCallback) => void
    }

    export interface DrawableContract {
      display: (context: OffscreenCanvasRenderingContext2D, body: PhysicsBodyContract) => void
    }

    export interface ShapeContract extends DrawableContract {
      position: Math.Vector2D
      width: number
      height: number
    }
  }
}
