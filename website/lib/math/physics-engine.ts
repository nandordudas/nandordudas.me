import type { Line } from './line'
import type { Point } from './point'
import type { Renderer } from './renderer'
import type { BodyContract, PhysicsEngineContract } from './type'

export class PhysicsEngine implements PhysicsEngineContract {
  /**
   * @default 0.0
   */
  public readonly gravity: number = 0.0

  /**
   * @default 1.0
   */
  public readonly friction: number = 1.0

  /**
   * @default []
   */
  public points: Point[] = []

  /**
   * @default []
   */
  public lines: Line[] = []

  /**
   * @default []
   */
  public bodies: BodyContract[] = []

  constructor(public renderer: Renderer) { }

  public start(): void {
    this.renderer.render(this.update)
  }

  public stop(): void {
    this.renderer.stop()
  }

  /**
   * @modifies This physics engine instance, `bodies`.
   */
  public addBody<T extends BodyContract>(body: T): T {
    this.bodies.push(body)

    return body
  }

  /**
   * @modifies This physics engine instance, `lines`.
   */
  public addLine(line: Line): void {
    this.lines.push(this.addBody(line))
  }

  /**
   * @modifies This physics engine instance, `points`.
   */
  public addPoint(point: Point): void {
    this.points.push(this.addBody(point))
  }

  public update = (deltaTime: number): void => {
    for (const point of this.points) {
      const force = point.velocity.multiply(-1 * this.friction * this.gravity)

      point.applyForce(force)
      point.update(deltaTime)
      this.renderer.drawPoint(point)
    }

    for (const line of this.lines)
      this.renderer.drawLine(line)

    // TODO: Add collision detection
  }
}
