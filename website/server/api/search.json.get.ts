import { serverQueryContent } from '#content/server'

export default defineEventHandler((event) => {
  return serverQueryContent<CustomParsedContent>(event)
    .where({ _type: 'markdown', navigation: { $ne: false } })
    .find()
})
