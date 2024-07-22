<script setup lang="ts">
import type { ParsedContent } from '@nuxt/content'

import { withoutTrailingSlash } from 'ufo'

definePageMeta({
  path: '/articles/:slug',
})

interface Article extends ParsedContent {}

const route = useRoute()

const { data: article } = await useAsyncData(withoutTrailingSlash(route.path), () => {
  return queryContent<Article>(route.path).findOne()
})

if (!article.value)
  throw createError({ statusCode: 404, statusMessage: 'Article not found', fatal: true })
</script>

<template>
  <UPage v-if="article">
    <NuxtImg
      v-if="article.image?.src && !article.image?.isThumbnail"
      :src="article.image.src"
      :alt="article.image.alt"
      class="mt-8 w-full object-cover rounded-lg aspect-video"
      draggable="false"
    />

    <UPageHeader v-bind="article" :icon="null">
      <template #headline>
        <UBadge v-bind="article.badge" variant="subtle" />

        <span class="text-gray-500 dark:text-gray-400">&middot;</span>
        <time class="text-gray-500 dark:text-gray-400">{{ article.date }}</time>
      </template>
    </UPageHeader>

    <UPageBody prose>
      <ContentRenderer v-if="article.body" :value="article" class="mt-8 container" />
    </UPageBody>
  </UPage>
</template>

<style scoped>
img {
  view-transition-name: selected-article;
}
</style>
