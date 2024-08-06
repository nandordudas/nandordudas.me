<script setup lang="ts">
import createDebug from 'debug'

import GameWorker from '~/workers/game/game.worker?worker'

createDebug.enable('page:*')

const debug = createDebug('page:game')

type EventData =
  | { type: 'event', data: 'connection established' }

function createMessenger(worker: Worker) {
  return (type: string, data?: any, transfer?: Transferable[]): void => {
    const message = { type, data }

    if (transfer && transfer.length > 0)
      return worker.postMessage(message, transfer)

    worker.postMessage(message)
  }
}

const canvas = ref<HTMLCanvasElement | null>(null)
const isConnected = ref(false)
const errors = ref<ErrorEvent[]>([])

const hasError = computed(() => errors.value.length > 0)

onMounted(() => {
  const worker = new GameWorker()
  const sendMessage = createMessenger(worker)

  worker.addEventListener('message', (event: MessageEvent<EventData>) => {
    if (event.data.type === 'event' && event.data.data === 'connection established') {
      debug('connection established')

      isConnected.value = true

      const offscreen = canvas.value!.transferControlToOffscreen()

      sendMessage('start', { canvas: offscreen }, [offscreen])
    }
  })

  worker.addEventListener('error', (event) => {
    errors.value.push(event)
  })

  sendMessage('init')
})
</script>

<template>
  <UPage>
    <UPageBody>
      <UPage class="grid place-items-center">
        <div v-if="hasError">
          <p v-for="(error, i) in errors" :key="i">
            {{ error.message }}
          </p>
        </div>

        <div v-else>
          <span v-if="!isConnected">loading...</span>

          <canvas
            v-show="isConnected"
            ref="canvas"
            class="bg-slate-950 rounded-md ring-1 ring-gray-300 dark:ring-gray-700 w-[800px] h-[450px]"
            width="800"
            height="450"
          />
        </div>
      </UPage>
    </UPageBody>
  </UPage>
</template>
