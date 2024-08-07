import { Shape } from './shape'

export class Rectangle extends Shape {
  constructor(
    public readonly width: number = 0,
    public readonly height: number = 0,
  ) {
    super()
  }
}
