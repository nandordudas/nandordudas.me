<script setup lang="ts">
defineOptions({
  inheritAttrs: false,
})

const props = defineProps<{
  width: number
  height: number
}>()

const canvas = ref<null | HTMLCanvasElement>(null)
const offscreenCanvas = ref<null | OffscreenCanvas>(null)

defineExpose({
  canvas,
  offscreenCanvas,
})

const disposeWatcher = watch(
  () => canvas.value,
  (value) => {
    if (!value)
      return

    disposeWatcher()

    offscreenCanvas.value = value.transferControlToOffscreen()
  },
  { immediate: true, flush: 'post' },
)
</script>

<template>
  <canvas ref="canvas" v-bind="props" />
</template>

<style lang="postcss" scoped>
canvas {
  @apply bg-slate-950 rounded-md ring-1 ring-gray-300 cursor-none;
  @apply dark:ring-gray-700;

  width: v-bind('props.width') + 'px';
  height: v-bind('props.height') + 'px';
}
</style>
