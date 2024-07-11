<script setup lang="ts">
import type { QueryBuilderParams } from '@nuxt/content'

definePageMeta({
  title: 'pages.title.blog',
})

const { locale } = useI18n()
const localePath = useLocalePath()

const query: QueryBuilderParams = {
  path: '/blog',
  where: [
    { '_locale': locale.value },
  ],
  limit: 5,
  sort: [
    { date: SORT_ORDER.DESC },
  ],
}

definePageMeta({
  title: 'pages.title.blog',
})
</script>

<template>
  <div>
    <NuxtLayout>
      <ContentList :query v-slot="{ list }">
        <template v-for="article in list" :key="article._path">
          <NuxtLink :to="localePath(article._path!)">
            {{ article.title }}
          </NuxtLink>
        </template>
      </ContentList>
    </NuxtLayout>
  </div>
</template>
