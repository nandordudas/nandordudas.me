import type { Renderer } from './renderer'
import type { Identifiable, Particle } from '../types'

import createDebug from 'debug'

import { canvasCoordinates, closestPointBallToWall, collisionResponseBallToWall, isBall, isBallCollidingToWall, isLine, isNet, isPoint, paddleCoordinates, penetrationResolutionBallToWall } from '../helpers'

import { Line, Net, Paddle, Wall } from './line'
import { Ball } from './point'
import { Vector } from './vector'

const debug = createDebug('worker:physics-engine')

export class PhysicsEngine {
  particles: (Particle & Identifiable)[] = []

  #ball: Ball = new Ball(new Vector(20, 20), new Vector(120, 120), Vector.zero())
  #walls: Wall[] = []

  constructor(public renderer: Renderer) {
    debug('init')

    const { bottom, center, top } = canvasCoordinates(renderer.context.canvas, { x: 10, y: 10 })
    const { left, right } = paddleCoordinates(renderer.context.canvas)

    this.#walls = [
      new Wall(top.left, top.right),
      new Wall(top.right, bottom.right), // Left wall
      new Wall(bottom.left, bottom.right),
      new Wall(top.left, bottom.left), // Right wall
      new Paddle(left.top, left.bottom), // Left paddle
      new Paddle(right.top, right.bottom), // Right paddle
    ]

    // Particle order is important because it's drawn from top to bottom on the canvas.
    this.particles.push(...this.#walls)
    this.particles.push(new Net(center.vertical.top, center.vertical.bottom))
    this.particles.push(this.#ball)

    this.particles.forEach(particle => debug(particle.id))
  }

  update: FrameRequestCallback = (deltaTime) => {
    this.#detectCollision()

    for (const particle of this.particles)
      this.#renderParticle(particle, deltaTime)

    // Reset dash array on each frame.
    this.renderer.context.setLineDash([])
    // You need to enable the closest point lines on the next frame.
    this.#drawClosestPointLines(true)
  }

  #renderParticle(particle: Particle, deltaTime: number): void {
    this.#renderPoint(particle, deltaTime)
    this.#renderLine(particle)
  }

  #renderPoint(particle: Particle, deltaTime: number): void {
    if (!isPoint(particle))
      return

    if (isBall(particle))
      particle.update(deltaTime)

    this.renderer.drawPoint(particle, Ball.radius)
  }

  #renderLine(particle: Particle): void {
    if (!isLine(particle))
      return

    if (isNet(particle))
      this.renderer.context.setLineDash([4, 4])

    this.renderer.drawLine(particle)
  }

  #detectCollision() {
    for (const wall of this.#walls) {
      if (!isBallCollidingToWall(this.#ball, wall))
        continue

      penetrationResolutionBallToWall(this.#ball, wall)
      collisionResponseBallToWall(this.#ball, wall)
    }
  }

  #drawClosestPointLines(isEnabled = false) {
    if (!isEnabled)
      return

    // const horizontalWalls = [this.#walls[1]!, this.#walls[3]!] as const
    // const verticalWalls = [this.#walls[0]!, this.#walls[2]!] as const

    const walls = this.#walls.filter(wall => wall.id.startsWith('Paddle'))
    const originalStrokeStyle = this.renderer.context.strokeStyle

    this.renderer.context.strokeStyle = 'rgba(255, 255, 255, 0.1)'

    for (const wall of walls) {
      const closestPoint = closestPointBallToWall(this.#ball, wall).subtract(this.#ball.position)
      const line = new Line(closestPoint.add(this.#ball.position), this.#ball.position)

      this.renderer.drawLine(line)
    }

    this.renderer.context.strokeStyle = originalStrokeStyle
  }
}
