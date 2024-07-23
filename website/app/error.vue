<script setup lang="ts">
import type { NuxtError } from '#app'
import type { NavItem, ParsedContent } from '@nuxt/content'

const props = defineProps<{
  error: NuxtError
}>()

const { data: navigation } = await useAsyncData('navigation', () => fetchContentNavigation(), {
  default: () => [] as NavItem[],
})

const { data: files } = useLazyFetch<ParsedContent[]>('/api/search.json', {
  default: () => [],
  server: false,
})

const head = useLocaleHead({
  addDirAttribute: true,
  addSeoAttributes: true,
  identifierAttribute: 'id',
})

useHead({
  title: 'Page not found',
  htmlAttrs: head.value.htmlAttrs,
  link: head.value.link,
  meta: head.value.meta,
})

useSeoMeta({
  title: 'Page not found',
  description: props.error.message,
})

provide('navigation', navigation)
</script>

<template>
  <div>
    <NuxtRouteAnnouncer />
    <NuxtLoadingIndicator />
    <AppHeader />

    <UMain>
      <UContainer>
        <UPage>
          <UPageError :error />
        </UPage>
      </UContainer>
    </UMain>

    <AppFooter />

    <ClientOnly>
      <UContentSearch :files :navigation />
    </ClientOnly>

    <UNotifications />
  </div>
</template>
