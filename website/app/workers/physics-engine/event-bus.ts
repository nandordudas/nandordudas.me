import mitt, { type Emitter, type EventType } from 'mitt'

let emitter: Emitter<any> | null = null

export function createEventBus<Events extends Record<EventType, unknown>>() {
  emitter ??= mitt<Events>()

  return emitter as Emitter<Events>
}
