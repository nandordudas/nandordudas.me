import type { Line } from './line'
import type { Point } from './point'

import { TAU } from './constants'
import { ContextMissingError } from './errors'

export class Renderer {
  #lastTimestamp: number | null = null
  #rafId: number | null = null

  /**
   * @alias Renderer#context.canvas
   */
  public get canvas(): OffscreenCanvas {
    return this.context.canvas
  }

  /**
   * @throws Will throw {@link ContextMissingError} if `context` is `null`.
   */
  constructor(public context: OffscreenCanvasRenderingContext2D) {
    if (context === null)
      throw new ContextMissingError()
  }

  public clear(): void {
    this.context.clearRect(0, 0, this.canvas.width, this.canvas.height)
  }

  /**
   * @modifies This renderer instance, `#lastTimestamp` and `#rafId`.
   */
  public render(callback: FrameRequestCallback): void {
    const animate: FrameRequestCallback = (timestamp) => {
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
   * @modifies This renderer instance, `#lastTimestamp` and `#rafId`.
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
  }

  /**
   * @param point Point to draw.
   * @param radius Circle radius. Defaults to `4`.
   */
  public drawPoint(point: Point, radius: number = 4): void {
    this.context.beginPath()
    this.context.arc(point.position.x, point.position.y, radius, 0, TAU)
    this.context.fill()
  }

  /**
   * @modifies This renderer instance, `#rafId`.
   */
  #cancelIteration(): void {
    if (this.#rafId === null)
      return

    cancelAnimationFrame(this.#rafId)

    this.#rafId = null
  }
}
