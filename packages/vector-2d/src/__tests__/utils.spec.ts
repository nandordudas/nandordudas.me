import {
  clamp,
  isArray2D,
  isCoordinateKey,
  isCoordinates2D,
  isDefined,
  isNumber,
  randomBetween,
  toCoordinates2D,
} from '../utils'

describe('utilities', () => {
  describe('isNumber', () => {
    it('should return true for valid numbers', () => {
      expect(isNumber(42)).toBe(true)
      expect(isNumber(-42)).toBe(true)
      expect(isNumber(0)).toBe(true)
      expect(isNumber(3.14)).toBe(true)
      expect(isNumber(Number.MAX_SAFE_INTEGER)).toBe(true)
    })

    it('should return false for non-number values', () => {
      expect(isNumber(Number.NaN)).toBe(false)
      expect(isNumber(Infinity)).toBe(false)
      expect(isNumber(-Infinity)).toBe(false)
      expect(isNumber('42')).toBe(false)
      expect(isNumber(null)).toBe(false)
      expect(isNumber(undefined)).toBe(false)
      expect(isNumber({})).toBe(false)
      expect(isNumber([])).toBe(false)
    })
  })

  describe('isArray2D', () => {
    it('should return true for valid 2D arrays', () => {
      expect(isArray2D([1, 2])).toBe(true)
      expect(isArray2D([0, 0])).toBe(true)
      expect(isArray2D([-1, 3.14])).toBe(true)
    })

    it('should return false for arrays that are not 2D', () => {
      expect(isArray2D([1, 2, 3])).toBe(false) // more than 2 elements
      expect(isArray2D([1])).toBe(false) // less than 2 elements
      expect(isArray2D([])).toBe(false) // empty array
      expect(isArray2D([1, '2'])).toBe(false) // non-number element
      expect(isArray2D(['1', '2'])).toBe(false)// non-number elements
    })

    it('should return false for non-array values', () => {
      expect(isArray2D('not an array')).toBe(false)
      expect(isArray2D(42)).toBe(false)
      expect(isArray2D(null)).toBe(false)
      expect(isArray2D(undefined)).toBe(false)
      expect(isArray2D({ x: 1, y: 2 })).toBe(false)
    })
  })

  describe('isCoordinates2D', () => {
    it('should return true for valid Coordinates2D objects', () => {
      expect(isCoordinates2D({ x: 1, y: 2 })).toBe(true)
      expect(isCoordinates2D({ x: 0, y: 0 })).toBe(true)
      expect(isCoordinates2D({ x: -1, y: 3.14 })).toBe(true)
    })

    it('should return false for objects without x and y properties', () => {
      expect(isCoordinates2D({ x: 1 })).toBe(false) // missing y
      expect(isCoordinates2D({ y: 2 })).toBe(false) // missing x
      expect(isCoordinates2D({ x: 1, y: undefined })).toBe(false) // y is undefined
      expect(isCoordinates2D({ x: null, y: 2 })).toBe(false) // x is null
      expect(isCoordinates2D({ x: '1', y: 2 })).toBe(false) // x is not a number
    })

    it('should return false for non-object values', () => {
      expect(isCoordinates2D([1, 2])).toBe(false) // array instead of object
      expect(isCoordinates2D('not an object')).toBe(false) // string instead of object
      expect(isCoordinates2D(42)).toBe(false) // number instead of object
      expect(isCoordinates2D(null)).toBe(false) // null value
      expect(isCoordinates2D(undefined)).toBe(false) // undefined value
    })
  })

  describe('toCoordinates2D', () => {
    it('should convert a number to Coordinates2D', () => {
      const result = toCoordinates2D(5)

      expect(result).toEqual({ x: 5, y: 5 })
    })

    it('should convert a valid Coordinates2D object to itself', () => {
      const coords = { x: 1, y: 2 }
      const result = toCoordinates2D(coords)

      expect(result).toBe(coords)
    })

    it('should convert a valid Array2D to Coordinates2D', () => {
      const result = toCoordinates2D([3, 4])

      expect(result).toEqual({ x: 3, y: 4 })
    })

    it('should return cached result when input is already cached', () => {
      const coords = { x: 10, y: 20 }
      const firstCall = toCoordinates2D(coords)
      const secondCall = toCoordinates2D(coords)

      expect(secondCall).toBe(firstCall)
    })

    it('should throw an error for invalid inputs', () => {
      expect(() => toCoordinates2D('invalid' as any)).toThrow('Invalid coordinates')
      expect(() => toCoordinates2D([1] as any)).toThrow('Invalid coordinates')
      expect(() => toCoordinates2D({ x: 1 } as any)).toThrow('Invalid coordinates')
    })

    it('should cache the result in WeakMap', () => {
      const numberInput = 7
      const coords = { x: 1, y: 2 }
      const arrayInput = [5, 6]

      const spyWeakMapSet = vi.spyOn(WeakMap.prototype, 'set')

      toCoordinates2D(numberInput)
      toCoordinates2D(coords)
      toCoordinates2D(arrayInput as any)

      expect(spyWeakMapSet).toHaveBeenCalledTimes(3 + 1)

      spyWeakMapSet.mockRestore()
    })
  })

  describe('clamp', () => {
    it('should clamp values within the range', () => {
      expect(clamp(5, 1, 10)).toBe(5) // Within range
      expect(clamp(0, 1, 10)).toBe(1) // Below min
      expect(clamp(15, 1, 10)).toBe(10) // Above max
    })

    it('should throw an error when min is greater than max', () => {
      expect(() => clamp(5, 10, 1)).toThrow('Min must be less than or equal to max')
      expect(() => clamp(0, 5, 1)).toThrow('Min must be less than or equal to max')
      expect(() => clamp(5, 5, 5)).toThrow('Min must be less than or equal to max')
    })

    it('should handle negative values correctly', () => {
      expect(clamp(-5, -10, 0)).toBe(-5) // Within range
      expect(clamp(-15, -10, 0)).toBe(-10) // Below min
      expect(clamp(5, -10, 0)).toBe(0) // Above max
    })
  })

  describe('isDefined', () => {
    it('should return true for defined values', () => {
      expect(isDefined(0)).toBe(true) // number
      expect(isDefined('string')).toBe(true) // string
      expect(isDefined({})).toBe(true) // object
      expect(isDefined([])).toBe(true) // array
      expect(isDefined(true)).toBe(true) // boolean
      expect(isDefined(() => {})).toBe(true) // function
      expect(isDefined(Symbol(''))).toBe(true) // symbol
    })

    it('should return false for null and undefined values', () => {
      expect(isDefined(null)).toBe(false) // null
      expect(isDefined(undefined)).toBe(false) // undefined
    })
  })

  describe('isCoordinateKey', () => {
    it('should return true for valid CoordinateKey values', () => {
      expect(isCoordinateKey('x')).toBe(true) // valid key
      expect(isCoordinateKey('y')).toBe(true) // valid key
    })

    it('should return false for invalid CoordinateKey values', () => {
      expect(isCoordinateKey('z')).toBe(false) // invalid key
      expect(isCoordinateKey('')).toBe(false) // empty string
      expect(isCoordinateKey('x and y')).toBe(false) // multiple characters
      expect(isCoordinateKey(1 as any)).toBe(false) // number
      expect(isCoordinateKey(null as any)).toBe(false) // null
      expect(isCoordinateKey(undefined as any)).toBe(false) // undefined
    })
  })

  describe('randomBetween', () => {
    it('should generate a number within the specified range (inclusive)', () => {
      const min = 1
      const max = 10
      const results = new Set<number>()

      for (let i = 0; i < 1_000; ++i) {
        const result = randomBetween(min, max)

        expect(result).toBeGreaterThanOrEqual(min)
        expect(result).toBeLessThanOrEqual(max)

        results.add(result)
      }

      // Ensure that at least one number within the range was generated
      expect(results.size).toBeGreaterThan(0)
    })

    it.each([
      { min: 1, max: 10, asFloat: true },
      { min: 1.5, max: 5.5, asFloat: true },
      { min: 1, max: 5, asFloat: false },
    ])('should generate a number within the range ($min, $max) with [asFloat=$asFloat]', ({ min, max, asFloat }) => {
      for (let i = 0; i < 1_000; ++i) {
        const result = randomBetween(min, max, asFloat)

        expect(result).toBeGreaterThanOrEqual(min)
        expect(result).toBeLessThanOrEqual(max)

        if (asFloat)
          expect(result).toBeTypeOf('number')
        else
          expect(Number.isInteger(result)).toBe(true)
      }
    })

    it('should throw an error when min is greater than max', () => {
      expect(() => randomBetween(10, 5)).toThrow('Min must be less than or equal to max')
      expect(() => randomBetween(10, 10)).toThrow('Min and max cannot be equal')
    })
  })
})
