<script setup lang="ts">
import createDebug from 'debug'

createDebug.enable('page:*')
</script>

<template>
  <UPage>
    <UPageBody>
      <UPage class="grid place-items-center">
        <ClientOnly>
          <PongCanvas />
        </ClientOnly>
      </UPage>
    </UPageBody>
  </UPage>
</template>
