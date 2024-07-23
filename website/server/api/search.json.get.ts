import { serverQueryContent } from '#content/server'

export default defineEventHandler((event) => {
  const queryBuilder = serverQueryContent<CustomParsedContent>(event)
    .where({ _type: 'markdown', navigation: { $ne: false } })

  return queryBuilder.find()
})
