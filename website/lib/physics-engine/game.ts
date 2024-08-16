import type { PhysicsEngine } from './physics-engine'
import type { Renderer } from './renderer'

interface GameConstructorProps {
  physicsEngine: PhysicsEngine | null
  renderer: Renderer | null
}

export class Game implements GameConstructorProps {
  readonly physicsEngine: PhysicsEngine | null = null
  readonly renderer: Renderer | null = null

  constructor(props: GameConstructorProps) {
    Object.assign(this, props)
  }

  start(): void {
    this.renderer!.render(this.loop.bind(this))
  }

  loop(deltaTime: number): void {
    this.update(deltaTime)
    this.render()
  }

  update(deltaTime: number): void {
    this.physicsEngine!.update(deltaTime)
    // Update game state, AI, etc.
  }

  render(): void {
    this.renderer!.clearCanvas()

    for (const body of this.physicsEngine!.world!.bodies)
      body.shape.draw(this.renderer!, body)
  }
}
