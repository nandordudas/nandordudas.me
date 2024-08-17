import { Body, type BodyConstructorProps } from './body'
import { Line } from './shape.line'

interface NetConstructorProps extends BodyConstructorProps { }

export class Net extends Body implements NetConstructorProps {
  override inert: boolean = true
  override readonly shape: Line = new Line()

  constructor(props: NetConstructorProps) {
    super(props)
    Object.assign(this, props)
  }
}
