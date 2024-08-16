import { Body, type BodyConstructorProps } from './body'
import { PlaceholderShape } from './shape.placeholder'

export class PlaceholderBody extends Body {
  constructor(props: BodyConstructorProps = { shape: new PlaceholderShape() }) {
    super(props)
    Object.assign(this, props)
  }
}
