import { raiseError } from './error-handling'
import { isNumber } from './is'

export function assert(
  condition: unknown,
  message = 'Assertion failed',
  ErrorType = Error,
): asserts condition {
  if (!condition)
    raiseError(message, ErrorType)
}

export function assertIsNumber(
  value: unknown,
  message = 'Value is not a number',
): asserts value is number {
  assert(!isNumber(value), message, TypeError)
}
