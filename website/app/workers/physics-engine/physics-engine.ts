import type { Color, Math, Radii, Rendering, Utils } from 'physics-engine'

import createDebug from 'debug'
import mitt, { type Emitter } from 'mitt'

createDebug.enable('webworker:*')

const debug = createDebug('webworker:physics-engine')

const enum Colors {
  White = 'rgba(255, 255, 255, 1)',
  Transparent = 'rgba(0, 0, 0, 0)',
  Tomato = 'rgba(255, 99, 71, 1)',
  Gray = 'rgba(128, 128, 128, 1)',
}

const enum Speed {
  Slow = 40,
  Normal = 100,
  Fast = 160,
}

const enum Mass {
  Zero = 0,
  UltraLight = 1e0,
  Light = 1e2,
  Medium = 1e4,
  Heavy = 1e6,
  SuperHeavy = 1e10,
}

const enum Restitution {
  /**
   * Perfectly Inelastic Collision (`0`)
   * - No bounce.
   * - Example: A ball hitting a sticky surface.
   */
  None = 0,
  /**
   * Low Restitution (`0.2 - 0.4`)
   * - Minimal bounce.
   * - Example: A ball hitting a concrete floor.
   */
  Low = 0.2,
  /**
   * Medium Restitution (`0.5 - 0.7`)
   * - Moderate bounce.
   * - Example: A tennis ball hitting a clay court.
   */
  Medium = 0.5,
  /**
   * High Restitution (`0.7 - 0.9`)
   * - Significant bounce.
   * - Example: A basketball bouncing on a hardwood floor.
   */
  High = 0.8,
  /**
   * Perfectly Elastic Collision (`1`)
   * - Full bounce.
   * - Example: _(Theoretical)_ A collision between two perfectly rigid objects in a vacuum.
   */
  Full = 1,
}

type ReadyState = 'loading' | 'complete'
type Movement = 'up' | 'down' | 'stop'
interface Coordinate { x: number, y: number }

interface State {
  readyState: ReadyState
  offscreenCanvas: OffscreenCanvas | null
  sendPort: MessagePort | null
  receivePort: MessagePort | null
  guiPort: MessagePort | null
  context: OffscreenCanvasRenderingContext2D | null
  sendMessageToChannel: MessageFunction | null
  sendMessageToGUIChannel: MessageFunction | null
  sendMessageToMain: MessageFunction
  userInput: { movement: Movement, mousemove: Coordinate }
  debug: { followMouse: boolean, fps: number }
}

const emitter = mitt<{
  error: ErrorEvent
  setup: { offscreenCanvas: OffscreenCanvas, sendPort: MessagePort, receivePort: MessagePort, guiPort: MessagePort }
  // No more events needed
}>()

type Events = typeof emitter extends Emitter<infer T> ? T : never
type EventsWithoutError = Omit<Events, 'error'>

const receiveEmitter = mitt<{
  error: ErrorEvent
  userInput:
    | { role: 'movement', movement: Movement }
    | { role: 'mousemove', position: Coordinate }
  debug:
    | { role: 'followMouse', value: boolean }
    | { role: 'setFPS', value: number }
}>()

type MessagePortEvents = typeof receiveEmitter extends Emitter<infer T> ? T : never
type _MessagePortEventsWithoutError = Omit<MessagePortEvents, 'error'>

// emitter.on('*', (title, data) => debug(title, data))
// receiveEmitter.on('*', (title, data) => debug(title, data))

const state: State = {
  readyState: 'loading',
  offscreenCanvas: null,
  sendPort: null,
  receivePort: null,
  guiPort: null,
  context: null,
  sendMessageToChannel: null,
  sendMessageToGUIChannel: null,
  sendMessageToMain: createSendMessage(postMessage),
  userInput: { movement: 'stop', mousemove: { x: 0, y: 0 } },
  debug: { followMouse: false, fps: 60 },
}

let renderer: Renderer<OffscreenCanvasRenderingContext2D> | null = null

