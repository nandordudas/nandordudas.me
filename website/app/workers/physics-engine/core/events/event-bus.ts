import mitt, { type Emitter } from 'mitt'

let emitter = null

export function EventBus<Events extends GenericObject>() {
  emitter ??= mitt<Events>()

  return emitter as Emitter<Events>
}
