import { errorEventHandler } from './events/handlers/error.event-handler'
import { messageEventHandler } from './events/handlers/message.event-handler'

const on = globalThis.addEventListener.bind(globalThis)

on('error', errorEventHandler)
on('message', messageEventHandler)
