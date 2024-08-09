import createDebug from 'debug'

import { DEGREES_PER_RADIAN } from './constants'

createDebug.enable('worker:*')

const debug = createDebug('worker:2d-physics-engine')

// @ts-expect-error Property 'debug' does not exist on type 'typeof globalThis'.
globalThis.debug = debug

/**
 * {@link https://developer.mozilla.org/en-US/docs/Web/API/Worker/postMessage|Worker: postMessage() method}
 */
export function sendMessage(type: string, data?: any, transfer?: Transferable[]): void {
  if (transfer && transfer.length > 0)
    postMessage({ type, data }, transfer)
  else
    postMessage({ type, data })
}

/**
 * {@link https://wiki.multitheftauto.com/wiki/Math.clamp}
 *
 * Equivalent to `Math.min(Math.max(value, min), max)`
 */
export function clamp(value: number, min: number, max: number) {
  if (value < min)
    return min

  if (value > max)
    return max

  return value
}

export function randomBetween(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1) + min)
}

export function radianToDegree(radian: Radians): Degree {
  return radian * DEGREES_PER_RADIAN as Degree
}

export function degreeToRadian(degree: Degree): Radians {
  return degree / DEGREES_PER_RADIAN as Radians
}

export function isPoint2D(coordinates: Coordinates2D | Point2D): coordinates is Point2D {
  return Array.isArray(coordinates) && coordinates.filter(Number.isFinite).length === 2
}

export function isScalar(value: unknown): value is Scalar {
  return typeof value === 'number' && !Number.isNaN(value)
}