emitter.on('setup', (data) => {
  state.offscreenCanvas = data.offscreenCanvas
  state.sendPort = data.receivePort
  state.receivePort = data.sendPort
  state.guiPort = data.guiPort
  state.context = state.offscreenCanvas.getContext('2d')

  assert(state.sendPort !== null, 'Failed to get send port')
  assert(state.receivePort !== null, 'Failed to get receive port')
  assert(state.guiPort !== null, 'Failed to get GUI port')
  assert(state.context !== null, 'Failed to get 2D context from offscreen canvas')

  state.receivePort.addEventListener('message', event => receiveEmitter.emit(event.data.type, event.data.data))
  state.receivePort.start()
  state.sendMessageToMain({ type: 'setup', data: 'complete' })

  state.sendMessageToChannel = createSendMessage(data.sendPort)
  state.sendMessageToGUIChannel = createSendMessage(data.guiPort)
  state.readyState = 'complete'

  renderer = Renderer.create(state.context)
  const drawer = new Drawer(renderer)

  // const circle = Circle.create({ position: vector(400, 200), radius: 45 })
  // // const line = Line.create({ start: vector(200, 200), end: vector(300, 300) })
  // const circle_100x100 = Circle.create({ position: vector(100, 100), radius: 40 })
  // const rectangle = Rectangle.create({ position: vector(10, 10), width: 100, height: 100 })

  renderer.setFPS(state.debug.fps) // Default to 60 FPS. Do not set greater than 60 FPS.
  renderer.setFPSUpdateCallback((fps) => {
    const data = {
      fps,
    } as const

    state.sendMessageToGUIChannel?.({ type: 'update', data })
  })

  const ball = Ball.create({
    radius: 4,
    mass: Mass.UltraLight,
    restitution: Restitution.High,
    acceleration: vector(0, 0),
    velocity: vector(Speed.Slow, Speed.Slow),
  }).setPosition(vector(40, 20))

  const line = LineSegment.create({
    start: vector(200, 200),
    end: vector(300, 300),
    mass: Mass.SuperHeavy,
    restitution: Restitution.High,
    velocity: vector(10, 10),
    acceleration: vector(),
  })

  const box = Box.create({
    width: 50,
    height: 50,
    mass: Mass.Heavy,
    restitution: Restitution.High,
    velocity: vector(),
    acceleration: vector(),
  }).setPosition(vector(100, 100))

  const rectangle = Box.create({
    width: 50,
    height: 50,
    mass: Mass.Heavy,
    restitution: Restitution.High,
    velocity: vector(10, 10),
    acceleration: vector(),
  })

  rectangle
    .setPosition(vector(300, 300))
    .setDrawOptions({ fill: Colors.Transparent, stroke: Colors.White })

  const shapeBodyAggregators: ShapeBodyAggregator<Shape>[] = []

  const renderCallback: RenderCallback = (deltaTime: number) => {
    for (const shapeBodyAggregator of shapeBodyAggregators)
      drawer.draw(shapeBodyAggregator.shape, shapeBodyAggregator.getDrawerOptions())

    if (state.debug.followMouse)
      drawPoint(vector(state.userInput.mousemove.x, state.userInput.mousemove.y))

    // TODO: need more work on this
    function drawPoint(vector: Vector2D): Vector2D {
      const text = JSON.stringify(vector)

      drawer.safeDraw((context) => {
        context.font = '12px JetBrains Mono, monospace'
        const shape = Circle.create({ position: vector, radius: 2 })

        context.fillStyle = Colors.White

        clampTextAlign(context, text, vector.x + 12, context.canvas.width, vector.y + 12, context.canvas.height)

        const offsetX = context.textAlign === 'center' ? 0 : -12
        const baselineOffset = context.textBaseline === 'middle' ? 0 : 12
        const offset = {
          x: context.textAlign === 'end' ? 12 : offsetX,
          y: context.textBaseline === 'bottom' ? -12 : baselineOffset,
        }

        context.fillText(text, vector.x - offset.x, vector.y + offset.y)
        drawer.draw(shape, { stroke: Colors.Transparent, fill: Colors.Gray })
      })

      return vector
    }
  }

  renderer.render(renderCallback)
})

