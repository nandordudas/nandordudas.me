import createDebug from 'debug'

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
