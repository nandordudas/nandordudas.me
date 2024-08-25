/// <reference path="./physics-engine.d.ts" />

import type { Color, Radii, Utils, VectorContract } from 'physics-engine'

import createDebug from 'debug'
import mitt, { type EventType } from 'mitt'

const { debug } = createUtils({ name: 'physics-engine', prefix: 'worker' })

interface Events extends Record<EventType, unknown> {
  error: ErrorEvent
  stop: void
  ping: void
  setup: OffscreenCanvas
}

// #region User Interaction
// Implement user interaction here
// #endregion

// #region Game Logic
// Implement game logic here
// #endregion

// #region Physics Engine
class Vector2D implements VectorContract {
  public static create(x: number, y: number): Vector2D {
    return new Vector2D(x, y)
  }

  public static zero(): Vector2D {
    return Vector2D.create(0, 0)
  }

  public static one(): Vector2D {
    return Vector2D.create(1, 1)
  }

  protected constructor(
    public x: number,
    public y: number,
  ) {
    assert(isNumber(x), 'x must be a number')
    assert(isNumber(y), 'y must be a number')
  }

  public clone(): Vector2D {
    return Vector2D.create(this.x, this.y)
  }

  public add(scalar: number): this
  public add(vector: Vector2D): this
  public add(scalarOrVector: number | Vector2D): this {
    if (isNumber(scalarOrVector)) {
      this.x += scalarOrVector
      this.y += scalarOrVector

      return this
    }

    this.x += scalarOrVector.x
    this.y += scalarOrVector.y

    return this
  }

  public subtract(scalar: number): this
  public subtract(vector: Vector2D): this
  public subtract(scalarOrVector: number | Vector2D): this {
    if (isNumber(scalarOrVector)) {
      this.x -= scalarOrVector
      this.y -= scalarOrVector

      return this
    }

    this.x -= scalarOrVector.x
    this.y -= scalarOrVector.y

    return this
  }

  public multiply(scalar: number): this
  public multiply(vector: Vector2D): this
  public multiply(scalarOrVector: number | Vector2D): this {
    if (isNumber(scalarOrVector)) {
      this.x *= scalarOrVector
      this.y *= scalarOrVector

      return this
    }

    this.x *= scalarOrVector.x
    this.y *= scalarOrVector.y

    return this
  }

  public distance<T extends Vector2D>(vector: T): number {
    return Math.hypot(this.x - vector.x, this.y - vector.y)
  }

  public normalize(): this {
    const length = this.distance(Vector2D.zero())

    if (length === 0) {
      this.x = 0
      this.y = 0

      return this
    }

    this.x /= length
    this.y /= length

    return this
  }

  public dot<T extends Vector2D>(vector: T): number {
    return this.x * vector.x + this.y * vector.y
  }
}

interface PhysicsEntityContract {
  position: Vector2D
  velocity: Vector2D
  acceleration: Vector2D
  mass: number
  inverseMass: number
  restitution: number
  shape: Shape
  update: (deltaTime: number) => void
  applyForce: (force: Vector2D) => this
  isInstanceOf: <T extends PhysicsEntityContract>(type: Utils.Constructor<T>) => this is T
}

abstract class PhysicsEntityBase<T extends Shape> implements PhysicsEntityContract {
  protected _inverseMass: number

  get inverseMass(): number {
    return this._inverseMass
  }

  constructor(
    public position: Vector2D,
    public velocity: Vector2D,
    public acceleration: Vector2D,
    public mass: number,
    public restitution: number,
    public shape: T,
  ) {
    assert(restitution >= 0, 'Restitution must be greater than or equal to 0')
    assert(mass > 0, 'Mass must be greater than 0')

    this._inverseMass = this.mass === 0 ? 0 : 1 / this.mass
  }

  public abstract update(deltaTime: number): void
  public abstract applyForce(force: Vector2D): this
  public abstract detectCollision(body: PhysicsEntityContract): boolean

  public isInstanceOf<T extends PhysicsEntityContract>(type: Utils.Constructor<T>): this is T {
    return this instanceof type
  }
}

