export function removePrefix(url: string, prefix: string) {
  if (!prefix.startsWith('/'))
    prefix = `/${prefix}`

  if (!url.startsWith(prefix))
    return url

  return url.slice(prefix.length)
}
