/// <reference lib="webworker" />

import { errorEventHandler } from './handlers/error-event.handler'
import { messageEventHandler } from './handlers/message-event.handler'
import { DebugNamespace } from './shared/constants/enums.constants'
import { enableDebugger } from './utils/helpers/use-debugger.helper'

enableDebugger(DebugNamespace.CanvasWildcard)

const on = globalThis.addEventListener.bind(globalThis)

on('error', errorEventHandler)

on('message', messageEventHandler, {
  signal: AbortSignal.timeout(100),
})