abstract class PhysicsEntity<T extends Shape = Shape> extends PhysicsEntityBase<T> {
  public override update(deltaTime: number): void {
    const dampingFactor = 0.99 ** deltaTime // Time-dependent damping
    const velocityChange = this.acceleration.clone().multiply(deltaTime)

    this.velocity.add(velocityChange)
    this.velocity.multiply(dampingFactor) // Apply damping to velocity

    const positionChange = this.velocity.clone().multiply(deltaTime)

    this.position.add(positionChange)
    this.acceleration.multiply(0) // Reset acceleration
  }

  public override applyForce(force: Vector2D): this {
    const forceEffect = force.clone().multiply(this.inverseMass)

    this.acceleration.add(forceEffect)

    return this
  }

  public abstract override detectCollision(body: PhysicsEntityContract): boolean
}

interface PaddleOptions<T extends Rectangle> {
  position: Vector2D
  velocity: Vector2D
  acceleration: Vector2D
  mass: number
  restitution: number
  shape: T
}

class Paddle extends PhysicsEntity<Rectangle> {
  public static readonly DEFAULT_WIDTH: number = 4
  public static readonly DEFAULT_HEIGHT: number = 140

  constructor(options: PaddleOptions<Rectangle>) {
    const { acceleration, mass, position, restitution, shape, velocity } = options

    super(position, velocity, acceleration, mass, restitution, shape)
  }

  public override detectCollision(body: PhysicsEntityContract): boolean {
    return false
  }
}

interface WallOptions<T extends Line> {
  start: Vector2D
  end: Vector2D
  mass: number
  restitution: number
  shape: T
}

class Wall extends PhysicsEntity<Line> {
  get length(): number {
    return this.position.clone().subtract(this.velocity).distance(this.position)
  }

  constructor(options: WallOptions<Line>) {
    const { mass, start, restitution, shape } = options

    super(start, Vector2D.zero(), Vector2D.zero(), mass, restitution, shape)
  }

  public override detectCollision(body: PhysicsEntityContract): boolean {
    if (!body.isInstanceOf(Ball))
      return false

    const circle = body.shape
    const circleCenter = body.position
    const lineStart = this.shape.start
    const lineToCircle = circleCenter.clone().subtract(lineStart)
    const lineDirection = this.shape.end.clone().subtract(lineStart).normalize()
    const projection = lineToCircle.dot(lineDirection)
    const closestPoint = lineStart.clone().add(lineDirection.clone().multiply(projection))

    return closestPoint.distance(circleCenter) <= circle.radius
  }
}

interface BallOptions<T extends Circle> {
  position: Vector2D
  velocity: Vector2D
  acceleration: Vector2D
  mass: number
  restitution: number
  shape: T
}

class Ball extends PhysicsEntity<Circle> {
  constructor(options: BallOptions<Circle>) {
    const { acceleration, mass, position, restitution, shape, velocity } = options

    super(position, velocity, acceleration, mass, restitution, shape)
  }

  public override detectCollision(body: PhysicsEntityContract): boolean {
    return false
  }

  public isOutOfBoundaries(deltaTime: number): (width: number, height: number) => boolean {
    return (width: number, height: number) => {
      const nextPosition = this.position.clone()
        .add(this.velocity.clone().multiply(deltaTime))
        .add(this.acceleration.clone().multiply(deltaTime ** 2))

      const radius = this.shape.radius

      return nextPosition.x + radius >= width
        || nextPosition.x - radius <= 0
        || nextPosition.y + radius >= height
        || nextPosition.y - radius <= 0
    }
  }
}

class PhysicsEngine {
  private _gravity: Vector2D = Vector2D.create(0, 0)

  constructor(
    private _entities: PhysicsEntity[],
    private _collisionDetector: CollisionDetectorContract,
    private _collisionResolver: CollisionResolverContract,
  ) { }

  public step(deltaTime: number): void {
    sendDebugMessage('deltaTime', deltaTime)
    // Implement user interaction here

    for (const entity of this._entities)
      entity.applyForce(this._gravity).update(deltaTime) // Apply forces and update entities

    const collisions = this._collisionDetector.detectCollisions(this._entities) // Handle collisions

    if (collisions.length === 0)
      return

    this._collisionResolver.resolveCollisions(collisions) // Resolve collisions
  }
}
// #endregion

