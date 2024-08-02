import type { Board, Drawable, Level } from './game/type'

import { ContextMissingError } from './errors'
import { Ball } from './game/ball'
import { Direction, LEVELS, MAX_DELTA_TIME, Position } from './game/constants'
import { logger } from './game/helpers'
import { Net } from './game/net'
import { Paddle } from './game/paddle'
import { Wall } from './game/wall'
import { Vector } from './vector'

export class Game {
  public devicePixelRatio = 1.0

  private _lastTimestamp: number = 0.0
  private _rafId: number = 0
  private _context: OffscreenCanvasRenderingContext2D | null = null
  private _drawables: Drawable[] = [] as unknown as Board
  private _level: Level = 'easy'

  constructor() {
    const ball = new Ball('ball')

    ball.color = LEVELS[this._level].ball.color

    const paddles = [
      new Paddle(Position.Left),
      new Paddle(Position.Right),
    ] as const

    const walls = [
      new Wall(Position.Top),
      new Wall(Position.Right),
      new Wall(Position.Bottom),
      new Wall(Position.Left),
    ] as const

    const net = new Net('net')

    this._drawables = [ball, ...paddles, ...walls, net]

    logger.log('[Game]', 'Initialized')
  }

  public setup(): void {
    const { canvas } = this._context!
    const halfHeight = canvas.height / 2
    const halfWidth = canvas.width / 2
    const paddleLength = canvas.height / LEVELS[this._level].paddle.lengthRatio
    const halfPaddleLength = paddleLength / 2
    const paddlePadding = 8
    const paddleTop = halfHeight - halfPaddleLength
    const paddleRight = canvas.width - paddlePadding
    const paddleBottom = halfHeight + halfPaddleLength

    for (const drawable of this._drawables) {
      for (const setupMethod of [setupPaddles, setupWalls, setupNet])
        setupMethod(drawable)
    }

    function setupPaddles(drawable: Drawable): void {
      if (!(drawable instanceof Paddle))
        return

      if (drawable.hasId(Position.Left))
        drawable.setPosition(new Vector(paddlePadding, paddleTop), new Vector(paddlePadding, paddleBottom))

      if (drawable.hasId(Position.Right))
        drawable.setPosition(new Vector(paddleRight, paddleTop), new Vector(paddleRight, paddleBottom))
    }

    function setupWalls(drawable: Drawable): void {
      if (!(drawable instanceof Wall))
        return

      setupHorizontalWalls(drawable)
      setupVerticalWalls(drawable)
    }

    function setupHorizontalWalls(drawable: Drawable): void {
      if (drawable.hasId(Position.Top))
        drawable.setPosition(new Vector(0, 0), new Vector(canvas.width, 0))

      if (drawable.hasId(Position.Bottom))
        drawable.setPosition(new Vector(0, canvas.height), new Vector(canvas.width, canvas.height))
    }

    function setupVerticalWalls(drawable: Drawable): void {
      if (drawable.hasId(Position.Right))
        drawable.setPosition(new Vector(canvas.width, 0), new Vector(canvas.width, canvas.height))

      if (drawable.hasId(Position.Left))
        drawable.setPosition(new Vector(0, 0), new Vector(0, canvas.height))
    }

    function setupNet(drawable: Drawable): void {
      if (!(drawable instanceof Net))
        return

      if (drawable.hasId('net'))
        drawable.setPosition(new Vector(halfWidth - 1, 0), new Vector(halfWidth - 1, canvas.height))
    }

    logger.log('[Game]', 'Setup done')
  }

  /**
   * The `devicePixelRatio` of the current context will be used, it  must be set
   * before starting the game and set the context.
   */
  public setContext(context: OffscreenCanvasRenderingContext2D | null): void {
    _assert(context !== null, new ContextMissingError('Context must be defined'))

    // TODO: check if devicePixelRatio is supported
    context.scale(this.devicePixelRatio, this.devicePixelRatio)

    this._context = context

    logger.log('[Game]', 'Context has been set')
  }

  public start(): void {
    this._rafId = requestAnimationFrame(this._animate.bind(this))
  }

  public stop(): void {
    cancelAnimationFrame(this._rafId)

    this._lastTimestamp = 0
    this._rafId = 0
  }

  private _setLevel(level: Level): void {
    this._level = level
  }

  private _changeLevel(direction: Direction): void {
    const precendentLevel = ['easy', 'medium', 'hard'] as const
    const currentLevel = precendentLevel.findIndex(level => level === this._level)

    if (direction === Direction.Up)
      this._setLevel(precendentLevel[currentLevel + 1] ?? 'hard')

    if (direction === Direction.Down)
      this._setLevel(precendentLevel[currentLevel - 1] ?? 'easy')
  }

  private _animate(timestamp: DOMHighResTimeStamp): void {
    const dt = Math.min(timestamp - this._lastTimestamp, MAX_DELTA_TIME)

    this._draw(dt)

    this._lastTimestamp = timestamp
    this._rafId = requestAnimationFrame(this._animate.bind(this))
  }

  private _draw(_dt: number): void {
    this._clearCanvas()
    this._drawables.forEach(drawable => drawable.draw(this._context!))
  }

  private _clearCanvas(): void {
    this._context!.clearRect(0, 0, this._context!.canvas.width, this._context!.canvas.height)
  }
}
