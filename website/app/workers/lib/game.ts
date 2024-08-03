import type { Particle } from './game/particle.base'
import type { Board, Drawable, Level, Paddles, Walls } from './game/type'

import { ContextMissingError } from './errors'
import { Ball } from './game/ball'
import { Direction, FPS, LEVELS, MAX_DELTA_TIME, Position } from './game/constants'
import { logger, randomBetween } from './game/helpers'
import { Net } from './game/net'
import { Paddle } from './game/paddle'
import { Wall } from './game/wall'
import { Vector } from './vector'

export class Game {
  public devicePixelRatio = 1.0

  private _debug: boolean = true
  private _lastTimestamp: number = 0.0
  private _rafId: number = 0
  private _context: OffscreenCanvasRenderingContext2D | null = null
  private _level: Level = 'easy'
  private _paddlePadding: number = 8
  private _paddleDirection: Direction = Direction.Stop
  private _extraSpace: number = 10

  private _ball: Ball
  private _paddles: Paddles
  private _walls: Walls
  private _net: Net
  private _drawables: Board

  constructor() {
    const ballSpeed = LEVELS[this._level].ball.speed * this.devicePixelRatio
    const ballColor = LEVELS[this._level].ball.color

    this._ball = new Ball('ball', new Vector(100, 100), new Vector(ballSpeed, ballSpeed), 4, ballColor)

    if (this._debug)
      this._ball.velocity = new Vector(randomBetween(1, 4), randomBetween(1, 4))

    this._paddles = [
      new Paddle(Position.Left),
      new Paddle(Position.Right),
    ]

    this._walls = [
      new Wall(Position.Top),
      new Wall(Position.Bottom),
    ]

    this._net = new Net('net')
    this._drawables = [this._ball, ...this._paddles, ...this._walls, this._net]

    if (this._debug)
      logger.log('[Game]', 'Initialized')
  }

  public setup(): void {
    const { canvas } = this._context!
    const halfHeight = canvas.height / 2
    const halfWidth = canvas.width / 2
    const paddleLength = canvas.height / LEVELS[this._level].paddle.lengthRatio
    const halfPaddleLength = paddleLength / 2
    const paddlePadding = this._paddlePadding
    const paddleTop = halfHeight - halfPaddleLength
    const paddleRight = canvas.width - paddlePadding
    const paddleBottom = halfHeight + halfPaddleLength

    for (const paddle of this._paddles)
      setupPaddles(paddle)

    for (const wall of this._walls)
      setupWalls(wall)

    setupNet(this._net)

    function setupPaddles(drawable: Drawable): void {
      if (drawable.hasId(Position.Left))
        drawable.setPosition(new Vector(paddlePadding, paddleTop), new Vector(paddlePadding, paddleBottom))

      if (drawable.hasId(Position.Right))
        drawable.setPosition(new Vector(paddleRight, paddleTop), new Vector(paddleRight, paddleBottom))
    }

    function setupWalls(drawable: Drawable): void {
      setupHorizontalWalls(drawable)
    }

    function setupHorizontalWalls(drawable: Drawable): void {
      if (drawable.hasId(Position.Top))
        drawable.setPosition(new Vector(0, 0), new Vector(canvas.width, 0))

      if (drawable.hasId(Position.Bottom))
        drawable.setPosition(new Vector(0, canvas.height), new Vector(canvas.width, canvas.height))
    }

    function setupNet(drawable: Drawable): void {
      drawable.setPosition(new Vector(halfWidth - 1, 0), new Vector(halfWidth - 1, canvas.height))
    }

    if (this._debug)
      logger.log('[Game]', 'Setup done')
  }

  /**
   * The `devicePixelRatio` of the current context will be used, it  must be set
   * before starting the game and set the context.
   */
  public setContext(context: OffscreenCanvasRenderingContext2D | null): void {
    _assert(context !== null, new ContextMissingError('Context must be defined'))

    this._context = context

    context.canvas.width *= this.devicePixelRatio
    context.canvas.height *= this.devicePixelRatio

    if (this._debug)
      logger.log('[Game]', 'Context has been set')
  }

  public start(): void {
    this.stop(true)

    this._rafId = requestAnimationFrame(this._animate.bind(this))

    if (this._debug)
      logger.log('[Game]', 'Started')
  }

  public stop(isStart = false): void {
    cancelAnimationFrame(this._rafId)

    this._lastTimestamp = 0
    this._rafId = 0

    if (this._debug && !isStart)
      logger.log('[Game]', 'Stopped')
  }

  public reset(): void {
    const canvas = this._context!.canvas

    // INFO: pretty wild solution, need to find a better one
    this._ball.position = new Vector(
      randomBetween(this._paddlePadding + 1, (canvas.width - this._paddlePadding) / 4 - this._paddlePadding + 1),
      randomBetween(4, canvas.height - 4),
    )

    this._ball.velocity = new Vector(randomBetween(4, 4), randomBetween(4, 4))

    this.start()
  }

  public setPaddleDirection(direction: Direction): void {
    this._paddleDirection = direction
  }

  public upgradeLevel(): void {
    this._changeLevel(Direction.Up)
  }

