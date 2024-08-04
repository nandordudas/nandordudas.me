/**
 * ts(2540) - Cannot assign to 'x' because it is a read-only property.
 */

import type { MockInstance } from 'vitest'

interface CoordinateContract {
  x: number
  y: number
}

interface LineContract {
  start: CoordinateContract
  end: CoordinateContract
  length: number
}

interface BodyContract {
  position: CoordinateContract
  velocity: Vector
  acceleration: Vector
  mass: number
}

const utils = {
  random(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1) + min)
  },
}

class DivideByZeroError extends Error {
  public override name = this.constructor.name

  constructor() {
    super('Cannot divide by zero')

    Object.setPrototypeOf(this, DivideByZeroError.prototype)
    Error.captureStackTrace(this, DivideByZeroError)
  }
}

class ContextMissingError extends Error {
  public override name = this.constructor.name

  constructor() {
    super('Context missing')

    Object.setPrototypeOf(this, ContextMissingError.prototype)
    Error.captureStackTrace(this, ContextMissingError)
  }
}

class Vector implements CoordinateContract {
  public x: number
  public y: number

  public static zero(): Vector {
    return new Vector(0, 0)
  }

  public static distance(v1: Vector, v2: CoordinateContract): number {
    return v1.subtract(v2).length
  }

  public static dot(v1: CoordinateContract, v2: CoordinateContract): number {
    return v1.x * v2.x + v1.y * v2.y
  }

  /**
   * @alias Vector#magnitude
   */
  public get length(): number {
    return this.magnitude()
  }

  /**
   * @alias Vector#normalize
   */
  public get unit(): Vector {
    return this.normalize()
  }

  public get isZero(): boolean {
    return this.x === 0 && this.y === 0
  }

  constructor(x: number, y: number)
  constructor(coords: CoordinateContract)
  constructor(xOrCoords: number | CoordinateContract, y?: number) {
    if (typeof xOrCoords === 'number') {
      this.x = xOrCoords
      this.y = y!
    }
    else {
      this.x = xOrCoords.x
      this.y = xOrCoords.y
    }
  }

  public toString(): string {
    return `${this.constructor.name}(${this.x}, ${this.y})`
  }

  public add(v: CoordinateContract): Vector {
    return new Vector(this.x + v.x, this.y + v.y)
  }

  public subtract(v: CoordinateContract): Vector {
    return this.add({ x: -v.x, y: -v.y })
  }

  public multiply(scalar: number): Vector {
    return new Vector(this.x * scalar, this.y * scalar)
  }

  public divide(scalar: number): Vector {
    return this.multiply(1 / scalar)
  }

  public clone(): Vector {
    return new Vector(this.x, this.y)
  }

  public magnitudeSquared(): number {
    return this.x * this.x + this.y * this.y
  }

  /**
   * @alias Vector#length
   */
  public magnitude(): number {
    return Math.sqrt(this.magnitudeSquared())
  }

  /**
   * @alias Vector#unit
   */
  public normalize(): Vector {
    const mag = this.magnitude()

    if (mag > 0)
      return this.multiply(1 / mag)

    return new Vector(0, 0)
  }

  public normal(): Vector {
    return new Vector(-this.y, this.x)
  }

  /**
   * @throws Will throw {@link DivideByZeroError} if `x` is zero.
   */
  public slope(): number {
    if (this.x === 0)
      throw new DivideByZeroError()

    return this.y / this.x
  }

  public randomize(from: Vector, to: Vector): Vector {
    return new Vector(utils.random(from.x, to.x), utils.random(from.y, to.y))
  }

  /**
   * @modifies This vector instance.
   */
  public invertX(): Vector {
    this.x *= -1

    return this
  }

  /**
   * @modifies This vector instance.
   */
  public invertY(): Vector {
    this.y *= -1

    return this
  }

  /**
   * @modifies This vector instance.
   */
  public invert(): Vector {
    return this.invertX().invertY()
  }

