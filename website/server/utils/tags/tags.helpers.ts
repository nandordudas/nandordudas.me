import type { ParsedContentWithTags, Result } from './tags.types'
import type { H3Event } from 'h3'
import type { z } from 'zod'

import { kebabCase } from 'change-case'

import { serverQueryContent } from '#content/server'

export function structureTags(tags: string[]): Result[] {
  const occurrenceMap = new Map<string, Result>()

  for (const tag of tags) {
    const kebabTag = kebabCase(tag)
    const defaultItem = { count: 0, tag, slug: kebabTag }
    const current = occurrenceMap.get(tag) ?? defaultItem

    occurrenceMap.set(kebabTag, {
      ...current,
      count: current.count + 1,
    })
  }

  return Array.from(occurrenceMap.values())
}

export function extractTags(content: Pick<ParsedContentWithTags, 'tags'>[]) {
  return content.flatMap(item => item.tags.filter(Boolean).map(String))
}

export function fetchContent(event: H3Event) {
  const queryBuilder = serverQueryContent<ParsedContentWithTags>(event)
    .where({ _type: 'markdown', navigation: { $ne: false } })
    .only('tags')

  return queryBuilder.find()
}

interface QuerySortable<T extends string[]> {
  sort?: z.infer<ReturnType<typeof createQuerySchema<T>>>['sort']
}

interface SortFieldParams<T extends Record<string, any>, R extends QuerySortable<keyof T extends string ? (keyof T)[] : never>> {
  sort: NonNullable<R['sort']>
  allowedFieldNames: readonly (keyof T)[]
}

export function sortFields<const T extends Record<string, any>, R extends QuerySortable<keyof T extends string ? (keyof T)[] : never>>({
  sort,
  allowedFieldNames,
}: SortFieldParams<T, R>): (input: readonly T[]) => T[] {
  const collator = new Intl.Collator(undefined, { numeric: true })
  const compare = collator.compare.bind(collator)

  const getFieldNameFactor = (name: keyof T) =>
    sort.find(item => item.name === name)?.order ?? SORT_ORDER.ASC

  const genericCollator: Collator<unknown> = (next, prev, factor) =>
    compare(toString(next), toString(prev)) * factor as SortOrder

  const collatorMap = allowedFieldNames.reduce((acc, fieldName) => {
    return acc.has(fieldName)
      ? acc
      : acc.set(fieldName, genericCollator)
  }, new Map<keyof T, Collator<unknown>>())

  return result => result.toSorted((next, prev) => {
    for (const { name } of sort) {
      const factor = getFieldNameFactor(name)
      const collator = collatorMap.get(name)!
      const diff = collator(next[name], prev[name], factor)

      if (diff !== SORT_ORDER.NONE)
        return diff
    }

    return SORT_ORDER.NONE
  })
}
