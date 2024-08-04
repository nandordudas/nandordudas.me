import { Line } from './math/line'
import { PhysicsEngine } from './math/physics-engine'
import { Point } from './math/point'
import { Renderer } from './math/renderer'
import { canvasCoordinates, canvasQuadrants } from './math/utils'
import { Vector } from './math/vector'

export function start(context: OffscreenCanvasRenderingContext2D): void {
  const { bottom, top } = canvasCoordinates(context.canvas)
  const quadrants = canvasQuadrants(context.canvas)

  const randomCoordinate = Vector.randomize(
    new Vector(quadrants.half.left.start),
    new Vector(quadrants.half.left.end),
  )

  const renderer = new Renderer(context)
  const engine = new PhysicsEngine(renderer)

  engine.addPoint(new Point(randomCoordinate))

  engine.addLine(new Line(new Vector(top.left), new Vector(top.right)))
  engine.addLine(new Line(new Vector(top.right), new Vector(bottom.right)))
  engine.addLine(new Line(new Vector(bottom.left), new Vector(bottom.right)))
  engine.addLine(new Line(new Vector(top.left), new Vector(bottom.left)))

  engine.start()
}
