<script setup lang="ts">
import type { ParsedContent } from '@nuxt/content'

interface Article extends ParsedContent {}

const { data: articles } = await useAsyncData('articles', () => {
  return queryContent<Article>('articles')
    .where({ _extension: 'md' })
    .sort({ date: SORT_ORDER.DESC, $numeric: true })
    .limit(5)
    .find()
})

assert(articles.value !== undefined, 'Articles not found')

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
