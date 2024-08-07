import { errorHandler, messageEventHandler } from '2dpe'

addEventListener('error', errorHandler)
addEventListener('message', messageEventHandler)
