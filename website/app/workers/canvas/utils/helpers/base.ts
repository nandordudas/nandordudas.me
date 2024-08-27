import type { Utils } from 'canvas'

import * as check from './is'

type ErrorBuilder = new (message?: string) => Error

export function assert(
  condition: boolean,
  message: string,
  ErrorType: ErrorBuilder = Error,
): asserts condition {
  if (!condition)
    raiseError(message, ErrorType)
}

export function raiseError(
  message: string,
  ErrorType: ErrorBuilder = Error,
): never {
  throw new ErrorType(message)
}

export function assertIsNumber(
  value: unknown,
  message: string,
): asserts value is number {
  assert(check.isNumber(value), message, TypeError)
}

export function assertIsBoolean(
  value: unknown,
  message: string,
): asserts value is boolean {
  assert(check.isBoolean(value), message, TypeError)
}

export function assertIsNotNull<T = unknown>(
  value: T,
  message: string,
): asserts value is NonNullable<T> {
  assert(check.isNotNull<T>(value), message, TypeError)
}

export function assertIsFunction<T extends <T>(...args: any[]) => T>(
  value: unknown,
  message: string,
): asserts value is T {
  assert(check.isFunction<T>(value), message, TypeError)
}

export function doIf<T>(
  condition: boolean,
  callback: () => T,
): T | undefined {
  assertIsFunction(callback, 'Callback must be a function')

  if (condition)
    return callback()
}

export function listenToMessagePort<T = any>(
  listener: (event: Utils.MessageEvent<T>) => void,
  port: MessagePort,
): () => void {
  assertIsFunction(listener, 'Listener must be a function')
  assert(port instanceof MessagePort, 'Port must be an instance of MessagePort')

  port.addEventListener('message', listener)
  port.start()

  return () => port.removeEventListener('message', listener)
}

export function divideComponent(
  component: number,
  divisor: number,
): number {
  assertIsNumber(component, 'Component must be a number')
  assertIsNumber(divisor, 'Divisor must be a number')

  if (Math.abs(divisor) < Number.EPSILON) {
    console.warn('Division by near-zero value. Returning maximum safe value.')

    return component < 0 ? -Number.MAX_VALUE : Number.MAX_VALUE
  }

  return component / divisor
}

export function clamp(
  value: number,
  min: number,
  max: number,
): number {
  assertIsNumber(value, 'Value must be a number')
  assertIsNumber(min, 'Minimum value must be a number')
  assertIsNumber(max, 'Maximum value must be a number')
  assert(min < max, 'Minimum value must be less than maximum value')

  return Math.min(Math.max(value, min), max)
}
