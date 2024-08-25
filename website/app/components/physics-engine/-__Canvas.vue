<script setup lang="ts">
import createDebug from 'debug'

import EngineWorker from '~/workers/physics-engine/worker?worker'

const debug = createDebug('page:canvas')

const worker = new EngineWorker()
const sendingChannel = new MessageChannel()
const receivingChannel = new MessageChannel()

const sendMessage = createSendMessage(sendingChannel.port2)

const canvas = ref<HTMLCanvasElement | null>(null)

const readiness = shallowReactive({
  canvas: false,
  worker: false,
  sendingChannel: false,
  receivingChannel: false,
  mounted: false,
})

const isReady = computed(() => Object.values(readiness).every(Boolean))

// #region User Input
const { down, up } = useMagicKeys({
  passive: false,
  // Prevent page from scrolling
  onEventFired: event => event.preventDefault(),
})

const direction = computed(() => (down?.value ? 1 : 0) - (up?.value ? 1 : 0))

watchEffect(() => {
  if (direction.value === 1)
    sendMessage({ type: 'userInput', data: { role: 'movement', direction: 'down' } })
  else if (direction.value === -1)
    sendMessage({ type: 'userInput', data: { role: 'movement', direction: 'up' } })
  else
    sendMessage({ type: 'userInput', data: { role: 'movement', direction: 'stop' } })
})
// #endregion

watch(canvas, canvas => readiness.canvas = canvas !== null, { once: true })

// #region Worker
type WorkerType = 'setup'
type WorkerRole = 'pong'
type WorkerTypeRole = `${WorkerType}:${WorkerRole}`

const workerTypeRoleMap: Record<WorkerTypeRole, () => void> = {
  'setup:pong': () => readiness.worker = true,
} as const

worker.addEventListener('message', (event) => {
  const concatTypeRole = `${event.data.type}:${event.data.data.role}` as WorkerTypeRole

  workerTypeRoleMap[concatTypeRole]?.()
})

worker.postMessage({ type: 'setup', data: { role: 'ping' } })
// #endregion

// #region Sending Channel
const sendingChannelTypeRoleMap: Record<WorkerTypeRole, () => void> = {
  'setup:pong': () => readiness.sendingChannel = true,
} as const

sendingChannel.port2.start()
sendingChannel.port2.addEventListener('message', function __(event) {
  const concatTypeRole = `${event.data.type}:${event.data.data.role}` as keyof typeof sendingChannelTypeRoleMap

  sendingChannelTypeRoleMap[concatTypeRole]?.()
  // Remove the event listener after the first message
  sendingChannel.port2.removeEventListener('message', __)
})

worker.postMessage({
  type: 'setup',
  data: { role: 'sending', port: sendingChannel.port1 },
}, [sendingChannel.port1])
// #endregion

// #region Receiving Channel
const receivingChannelTypeRoleMap: Record<WorkerTypeRole, () => void> = {
  'setup:pong': () => readiness.receivingChannel = true,
} as const

receivingChannel.port2.start()
receivingChannel.port2.addEventListener('message', (event) => {
  const concatTypeRole = `${event.data.type}:${event.data.data.role}` as keyof typeof receivingChannelTypeRoleMap

  receivingChannelTypeRoleMap[concatTypeRole]?.()
})

worker.postMessage({
  type: 'setup',
  data: { role: 'receiving', port: receivingChannel.port1 },
}, [receivingChannel.port1])
// #endregion

onMounted(() => {
  readiness.mounted = true

  sendMessage({
    type: 'setup',
    data: { role: 'devicePixelRatio', value: window.devicePixelRatio },
  })

  const offscreenCanvas = canvas.value!.transferControlToOffscreen()

  sendMessage({
    type: 'setup',
    data: { role: 'offscreenCanvas', value: offscreenCanvas },
    transfer: [offscreenCanvas],
  })
})

type MessageChannel = MessagePort | Worker

interface MessageOptions<T extends Record<string, any>, K extends keyof T> {
  type: K
  data?: T[K]
  transfer?: Transferable[]
}

function createSendMessage(channel: MessageChannel) {
  return function sendMessage<T extends Record<string, any>, K extends keyof T>(
    options: MessageOptions<T, K>,
  ): void {
    const { type, data, transfer = [] } = options
    const postMessageOptions: WindowPostMessageOptions = { transfer }

    channel.postMessage({ type, data }, postMessageOptions)
  }
}
</script>

<template>
  <canvas
    ref="canvas"
    class="bg-slate-950 rounded-md ring-1 ring-gray-300 dark:ring-gray-700 w-[800px] h-[450px]"
    width="800"
    height="450"
  />

  <details>
    <summary>Readiness {{ isReady ? '✅' : '⌛' }}</summary>
    <pre><code>{{ readiness }}</code></pre>
  </details>
</template>
