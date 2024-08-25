import type { Shape } from './shape'
import type { Constructor } from './types'

import { BodyMass } from './constants'
import { PlaceholderShape } from './shape.placeholder'
import { Vector2D } from './vector-2d'

export interface BodyConstructorProps {
  position?: Vector2D
  velocity?: Vector2D
  acceleration?: Vector2D
  mass?: number
  friction?: number
  shape: Shape
}

export class Body implements BodyConstructorProps {
  isInert: boolean = false
  /**
   * @default Vector2D.zero()
   */
  position: Vector2D = Vector2D.zero()
  /**
   * @default Vector2D.zero()
   */
  velocity: Vector2D = Vector2D.zero()
  /**
   * @default Vector2D.zero()
   */
  acceleration: Vector2D = Vector2D.zero()
  /**
   * @default BodyMass.WeightLess
   */
  readonly mass: number = BodyMass.WeightLess
  /**
   * @default 0
   */
  readonly friction: number = 0
  readonly shape: Shape = new PlaceholderShape()

  get inverseMass(): number {
    return this.mass === BodyMass.WeightLess ? BodyMass.WeightLess : 1 / this.mass
  }

  constructor(props: BodyConstructorProps) {
    Object.assign(this, props)
  }

  isInstanceOf<T extends Body>(type: Constructor<T>): this is T {
    return this instanceof type
  }

  updatePosition(deltaTime: number): void {
    this.velocity = this.velocity.add(this.acceleration.multiplyScalar(deltaTime))
    this.position = this.position.add(this.velocity.multiplyScalar(deltaTime))
  }

  applyGravity(gravity: Vector2D): void {
    this.acceleration = this.acceleration.add(gravity)
  }
}
