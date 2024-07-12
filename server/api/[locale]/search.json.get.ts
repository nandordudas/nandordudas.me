import { serverQueryContent } from '#content/server'

const DEFAULT_LOCALE = 'en'

export default defineEventHandler((event) => {
  const locale = getRouterParam(event, 'locale') ?? DEFAULT_LOCALE

  return serverQueryContent<CustomParsedContent>(event)
    .where({ _locale: locale })
    .find()
})
