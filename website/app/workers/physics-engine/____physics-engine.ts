import createDebug from 'debug'
import mitt from 'mitt'

createDebug.enable('⚙️:worker:*,⚙️:channel:*')

const debug = createDebug('⚙️:worker:physics-engine')
const debugReceivingChannel = createDebug('⚙️:channel:receiving')

const workerSendMessage = createSendMessage(postMessage)

let context: OffscreenCanvasRenderingContext2D | null = null
let sendingChannel: MessagePort | null = null
// let receivingChannel: MessagePort | null = null
// let sendingChannelSendMessage: ReturnType<typeof createSendMessage> | null = null

const emitter = mitt()

emitter.on('*', (event, data) => {
  debugReceivingChannel('event', event, data)
})

emitter.on('setup', () => sendingChannel?.postMessage({ type: 'setup' }))

workerSendMessage({ type: 'ready' })

export function messageEventHandler(event: MessageEvent): void {
  debug('message', event.data)

  if (event.data.type === 'init') {
    const offscreenCanvas = event.data.offscreenCanvas as OffscreenCanvas
    context = offscreenCanvas.getContext('2d')
    context?.clearRect(0, 0, offscreenCanvas.width, offscreenCanvas.height)
  }

  if (event.data.type === 'sendingChannel') {
    const port = event.data.port as MessagePort

    port.start()
    port.postMessage({ type: 'ready' })
    sendingChannel = port
  }

  if (event.data.type === 'receivingChannel') {
    const port = event.data.port as MessagePort
    // TODO: this is not working more than once
    // sendingChannelSendMessage = createSendMessage(port)

    port.start()
    port.addEventListener('message', (event) => {
      emitter.emit(event.data.type, event.data)
    })
    port.postMessage({ type: 'ready' })
    // receivingChannel = port
  }
}

export function errorHandler(error: ErrorEvent): void {
  debug('error', error)
}
