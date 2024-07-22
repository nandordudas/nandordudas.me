<script setup lang="ts">
import type { NuxtError } from '#app'
import type { NavItem, ParsedContent } from '@nuxt/content'

const props = defineProps<{ error: NuxtError }>()

interface CustomErrorData {
  name: string
  message: string
}

// TODO: fix /api/search.json 'Invalid error occurred'/'Invalid arguments'
const errorData = computed<CustomErrorData>(() => {
  try {
    return JSON.parse(props.error.data as string)
  }
  catch {
    return props.error.data
  }
})

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
  title: props.error.statusMessage,
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
          <UPageError
            :status="error?.statusCode"
            :name="errorData?.name ?? error?.name"
            :message="errorData?.message ?? error?.message"
          />
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
