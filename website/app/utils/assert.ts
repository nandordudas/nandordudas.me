import type { NuxtError } from 'nuxt/app'

export function assert(condition: boolean, statusMessage: string, options: Partial<NuxtError> = {}): asserts condition {
  if (!condition)
    throw createError({ ...options, statusMessage, fatal: true })
}

export function _assert(condition: boolean, message: string | Error): asserts condition {
  if (!condition)
    raise(message instanceof Error ? message.message : message)
}

export function raise(message: string, ErrorConstructor = Error): never {
  throw new ErrorConstructor(message)
}
