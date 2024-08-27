<script setup lang="ts">
const debug = useDebugger('page:canvas')

onMounted(() => {
  debug('has mounted')
})
</script>

<template>
  <UPage>
    <UPageBody>
      <UPage class="grid place-items-center">
        <ClientOnly>
          <CanvasWrapper />
        </ClientOnly>
      </UPage>
    </UPageBody>
  </UPage>
</template>
