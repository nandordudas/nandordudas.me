// @ts-check
import antfu from '@antfu/eslint-config'

import withNuxt from './.nuxt/eslint.config.mjs'

export default withNuxt(
  antfu()
    .override(
      'antfu/imports/rules',
      {
        rules: {
          'import/order': ['error', { 'newlines-between': 'always' }],
        },
      },
    )
    .override('antfu/typescript/rules', {
      rules: {
        complexity: ['error', 5],
      },
    }),
)
  .override('nuxt/rules', {
    rules: {
      'nuxt/prefer-import-meta': 'error',
    },
  })
