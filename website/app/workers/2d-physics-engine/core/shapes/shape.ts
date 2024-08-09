import type { Renderer } from '2dpe/core/game/renderer'
import type { Body } from '2dpe/core/physics/body'

import { AABB } from '2dpe/core/collisions/AABB'
import { Vector2DBasic } from '2dpe/core/physics/vector-2d/vector-2d-basic'

/**
 * @abstract
 */
export abstract class Shape {
  /**
   * @abstract
   */
  abstract display(renderer: Renderer, body: Body): void

  isInstanceOf = <T extends Shape>(type: new (...args: any[]) => T): boolean => this instanceof type

  getAABB(): AABB { return new AABB(Vector2DBasic.zero, Vector2DBasic.zero) }
}
