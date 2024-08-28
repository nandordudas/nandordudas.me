import type { Rendering, Transferable } from 'canvas'
import type { Body } from '~/workers/canvas/lib/core/physics/body'

import mitt, { type EventType } from 'mitt'

import { BoxBody } from '~/workers/canvas/lib/core/physics/body.box'
import { CircleBody } from '~/workers/canvas/lib/core/physics/body.circle'
import { vector } from '~/workers/canvas/lib/core/physics/math/vector-2d'
import { Box, type DrawBoxOptions } from '~/workers/canvas/lib/core/physics/shape.box'
import { Circle, type DrawCircleOptions } from '~/workers/canvas/lib/core/physics/shape.circle'
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

  const PADDLE_WIDTH = 4
  const PADDLE_HEIGHT = 200

  const world = new World()
  const renderer = new Renderer(state.offscreenCanvas.getContext('2d'))

  const PADDLE_Y = (renderer.context.canvas.height - PADDLE_HEIGHT) / 2

  const leftPaddle = new BoxBody({
    id: 'paddle',
    density: 1,
    width: PADDLE_WIDTH,
    height: PADDLE_HEIGHT,
    position: vector(10, PADDLE_Y),
    isStatic: true,
    restitution: 0.5,
  })

  const rightPaddle = new BoxBody({
    id: 'paddle',
    density: 1,
    width: PADDLE_WIDTH,
    height: PADDLE_HEIGHT,
    position: vector(renderer.context.canvas.width - 10 - PADDLE_WIDTH, PADDLE_Y),
    isStatic: true,
    restitution: 0.5,
  })

  const ball = new CircleBody({
    id: 'ball',
    density: 1,
    radius: 4,
    position: vector(300, 100),
    isStatic: false,
    restitution: 0.5,
  })

  const topLine = new BoxBody({
    id: 'line',
    density: 1,
    width: renderer.context.canvas.width,
    height: 1,
    position: vector(0, 0),
    isStatic: true,
    restitution: 0.5,
  })

  const bottomLine = new BoxBody({
    id: 'line',
    density: 1,
    width: renderer.context.canvas.width,
    height: 1,
    position: vector(0, renderer.context.canvas.height),
    isStatic: true,
    restitution: 0.5,
  })

  world.addBody(topLine)
  world.addBody(bottomLine)
  world.addBody(leftPaddle)
  world.addBody(rightPaddle)
  world.addBody(ball)

  renderer.render((deltaTime) => {
    world.step(deltaTime)
    world.bodies.forEach(drawBody(renderer))
  })
})

const boxOptionMap: Record<string, DrawBoxOptions> = {
  paddle: { fill: 'gray', stroke: 'transparent', radii: 4 },
  line: { fill: 'transparent', stroke: 'transparent' },
} as const

const circleOptionMap: Record<string, DrawCircleOptions> = {
  ball: { fill: 'tomato', stroke: 'transparent' },
} as const

function drawBody(renderer: Renderer<Rendering.Context2D>): (value: Body) => void {
  return (value) => {
    const boxOptions: DrawBoxOptions = boxOptionMap[value.id] ?? { radii: 4 }
    const circleOptions: DrawCircleOptions = circleOptionMap[value.id] ?? {}

    base.doIf(isBoxBody, Box.draw(renderer, boxOptions), value)
    base.doIf(isCircleBody, Circle.draw(renderer, circleOptions), value)
  }
}

function isCircleBody(value: Body): value is CircleBody {
  return value.isInstanceOf(CircleBody)
}

function isBoxBody(value: Body): value is BoxBody {
  return value.isInstanceOf(BoxBody)
}
