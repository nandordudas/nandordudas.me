interface SendEvents {
  pong: void
}

export function sendMessage<K extends keyof SendEvents>({
  type,
  data,
  transfer = [],
}: { type: K, data?: SendEvents[K], transfer?: Transferable[] }): void {
  const options: WindowPostMessageOptions = { transfer }

  postMessage({ type, data }, options)
}
