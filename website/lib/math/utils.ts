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

export function canvasCoordinates(
  canvas: OffscreenCanvas,
  tolerance: Contracts.Coordinate = { x: 10, y: -0.5 },
) {
  const coordinates = {
    top: {
      left: tolerance,
      right: { x: canvas.width - tolerance.x, y: tolerance.y },
    },
    bottom: {
      left: { x: tolerance.x, y: canvas.height - tolerance.y },
      right: { x: canvas.width - tolerance.x, y: canvas.height - tolerance.y },
    },
  }

  return coordinates
}
