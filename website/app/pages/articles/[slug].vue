<script setup lang="ts">
import type { ParsedContent } from '@nuxt/content'

definePageMeta({
  path: '/articles/:slug',
})

interface Article extends ParsedContent {}

const route = useRoute()

const { data: article } = await useAsyncData(route.path, () => queryContent<Article>(route.path).findOne())

if (!article.value)
  throw createError({ statusCode: 404, statusMessage: 'Article not found', fatal: true })
</script>

<template>
  <UPage>
    <UPageBody prose>
      <div v-if="!article" class="flex items-center space-x-4">
        <USkeleton class="h-12 w-12" :ui="{ rounded: 'rounded-full' }" />

        <div class="space-y-2">
          <USkeleton class="h-4 w-[250px]" />
          <USkeleton class="h-4 w-[200px]" />
        </div>
      </div>

      <template v-else>
        <UBlogPost v-bind="article" />
        <ContentRenderer v-if="article.body" :value="article" class="mt-8 container" />
      </template>
    </UPageBody>
  </UPage>
</template>
