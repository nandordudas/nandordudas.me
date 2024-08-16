import { OffscreenCanvasScale, createGame } from '../../../lib/physics-engine'

import { EventBus } from './core/events/event-bus'
import { sendMessage } from './helpers'

interface Events extends GenericObject {
  error: ErrorEvent
  ping: void
  setup: OffscreenCanvas
  start: void
  moveUp: void
  moveDown: void
  stop: void
}

const eventBus = EventBus<Events>()

eventBus.on('error', event => debug('error in worker', event))
eventBus.on('ping', () => sendMessage('pong'))
eventBus.on('setup', (canvas) => {
  // Dispose listeners for single-use event handling.
  eventBus.off('setup')

  try {
    const game = createGame({
      offscreenCanvas: canvas,
      scale: OffscreenCanvasScale.Original,
    })

    game.start()
  }
  catch (error) {
    console.error(error)
  }
})

/**
 * {@link https://developer.mozilla.org/en-US/docs/Web/API/Worker/error_event|Worker: message event}
 *
 * @example
 * addEventListener('message', messageEventHandler)
 */
export function messageEventHandler({ data }: MessageEvent<Events>): void {
  eventBus.emit(data.type as keyof Events, data.data)
}

/**
 * {@link https://developer.mozilla.org/en-US/docs/Web/API/Worker/message_event|Worker: error event}
 *
 * @example
 * addEventListener('error', errorHandler)
 */
export function errorHandler(event: ErrorEvent): void {
  eventBus.emit('error', event)
}

debug('loaded')
