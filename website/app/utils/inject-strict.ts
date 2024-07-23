import type { NavItem, ParsedContent } from '@nuxt/content'

import { type InjectionKey, type Ref, inject } from 'vue'

export function injectStrict<T>(key: InjectionKey<T>, fallback?: T) {
  const resolved = inject(key, fallback)

  assert(resolved !== undefined, `Could not resolve ${key.description}`)

  return resolved
}

export const NavigationKey: InjectionKey<Ref<NavItem[]>> = Symbol('navigation')
export const FilesKey: InjectionKey<Ref<ParsedContent[]>> = Symbol('files')
