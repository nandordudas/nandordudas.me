/// <reference path="./physics-engine.d.ts" />

import type { Math, PhysicsEngine, Utils } from 'physics-engine'

import createDebug from 'debug'
import mitt, { type EventType } from 'mitt'

createDebug.enable('worker:*')

const debug = createDebug('worker:physics-engine')

interface Events extends Record<EventType, unknown> {
  error: ErrorEvent
  stop: void
  ping: void
  setup: OffscreenCanvas
  moveUp: void
}

class Vector2D implements Math.Vector2D {
  static create(x: number, y: number): Vector2D {
    return new Vector2D(x, y)
  }

  static zero(): Vector2D {
    return Vector2D.create(0, 0)
  }

  static one(): Vector2D {
    return Vector2D.create(1, 1)
  }

  static dot(v: Vector2D, w: Vector2D): number {
    return v.x * w.x + v.y * w.y
  }

  static distance(v: Vector2D, w: Vector2D): number {
    return Math.hypot(v.x - w.x, v.y - w.y)
  }

  private constructor(
    public x: number,
    public y: number,
  ) {
    assert(isNumber(x), 'x must be a number')
    assert(isNumber(y), 'y must be a number')
  }

  clone(): Vector2D {
    return Vector2D.create(this.x, this.y)
  }

  add(scalar: number): this
  add(vector: Vector2D): this
  add(value: number | Vector2D): this {
    if (value instanceof Vector2D) {
      this.x += value.x
      this.y += value.y

      return this
    }

    this.x += value
    this.y += value

    return this
  }

  multiply(scalar: number): this
  multiply(vector: Vector2D): this
  multiply(value: number | Vector2D): this {
    if (value instanceof Vector2D) {
      this.x *= value.x
      this.y *= value.y

      return this
    }

    this.x *= value
    this.y *= value

    return this
  }

  isZero(): boolean {
    return this.x === 0 && this.y === 0
  }

  magnitude(): number {
    if (this.isZero())
      return 0

    return Math.hypot(this.x, this.y)
  }

  normalize(): this {
    if (this.isZero())
      return this

    const length = this.magnitude()

    this.x /= length
    this.y /= length

    return this
  }
}

const enum RestitutionLevel {
  MIN = 0,
  ELASTIC = 0.8,
  MAX = 1,
}

const enum MassLevel {
  ZERO = 0,
  LIGHT = 1e0,
  MEDIUM = 1e4,
  HEAVY = 1e8,
  SUPER_HEAVY = 1e12,
}

const enum SpeedLevel {
  ZERO = 0,
  MIN = 4,
  SLOW = 80,
  MEDIUM = 100,
  FAST = 120,
  MAX = 240, // Above this value, the ball will go through the boundaries
}

abstract class PhysicsBody implements PhysicsEngine.PhysicsBodyContract {
  public readonly position: Vector2D
  public readonly velocity: Vector2D
  public readonly acceleration: Vector2D
  public readonly mass: number
  public readonly restitution: number

  private readonly _inverseMass: number

  get inverseMass(): number {
    return this._inverseMass
  }

  constructor(options: Omit<Utils.InterfaceWithoutMethods<PhysicsEngine.PhysicsBodyContract>, 'inverseMass'>) {
    assert(
      options.restitution >= RestitutionLevel.MIN && options.restitution <= RestitutionLevel.MAX,
      'restitution must be between 0 and 1',
    )
    assert(options.mass > MassLevel.ZERO, 'mass must be greater than 0')

    this.position = options.position
    this.velocity = options.velocity
    this.acceleration = options.acceleration
    this.mass = options.mass
    this.restitution = options.restitution

    this._inverseMass = 1 / options.mass
  }

  abstract update(deltaTime: number): void

  isInstanceOf<T extends PhysicsBody>(type: Utils.Constructor<T>): this is T {
    return this instanceof type
  }

  applyForce(force: Vector2D): void {
    this.acceleration.add(force)
  }
}

class Renderer implements PhysicsEngine.RendererContract {
  public readonly context: OffscreenCanvasRenderingContext2D

  protected _rafId: number | null
  protected _lastTimestamp: number | null

  constructor(options: Utils.InterfaceWithoutMethods<PhysicsEngine.RendererContract>) {
    this.context = options.context

    this._rafId = null
    this._lastTimestamp = null
  }

  render(callback: FrameRequestCallback): void {
    this._rafId = requestAnimationFrame(timestamp => this._animate(callback, timestamp))
  }

  private _animate(callback: FrameRequestCallback, timestamp: number): void {
    this._lastTimestamp ??= timestamp

    const deltaTime = (timestamp - this._lastTimestamp) / 1_000

    this._clearCanvas()
    callback(deltaTime)

    this._lastTimestamp = timestamp
    this._rafId = requestAnimationFrame(timestamp => this._animate(callback, timestamp))
  }

