import type { Body } from './body'
import type { CollisionDetector } from './collision-detector'
import type { CollisionResolver } from './collision-resolver'
import type { World } from './world'

interface PhysicsEngineConstructorProps<T extends Body = Body> {
  world: World<T> | null
  collisionDetector: CollisionDetector<T> | null
  collisionResolver: CollisionResolver | null
}

export class PhysicsEngine<T extends Body = Body> implements PhysicsEngineConstructorProps<T> {
  readonly world: World<T> | null = null
  readonly collisionDetector: CollisionDetector<T> | null = null
  readonly collisionResolver: CollisionResolver | null = null

  constructor(props: PhysicsEngineConstructorProps) {
    Object.assign(this, props)
  }

  update(deltaTime: number): void {
    this.applyForces(deltaTime)

    for (const body of this.world!.bodies)
      body.updatePosition(deltaTime)

    this.collisionDetector!.detectCollisions(this.world!.bodies)
    this.resolveCollisions()
  }

  applyForces(deltaTime: number): void {
    for (const body of this.world!.bodies)
      body.applyGravity(this.world!.gravity.multiplyScalar(deltaTime))
  }

  resolveCollisions(): void {
    for (const collision of this.collisionDetector!.collisions)
      this.collisionResolver!.resolve(collision)
  }
}