  // eslint-disable-next-line complexity
  private _updatePaddlePosition(dt: number): void {
    const rightPaddle = this._paddles.find(paddle => paddle.hasId(Position.Right))

    if (!rightPaddle)
      return

    const canvas = this._context!.canvas
    const paddleHeight = rightPaddle.end.y - rightPaddle.start.y
    const paddleSpeed = LEVELS[this._level].paddle.speed * (dt / FPS)

    let newStartY = rightPaddle.start.y

    switch (this._paddleDirection) {
      case Direction.Up:
        newStartY -= paddleSpeed
        break

      case Direction.Down:
        newStartY += paddleSpeed
        break

      case Direction.Stop:
        // No movement
        break
    }

    // Ensure the paddle stays within the canvas boundaries
    newStartY = Math.max(0, Math.min(canvas.height - paddleHeight, newStartY))

    const newEndY = newStartY + paddleHeight

    rightPaddle.setPosition(
      new Vector(rightPaddle.start.x, newStartY),
      new Vector(rightPaddle.end.x, newEndY),
    )

    // TODO: Find a better way to do this
    rightPaddle.velocity = new Vector(
      0,
      this._paddleDirection === Direction.Stop
        ? 0
        : (this._paddleDirection === Direction.Up ? -paddleSpeed : paddleSpeed),
    )
  }

  private _setLevel(level: Level): void {
    this._level = level
  }

  // eslint-disable-next-line complexity
  private _changeLevel(direction: Direction): void {
    const precendentLevel = ['easy', 'medium', 'hard'] as const
    const currentLevel = precendentLevel.findIndex(level => level === this._level)

    if (direction === Direction.Up)
      this._setLevel(precendentLevel[currentLevel + 1] ?? 'hard')

    if (direction === Direction.Down)
      this._setLevel(precendentLevel[currentLevel - 1] ?? 'easy')

    const ballSpeed = LEVELS[this._level].ball.speed * this.devicePixelRatio

    this._ball.velocity = this._ball.velocity.multiply(ballSpeed)

    if (this._debug)
      logger.log('[Game]', 'Changed level to', this._level)
  }

  private _move(dt: number): void {
    const rightPaddle = this._paddles.find(paddle => paddle.hasId(Position.Right))

    this._ball.move(dt)
    rightPaddle?.move(dt)
  }

  private _animate(timestamp: DOMHighResTimeStamp): void {
    const dt = Math.min(timestamp - this._lastTimestamp, MAX_DELTA_TIME)

    this._move(dt)
    this._updatePaddlePosition(dt)

    if (this._isGameOver())
      return this.stop()

    this.__checkCollisions(dt)
    this._draw(dt)

    this._lastTimestamp = timestamp
    this._rafId = requestAnimationFrame(this._animate.bind(this))

    if (!this._debug)
      return

    // INFO: enable Chrome DevTools to see FPS: Rendering / Frame Rendering Stats
    const fps = 1_000 / dt
    const lowerTreshold = 58
    const upperTreshold = 63

    if (fps < lowerTreshold || fps > upperTreshold)
      logger.log('[Game]', 'Animating', fps)
  }

  private _draw(_dt: number): void {
    this._clearCanvas()
    this._drawables.forEach(drawable => drawable.draw(this._context!))
  }

  private _clearCanvas(): void {
    this._context!.clearRect(0, 0, this._context!.canvas.width, this._context!.canvas.height)
  }

  private _isGameOver(): boolean {
    const { canvas } = this._context!
    const ballNextPosition = this._ball.position.add(this._ball.velocity)
    const leavesTheBoardHorizontally = ballNextPosition.x < -1 * this._extraSpace
      || ballNextPosition.x >= canvas.width + this._extraSpace

    return leavesTheBoardHorizontally
  }

  // INFO: double underscore means that the method is engine internal
  private __checkCollisions(_dt: number): void {
    const resolveCollision = (ball: Ball, particle: Particle): void => {
      if (!this.__isBallCollidingWithParticle(ball, particle))
        return

      this.__penetrationResolution(ball, particle)
      this.__resolveCollision(ball, particle)
    }

    for (const wall of this._walls)
      resolveCollision(this._ball, wall)

    for (const paddle of this._paddles)
      resolveCollision(this._ball, paddle)
  }

  private __penetrationResolution(ball: Ball, particle: Particle): void {
    const penetrationVector = ball.position.subtract(this.__closestPointBallToWall(ball, particle))

    ball.position = ball.position.add(
      penetrationVector.normalize().multiply(ball.radius - penetrationVector.magnitude()),
    )
  }

  private __resolveCollision(ball: Ball, particle: Particle): void {
    const normal = ball.position.subtract(this.__closestPointBallToWall(ball, particle)).normalize()
    const separationVector = Vector.dotProduct(ball.velocity, normal)
    const separationVector2 = -1 * separationVector * ball.elasticity
    const separationVectorDiff = separationVector - separationVector2

    ball.velocity = ball.velocity.add(normal.multiply(-1 * separationVectorDiff))
  }

  private __closestPointBallToWall(ball: Ball, particle: Particle): Vector {
    const wallunit = particle.unit()
    const ballToWallStart = particle.start.subtract(ball.position)

    if (Vector.dotProduct(wallunit, ballToWallStart) > 0)
      return particle.start

    const wallEndToBall = ball.position.subtract(particle.end)

    if (Vector.dotProduct(wallunit, wallEndToBall) > 0)
      return particle.end

    const closestDistance = Vector.dotProduct(wallunit, ballToWallStart)
    const closestVector = wallunit.multiply(closestDistance)

    return particle.start.subtract(closestVector)
  }

  private __isBallCollidingWithParticle(ball: Ball, particle: Particle): boolean {
    const ballToClosest = this.__closestPointBallToWall(ball, particle).subtract(ball.position)

    return ballToClosest.magnitude() <= ball.radius
  }
}
