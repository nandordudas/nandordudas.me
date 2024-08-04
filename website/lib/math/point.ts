import type { BodyContract } from './type'

import { Vector } from './vector'

export class Point implements BodyContract {
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
  #forceApplied: boolean = false

  constructor(
    public position: Vector,

    /**
     * @default 1.0
     */
    public readonly mass: number = 1.0,
  ) { }

  /**
   * @modifies This point `instance`, `acceleration` will be updated.
   */
  public applyForce(force: Vector): void {
    this.acceleration = this.acceleration.add(force.divide(this.mass))
    this.#forceApplied = true
  }

  /**
   * @modifies This point instance, `velocity`, `position` and `acceleration` will be updated.
   */
  public update(deltaTime: number): void {
    if (!this.#forceApplied)
      console.warn('No force applied to point. Did you forget to call applyForce() before updating?')

    this.velocity = this.velocity.add(this.acceleration.multiply(deltaTime))
    this.position = this.position.add(this.velocity.multiply(deltaTime))
    this.acceleration = Vector.zero() // Reset acceleration after each update
  }
}
