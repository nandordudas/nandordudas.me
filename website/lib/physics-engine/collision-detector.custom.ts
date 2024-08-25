import type { Body } from './body'

import { Ball } from './body.ball'
import { Wall } from './body.wall'
import { CollisionDetector } from './collision-detector'
import { Vector2D } from './vector-2d'

export class CustomCollisionDetector extends CollisionDetector {
  override detectCollisions(bodies: Body[]): void {
    this.resetCollisions()

    const nonInertBodies = bodies.filter(body => !body.isInert)

    for (let i = 0; i < nonInertBodies.length; ++i) {
      for (let j = i + 1; j < bodies.length; ++j) {
        const bodyA = bodies[i]!
        const bodyB = bodies[j]!

        this.checkCollision(bodyA, bodyB)
      }
    }
  }

  protected checkCollision(bodyA: Body, bodyB: Body): void {
    if (bodyA.isInstanceOf(Ball) && bodyB.isInstanceOf(Wall))
      this.checkBallWallCollision(bodyA, bodyB, 'ball-wall')
    else if (bodyA.isInstanceOf(Wall) && bodyB.isInstanceOf(Ball))
      this.checkBallWallCollision(bodyB, bodyA, 'ball-wall')
  }

  protected checkBallWallCollision(ball: Ball, wall: Wall, type: string): void {
    const closestPoint = this.closestPointBallToWall(ball, wall)
    const distance = closestPoint.subtract(ball.position)
    const distanceLength = distance.magnitude()

    if (distanceLength < ball.shape.radius) {
      this.collisions.push({
        bodyA: ball,
        bodyB: wall,
        normal: distance.normalize(),
        depth: ball.shape.radius - distanceLength,
        contactPoint: closestPoint,
        type,
      })
    }
  }

  protected closestPointBallToWall(ball: Ball, wall: Wall): Vector2D {
    const wallVector = wall.unit()
    const wallLength = wallVector.magnitude()
    const wallDirection = wallVector.divideScalar(wallLength)
    const ballToWallStart = ball.position.subtract(wall.shape.start)
    const projection = Vector2D.dotProduct(ballToWallStart, wallDirection)

    if (projection <= 0)
      return wall.shape.start

    if (projection >= wallLength)
      return wall.shape.end

    return wall.shape.start.add(wallDirection.multiplyScalar(projection))
  }
}
