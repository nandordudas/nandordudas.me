import { Points, Walls } from './math/constants'
import { Line } from './math/line'
import { PhysicsEngine } from './math/physics-engine'
import { Point } from './math/point'
import { Renderer } from './math/renderer'
import { canvasCoordinates, canvasQuadrants } from './math/utils'
import { Vector } from './math/vector'

/**
 * @throws Will throw {@link ContextMissingError} if context is null, or {@link DivideByZeroError} if `x` is zero when
 * slope is calculated.
 * @example
 * import { start } from './game'
 *
 * try {
 *   start(context)
 * }
 * catch (error) {
 *   console.error(error)
 * }
 */
export function start(context: OffscreenCanvasRenderingContext2D): void {
  const { bottom, top } = canvasCoordinates(context.canvas)
  const quadrants = canvasQuadrants(context.canvas)

  const randomCoordinate = Vector.randomize(
    new Vector(quadrants.half.left.start),
    new Vector(quadrants.half.left.end),
  )

  const renderer = new Renderer(context)
  const engine = new PhysicsEngine(renderer)

  engine.addPoint(new Point(Points.Ball, randomCoordinate))

  engine.addLine(new Line(Walls.Top, top.left, top.right))
  engine.addLine(new Line(Walls.Right, top.right, bottom.right))
  engine.addLine(new Line(Walls.Bottom, bottom.left, bottom.right))
  engine.addLine(new Line(Walls.Left, top.left, bottom.left))

  engine.start()
}
