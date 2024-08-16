import type { Collision } from './collision'

export abstract class CollisionResolver {
  abstract resolve(collision: Collision): void
}
