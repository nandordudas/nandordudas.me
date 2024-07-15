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
