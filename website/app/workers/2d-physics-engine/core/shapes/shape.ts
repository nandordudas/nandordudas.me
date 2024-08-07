import type { Renderer } from '../game/renderer'

import { AABB } from '../collisions/AABB'
import { Vector2D } from '../physics/vector-2d'

export abstract class Shape {
  abstract display(renderer: Renderer): void

  getAABB(): AABB { return new AABB(Vector2D.zero(), Vector2D.zero()) }

  isInstanceOf = <T extends Shape>(type: new (...args: any[]) => T): boolean => this instanceof type
}
