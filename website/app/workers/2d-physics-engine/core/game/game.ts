import type { Renderer } from './renderer'
import type { InputHandler } from '../input/input-handler'
import type { PhysicsEngine } from '../physics/physics-engine'

export class Game<T extends Record<string, any>> {
  state: T | null = null

  #rafId: number | null = null
  #lastTimestamp: number | null = null

  constructor(
    public renderer: Renderer,
    public inputHandler: InputHandler,
    public physicsEngine: PhysicsEngine,
  ) { }

  start(): void { }
  updateRendering(_state: T): void { }
  loop(_deltaTime: number): void { }
  run(): void { }
  pause(): void { }
  stop(): void { }
  reset(): void { }
  saveState(): T { return this.state! }
  loadState(_state: T): void { }
}
