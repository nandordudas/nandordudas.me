import createDebug from 'debug'

import { messageEventHandler } from './lib/event-manager'

createDebug.enable('worker:*')

/**
 * The message event handler added as a workaround for HMR loading the whole
 * worker and TailwindCSS route resolution issues with Nuxt.
 */
addEventListener('message', messageEventHandler)

// TODO: implement missing handlers
