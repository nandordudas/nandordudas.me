<script setup lang="ts">
import createDebug from 'debug'
import GUI from 'lil-gui'

import EngineWorker from '~/workers/physics-engine/worker?worker'

// https://lil-gui.georgealways.com/
const gui = new GUI()

const guiState = {
  fps: 60,
  ball: {
    position: { x: 0, y: 0 },
    velocity: { x: 0, y: 0 },
    acceleration: { x: 0, y: 0 },
  },
}

gui.add(guiState, 'fps').disable().listen().decimals(0)

const ball = gui.addFolder('Ball') // .close()
const ballPosition = ball.addFolder('Position')
const ballVelocity = ball.addFolder('Velocity')
const ballAcceleration = ball.addFolder('Acceleration')

ballPosition.add(guiState.ball.position, 'x', 0, 800).disable().listen().decimals(0)
ballPosition.add(guiState.ball.position, 'y', 0, 450).disable().listen().decimals(0)
ballVelocity.add(guiState.ball.velocity, 'x').disable().listen().decimals(0)
ballVelocity.add(guiState.ball.velocity, 'y').disable().listen().decimals(0)
ballAcceleration.add(guiState.ball.acceleration, 'x').disable().listen().decimals(0)
ballAcceleration.add(guiState.ball.acceleration, 'y').disable().listen().decimals(0)

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

const direction = computed(() => (down?.value ? 1 : 0) - (up?.value ? 1 : 0))

watchEffect(() => {
  if (direction.value === 1)
    sendMessage('moveDown')
  else if (direction.value === -1)
    sendMessage('moveUp')
  else
    sendMessage('stay')
})

worker.addEventListener('error', (event) => { // 2. set worker error handler
  debug('worker error', event)
})

// eslint-disable-next-line complexity
worker.addEventListener('message', (event) => { // 3. set worker message handler
  const isDebugMessage = (event.data.type as string).startsWith('debug:')

  if (isDebugMessage) {
    const _type = (event.data.type as string).replace('debug:', '')

    if (_type === 'fps')
      guiState.fps = event.data.data

    if (_type === 'ball') {
      guiState.ball.position.x = event.data.data.position.x
      guiState.ball.position.y = event.data.data.position.y
      guiState.ball.velocity.x = event.data.data.velocity.x
      guiState.ball.velocity.y = event.data.data.velocity.y
      guiState.ball.acceleration.x = event.data.data.acceleration.x
      guiState.ball.acceleration.y = event.data.data.acceleration.y
    }
  }

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
  sendMessage('scale', window.devicePixelRatio)
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

  <UButton class="mt-4 hidden" :disabled="!state.isWorkerReady" @click="sendMessage('start')">
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
