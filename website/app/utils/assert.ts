import type { NuxtError } from '#app'

export function assert(condition: boolean, statusMessage: string, options: Partial<NuxtError> = {}): asserts condition {
  if (!condition)
    throw createError({ ...options, statusMessage, fatal: true })
}

export function raise(message: string, ErrorConstructor = Error): never {
  throw new ErrorConstructor(message)
}
