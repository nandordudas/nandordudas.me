import { Line } from './math/line'
import { PhysicsEngine } from './math/physics-engine'
import { Point } from './math/point'
import { Renderer } from './math/renderer'
import { getCanvasCoordinates, getQuadrants } from './math/utils'
import { Vector } from './math/vector'

export default (context: OffscreenCanvasRenderingContext2D): void => {
  const quadrants = getQuadrants(context)
  const { bottom, top } = getCanvasCoordinates(context)
  const randomPointLeft = Vector.zero().randomize(quadrants.half.left.start, quadrants.half.left.end)

  const renderer = new Renderer(context)
  const engine = new PhysicsEngine(renderer)

  engine.addPoint(new Point(randomPointLeft))

  engine.addLine(new Line(top.left, top.right))
  engine.addLine(new Line(top.right, bottom.right))
  engine.addLine(new Line(bottom.left, bottom.right))
  engine.addLine(new Line(top.left, bottom.left))

  engine.start()
}
