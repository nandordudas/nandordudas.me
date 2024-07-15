<script setup lang="ts">
import type { FooterLink } from '#ui-pro/types'

const route = useRoute()
const { t } = useI18n()

const title = computed(() => t(route.meta.title!))

const head = useLocaleHead({
  addDirAttribute: true,
  addSeoAttributes: true,
  identifierAttribute: 'id',
})

const links: FooterLink[] = [
  { label: 'Nuxt UI', to: 'https://ui.nuxt.com/' },
  { label: 'Nuxt Docs', to: 'https://nuxt.com' },
  { label: 'Nuxt Studio', to: 'https://nuxt.studio' },
]

useHead({
  htmlAttrs: head.value.htmlAttrs,
  link: head.value.link,
  meta: head.value.meta,
  title: title.value,
})
</script>

<template>
  <div>
    <Header />

    <UContainer>
      <slot />
    </UContainer>

    <UFooter :links>
      <template #left>
        Copyright &copy; 2024 - {{ new Date().getFullYear() }}
      </template>
    </UFooter>
  </div>
</template>