  public toArray(): [number, number] {
    return [this.x, this.y]
  }
}

class Point implements BodyContract {
  /**
   * @default Vector.zero()
   */
  public velocity: Vector = Vector.zero()

  /**
   * @default Vector.zero()
   */
  public acceleration: Vector = Vector.zero()

  /**
   * @default false
   */
  #forceApplied: boolean = false

  constructor(
    public position: Vector,

    /**
     * @default 1.0
     */
    public readonly mass: number = 1.0,
  ) { }

  /**
   * @modifies This point `instance`, `acceleration` will be updated.
   */
  public applyForce(force: Vector): void {
    this.acceleration = this.acceleration.add(force.divide(this.mass))
    this.#forceApplied = true
  }

  /**
   * @modifies This point instance, `velocity`, `position` and `acceleration` will be updated.
   */
  public update(deltaTime: number): void {
    if (!this.#forceApplied)
      console.warn('No force applied to point. Did you forget to call applyForce() before updating?')

    this.velocity = this.velocity.add(this.acceleration.multiply(deltaTime))
    this.position = this.position.add(this.velocity.multiply(deltaTime))
    this.acceleration = Vector.zero() // Reset acceleration after each update
  }
}

class Line implements LineContract, BodyContract {
  /**
   * @default Vector.zero()
   */
  public readonly velocity: Vector = Vector.zero()

  /**
   * @default Vector.zero()
   */
  public readonly acceleration: Vector = Vector.zero()

  /**
   * @default Vector.zero()
   */
  public readonly position: Vector = Vector.zero()

  /**
   * @default Infinity
   */
  public readonly mass: number = Infinity

  public get length(): number {
    return this.end.subtract(this.start).magnitude()
  }

  constructor(
    public readonly start: Vector,
    public readonly end: Vector,
  ) { }
}

class Renderer {
  /**
   * @default 2 * Math.PI
   */
  public static readonly TAU = 2 * Math.PI

  #lastTimestamp: number | null = null
  #rafId: number | null = null

  /**
   * @alias Renderer#context.canvas
   */
  public get canvas(): OffscreenCanvas {
    return this.context.canvas
  }

  /**
   * @throws Will throw {@link ContextMissingError} if context is missing.
   */
  constructor(public context: OffscreenCanvasRenderingContext2D) {
    if (context === null)
      throw new ContextMissingError()
  }

  public clear(): void {
    this.context.clearRect(0, 0, this.canvas.width, this.canvas.height)
  }

