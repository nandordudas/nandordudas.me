import { AABB } from '../collisions/AABB'
import { Vector2D } from '../physics/vector-2d'

export class Shape {
  getAABB(): AABB { return new AABB(Vector2D.zero(), Vector2D.zero()) }
  display(): void { }
  isInstanceOf = <T extends Shape>(type: new (...args: any[]) => T): boolean => this instanceof type
}
