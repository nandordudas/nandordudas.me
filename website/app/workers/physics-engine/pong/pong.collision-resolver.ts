import type { Ball } from './bodies/ball'
import type { Paddle } from './bodies/paddle'

import { CollisionResolver } from '2dpe/core/collisions/collision-resolver'
import { Vector2D } from '2dpe/core/physics/vector-2d'
import { isBall, isPaddle, isWall, scalar } from '2dpe/helpers'

export class PongCollisionResolver extends CollisionResolver {
  // eslint-disable-next-line complexity
  override resolve(collision: Collision): void {
    if (isBall(collision.bodyA) && isWall(collision.bodyB))
      this.#resolveBallWallCollision(collision.bodyA, collision.normal, collision.depth)
    else if (isWall(collision.bodyA) && isBall(collision.bodyB))
      this.#resolveBallWallCollision(collision.bodyB, collision.normal.negate(), collision.depth)
    else if (isBall(collision.bodyA) && isPaddle(collision.bodyB))
      this.#resolveBallPaddleCollision(collision.bodyA, collision.bodyB, collision.normal, collision.depth)
    else if (isPaddle(collision.bodyA) && isBall(collision.bodyB))
      this.#resolveBallPaddleCollision(collision.bodyB, collision.bodyA, collision.normal.negate(), collision.depth)
  }

  #resolveBallPaddleCollision(ball: Ball, paddle: Paddle, normal: Vector2D, depth: number): void {
    // Step 1: Adjust ball position to resolve overlap
    ball.position = ball.position.add(normal.multiply(scalar(depth)))

    // Step 2: Calculate relative velocity
    const relativeVelocity = ball.velocity.subtract(paddle.velocity)

    // Step 3: Calculate the velocity along the normal
    const velocityAlongNormal = Vector2D.dot(relativeVelocity, normal)

    // If the velocity along the normal is moving away, don't resolve
    if (velocityAlongNormal > 0)
      return

    // Step 4: Calculate the restitution (bounciness)
    const restitution = 1.0 // Adjust as necessary for less than perfect bounces

    // Step 5: Calculate impulse scalar
    let impulseScalar = -(1 + restitution) * velocityAlongNormal

    impulseScalar /= (1 / ball.mass) + (1 / paddle.mass)

    // Step 6: Calculate the impulse vector
    const impulse = normal.multiply(scalar(impulseScalar))

    // Step 7: Apply the impulse to the ball's velocity
    ball.velocity = ball.velocity.add(impulse.divide(scalar(ball.mass)))

    // If the paddle is movable, apply the impulse to the paddle's velocity
    // paddle.velocity = paddle.velocity.subtract(impulse.divide(scalar(paddle.mass)))

    // Step 8: Calculate friction
    const tangent = relativeVelocity.subtract(normal.multiply(velocityAlongNormal)).normalize()
    const frictionImpulseScalar = -Vector2D.dot(relativeVelocity, tangent) * ball.friction
    const frictionImpulse = tangent.multiply(scalar(frictionImpulseScalar))

    // Apply friction to ball's velocity
    ball.velocity = ball.velocity.add(frictionImpulse)
  }

  #resolveBallWallCollision(ball: Ball, normal: Vector2D, depth: number): void {
    ball.position = ball.position.add(normal.multiply(scalar(depth)))

    const velocityAlongNormal = Vector2D.dot(ball.velocity, normal)

    if (velocityAlongNormal > 0)
      return

    const restitution = 1.0 // bounciness
    let impulseScalar = -1 * (1 + restitution) * velocityAlongNormal

    impulseScalar /= 1 / ball.mass // Divide by inverse mass (wall is treated as immovable)

    const impulse = normal.multiply(scalar(impulseScalar))

    ball.velocity = ball.velocity.add(impulse.divide(scalar(ball.mass)))

    const tangent = ball.velocity.subtract(normal.multiply(Vector2D.dot(ball.velocity, normal))).normalize()
    const frictionImpulse = tangent.multiply(scalar(-Vector2D.dot(ball.velocity, tangent) * ball.friction))

    ball.velocity = ball.velocity.add(frictionImpulse)
  }
}