function clampTextAlign(
  context: OffscreenCanvasRenderingContext2D,
  text: string,
  x: number,
  canvasWidth: number,
  y: number,
  canvasHeight: number,
): void {
  const textWidth = context.measureText(text).width
  const textHeight = context.measureText('M').width // Use a single character to get the height
  const availableSpaceX = canvasWidth - x
  const availableSpaceY = canvasHeight - y

  // Horizontal alignment
  if (availableSpaceX < textWidth / 2)
    context.textAlign = 'end'
  else if (availableSpaceX < textWidth)
    context.textAlign = 'center'
  else
    context.textAlign = 'start'

  // Vertical alignment
  if (availableSpaceY < textHeight / 2)
    context.textBaseline = 'bottom'
  else if (availableSpaceY < textHeight)
    context.textBaseline = 'middle'
  else
    context.textBaseline = 'top'
}

receiveEmitter.on('debug', (data) => {
  if (data.role === 'followMouse')
    state.debug.followMouse = data.value

  if (data.role === 'setFPS') {
    state.debug.fps = data.value
    renderer?.setFPS(state.debug.fps)
  }
})

receiveEmitter.on('userInput', (data) => {
  if (data.role === 'movement')
    state.userInput.movement = data.movement

  if (data.role === 'mousemove') {
    state.userInput.mousemove.x = data.position.x
    state.userInput.mousemove.y = data.position.y
  }
})

// #region Message Functions
export function errorHandler(error: ErrorEvent): void {
  emitter.emit('error', error)
}

type CustomMessageEvent<T> = MessageEvent<{ type: keyof T, data: T[keyof T] }>

export function messageEventHandler(event: CustomMessageEvent<EventsWithoutError>): void {
  emitter.emit(event.data.type, event.data.data)
}
// #endregion

// #region Helper Functions
type ErrorConstructor = new (message?: string) => Error

/**
 * Asserts that a condition is true, throwing an error if it's false.
 *
 * @param condition The condition to check.
 * @param message The error message to throw if the condition is false.
 * @param ErrorType The constructor function for the error. Defaults to {@link Error}.
 * @throws An instance of the specified error type if the condition is false.
 * @example
 * assert(true, "This won't throw")
 * assert(false, "This will throw")
 * class CustomError extends Error { }
 * assert(false, "This will throw a custom error", CustomError)
 */
function assert(
  condition: boolean,
  message: string,
  ErrorType: ErrorConstructor = Error,
): asserts condition {
  if (!condition)
    raiseError(message, ErrorType)
}

/**
 * Raises an error with the specified message and error type.
 *
 * @param message The error message.
 * @param ErrorType The constructor function for the error. Defaults to {@link Error}.
 * @throws An instance of the specified error type.
 * @example
 * raiseError("An error occurred")
 * class CustomError extends Error { }
 * raiseError("A custom error occurred", CustomError)
 */
function raiseError(
  message: string,
  ErrorType: ErrorConstructor = Error,
): never {
  throw new ErrorType(message)
}

/**
 * Checks if a value is a number.
 *
 * @param value The value to check.
 */
function isNumber(value: unknown): value is number {
  return typeof value === 'number' && !Number.isNaN(value) && Number.isFinite(value)
}

/**
 * Asserts that a value is a number.
 *
 * @param value The value to check if it is a number.
 * @param message The error message to throw if the value is not a number.
 * @throws {TypeError} If the value is not a number.
 */
function assertIsNumber(
  value: unknown,
  message: string,
): asserts value is number {
  assert(isNumber(value), message, TypeError)
}

/**
 * Creates a seeded pseudorandom number generator (PRNG) using the
 * Linear Congruential Generator (LCG) algorithm.
 *
 * @param seed Optional seed value for the PRNG. If not provided, a
 * timestamp-based seed is used for better randomness.
 * @returns A function that generates pseudorandom numbers between 0 (inclusive)
 * and 1 (exclusive).
 * @example
 * const randomGenerator = createSeededRNG()
 * randomGenerator() // => pseudorandom numbers between 0 (inclusive) and 1 (exclusive)
 * Array.from({ length: 2 }, createSeededRNG(12_345)) // [0.02040268573909998, 0.01654784823767841]
 */
