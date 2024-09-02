import type { Point2D } from 'physics'

import { receivePortEmitter } from './receive-port.emitter'

import { Vector2D } from '~/workers/physics/lib/core/math/vector-2d'
import { Renderer } from '~/workers/physics/lib/core/renderer'
import { EventEmitter } from '~/workers/physics/lib/event-emitter'
import { registry } from '~/workers/physics/registry'
import { monitorChanges } from '~/workers/physics/utils/helpers/monitor-changes.helper'

interface MainEvents {
  error: ErrorEvent
  init: {
    offscreenCanvas: OffscreenCanvas
    sendPort: MessagePort
    receivePort: MessagePort
    buffer: SharedArrayBuffer
  }
  mousemove: Point2D
}

export type MainMessageEvent = MessageEvent<{
  type: keyof MainEvents
  data: MainEvents[keyof MainEvents]
}>

export const mainEmitter = new EventEmitter<MainEvents>()

receivePortEmitter.on('start', () => {
  const context = registry.get('context') as OffscreenCanvasRenderingContext2D

  const renderer = new Renderer({ context })

  renderer.render((_deltaTime) => {
    const mouse = registry.get('mouse') as Point2D
    const mousePointer = Vector2D.create(mouse?.x ?? 0, mouse?.y ?? 0)

    Renderer.drawPoint(mousePointer, {
      context,
      radius: 1.0,
      fill: 'tomato',
    })

    Renderer.drawPoint(mousePointer, {
      context,
      radius: 8.0,
      stroke: 'tomato',
    })
  })
})

mainEmitter.once('init', (data) => {
  registry.set('offscreenCanvas', data.offscreenCanvas)
  registry.set('context', data.offscreenCanvas.getContext('2d'))

  registry.set('sendPort', data.sendPort)
  registry.set('receivePort', data.receivePort)
  registry.set('buffer', data.buffer)

  const receivePort = registry.get('receivePort') as MessagePort
  const sendPort = registry.get('sendPort') as MessagePort
  const buffer = registry.get('buffer') as SharedArrayBuffer

  receivePort.addEventListener('message', (event) => {
    receivePortEmitter.emit(event.data.type, event.data.data)
  })
  receivePort.start()
  sendPort.postMessage({ type: 'ready' })

  monitorChanges(new Int32Array(buffer))
})

mainEmitter.on('mousemove', (data) => {
  registry.set('mouse', data)
})
