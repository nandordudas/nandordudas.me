<script setup lang="ts">
defineOptions({ inheritAttrs: false })

const debug = useDebugger('component:canvas')

const canvas = ref<HTMLCanvasElement | null>(null)
const offscreenCanvas = ref<OffscreenCanvas | null>(null)

defineExpose({ offscreenCanvas })

onMounted(() => {
  debug('has mounted')
})

const disposeWatcher = watch(
  () => canvas.value,
  (canvas) => {
    if (!canvas)
      return

    offscreenCanvas.value = canvas.transferControlToOffscreen()

    disposeWatcher()
  },
  { immediate: true, flush: 'post' },
)
</script>

<template>
  <canvas ref="canvas" width="800" height="450" />
</template>

<style lang="postcss" scoped>
canvas {
  @apply bg-slate-950 rounded-md ring-1 ring-gray-300 w-[800px] h-[450px];
  @apply dark:ring-gray-700;
}
</style>
