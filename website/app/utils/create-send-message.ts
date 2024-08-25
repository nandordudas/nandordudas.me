type PostMessageFunction = (message: any, options?: WindowPostMessageOptions) => void

type MessageChannel = MessagePort | Worker

interface MessageOptions<T extends Record<string, any>, K extends keyof T> {
  type: K
  data?: T[K]
  transfer?: Transferable[]
}

export type MessageFunction = ReturnType<typeof createSendMessage>

export function createSendMessage(channelOrPostMessage: MessageChannel | PostMessageFunction) {
  const postMessage: PostMessageFunction
    = 'postMessage' in channelOrPostMessage
      ? channelOrPostMessage.postMessage.bind(channelOrPostMessage)
      : channelOrPostMessage

  return <T extends Record<string, any>, K extends keyof T>(
    options: MessageOptions<T, K>,
  ): void => {
    const { type, data, transfer = [] } = options
    const postMessageOptions: WindowPostMessageOptions = { transfer }

    postMessage({ type, data }, postMessageOptions)
  }
}
