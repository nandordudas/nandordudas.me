import type { Renderer } from '2dpe/core/game/renderer'
import type { Body } from '2dpe/core/physics/body'

import { AABB } from '2dpe/core/collisions/AABB'
import { Vector2D } from '2dpe/core/physics/vector-2d'

export abstract class Shape {
  abstract display(renderer: Renderer, body: Body): void

  getAABB(): AABB { return new AABB(Vector2D.zero(), Vector2D.zero()) }
  isInstanceOf = <T extends Shape>(type: new (...args: any[]) => T): boolean => this instanceof type
}
