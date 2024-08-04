import { ContextMissingError, DivideByZeroError } from '../errors'

describe('errors', () => {
  describe('divideByZeroError', () => {
    it('should have correct properties', () => {
      const error = new DivideByZeroError()

      expect(error instanceof Error).toBeTruthy()
      expect(error.name).toBe('DivideByZeroError')
      expect(error.message).toBe('Cannot divide by zero')
      expect(() => { throw error }).toThrowError(DivideByZeroError)
    })
  })

  describe('contextMissingError', () => {
    it('should have correct properties', () => {
      const error = new ContextMissingError()

      expect(error instanceof Error).toBeTruthy()
      expect(error.name).toBe('ContextMissingError')
      expect(error.message).toBe('Context missing')
      expect(() => { throw error }).toThrowError(ContextMissingError)
    })
  })
})
