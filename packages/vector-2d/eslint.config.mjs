// @ts-check
import antfu from '@antfu/eslint-config'
import vitest from 'eslint-plugin-vitest'

export default antfu()
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
            'alphabetize': { order: 'asc', caseInsensitive: true },
          },
        ],
      },
    },
  )
  .override('antfu/typescript/rules', {
    rules: {
      'complexity': ['error', 5],
      'no-restricted-syntax': 'off',
    },
  })
  .append({
    files: ['**/__tests__/**'],
    plugins: [vitest],
    rules: {
      ...vitest.configs.recommended.rules,
      // 'vitest/max-nested-describe': ['error', { max: 5 }],
    },
  })
