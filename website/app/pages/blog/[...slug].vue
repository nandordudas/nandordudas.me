<script setup lang="ts">
const route = useRoute()
const { locale, t } = useI18n()

const slug = computed(() => route.path)

const { data: page } = await useAsyncData(`${slug.value}-blog`, () => {
  return queryContent<CustomParsedContent>(slug.value).locale(locale.value).findOne()
})

if (!page.value)
  throw createError({ statusCode: 404, statusMessage: t('page.title.not_found'), message: t('page.title.not_found.subtitle'), fatal: true })

const { data: referencedPages } = await useAsyncData(`${slug.value}-referenced-blog`, () => {
  return queryContent<CustomParsedContent>('blog')
    // .locale('hu')
    .only(['_path', '_locale'])
    .where({
      _id: { $in: page.value!.referencedDocuments },
      _locale: { $ne: locale.value },
    })
    .find()
})

// INFO: need to add manually 🤔
const hasImageLoaded = ref<boolean | null>(null)

onMounted(() => {
  hasImageLoaded.value ||= false
})

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

// TODO: check image loaded event cause of content search navigation will shown without image or HMR update too
// TODO: https://i18n.nuxtjs.org/docs/guide/lang-switcher#dynamic-route-parameters
</script>

<template>
  <div>
    <NuxtLayout>
      <NuxtImg
        v-if="page?.image"
        format="avif,webp"
        v-bind="page.image"
        :placeholder="[480, 320, 60, 4]"
        class="mt-8 w-full object-cover rounded-lg aspect-video"
        width="1280"
        height="720"
        draggable="false"
        :data-error="hasImageLoaded ? null : '1'"
        @loaded="() => hasImageLoaded = true"
      />

      <UPageHeader v-bind="page" :headline="findPageHeadline(page!)" :links="page!.links">
        <template #headline>
          <UBadge v-bind="page!.badge" variant="subtle" />

          <span class="text-gray-500 dark:text-gray-400">&middot;</span>

          <time class="text-gray-500 dark:text-gray-400">
            Created at: {{ new Date(page!.createdAt).toLocaleDateString('en', { year: 'numeric', month: 'short', day: 'numeric' }) }}
          </time>

          <span class="text-gray-500 dark:text-gray-400">&middot;</span>

          <time class="text-gray-500 dark:text-gray-400">
            Updated at: {{ new Date(page!.updatedAt).toLocaleDateString('en', { year: 'numeric', month: 'short', day: 'numeric' }) }}
          </time>
        </template>

        <div class="flex flex-wrap items-center gap-3 mt-4">
          <UButton
            v-for="(author, index) in page!.authors"
            :key="index"
            :to="author.to"
            color="white"
            target="_blank"
            size="sm"
          >
            <UAvatar v-bind="author.avatar" :alt="author.name" size="2xs" />

            {{ author.name }}
          </UButton>
        </div>

        <template #links>
          <UBadge v-for="(tag, index) in page!.tags" :key="index" :label="tag" color="white" />
        </template>
      </UPageHeader>

      <UPage>
        <UPageBody prose>
          {{ referencedPages }}

          <ContentRenderer v-if="page?.body" :value="page" />
        </UPageBody>
      </UPage>
    </NuxtLayout>
  </div>
</template>

<style scoped>
img[data-error='1'] {
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
