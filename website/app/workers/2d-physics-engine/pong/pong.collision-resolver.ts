import type { Ball } from './bodies/ball'
import type { Paddle } from './bodies/paddle'
import type { Wall } from './bodies/wall'

import { CollisionResolver } from '2dpe/core/collisions/collision-resolver'
import { Vector2D } from '2dpe/core/physics/vector-2d'
import { isBall, isWall, scalar } from '2dpe/helpers'

export class PongCollisionResolver extends CollisionResolver {
  override resolve(collision: Collision): void {
    if (isBall(collision.bodyA) && isWall(collision.bodyB))
      this.#resolveBallWallCollision(collision.bodyA, collision.bodyB, collision.normal, collision.depth)
    else if (isWall(collision.bodyA) && isBall(collision.bodyB))
      this.#resolveBallWallCollision(collision.bodyB, collision.bodyA, collision.normal.negate(), collision.depth)

    // Add other collision resolution methods as needed
  }

  resolveBallPaddleCollision(_ball: Ball, _paddle: Paddle): void { }

  #resolveBallWallCollision(ball: Ball, wall: Wall, normal: Vector2D, depth: number): void {
    // Separate the ball from the wall
    ball.position = ball.position.add(normal.multiply(scalar(depth)))

    // Calculate the velocity component along the normal
    const velocityAlongNormal = Vector2D.dot(ball.velocity, normal)

    // If the ball is moving away from the wall, no need for impulse
    if (velocityAlongNormal > 0)
      return

    // Calculate restitution (bounciness)
    const restitution = 0.8 // This can be adjusted or made a property of the ball/wall

    // Calculate impulse scalar
    let impulseScalar = -(1 + restitution) * velocityAlongNormal

    impulseScalar /= 1 / ball.mass // Divide by inverse mass (wall is treated as immovable)

    // Apply impulse
    const impulse = normal.multiply(scalar(impulseScalar))

    ball.velocity = ball.velocity.add(impulse.divide(scalar(ball.mass)))

    // Apply friction
    const friction = 0.5 // This can be adjusted or made a property of the ball/wall
    const tangent = ball.velocity.subtract(normal.multiply(Vector2D.dot(ball.velocity, normal))).normalize()
    const frictionImpulse = tangent.multiply(scalar(-Vector2D.dot(ball.velocity, tangent) * friction))

    ball.velocity = ball.velocity.add(frictionImpulse)
  }
}
