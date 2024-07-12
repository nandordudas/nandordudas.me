<script setup lang="ts">
import type { HeaderLink } from '@nuxt/ui-pro/types'

defineOptions({
  inheritAttrs: false,
})

const navigation = injectStrict(NavigationKey, ref([]))

const links: HeaderLink[] = [
  // { label: 'Home', to: '/' },
  { label: 'Blog', to: '/blog' },
  // { label: 'About', to: '/about' },
]

const { metaSymbol } = useShortcuts()
const colorMode = useColorMode()
const { t } = useI18n()

const colorModeTooltipText = computed(() => {
  return colorMode.preference === 'dark' ? t('switch.to.light') : t('switch.to.dark')
})
</script>

<template>
  <UHeader :links :ui="{ container: 'gap-0', logo: 'text-lg sm:text-2xl items-center', center: 'text-2xl' }">
    <template #logo>
      <UAvatar
        alt="Picture of"
        icon="i-heroicons-user"
        src="/images/profile.png"
        class="sm:w-10 sm:h-10"
        draggable="false"
      />

      <span class="italic font-mono font-thin">
        nandordudas.me
      </span>
    </template>

    <template #center>
      <UHeaderLinks :links :ui="{ base: 'text-xl font-semibold items-center gap-1 hidden lg:flex' }" />
    </template>

    <template #right>
      <UTooltip :text="$t('search')" :shortcuts="[metaSymbol, 'K']">
        <UContentSearchButton size="xl" label="" />
      </UTooltip>

      <UTooltip :text="colorModeTooltipText">
        <UColorModeButton size="xl" />
      </UTooltip>
    </template>

    <template #panel>
      <UNavigationTree :links="mapContentNavigation(navigation)" default-open />
    </template>
  </UHeader>
</template>
