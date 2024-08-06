import createDebug from 'debug'

import { PhysicsEngine } from './physics-engine'
import { Renderer } from './renderer'

const debug = createDebug('worker:game')

type InitHandler = () => void
type StartHandler = (data: { canvas: OffscreenCanvas }) => void

interface HandlerMap {
  init: InitHandler
  start: StartHandler
}

const handlers: HandlerMap = {
  init: () => {
    debug('init')
    postMessage({ type: 'event', data: 'connection established' })
  },
  start: (data) => {
    debug('start')

    const context = data.canvas.getContext('2d', { alpha: true })

    if (context === null)
      return debug('context is null')

    const renderer = new Renderer(context)
    const physicsEngine = new PhysicsEngine(renderer)

    renderer.render(physicsEngine.update)
  },
}

type EventType = keyof HandlerMap

type EventDataMap = {
  [K in EventType]: Parameters<HandlerMap[K]>[0] extends undefined
    ? { type: K, data: any }
    : { type: K, data: Parameters<HandlerMap[K]>[0] }
}

type EventData = EventDataMap[EventType]

/**
 * @throws Will throw {@link Error} if `event.data.type` is unknown.
 */
export function messageEventHandler(event: MessageEvent<EventData>) {
  const handler = handlers[event.data.type] ?? raise('Unknown event type')

  handler(event.data.data)
}

function raise(message: string): never {
  throw new Error(message)
}
