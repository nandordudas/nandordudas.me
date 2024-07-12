<script setup lang="ts">
const route = useRoute()
const { locale, t } = useI18n()

const { data: page } = await useAsyncData(`blog-${route.path}`, () => {
  return queryContent<CustomParsedContent>(route.path).locale(locale.value).findOne()
})

if (!page.value)
  throw createError({ statusCode: 404, statusMessage: t('page.title.not_found'), message: t('page.title.not_found.subtitle'), fatal: true })

useContentHead(page.value!)

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
      <UPage>
        <NuxtImg
          v-if="page?.image"
          format="avif,webp"
          v-bind="page.image"
          :placeholder="[480, 320, 60, 4]"
          class="mt-8 w-full object-cover rounded-lg aspect-video"
          width="1280"
          height="720"
          draggable="false"
        />

        <UPageHeader v-bind="page" :headline="findPageHeadline(page!)" />

        <UPageBody prose>
          <ContentRenderer v-if="page?.body" :value="page" />
        </UPageBody>
      </UPage>
    </NuxtLayout>
  </div>
</template>

<style scoped>
img[data-error="1"] {
  position: relative;
  filter: sepia(15%);

  html.dark & {
    filter: brightness(35%) sepia(35%);
  }

  &::before {
    background-image: url(/images/placeholder.png);
    background-position: center;
    background-repeat: no-repeat;
    background-color: #f1f1f1;
    content: '';
    width: 100%;
    height: 100%;
    position: absolute;
    top: 50%;
    left: 0;
    transform: translateY(-50%);
  }

  &::after {
    content: attr(alt);
    font-size: 18px;
    color: rgb(0, 0, 0);
    position: absolute;
    top: 1rem;
    left: 1rem;
    width: calc(100% - 2rem);
    height: calc(100% - 2rem);
  }
}
</style>