export function createSeededRNG(seed?: number): () => number {
  let state = seed ?? performance.now()

  const multiplier = 1_664_525
  const increment = 1_013_904_223
  const modulus = 4_294_967_296 // 2 ** 32 = 4_294_967_296

  return () => {
    state = (state * multiplier + increment) & (modulus - 1) // Efficient modulo operation instead of %

    return state / modulus
  }
}
// #endregion

// #region Vector2D
/**
 * Creates a new 2D vector with the given components. If no components are
 * provided, the vector will default to the zero vector. The components must be
 * numbers.
 *
 * @param x The x component of the vector. Defaults to 0.
 * @param y The y component of the vector. Defaults to 0.
 * @throws {TypeError} If the x or y component is not a number.
 * @example
 * vector() // => Vector2D(0, 0)
 * vector(1, 2) // => Vector2D(1, 2)
 */
function vector(x = 0, y = 0): Vector2D {
  return Vector2D.create(x, y)
}

/**
 * This class represents a 2D vector that allows for direct modification of its
 * components. It provides essential arithmetic operations and can be created
 * using the {@link Vector2D.create} method. To obtain a copy of the vector, the
 * {@link Vector2D.clone} method can be employed.
 *
 * @param x The x component of the vector.
 * @param y The y component of the vector.
 * @throws {TypeError} If the x or y component is not a number.
 * @example
 * Vector2D.create(1, 2) // => Vector2D(1, 2)
 * Vector2D.create(1, 2).dotProduct(Vector2D.create(3, 4)) // => 11
 */
class Vector2D implements Math.Vector2D {
  public static create(
    x: number,
    y: number,
  ): Vector2D {
    return new Vector2D(x, y)
  }

  public static zero(): Vector2D {
    return Vector2D.create(0, 0)
  }

  public static one(): Vector2D {
    return Vector2D.create(1, 1)
  }

  /**
   * Generates a random 2D vector.
   *
   * @param scale The scale of the random vector, can be a number or a vector. Defaults to 1.
   * @param rng A random number generator function. Defaults to {@link Math.random}.
   * @example
   * Vector2D.random() // => random values between 0 and 1
   * Vector2D.random(2) // => random values between 0 and 2
   * Vector2D.random(Vector2D.create(2, 3)) // => Vector2D(1.234, 2.345)
   * Vector2D.random(1, () => 0.5) // => Vector2D(0.5, 0.5)
   * Vector2D.random(1, createSeededRNG(12_345)) // => Vector2D(0.02040268573909998, 0.01654784823767841)
   * Vector2D.random(1, createSeededRNG()) // => pseudorandom numbers between 0 (inclusive) and 1 (exclusive)
   */
  public static random(scale?: number, rng?: () => number): Vector2D
  public static random<T extends Math.Vector2D>(vector: T, rng?: () => number): Vector2D
  public static random<T extends Math.Vector2D>(value: number | T = 1, rng: () => number = Math.random): Vector2D {
    const vector = Vector2D.create(rng(), rng())

    return vector.multiply(value as any)
  }

  public static midpoint<T extends Math.Vector2D>(v: T, w: T): Vector2D {
    return Vector2D.create((v.x + w.x) / 2, (v.y + w.y) / 2)
  }

  /**
   * @param x The x component of the vector.
   * @param y The y component of the vector.
   * @throws {TypeError} If the x or y component is not a number.
   */
  private constructor(
    public x: number,
    public y: number,
  ) {
    assertIsNumber(x, 'Component x must be a number')
    assertIsNumber(y, 'Component y must be a number')
  }

  public clone(): Vector2D {
    return Vector2D.create(this.x, this.y)
  }

  public isZero(): this is Vector2D & Math.ZeroCoordinates2D {
    return this.x === 0 && this.y === 0
  }

  public add(scalar: number): this
  public add<T extends Math.Vector2D>(vector: T): this
  public add<T extends Math.Vector2D>(value: number | T): this {
    if (isNumber(value)) {
      this.x += value
      this.y += value
    }
    else {
      this.x += value.x
      this.y += value.y
    }

    return this
  }

