<script setup lang="ts">
import PongWorker from '~/workers/pong.worker?worker'

const LEVEL_UP_TIMEOUT = 30_000

const canvas = ref<HTMLCanvasElement | null>(null)
const pongWorker = ref<Worker | null>(null)

const { up, down } = useMagicKeys()

onMounted(() => {
  assert(isHtmlElement<HTMLCanvasElement>(canvas.value), 'Element must be an HTML element')

  pongWorker.value = new PongWorker()

  pongWorker.value.addEventListener('message', (event) => {
    // eslint-disable-next-line no-console
    console.log('[WebWorker::PongWorker] >>', event.data)

    if (event.data.type === 'initialized') {
      pongWorker.value?.postMessage({ type: 'start' })

      // INFO: refactor paddle speed name and mechanism
      setInterval(() => pongWorker.value?.postMessage({ type: 'levelUp' }), LEVEL_UP_TIMEOUT)
    }
  })

  const offscreen = canvas.value.transferControlToOffscreen()

  pongWorker.value?.postMessage({
    type: 'init',
    value: { canvas: offscreen, devicePixelRatio: window.devicePixelRatio },
  }, [offscreen])
})

function isHtmlElement<T extends HTMLElement>(element: unknown): element is T {
  return element instanceof HTMLElement
}

function assert(condition: boolean, message: string): asserts condition {
  if (!condition)
    throwError(message)
}

function throwError(message: string): never {
  throw new Error(message)
}

function restartGame() {
  pongWorker.value?.postMessage({ type: 'restart' })
}

function move(direction: 'up' | 'down' | 'stop') {
  pongWorker.value?.postMessage({ type: 'move', value: { direction } })
}

// eslint-disable-next-line complexity
watchEffect(() => {
  if (up?.value && down?.value)
    return move('stop')

  if (up?.value)
    return move('up')

  if (down?.value)
    return move('down')

  move('stop')
})
</script>

<template>
  <UPage>
    <UPageHero title="Pong" />

    <UPageBody>
      <UPage class="grid place-items-center">
        <!-- INFO: Width and height recommended to be set by style and by attribute -->
        <canvas
          ref="canvas"
          class="bg-slate-950 rounded-md ring-1 ring-gray-300 dark:ring-gray-700 w-[800px] h-[450px]"
          width="800"
          height="450"
        />

        <UButton class="mt-4" @click="restartGame">
          Restart
        </UButton>
      </UPage>
    </UPageBody>
  </UPage>
</template>
