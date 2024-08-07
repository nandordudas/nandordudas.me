import type { Renderer } from './renderer'
import type { InputHandler } from '../input/input-handler'
import type { PhysicsEngine } from '../physics/physics-engine'

// TODO: set default game state
export class Game<T extends Record<string, unknown>, Events extends Record<string, unknown>> {
  state: T | null = null

  constructor(
    public renderer: Renderer,
    public inputHandler: InputHandler<Events>,
    public physicsEngine: PhysicsEngine,
  ) { }

  start(): void {
    debug('Starting game')
  }

  updateRendering(_state: T): void {
    this.renderer.render(this.loop)
  }

  loop = (_deltaTime: number): void => {
    this.physicsEngine.world.bodies.forEach((body) => {
      body.shape.display(this.renderer)
    })
  }

  run(): void { }
  pause(): void { }
  stop(): void { }
  reset(): void { }

  saveState(): T { return this.state! }

  loadState(value: T): void {
    this.state = value
  }
}
