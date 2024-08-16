import { Body, type BodyConstructorProps } from './body'
import { BodyMass } from './constants'
import { Circle } from './shape.circle'

interface BallConstructorProps extends BodyConstructorProps { }

export class Ball extends Body implements BallConstructorProps {
  override readonly shape: Circle = new Circle()
  /**
   * @default BodyMass.Ball
   */
  override readonly mass: number = BodyMass.Ball

  constructor(props: BallConstructorProps) {
    super(props)
    Object.assign(this, props)
  }
}
