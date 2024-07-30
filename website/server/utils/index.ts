export function pipe<T extends unknown[], R>(fn: (...args: T) => R) {
  return Object.assign((...args: T) => fn(...args), {
    pipe: <U>(nextFn: (_: R) => U) => pipe((...args: T) => nextFn(fn(...args))),
  })
}

const MAX_CACHE_SIZE = 1_000
const _cache = new Map<string, string>()

export function removeLeadingHyphen(name: string) {
  if (_cache.size > MAX_CACHE_SIZE)
    _cache.clear()

  if (_cache.has(name))
    return _cache.get(name)!

  const nameWithoutLeadingHyphen = name.startsWith(DESCENDING_DELIMITER)
    ? name.slice(1)
    : name

  _cache.set(name, nameWithoutLeadingHyphen)

  return nameWithoutLeadingHyphen
}

export function toString(value: unknown) {
  if (typeof value === 'string')
    return value

  if (isNullOrUndefined(value))
    value = ''

  return String(value)
}

export function isNullOrUndefined(value: unknown): value is null | undefined {
  return value === null || value === undefined
}
