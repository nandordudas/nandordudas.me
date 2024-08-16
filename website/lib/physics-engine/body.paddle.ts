import { Body, type BodyConstructorProps } from './body'
import { BodyMass } from './constants'
import { PaddleMovement } from './paddle-movement'
import { Rectangle } from './shape.rectangle'

interface PaddleConstructorProps extends BodyConstructorProps {
  movement?: PaddleMovement
  isRobot?: boolean
}

export class Paddle extends Body implements PaddleConstructorProps {
  override shape: Rectangle = new Rectangle()
  /**
   * @default BodyMass.Paddle
   */
  override mass: number = BodyMass.Paddle
  /**
   * @default new PaddleMovement()
   */
  readonly movement: PaddleMovement = new PaddleMovement()
  /**
   * @default false
   */
  readonly isRobot: boolean = false

  constructor(props: PaddleConstructorProps) {
    super(props)
    Object.assign(this, props)
  }
}
