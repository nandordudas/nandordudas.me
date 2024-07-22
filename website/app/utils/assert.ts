import type { NuxtError } from '#app'

export function assert(condition: boolean, statusMessage: string, options: Partial<NuxtError> = {}): asserts condition {
  if (!condition)
    throw createError({ ...options, statusMessage, fatal: true })
}
