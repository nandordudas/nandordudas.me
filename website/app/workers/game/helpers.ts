import type { Coordinate, Particle } from './types'

import { Line, Net, type Wall } from './lib/line'
import { Ball, Point } from './lib/point'
import { Vector } from './lib/vector'

export function random(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1) + min)
}

const DEFAULT_TOLERANCE: Coordinate = { x: 10, y: 10 }

export function canvasCoordinates(canvas: OffscreenCanvas, tolerance = DEFAULT_TOLERANCE) {
  const adjustment = (canvas.getContext('2d')?.lineWidth ?? 1) / 2
  const x = tolerance.x + adjustment
  const y = tolerance.y - adjustment

  const coordinates = {
    top: {
      left: { x, y },
      right: { x: canvas.width - x, y },
    },
    bottom: {
      left: { x, y: canvas.height - y },
      right: { x: canvas.width - x, y: canvas.height - y },
    },
    center: {
      horizontal: {
        left: { x, y: canvas.height / 2 - y },
        right: { x: canvas.width - x, y: canvas.height / 2 - y },
      },
      vertical: {
        top: { x: canvas.width / 2 - x, y },
        bottom: { x: canvas.width / 2 - x, y: canvas.height - y },
      },
    },
  } as const

  return coordinates
}

export function paddleCoordinates(canvas: OffscreenCanvas, length = 200) {
  return {
    left: {
      top: { x: 20, y: (canvas.height - length) / 2 },
      bottom: { x: 20, y: (canvas.height + length) / 2 },
    },
    right: {
      top: { x: canvas.width - 20, y: (canvas.height - length) / 2 },
      bottom: { x: canvas.width - 20, y: (canvas.height + length) / 2 },
    },
  }
}

export function isLine(particle: Particle): particle is Line {
  return particle instanceof Line
}

export function isNet(particle: Particle): particle is Net {
  return particle instanceof Net
}

export function isPoint(particle: Particle): particle is Point {
  return particle instanceof Point
}

export function isBall(particle: Particle): particle is Ball {
  return particle instanceof Ball
}

export function closestPointBallToWall(ball: Ball, wall: Wall): Vector {
  const ballToWallStart = wall.start.subtract(ball.position)
  const wallunit = wall.unit()

  if (Vector.dot(wallunit, ballToWallStart) > 0)
    return wall.start

  const wallEndToBall = ball.position.subtract(wall.end)

  if (Vector.dot(wallunit, wallEndToBall) > 0)
    return wall.end

  const closestDistance = Vector.dot(wallunit, ballToWallStart)
  const closestVector = wallunit.multiply(closestDistance)

  return wall.start.subtract(closestVector)
}

export function isBallCollidingToWall(ball: Ball, wall: Wall): boolean {
  const closestPoint = closestPointBallToWall(ball, wall).subtract(ball.position)

  return closestPoint.length < Ball.radius
}

export function penetrationResolutionBallToWall(ball: Ball, wall: Wall): void {
  const closestPoint = closestPointBallToWall(ball, wall)
  const penetrationVector = ball.position.subtract(closestPoint)

  ball.position = ball.position.add(penetrationVector.unit.multiply(Ball.radius - penetrationVector.length))
}

export function collisionResponseBallToWall(ball: Ball, wall: Wall): void {
  const closestPoint = closestPointBallToWall(ball, wall)
  const normal = ball.position.subtract(closestPoint).unit
  const separationVelocity = Vector.dot(ball.velocity, normal)
  const penetrationVelocity = -1 * separationVelocity * Ball.elasticity
  const velocityChange = penetrationVelocity - separationVelocity

  ball.velocity = ball.velocity.add(normal.multiply(velocityChange))
}
