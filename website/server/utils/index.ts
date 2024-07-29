export function pipe<T extends unknown[], R>(fn: (...args: T) => R) {
  function piped(...args: T): R {
    const result = fn(...args)

    return result
  }

  piped.pipe = <U>(nextFn: (_: R) => U) => {
    return pipe((...args: T) => {
      const intermediateResult = fn(...args)

      return nextFn(intermediateResult)
    })
  }

  return piped
}

const _cache = new Map<string, string>()

export function removeLeadingHyphen(name: string) {
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
