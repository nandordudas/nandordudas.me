<script setup lang="ts">
import type { FooterLink } from '#ui-pro/types'

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
