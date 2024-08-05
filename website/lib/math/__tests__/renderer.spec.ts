import { ContextMissingError } from '../errors'
import { Renderer } from '../renderer'
import { noop } from '../utils'

const DEFAULT_FPS = 1_000 / 60
const CANVAS_WIDTH_MOCK = 800
const CANVAS_HEIGHT_MOCK = 600

/**
 * Advance timers twice to simulate two animation frames.
 *
 * @param times Number of frames to skip. Defaults to `2`.
 * @param fps Frames per second. Defaults to `1_000 / 60`.
 */
function skipFrames(times: number = 2, fps: number = DEFAULT_FPS) {
  for (let i = 0; i < times; ++i)
    vi.advanceTimersByTime(fps)
}

const OffscreenCanvasMock = vi.fn(() => ({
  width: CANVAS_WIDTH_MOCK,
  height: CANVAS_HEIGHT_MOCK,
  getContext: vi.fn(),
}))

const OffscreenCanvasRenderingContext2DMock = vi.fn(() => ({
  canvas: new OffscreenCanvasMock(),
  clearRect: vi.fn(),
}))

const offscreenCanvasMock = new OffscreenCanvasMock()
const contextMock = new OffscreenCanvasRenderingContext2DMock()

describe('renderer', () => {
  vi.useFakeTimers()

  let context: OffscreenCanvasRenderingContext2D
  let renderer: Renderer

  vi.spyOn(offscreenCanvasMock, 'getContext').mockReturnValue(contextMock)

  beforeEach(() => {
    context = offscreenCanvasMock.getContext('2d')
    renderer = new Renderer(context)

    vi.spyOn(globalThis, 'cancelAnimationFrame').mockImplementation(id => clearTimeout(id))
  })

  describe('instance', () => {
    it('should throw an error if context is null', () => {
      vi.spyOn(offscreenCanvasMock, 'getContext').mockReturnValueOnce(null)

      expect(() => {
        const _ = new Renderer(offscreenCanvasMock.getContext('2d'))
      }).toThrowError(ContextMissingError)
    })

    it('should set context', () => {
      expect(renderer.context).toBe(contextMock)
    })

    describe('render', () => {
      it('should clear the context', () => {
        renderer.clear()

        expect(contextMock.clearRect).toHaveBeenCalledWith(0, 0, CANVAS_WIDTH_MOCK, CANVAS_HEIGHT_MOCK)
      })

      it('should call the callback function with `deltaTime`', () => {
        const callback = vi.fn()

        renderer.render(callback)
        skipFrames()

        expect(callback).toHaveBeenCalledTimes(1)
        expect(callback).toHaveBeenCalledWith(expect.any(Number))
      })

      it('should clear the context before calling the `callback`', () => {
        const callback = vi.fn()

        renderer.render(callback)
        skipFrames()

        expect(contextMock.clearRect).toHaveBeenCalledWith(0, 0, CANVAS_WIDTH_MOCK, CANVAS_HEIGHT_MOCK)
      })

      it('should continue calling `requestAnimationFrame`', () => {
        // INFO: Cannot be mocked outside of a spec
        const requestAnimationFrameMock = vi
          .spyOn(globalThis, 'requestAnimationFrame')
          .mockImplementation(cb => setTimeout(() => cb(performance.now()), 0) as unknown as number)

        renderer.render(noop)
        skipFrames(3)

        expect(requestAnimationFrameMock).toHaveBeenCalledTimes(3)
      })

      it('should cancel the animation', () => {
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
