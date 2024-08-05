export function random(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1) + min)
}

export function noop() { }

export function canvasQuadrants(
  canvas: OffscreenCanvas,
  tolerance: Contracts.Coordinate = { x: 10, y: 10 },
) {
  const { width, height } = canvas
  const canvasCenter = { x: width / 2, y: height / 2 }

  const quadrants = {
    quarter: {
      top: {
        left: {
          start: tolerance,
          end: { x: canvasCenter.x + tolerance.x, y: canvasCenter.y - tolerance.y },
        },
        right: {
          start: { x: canvasCenter.x - tolerance.x, y: tolerance.y },
          end: { x: canvas.width - tolerance.x, y: canvasCenter.y - tolerance.y },
        },
      },
      bottom: {
        left: {
          start: { x: tolerance, y: canvasCenter.y + tolerance.y },
          end: { x: canvasCenter.x - tolerance.x, y: canvas.height - tolerance.y },
        },
        right: {
          start: { x: canvasCenter.x + tolerance.x, y: canvasCenter.y + tolerance.y },
          end: { x: width - tolerance.x, y: height - tolerance.y },
        },
      },
    },
    half: {
      right: {
        start: { x: canvasCenter.x + tolerance.x, y: tolerance },
        end: { x: width - tolerance.x, y: height - tolerance.y },
      },
      left: {
        start: tolerance,
        end: { x: canvasCenter.x - tolerance.x, y: height - tolerance.y },
      },
    },
  }

  return quadrants
}

/**
 * Tolerance values are adjusted to account for canvas line width.
 * @example
 * const renderer = new Renderer(context)
 * const { bottom, top } = canvasCoordinates(renderer.context.canvas)
 */
export function canvasCoordinates(
  canvas: OffscreenCanvas,
  tolerance: Contracts.Coordinate = { x: 10, y: 0 },
) {
  const lineWidthAdjustment = (canvas.getContext('2d')?.lineWidth ?? 1) / 2

  const x = tolerance.x + lineWidthAdjustment
  const y = tolerance.y - lineWidthAdjustment

  const coordinates = {
    top: {
      left: { x, y },
      right: { x: canvas.width - x, y },
    },
    bottom: {
      left: { x, y: canvas.height - y },
      right: { x: canvas.width - x, y: canvas.height - y },
    },
  }

  return coordinates
}
