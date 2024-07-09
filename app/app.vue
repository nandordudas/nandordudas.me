<script setup lang="ts">
useServerHead({
  htmlAttrs: { lang: 'en' },
})
</script>

<template>
  <div>
    <NuxtRouteAnnouncer />
    <NuxtLoadingIndicator />

    <NuxtPage :page-key="route => route.fullPath" />
  </div>
</template>
