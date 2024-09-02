import { type MainMessageEvent, mainEmitter } from '~/workers/physics/events/emitters/main.emitter'

export function messageEventHandler(event: MainMessageEvent): void {
  mainEmitter.emit(event.data.type, event.data.data)
}
