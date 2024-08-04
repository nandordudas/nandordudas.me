import { defineVitestConfig } from '@nuxt/test-utils/config'

export default defineVitestConfig({
  test: {
    includeSource: ['lib/**/*.{js,ts}'],

  },
  define: {
    'import.meta.vitest': 'undefined',
  },
})