// #region Shapes
interface ShapeContract {
  display: (renderer: Renderer, body: PhysicsEntity) => void
  isInstanceOf: <T extends ShapeContract>(type: Utils.Constructor<T>) => this is T
}

abstract class ShapeBase implements ShapeContract {
  public abstract display(renderer: Renderer, body: PhysicsEntity): void

  isInstanceOf<T extends ShapeContract>(type: Utils.Constructor<T>): this is T {
    return this instanceof type
  }
}

abstract class Shape extends ShapeBase {
  public abstract override display(renderer: Renderer, body?: PhysicsEntity): void
}

class Circle extends Shape {
  public static readonly DEFAULT_RADIUS: number = 4

  constructor(
    public readonly radius: number,
    public readonly fillStyle?: Color,
    public readonly strokeStyle?: Color,
  ) { super() }

  public override display(renderer: Renderer, body: PhysicsEntity): void {
    renderer.drawCircle(this._getDrawCircleOptions(body))
  }

  private _getDrawCircleOptions(body: PhysicsEntity): DrawCircleOptions {
    return {
      position: body.position,
      radius: this.radius,
      fillStyle: this.fillStyle,
      strokeStyle: this.strokeStyle,
    }
  }
}

class Line extends Shape {
  constructor(
    public readonly start: Vector2D,
    public readonly end: Vector2D,
    public readonly strokeStyle?: Color,
    public readonly isDashed?: boolean,
  ) { super() }

  public override display(renderer: Renderer, _body: PhysicsEntity): void {
    this._preDraw(renderer, _body)
    renderer.drawLine(this._getDrawLineOptions())
    this._postDraw(renderer, _body)
  }

  protected _preDraw(_renderer: Renderer, _body: PhysicsEntity): void {
    if (!this.isDashed)
      return

    this._setLineDash(_renderer, [4.5, 4.5])
  }

  protected _postDraw(_renderer: Renderer, _body: PhysicsEntity): void {
    if (!this.isDashed)
      return

    this._resetLineDash(_renderer)
  }

  protected _getDrawLineOptions(): DrawLineOptions {
    return {
      start: this.start,
      end: this.end,
      strokeStyle: this.strokeStyle,
    }
  }

  private _setLineDash(renderer: Renderer, segments: number[]): void {
    renderer.context.setLineDash(segments)
  }

  private _resetLineDash(renderer: Renderer): void {
    renderer.context.setLineDash([])
  }
}

class Rectangle extends Shape {
  public static readonly DEFAULT_RADII: Radii = 4

  constructor(
    public readonly width: number,
    public readonly height: number,
    public readonly fillStyle?: Color,
    public readonly strokeStyle?: Color,
    public readonly radii: Radii = Rectangle.DEFAULT_RADII,
  ) { super() }

  public override display(renderer: Renderer, body: PhysicsEntity): void {
    renderer.drawRectangle(this._getDrawRectangleOptions(body))
  }

  protected _getDrawRectangleOptions(body: PhysicsEntity): DrawRectangleOptions {
    return {
      position: body.position,
      width: this.width,
      height: this.height,
      fillStyle: this.fillStyle,
      strokeStyle: this.strokeStyle,
      radii: this.radii,
    }
  }
}
// #endregion

// #region Collision
interface CollisionContract {
  bodyA: PhysicsEntity
  bodyB: PhysicsEntity
  penetrationDepth: number
  normal: Vector2D
  contactPoints: Vector2D[]
}

class Collision implements CollisionContract {
  public readonly restitution: number

  constructor(
    public bodyA: PhysicsEntity,
    public bodyB: PhysicsEntity,
    public penetrationDepth: number,
    public normal: Vector2D,
    public contactPoints: Vector2D[],
  ) {
    assert(penetrationDepth >= 0, 'Penetration depth must be greater than or equal to 0')

    this.restitution = Math.min(bodyA.restitution, bodyB.restitution)
  }
}

