import createDebug from 'debug'

createDebug.enable('worker:*')

const debug = createDebug('worker:2d-physics-engine')

// @ts-expect-error Property 'debug' does not exist on type 'typeof globalThis'.
globalThis.debug = debug

export function sendMessage(type: string, data?: any, transfer?: Transferable[]): void {
  if (transfer && transfer.length > 0)
    postMessage({ type, data }, transfer)
  else
    postMessage({ type, data })
}
