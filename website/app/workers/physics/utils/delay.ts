const setTimeout = globalThis.setTimeout.bind(globalThis)

export function delay(ms: number = 0): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}