interface CollisionDetectorContract {
  detectCollisions: (entities: PhysicsEntity[]) => CollisionContract[]
  checkCollision: (bodyA: PhysicsEntity, bodyB: PhysicsEntity) => CollisionContract | null
}

class CollisionDetector implements CollisionDetectorContract {
  public detectCollisions(entities: PhysicsEntity[]): Collision[] {
    const collisions: Collision[] = []

    for (let i = 0; i < entities.length; ++i) {
      const bodyA = entities[i]!

      for (let j = i + 1; j < entities.length; j++) {
        const bodyB = entities[j]!
        const collision = this.checkCollision(bodyA, bodyB)

        if (collision === null)
          continue

        collisions.push(collision)
      }
    }

    return collisions
  }

  public checkCollision(bodyA: PhysicsEntity, bodyB: PhysicsEntity): Collision | null {
    if (!bodyA.detectCollision(bodyB))
      return null

    const penetrationDepth = this._getPenetrationDepth(bodyA, bodyB)
    const distanceVector = bodyB.position.clone().subtract(bodyA.position)
    const normal = distanceVector.clone().normalize()
    const contactPoints: Vector2D[] = [/* Implement contact points here */]

    return new Collision(bodyA, bodyB, penetrationDepth, normal, contactPoints)
  }

  // eslint-disable-next-line complexity
  private _getPenetrationDepth(bodyA: PhysicsEntity, bodyB: PhysicsEntity): number {
    if (bodyA.isInstanceOf(Ball) && bodyB.isInstanceOf(Wall)) {
      const ball = bodyA
      const wall = bodyB

      const circle = ball.shape
      const circleCenter = ball.position
      const lineStart = wall.shape.start
      const lineToCircle = circleCenter.clone().subtract(lineStart)
      const lineDirection = wall.shape.end.clone().subtract(lineStart).normalize()
      const projection = lineToCircle.dot(lineDirection)
      const closestPoint = lineStart.clone().add(lineDirection.clone().multiply(projection))

      return Math.abs(closestPoint.distance(circleCenter) - circle.radius)
    }

    if (bodyA.isInstanceOf(Wall) && bodyB.isInstanceOf(Ball))
      return this._getPenetrationDepth(bodyB, bodyA)

    if (bodyA.isInstanceOf(Ball) && bodyB.isInstanceOf(Paddle)) {
      const ball = bodyA
      const paddle = bodyB

      const circle = ball.shape
      const circleCenter = ball.position
      const rectangle = paddle.shape
      const rectangleCenter = paddle.position
      const rectangleHalfWidth = rectangle.width / 2
      const rectangleHalfHeight = rectangle.height / 2
      const closestPoint = Vector2D.create(
        Math.min(Math.max(circleCenter.x, rectangleCenter.x - rectangleHalfWidth), rectangleCenter.x + rectangleHalfWidth),
        Math.min(Math.max(circleCenter.y, rectangleCenter.y - rectangleHalfHeight), rectangleCenter.y + rectangleHalfHeight),
      )

      return Math.abs(closestPoint.distance(circleCenter) - circle.radius)
    }

    if (bodyA.isInstanceOf(Paddle) && bodyB.isInstanceOf(Ball))
      return this._getPenetrationDepth(bodyB, bodyA)

    return 0
  }
}

interface CollisionResolverContract {
  resolveCollisions: (collisions: CollisionContract[]) => void
  resolveCollision: (collision: CollisionContract) => void
}

class CollisionResolver implements CollisionResolverContract {
  public resolveCollisions(collisions: CollisionContract[]): void {
    for (const collision of collisions)
      this.resolveCollision(collision)
  }

  public resolveCollision(collision: CollisionContract): void {
    const { bodyA, bodyB, normal, penetrationDepth } = collision

    if (!bodyB.isInstanceOf(Ball))
      return

    const ball = bodyB
    const wallOrPaddle = bodyA as Wall | Paddle

    const relativeVelocity = wallOrPaddle.velocity.clone().subtract(ball.velocity)
    const velocityAlongNormal = relativeVelocity.dot(normal)

    if (velocityAlongNormal > 0)
      return

    debug('collision', collision)
  }
}
// #endregion

