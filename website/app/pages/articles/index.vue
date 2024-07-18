<script setup lang="ts">
import type { ParsedContent } from '@nuxt/content'

interface Article extends ParsedContent {}

const SORT_ORDER = { ASC: 1, DESC: -1 } as const

const contentQuery = queryContent<Article>('articles')
  .where({ _extension: 'md' })
  .sort({ date: SORT_ORDER.DESC, $numeric: true })
  .limit(5)

const { data: posts } = await useAsyncData('articles', () => contentQuery.find())

function formatDate(date: string | Date) {
  return new Date(date).toLocaleDateString('en', { year: 'numeric', month: 'short', day: 'numeric' })
}
</script>

<template>
  <UPage>
    <pre>{{ posts }}</pre>

    <UPageBody>
      <UBlogList>
        <UBlogPost
          v-for="(post, index) in posts"
          :key="index"
          :to="post._path"
          :title="post.title"
          :description="post.description"
          :date="formatDate(post.date)"
        />
      </UBlogList>
    </UPageBody>
  </UPage>
</template>
