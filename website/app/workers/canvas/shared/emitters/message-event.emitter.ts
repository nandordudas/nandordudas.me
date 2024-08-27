import type { Transferable } from 'canvas'

import mitt, { type EventType } from 'mitt'

import { BoxBody } from '~/workers/canvas/lib/core/physics/body.box'
import { CircleBody } from '~/workers/canvas/lib/core/physics/body.circle'
import { vector } from '~/workers/canvas/lib/core/physics/math/vector-2d'
import { Box } from '~/workers/canvas/lib/core/physics/shape.box'
import { Circle } from '~/workers/canvas/lib/core/physics/shape.circle'
import { World } from '~/workers/canvas/lib/core/physics/world'
import { Renderer } from '~/workers/canvas/lib/core/rendering/renderer'
import { DebugNamespace } from '~/workers/canvas/shared/constants/enums.constants'
import { useState } from '~/workers/canvas/shared/constants/state'
import * as base from '~/workers/canvas/utils/helpers/base'

export interface MessageTypes extends Record<EventType, unknown> {
  setup: Transferable
}

const _debug = useDebugger(DebugNamespace.MessageEventHandler)
export const emitter = mitt<MessageTypes>()

const state = useState()

emitter.on('setup', (data) => {
  emitter.off('setup')

  state.offscreenCanvas = data.offscreenCanvas
  state.sendPort = data.receivePort
  state.receivePort = data.sendPort

  base.assertIsNotNull(state.offscreenCanvas !== null, 'Failed to get offscreen canvas')
  base.assertIsNotNull(state.sendPort !== null, 'Failed to get send port')
  base.assertIsNotNull(state.receivePort !== null, 'Failed to get receive port')

  base.listenToMessagePort((event) => {
    base.doIf(event.data.type === 'ready', () => state.readyState = 'complete')
  }, state.receivePort)

  state.sendPort.postMessage({ type: 'ready' })

  const box = new BoxBody({
    density: 1,
    width: 100,
    height: 100,
    position: vector(100, 100),
    isStatic: false,
    restitution: 0.5,
  })

  const circle = new CircleBody({
    density: 1,
    radius: 50,
    position: vector(300, 100),
    isStatic: false,
    restitution: 0.5,
  })

  const world = new World()
  const renderer = new Renderer(state.offscreenCanvas.getContext('2d'))

  world.addBody(box)
  world.addBody(circle)

  renderer.render((deltaTime) => {
    world.step(deltaTime)

    for (const body of world.bodies) {
      if (body.isInstanceOf(BoxBody))
        Box.draw(renderer, body, { radii: 4 })

      if (body.isInstanceOf(CircleBody))
        Circle.draw(renderer, body)
    }
  })
})
