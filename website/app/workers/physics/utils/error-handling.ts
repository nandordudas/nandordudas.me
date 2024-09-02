export function raiseError(
  message: string,
  ErrorType = Error,
): never {
  throw new ErrorType(message)
}
