import { z } from 'zod'

import { serverQueryContent } from '#content/server'
import { ALLOWED_LOCALES, DEFAULT_LOCALE } from '~~/lib/utils'

const localesSchema = z.object({
  locale: z.enum(ALLOWED_LOCALES).default(DEFAULT_LOCALE),
})

export default defineEventHandler(async (event) => {
  const t = await useTranslation(event)

  try {
    const params = await getValidatedRouterParams(event, localesSchema.parse)

    return serverQueryContent<CustomParsedContent>(event).where({ _locale: params.locale }).find()
  }
  catch (error) {
    /**
     * INFO: need to repopulate error cause of H3Error boundaries, don't forget
     * to check error.vue in the root of the project
     */
    throw createError({
      cause: error,
      statusCode: 400, // INFO: statusCode is stronger than status
      data: { // INFO: name, message is not used
        name: t('error.validation'),
        message: t('error.invalid.locale'),
      },
    })
  }
})