// #region Renderer
interface DrawCircleOptions {
  position: Vector2D
  radius?: number
  fillStyle?: Color
  strokeStyle?: Color
}

interface DrawLineOptions {
  start: Vector2D
  end: Vector2D
  strokeStyle?: Color
  isDashed?: boolean
}

interface DrawRectangleOptions {
  position: Vector2D
  width: number
  height: number
  fillStyle?: Color
  strokeStyle?: Color
  radii?: Radii
}

interface DrawTextOptions {
  text: string
  position: Vector2D
  fillStyle?: Color
  strokeStyle?: Color
}

interface RendererContract {
  context: OffscreenCanvasRenderingContext2D
  render: (callback: FrameRequestCallback) => void
  stop: () => void
  drawCircle: (options: DrawCircleOptions) => void
  drawLine: (options: DrawLineOptions) => void
  drawRectangle: (options: DrawRectangleOptions) => void
  drawText: (options: DrawTextOptions) => void
}

abstract class RendererBase implements RendererContract {
  protected _isStopped: boolean = false
  protected _rafId: number | null = null
  protected _lastTimestamp: number | null = null

  get context(): OffscreenCanvasRenderingContext2D {
    const context = this._offscreenCanvas.getContext('2d')

    assert(context !== null, 'Failed to get 2D rendering context from OffscreenCanvas')

    return context
  }

  constructor(private _offscreenCanvas: OffscreenCanvas) {
    this._setupContext()
  }

  public abstract render(callback: FrameRequestCallback): void
  protected abstract _setupContext(): void

  public stop(): void {
    sendDebugMessage('deltaTime', 0)

    this._isStopped = true

    this._cancelIteration()

    this._lastTimestamp = null
  }

  public drawCircle(options: DrawCircleOptions): void {
    const { position, radius = 10, fillStyle = 'black', strokeStyle = 'transparent' } = options

    this.context.beginPath()
    this.context.arc(position.x, position.y, radius, 0, Renderer.TAU)
    this.context.fillStyle = fillStyle
    this.context.fill()
    this.context.strokeStyle = strokeStyle
    this.context.stroke()
  }

  public drawLine(options: DrawLineOptions): void {
    const { start, end, strokeStyle = 'black' } = options

    this.context.beginPath()
    this.context.moveTo(start.x, start.y)
    this.context.lineTo(end.x, end.y)
    this.context.strokeStyle = strokeStyle
    this.context.stroke()
  }

  public drawRectangle(options: DrawRectangleOptions): void {
    const { position, width, height, fillStyle = 'black', strokeStyle = 'transparent', radii = 0 } = options

    this.context.beginPath()
    this.context.roundRect(position.x, position.y, width, height, radii)
    this.context.fillStyle = fillStyle
    this.context.fill()
    this.context.strokeStyle = strokeStyle
    this.context.stroke()
  }

  public drawText({ text, position, fillStyle = 'black', strokeStyle = 'transparent' }: DrawTextOptions): void {
    this.context.fillStyle = fillStyle
    this.context.strokeStyle = strokeStyle
    this.context.font = 'bold 24px Fira Code'
    this.context.textAlign = 'center'
    this.context.fillText(text, position.x, position.y)
  }

  protected _clearCanvas(): void {
    const { width, height } = this._offscreenCanvas

    this.context.clearRect(0, 0, width, height)
  }

  protected _cancelIteration(): void {
    if (this._rafId === null)
      return

    cancelAnimationFrame(this._rafId)

    this._rafId = null
  }
}

class Renderer extends RendererBase {
  public static readonly TAU = Math.PI * 2

  // Experimental feature
  private static readonly _LIMIT_DELTATIME: boolean = false

  private static readonly _FRAME_RATE: number = 1 / 60

  private static _limitDeltaTime(deltaTime: number): number {
    return this._LIMIT_DELTATIME ? Math.min(deltaTime, Renderer._FRAME_RATE) : deltaTime
  }

