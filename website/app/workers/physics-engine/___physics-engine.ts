import type { Utils } from 'physics-engine'

import createDebug from 'debug'
import mitt from 'mitt'

createDebug.enable('worker:*')

const debug = createDebug('worker:physics-engine')

interface Channels {
  sendingPort: MessagePort | null
  receivingPort: MessagePort | null
}

const channels: Channels = {
  sendingPort: null,
  receivingPort: null,
}

const receiverEmitter = mitt<{
  userInput: { role: 'movement', direction: number }
  setup:
    | { role: 'devicePixelRatio', value: number }
    | { role: 'offscreenCanvas', value: OffscreenCanvas }
}>()

type Direction = 'up' | 'down' | 'stop'

const state = {
  devicePixelRatio: 1 as number,
  offscreenCanvas: null as OffscreenCanvas | null,
  paddleDirection: 'stop' as Direction,
}

// #region Setup
type SetupRole = 'devicePixelRatio' | 'offscreenCanvas'
type SetupTypeRole = `setup:${SetupRole}`

const setupTypeRoleMap: Record<SetupTypeRole, (...args: any[]) => void> = {
  'setup:devicePixelRatio': (value: number) => state.devicePixelRatio = value,
  'setup:offscreenCanvas': (value: OffscreenCanvas) => state.offscreenCanvas = value,
} as const

receiverEmitter.on('setup', (event) => {
  const typeRole = `setup:${event.role}` as SetupTypeRole

  setupTypeRoleMap[typeRole]?.(event.value)
})
// #endregion

// #region User Input
type UserInputRole = 'movement'
type UserInputTypeRole = `userInput:${UserInputRole}`

const userInputTypeRoleMap: Record<UserInputTypeRole, (...args: any[]) => void> = {
  'userInput:movement': (direction: Direction) => state.paddleDirection = direction,
} as const

receiverEmitter.on('userInput', (event) => {
  const typeRole = `userInput:${event.role}` as UserInputTypeRole

  userInputTypeRoleMap[typeRole]?.(event.direction)

  sendMessage('state', state)
})
// #endregion

// #region Main Emitter
const mainEmitter = mitt<{
  error: ErrorEvent
  setup:
    | { role: 'ping' }
    | { role: 'sending', port: MessagePort }
    | { role: 'receiving', port: MessagePort }
}>()

mainEmitter.on('error', (error) => {
  debug('error-handler %o', error)
})

mainEmitter.on('setup', (event) => {
  if (event.role === 'ping')
    postMessage({ type: 'setup', data: { role: 'pong' } })

  if (event.role === 'receiving') {
    channels.sendingPort = event.port
    channels.sendingPort.postMessage({ type: 'setup', data: { role: 'pong' } })
  }

  if (event.role === 'sending') {
    channels.receivingPort = event.port
    channels.receivingPort.start()
    channels.receivingPort.addEventListener(
      'message',
      (event: MessageEvent) => receiverEmitter.emit(event.data.type, event.data.data),
    )
    channels.receivingPort.postMessage({ type: 'setup', data: { role: 'pong' } })
  }
})
// #endregion

function sendMessage(type: string, data: any): void {
  assert(channels.sendingPort !== null, 'no sending port')

  channels.sendingPort.postMessage({ type, data })
}

function assert(condition: boolean, message: string): asserts condition {
  if (!condition)
    raiseError(message)
}

function raiseError(message: string, ErrorConstructor: Utils.Constructor<Error> = Error): never {
  throw new ErrorConstructor(message)
}

export function messageEventHandler(event: MessageEvent): void {
  mainEmitter.emit(event.data.type, event.data.data)
}

export function errorHandler(error: ErrorEvent): void {
  mainEmitter.emit('error', error)
}
