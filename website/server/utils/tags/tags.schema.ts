import { z } from 'zod'

/**
 * Only allow alphanumeric characters and dot with optional leading hyphen.
 */
const QUERY_PARAM_REGEX = /^(-)?[a-z.]+$/i

export function createQuerySchema<const T extends readonly string[]>(allowedSortFields: T) {
  const SortFieldSchema = z.string()
    .regex(QUERY_PARAM_REGEX)
    .refine((name) => {
      const FieldSchema = z.enum(allowedSortFields as unknown as [string, ...string[]])
      const result = FieldSchema.safeParse(removeLeadingHyphen(name))

      return result.success
    }, field => ({ message: `Invalid sort field: ${removeLeadingHyphen(field)}.` }))
    .transform((parameter) => {
      const isDescending = parameter.startsWith(DESCENDING_DELIMITER)

      const order = isDescending ? SORT_ORDER.DESC : SORT_ORDER.ASC
      const name = (isDescending ? parameter.slice(1) : parameter) as unknown as T[number]

      return { name, order }
    })

  const SortSchema = z.string()
    .transform(value => value.split(PARAMETER_DELIMITER))
    .pipe(z.array(SortFieldSchema).min(1).max(allowedSortFields.length))
    .optional()

  const QuerySchema = z.object({
    sort: SortSchema,
  })

  return QuerySchema
}
