<script setup lang="ts">
import type { NavItem, ParsedContent } from '@nuxt/content'

useHead({
  link: [
    { rel: 'icon', type: 'image/svg+xml', href: import.meta.dev ? '/favicon-dev.svg' : '/favicon.svg' },
  ],
})

const { data: navigation } = await useLazyAsyncData('navigation', () => fetchContentNavigation(), {
  default: () => [] as NavItem[],
})

const { data: files } = useLazyFetch<ParsedContent[]>('/api/search.json', {
  default: () => [],
  server: false,
})

const siteConfig = useSiteConfig()

useSeoMeta({
  ogSiteName: siteConfig.name,
  ogType: 'website',
  twitterCard: 'summary_large_image',
  twitterSite: 'nandordudas',
})

provide('navigation', navigation)
provide('files', files)
</script>

<template>
  <NuxtRouteAnnouncer />
  <NuxtLoadingIndicator />

  <UMain>
    <NuxtPage />
  </UMain>

  <ClientOnly>
    <UContentSearch :files :navigation />
  </ClientOnly>

  <UNotifications />
</template>
