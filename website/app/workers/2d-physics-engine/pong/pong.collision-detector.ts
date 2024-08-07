import type { Ball } from './bodies/ball'
import type { Paddle } from './bodies/paddle'
import type { Wall } from './bodies/wall'

import { CollisionDetector } from '../core/collisions/collision-detector'

export class PongCollisionDetector extends CollisionDetector {
  checkBallPaddleCollision(_ball: Ball, _paddle: Paddle): boolean { return false }
  checkBallWallCollision(_ball: Ball, _wall: Wall): boolean { return false }
}
