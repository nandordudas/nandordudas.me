<script setup lang="ts">
import type { ParsedContent } from '@nuxt/content'

import type { NuxtError } from '#app'

const props = defineProps<{ error: NuxtError }>()

const { data: navigation } = await useAsyncData('navigation', () => fetchContentNavigation(), {
  default: () => [],
})

const { locale } = useI18n()

const { data: files } = useLazyFetch<ParsedContent[]>(`/api/${locale.value}/search.json`, {
  default: () => [],
  server: false,
})

const head = useLocaleHead({
  addDirAttribute: true,
  addSeoAttributes: true,
  identifierAttribute: 'id',
})

useHead({
  title: props.error.statusMessage,
  htmlAttrs: head.value.htmlAttrs,
  link: head.value.link,
  meta: head.value.meta,
})

useSeoMeta({
  description: props.error.message,
})
</script>

<template>
  <div>
    <NuxtRouteAnnouncer />
    <NuxtLoadingIndicator />
    <Header />

    <UMain>
      <UContainer>
        <UPage>
          <UPageError :error :ui="{ default: { clearButton: { label: $t('go.back.home'), color: 'primary', size: 'lg' } } }" />
        </UPage>
      </UContainer>
    </UMain>

    <ClientOnly>
      <LazyUContentSearch :files :navigation :placeholder="`${$t('search')}...`" hide-color-mode />
    </ClientOnly>

    <UNotifications />
  </div>
</template>
