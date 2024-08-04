import { Vector } from './vector'

export function random(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1) + min)
}

export function noop() { }

export function getQuadrants(context: OffscreenCanvasRenderingContext2D) {
  const canvasWidth = context.canvas.width
  const canvasHeight = context.canvas.height

  const canvasCenter = new Vector(canvasWidth / 2, canvasHeight / 2)

  const quadrants = {
    quarter: {
      top: {
        left: {
          start: new Vector(0, 0),
          end: new Vector(canvasCenter.x, canvasCenter.y),
        },
        right: {
          start: new Vector(canvasCenter.x, 0),
          end: new Vector(context.canvas.width, canvasCenter.y),
        },
      },
      bottom: {
        left: {
          start: new Vector(0, canvasCenter.y),
          end: new Vector(canvasCenter.x, context.canvas.height),
        },
        right: {
          start: new Vector(canvasCenter.x, canvasCenter.y),
          end: new Vector(canvasWidth, canvasHeight),
        },
      },
    },
    half: {
      right: {
        start: new Vector(canvasCenter.x, 0),
        end: new Vector(canvasWidth, canvasHeight),
      },
      left: {
        start: new Vector(0, 0),
        end: new Vector(canvasCenter.x, canvasHeight),
      },
    },
  }

  return quadrants
}

export function getCanvasCoordinates(context: OffscreenCanvasRenderingContext2D) {
  const coordinates = {
    top: {
      left: new Vector(0, 0),
      right: new Vector(context.canvas.width, 0),
    },
    bottom: {
      left: new Vector(0, context.canvas.height),
      right: new Vector(context.canvas.width, context.canvas.height),
    },
  }

  return coordinates
}
