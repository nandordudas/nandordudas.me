import type { z } from 'zod'

// import { logger } from 'nuxt/kit'

const allowedFieldNames = ['count', 'tag'] as const
const QuerySchema = createQuerySchema(allowedFieldNames)

type Query = z.infer<typeof QuerySchema>

export default defineEventHandler(async (event) => {
  // eslint-disable-next-line no-console
  console.log(event.node.req.url)

  const [query, data] = await Promise.all([
    getValidatedQuery(event, QuerySchema.parse),
    fetchContent(event),
  ])

  const dataTransformer = getDataTransformer(query)
  const result = dataTransformer(data)

  return result
})

function getDataTransformer(query: Query) {
  const sortTagsBasedOnQuery = query.sort
    ? sortFields<Result, Query>({ allowedFieldNames, sort: query.sort })
    : (item: Result[]) => item

  return (data: Pick<ParsedContentWithTags, 'tags'>[]) => {
    const transformerOf
      = pipe(extractTags)
        .pipe(structureTags)
        .pipe(sortTagsBasedOnQuery)

    return transformerOf(data)
  }
}