  public subtract(scalar: number): this
  public subtract<T extends Math.Vector2D>(vector: T): this
  public subtract<T extends Math.Vector2D>(value: number | T): this {
    if (isNumber(value)) {
      this.x -= value
      this.y -= value
    }
    else {
      this.x -= value.x
      this.y -= value.y
    }

    return this
  }

  public multiply(scalar: number): this
  public multiply<T extends Math.Vector2D>(vector: T): this
  public multiply<T extends Math.Vector2D>(value: number | T): this {
    if (isNumber(value)) {
      this.x *= value
      this.y *= value
    }
    else {
      this.x *= value.x
      this.y *= value.y
    }

    return this
  }

  /**
   * @throws {RangeError} If the value is zero or has zero components.
   */
  public divide(scalar: number): this
  public divide<T extends Math.Vector2D>(vector: T): this
  public divide<T extends Math.Vector2D>(value: number | T): this {
    this._ensureNonZero(value)

    if (isNumber(value)) {
      this.x /= value
      this.y /= value
    }
    else {
      this.x /= value.x
      this.y /= value.y
    }

    return this
  }

  public magnitudeSquared(): number {
    if (this.isZero())
      return 0

    return this.x * this.x + this.y * this.y
  }

  public magnitude(): number {
    if (this.isZero())
      return 0

    return Math.hypot(this.x, this.y)
  }

  public normalize(): this {
    const magnitude = this.magnitude()

    if (magnitude === 0)
      return this

    return this.divide(magnitude)
  }

  public dotProduct<T extends Math.Vector2D>(vector: T): number {
    if (this.isZero() || vector.isZero())
      return 0

    return this.x * vector.x + this.y * vector.y
  }

  public crossProduct<T extends Math.Vector2D>(vector: T): number {
    if (this.isZero() || vector.isZero())
      return 0

    return this.x * vector.y - this.y * vector.x
  }

  public distanceToSquared<T extends Math.Vector2D>(vector: T): number {
    if (this.isZero())
      return 0

    const x = this.x - vector.x
    const y = this.y - vector.y

    return x * x + y * y
  }

  public distanceTo<T extends Math.Vector2D>(vector: T): number {
    if (this.isZero())
      return 0

    return Math.hypot(this.x - vector.x, this.y - vector.y)
  }

  /**
   * @example
   * const vector = Vector2D.create(1, 2)
   * vector.toString() // => Vector2D(1, 2)
   * JSON.stringify(vector) // => {"x":1,"y":2}
   */
  public toString(): string {
    return `Vector2D(${this.x}, ${this.y})`
  }

  *[Symbol.iterator](): Generator<number> {
    yield this.x
    yield this.y
  }

  /**
   * @param value The value to check if it is a number or a vector.
   * @throws {RangeError} If the value is zero or has zero components.
   */
  private _ensureNonZero<T extends Math.Vector2D>(value: number | T): void {
    if (isNumber(value))
      return assert(value !== 0, 'Cannot divide by zero', RangeError)

    assert(value.x !== 0, 'Cannot divide by zero x', RangeError)
    assert(value.y !== 0, 'Cannot divide by zero y', RangeError)
  }
}
// #endregion

// #region Rendering
type RenderCallback = (deltaTime: number) => void
type FPSUpdateCallback = (fps: number) => void

const ONE_TAUSEND = 1_000

/**
 * This renderer ensures a consistent frame rate by utilizing the
 * {@link requestAnimationFrame} API. It can render frames onto either an
 * {@link OffscreenCanvasRenderingContext2D} (for use within {@link Worker}s) or
 * a {@link CanvasRenderingContext2D} (for the main thread), adapting to the
 * specific environment where it's deployed.
 *
 * @param context The 2D rendering context to render the frames.
 * @throws {TypeError} If the context is not a 2D rendering context.
 * @example
 * const canvas = new OffscreenCanvas(800, 600)
 * const renderer = Renderer.create(canvas.getContext('2d')!)
 * renderer.setFPS(60)
 * renderer.setFPSUpdateCallback(console.log)
 * const renderCallback: RenderCallback = (deltaTime) => {
 *  // Render the frame
 * }
 * renderer.render(renderCallback)
 * renderer.stop()
 */