  /**
   * @example
   * const renderer = new Renderer()
   * renderer.render((deltaTime) => {
   *   // ...
   * })
   * @modifies This renderer instance, `lastTimestamp` and `raf`.
   */
  public render(callback: (timestamp: number) => void): void {
    const animate = (timestamp: number) => {
      if (this.#lastTimestamp !== null) {
        const deltaTime = (timestamp - this.#lastTimestamp) / 1_000

        this.clear()
        callback(deltaTime)
      }

      this.#lastTimestamp = timestamp
      this.#rafId = requestAnimationFrame(animate)
    }

    this.#rafId = requestAnimationFrame(animate)
  }

  /**
   * @modifies This renderer instance, `lastTimestamp` and `raf`.
   */
  public stop(): void {
    this.#cancelIteration()

    this.#lastTimestamp = null
  }

  public drawLine(line: Line): void {
    this.context.beginPath()
    this.context.moveTo(line.start.x, line.start.y)
    this.context.lineTo(line.end.x, line.end.y)
    this.context.stroke()
    // this.context.closePath()
  }

  /**
   * @param point Point to draw.
   * @param radius Circle radius. Defaults to `4`.
   */
  public drawPoint(point: Point, radius: number = 4): void {
    this.context.beginPath()
    this.context.arc(point.position.x, point.position.y, radius, 0, Renderer.TAU)
    this.context.fill()
    // this.context.closePath()
  }

  #cancelIteration(): void {
    if (this.#rafId === null)
      return

    cancelAnimationFrame(this.#rafId)

    this.#rafId = null
  }
}

interface PhysicsEngineContract {
  gravity: number
  friction: number
  points: Point[]
  lines: Line[]
  addPoint: (point: Point) => void
  addLine: (line: Line) => void
  update: (deltaTime: number) => void
}

class PhysicsEngine implements PhysicsEngineContract {
  /**
   * @default 0.0
   */
  public readonly gravity: number = 0.0

  /**
   * @default 1.0
   */
  public readonly friction: number = 1.0

  /**
   * @default []
   */
  public points: Point[] = []

  /**
   * @default []
   */
  public lines: Line[] = []

  constructor(public renderer: Renderer) { }

  public start(): void {
    this.renderer.render(this.update)
  }

  public stop(): void {
    this.renderer.stop()
  }

  /**
   * @modifies This physics engine instance, `lines`.
   */
  public addLine(line: Line): void {
    this.lines.push(line)
  }

  /**
   * @modifies This physics engine instance, `points`.
   */
  public addPoint(point: Point): void {
    this.points.push(point)
  }

  public update = (deltaTime: number): void => {
    for (const point of this.points) {
      const force = point.velocity.multiply(-1 * this.friction * this.gravity)

      point.applyForce(force)
      point.update(deltaTime)
      this.renderer.drawPoint(point)
    }

    for (const line of this.lines)
      this.renderer.drawLine(line)

    // TODO: Add collision detection
  }
}

function _main(): void {
  const context = { canvas: { width: 800, height: 600 } } as OffscreenCanvasRenderingContext2D

  const canvasWidth = context.canvas.width
  const canvasHeight = context.canvas.height
  const canvasCenter = new Vector(canvasWidth / 2, canvasHeight / 2)

  const quadrants = {
    quarter: {
      top: {
        left: {
          start: new Vector(0, 0),
          end: new Vector(canvasCenter.x, canvasCenter.y),
        },
        right: {
          start: new Vector(canvasCenter.x, 0),
          end: new Vector(context.canvas.width, canvasCenter.y),
        },
      },
      bottom: {
        left: {
          start: new Vector(0, canvasCenter.y),
          end: new Vector(canvasCenter.x, context.canvas.height),
        },
        right: {
          start: new Vector(canvasCenter.x, canvasCenter.y),
          end: new Vector(canvasWidth, canvasHeight),
        },
      },
    },
    half: {
      right: {
        start: new Vector(canvasCenter.x, 0),
        end: new Vector(canvasWidth, canvasHeight),
      },
      left: {
        start: new Vector(0, 0),
        end: new Vector(canvasCenter.x, canvasHeight),
      },
    },
  }

  const randomPointLeft = Vector.zero().randomize(quadrants.half.left.start, quadrants.half.left.end)

  const { bottom, top } = {
    top: {
      left: new Vector(0, 0),
      right: new Vector(context.canvas.width, 0),
    },
    bottom: {
      left: new Vector(0, context.canvas.height),
      right: new Vector(context.canvas.width, context.canvas.height),
    },
  }

  const renderer = new Renderer(context)
  const engine = new PhysicsEngine(renderer)

  engine.addPoint(new Point(randomPointLeft))

  engine.addLine(new Line(top.left, top.right))
  engine.addLine(new Line(top.right, bottom.right))
  engine.addLine(new Line(bottom.left, bottom.right))
  engine.addLine(new Line(top.left, bottom.left))

  // engine.start()
}

if (import.meta.vitest) {
  const { beforeEach, afterEach, it, expect, describe, vi } = import.meta.vitest

  const canvasWidthMock = 800
  const canvasHeightMock = 600
  const noop = () => { }

  /**
   * Advance timers twice to simulate two animation frames.
   *
   * @param times Number of frames to skip. Defaults to `2`.
   * @param fps Frames per second. Defaults to `1_000 / 60`.
   */
  const skipFrames = (times: number = 2, fps = 1_000 / 60) => {
    for (let i = 0; i < times; ++i)
      vi.advanceTimersByTime(fps) // Or set `fps * times`
  }

  const OffscreenCanvasMock = vi.fn(() => ({
    width: canvasWidthMock,
    height: canvasHeightMock,
    getContext: vi.fn(),
  }))

  const OffscreenCanvasRenderingContext2DMock = vi.fn(() => ({
    canvas: new OffscreenCanvasMock(),
    clearRect: vi.fn(),
  }))

  vi.useFakeTimers({
    shouldClearNativeTimers: true,
    toFake: [
      'requestAnimationFrame',
      'cancelAnimationFrame',
    ],
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  const spyMathFloor = vi.spyOn(Math, 'floor')
  const spyMathRandom = vi.spyOn(Math, 'random')
  const spyRandom = vi.spyOn(utils, 'random')

  describe('utils', () => {
    describe('random', () => {
      const min = 0
      const max = 10

      it('should return a random number between min and max', () => {
        const result = utils.random(min, max)

        expect(result).toBeGreaterThanOrEqual(min)
        expect(result).toBeLessThanOrEqual(max)
        expect(spyMathFloor).toHaveBeenCalledTimes(1)
        expect(spyMathRandom).toHaveBeenCalledTimes(1)

        const mockValue = 0.5
        const expected = mockValue * (max - min + 1) + min

        spyMathRandom.mockReturnValueOnce(mockValue)

        expect(utils.random(min, max)).toBe(5)
        expect(spyMathFloor).toHaveBeenCalledWith(expected)
      })
    })
  })

  describe('errors', () => {
    describe('DivideByZeroError', () => {
      it('should have correct properties', () => {
        const error = new DivideByZeroError()

        expect(error instanceof Error).toBeTruthy()
        expect(error.name).toBe('DivideByZeroError')
        expect(error.message).toBe('Cannot divide by zero')
        expect(() => { throw error }).toThrowError(DivideByZeroError)
      })
    })

    describe('ContextMissingError', () => {
      it('should have correct properties', () => {
        const error = new ContextMissingError()

        expect(error instanceof Error).toBeTruthy()
        expect(error.name).toBe('ContextMissingError')
        expect(error.message).toBe('Context missing')
        expect(() => { throw error }).toThrowError(ContextMissingError)
      })
    })
  })

  describe('Point', () => {
    describe('instance', () => {
      it('should have correct properties', () => {
        const mass = 5
        const point0 = new Point(new Vector(2, 3))
        const point1 = new Point(new Vector(2, 3), mass)

        expect(point0.position).toEqual({ x: 2, y: 3 })
        expect(point0.mass).toBe(1)
        expect(point0.velocity).toEqual({ x: 0, y: 0 })
        expect(point0.acceleration).toEqual({ x: 0, y: 0 })
        expect(point1.position).toEqual({ x: 2, y: 3 })
        expect(point1.mass).toBe(mass)
        expect(point1.velocity).toEqual({ x: 0, y: 0 })
        expect(point1.position).toEqual({ x: 2, y: 3 })
        expect(point1.acceleration).toEqual({ x: 0, y: 0 })
      })

      it('should apply force', () => {
        const mass = 4
        const force = new Vector(2, 3)
        const point0 = new Point(new Vector(2, 3))
        const point1 = new Point(new Vector(2, 3), mass)

        expect(point0.acceleration).toEqual({ x: 0, y: 0 })
        expect(point1.acceleration).toEqual({ x: 0, y: 0 })

        point0.applyForce(force)
        point1.applyForce(force)

        expect(point0.acceleration).toEqual({ x: 2, y: 3 })
        expect(point1.acceleration).toEqual({ x: 0.5, y: 0.75 })
      })

      it('should update', () => {
        const mass = 4
        const force = new Vector(2, 3)
        const point0 = new Point(new Vector(2, 3))
        const point1 = new Point(new Vector(2, 3), mass)

        expect(point0.velocity).toEqual({ x: 0, y: 0 })
        expect(point1.velocity).toEqual({ x: 0, y: 0 })

        point0.applyForce(force)
        point0.update(2)

        expect(point0.velocity).toEqual({ x: 4, y: 6 })

        point1.applyForce(force)
        point1.update(2)

        expect(point1.velocity).toEqual({ x: 1, y: 1.5 })
      })
    })
  })

  describe('Line', () => {
    describe('instance', () => {
      it('should have correct properties', () => {
        const start = new Vector(2, 3)
        const end = new Vector(4, 5)
        const line = new Line(start, end)

        expect(line.start).toEqual(start)
        expect(line.end).toEqual(end)
        expect(line.velocity).toEqual({ x: 0, y: 0 })
        expect(line.acceleration).toEqual({ x: 0, y: 0 })
        expect(line.position).toEqual({ x: 0, y: 0 })
        expect(line.mass).toBe(Infinity)
      })

      it('should get length', () => {
        const zeroLengthLine = new Line(new Vector(2, 3), new Vector(2, 3))
        const horizontalLine = new Line(new Vector(1, 4), new Vector(7, 4))
        const verticalLine = new Line(new Vector(3, 2), new Vector(3, 8))
        const line = new Line(new Vector(2, 3), new Vector(5, 7))
        const negativeLine = new Line(new Vector(-5, -2), new Vector(-1, 3))

        expect(zeroLengthLine.length).toBe(0)
        expect(horizontalLine.length).toBe(6)
        expect(verticalLine.length).toBe(6)
        expect(line.length).toBeCloseTo(5, 6)
        expect(negativeLine.length).toBeCloseTo(6.4, 2)
      })
    })
  })

  describe('Vector', () => {
    const spyAdd = vi.spyOn(Vector.prototype, 'add')
    const spyMultiply = vi.spyOn(Vector.prototype, 'multiply')
    const spyMagnitudeSquared = vi.spyOn(Vector.prototype, 'magnitudeSquared')
    const spyMagnitude = vi.spyOn(Vector.prototype, 'magnitude')
    const spyNormalize = vi.spyOn(Vector.prototype, 'normalize')
    const spyInvertX = vi.spyOn(Vector.prototype, 'invertX')
    const spyInvertY = vi.spyOn(Vector.prototype, 'invertY')

    describe('static', () => {
      it('should create a new zero vector', () => {
        const v = Vector.zero()

        expect(v).toEqual({ x: 0, y: 0 })
      })

      it('should get distance between two vectors', () => {
        const v0 = new Vector(0, 0)
        const v1 = new Vector(3, 4)

        expect(Vector.distance(v0, v1)).toBe(5)
        expect(v0).toEqual({ x: 0, y: 0 })
        expect(v1).toEqual({ x: 3, y: 4 })
      })

      it('should get dot product', () => {
        const v0 = new Vector(2, 3)
        const v1 = new Vector(4, 5)

        expect(Vector.dot(v0, v1)).toBe(23)
        expect(v0).toEqual({ x: 2, y: 3 })
        expect(v1).toEqual({ x: 4, y: 5 })
      })
    })

    describe('getters', () => {
      describe('standalone', () => {
        it('should return the length of the vector', () => {
          const v = new Vector(2, 3)

          expect(v.length).toBeCloseTo(3.606, 3)
          expect(spyMagnitudeSquared).toHaveBeenCalledTimes(1)
        })

        it('should check if the vector is zero', () => {
          const v = new Vector(0, 0)

          expect(v.isZero).toBeTruthy()
          expect(v.add(new Vector(1, 1)).isZero).toBeFalsy()
        })
      })

      describe('chainable', () => {
        it('should return the unit vector', () => {
          const v = new Vector(5, 12)
          const expected = new Vector(5 / 13, 12 / 13)

          expect(v.unit).toEqual(expected)
          expect(spyNormalize).toHaveBeenCalledTimes(1)
        })
      })
    })

    describe('instance', () => {
      describe('standalone', () => {
        it('should create a new vector', () => {
          const v = new Vector(0, 0)

          expect(v).toBeInstanceOf(Vector)
          expect(v).toHaveProperty('x', 0)
          expect(v).toHaveProperty('y', 0)
          expect(v).toEqual({ x: 0, y: 0 })
          expect(new Vector({ x: 0, y: 0 })).toEqual({ x: 0, y: 0 })
        })

        it('should convert to string', () => {
          expect(new Vector(0, 0).toString()).toEqual('Vector(0, 0)')
        })

        it('should get magnitude squared', () => {
          const v = new Vector(2, 3)

          expect(v.magnitudeSquared()).toEqual(13)
          expect(v).toEqual({ x: 2, y: 3 })
        })

        it('should get magnitude', () => {
          const v = new Vector(2, 3)

          expect(v.magnitude()).toBeCloseTo(3.606, 3)
          expect(spyMagnitudeSquared).toHaveBeenCalledTimes(1)
          expect(v).toEqual({ x: 2, y: 3 })
        })

        it('should get slope', () => {
          expect(new Vector(5, 12).slope()).toEqual(12 / 5)
          expect(() => new Vector(0, 5).slope()).toThrowError(DivideByZeroError)
          expect(new Vector(5, 0).slope()).toEqual(0)
        })

        it('should convert to array', () => {
          expect(new Vector(2, 3).toArray()).toEqual([2, 3])
        })
      })

      describe('chainable', () => {
        it('should add two vectors', () => {
          const v0 = new Vector(2, 3)
          const v1 = new Vector(4, 5)

          expect(v0.add(v1)).toEqual({ x: 6, y: 8 })
          expect(v0).toEqual({ x: 2, y: 3 })
          expect(v1).toEqual({ x: 4, y: 5 })
        })

        it('should subtract two vectors', () => {
          const v0 = new Vector(2, 3)
          const v1 = new Vector(4, 5)

          expect(v0.subtract(v1)).toEqual({ x: -2, y: -2 })
          expect(spyAdd).toHaveBeenCalledWith({ x: -4, y: -5 })
          expect(v0).toEqual({ x: 2, y: 3 })
          expect(v1).toEqual({ x: 4, y: 5 })
        })

        it('should multiply a vector by a scalar', () => {
          const v = new Vector(2, 3)

          expect(v.multiply(2)).toEqual({ x: 4, y: 6 })
          expect(v).toEqual({ x: 2, y: 3 })
        })

        it('should divide a vector by a scalar', () => {
          const v = new Vector(2, 3)

          expect(v.divide(2)).toEqual({ x: 1, y: 1.5 })
          expect(spyMultiply).toHaveBeenCalledWith(0.5)
          expect(v).toEqual({ x: 2, y: 3 })
        })

        it('should clone vector', () => {
          const v = new Vector(2, 3)
          const clone = v.clone()

          expect(clone).toEqual({ x: 2, y: 3 })

          clone.x = 2
          clone.y = 4

          expect(clone).toEqual({ x: 2, y: 4 })
          expect(v).toEqual({ x: 2, y: 3 })

          v.x = 3
          v.y = 2

          expect(v).toEqual({ x: 3, y: 2 })
          expect(clone).toEqual({ x: 2, y: 4 })
        })

        it('should normalize a vector', () => {
          const v = new Vector(5, 12)
          const expected = new Vector(5 / 13, 12 / 13)

          expect(v.normalize()).toEqual(expected)
          expect(spyMagnitude).toHaveBeenCalledTimes(1)
          expect(spyMultiply).toHaveBeenCalledTimes(1)
          expect(v).toEqual({ x: 5, y: 12 })
        })

        it('should get normal vector', () => {
          const v = new Vector(5, 12)

          expect(v.normal()).toEqual({ x: -12, y: 5 })
          expect(v).toEqual({ x: 5, y: 12 })
        })

        it('should get randomized vector', () => {
          const v0 = new Vector(2, 2)
          const v1 = new Vector(1, 1)
          const v2 = new Vector(3, 3)

          spyMathRandom.mockReturnValue(0.5)

          expect(v0.randomize(v1, v2)).toEqual({ x: 2, y: 2 })
          expect(spyMathRandom).toHaveBeenCalledTimes(2)
          expect(spyRandom).toHaveBeenCalledWith(1, 3)
        })

        describe('mutations', () => {
          it('should invert vector', () => {
            const v = new Vector(5, 12)

            expect(v.invert()).toEqual(v)
            expect(v).toEqual({ x: -5, y: -12 })
            expect(spyInvertX).toHaveBeenCalledTimes(1)
            expect(spyInvertY).toHaveBeenCalledTimes(1)
            expect(v.invertX()).toEqual(v)
            expect(v).toEqual({ x: 5, y: -12 })
            expect(v.invertY()).toEqual(v)
            expect(v).toEqual({ x: 5, y: 12 })
          })
        })
      })
    })
  })

  describe('Renderer', () => {
    const offscreenCanvasMock = new OffscreenCanvasMock()
    const contextMock = new OffscreenCanvasRenderingContext2DMock()

    let context: OffscreenCanvasRenderingContext2D
    let renderer: Renderer

    vi.spyOn(offscreenCanvasMock, 'getContext').mockReturnValue(contextMock)

    beforeEach(() => {
      context = offscreenCanvasMock.getContext('2d')
      renderer = new Renderer(context)

      vi.spyOn(globalThis, 'cancelAnimationFrame').mockImplementation(id => clearTimeout(id))
    })

    describe('instance', () => {
      it('should throw an error if context is missing', () => {
        vi.spyOn(offscreenCanvasMock, 'getContext').mockReturnValueOnce(null)

        expect(() => {
          context = offscreenCanvasMock.getContext('2d')

          // eslint-disable-next-line no-new
          new Renderer(context)
        }).toThrowError(ContextMissingError)
      })

      it('should set context', () => {
        expect(renderer.context).toBe(contextMock)
      })

      describe('render', () => {
        it('should clear context', () => {
          renderer.clear()

          expect(contextMock.clearRect).toHaveBeenCalledWith(0, 0, canvasWidthMock, canvasHeightMock)
        })

        it('should call the callback function with deltaTime', () => {
          const callback = vi.fn()

          renderer.render(callback)
          skipFrames()

          expect(callback).toHaveBeenCalledTimes(1)
          expect(callback).toHaveBeenCalledWith(expect.any(Number))
        })

        it('should clear the context before calling the callback', () => {
          const callback = vi.fn()

          renderer.render(callback)
          skipFrames()

          expect(contextMock.clearRect).toHaveBeenCalledWith(0, 0, canvasWidthMock, canvasHeightMock)
        })

        it('should continue calling requestAnimationFrame', () => {
          // INFO: Cannot be mocked outside of a spec
          const requestAnimationFrameMock = vi
            .spyOn(globalThis, 'requestAnimationFrame')
            .mockImplementation(cb => setTimeout(() => cb(performance.now()), 0) as unknown as number)

          renderer.render(noop)
          skipFrames(3)

          expect(requestAnimationFrameMock).toHaveBeenCalledTimes(3)
        })

        it('should cancel the animation frame', () => {
          const cancelAnimationFrameSpy = vi.spyOn(globalThis, 'cancelAnimationFrame')

          renderer.render(noop)
          skipFrames()
          renderer.stop()

          expect(cancelAnimationFrameSpy).toHaveBeenCalledTimes(1)
        })

        it.todo('should reset lastTimestamp and raf')
      })
    })
  })
}
