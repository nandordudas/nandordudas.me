import { PaddleSpeed, VerticalMovement } from './constants'

interface PaddleMovementConstructorProps {
  direction?: VerticalMovement
  speed?: number
  canvasHeight?: number
}

export class PaddleMovement implements PaddleMovementConstructorProps {
  /**
   * @default VerticalMovement.Neutral
   */
  readonly direction: VerticalMovement = VerticalMovement.Neutral
  /**
   * @default PaddleSpeed.Normal
   */
  readonly speed: number = PaddleSpeed.Normal
  /**
   * @default 0
   */
  readonly canvasHeight: number = 0

  constructor(props: PaddleMovementConstructorProps = {}) {
    Object.assign(this, props)
  }
}