class Renderer<T extends Rendering.Context2D> implements Rendering.RendererContract<T> {
  public static create<T extends Rendering.Context2D>(context: T): Renderer<T> {
    return new Renderer(context as any)
  }

  private _rafId: number | null = null
  private _lastTimestamp: number | null = null
  private _targetFPS: number = 60
  private _frameInterval: number = ONE_TAUSEND / this._targetFPS
  private _frameCount: number = 0
  private _lastFpsUpdateTime: number = 0
  private _realFPS: number = 0
  private _callback: RenderCallback | null = null
  private _onFPSUpdate: FPSUpdateCallback | null = null

  public get context(): T {
    return this._context as T
  }

  public get realFPS(): number {
    return this._realFPS
  }

  private constructor(private _context: OffscreenCanvasRenderingContext2D) {
    assert(_context !== null, 'Context must be a 2D rendering context')
  }

  public render(callback: RenderCallback): void {
    this.stop()
    this._callback = callback
    this._resetAnimationState()
    this._rafId = requestAnimationFrame(this._animate)
  }

  public stop(): void {
    if (this._rafId === null)
      return

    cancelAnimationFrame(this._rafId)
    this._rafId = null
  }

  public setFPS(value: number): void {
    this._targetFPS = value
    this._frameInterval = ONE_TAUSEND / value
  }

  public setFPSUpdateCallback(callback: FPSUpdateCallback): void {
    this._onFPSUpdate = callback
  }

  private _clearCanvas(): void {
    const { canvas } = this._context

    this._context.clearRect(0, 0, canvas.width, canvas.height)
  }

  private _animate = (timestamp: number): void => {
    this._lastTimestamp ??= timestamp

    const elapsedTime = timestamp - this._lastTimestamp

    if (elapsedTime >= this._frameInterval) {
      const deltaTime = elapsedTime / ONE_TAUSEND

      this._renderFrame(deltaTime)
      this._updateFPSMetrics(timestamp)
      this._lastTimestamp = timestamp - (elapsedTime % this._frameInterval)
    }

    this._rafId = requestAnimationFrame(this._animate)
  }

  private _renderFrame(deltaTime: number): void {
    this._clearCanvas()
    this._callback?.(deltaTime)
  }

  private _updateFPSMetrics(timestamp: number): void {
    this._frameCount++

    if (timestamp - this._lastFpsUpdateTime < ONE_TAUSEND)
      return

    const frameRate = this._frameCount * ONE_TAUSEND
    const timeDifference = timestamp - this._lastFpsUpdateTime

    this._realFPS = Math.round(frameRate / timeDifference)
    this._onFPSUpdate?.(this._realFPS)
    this._frameCount = 0
    this._lastFpsUpdateTime = timestamp
  }

  private _resetAnimationState(): void {
    this._lastTimestamp = null
    this._frameCount = 0
    this._lastFpsUpdateTime = performance.now()
  }
}
// #endregion

// #region Shapes
interface ShapeContract {
  position: Vector2D
  width: number
  height: number
}

abstract class Shape implements ShapeContract {
  public static readonly ZERO_WIDTH = 0
  public static readonly ZERO_HEIGHT = 0

  protected static _createOptions: readonly string[]

  // TODO: Implement the `create` method for the `Shape` class instead of the subclasses.

  constructor(
    public readonly position: Vector2D,
    public readonly width: number,
    public readonly height: number,
  ) { }

  /**
   * Experimental method to determine the center of the shape.
   */
  public abstract center(): Vector2D

  public isInstanceOf<T extends Shape>(type: Utils.Constructor<T>): this is T {
    return this instanceof type
  }
}

interface CircleContract extends ShapeContract {
  radius: number
}

class Circle extends Shape implements CircleContract {
  protected static override _createOptions = ['position', 'radius'] as const

  public static create({
    position,
    radius,
  }: Utils.PickArray<CircleContract, typeof this._createOptions>): Circle {
    return new Circle(position, radius)
  }

  constructor(
    public override readonly position: Vector2D,
    public readonly radius: number,
  ) {
    const diameter = radius * 2

    super(position, diameter, diameter)
  }

