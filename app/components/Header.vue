<script setup lang="ts">
import type { HeaderLink } from '@nuxt/ui-pro/types'

import type { DropdownItem } from '#ui/types'

defineOptions({
  inheritAttrs: false,
})

const navigation = injectStrict(NavigationKey, ref([]))

const toast = useToast()
const route = useRoute()
const { metaSymbol } = useShortcuts()
const colorMode = useColorMode()
const { locale, locales, setLocale, t } = useI18n()

const links: HeaderLink[] = [
  { label: t('home'), to: '/' },
  { label: t('blog'), to: '/blog' },
  { label: t('about'), to: '/about' },
]

const colorModeTooltipText = computed(() => {
  return colorMode.preference === 'dark' ? t('switch.to.light') : t('switch.to.dark')
})

function getCountryIcon(locale: string) {
  const countryIconMap = {
    en: 'i-twemoji-flag-united-states',
    hu: 'i-twemoji-flag-hungary',
  } as const

  return countryIconMap[locale as keyof typeof countryIconMap] as string
}

const items = locales.value.map(locale => [{
  label: locale.name!,
  value: locale.code,
  click: async () => {
    await setLocale(locale.code)
    // location.reload()
    toast.add({ title: t('locale.changed'), callback: () => location.reload(), timeout: 1_500 })
  },
  icon: getCountryIcon(locale.code),
} as DropdownItem])
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

      <span class="italic font-mono font-thin md:hidden">
        NandorDudas
      </span>
    </template>

    <template #center>
      <UHeaderLinks :links :ui="{ base: 'text-xl font-semibold items-center gap-1 hidden lg:flex' }" />
    </template>

    <template #right>
      <UDropdown
        v-if="!route.path.startsWith('/blog/')"
        :items
        :popper="{ placement: 'bottom-start' }"
        class="hidden sm:flex"
        mode="hover"
      >
        <UButton
          color="white"
          :label="$t('language')"
          trailing-icon="i-heroicons-chevron-down-20-solid"
          :icon="getCountryIcon(locale)"
        />
      </UDropdown>

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
