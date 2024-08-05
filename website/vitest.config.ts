import { defineVitestConfig } from '@nuxt/test-utils/config'

export default defineVitestConfig({
  test: {
    globals: true,
    environment: 'happy-dom',
    reporters: [
      'verbose',
    ],
    clearMocks: true,
    fakeTimers: {
      // INFO: https://vitest.dev/config/#faketimers-shouldclearnativetimers
      shouldClearNativeTimers: true,
      toFake: [
        'requestAnimationFrame',
        'cancelAnimationFrame',
      ],
    },
    coverage: {
      include: [
        '**/lib/**/*',
      ],
    },
  },
})
