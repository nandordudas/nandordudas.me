import type { Collision } from './collision'

import { Ball } from './body.ball'
import { Wall } from './body.wall'
import { CollisionResolver } from './collision-resolver'
import { Vector2D } from './vector-2d'

export class CustomCollisionResolver extends CollisionResolver {
  override resolve(collision: Collision): void {
    if (collision.bodyA.isInstanceOf(Ball) && collision.bodyB.isInstanceOf(Wall))
      this.resolveBallWallCollision(collision)
    else if (collision.bodyA.isInstanceOf(Wall) && collision.bodyB.isInstanceOf(Ball))
      this.resolveBallWallCollision({ ...collision, bodyA: collision.bodyB, bodyB: collision.bodyA })
  }

  protected resolveBallWallCollision(collision: Collision): void {
    const ball = collision.bodyA.isInstanceOf(Ball) ? collision.bodyA : collision.bodyB as Ball
    const wall = collision.bodyA.isInstanceOf(Wall) ? collision.bodyA : collision.bodyB as Wall

    // Calculate the collision normal (perpendicular to the wall)
    const wallNormal = wall.shape.normal()

    // Calculate the relative velocity
    const relativeVelocity = ball.velocity

    // Calculate the velocity along the normal
    const normalVelocity = Vector2D.dotProduct(relativeVelocity, wallNormal)

    // Only resolve if objects are moving towards each other
    if (normalVelocity > 0) { // ball hits the bottom wall, the normal velocity is positive
      // debugger
      // move the ball to the top wall
      ball.velocity = Vector2D.create(0, -1)
    }

    // Calculate restitution (bounciness)
    const restitution = 0.8 // This can be adjusted or calculated based on materials

    // Calculate impulse scalar
    const impulseScalar = -(1 + restitution) * normalVelocity / ball.inverseMass

    // Apply impulse
    const impulse = wallNormal.multiplyScalar(impulseScalar)
    ball.velocity = ball.velocity.add(impulse.multiplyScalar(ball.inverseMass))

    // Apply friction (optional)
    const friction = 0.1 // This can be adjusted
    const tangent = relativeVelocity.subtract(wallNormal.multiplyScalar(Vector2D.dotProduct(relativeVelocity, wallNormal))).normalize()
    const frictionImpulseScalar = -Vector2D.dotProduct(relativeVelocity, tangent) * friction
    const frictionImpulse = tangent.multiplyScalar(frictionImpulseScalar)
    ball.velocity = ball.velocity.add(frictionImpulse.multiplyScalar(ball.inverseMass))

    // Resolve penetration
    const penetrationDepth = collision.depth
    const correction = wallNormal.multiplyScalar(penetrationDepth * 0.8) // 0.8 is a correction factor, can be adjusted
    ball.position = ball.position.add(correction)
  }
}
