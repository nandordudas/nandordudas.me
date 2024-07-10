<script setup lang="ts">
definePageMeta({
  title: 'pages.title.home',
})

const localePath = useLocalePath()
</script>

<template>
  <div>
    <NuxtLayout>
      <NuxtLink :to="localePath('welcome')">
        {{ $t('welcome') }}
      </NuxtLink>
    </NuxtLayout>
  </div>
</template>
