import createDebug, { type Debugger } from 'debug'

export function useDebugger(namespace: string): Debugger {
  return createDebug(namespace)
}

export function enableDebugger(namespace: string): void {
  if (!import.meta.dev)
    return

  createDebug.enable(namespace)
}
