/**
 * List of used methods for {@link https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D|CanvasRenderingContext2D}
 * - {@link https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/clearRect|clearRect()}
 * - {@link https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/scale|scale()}
 * - {@link https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/beginPath|beginPath()}
 * - {@link https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/lineTo|lineTo()}
 * - {@link https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/moveTo|moveTo()}
 * - {@link https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/arc|arc()}
 * - {@link https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/rect|rect()}
 * - {@link https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/roundedRect|roundedRect()}
 * - {@link https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/fill|fill()}
 * - {@link https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/stroke|stroke()}
 */
export class Renderer {
  /**
   * @readonly
   * @default 2 * Math.PI
   */
  static readonly TAU = 2 * Math.PI

  #rafId: number | null = null
  #lastTimestamp: number | null = null

  get context(): OffscreenCanvasRenderingContext2D | null {
    return this.offscreenCanvas.getContext('2d', { alpha: true })
  }

  constructor(
    /**
     * @readonly
     */
    readonly offscreenCanvas: OffscreenCanvas,
  ) {
    this.#setupContext()
  }

  drawRect(
    { position, width, height }: Rectangular,
    { isRounded }: { isRounded?: boolean } = {},
  ): void {
    const context = this.context!

    context.beginPath()

    if (isRounded)
      context.roundRect(position.x, position.y, width, height, 4)
    else
      context.rect(position.x, position.y, width, height)

    context.fill()
  }

  drawLine({ start, end }: CoordinatesRange): void {
    const context = this.context!

    context.beginPath()
    context.moveTo(start.x, start.y)
    context.lineTo(end.x, end.y)
    context.stroke()
  }

  drawPoint({ position, radius = 4 }: Positioned & { radius?: number }): void {
    const context = this.context!

    context.beginPath()
    context.arc(position.x, position.y, radius, 0, Renderer.TAU)
    context.fill()
  }

  /**
   * - Call the callback with the delta time
   * - Clear the canvas before the next frame
   * - Set the last timestamp and request animation frame
   */
  render(callback: FrameRequestCallback): void {
    const animate: FrameRequestCallback = (timestamp) => {
      if (this.#lastTimestamp !== null) {
        const deltaTime = (timestamp - this.#lastTimestamp) / 1_000 // 60fps ~> 1 / 60

        this.clearCanvas()
        callback(deltaTime)
      }

      this.#lastTimestamp = timestamp
      this.#rafId = requestAnimationFrame(animate)
    }

    this.#rafId = requestAnimationFrame(animate)
  }

  stop(): void {
    this.#cancelIteration()

    this.#lastTimestamp = null
  }

  clearCanvas(): void {
    this.context?.clearRect(0, 0, this.context.canvas.width, this.context.canvas.height)
  }

  resize(width: number, height: number): void {
    const context = this.context!

    context.canvas.width = width
    context.canvas.height = height
  }

  #setupContext(): void {
    const scale = 1
    const context = this.context!

    context.scale(scale, scale)
    this.resize(context.canvas.width * scale, context.canvas.height * scale)

    context.imageSmoothingEnabled = false
    context.lineCap = 'round'
    context.lineJoin = 'round'
    context.strokeStyle = 'tomato'
    context.fillStyle = 'tomato'
    context.lineWidth = 0.5
  }

  #cancelIteration(): void {
    if (this.#rafId === null)
      return

    cancelAnimationFrame(this.#rafId)

    this.#rafId = null
  }
}
