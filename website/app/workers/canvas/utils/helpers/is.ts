export function isNumber(value: unknown): value is number {
  return typeof value === 'number'
}

export function isBoolean(value: unknown): value is boolean {
  return typeof value === 'boolean'
}

export function isNull(value: unknown): value is null {
  return value === null
}

export function isNotNull<T = unknown>(value: T): value is NonNullable<T> {
  return value !== null
}

export function isFunction<T extends <T>(...args: any[]) => T>(value: unknown): value is T {
  return typeof value === 'function'
}
