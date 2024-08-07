import type { Emitter, Handler } from 'mitt'

export class InputHandler<Events extends Record<string, unknown>> {
  constructor(public readonly eventBus: Emitter<Events>) { }

  bindInput<Key extends keyof Events>(type: Key, handler: Handler<Events[Key]>): void {
    this.eventBus.on(type, handler)
  }

  handleInput(_event: Event): void { }
  unbindInput(_action: string): void { }
}
