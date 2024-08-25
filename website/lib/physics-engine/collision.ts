import type { Body } from './body'

import { PlaceholderBody } from './body.placeholder'
import { Vector2D } from './vector-2d'

interface CollisionConstructorProps {
  bodyA: Body
  bodyB: Body
  normal: Vector2D
  depth: number
  contactPoint: Vector2D
  type: string
}

export class Collision implements CollisionConstructorProps {
  readonly bodyA: Body = new PlaceholderBody()
  readonly bodyB: Body = new PlaceholderBody()
  readonly normal: Vector2D = Vector2D.zero()
  readonly depth: number = 0
  readonly contactPoint: Vector2D = Vector2D.zero()
  readonly type: string = ''

  constructor(props: CollisionConstructorProps) {
    Object.assign(this, props)
  }
}