  private _clearCanvas(): void {
    this.context.clearRect(0, 0, this.context.canvas.width, this.context.canvas.height)
  }

  private _cancelAnimationFrame(): void {
    if (this._rafId === null)
      return

    cancelAnimationFrame(this._rafId)

    this._rafId = null
  }
}

abstract class Shape implements PhysicsEngine.ShapeContract {
  static readonly TAU = Math.PI * 2

  public position: Vector2D
  public readonly width: number
  public readonly height: number

  constructor(options: Utils.InterfaceWithoutMethods<PhysicsEngine.ShapeContract>) {
    this.position = options.position
    this.width = options.width
    this.height = options.height
  }

  abstract display(context: OffscreenCanvasRenderingContext2D, body: PhysicsEngine.PhysicsBodyContract): void
}

class PhysicsBodyWithShape<T extends Shape> extends PhysicsBody {
  public readonly shape: T

  constructor(options: Omit<Utils.InterfaceWithoutMethods<PhysicsEngine.PhysicsBodyContract>, 'inverseMass'> & { shape: T }) {
    super(options)

    this.shape = options.shape
  }

  override update(deltaTime: number): void {
    const velocityChange = this.acceleration.clone().multiply(deltaTime)

    this.velocity.add(velocityChange)
    const positionChange = this.velocity.clone().multiply(deltaTime)
    this.position.add(positionChange)
    this._resetAcceleration()
  }

  private _resetAcceleration(): void {
    this.acceleration.add(0)
  }
}

class Circle extends Shape {
  static readonly DEFAULT_RADIUS = 4

  public readonly radius: number

  constructor(options: Omit<Utils.InterfaceWithoutMethods<PhysicsEngine.ShapeContract>, 'width' | 'height'> & { radius: number }) {
    super(Object.assign(options, {
      width: options.radius * 2,
      height: options.radius * 2,
    }))

    this.radius = options.radius
  }

  override display(context: OffscreenCanvasRenderingContext2D, body: PhysicsBody): void {
    context.beginPath()
    context.arc(body.position.x, body.position.y, this.radius, 0, Shape.TAU)
    context.fillStyle = 'tomato'
    context.fill()
    context.strokeStyle = 'transparent'
    context.stroke()
  }
}

class Rectangle extends Shape {
  static readonly DEFAULT_WIDTH = 6
  static readonly DEFAULT_HEIGHT = 140
  static readonly DEFAULT_RADII = 4

  public readonly radii: number

  constructor(options: Utils.InterfaceWithoutMethods<PhysicsEngine.ShapeContract> & { radii: number }) {
    super(options)

    this.radii = options.radii
  }

  override display(context: OffscreenCanvasRenderingContext2D, body: PhysicsBody): void {
    context.beginPath()
    context.roundRect(body.position.x, body.position.y, this.width, this.height, this.radii)
    context.fillStyle = 'transparent'
    context.fill()
    context.strokeStyle = 'transparent'
    context.stroke()
  }
}

class Ball extends PhysicsBodyWithShape<Circle> {
  public override mass: number = MassLevel.LIGHT

  getBoundaryChecker(canvas: OffscreenCanvas): (deltaTime: number) => boolean {
    return (deltaTime) => {
      const positionChange = this.position.clone()
        .add(this.velocity.clone().multiply(deltaTime ** 2))

      return positionChange.x > canvas.width - this.shape.radius
        || positionChange.x < this.shape.radius
        || positionChange.y > canvas.height - this.shape.radius
        || positionChange.y < this.shape.radius
    }
  }
}

class Paddle extends PhysicsBodyWithShape<Rectangle> {
  moveClamped(height: number, step: SpeedLevel): void {
    const newPositionY = this.position.y + step
    const minPositionY = Board.PADDING
    const maxPositionY = height - Board.PADDING - this.shape.height

    this.position.y = clamp(newPositionY, minPositionY, maxPositionY)
  }
}

class Wall extends PhysicsBodyWithShape<Rectangle> {
  //
}

function createBall(position: Vector2D): Ball {
  return new Ball({
    position,
    velocity: Vector2D.create(SpeedLevel.MEDIUM, SpeedLevel.MEDIUM),
    acceleration: Vector2D.zero(),
    mass: MassLevel.LIGHT,
    restitution: RestitutionLevel.ELASTIC,
    shape: new Circle({
      position,
      radius: Circle.DEFAULT_RADIUS,
    }),
  })
}

function createPaddle(position: Vector2D, velocity = Vector2D.zero()): Paddle {
  return new Paddle({
    position,
    velocity,
    acceleration: Vector2D.zero(),
    mass: MassLevel.HEAVY,
    restitution: RestitutionLevel.ELASTIC,
    shape: new Rectangle({
      position,
      width: Rectangle.DEFAULT_WIDTH,
      height: Rectangle.DEFAULT_HEIGHT,
      radii: Rectangle.DEFAULT_RADII,
    }),
  })
}

