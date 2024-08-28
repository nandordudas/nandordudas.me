import type { Utils } from 'canvas'

import { DebugNamespace } from '~/workers/canvas/shared/constants/enums.constants'
import * as mee from '~/workers/canvas/shared/emitters/message-event.emitter'
import { useDebugger } from '~/workers/canvas/utils/helpers/use-debugger.helper'

const debug = useDebugger(DebugNamespace.MessageEventHandler)

/**
 * Handles the message event from the main thread
 */
export function messageEventHandler(event: Utils.MessageEvent<mee.MessageTypes>): void {
  const { data, type } = event.data
  debug('messageEventHandler', event.data)
  mee.emitter.emit(type, data)
}
