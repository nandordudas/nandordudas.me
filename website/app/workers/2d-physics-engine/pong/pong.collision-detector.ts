import type { Ball } from './bodies/ball'
import type { Paddle } from './bodies/paddle'
import type { Wall } from './bodies/wall'
import type { Body } from '2dpe/core/physics/body'

import { CollisionDetector } from '2dpe/core/collisions/collision-detector'
import { Vector2D } from '2dpe/core/physics/vector-2d'
import { isBall, isPaddle, isWall } from '2dpe/helpers'

export class PongCollisionDetector extends CollisionDetector {
  override detectCollisions(bodies: Body[]): void {
    this.resetCollisions()

    for (let i = 0; i < bodies.length; ++i) {
      for (let j = i + 1; j < bodies.length; ++j) {
        const bodyA = bodies[i]!
        const bodyB = bodies[j]!

        this.checkCollision(bodyA, bodyB)
      }
    }
  }

  override checkCollision(bodyA: Body, bodyB: Body): void {
    if (isBall(bodyA) && isWall(bodyB))
      this.checkBallWallCollision(bodyA, bodyB)
    else if (isWall(bodyA) && isBall(bodyB))
      this.checkBallWallCollision(bodyB, bodyA)
  }

  checkBallPaddleCollision(_ball: Ball, _paddle: Paddle): boolean {
    return false
  }

  checkBallWallCollision(ball: Ball, wall: Wall): void {
    const closestPoint = this.#closestPointBallToWall(ball, wall)
    const distance = closestPoint.subtract(ball.position)
    const distanceLength = distance.length

    if (this.#isBallCollidingToWall(ball, wall)) {
      const normal = distance.normalize()
      const depth = ball.shape.radius - distanceLength

      this.collisions.push({
        bodyA: ball,
        bodyB: wall,
        normal,
        depth,
        contactPoint: closestPoint,
      })
    }
  }

  #isBallCollidingToWall(ball: Ball, wall: Wall): boolean {
    const closestPoint = this.#closestPointBallToWall(ball, wall)
    const distanceVector = closestPoint.subtract(ball.position)

    return distanceVector.length < ball.shape.radius
  }

  #closestPointBallToWall(ball: Ball, wall: Wall): Vector2D {
    const wallVector = wall.unit()
    const wallLength = wallVector.length
    const wallDirection = wallVector.divide(wallLength)
    const ballToWallStart = ball.position.subtract(wall.shape.start)
    const projection = Vector2D.dot(ballToWallStart, wallDirection)

    if (projection <= 0)
      return wall.shape.start

    if (projection >= wallLength)
      return wall.shape.end

    return wall.shape.start.add(wallDirection.multiply(projection))
  }
}
