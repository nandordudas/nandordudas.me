import type { Renderer } from './renderer'
import type { InputHandler } from '../input/input-handler'
import type { PhysicsEngine } from '../physics/physics-engine'

// TODO: set default game state
export class Game<T extends Record<string, unknown>, Events extends Record<string, unknown>> {
  state: T | null = null

  #rafId: number | null = null
  #lastTimestamp: number | null = null

  constructor(
    public renderer: Renderer,
    public inputHandler: InputHandler<Events>,
    public physicsEngine: PhysicsEngine,
  ) { }

  start(): void {
    // eslint-disable-next-line no-console
    console.log('Starting game')
  }

  updateRendering(_state: T): void { }
  loop(_deltaTime: number): void { }
  run(): void { }
  pause(): void { }
  stop(): void { }
  reset(): void { }

  saveState(): T { return this.state! }

  loadState(value: T): void {
    this.state = value
  }
}