  public override center(): Vector2D {
    return this.position
  }
}

class Rectangle extends Shape {
  protected static override _createOptions = ['position', 'width', 'height'] as const

  public static create({
    position,
    height,
    width,
  }: Utils.PickArray<ShapeContract, typeof this._createOptions>): Rectangle {
    return new Rectangle(position, width, height)
  }

  public override center(): Vector2D {
    return Vector2D.create(this.position.x - this.width / 2, this.position.y - this.height / 2)
  }
}

interface LineContract extends ShapeContract {
  start: Vector2D
  end: Vector2D
}

class Line extends Shape implements LineContract {
  protected static override _createOptions = ['start', 'end'] as const

  public static create({
    start,
    end,
  }: Utils.PickArray<LineContract, typeof this._createOptions>): Line {
    return new Line(start, end)
  }

  constructor(
    public readonly start: Vector2D,
    public readonly end: Vector2D,
  ) {
    super(start, Shape.ZERO_WIDTH, Shape.ZERO_HEIGHT)
  }

  public override center(): Vector2D {
    return Vector2D.midpoint(this.start, this.end)
  }

  public length(): number {
    return this.start.distanceTo(this.end)
  }
}
// #endregion

// #region Drawing
interface DrawCircleOptions {
  stroke?: Color
  fill?: Color
}

interface DrawLineOptions {
  stroke?: Color
}

interface DrawRectangleOptions {
  stroke?: Color
  fill?: Color
  radii?: Radii
}

type DrawOptions<T extends Shape> =
  T extends Circle ? DrawCircleOptions :
    T extends Line ? DrawLineOptions :
      T extends Rectangle ? DrawRectangleOptions :
        never

class Drawer<T extends Rendering.Context2D> {
  /**
   * The mathematical constant tau (τ), equivalent to 2π, which represents the
   * ratio of a circle's circumference to its radius.
   * @example
   * Math.PI * 2 // => 6.283185307179586
   */
  public static readonly TAU = Math.PI * 2

  private get _context(): T {
    return this._renderer.context
  }

  constructor(private _renderer: Renderer<T>) { }

  public draw<T extends Shape>(shape: T, options: DrawOptions<T>): void {
    if (shape.isInstanceOf(Circle))
      this._drawCircle(shape, options)
    else if (shape.isInstanceOf(Line))
      this._drawLine(shape, options)
    else if (shape.isInstanceOf(Rectangle))
      this._drawRectangle(shape, options)
  }

  public safeDraw(callback: (context: T) => void): void {
    this._context.save()
    callback(this._context)
    this._context.restore()
  }

  private _drawCircle(shape: Circle, options: DrawCircleOptions = {}): void {
    const { stroke = Colors.White, fill = Colors.Tomato } = options

    this._context.beginPath()
    this._context.arc(shape.position.x, shape.position.y, shape.radius, 0, Drawer.TAU)
    this._context.fillStyle = fill
    this._context.fill()
    this._context.strokeStyle = stroke
    this._context.stroke()
  }

  private _drawLine(shape: Line, options: DrawLineOptions = {}): void {
    const { stroke = Colors.White } = options

    this._context.beginPath()
    this._context.moveTo(shape.start.x, shape.start.y)
    this._context.lineTo(shape.end.x, shape.end.y)
    this._context.strokeStyle = stroke
    this._context.stroke()
  }

  private _drawRectangle(shape: Rectangle, options: DrawRectangleOptions = {}): void {
    const { stroke = Colors.White, fill = Colors.Tomato, radii = 0 } = options

    this._context.beginPath()
    this._context.roundRect(shape.position.x, shape.position.y, shape.width, shape.height, radii)
    this._context.fillStyle = fill
    this._context.fill()
    this._context.strokeStyle = stroke
    this._context.stroke()
  }
}
// #endregion

// #region Physics
interface PhysicsBodyContract {
  position: Vector2D
  velocity: Vector2D
  acceleration: Vector2D
  mass: number
  inverseMass: number
  restitution: number
  // friction: number // TODO: add friction enum
}

