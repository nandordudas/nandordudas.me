import type { Coordinate } from './type'

interface DrawArcProps {
  position: Coordinate
  radius: number
  color: string | CanvasGradient | CanvasPattern
}

export function drawArc(context: OffscreenCanvasRenderingContext2D, options: DrawArcProps): void {
  const TAU = Math.PI * 2

  context.beginPath()
  context.arc(options.position.x, options.position.y, options.radius, 0, TAU)

  context.fillStyle = options.color
  context.strokeStyle = 'black'

  context.fill()
  context.stroke()
}

interface DrawLineProps {
  start: Coordinate
  end: Coordinate
  color: string | CanvasGradient | CanvasPattern
  lineWidth?: number
  dashed?: number[]
}

export function drawLine(context: OffscreenCanvasRenderingContext2D, options: DrawLineProps): void {
  context.beginPath()
  context.setLineDash(options.dashed ?? [])
  context.moveTo(options.start.x, options.start.y)
  context.lineTo(options.end.x, options.end.y)

  context.strokeStyle = options.color
  context.lineWidth = options.lineWidth ?? 1

  context.stroke()
}

export const logger = {
  // eslint-disable-next-line no-console
  log: (...[title, ...args]: unknown[]) => console.log(title, ...args),
}
