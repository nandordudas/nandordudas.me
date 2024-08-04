export class DivideByZeroError extends Error {
  public override name = this.constructor.name

  constructor() {
    super('Cannot divide by zero')

    Object.setPrototypeOf(this, DivideByZeroError.prototype)
  }
}

export class ContextMissingError extends Error {
  public override name = this.constructor.name

  constructor() {
    super('Context missing')

    Object.setPrototypeOf(this, ContextMissingError.prototype)
  }
}
