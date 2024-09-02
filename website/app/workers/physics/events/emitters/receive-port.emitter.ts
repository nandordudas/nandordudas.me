import { EventEmitter } from '~/workers/physics/lib/event-emitter'

export const receivePortEmitter = new EventEmitter<{
  start: void
}>()
