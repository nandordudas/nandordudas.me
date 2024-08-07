import type { EventBus } from '../events/event-bus'

export class InputHandler {
  bindings: InputBinding[] = []

  constructor(public readonly eventBus: EventBus) { }

  handleInput(_event: Event): void { }
  bindInput(_action: string, _key: string): void { }
  unbindInput(_action: string): void { }
}
