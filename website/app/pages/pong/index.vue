<script setup lang="ts">
import PongWorker from '~/workers/pong.worker?worker'

const canvas = ref<HTMLCanvasElement | null>(null)

onMounted(() => {
  assert(isHtmlElement<HTMLCanvasElement>(canvas.value), 'Element must be an HTML element')

  const pongWorker = new PongWorker()

  pongWorker.addEventListener('message', (event) => {
    if (event.data.type === 'initialized')
      pongWorker.postMessage({ type: 'start' })
  })

  const offscreen = canvas.value.transferControlToOffscreen()

  pongWorker.postMessage({
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
</script>

<template>
  <UPage>
    <UPageHero title="Pong" />

    <UPageBody>
      <UPage class="grid place-items-center">
        <canvas
          ref="canvas"
          class="bg-slate-950 rounded-md ring-1 ring-gray-300 dark:ring-gray-700"
          width="800"
          height="450"
        />
      </UPage>
    </UPageBody>
  </UPage>
</template>
