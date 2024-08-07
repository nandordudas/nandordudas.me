import mitt, { type Emitter, type EventType } from 'mitt'

let emitter = null

export function EventBus<Events extends Record<EventType, unknown>>() {
  emitter ??= mitt<Events>()

  return emitter as Emitter<Events>
}
