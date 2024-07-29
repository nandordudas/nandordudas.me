import type { ParsedContent } from '@nuxt/content'

export interface Result {
  count: number
  tag: string
  slug: string
}

export interface ParsedContentWithTags extends ParsedContent {
  tags: string[]
}

export type SortOrder = typeof SORT_ORDER[keyof typeof SORT_ORDER]

export type Collator<T> = (next: T, prev: T, factor: number) => SortOrder
