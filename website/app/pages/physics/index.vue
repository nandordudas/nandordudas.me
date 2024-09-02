<script setup lang="ts">
//
</script>

<template>
  <UPage>
    <UPageBody>
      <UPage class="grid place-items-center">
        <ClientOnly>
          <PhysicsCanvasWrapper :width="800" :height="450" />
        </ClientOnly>
      </UPage>
    </UPageBody>
  </UPage>
</template>
