import { Registry } from '~/workers/physics/lib/registry'

interface RegistryValue {
  offscreenCanvas: null | OffscreenCanvas
  context: null | OffscreenCanvasRenderingContext2D
  sendPort: null | MessagePort
  receivePort: null | MessagePort
  buffer: null | SharedArrayBuffer
  mouse: null | {
    x: number
    y: number
  }
}

type RegistryKey = keyof RegistryValue

export const registry = new Registry<RegistryKey, RegistryValue[RegistryKey]>()

registry.set('offscreenCanvas', null)
registry.set('context', null)
registry.set('sendPort', null)
registry.set('receivePort', null)
registry.set('buffer', null)
registry.set('mouse', null)
