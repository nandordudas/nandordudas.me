<script setup lang="ts">
import type { ParsedContent } from '@nuxt/content'

interface Article extends ParsedContent {}

const SORT_ORDER = { ASC: 1, DESC: -1 } as const

const contentQuery = queryContent<Article>('articles')
  .where({ _extension: 'md' })
  .sort({ date: SORT_ORDER.DESC, $numeric: true })
  .limit(5)

const { data: articles } = await useAsyncData('articles', () => contentQuery.find())

if (!articles.value)
  throw createError({ statusCode: 404, statusMessage: 'Articles not found', fatal: true })

const selectedArticle = useState<number>()
</script>

<template>
  <UPage>
    <UPageBody>
      <UBlogList>
        <UBlogPost
          v-for="(article, index) in articles"
          :key="index"
          v-bind="article"
          :to="article._path"
          :class="{ 'selected-article': index === selectedArticle, 'col-span-full': index === 0 }"
          :orientation="index === 0 ? 'horizontal' : 'vertical'"
          @click="selectedArticle = index"
        />
      </UBlogList>
    </UPageBody>
  </UPage>
</template>

<style scoped>
.selected-article {
  contain: layout;
  view-transition-name: selected-article;
}
</style>
