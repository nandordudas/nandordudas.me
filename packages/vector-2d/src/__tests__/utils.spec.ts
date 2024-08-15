import {
  clamp,
  hasProperty,
  isArray2D,
  isCoordinateKey,
  isCoordinates2D,
  isDefined,
  isNumber,
  isObject,
  randomBetween,
  toCoordinates2D,
} from '../utils'

describe('utils', () => {
  describe('isNumber', () => {
    it('should return true for numbers', () => {
      expect(isNumber(5)).toBe(true)
      expect(isNumber(-5)).toBe(true)
      expect(isNumber(0)).toBe(true)
      expect(isNumber(5.5)).toBe(true)
    })

    it('should return false for non-numbers', () => {
      expect(isNumber('5')).toBe(false)
      expect(isNumber(null)).toBe(false)
      expect(isNumber(undefined)).toBe(false)
      expect(isNumber(Number.NaN)).toBe(false)
      expect(isNumber(Infinity)).toBe(false)
    })
  })

  describe('isArray2D', () => {
    it('should return true for 2D arrays', () => {
      expect(isArray2D([1, 2])).toBe(true)
    })

    it('should return false for non-2D arrays', () => {
      expect(isArray2D([1])).toBe(false)
      expect(isArray2D([1, 2, 3])).toBe(false)
      expect(isArray2D('1,2')).toBe(false)
      expect(isArray2D(null)).toBe(false)
      expect(isArray2D(undefined)).toBe(false)
    })
  })

  describe('isObject', () => {
    it('should return true for objects', () => {
      expect(isObject({})).toBe(true)
      expect(isObject({ x: 1 })).toBe(true)
      expect(isObject([])).toBe(true)
    })

    it('should return false for non-objects', () => {
      expect(isObject(null)).toBe(false)
      expect(isObject(undefined)).toBe(false)
      expect(isObject(5)).toBe(false)
      expect(isObject('string')).toBe(false)
    })
  })

  describe('hasProperty', () => {
    it('should return true if object has the property', () => {
      expect(hasProperty({ x: 1 }, 'x')).toBe(true)
      expect(hasProperty({ y: 2 }, 'y')).toBe(true)
    })

    it('should return false if object does not have the property', () => {
      expect(hasProperty({ x: 1 }, 'y')).toBe(false)
      expect(hasProperty({ y: 2 }, 'x')).toBe(false)
    })

    it.fails('should return false for non-objects', () => {
      expect(hasProperty(null as any, 'x')).toBe(false)
      expect(hasProperty(undefined as any, 'x')).toBe(false)
      expect(hasProperty(5 as any, 'x')).toBe(false)
      expect(hasProperty('string' as any, 'x')).toBe(false)
    })
  })

  describe.todo('createWeakMapKey', () => {
    it.todo('should create a key for number inputs')
    it.todo('should create a key for Coordinates inputs')
  })

  describe('isCoordinates2D', () => {
    it('should return true for 2D coordinate objects', () => {
      expect(isCoordinates2D({ x: 1, y: 2 })).toBe(true)
    })

    it('should return false for non-2D coordinate objects', () => {
      expect(isCoordinates2D({ x: 1 })).toBe(false)
      expect(isCoordinates2D({ y: 2 })).toBe(false)
      expect(isCoordinates2D({ x: 1, y: '2' })).toBe(false)
      expect(isCoordinates2D(null)).toBe(false)
      expect(isCoordinates2D(undefined)).toBe(false)
    })
  })

  describe('toCoordinates2D', () => {
    it('should convert numbers to 2D coordinates', () => {
      expect(toCoordinates2D(5)).toEqual({ x: 5, y: 5 })
    })

    it('should convert 2D coordinate objects correctly', () => {
      expect(toCoordinates2D({ x: 1, y: 2 })).toEqual({ x: 1, y: 2 })
    })

    it('should convert 2D arrays correctly', () => {
      expect(toCoordinates2D([1, 2])).toEqual({ x: 1, y: 2 })
    })

    it('should throw an error for invalid inputs', () => {
      expect(() => toCoordinates2D('invalid' as any)).toThrow('Invalid coordinates')
    })
  })

  describe('clamp', () => {
    it('should clamp values correctly within the range', () => {
      expect(clamp(5, 0, 10)).toBe(5)
      expect(clamp(-5, 0, 10)).toBe(0)
      expect(clamp(15, 0, 10)).toBe(10)
    })

    it('should throw an error when min is greater than or equal to max', () => {
      expect(() => clamp(5, 10, 0)).toThrow('Min must be less than or equal to max')
      expect(() => clamp(5, 10, 10)).toThrow('Min must be less than or equal to max')
    })
  })

  describe('isDefined', () => {
    it('should return true for defined values', () => {
      expect(isDefined(5)).toBe(true)
      expect(isDefined('test')).toBe(true)
      expect(isDefined({})).toBe(true)
      expect(isDefined([])).toBe(true)
    })

    it('should return false for null and undefined values', () => {
      expect(isDefined(null)).toBe(false)
      expect(isDefined(undefined)).toBe(false)
    })
  })

  describe('isCoordinateKey', () => {
    it('should return true for "x" and "y"', () => {
      expect(isCoordinateKey('x')).toBe(true)
      expect(isCoordinateKey('y')).toBe(true)
    })

    it('should return false for other strings', () => {
      expect(isCoordinateKey('z')).toBe(false)
      expect(isCoordinateKey('a')).toBe(false)
      expect(isCoordinateKey('1')).toBe(false)
    })
  })

  describe('randomBetween', () => {
    it('should return a random float between min and max', () => {
      const result = randomBetween(0, 10)
      expect(result).toBeGreaterThanOrEqual(0)
      expect(result).toBeLessThanOrEqual(10)
    })

    it('should return a random integer between min and max when asFloat is false', () => {
      const result = randomBetween(0, 10, 'integer')
      expect(result).toBeGreaterThanOrEqual(0)
      expect(result).toBeLessThanOrEqual(10)
      expect(Number.isInteger(result)).toBe(true)
    })

    it('should throw an error when min is greater than max', () => {
      expect(() => randomBetween(10, 0)).toThrow('Min must be less than max')
    })

    it('should throw an error when min is equal to max', () => {
      expect(() => randomBetween(10, 10)).toThrow('Min must be less than max')
    })
  })
})
