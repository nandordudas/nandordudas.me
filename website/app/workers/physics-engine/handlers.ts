import createDebug from 'debug'
import mitt, { type Emitter } from 'mitt'

createDebug.enable('worker:*')

const debug = createDebug('worker:2d-physics-engine')

// @ts-expect-error Property 'debug' does not exist on type 'typeof globalThis'.
globalThis.debug = debug

export function errorHandler(event: ErrorEvent): void {
  // physicsEngineEvents.emit('error', event)
  console.error(event.error)
}

type Constructor<T = void> = new (...args: any[]) => T

const TAU = 2 * Math.PI

const emitter = mitt<{
  error: ErrorEvent
  stop: void
  ping: void
  setup: OffscreenCanvas
  start: void
  scale: number
}>()

type Events = typeof emitter extends Emitter<infer T> ? T : never

interface MessageEventPayload {
  type: keyof Events
  data: Events[keyof Events]
}

type Color = string | CanvasGradient | CanvasPattern

interface DrawCircleOptions {
  position: Vector2D
  radius?: number
  fillColor?: Color
  strokeColor?: Color
}

interface DrawLineOptions {
  start: Vector2D
  end: Vector2D
  strokeColor?: Color
}

interface DrawRectOptions {
  position: Vector2D
  width: number
  height: number
  fillColor?: Color
  strokeColor?: Color
  radii?: number | DOMPointInit | (number | DOMPointInit)[]
}

class Renderer {
  #rafId: number | null = null
  #lastTimestamp: number | null = null

  get context(): OffscreenCanvasRenderingContext2D {
    const context = this.offscreenCanvas.getContext('2d', { alpha: true })

    _assert(context !== null, 'Failed to get 2d context')

    this.setupContext(context)

    return context
  }

  constructor(public readonly offscreenCanvas: OffscreenCanvas) { }

  setupContext(_context: OffscreenCanvasRenderingContext2D): void {
    // context.imageSmoothingEnabled = false
    // context.lineWidth = 0.5
    // context.globalCompositeOperation = 'multiply'
    // context.lineCap = 'round'
    // context.lineJoin = 'round'
  }

