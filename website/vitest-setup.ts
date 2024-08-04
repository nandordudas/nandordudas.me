vi.useFakeTimers({
  shouldClearNativeTimers: true,
  toFake: [
    'requestAnimationFrame',
    'cancelAnimationFrame',
  ],
})
