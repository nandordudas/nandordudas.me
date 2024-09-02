import { mainEmitter } from '~/workers/physics/events/emitters/main.emitter'

export function errorEventHandler(event: ErrorEvent): void {
  mainEmitter.emit('error', event)
}
