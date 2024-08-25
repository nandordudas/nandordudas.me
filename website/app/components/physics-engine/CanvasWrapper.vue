<script setup lang="ts">
import GUI from 'lil-gui'
import mitt, { type Emitter } from 'mitt'

import Worker from '~/workers/physics-engine/worker?worker'

type OmitErrorEvents<T> = Omit<T, 'error' | 'messageerror'>
type CustomMessageEvent<T> = MessageEvent<{ type: keyof T, data: T[keyof T] }>
type InferEventType<E> = E extends Emitter<infer T> ? OmitErrorEvents<T> : never

type ReadyState = 'loading' | 'complete'
type Movement = 'up' | 'down' | 'stop'

const debug = useDebugger('component:canvas-wrapper')

const guiState = shallowReactive({
  fps: 0,
  followMouse: false,
  setFPS: 60,
})

const gui = new GUI({ title: 'Physics Engine' })
const workerFolder = gui.addFolder('Worker')

workerFolder.add(guiState, 'followMouse').name('Follow mouse')
workerFolder.add(guiState, 'fps', 0, 120).name('FPS').disable().listen().decimals(0)

const emitter = mitt<{
  error: ErrorEvent
  messageerror: MessageEvent
  setup: 'complete'
  // No more events needed
}>()

const receiveEmitter = mitt<{
  messageerror: MessageEvent
  // Add more events if needed
}>()

const guiEmitter = mitt<{
  messageerror: MessageEvent
  update: { fps: number }
  // Add more events if needed
}>()

// emitter.on('*', (title, data) => debug(title, data))
// receiveEmitter.on('*', (title, data) => debug(title, data))
// guiEmitter.on('*', (title, data) => debug(title, data))

const worker = new Worker({ name: 'physics-engine' })
const sendChannel = new MessageChannel()
const receiveChannel = new MessageChannel()
const guiChannel = new MessageChannel()
const receivePort = receiveChannel.port1
const sendPort = sendChannel.port1
const guiPort = guiChannel.port1

const errors = ref<(ErrorEvent | MessageEvent)[]>([])
const readyState = ref<ReadyState>('loading')
const canvas = ref<{ canvas: HTMLCanvasElement | null, offscreenCanvas: OffscreenCanvas | null }>()

const hasError = computed(() => errors.value.length > 0)
const isReady = computed(() => readyState.value === 'complete' && !hasError.value)

emitter.on('error', event => errors.value.push(event))
emitter.on('messageerror', event => errors.value.push(event))
emitter.on('setup', value => readyState.value = value)

receiveEmitter.on('messageerror', event => errors.value.push(event))

guiEmitter.on('messageerror', event => errors.value.push(event))
guiEmitter.on('update', (value) => {
  guiState.fps = value.fps
})

const sendMessageToWorker = createSendMessage(worker)
const sendMessageToChannel = createSendMessage(sendPort)

workerFolder.add(guiState, 'setFPS', 1, 60, 1).name('Set FPS').onChange((value: number) => {
  sendMessageToChannel({ type: 'debug', data: { role: 'setFPS', value } })
})

type WorkerEvent = CustomMessageEvent<InferEventType<typeof emitter>>
type ChannelEvent = CustomMessageEvent<InferEventType<typeof receiveEmitter>>
type GUIEvent = CustomMessageEvent<InferEventType<typeof guiEmitter>>

worker.addEventListener('error', event => emitter.emit('error', event))
worker.addEventListener('messageerror', event => emitter.emit('messageerror', event))
worker.addEventListener('message', (event: WorkerEvent) => emitter.emit(event.data.type, event.data.data))

receivePort.addEventListener('messageerror', event => receiveEmitter.emit('messageerror', event))
receivePort.addEventListener('message', (event: ChannelEvent) => receiveEmitter.emit(event.data.type, event.data.data))

guiPort.addEventListener('messageerror', event => guiEmitter.emit('messageerror', event))
guiPort.addEventListener('message', (event: GUIEvent) => guiEmitter.emit(event.data.type, event.data.data))

receivePort.start()
guiPort.start()

onBeforeUnmount(() => {
  gui.destroy()
})

onMounted(() => {
  debug('has mounted')
})

watch(() => guiState.followMouse, (followMouse) => {
  sendMessageToChannel({ type: 'debug', data: { role: 'followMouse', value: followMouse } })
})

const parentEl = useParentElement()

const { x, y } = useMouse({
  target: parentEl,
  touch: false,
  type: event => event instanceof Touch ? null : [event.offsetX, event.offsetY],
})

watch(() => [x.value, y.value], () => {
  if (!guiState.followMouse)
    return

  const position = { x: x.value, y: y.value } as const

  sendMessageToChannel({ type: 'userInput', data: { role: 'mousemove', position } })
})

const { down, up } = useMagicKeys({
  passive: false,
  onEventFired: event => event.preventDefault(),
})

watch(() => [up?.value, down?.value], () => {
  const movement = getMovement([up?.value, down?.value])

  sendMessageToChannel({ type: 'userInput', data: { role: 'movement', movement } })
})

const stopOffscreenCanvasWatcher = watch(() => canvas.value?.offscreenCanvas, (offscreenCanvas) => {
  if (!offscreenCanvas)
    return

  stopOffscreenCanvasWatcher()

  const sendPort = sendChannel.port2
  const receivePort = receiveChannel.port2
  const guiPort = guiChannel.port2

  sendMessageToWorker({
    type: 'setup',
    data: { offscreenCanvas, sendPort, receivePort, guiPort },
    transfer: [offscreenCanvas, sendPort, receivePort, guiPort],
  })
}, { immediate: true })

function getMovement([up, down]: [boolean | undefined, boolean | undefined]): Movement {
  if (up && down)
    return 'stop'

  if (up)
    return 'up'

  if (down)
    return 'down'

  return 'stop'
}

function getErrorMessage(error: ErrorEvent | MessageEvent): string | any {
  if (error instanceof ErrorEvent)
    return error.message

  return error.data
}
</script>

<template>
  <div v-if="readyState === 'loading'">
    Loading<span>&hellip;</span>
  </div>

  <!-- TODO: need more work -->
  <div v-if="hasError">
    <ul>
      <li v-for="(error, i) in errors" :key="i">
        {{ getErrorMessage(error) }}
      </li>
    </ul>
  </div>

  <PhysicsEngineCanvas v-show="isReady" ref="canvas" :width="800" :height="450" :hide-cursor="guiState.followMouse" />
</template>
