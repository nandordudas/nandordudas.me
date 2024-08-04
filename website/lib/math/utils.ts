export function random(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1) + min)
}

export function noop() { }

export function canvasQuadrants(canvas: OffscreenCanvas) {
  const { width, height } = canvas
  const canvasCenter = { x: width / 2, y: height / 2 }

  const quadrants = {
    quarter: {
      top: {
        left: {
          start: { x: 0, y: 0 },
          end: { x: canvasCenter.x, y: canvasCenter.y },
        },
        right: {
          start: { x: canvasCenter.x, y: 0 },
          end: { x: canvas.width, y: canvasCenter.y },
        },
      },
      bottom: {
        left: {
          start: { x: 0, y: canvasCenter.y },
          end: { x: canvasCenter.x, y: canvas.height },
        },
        right: {
          start: { x: canvasCenter.x, y: canvasCenter.y },
          end: { x: width, y: height },
        },
      },
    },
    half: {
      right: {
        start: { x: canvasCenter.x, y: 0 },
        end: { x: width, y: height },
      },
      left: {
        start: { x: 0, y: 0 },
        end: { x: canvasCenter.x, y: height },
      },
    },
  }

  return quadrants
}

export function canvasCoordinates(canvas: OffscreenCanvas) {
  const coordinates = {
    top: {
      left: { x: 0, y: 0 },
      right: { x: canvas.width, y: 0 },
    },
    bottom: {
      left: { x: 0, y: canvas.height },
      right: { x: canvas.width, y: canvas.height },
    },
  }

  return coordinates
}
