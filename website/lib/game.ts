import { type GameLevel, Points, Walls } from './math/constants'
import { Line } from './math/line'
import { PhysicsEngine } from './math/physics-engine'
import { Point } from './math/point'
import { Renderer } from './math/renderer'
import { canvasCoordinates, canvasQuadrants } from './math/utils'
import { Vector } from './math/vector'

const ballVelocityValue = {
  moveRight: [{ x: 100, y: -100 }, { x: 100, y: 100 }],
  moveLeft: [{ x: -100, y: -100 }, { x: -100, y: 100 }],
} satisfies Record<string, [Contracts.Coordinate, Contracts.Coordinate]>

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
export function start(context: OffscreenCanvasRenderingContext2D, _gameLevel?: GameLevel): void {
  const renderer = new Renderer(context)
  const engine = new PhysicsEngine(renderer)

  const { bottom, top } = canvasCoordinates(renderer.context.canvas)
  const quadrants = canvasQuadrants(renderer.context.canvas)

  // TODO: adjust ball velocity based on game level
  const ball = new Point(
    Points.Ball,
    // Randomize the ball's position in the left half of the canvas.
    Vector.randomize(quadrants.half.left.start, quadrants.half.left.end),
  ).setVelocity(Vector.randomize(...ballVelocityValue.moveRight))

  engine.addPoint(ball)

  engine.addLine(new Line(Walls.Top, top.left, top.right))
  engine.addLine(new Line(Walls.Right, top.right, bottom.right))
  engine.addLine(new Line(Walls.Bottom, bottom.left, bottom.right))
  engine.addLine(new Line(Walls.Left, top.left, bottom.left))

  engine.start()
}