function createWall(position: Vector2D, width: number, height: number): Wall {
  return new Wall({
    position,
    velocity: Vector2D.zero(),
    acceleration: Vector2D.zero(),
    mass: MassLevel.SUPER_HEAVY,
    restitution: RestitutionLevel.ELASTIC,
    shape: new Rectangle({
      position,
      width,
      height,
      radii: Rectangle.DEFAULT_RADII,
    }),
  })
}

class Board {
  static readonly PADDING: number = 20
  static readonly CORNER_RADIUS: number = 4

  private _position: Vector2D = Vector2D.create(Board.PADDING, Board.PADDING)

  display(context: OffscreenCanvasRenderingContext2D): void {
    const { width, height } = context.canvas

    context.beginPath()
    context.roundRect(
      this._position.x,
      this._position.y,
      width - Board.PADDING * 2,
      height - Board.PADDING * 2,
      Board.CORNER_RADIUS,
    )
    context.strokeStyle = 'white'
    context.stroke()
  }
}

const emitter = mitt<Events>()

const paddleVector = Vector2D.create(0, 0)

emitter.on('error', event => debug('error', event))
emitter.on('ping', () => sendMessage({ type: 'pong' }))
emitter.on('moveUp', () => paddleVector.y = -SpeedLevel.MIN)
emitter.on('moveDown', () => paddleVector.y = SpeedLevel.MIN)
emitter.on('stay', () => paddleVector.y = 0)
emitter.on('setup', (offscreenCanvas) => {
  const context = offscreenCanvas.getContext('2d')

  assert(context !== null, 'context must not be null')

  const paddleStartY = (offscreenCanvas.height - Rectangle.DEFAULT_HEIGHT) / 2
  const paddleMargin = 10

  const renderer = new Renderer({ context })
  const board = new Board()

  const ball = createBall(Vector2D.create(50, 50))
  const topWall = createWall(Vector2D.create(Board.PADDING, Board.PADDING), offscreenCanvas.width - Board.PADDING * 2, 1)
  const bottomWall = createWall(Vector2D.create(Board.PADDING, offscreenCanvas.height - Board.PADDING), offscreenCanvas.width - Board.PADDING * 2, 1)
  const leftPaddle = createPaddle(Vector2D.create(Board.PADDING + paddleMargin, paddleStartY))
  const rightPaddle = createPaddle(Vector2D.create(offscreenCanvas.width - Board.PADDING - Rectangle.DEFAULT_WIDTH - paddleMargin, paddleStartY))

  const physicsBodies: PhysicsBodyWithShape<Shape>[] = [
    ball,
    topWall,
    bottomWall,
    leftPaddle,
    rightPaddle,
  ]

  const isBallOutOfBoundaries = ball.getBoundaryChecker(offscreenCanvas)

  renderer.render((deltaTime) => {
    if (!isBallOutOfBoundaries(deltaTime))
      ball.update(deltaTime)

    board.display(renderer.context)
    leftPaddle.moveClamped(offscreenCanvas.height, paddleVector.y)

    for (const physicsBody of physicsBodies)
      physicsBody.shape.display(renderer.context, physicsBody)

    sendDebugMessage('fps', 1 / deltaTime)
    sendDebugMessage('ball', {
      position: ball.position,
      velocity: ball.velocity,
      acceleration: ball.acceleration,
    })
  })
})

// #region Event Handlers
export function messageEventHandler(event: MessageEvent<{
  type: keyof Events
  data: Events[keyof Events]
}>): void {
  // debug('messageEventHandler', event)
  emitter.emit(event.data.type, event.data.data)
}

export function errorHandler(error: ErrorEvent): void {
  emitter.emit('error', error)
}
// #endregion

// #region Utils
function assert(condition: boolean, message: string): asserts condition {
  if (!condition)
    raiseError(message)
}

function raiseError(message: string, ErrorConstructor: Utils.Constructor<Error> = Error): never {
  throw new ErrorConstructor(message)
}

function sendDebugMessage(type: string, data: any): void {
  sendMessage({ type: `debug:${type}`, data })
}

function sendMessage<T extends Record<string, any>, K extends keyof T>({
  type,
  data,
  transfer = [],
}: { type: K, data?: T[K], transfer?: Transferable[] }): void {
  const options: WindowPostMessageOptions = { transfer }

  postMessage({ type, data }, options)
}

function isNumber(value: unknown): value is number {
  return typeof value === 'number' && !Number.isNaN(value) && Number.isFinite(value)
}

function clamp(value: number, min: number, max: number): number {
  assert(min <= max, 'min must be less than or equal to max')

  return Math.min(Math.max(value, min), max)
}
// #endregion
