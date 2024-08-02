import { ContextMissingError } from './errors'
import { Vector } from './vector'

const FPS = 1_000 / 60
const MAX_DELTA_TIME = FPS

const _logger = {
  // eslint-disable-next-line no-console
  log: console.log.bind(console, '[Game]'),
}

const LEVELS = {
  easy: {
    paddle: {
      lengthRatio: 2,
    },
    ball: {
      color: 'rgba(0, 255, 0, 0.5)', // lime
      speed: 2,
    },
  },
  medium: {
    paddle: {
      lengthRatio: 4,
    },
    ball: {
      color: 'orange',
      speed: 4,
    },
  },
  hard: {
    paddle: {
      lengthRatio: 6,
    },
    ball: {
      color: 'tomato',
      speed: 6,
    },
  },
} as const

type Level = keyof typeof LEVELS

const enum Position {
  Top = 'top',
  Right = 'right',
  Bottom = 'bottom',
  Left = 'left',
}

const enum Direction {
  Up = 'up',
  Down = 'down',
}

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

    const wet = new Wet('wet')

    this._drawables = [ball, ...paddles, ...walls, wet]
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
      for (const setupMethod of [setupPaddles, setupWalls, setupWet])
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

    function setupWet(drawable: Drawable): void {
      if (!(drawable instanceof Wet))
        return

      if (drawable.hasId('wet'))
        drawable.setPosition(new Vector(halfWidth - 1, 0), new Vector(halfWidth - 1, canvas.height))
    }
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

// #region HELPERS

interface Coordinate {
  x: number
  y: number
}

interface DrawArcProps {
  position: Coordinate
  radius: number
  color: string | CanvasGradient | CanvasPattern
}

function drawArc(context: OffscreenCanvasRenderingContext2D, options: DrawArcProps): void {
  const TAU = Math.PI * 2

  context.beginPath()
  context.arc(options.position.x, options.position.y, options.radius, 0, TAU)

  context.fillStyle = options.color
  context.strokeStyle = 'black'

  context.fill()
  context.stroke()
}

interface DrawLineProps {
  start: Coordinate
  end: Coordinate
  color: string | CanvasGradient | CanvasPattern
  lineWidth?: number
  dashed?: number[]
}

function drawLine(context: OffscreenCanvasRenderingContext2D, options: DrawLineProps): void {
  context.beginPath()
  context.setLineDash(options.dashed ?? [])
  context.moveTo(options.start.x, options.start.y)
  context.lineTo(options.end.x, options.end.y)

  context.strokeStyle = options.color
  context.lineWidth = options.lineWidth ?? 1

  context.stroke()
}

// #endregion

// #region DRAWABLES

interface DrawableProps {
  draw: (context: OffscreenCanvasRenderingContext2D) => void
}

abstract class Particle implements DrawableProps {
  constructor(
    public readonly id: string,
    public color: string = 'white',
    public start = new Vector(0, 0),
    public end = new Vector(0, 0),
  ) {}

  public abstract draw(_context: OffscreenCanvasRenderingContext2D): void

  public hasId(value: string): boolean {
    return this.id === value
  }

  public setPosition(start: Vector, end: Vector): void {
    this.start = start
    this.end = end
  }
}

class Ball extends Particle {
  constructor(
    public override readonly id: string,
    public position = new Vector(100, 100),
    public radius = 4,
    public override color = 'tomato',
  ) {
    super(id, color)
  }

  public override draw(context: OffscreenCanvasRenderingContext2D): void {
    drawArc(context, {
      position: this.position,
      radius: this.radius,
      color: this.color,
    })
  }
}

class Paddle extends Particle {
  constructor(
    public override readonly id: string,
    public override start = new Vector(0, 0),
    public override end = new Vector(0, 0),
    public width = 2,
    public override color = 'rgba(255, 99, 71, 0.5)', // tomato
  ) {
    super(id, color, start, end)
  }

  public override draw(context: OffscreenCanvasRenderingContext2D): void {
    drawLine(context, {
      start: new Vector(this.start.x, this.start.y),
      end: new Vector(this.end.x, this.end.y),
      color: this.color,
      lineWidth: this.width,
    })
  }
}

class Wall extends Particle {
  constructor(
    public override readonly id: string,
    public override start = new Vector(0, 0),
    public override end = new Vector(0, 0),
    public override color = 'transparent',
    public readonly segments: number[] = [],
  ) {
    super(id, color, start, end)
  }

  public override draw(context: OffscreenCanvasRenderingContext2D): void {
    drawLine(context, {
      end: this.end,
      start: this.start,
      color: this.color,
      dashed: this.segments,
    })
  }
}

class Wet extends Wall {
  constructor(
    public override readonly id: string,
    public override start = new Vector(0, 0),
    public override end = new Vector(0, 0),
    public override color = 'rgba(255, 255, 255, 0.1)',
    public override readonly segments: number[] = [10, 10],
  ) {
    super(id, start, end, color, segments)
  }
}

// #endregion

type Drawable = Ball | Paddle | Wall
type Paddles = [Paddle, Paddle]
type Walls = [Wall, Wall, Wall, Wall]
type Board = [Ball, ...Paddles, ...Walls, Wet]
