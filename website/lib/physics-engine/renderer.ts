export class Renderer {
  private _rafId: number | null = null
  private _lastTimestamp: number | null = null

  get context(): OffscreenCanvasRenderingContext2D {
    const context = this.offscreenCanvas.getContext('2d', { alpha: true })

    if (!context)
      throw new Error('Failed to get 2D context from offscreen canvas')

    return context
  }

  constructor(
    public readonly offscreenCanvas: OffscreenCanvas,
    public readonly scale: number = 1,
  ) {
    this._setupContext(scale)
  }

  render(callback: FrameRequestCallback): void {
    const animate: FrameRequestCallback = (timestamp) => {
      if (this._lastTimestamp !== null) {
        const deltaTime = (timestamp - this._lastTimestamp) / 1_000

        callback(deltaTime)
      }

      this._lastTimestamp = timestamp
      this._rafId = requestAnimationFrame(animate)
    }

    this._rafId = requestAnimationFrame(animate)
  }

  clearCanvas(): void {
    this.context.clearRect(0, 0, this.context.canvas.width, this.context.canvas.height)
  }

  resizeCanvas(width: number, height: number): void {
    this.context.canvas.width = width
    this.context.canvas.height = height
  }

  stop(): void {
    this._cancelIteration()

    this._lastTimestamp = null
  }

  private _cancelIteration(): void {
    if (this._rafId === null)
      return

    cancelAnimationFrame(this._rafId)

    this._rafId = null
  }

  private _setupContext(scale = 1): void {
    this.context.scale(scale, scale)
    this.resizeCanvas(this.context.canvas.width * scale, this.context.canvas.height * scale)

    this.context.imageSmoothingEnabled = false
    this.context.lineCap = 'round'
    this.context.lineJoin = 'round'
    this.context.strokeStyle = 'tomato'
    this.context.fillStyle = 'tomato'
    this.context.lineWidth = 0.5
  }
}
