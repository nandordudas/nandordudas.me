import type { Ball } from './bodies/ball'
import type { Paddle } from './bodies/paddle'
import type { Wall } from './bodies/wall'

import { CollisionResolver } from '2dpe/core/collisions/collision-resolver'

export class PongCollisionResolver extends CollisionResolver {
  resolveBallPaddleCollision(_ball: Ball, _paddle: Paddle): void { }
  resolveBallWallCollision(_ball: Ball, _wall: Wall) { }
}
