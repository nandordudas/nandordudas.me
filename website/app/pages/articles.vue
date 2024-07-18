<script setup lang="ts">
definePageMeta({
  layout: 'article',
})
</script>

<template>
  <NuxtLayout>
    <NuxtPage :page-key="route => route.fullPath" />
  </NuxtLayout>
</template>
