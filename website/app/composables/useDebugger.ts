import createDebug from 'debug'

export function useDebugger(namespace: string): createDebug.Debugger {
  const debug = createDebug(`${namespace}`)

  return debug
}
