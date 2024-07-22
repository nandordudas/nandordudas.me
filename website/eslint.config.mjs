// @ts-check
import antfu from '@antfu/eslint-config'

import withNuxt from './.nuxt/eslint.config.mjs'

export default withNuxt(
  antfu({
    formatters: { css: true },
  })
    .override(
      'antfu/imports/rules',
      {
        rules: {
          'import/order': [
            'error',
            {
              'groups': [
                'type',
                'builtin',
                'external',
                'internal',
                'parent',
                'sibling',
                'index',
                'object',
                'unknown',
              ],
              'newlines-between': 'always',
              'pathGroups': [
                { pattern: '{#app,@nuxt/**,#ui/**}', group: 'type', position: 'before' },
              ],
              'alphabetize': { order: 'asc', caseInsensitive: true },
            },
          ],
        },
      },
    )
    .override('antfu/typescript/rules', {
      rules: {
        complexity: ['error', 5],
      },
    })
    .override(
      'antfu/vue/rules',
      {
        rules: {
          'vue/max-attributes-per-line': ['error', { singleline: 5, multiline: 1 }],
          'vue/max-len': ['error', { code: 120, template: 120 }],
        },
      },
    ),
)
  .override('nuxt/rules', {
    rules: {
      'nuxt/prefer-import-meta': 'error',
    },
  })
