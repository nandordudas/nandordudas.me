<script setup lang="ts">
const iconHref = import.meta.dev ? '/favicon-dev.svg' : '/favicon.svg'

const { data: navigation } = await useAsyncData('navigation', () => fetchContentNavigation())

const { locale } = useI18n()

const { data: files } = useLazyFetch<CustomParsedContent[]>(`/api/${locale.value}/search.json`, {
  default: () => [],
  server: false,
})

provide('navigation', navigation)
provide('files', files)

useServerSeoMeta({
  robots: 'index, follow',
})

useHead({
  link: [
    { rel: 'icon', type: 'image/svg+xml', href: iconHref },
  ],
})
</script>

<template>
  <NuxtRouteAnnouncer />
  <NuxtLoadingIndicator />

  <UMain>
    <NuxtPage :page-key="route => route.fullPath" />
  </UMain>

  <ClientOnly>
    <LazyUContentSearch :files :navigation :placeholder="`${$t('search')}...`" hide-color-mode />
  </ClientOnly>

  <UNotifications />
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
