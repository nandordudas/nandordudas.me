export class Renderer {
  get context(): OffscreenCanvasRenderingContext2D | null {
    return this.canvas.getContext('2d', { alpha: false })
  }

  constructor(readonly canvas: OffscreenCanvas) {
    this.#setupContext()
  }

  // @alias draw
  render(_callback: FrameRequestCallback): void { }
  clear(): void { }
  resize(_width: number, _height: number): void { }

  #setupContext(): void { }
}
