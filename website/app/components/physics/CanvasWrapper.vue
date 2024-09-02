<script setup lang="ts">
import Worker from '~/workers/physics/_worker?worker'
import { SharedArrayIndex } from '~/workers/physics/shared/enum.constants'

defineOptions({
  inheritAttrs: false,
})

const props = defineProps<{
  width: number
  height: number
}>()

const canvas = ref<null | {
  canvas: HTMLCanvasElement
  offscreenCanvas: OffscreenCanvas
}>(null)

const worker = new Worker({ name: 'Physics Worker' })
const sendChannel = new MessageChannel()
const receiveChannel = new MessageChannel()
const bufferSize = 3 * Int32Array.BYTES_PER_ELEMENT
const sharedBuffer = new SharedArrayBuffer(bufferSize)
const sharedArray = new Int32Array(sharedBuffer)
const sendPort = sendChannel.port1
const receivePort = receiveChannel.port1

interface State {
  isReady: boolean
}

const state = reactive<State>({
  isReady: false,
})

if (import.meta.hot)
  // eslint-disable-next-line no-console
  console.clear()

const { x, y } = useMouse({
  target: useParentElement(),
  type: event => (
    event instanceof Touch
      ? null
      : [event.offsetX, event.offsetY]
  ),
})

receivePort.addEventListener('message', (event) => {
  if (event.data.type === 'ready')
    state.isReady = true
})
receivePort.start()

onMounted(() => {
  sendPort.postMessage({ type: 'start' })
})

watch(
  () => ({ x: x.value, y: y.value }),
  updateBuffer,
  { immediate: true },
)

const disposeWatcher = watch(
  () => canvas.value?.offscreenCanvas,
  (value) => {
    if (!value)
      return

    disposeWatcher()

    const transfer: Transferable[] = [
      value,
      sendChannel.port2,
      receiveChannel.port2,
    ]

    worker.postMessage({
      type: 'init',
      data: {
        offscreenCanvas: value,
        sendPort: receiveChannel.port2,
        receivePort: sendChannel.port2,
        buffer: sharedBuffer,
      },
    }, transfer)
  },
  { immediate: true },
)

function updateBuffer(options: { x: number, y: number }): void {
  const { x, y } = options

  Atomics.store(sharedArray, SharedArrayIndex.MouseX, x)
  Atomics.store(sharedArray, SharedArrayIndex.MouseY, y)
  Atomics.notify(sharedArray, SharedArrayIndex.Key)
}
</script>

<template>
  <div class="canvas-wrapper">
    <div v-if="!state.isReady">
      Loading...
    </div>
    <PhysicsCanvas v-show="state.isReady" ref="canvas" v-bind="props" />
  </div>
</template>
