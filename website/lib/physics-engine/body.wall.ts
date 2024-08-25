import type { Vector2D } from './vector-2d'

import { Body, type BodyConstructorProps } from './body'
import { BodyMass } from './constants'
import { Line } from './shape.line'

interface WallConstructorProps extends BodyConstructorProps { }

export class Wall extends Body implements WallConstructorProps {
  override readonly shape: Line = new Line()
  /**
   * @default BodyMass.Wall
   */
  override readonly mass: number = BodyMass.Wall

  constructor(props: WallConstructorProps) {
    super(props)
    Object.assign(this, props)
  }

  unit(): Vector2D {
    return this.shape.end.subtract(this.shape.start)
  }
}
