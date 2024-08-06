import type { CoordinateRange, Positioned } from '../types'

import createDebug from 'debug'

const debug = createDebug('worker:renderer')

export class Renderer {
  static readonly TAU = 2 * Math.PI

  #lastTimestamp: number | null = null
  #rafId: number | null = null

  constructor(public context: OffscreenCanvasRenderingContext2D) {
    debug('init')
    this.#setup()
  }

  render(callback: FrameRequestCallback): void {
    debug('render')

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

  clearCanvas(): void {
    this.context.clearRect(0, 0, this.context.canvas.width, this.context.canvas.height)
  }

  stop(): void {
    debug('stop')

    this.#cancelIteration()

    this.#lastTimestamp = null
  }

  startDrawing(): void {
    this.context.beginPath()
  }

  drawLine({ start, end }: CoordinateRange): void {
    this.context.beginPath()
    this.context.moveTo(start.x, start.y)
    this.context.lineTo(end.x, end.y)
    this.context.stroke()
  }

  drawPoint({ position }: Positioned, radius = 4): void {
    this.context.beginPath()
    this.context.arc(position.x, position.y, radius, 0, Renderer.TAU)
    this.context.fill()
  }

  #cancelIteration(): void {
    if (this.#rafId === null)
      return

    cancelAnimationFrame(this.#rafId)

    this.#rafId = null
  }

  #setup(): void {
    debug('setup')

    const scale = 0.8

    this.context.scale(scale, scale)

    const width = this.context.canvas.width
    const height = this.context.canvas.height

    this.context.canvas.width = width * scale
    this.context.canvas.height = height * scale

    this.context.lineCap = 'round'
    this.context.lineJoin = 'round'
    this.context.strokeStyle = 'tomato'
    this.context.fillStyle = 'tomato'
    this.context.lineWidth = 0.5
  }
}
