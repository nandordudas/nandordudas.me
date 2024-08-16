<script setup lang="ts">
import createDebug from 'debug'

createDebug.enable('page:*')
</script>

<template>
  <UPage>
    <UPageBody>
      <UPage class="grid place-items-center">
        <ClientOnly>
          <PhysicsEngineCanvas />
        </ClientOnly>
      </UPage>
    </UPageBody>
  </UPage>
</template>
