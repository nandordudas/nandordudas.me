<script setup lang="ts">
import type { QueryBuilderParams } from '@nuxt/content'

const route = useRoute()
const { locale } = useI18n()

const path = computed(() => {
  if (locale.value === 'en')
    return route.path

  return removePrefix(route.path, locale.value)
})

const query: QueryBuilderParams = {
  path: path.value,
  where: [
    { '_locale': locale.value },
  ],
}

definePageMeta({
  layout: 'content',
})

useSeoMeta({
  description: '[description]',
  /* open graph */
  ogTitle: '[og:title]',
  ogDescription: '[og:description]',
  // ogImage: imageData,
  ogUrl: '[og:url]',
  /* twitter */
  twitterTitle: '[twitter:title]',
  twitterDescription: '[twitter:description]',
  // twitterImage: imageData,
  twitterCard: 'summary',
})
</script>

<template>
  <div>
    <NuxtLayout>
      <ContentDoc :query>
        <template v-slot="{ doc }">
          <ContentRenderer :value="doc" />

          <NuxtImg v-if="doc.image" v-bind="doc.image" />
        </template>

        <template #not-found>
          <!-- TODO: render 404 page instead with PageError -->
          <h1>{{ $t('document-not-found') }}</h1>
        </template>
      </ContentDoc>
    </NuxtLayout>
  </div>
</template>
