import type { Direction } from './lib/game/constants'

import { Game } from './lib/game'

const enum EventName {
  Init = 'init',
  LevelUp = 'levelUp',
  Move = 'move',
  Restart = 'restart',
  Start = 'start',
}

type CustomEvent = typeof EventName[keyof typeof EventName]

interface EventPayloadMap {
  [EventName.Init]: { canvas: OffscreenCanvas, devicePixelRatio: number }
  [EventName.LevelUp]: never
  [EventName.Move]: { direction: Direction }
  [EventName.Restart]: never
  [EventName.Start]: never
}

type MessageEventPayload = {
  [K in keyof EventPayloadMap]: { type: K, value: EventPayloadMap[K] }
}[CustomEvent]

type CustomMessageEvent = MessageEvent<MessageEventPayload>

type EventHandler<K extends CustomEvent> = (event: MessageEvent<Extract<MessageEventPayload, { type: K }>>) => void

// eslint-disable-next-line no-console
const log = console.log.bind(console)

const game = new Game()

const eventMethodMap: { [K in CustomEvent]: EventHandler<K> } = {
  init: (event) => {
    const { canvas, devicePixelRatio } = event.data.value

    // INFO: devicePixelRatio is not supported yet
    game.devicePixelRatio = 1 ?? devicePixelRatio

    game.setContext(canvas.getContext('2d'))

    postMessage({ type: 'initialized' })
  },
  start: () => {
    game.setup()
    game.start()
  },
  restart: game.reset.bind(game),
  move: event => game.setPaddleDirection(event.data.value.direction),
  levelUp: game.upgradeLevel.bind(game),
}

addEventListener('message', (event: CustomMessageEvent): void => {
  log('[WebWorker::PongWorker] <<', event.data)

  try {
    const handler = eventMethodMap[event.data.type]

    assert(isEventHandler(handler), 'Unknown event type')
    handler(event)
  }
  catch (error) {
    // TODO: handle various errors
    console.error(error)
  }
})

function isEventHandler<K extends CustomEvent>(value: unknown): value is EventHandler<K> {
  return typeof value === 'function'
}
