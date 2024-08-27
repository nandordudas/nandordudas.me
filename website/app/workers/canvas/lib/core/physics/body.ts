import type { Physics, Utils } from 'canvas'

import * as bodyConstants from './constants/body.constants'
import { Vector2D, vector } from './math/vector-2d'

import * as base from '~/workers/canvas/utils/helpers/base'

interface BodyConstructorOptions extends Physics.BodyBase {
  mass: number
  restitution: number
  radius: number
  width: number
  height: number
}

interface BodyContract {
  get position(): Vector2D
  get velocity(): Vector2D
  get isStatic(): boolean
  isInstanceOf: <T extends Body>(value: Utils.Constructor<T>) => this is T
  applyForce: (value: Vector2D) => void
  step: (deltaTime: number) => void
  move: (value: Vector2D) => void
}

export class Body implements BodyContract {
  static #createBoxVertices(
    width: number,
    height: number,
  ): Physics.Vertices {
    const left = -width / 2
    const right = left + width
    const bottom = -height / 2
    const top = bottom + height

    const vertices = Array.from<Vector2D>({
      length: bodyConstants.VERTICES_LENGTH,
    }) as unknown as Physics.Vertices

    vertices[0] = vector(left, top)
    vertices[1] = vector(right, top)
    vertices[2] = vector(right, bottom)
    vertices[3] = vector(left, bottom)

    return vertices
  }

  #position: Vector2D
  #velocity: Vector2D
  #acceleration: Vector2D
  /*  */
  #force: Vector2D
  /*  */
  #density: number
  #mass: number
  #inverseMass: number
  #restitution: number
  #area: number = 0
  /*  */
  #isStatic: boolean
  #radius: number
  #width: number
  #height: number
  //
  #vertices: null | Physics.Vertices = null
  #shapeType: bodyConstants.ShapeType

  get position(): Vector2D {
    return this.#position
  }

  get velocity(): Vector2D {
    return this.#velocity
  }

  get isStatic(): boolean {
    return this.#isStatic
  }

  get width(): number {
    return this.#width
  }

  get height(): number {
    return this.#height
  }

  get radius(): number {
    return this.#radius
  }

  constructor(options: BodyConstructorOptions) {
    const { density, restitution } = options

    base.assert(density > bodyConstants.MIN_BODY_DENSITY, 'Density is too small', RangeError)
    base.assert(density < bodyConstants.MAX_BODY_DENSITY, 'Density is too large', RangeError)
    base.assert(
      restitution >= bodyConstants.MIN_RESTITUTION && restitution <= bodyConstants.MAX_RESTITUTION,
      'Restitution is out of range',
      RangeError,
    )

    this.#position = options.position
    this.#velocity = Vector2D.random(100)
    this.#acceleration = Vector2D.zero
    /*  */
    this.#force = Vector2D.zero
    /*  */
    this.#density = density
    this.#inverseMass = options.isStatic ? 0 : base.divideComponent(1, options.mass)
    this.#restitution = restitution
    this.#mass = options.mass
    /*  */
    this.#isStatic = options.isStatic
    /*  */
    this.#radius = options.radius
    this.#width = options.width
    this.#height = options.height
    this.#shapeType = options.shapeType

    if (this.#shapeType === bodyConstants.ShapeType.Box)
      this.#vertices = Body.#createBoxVertices(options.width, options.height)
  }

  isInstanceOf<T extends Body>(value: Utils.Constructor<T>): this is T {
    return this instanceof value
  }

  applyForce(value: Vector2D): void {
    this.#force = value
  }

  step(deltaTime: number): void {
    if (this.#isStatic)
      return

    this.#acceleration = this.#force.clone().multiply(this.#inverseMass)

    this.#velocity.add(this.#acceleration.clone().multiply(deltaTime))
    this.#position.add(this.#velocity.clone().multiply(deltaTime))

    this.#force = Vector2D.zero
  }

  move(value: Vector2D): void {
    this.#position.add(value)
  }
}
