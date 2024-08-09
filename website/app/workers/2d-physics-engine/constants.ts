import { Vector2D } from './core/physics/vector-2d'

export const enum Direction {
  Up = -1,
  Stop = 0,
  Down = 1,
}

/**
 * @default 2 * Math.PI = 6.283185307179586
 */
export const TAU = 2 * Math.PI

/**
 * @default TAU / 360 = 0.017453292519943295
 */
export const DEGREES_PER_RADIAN = 360 / TAU

export const REAL_WORLD_GRAVITY_VALUE = 9.81

/**
 * @readonly
 */
export const REAL_WORLD_GRAVITY = Vector2D.create(0, REAL_WORLD_GRAVITY_VALUE)
