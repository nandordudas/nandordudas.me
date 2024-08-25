<script setup lang="ts">
import type { StyleValue } from 'vue'

defineOptions({ inheritAttrs: false })

const props = defineProps<{
  width: number
  height: number
  hideCursor: boolean
}>()

const debug = useDebugger('component:canvas')

const style: StyleValue = {
  '--width': `${props.width}px`,
  '--height': `${props.height}px`,
}

const offscreenCanvas = ref<OffscreenCanvas | null>(null)
const canvas = ref<HTMLCanvasElement | null>(null)

const stopCanvasWatcher = watch(
  () => canvas.value,
  (canvas) => {
    if (!canvas)
      return

    stopCanvasWatcher()

    offscreenCanvas.value = canvas.transferControlToOffscreen()
  },
  { immediate: true, flush: 'post' },
)

defineExpose({ canvas, offscreenCanvas })

onMounted(() => {
  debug('has mounted')
})
</script>

<template>
  <canvas ref="canvas" :width :height :style :class="{ 'cursor-none': hideCursor }" />
</template>

<style scoped lang="postcss">
canvas {
  @apply bg-slate-950 rounded-md ring-1 ring-gray-300 w-[var(--width)] h-[var(--height)];
  @apply dark:ring-gray-700;
}
</style>
