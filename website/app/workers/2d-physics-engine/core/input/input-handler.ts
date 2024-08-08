import type { Emitter, Handler } from 'mitt'

export class InputHandler<Events extends GenericObject> {
  constructor(
    /**
     * @readonly
     */
    public readonly eventBus: Emitter<Events>,
  ) { }

  bindInput<Key extends keyof Events>(type: Key, handler: Handler<Events[Key]>): void {
    this.eventBus.on(type, handler)
  }
}
