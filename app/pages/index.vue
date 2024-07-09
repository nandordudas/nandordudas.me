<script setup lang="ts">
// https://nuxt.com/docs/api/utils/define-page-meta
definePageMeta({
  pageType: 'page',
})

const route = useRoute('home')

console.log(route.meta.pageType)
</script>


<template>
  <NuxtLayout>
    <NuxtWelcome />
  </NuxtLayout>
</template>
