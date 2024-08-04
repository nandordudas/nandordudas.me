import { defineVitestConfig } from '@nuxt/test-utils/config'

export default defineVitestConfig({
  test: {
    globals: true,
    environment: 'happy-dom',
    reporters: [
      'verbose',
    ],
    // setupFiles: './vitest-setup.ts',
    clearMocks: true,
    fakeTimers: {
      shouldClearNativeTimers: true,
      toFake: [
        'requestAnimationFrame',
        'cancelAnimationFrame',
      ],
    },
  },
})