  render(callback: FrameRequestCallback): void {
    const animate: FrameRequestCallback = (timestamp) => {
      if (this.#lastTimestamp !== null) {
        const deltaTime = (timestamp - this.#lastTimestamp) / 1_000

        this.clearCanvas()
        callback(deltaTime)
      }

      this.#lastTimestamp = timestamp
      this.#rafId = requestAnimationFrame(animate)
    }

    this.#rafId = requestAnimationFrame(animate)
  }

  drawCircle(options: DrawCircleOptions): void {
    const { position, radius = 1, fillColor = 'tomato', strokeColor = 'tomato' } = options

    this.context.beginPath()
    this.context.arc(position.x, position.y, radius, 0, TAU)
    this.context.fillStyle = fillColor
    this.context.strokeStyle = strokeColor
    this.context.fill()
    this.context.stroke()
    this.context.closePath()
  }

  drawLine(options: DrawLineOptions): void {
    const { start, end, strokeColor = 'tomato' } = options

    this.context.beginPath()
    this.context.moveTo(start.x, start.y)
    this.context.lineTo(end.x, end.y)
    this.context.strokeStyle = strokeColor
    this.context.stroke()
    this.context.closePath()
  }

  drawRect(options: DrawRectOptions): void {
    const { position, width, height, fillColor = 'tomato', strokeColor = 'tomato', radii: roundness = 0 } = options

    this.context.beginPath()
    this.context.roundRect(position.x, position.y, width, height, roundness)
    this.context.fillStyle = fillColor
    this.context.strokeStyle = strokeColor
    this.context.fill()
    this.context.closePath()
  }

  stop(): void {
    this.cancelIteration()

    this.#lastTimestamp = null
  }

  clearCanvas(): void {
    this.context.clearRect(0, 0, this.context.canvas.width, this.context.canvas.height)
  }

  cancelIteration(): void {
    if (this.#rafId === null)
      return

    cancelAnimationFrame(this.#rafId)

    this.#rafId = null
  }
}

class Vector2D {
  static readonly #pool: Vector2D[] = []
  static readonly #POOL_LIMIT = 100

  static zero(): Vector2D {
    return Vector2D.create(0, 0)
  }

  static create(x: number, y: number): Vector2D {
    if (Vector2D.#pool.length > 0) {
      const vector = Vector2D.#pool.pop()!

      vector.x = x
      vector.y = y

      return vector
    }

    return new Vector2D(x, y)
  }

  constructor(
    public x: number,
    public y: number,
  ) { }

  add(scalar: number): this
  add(vector: Vector2D): this
  add(scalarOrVector: number | Vector2D): this {
    if (scalarOrVector instanceof Vector2D) {
      this.x += scalarOrVector.x
      this.y += scalarOrVector.y
    }
    else {
      this.x += scalarOrVector
      this.y += scalarOrVector
    }

    return this
  }

  subtract(scalar: number): this
  subtract(vector: Vector2D): this
  subtract(scalarOrVector: number | Vector2D): this {
    if (scalarOrVector instanceof Vector2D) {
      this.x -= scalarOrVector.x
      this.y -= scalarOrVector.y
    }
    else {
      this.x -= scalarOrVector
      this.y -= scalarOrVector
    }

    return this
  }

  multiply(scalar: number): this
  multiply(vector: Vector2D): this
  multiply(scalarOrVector: number | Vector2D): this {
    if (scalarOrVector instanceof Vector2D) {
      this.x *= scalarOrVector.x
      this.y *= scalarOrVector.y
    }
    else {
      this.x *= scalarOrVector
      this.y *= scalarOrVector
    }

    return this
  }

  magnitude(): number {
    return Math.sqrt(this.x * this.x + this.y * this.y)
  }

  normalize(): this {
    const magnitude = this.magnitude()

    if (magnitude === 0) {
      this.x = 0
      this.y = 0

      return this
    }

    this.x /= magnitude
    this.y /= magnitude

    return this
  }

  clone(): Vector2D {
    return new Vector2D(this.x, this.y)
  }

  dot(vector: Vector2D): number {
    return this.x * vector.x + this.y * vector.y
  }

  release(): void {
    if (Vector2D.#pool.length < Vector2D.#POOL_LIMIT)
      Vector2D.#pool.push(this)
  }

  toString(): string {
    return `(${this.x}, ${this.y})`
  }

  *[Symbol.iterator](): Generator<number> {
    yield this.x
    yield this.y
  }
}

abstract class Shape {
  abstract display(renderer: Renderer, body: Body): void

  isInstanceOf<T extends Body>(type: Constructor<T>): this is T {
    return this instanceof type
  }
}

const DEFAULT_COLOR = 'tomato'
const DEFAULT_RADII = 4

class Circle extends Shape {
  constructor(
    public readonly radius: number,
    public readonly fillColor?: Color,
    public readonly strokeColor?: Color,
  ) {
    super()
  }

  display(renderer: Renderer, body: Body): void {
    renderer.drawCircle({
      position: body.position,
      radius: this.radius,
      fillColor: this.fillColor ?? DEFAULT_COLOR,
      strokeColor: this.strokeColor ?? DEFAULT_COLOR,
    })
  }
}

class Rectangle extends Shape {
  constructor(
    public readonly width: number,
    public readonly height: number,
    public readonly fillColor?: Color,
    public readonly strokeColor?: Color,
  ) {
    super()
  }

  display(renderer: Renderer, body: Body): void {
    renderer.drawRect({
      position: body.position,
      width: this.width,
      height: this.height,
      fillColor: this.fillColor ?? DEFAULT_COLOR,
      strokeColor: this.strokeColor ?? DEFAULT_COLOR,
      radii: DEFAULT_RADII,
    })
  }
}

class Line extends Shape {
  constructor(
    public readonly end: Vector2D,
    public readonly strokeColor?: Color,
    public readonly isDashed?: boolean,
  ) {
    super()
  }

  display(renderer: Renderer, body: Body): void {
    if (this.isDashed) {
      const dashLength = 4.5

      renderer.context.setLineDash([dashLength, dashLength])
    }

    renderer.drawLine({
      start: body.position,
      end: this.end,
      strokeColor: this.strokeColor ?? DEFAULT_COLOR,
    })

    if (this.isDashed)
      renderer.context.setLineDash([])
  }
}

abstract class Body {
  id: string = ''

  readonly isStatic: boolean = false

  // get kineticEnergy(): number { }

  static isStatic(condition: boolean): (body: Body) => boolean {
    return body => body.isStatic === condition
  }

  get inverseMass(): number {
    return this.mass === 0 ? 0 : 1 / this.mass
  }

  constructor(
    public readonly mass: number,
    public readonly position: Vector2D,
    public readonly velocity: Vector2D,
    public readonly acceleration: Vector2D,
    public readonly shape: Shape,
    public readonly restitution: number = 0.8,
  ) { }

  abstract update(deltaTime: number, damping: number): void
  abstract applyForce(force: Vector2D): this
  abstract detectCollision(other: Body): boolean

  isInstanceOf<T extends Body>(type: Constructor<T>): this is T {
    return this instanceof type
  }

  updatePosition(deltaTime: number, damping = 0.99): void {
    if (this.isStatic)
      return

    this.validateDamping(damping)

    const velocity = this.velocity.clone()
    const acceleration = this.acceleration.clone()

    this.velocity.add(acceleration.multiply(deltaTime)) // v = u + at
    this.velocity.multiply(damping) // v = v * damping
    this.position.add(velocity.multiply(deltaTime)) // s = vt
    this.position.add(acceleration.multiply(0.5 * deltaTime * deltaTime)) // s = 0.5at^2

    // Reset acceleration if needed
  }

  validateDamping(damping: number): void {
    _assert(damping >= 0 && damping <= 1, 'Damping should be between 0 and 1')
  }
}

class Wall extends Body {
  constructor(
    public override readonly mass: number,
    public override readonly position: Vector2D,
    public override readonly velocity: Vector2D,
    public override readonly acceleration: Vector2D,
    public override readonly shape: Line,
  ) {
    super(mass, position, velocity, acceleration, shape)
  }

  override update(_deltaTime: number): void { }

  override applyForce(_force: Vector2D): this {
    return this
  }

  override detectCollision(other: Body): boolean {
    if (!other.isInstanceOf(Ball))
      return false

    const closestPoint = closestPointOnLineSegment(
      other.position.clone(),
      this.position.clone(),
      this.shape.end.clone(),
    )

    const toBall = other.position.clone().subtract(closestPoint)
    const distance = toBall.magnitude()

    return distance <= other.shape.radius
  }
}

class Paddle extends Body {
  constructor(
    public override readonly mass: number,
    public override readonly position: Vector2D,
    public override readonly velocity: Vector2D,
    public override readonly acceleration: Vector2D,
    public override readonly shape: Rectangle,
  ) {
    super(mass, position, velocity, acceleration, shape)
  }

  override update(_deltaTime: number): void { }

  override applyForce(_force: Vector2D): this {
    return this
  }

  override detectCollision(other: Body): boolean {
    const distance = this.position.clone().subtract(other.position).magnitude()
    const radius = other.isInstanceOf(Ball) ? other.shape.radius : 0

    return distance <= radius
  }
}

class Ball extends Body {
  readonly initialPosition: Vector2D

  constructor(
    public override readonly mass: number,
    public override readonly position: Vector2D,
    public override readonly velocity: Vector2D,
    public override readonly acceleration: Vector2D,
    public override readonly shape: Circle,
  ) {
    super(mass, position, velocity, acceleration, shape)

    this.initialPosition = position.clone()
  }

  override update(deltaTime: number, damping: number): void {
    this.updatePosition(deltaTime, damping)
  }

  override applyForce(force: Vector2D): this {
    this.acceleration.add(force)

    return this
  }

  override detectCollision(other: Body): boolean {
    const distance = this.position.clone().subtract(other.position).magnitude()
    const radius = other.isInstanceOf(Paddle) || other.isInstanceOf(Wall) ? this.shape.radius : 0

    return distance <= radius
  }

  resetPosition(): void {
    this.position.x = this.initialPosition.x
    this.position.y = this.initialPosition.y
  }
}

class StaticBody extends Body {
  override readonly isStatic = true

  override update(_deltaTime: number): void { }

  override applyForce(_force: Vector2D): this {
    return this
  }

  override detectCollision(_other: Body): boolean {
    return false
  }
}

class Net extends StaticBody { }

class World {
  readonly gravity: Vector2D = Vector2D.zero()
  readonly bodies: Body[] = []

  addBody(body: Body): void {
    this.bodies.push(body)
  }

  removeBody(body: Body): void {
    const index = this.bodies.indexOf(body)

    if (index !== -1)
      this.bodies.splice(index, 1)
  }

  clearBodies(): void {
    this.bodies.length = 0
  }
}

class Collision {
  constructor(
    public readonly bodyA: Body,
    public readonly bodyB: Body,
    public readonly normal: Vector2D,
    public readonly contactPoints: Vector2D[],
    public readonly penetrationDepth: number,
  ) { }
}

function closestPointOnLineSegment(p: Vector2D, a: Vector2D, b: Vector2D): Vector2D {
  const ap = p.subtract(a)
  const ab = b.subtract(a)
  const magnitudeAB = ab.magnitude()

  const dot = ap.dot(ab)
  const t = Math.min(1, Math.max(0, dot / magnitudeAB ** 2))

  return a.add(ab.multiply(t))
}

function closestPointOnRectangle(p: Vector2D, topLeft: Vector2D, bottomRight: Vector2D): Vector2D {
  const x = Math.max(topLeft.x, Math.min(p.x, bottomRight.x))
  const y = Math.max(topLeft.y, Math.min(p.y, bottomRight.y))

  return Vector2D.create(x, y)
}

class CollisionDetector {
  detect(bodies: Body[]): Collision[] {
    const collisions: Collision[] = []

    for (let i = 0; i < bodies.length; ++i) {
      for (let j = i + 1; j < bodies.length; ++j) {
        const bodyA = bodies[i]!
        const bodyB = bodies[j]!

        if (!bodyA.detectCollision(bodyB))
          continue

        const collision = this.checkCollision(bodyA, bodyB)

        if (collision)
          collisions.push(collision)
      }
    }

    return collisions
  }

  checkCollision(bodyA: Body, bodyB: Body): Collision | null {
    const distanceVector = bodyA.position.clone().subtract(bodyB.position)
    const closestPoint = this.getClosestPoint(bodyA, bodyB)

    if (!closestPoint)
      return null

    const penetrationDepth = 4 - distanceVector.magnitude()

    if (!penetrationDepth)
      return null

    return new Collision(
      bodyA,
      bodyB,
      distanceVector.clone().normalize(),
      [closestPoint],
      penetrationDepth,
    )
  }

  getClosestPoint(bodyA: Body, bodyB: Body): Vector2D | null {
    if (bodyA.isInstanceOf(Paddle) && bodyB.isInstanceOf(Ball))
      return this.getBallPaddleContactPoint(bodyB, bodyA)

    if (bodyA.isInstanceOf(Wall) && bodyB.isInstanceOf(Ball))
      return this.getBallWallContactPoint(bodyB, bodyA.position.clone(), bodyA.shape.end.clone())

    return null
  }

  getBallWallContactPoint(ball: Ball, wallStart: Vector2D, wallEnd: Vector2D): Vector2D | null {
    const closestPoint = closestPointOnLineSegment(ball.position.clone(), wallStart, wallEnd)

    return this.checkPointDistance(closestPoint, ball.position, ball.shape.radius)
  }

  getBallPaddleContactPoint(ball: Ball, paddle: Paddle): Vector2D | null {
    const paddleTopLeft = paddle.position.clone()
    const paddleBottomRight = paddle.position.clone().add(Vector2D.create(paddle.shape.width, paddle.shape.height))
    const closestPoint = closestPointOnRectangle(ball.position, paddleTopLeft, paddleBottomRight)

    return this.checkPointDistance(closestPoint, ball.position, ball.shape.radius)
  }

  checkPointDistance(point: Vector2D, center: Vector2D, radius: number): Vector2D | null {
    const distance = point.clone().subtract(center).magnitude()

    return distance <= radius ? point : null
  }
}

class CollisionResolver {
  resolve(collisions: Collision[]): void {
    for (const collision of collisions)
      this.resolveCollision(collision)
  }

  resolveCollision(_collision: Collision): void {
    // TODO: Implement collision resolution
    debug('collision resolved', _collision)
  }
}

class PhysicsEngine {
  static readonly DAMPING: number = 1

  constructor(
    public readonly world: World,
    public readonly collisionDetector: CollisionDetector,
    public readonly collisionResolver: CollisionResolver,
  ) { }

  update(deltaTime: number): void {
    const nonStaticBodies = this.world.bodies.filter(Body.isStatic(false))

    for (const body of nonStaticBodies)
      body.applyForce(this.world.gravity).update(deltaTime, PhysicsEngine.DAMPING)

    const collisions = this.collisionDetector.detect(nonStaticBodies)

    this.collisionResolver.resolve(collisions)
  }
}

class Board {
  static readonly PADDING: number = 20
  static readonly CORNER_RADIUS: number = 4

  readonly bodies: Body[] = []

  get center(): Vector2D {
    return Vector2D.create(this.width / 2, this.height / 2)
  }

  constructor(
    public readonly renderer: Renderer,
    public readonly width: number,
    public readonly height: number,
  ) {
    this.setup()
  }

  setup(): void {
    const netLine = new Line(Vector2D.create(this.center.x, this.height), 'white', true)
    const net = new Net(0, Vector2D.create(this.center.x, Board.PADDING), Vector2D.zero(), Vector2D.zero(), netLine)

    this.addBody(net)
  }

  addBody(obstacle: Body): void {
    this.bodies.push(obstacle)
  }

  removeBody(obstacle: Body): void {
    const index = this.bodies.indexOf(obstacle)

    if (index !== -1)
      this.bodies.splice(index, 1)
  }

  clearBodies(): void {
    this.bodies.length = 0
  }

  display(): void {
    this.displayBoardOutline()
    this.displayBodies()
  }

  displayBoardOutline() {
    const context = this.renderer.context

    context.beginPath()
    context.moveTo(Board.PADDING + Board.CORNER_RADIUS, Board.PADDING)
    context.roundRect(
      Board.PADDING,
      Board.PADDING,
      this.width - Board.PADDING,
      this.height - Board.PADDING,
      Board.CORNER_RADIUS,
    )
    context.strokeStyle = 'white'
    context.stroke()
    context.closePath()
  }

  displayBodies(): void {
    for (const body of this.bodies)
      body.shape.display(this.renderer, body)
  }

  _displayLeftScoringArea(score: number): void {
    const context = this.renderer.context

    context.fillStyle = 'white'
    context.font = '32px Inter'
    context.fillText(score.toString(), 180, Board.PADDING * 3, 32)
  }

  _displayRightScoringArea(score: number): void {
    const context = this.renderer.context

    context.fillStyle = 'white'
    context.font = '32px Inter'
    context.fillText(score.toString(), context.canvas.width - 180, Board.PADDING * 3, 32)
  }
}

class Player {
  constructor(public id: string) { }
}

const enum GameLevel {
  EASY = 1,
  MEDIUM = 2,
  HARD = 3,
}

interface GameState {
  players: Player[]
  scores: Record<string, number>
  time: number
  level: GameLevel
  isGameOver: boolean
  isRunning: boolean
}

const defaultGameState: GameState = {
  players: [],
  scores: {},
  time: 0,
  level: GameLevel.EASY,
  isGameOver: false,
  isRunning: false,
}

const enum BallSpeed {
  SLOW = 40,
  MEDIUM = 80,
  FAST = 120,
}

class Game {
  state: GameState = defaultGameState

  constructor(
    public readonly board: Board,
    public readonly physicsEngine: PhysicsEngine,
  ) {
    this.board.renderer.render(this.loop.bind(this))
  }

  start(): void {
    const ball = this.physicsEngine.world.bodies.find(body => body.isInstanceOf(Ball))

    if (this.state.isRunning)
      return ball?.resetPosition()

    this.state.isRunning = true

    ball?.velocity.add(BallSpeed.MEDIUM)
  }

  stop(): void {
    this.board.renderer.stop()
  }

  loop(deltaTime: number): void {
    this.physicsEngine.update(deltaTime)
    this.board.display()

    for (const body of this.physicsEngine.world.bodies)
      body.shape.display(this.board.renderer, body)
  }
}

const enum BodyMass {
  BALL = 10e0,
  PADDLE = 10e4,
  WALL = 10e8,
}

let game: Game | null = null

emitter.on('error', event => debug('error in worker', event))
emitter.on('stop', () => debug('stop'))
emitter.on('ping', () => postMessage({ type: 'pong' }))
emitter.on('scale', value => debug('scale', value))
emitter.on('setup', (offscreenCanvas) => {
  const world = new World()

  const topWall = new Wall(
    BodyMass.WALL,
    Vector2D.create(Board.PADDING, Board.PADDING),
    Vector2D.zero(),
    Vector2D.zero(),
    new Line(Vector2D.create(offscreenCanvas.width - Board.PADDING, Board.PADDING), 'transparent'),
  )

  topWall.id = 'top-wall'

  const bottomWall = new Wall(
    BodyMass.WALL,
    Vector2D.create(Board.PADDING, offscreenCanvas.height - Board.PADDING),
    Vector2D.zero(),
    Vector2D.zero(),
    new Line(Vector2D.create(offscreenCanvas.width - Board.PADDING, offscreenCanvas.height - Board.PADDING), 'transparent'),
  )

  bottomWall.id = 'bottom-wall'

  world.addBody(topWall)
  world.addBody(bottomWall)

  const PADDLE_WIDTH = 4
  const PADDLE_HEIGHT = 100
  const PADDLE_OFFSET = 10

  const leftPaddle = new Paddle(
    BodyMass.PADDLE,
    Vector2D.create(Board.PADDING + PADDLE_OFFSET, (offscreenCanvas.height - PADDLE_HEIGHT) / 2),
    Vector2D.zero(),
    Vector2D.zero(),
    new Rectangle(PADDLE_WIDTH, PADDLE_HEIGHT, 'white'),
  )

  leftPaddle.id = 'left-paddle'

  const rightPaddle = new Paddle(
    BodyMass.PADDLE,
    Vector2D.create(offscreenCanvas.width - Board.PADDING - PADDLE_OFFSET - PADDLE_WIDTH, (offscreenCanvas.height - PADDLE_HEIGHT) / 2),
    Vector2D.zero(),
    Vector2D.zero(),
    new Rectangle(PADDLE_WIDTH, PADDLE_HEIGHT, 'white'),
  )

  rightPaddle.id = 'right-paddle'

  world.addBody(leftPaddle)
  world.addBody(rightPaddle)

  const ball = new Ball(
    BodyMass.BALL,
    Vector2D.create((offscreenCanvas.width - Board.PADDING) / 2, offscreenCanvas.height / 2),
    Vector2D.zero(),
    Vector2D.zero(),
    new Circle(4, 'white', 'transparent'),
  )

  ball.id = 'the-ball'

  world.addBody(ball)

  game = new Game(
    new Board(
      new Renderer(offscreenCanvas),
      offscreenCanvas.width - Board.PADDING,
      offscreenCanvas.height - Board.PADDING,
    ),
    new PhysicsEngine(world, new CollisionDetector(), new CollisionResolver()),
  )
})
emitter.on('start', () => {
  _assert(game !== null, 'Game not initialized')
  game.start()
})

export function messageEventHandler(event: MessageEvent<MessageEventPayload>): void {
  // physicsEngineEvents.emit(event.data.type, event.data.data)
  emitter.emit(event.data.type, event.data.data)
}

function _raiseError(message: string, ErrorConstructor = Error): void {
  throw new ErrorConstructor(message)
}

function _assert(condition: boolean, message: string): asserts condition {
  if (!condition)
    _raiseError(message)
}

/* -------------------------------------------------------------------------- */
