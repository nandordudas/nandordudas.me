import type { Collision } from './collision'

import { CollisionResolver } from './collision-resolver'

export class CustomCollisionResolver extends CollisionResolver {
  resolve(_collision: Collision): void {
    throw new Error('Method not implemented.')
  }
}
