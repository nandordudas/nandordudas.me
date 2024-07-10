<script setup lang="ts">
const iconHref = import.meta.dev ? '/favicon-dev.svg' : '/favicon.svg'

useServerSeoMeta({
  robots: 'index, follow',
})

useHead({
  htmlAttrs: { lang: 'en' },
  link: [
    { rel: 'icon', type: 'image/svg+xml', href: iconHref },
  ],
})
</script>

<template>
  <div>
    <NuxtRouteAnnouncer />
    <NuxtLoadingIndicator />

    <NuxtPage :page-key="route => route.fullPath" />
  </div>
</template>

<style lang="css">
.page-enter-active,
.page-leave-active {
  transition: all 0.2s;
}

.page-enter-from,
.page-leave-to {
  opacity: 0;
  transform: translateY(1rem);
  filter: blur(0.2rem);
}
</style>
