export class ContextMissingError extends Error {
  public override readonly name = 'ContextMissingError'

  constructor(message: string) {
    super(message)

    Object.setPrototypeOf(this, new.target.prototype)

    if (Error.captureStackTrace)
      Error.captureStackTrace(this, ContextMissingError)
  }
}
