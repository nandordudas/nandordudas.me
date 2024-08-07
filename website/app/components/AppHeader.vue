<script setup lang="ts">
defineOptions({
  inheritAttrs: false,
})

// const navigation = injectStrict(NavigationKey, ref([]))
const { metaSymbol } = useShortcuts()

const links = [
  { label: 'Home', to: '/' },
  { label: 'Articles', to: '/articles' },
  { label: 'About', to: '/about' },
]

const nuxtSiteConfig = useSiteConfig()
</script>

<template>
  <UHeader :links :ui="{ container: 'gap-0', logo: 'text-lg sm:text-2xl items-center', center: 'text-2xl' }">
    <template #logo>
      <UAvatar alt="Picture of" icon="i-heroicons-user" src="/images/profile.png" class="sm:w-10 sm:h-10" />

      <span class="italic font-mono font-thin">
        {{ nuxtSiteConfig.name }}
      </span>
    </template>

    <template #center>
      <UHeaderLinks :links :ui="{ base: 'text-xl font-semibold items-center gap-1 hidden lg:flex' }" />
    </template>

    <template #right>
      <UTooltip text="Search" :shortcuts="[metaSymbol, 'K']">
        <UContentSearchButton size="xl" label="" />
      </UTooltip>

      <UTooltip :text="$colorMode.preference === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'">
        <UColorModeButton />
      </UTooltip>
    </template>

    <template #panel>
      <!-- FIX: something is wrong -->
      <!-- <UNavigationTree :links="mapContentNavigation(navigation)" default-open /> -->
    </template>
  </UHeader>
</template>