class PhysicsBody implements PhysicsBodyContract {
  protected static _createOptions = ['position', 'velocity', 'acceleration', 'mass', 'restitution'] as const

  public static create({
    position,
    velocity,
    acceleration,
    mass,
    restitution,
  }: Utils.PickArray<PhysicsBodyContract, typeof this._createOptions>): PhysicsBody {
    return new PhysicsBody(position, velocity, acceleration, mass, restitution)
  }

  private _inverseMass: number

  public get inverseMass(): number {
    return this._inverseMass
  }

  constructor(
    public readonly position: Vector2D,
    public readonly velocity: Vector2D,
    public readonly acceleration: Vector2D,
    public readonly mass: Mass,
    public readonly restitution: Restitution,
  ) {
    assert(
      restitution <= Restitution.Full && restitution >= Restitution.None,
      'Restitution must be between 0 and 1',
      RangeError,
    )
    assert(mass >= Mass.Zero, 'Mass must be positive', RangeError)

    this._inverseMass = mass === Mass.Zero ? Mass.Zero : 1 / mass
  }

  public update(deltaTime: number): void {
    this.velocity.add(this.acceleration.clone().multiply(deltaTime))
    this.position.add(this.velocity.clone().multiply(deltaTime))
  }

  public isInstanceOf<T extends PhysicsBody>(type: Utils.Constructor<T>): this is T {
    return this instanceof type
  }
}

abstract class ShapeBodyAggregator<T extends Shape> {
  public get position(): Vector2D {
    return this.physicsBody.position
  }

  protected _drawOptions: DrawOptions<T> = {} as DrawOptions<T>

  constructor(
    public shape: T,
    public physicsBody: PhysicsBody,
  ) {
    assert(
      shape.position === physicsBody.position,
      'Shape and physics body must have the same position',
      RangeError,
    )
  }

  public setPosition(position: Vector2D): this {
    this.shape.position.x = position.x
    this.shape.position.y = position.y
    this.physicsBody.position.x = position.x
    this.physicsBody.position.y = position.y

    return this
  }

  public getDrawerOptions<T extends this['shape']>(): DrawOptions<T> {
    return this._drawOptions
  }

  public setDrawOptions(options: DrawOptions<T>): this {
    this._drawOptions = options

    return this
  }
}

type PhysicsBodyPartial = Omit<PhysicsBodyContract, 'inverseMass' | 'position'>

interface CreateBallOptions extends PhysicsBodyPartial {
  radius: number
}

class Ball extends ShapeBodyAggregator<Circle> {
  protected override _drawOptions: DrawCircleOptions = {
    fill: Colors.Tomato,
    stroke: Colors.Transparent,
  } as DrawCircleOptions

  public static create(options: CreateBallOptions): Ball {
    const { radius, ...bodyProps } = options
    const position = Vector2D.zero()

    return new Ball(
      Circle.create({ position, radius }),
      PhysicsBody.create({ position, ...bodyProps }),
    )
  }
}

interface CreateLineSegmentOptions extends PhysicsBodyPartial {
  start: Vector2D
  end: Vector2D
}

class LineSegment extends ShapeBodyAggregator<Line> {
  protected override _drawOptions: DrawLineOptions = {
    stroke: Colors.Tomato,
  } as DrawLineOptions

  public static create(options: CreateLineSegmentOptions): LineSegment {
    const { start, end, ...bodyProps } = options

    return new LineSegment(
      Line.create({ start, end }),
      PhysicsBody.create({ position: start, ...bodyProps }),
    )
  }
}

interface CreateBoxOptions extends PhysicsBodyPartial {
  width: number
  height: number
}

class Box extends ShapeBodyAggregator<Rectangle> {
  protected override _drawOptions: DrawRectangleOptions = {
    fill: Colors.Tomato,
    stroke: Colors.Transparent,
  } as DrawRectangleOptions

  public static create(options: CreateBoxOptions): Box {
    const { width, height, ...bodyProps } = options
    const position = Vector2D.zero()

    return new Box(
      Rectangle.create({ position, width, height }),
      PhysicsBody.create({ position, ...bodyProps }),
    )
  }
}
// #endregion
