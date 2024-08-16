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

  // eslint-disable-next-line complexity
  override checkCollision(bodyA: Body, bodyB: Body): void {
    if (isBall(bodyA) && isWall(bodyB))
      this.checkBallWallCollision(bodyA, bodyB)
    else if (isWall(bodyA) && isBall(bodyB))
      this.checkBallWallCollision(bodyB, bodyA)
    else if (isBall(bodyA) && isPaddle(bodyB))
      this.checkBallPaddleCollision(bodyA, bodyB)
    else if (isPaddle(bodyA) && isBall(bodyB))
      this.checkBallPaddleCollision(bodyB, bodyA)
  }

  checkBallPaddleCollision(ball: Ball, paddle: Paddle): void {
    const contactPoint = this.#closestPointBallToPaddle(ball, paddle)
    const distanceVector = contactPoint.subtract(ball.position)
    const distanceLength = distanceVector.length

    // Check if the ball is colliding with the paddle
    if (this.#isBallCollidingToPaddle(ball, paddle)) {
      const normal = distanceVector.normalize()
      const depth = ball.shape.radius - distanceLength
      const collision: Collision = { bodyA: ball, bodyB: paddle, normal, depth, contactPoint }

      // Add the collision to the list of detected collisions
      this.collisions.push(collision)
    }
  }

  checkBallWallCollision(bodyA: Ball, bodyB: Wall): void {
    const contactPoint = this.#closestPointBallToWall(bodyA, bodyB)
    const distance = contactPoint.subtract(bodyA.position)
    const distanceLength = distance.length

    if (this.#isBallCollidingToWall(bodyA, bodyB)) {
      const normal = distance.normalize()
      const depth = bodyA.shape.radius - distanceLength
      const collision: Collision = { bodyA, bodyB, normal, depth, contactPoint }

      this.collisions.push(collision)
    }
  }

  #isBallCollidingToWall(ball: Ball, wall: Wall): boolean {
    const closestPoint = this.#closestPointBallToWall(ball, wall)
    const distanceVector = closestPoint.subtract(ball.position)

    return distanceVector.length < ball.shape.radius
  }

  #isBallCollidingToPaddle(ball: Ball, paddle: Paddle): boolean {
    const closestPoint = this.#closestPointBallToPaddle(ball, paddle)
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

  // #closestPointBallToPaddle(ball: Ball, paddle: Paddle): Vector2D {
  //   const topLeft = paddle.position
  //   const topRight = paddle.position.add(Vector2D.create(paddle.shape.width, 0))
  //   const bottomLeft = paddle.position.add(Vector2D.create(0, paddle.shape.height))
  //   const bottomRight = paddle.position.add(Vector2D.create(paddle.shape.width, paddle.shape.height))

  //   // Closest point on each edge
  //   const closestPointOnLeft = this.#closestPointOnLine(ball.position, topLeft, bottomLeft)
  //   const closestPointOnRight = this.#closestPointOnLine(ball.position, topRight, bottomRight)
  //   const closestPointOnTop = this.#closestPointOnLine(ball.position, topLeft, topRight)
  //   const closestPointOnBottom = this.#closestPointOnLine(ball.position, bottomLeft, bottomRight)

  //   // Find the closest among them
  //   let closestPoint = closestPointOnLeft
  //   let minDistance = ball.position.subtract(closestPointOnLeft).length

  //   const checkAndUpdateClosest = (point: Vector2D) => {
  //     const distance = ball.position.subtract(point).length

  //     if (distance < minDistance) {
  //       closestPoint = point
  //       minDistance = distance
  //     }
  //   }

  //   checkAndUpdateClosest(closestPointOnRight)
  //   checkAndUpdateClosest(closestPointOnTop)
  //   checkAndUpdateClosest(closestPointOnBottom)

  //   return closestPoint
  // }

  // TODO: left paddle does not work
  // TODO: top wall collision response is not working sometimes
  #closestPointBallToPaddle(ball: Ball, paddle: Paddle): Vector2D {
    const topLeft = paddle.position
    const topRight = paddle.position.add(Vector2D.create(paddle.shape.width, 0))
    const bottomLeft = paddle.position.add(Vector2D.create(0, paddle.shape.height))
    const bottomRight = paddle.position.add(Vector2D.create(paddle.shape.width, paddle.shape.height))

    const closestPointOnLeft = this.#closestPointOnLine(ball.position, topLeft, bottomLeft)
    const closestPointOnRight = this.#closestPointOnLine(ball.position, topRight, bottomRight)
    const closestPointOnTop = this.#closestPointOnLine(ball.position, topLeft, topRight)
    const closestPointOnBottom = this.#closestPointOnLine(ball.position, bottomLeft, bottomRight)

    // Find the closest among them
    let closestPoint = closestPointOnLeft
    let minDistance = ball.position.subtract(closestPointOnLeft).length

    const checkAndUpdateClosest = (point: Vector2D) => {
      const distance = ball.position.subtract(point).length
      if (distance < minDistance) {
        closestPoint = point
        minDistance = distance
      }
    }

    checkAndUpdateClosest(closestPointOnRight)
    checkAndUpdateClosest(closestPointOnTop)
    checkAndUpdateClosest(closestPointOnBottom)

    return closestPoint
  }

  #closestPointOnLine(point: Vector2D, lineStart: Vector2D, lineEnd: Vector2D): Vector2D {
    const lineVector = lineEnd.subtract(lineStart)
    const pointToLineStart = point.subtract(lineStart)
    const projection = Vector2D.dot(pointToLineStart, lineVector.normalize())

    if (projection <= 0)
      return lineStart

    if (projection >= lineVector.length)
      return lineEnd

    return lineStart.add(lineVector.normalize().multiply(projection))
  }
}
