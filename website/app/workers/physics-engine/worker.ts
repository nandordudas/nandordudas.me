import { errorHandler, messageEventHandler } from './handlers'

addEventListener('error', errorHandler)
addEventListener('message', messageEventHandler)
