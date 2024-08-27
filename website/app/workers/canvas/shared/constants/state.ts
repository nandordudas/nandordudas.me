import type { Transferable } from 'canvas'

export type State =
  | { readyState: 'loading' } & Partial<Transferable>
  | { readyState: 'complete' } & Transferable

const state: State = {
  readyState: 'loading',
}

export function useState(): State {
  return state
}
