import type { Vector2D } from './math/vector-2d'

interface RendererOptions {
  context: OffscreenCanvasRenderingContext2D
}

interface DrawPointOptions {
  context: OffscreenCanvasRenderingContext2D
  radius: number
  fill?: string
  stroke?: string
}

const requestAnimationFrame = globalThis.requestAnimationFrame.bind(globalThis)

export class Renderer {
  static readonly FPS = 60
  static readonly FRAME_INTERVAL = 1_000 / Renderer.FPS

  static drawPoint(position: Vector2D, options: DrawPointOptions): void {
    const { context, radius, fill, stroke } = options

    context.beginPath()
    context.arc(position.x, position.y, radius, 0, Math.PI * 2)

    if (fill) {
      context.fillStyle = fill
      context.fill()
    }

    if (stroke) {
      context.strokeStyle = stroke
      context.stroke()
    }
  }

  #context: OffscreenCanvasRenderingContext2D
  #rafId: number | null = null
  #callback: ((deltaTime: number) => void) | null = null
  #lastTimestamp: number | null = null
  #frameInterval: number = Renderer.FRAME_INTERVAL

  constructor(options: RendererOptions) {
    const { context } = options

    assert(context !== null, 'The context must not be null')

    this.#context = context
  }

  render(callback: ((deltaTime: number) => void)): void {
    this.stop()
    this.#callback = callback
    this.#resetAnimationState()
    this.#rafId = requestAnimationFrame(this.#animate.bind(this))
  }

  stop(): void {
    if (this.#rafId === null)
      return

    cancelAnimationFrame(this.#rafId)
    this.#rafId = null
  }

  clearCanvas(): void {
    this.#context.clearRect(0, 0, this.#context.canvas.width, this.#context.canvas.height)
  }

  #resetAnimationState(): void {
    this.#lastTimestamp = null
  }

  #animate(timestamp: number): void {
    if (this.#callback === null)
      return

    this.#lastTimestamp ??= timestamp

    const elapsedTime = timestamp - this.#lastTimestamp

    if (elapsedTime >= this.#frameInterval) {
      const deltaTime = elapsedTime / 1_000

      this.#renderFrame(deltaTime)

      this.#lastTimestamp = timestamp - (elapsedTime % this.#frameInterval)
    }

    this.#rafId = requestAnimationFrame(this.#animate.bind(this))
  }

  #renderFrame(deltaTime: number): void {
    this.clearCanvas()
    this.#callback!(deltaTime)
  }

  #setupContext(): void {
    this.#context.strokeStyle = 'transparent'
    this.#context.fillStyle = 'transparent'
  }
}
