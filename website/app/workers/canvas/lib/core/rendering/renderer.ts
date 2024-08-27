import type { Rendering } from 'canvas'

import * as base from '~/workers/canvas/utils/helpers/base'

export type FpsUpdateCallback = (fps: number) => void

interface FpsUpdateOptions {
  /**
   * @default 1_000
   */
  FpsUpdateInterval?: number
  /**
   * @default false
   */
  enableFpsMetrics?: boolean
}

export class Renderer<T extends Rendering.Context2D> implements Rendering.RendererContract<T> {
  static readonly FPS = 60
  static readonly FRAME_INTERVAL = 1_000 / Renderer.FPS

  #context: T
  #rafId: number | null = null
  #callback: Rendering.RenderCallback | null = null
  #lastTimestamp: number | null = null
  #frameInterval: number = Renderer.FRAME_INTERVAL
  #frameCount: number = 0
  #lastFpsUpdateTime: number = 0
  #onFpsUpdate: FpsUpdateCallback | null = null
  #enableFpsMetrics: boolean = false
  #fpsUpdateInterval: number = 1_000

  get context(): T {
    return this.#context
  }

  constructor(context: T | null) {
    base.assertIsNotNull(context, 'Failed to get 2D context')

    this.#context = context
  }

  /**
   * @example
   * const renderer = new Renderer(OffscreenCanvas(800, 450).getContext('2d'))
   * renderer.onFpsUpdate((fps) => {
   *   console.log('fps:', fps)
   * }, { enableFpsMetrics: true, FpsUpdateInterval: Renderer.FRAME_INTERVAL })
   */
  onFpsUpdate(
    callback: FpsUpdateCallback,
    options: FpsUpdateOptions = {},
  ): void {
    const { FpsUpdateInterval = 1_000, enableFpsMetrics = false } = options

    base.assertIsFunction(callback, 'The fps update callback must be a function')
    base.assertIsNumber(FpsUpdateInterval, 'The fps update interval must be a number')
    base.assert(FpsUpdateInterval > 1, 'The fps update interval must be greater than 1')
    base.assertIsBoolean(enableFpsMetrics, 'Enable fps metrics must be a boolean')

    this.#onFpsUpdate = callback
    this.#enableFpsMetrics = enableFpsMetrics
    this.#fpsUpdateInterval = FpsUpdateInterval
  }

  /**
   * @example
   * const renderer = new Renderer(new OffscreenCanvas(800, 450).getContext('2d'))
   * renderer.render((deltaTime) => {
   *   console.log('Rendering frame', deltaTime)
   * })
   */
  render(callback: Rendering.RenderCallback): void {
    base.assertIsFunction(callback, 'Render callback must be a function')

    this.stop()
    this.#callback = callback
    this.#resetAnimationState()
    this.#rafId = requestAnimationFrame(this.#animate)
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

  #animate: FrameRequestCallback = (timestamp) => {
    if (this.#callback === null)
      return

    this.#lastTimestamp ??= timestamp

    const elapsedTime = timestamp - this.#lastTimestamp

    if (elapsedTime >= this.#frameInterval) {
      const deltaTime = elapsedTime / 1_000

      this.#renderFrame(deltaTime)
      if (this.#enableFpsMetrics)
        this.#updateFpsMetrics(timestamp)
      this.#lastTimestamp = timestamp - (elapsedTime % this.#frameInterval)
    }

    this.#rafId = requestAnimationFrame(this.#animate)
  }

  #renderFrame(deltaTime: number): void {
    this.clearCanvas()
    this.#callback!(deltaTime)
  }

  #updateFpsMetrics(timestamp: number): void {
    if (!this.#onFpsUpdate)
      return

    this.#frameCount++

    if (timestamp - this.#lastFpsUpdateTime < this.#fpsUpdateInterval)
      return

    const frameRate = this.#frameCount * 1_000
    const timeDifference = timestamp - this.#lastFpsUpdateTime
    const realFps = Math.round(frameRate / timeDifference)

    this.#onFpsUpdate(realFps)
    this.#frameCount = 0
    this.#lastFpsUpdateTime = timestamp
  }
}
