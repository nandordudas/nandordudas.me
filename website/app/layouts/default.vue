<script setup lang="ts">
const route = useRoute()

const head = useLocaleHead({
  addDirAttribute: true,
  addSeoAttributes: true,
  identifierAttribute: 'id',
})

useHead({
  htmlAttrs: head.value.htmlAttrs,
  link: head.value.link,
  meta: head.value.meta,
  title: route.meta.title,
})
</script>

<template>
  <div>
    <AppHeader />

    <UContainer>
      <slot />
    </UContainer>

    <AppFooter />
  </div>
</template>
