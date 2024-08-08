<script setup lang="ts">
import EngineWorker from '2dpe/worker?worker'
import createDebug from 'debug'

const debug = createDebug('page:canvas')
const worker = new EngineWorker() // 1. create worker

const canvas = ref<HTMLCanvasElement | null>(null)

const state = shallowReactive({
  /**
   * Only show the canvas when the worker is ready, until that a placeholder is
   * shown
   */
  isWorkerReady: false,
  score: -1,
})

const { down, up } = useMagicKeys({
  passive: false,
  // Prevent page from scrolling
  onEventFired: event => event.preventDefault(),
})

// TODO: refactor this into a better way
const directionMap = {
  '-1': 'moveUp',
  '1': 'moveDown',
  '0': 'stop',
} as const

watchEffect(() => {
  const mappedKeyStrokes = [down?.value ? 1 : 0, up?.value ? -1 : 0].map(Number)
  const directionKey = mappedKeyStrokes.reduce((acc, current) => acc + current, 0).toString()

  // Sending paddle direction to worker, keys can be hold.
  sendMessage(directionMap[directionKey as keyof typeof directionMap])
})

worker.addEventListener('error', (event) => { // 2. set worker error handler
  debug('worker error', event)
})

worker.addEventListener('message', (event) => { // 3. set worker message handler
  if (event.data.type === 'pong') // 5. worker connection established
    state.isWorkerReady = true

  if (event.data.type === 'gameInit') // 6. game has setup
    state.score = event.data.data.score
})

watch(() => state.isWorkerReady, (isReady) => {
  const offscreenCanvas = canvas.value?.transferControlToOffscreen()

  if (isReady && offscreenCanvas)
    sendMessage('setup', offscreenCanvas, [offscreenCanvas])
}, { once: true })

onMounted(() => {
  sendMessage('ping') // 4. ping worker
})

function sendMessage(type: string, data?: any, transfer?: Transferable[]): void {
  if (transfer && transfer.length > 0)
    worker.postMessage({ type, data }, transfer)
  else
    worker.postMessage({ type, data })
}
</script>

<template>
  <canvas
    v-show="state.isWorkerReady"
    ref="canvas"
    class="bg-slate-950 rounded-md ring-1 ring-gray-300 dark:ring-gray-700 w-[800px] h-[450px]"
    width="800"
    height="450"
  /><!-- Canvas width and height must set by attribute and style for scaling -->

  <UButton class="mt-4" :disabled="state.score < 0 " @click="sendMessage('start')">
    Start
  </UButton>

  <div
    v-if="!state.isWorkerReady"
    class="flex space-x-4 p-8 bg-slate-950 rounded-md ring-1 ring-gray-300 dark:ring-gray-700 w-[800px] h-[450px]"
  >
    <USkeleton class="h-12 w-12" :ui="{ rounded: 'rounded-full' }" />

    <div class="space-y-2">
      <USkeleton class="h-4 w-[250px]" />
      <USkeleton class="h-4 w-[200px]" />
    </div>
  </div>
</template>
