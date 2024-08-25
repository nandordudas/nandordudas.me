<script setup lang="ts">
const debug = useDebugger('page:physics-engine')

onMounted(() => {
  debug('has mounted')
})
</script>

<template>
  <UPage>
    <UPageBody>
      <UPage class="grid place-items-center">
        <ClientOnly>
          <!-- CanvasWrapper.client.vue could be another way -->
          <PhysicsEngineCanvasWrapper />
        </ClientOnly>
      </UPage>
    </UPageBody>
  </UPage>
</template>
