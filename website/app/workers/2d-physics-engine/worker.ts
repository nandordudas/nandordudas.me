import { errorHandler, messageEventHandler } from '.'

addEventListener('error', errorHandler)
addEventListener('message', messageEventHandler)
