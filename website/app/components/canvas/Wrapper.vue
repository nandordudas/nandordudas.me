<script setup lang="ts">
import Worker from '~/workers/canvas/worker?worker'

defineOptions({ inheritAttrs: false })

const debug = useDebugger('component:canvas-wrapper')

const enum SendMessageType {
  Setup = 'setup',
}

const canvasRef = ref<{ offscreenCanvas: OffscreenCanvas }>()

onMounted(() => {
  debug('has mounted')
})

const [sendChannel, receiveChannel] = [new MessageChannel(), new MessageChannel()] as const
const worker = new Worker({ name: 'Canvas Worker' })
const [sendPort, receivePort] = [sendChannel.port1, receiveChannel.port1] as const

receivePort.addEventListener('message', (event) => {
  debug('received message', event.data)
  sendPort.postMessage({ type: event.data.type })
})
receivePort.start()

const disposeWatcher = watch(
  () => canvasRef.value?.offscreenCanvas,
  (offscreenCanvas) => {
    if (!offscreenCanvas)
      return

    sendSetupMessage({ worker, offscreenCanvas })
    disposeWatcher()
  },
  { immediate: true },
)

function sendSetupMessage({
  offscreenCanvas,
  worker,
}: { worker: Worker, offscreenCanvas: OffscreenCanvas }): void {
  const data = {
    offscreenCanvas,
    sendPort: sendChannel.port2,
    receivePort: receiveChannel.port2,
  } as const

  const transfer: Transferable[] = [
    offscreenCanvas,
    sendChannel.port2,
    receiveChannel.port2,
  ]

  worker.postMessage({ type: SendMessageType.Setup, data }, transfer)
}
</script>

<template>
  <div>
    <Canvas ref="canvasRef" />
  </div>
</template>