  public override render(callback: FrameRequestCallback): void {
    this._rafId = requestAnimationFrame(timestamp => this._animate(callback, timestamp))
  }

  protected override _setupContext(): void {
    debug('setting up 2D rendering context...')
  }

  private _animate(callback: FrameRequestCallback, timestamp: number): void {
    if (this._isStopped)
      return

    if (this._lastTimestamp !== null) {
      const deltaTime = Renderer._limitDeltaTime((timestamp - this._lastTimestamp) / 1_000)

      this._clearCanvas()
      callback(deltaTime)
    }

    this._lastTimestamp = timestamp
    this._rafId = requestAnimationFrame(timestamp => this._animate(callback, timestamp))
  }
}
// #endregion

// #region Board
interface NetOptions {
  start: Vector2D
  end: Vector2D
  strokeStyle?: Color
  isDashed?: boolean
}

class Net extends Line {
  constructor(options: NetOptions) {
    const { start, end, strokeStyle = 'white', isDashed = true } = options

    super(start, end, strokeStyle, isDashed)
  }
}

interface BoardOutlineOptions {
  width: number
  height: number
  fillStyle?: Color
  strokeStyle?: Color
  radii?: Radii
}

class BoardOutline extends Rectangle {
  constructor(options: BoardOutlineOptions) {
    const { width, height, fillStyle = 'transparent', strokeStyle = 'white', radii = Rectangle.DEFAULT_RADII } = options

    super(width, height, fillStyle, strokeStyle, radii)
  }

  public override display(renderer: Renderer): void {
    const body = new PhysicsEntity(Vector2D.create(Board.PADDING, Board.PADDING), Vector2D.zero(), Vector2D.zero(), 0.1, 0, this)

    renderer.drawRectangle(this._getDrawRectangleOptions(body))
  }
}

interface ScoreOptions {
  text: string
  position: Vector2D
  fillStyle?: Color
  strokeStyle?: Color
}

class Score extends Shape {
  private text: string
  private position: Vector2D
  private fillStyle: Color
  private strokeStyle: Color

  constructor(options: ScoreOptions) {
    super()

    const { text, position, fillStyle = 'white', strokeStyle = 'transparent' } = options

    this.text = text
    this.position = position
    this.fillStyle = fillStyle
    this.strokeStyle = strokeStyle
  }

  public override display(renderer: Renderer): void {
    renderer.drawText({
      position: this.position,
      text: this.text,
      fillStyle: this.fillStyle,
      strokeStyle: this.strokeStyle,
    })
  }
}

class Board {
  public static readonly PADDING: number = 20
  public static readonly CORNER_RADIUS: number = 4

  private _shapes: Shape[] = []

  constructor(
    public readonly width: number,
    public readonly height: number,
    public readonly renderer: Renderer,
  ) { }

  public setup(): void {
    const net = new Net({
      start: Vector2D.create(this.width / 2, Board.PADDING),
      end: Vector2D.create(this.width / 2, this.height - Board.PADDING),
    })

    this._shapes.push(net)

    const boardOutline = new BoardOutline({
      width: this.width - Board.PADDING * 2,
      height: this.height - Board.PADDING * 2,
    })

    this._shapes.push(boardOutline)

    const leftScore = new Score({
      text: '0',
      position: Vector2D.create(this.width / 4, Board.PADDING * 2.5),
    })

    this._shapes.push(leftScore)

    const rightScore = new Score({
      text: '0',
      position: Vector2D.create(this.width / 4 * 3, Board.PADDING * 2.5),
    })

    this._shapes.push(rightScore)
  }

  public display(): void {
    // INFO: Scores are hidden from the board, yet
    for (const shape of this._shapes.filter(shape => !shape.isInstanceOf(Score)))
      shape.display(this.renderer)
  }
}
// #endregion

const enum Restitution {
  BOUNCE = 0.8,
}

const enum Mass {
  BALL = 1e0,
  PADDLE = 1e4,
  WALL = 10e9,
}

const emitter = mitt<Events>()

