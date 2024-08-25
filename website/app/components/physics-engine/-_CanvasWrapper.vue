<script setup lang="ts">
import mitt from 'mitt'

import Worker from '~/workers/physics-engine/worker?worker'

const debug = useDebugger('component:canvas-wrapper')
const debugWorker = useDebugger('worker:physics-engine')
const debugSendingChannel = useDebugger('channel:sending')
const debugReceivingChannel = useDebugger('channel:receiving')

const component = ref<{
  canvas: HTMLCanvasElement | null
  offscreenCanvas: OffscreenCanvas | null
}>()

const readiness = shallowReactive({
  canvas: component.value?.canvas !== null,
  worker: false,
  sendingChannel: false,
  receivingChannel: false,
  mounted: false,
})

const isReady = computed(() => Object.values(readiness).every(Boolean))

const emitter = mitt()
const sendingChannel = new MessageChannel()
const receivingChannel = new MessageChannel()
const worker = new Worker({ name: 'Physics Engine Worker' })

const sendindChannelMessage = createSendMessage(sendingChannel.port1)
const sendMessageToWorker = createSendMessage(worker)

emitter.on('*', (event, ...args) => debugReceivingChannel('message', event, ...args))
emitter.on('ready', () => readiness.receivingChannel = true)
emitter.on('setup', () => debugReceivingChannel('setup'))

worker.addEventListener('message', (event) => {
  debugWorker('message', event.data)

  if (event.data.type === 'ready') {
    readiness.worker = true

    // Channels are swapped, this is not a mistake.
    worker.postMessage({
      type: 'receivingChannel',
      port: sendingChannel.port2,
    }, [sendingChannel.port2])

    worker.postMessage({
      type: 'sendingChannel',
      port: receivingChannel.port2,
    }, [receivingChannel.port2])
  }
})

sendingChannel.port1.start()
receivingChannel.port1.start()

sendingChannel.port1.addEventListener('message', function _(event) {
  debugSendingChannel('message', event.data)

  if (event.data.type === 'ready') {
    // The `once` option is not working properly.
    sendingChannel.port1.removeEventListener('message', _)
    readiness.sendingChannel = true
  }
})

receivingChannel.port1.addEventListener('message', (event) => {
  emitter.emit(event.data.type, event.data)
})

const stopOffscreenCanvasWatcher = watch(
  () => component.value?.offscreenCanvas,
  (offscreenCanvas) => {
    if (!offscreenCanvas)
      return

    worker.postMessage({ type: 'init', offscreenCanvas }, [offscreenCanvas])
    stopOffscreenCanvasWatcher()
  },
  { immediate: true },
)

onMounted(() => {
  debug('has mounted')
  readiness.mounted = true
  sendindChannelMessage({ type: 'setup', data: { role: 'ping' } })
  sendMessageToWorker({ type: 'setup', data: { role: 'ping' } })
})
</script>

<template>
  <div v-if="!isReady">
    Loading <span>&hellip;</span> {{ readiness }}
  </div>

  <PhysicsEngineCanvas v-show="isReady" ref="component" :width="800" :height="450" />
</template>
