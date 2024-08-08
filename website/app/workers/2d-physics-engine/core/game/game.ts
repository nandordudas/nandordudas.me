import type { Renderer } from './renderer'
import type { InputHandler } from '2dpe/core/input/input-handler'
import type { PhysicsEngine } from '2dpe/core/physics/physics-engine'

export class Game<
  T extends GenericObject<any>,
  Events extends GenericObject,
> {
  state: T | null = null

  constructor(
    public renderer: Renderer,
    public inputHandler: InputHandler<Events>,
    public physicsEngine: PhysicsEngine,
  ) { }

  start(): void {
    debug('game started')
  }

  updateRendering(_state: T): void {
    this.renderer.render(this.loop)
  }

  loop = (deltaTime: number): void => {
    for (const body of this.physicsEngine.world.bodies)
      body.shape.display(this.renderer, body)

    this.physicsEngine.update(deltaTime)
  }

  run(): void { }
  pause(): void { }
  stop(): void { }
  reset(): void { }

  saveState(): T { return this.state! }

  loadState(value: T): void {
    this.state = value

    debug('state loaded', value)
  }
}
