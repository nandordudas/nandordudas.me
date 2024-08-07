<script setup lang="ts">
import createDebug from 'debug'

import EngineWorker from '~/workers/2d-physics-engine/worker?worker'

const debug = createDebug('page:canvas')

const canvas = ref<HTMLCanvasElement | null>(null)

const state = shallowReactive({
  isWorkerReady: false,
  score: -1,
})

const worker = new EngineWorker() // 1. create worker

const { down, up } = useMagicKeys({
  passive: false,
  onEventFired: event => event.preventDefault(),
})

const directionMap = {
  '-1': 'moveUp',
  '1': 'moveDown',
  '0': 'stop',
} as const

watchEffect(() => {
  const mappedKeyStrokes = [down?.value ? 1 : 0, up?.value ? -1 : 0]
  const result = mappedKeyStrokes.map(Number).reduce((acc, current) => acc + current, 0).toString()
  const direction = directionMap[result as keyof typeof directionMap]

  sendMessage(direction)
})

worker.addEventListener('error', (event) => { // 2. set worker error handler
  debug('worker error', event)
})

worker.addEventListener('message', (event) => { // 3. set worker message handler
  if (event.data.type === 'pong') // 5. pong and connection established
    state.isWorkerReady = true

  if (event.data.type === 'gameInit')
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
  />

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
