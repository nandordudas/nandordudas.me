import { Vector } from './vector'

export class Point implements Contracts.Body {
  /**
   * @default Vector.zero()
   */
  public velocity: Vector = Vector.zero()

  /**
   * @default Vector.zero()
   */
  public acceleration: Vector = Vector.zero()

  /**
   * @default false
   */
  #isForceApplied: boolean = false

  constructor(
    public readonly id: string,
    public position: Vector,
    /**
     * @default 1.0
     */
    public readonly mass: number = 1.0,
  ) { }

  /**
   * @modifies This point instance, `acceleration` and `#isForceApplied will be updated.
   */
  public applyForce(force: Vector): void {
    this.acceleration = this.acceleration.add(force.divide(this.mass))
    this.#isForceApplied = true
  }

  /**
   * @modifies This point instance, `velocity`, `position` and `acceleration` will be updated.
   */
  public update(deltaTime: number): void {
    if (!this.#isForceApplied)
      console.warn('No force applied to point. Did you forget to call `applyForce` before updating?')

    this.velocity = this.velocity.add(this.acceleration.multiply(deltaTime))
    this.position = this.position.add(this.velocity.multiply(deltaTime))
    // INFO: Reset acceleration after each update.
    this.acceleration = Vector.zero()
  }
}