emitter.on('error', event => debug('error', event))
emitter.on('ping', () => sendMessage({ type: 'pong' }))
emitter.on('setup', (offscreenCanvas) => {
  const bodies: PhysicsEntity[] = []

  const topWallLine = new Line(
    Vector2D.create(Board.PADDING, Board.PADDING),
    Vector2D.create(offscreenCanvas.width - Board.PADDING, Board.PADDING),
    'transparent',
  )

  const topWall = new Wall({
    start: topWallLine.start,
    end: topWallLine.end,
    mass: Mass.WALL,
    restitution: Restitution.BOUNCE,
    shape: topWallLine,
  })

  bodies.push(topWall)

  const bottomWallLine = new Line(
    Vector2D.create(Board.PADDING, offscreenCanvas.height - Board.PADDING),
    Vector2D.create(offscreenCanvas.width - Board.PADDING, offscreenCanvas.height - Board.PADDING),
    'transparent',
  )

  const bottomWall = new Wall({
    start: bottomWallLine.start,
    end: bottomWallLine.end,
    mass: Mass.WALL,
    restitution: Restitution.BOUNCE,
    shape: bottomWallLine,
  })

  bodies.push(bottomWall)

  const ball = new Ball({
    position: Vector2D.create(55, 50),
    velocity: Vector2D.create(50, 50),
    acceleration: Vector2D.zero(),
    mass: Mass.BALL,
    restitution: Restitution.BOUNCE,
    shape: new Circle(Circle.DEFAULT_RADIUS, 'tomato'),
  })

  bodies.push(ball)

  const paddleStart = (offscreenCanvas.height - Paddle.DEFAULT_HEIGHT) / 2

  const leftPaddle = new Paddle({
    position: Vector2D.create(Board.PADDING * 1.5, paddleStart),
    velocity: Vector2D.zero(),
    acceleration: Vector2D.zero(),
    mass: Mass.PADDLE,
    restitution: Restitution.BOUNCE,
    shape: new Rectangle(Paddle.DEFAULT_WIDTH, Paddle.DEFAULT_HEIGHT, 'tomato', 'transparent'),
  })

  bodies.push(leftPaddle)

  const rightPaddle = new Paddle({
    position: Vector2D.create(offscreenCanvas.width - Board.PADDING * 1.5 - Paddle.DEFAULT_WIDTH, paddleStart),
    velocity: Vector2D.zero(),
    acceleration: Vector2D.zero(),
    mass: Mass.PADDLE,
    restitution: Restitution.BOUNCE,
    shape: new Rectangle(Paddle.DEFAULT_WIDTH, Paddle.DEFAULT_HEIGHT, 'tomato', 'transparent'),
  })

  bodies.push(rightPaddle)

  const renderer = new Renderer(offscreenCanvas)
  const board = new Board(offscreenCanvas.width, offscreenCanvas.height, renderer)
  const physicsEngine = new PhysicsEngine(bodies, new CollisionDetector(), new CollisionResolver())

  board.setup()

  renderer.render((deltaTime) => {
    const isOutOfBoundaries = ball.isOutOfBoundaries(deltaTime)

    board.display()

    if (!isOutOfBoundaries(offscreenCanvas.width, offscreenCanvas.height))
      physicsEngine.step(deltaTime)

    for (const body of bodies) {
      if (body.isInstanceOf(Ball)) {
        sendDebugMessage('ball', {
          position: body.position,
          velocity: body.velocity,
          acceleration: body.acceleration,
        })
      }

      body.shape.display(renderer, body)
    }
  })
})

// #region Event Handlers
export function messageEventHandler(event: MessageEvent<{
  type: keyof Events
  data: Events[keyof Events]
}>): void {
  debug('messageEventHandler', event)
  emitter.emit(event.data.type, event.data.data)
}

export function errorHandler(error: ErrorEvent): void {
  emitter.emit('error', error)
}
// #endregion

// #region Utils
function createUtils(params: {
  name: string
  prefix: string
  isDisabled?: boolean
}) {
  if (params.isDisabled === undefined)
    createDebug.enable(`${params.prefix}:*`)

  const namespace = `${params.prefix}:${params.name}`
  const debug = createDebug(namespace)

  return { debug }
}

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
// #endregion
