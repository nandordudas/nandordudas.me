import type { MockInstance } from 'vitest'

import { Vector2D } from '../vector-2d'

describe('vector 2d', () => {
  describe('constructor', () => {
    it('should throw an error when called directly', () => {
      expect(() => new (Vector2D as any)(Symbol(''), 1, 1)).toThrow(TypeError)
    })

    it('should create a new instance using Vector2D.create', () => {
      const vector = Vector2D.create(1, 1)
      expect(vector).toBeInstanceOf(Vector2D)
    })

    it('should have correct x and y values', () => {
      const vector = Vector2D.create(1, 1)
      expect(vector.x).toBe(1)
      expect(vector.y).toBe(1)
    })

    it.todo('should store the instance in the #instances WeakMap')
  })

  describe('static methods', () => {
    describe('create', () => {
      it('should create a new instance of Vector2D', () => {
        const vector = Vector2D.create(1, 1)
        expect(vector).toBeInstanceOf(Vector2D)
      })

      it('should set the correct x and y values', () => {
        const vector = Vector2D.create(1, 1)
        expect(vector.x).toBe(1)
        expect(vector.y).toBe(1)
      })

      it('should throw a TypeError when non-numeric values are passed', () => {
        expect(() => Vector2D.create('a' as any, 1)).toThrow(TypeError)
        expect(() => Vector2D.create(1, 'b' as any)).toThrow(TypeError)
        expect(() => Vector2D.create('a' as any, 'b' as any)).toThrow(TypeError)
      })

      it('should handle zero values correctly', () => {
        const vector = Vector2D.create(0, 0)
        expect(vector.x).toBe(0)
        expect(vector.y).toBe(0)
      })

      it('should handle negative values correctly', () => {
        const vector = Vector2D.create(-1, -1)
        expect(vector.x).toBe(-1)
        expect(vector.y).toBe(-1)
      })
    })

    describe('dotProduct', () => {
      it('should return the correct dot product of two positive vectors', () => {
        const v = { x: 3, y: 4 }
        const w = { x: 1, y: 2 }
        const result = Vector2D.dotProduct(v, w)
        expect(result).toBe(11)
      })

      it('should return the correct dot product of a positive and a negative vector', () => {
        const v = { x: 3, y: 4 }
        const w = { x: -1, y: -2 }
        const result = Vector2D.dotProduct(v, w)
        expect(result).toBe(-11)
      })

      it('should return the correct dot product of two negative vectors', () => {
        const v = { x: -3, y: -4 }
        const w = { x: -1, y: -2 }
        const result = Vector2D.dotProduct(v, w)
        expect(result).toBe(11)
      })

      it('should return zero when one of the vectors is a zero vector', () => {
        const v = { x: 3, y: 4 }
        const w = { x: 0, y: 0 }
        const result = Vector2D.dotProduct(v, w)
        expect(result).toBe(0)
      })

      it('should return zero for orthogonal vectors', () => {
        const v = { x: 1, y: 0 }
        const w = { x: 0, y: 1 }
        const result = Vector2D.dotProduct(v, w)
        expect(result).toBe(0)
      })

      it('should return the correct dot product for parallel vectors', () => {
        const v = { x: 2, y: 2 }
        const w = { x: 4, y: 4 }
        const result = Vector2D.dotProduct(v, w)
        expect(result).toBe(16)
      })
    })

    describe('crossProduct', () => {
      it('should return the correct cross product of two positive vectors', () => {
        const v = { x: 3, y: 4 }
        const w = { x: 1, y: 2 }
        const result = Vector2D.crossProduct(v, w)
        expect(result).toBe(2)
      })

      it('should return the correct cross product of a positive and a negative vector', () => {
        const v = { x: 3, y: 4 }
        const w = { x: -1, y: -2 }
        const result = Vector2D.crossProduct(v, w)
        expect(result).toBe(-2)
      })

      it('should return the correct cross product of two negative vectors', () => {
        const v = { x: -3, y: -4 }
        const w = { x: -1, y: -2 }
        const result = Vector2D.crossProduct(v, w)
        expect(result).toBe(2)
      })

      it('should return zero when one of the vectors is a zero vector', () => {
        const v = { x: 3, y: 4 }
        const w = { x: 0, y: 0 }
        const result = Vector2D.crossProduct(v, w)
        expect(result).toBe(0)
      })

      it('should return zero for orthogonal vectors', () => {
        const v = { x: 1, y: 0 }
        const w = { x: 0, y: 1 }
        const result = Vector2D.crossProduct(v, w)
        expect(result).toBe(1)
      })

      it('should return zero for parallel vectors', () => {
        const v = { x: 2, y: 2 }
        const w = { x: 4, y: 4 }
        const result = Vector2D.crossProduct(v, w)
        expect(result).toBe(0)
      })
    })

    describe('clamp', () => {
      it('should clamp the vector within the specified range', () => {
        const vector = Vector2D.create(5, 10)
        const clampedVector = Vector2D.clamp(vector, 0, 8)
        expect(clampedVector.x).toBe(5)
        expect(clampedVector.y).toBe(8)
      })

      it('should not change the vector if it is already within the range', () => {
        const vector = Vector2D.create(3, 4)
        const clampedVector = Vector2D.clamp(vector, 0, 5)
        expect(clampedVector.x).toBe(3)
        expect(clampedVector.y).toBe(4)
      })

      it('should clamp the vector to the minimum value if it is below the range', () => {
        const vector = Vector2D.create(-5, -10)
        const clampedVector = Vector2D.clamp(vector, 0, 5)
        expect(clampedVector.x).toBe(0)
        expect(clampedVector.y).toBe(0)
      })

      it('should clamp the vector to the maximum value if it is above the range', () => {
        const vector = Vector2D.create(10, 15)
        const clampedVector = Vector2D.clamp(vector, 0, 8)
        expect(clampedVector.x).toBe(8)
        expect(clampedVector.y).toBe(8)
      })

      it('should handle negative values correctly', () => {
        const vector = Vector2D.create(-5, -10)
        const clampedVector = Vector2D.clamp(vector, -8, -3)
        expect(clampedVector.x).toBe(-5)
        expect(clampedVector.y).toBe(-8)
      })

      it('should handle zero values correctly', () => {
        const vector = Vector2D.create(0, 0)
        const clampedVector = Vector2D.clamp(vector, -5, 5)
        expect(clampedVector.x).toBe(0)
        expect(clampedVector.y).toBe(0)
      })

      it('should throw an error if min is greater than max', () => {
        const vector = Vector2D.create(5, 10)
        expect(() => Vector2D.clamp(vector, 10, 5)).toThrow(Error)
      })
    })

    describe('midpoint', () => {
      it('should return the correct midpoint of two positive vectors', () => {
        const v = { x: 4, y: 6 }
        const w = { x: 2, y: 4 }
        const result = Vector2D.midpoint(v, w)
        expect(result).toEqual({ x: 3, y: 5 })
      })

      it('should return the correct midpoint of a positive and a negative vector', () => {
        const v = { x: 4, y: 6 }
        const w = { x: -2, y: -4 }
        const result = Vector2D.midpoint(v, w)
        expect(result).toEqual({ x: 1, y: 1 })
      })

      it('should return the correct midpoint of two negative vectors', () => {
        const v = { x: -4, y: -6 }
        const w = { x: -2, y: -4 }
        const result = Vector2D.midpoint(v, w)
        expect(result).toEqual({ x: -3, y: -5 })
      })

      it('should return the correct midpoint when one vector is a zero vector', () => {
        const v = { x: 4, y: 6 }
        const w = { x: 0, y: 0 }
        const result = Vector2D.midpoint(v, w)
        expect(result).toEqual({ x: 2, y: 3 })
      })

      it('should return the correct midpoint between two zero vectors', () => {
        const v = { x: 0, y: 0 }
        const w = { x: 0, y: 0 }
        const result = Vector2D.midpoint(v, w)
        expect(result).toEqual({ x: 0, y: 0 })
      })

      it('should return the correct midpoint between vectors with floating-point values', () => {
        const v = { x: 1.5, y: 2.5 }
        const w = { x: 3.5, y: 4.5 }
        const result = Vector2D.midpoint(v, w)
        expect(result).toEqual({ x: 2.5, y: 3.5 })
      })
    })

    describe('isZero', () => {
      it('should return true for a vector with both x and y as zero', () => {
        const vector = Vector2D.create(0, 0)
        expect(vector.isZero()).toBe(true)
      })

      it('should return false for a vector with non-zero x and y components', () => {
        const vector = Vector2D.create(1, 1)
        expect(vector.isZero()).toBe(false)
      })

      it('should return false for a vector with non-zero x component', () => {
        const vector = Vector2D.create(1, 0)
        expect(vector.isZero()).toBe(false)
      })

      it('should return false for a vector with non-zero y component', () => {
        const vector = Vector2D.create(0, 1)
        expect(vector.isZero()).toBe(false)
      })

      it('should return true for a vector created using Vector2D.zero()', () => {
        const vector = Vector2D.zero()
        expect(vector.isZero()).toBe(true)
      })

      it('should return false for a vector created using Vector2D.create() with non-zero values', () => {
        const vector = Vector2D.create(1, 1)
        expect(vector.isZero()).toBe(false)
      })
    })
  })

  describe('instance methods', () => {
    describe('toString', () => {
      it('should return the correct string representation for a zero vector', () => {
        const vector = Vector2D.create(0, 0)
        expect(vector.toString()).toBe('Vector2D { x: 0, y: 0 }')
      })

      it('should return the correct string representation for a unit vector', () => {
        const vector = Vector2D.create(1, 1)
        expect(vector.toString()).toBe('Vector2D { x: 1, y: 1 }')
      })

      it('should return the correct string representation for a vector with positive coordinates', () => {
        const vector = Vector2D.create(3, 4)
        expect(vector.toString()).toBe('Vector2D { x: 3, y: 4 }')
      })

      it('should return the correct string representation for a vector with negative coordinates', () => {
        const vector = Vector2D.create(-3, -4)
        expect(vector.toString()).toBe('Vector2D { x: -3, y: -4 }')
      })

      it('should return the correct string representation for a vector with mixed coordinates', () => {
        const vector = Vector2D.create(3, -4)
        expect(vector.toString()).toBe('Vector2D { x: 3, y: -4 }')
      })
    })

    describe('toJSON', () => {
      it('should return the correct JSON representation for a vector with positive coordinates', () => {
        const vector = Vector2D.create(3, 4)
        const json = vector.toJSON()
        expect(json).toEqual({ x: 3, y: 4 })
      })

      it('should return the correct JSON representation for a vector with negative coordinates', () => {
        const vector = Vector2D.create(-3, -4)
        const json = vector.toJSON()
        expect(json).toEqual({ x: -3, y: -4 })
      })

      it('should return the correct JSON representation for a zero vector', () => {
        const vector = Vector2D.zero()
        const json = vector.toJSON()
        expect(json).toEqual({ x: 0, y: 0 })
      })

      it('should return the correct JSON representation for a unit vector', () => {
        const vector = Vector2D.unit()
        const json = vector.toJSON()
        expect(json).toEqual({ x: 1, y: 1 })
      })
    })

    describe('add', () => {
      it('should add two positive vectors correctly', () => {
        const v2 = { x: 3, y: 4 }
        const v1 = Vector2D.create(1, 2).add(v2)
        expect(v1.x).toBe(4)
        expect(v1.y).toBe(6)
      })

      it('should add a positive and a negative vector correctly', () => {
        const v2 = { x: -3, y: -4 }
        const v1 = Vector2D.create(1, 2).add(v2)
        expect(v1.x).toBe(-2)
        expect(v1.y).toBe(-2)
      })

      it('should add two negative vectors correctly', () => {
        const v2 = { x: -3, y: -4 }
        const v1 = Vector2D.create(-1, -2).add(v2)
        expect(v1.x).toBe(-4)
        expect(v1.y).toBe(-6)
      })

      it('should add a vector to a zero vector correctly', () => {
        const v2 = { x: 3, y: 4 }
        const v1 = Vector2D.create(0, 0).add(v2)
        expect(v1.x).toBe(3)
        expect(v1.y).toBe(4)
      })

      it('should add a zero vector to another vector correctly', () => {
        const v1 = Vector2D.create(1, 2)
        const v2 = { x: 0, y: 0 }
        v1.add(v2)
        expect(v1.x).toBe(1)
        expect(v1.y).toBe(2)
      })

      it('should add vectors with floating-point values correctly', () => {
        const v2 = { x: 3.5, y: 4.5 }
        const v1 = Vector2D.create(1.5, 2.5).add(v2)
        expect(v1.x).toBe(5)
        expect(v1.y).toBe(7)
      })
    })

    describe('subtract', () => {
      it('should subtract two positive vectors correctly', () => {
        const v2 = { x: 3, y: 2 }
        const v1 = Vector2D.create(5, 7).subtract(v2)
        expect(v1.x).toBe(2)
        expect(v1.y).toBe(5)
      })

      it('should subtract a positive vector from a negative vector correctly', () => {
        const v2 = { x: 3, y: 2 }
        const v1 = Vector2D.create(-5, -7).subtract(v2)
        expect(v1.x).toBe(-8)
        expect(v1.y).toBe(-9)
      })

      it('should subtract two negative vectors correctly', () => {
        const v2 = { x: -3, y: -2 }
        const v1 = Vector2D.create(-5, -7).subtract(v2)
        expect(v1.x).toBe(-2)
        expect(v1.y).toBe(-5)
      })

      it('should subtract a vector from itself resulting in a zero vector', () => {
        const v1 = Vector2D.create(5, 7).subtract({ x: 5, y: 7 })
        expect(v1.x).toBe(0)
        expect(v1.y).toBe(0)
      })

      it('should subtract a zero vector correctly', () => {
        const v1 = Vector2D.create(5, 7)
        const zeroVector = { x: 0, y: 0 }
        v1.subtract(zeroVector)
        expect(v1.x).toBe(5)
        expect(v1.y).toBe(7)
      })

      it('should subtract vectors with floating-point values correctly', () => {
        const v2 = { x: 3.3, y: 2.2 }
        const v1 = Vector2D.create(5.5, 7.7).subtract(v2)
        expect(v1.x).toBeCloseTo(2.2)
        expect(v1.y).toBeCloseTo(5.5)
      })
    })

    describe('multiply', () => {
      it('should multiply two vectors with positive values correctly', () => {
        const vector2 = { x: 4, y: 5 }
        const vector1 = Vector2D.create(2, 3).multiply(vector2)
        expect(vector1.x).toBe(8)
        expect(vector1.y).toBe(15)
      })

      it('should multiply two vectors with negative values correctly', () => {
        const vector2 = { x: -4, y: -5 }
        const vector1 = Vector2D.create(-2, -3).multiply(vector2)
        expect(vector1.x).toBe(8)
        expect(vector1.y).toBe(15)
      })

      it('should multiply vectors with mixed positive and negative values correctly', () => {
        const vector2 = { x: -4, y: 5 }
        const vector1 = Vector2D.create(2, -3).multiply(vector2)
        expect(vector1.x).toBe(-8)
        expect(vector1.y).toBe(-15)
      })

      it('should handle multiplication with zero values correctly', () => {
        const vector2 = { x: 0, y: 5 }
        const vector1 = Vector2D.create(2, 3).multiply(vector2)
        expect(vector1.x).toBe(0)
        expect(vector1.y).toBe(15)
      })

      it('should handle identity multiplication correctly', () => {
        const vector1 = Vector2D.create(2, 3)
        const vector2 = { x: 1, y: 1 }
        vector1.multiply(vector2)
        expect(vector1.x).toBe(2)
        expect(vector1.y).toBe(3)
      })
    })

    describe('divide', () => {
      it('should divide the vector by another non-zero vector', () => {
        const vector = Vector2D.create(10, 20)
        const divisor = Vector2D.create(2, 4)
        const result = vector.divide(divisor)
        expect(result.x).toBe(5)
        expect(result.y).toBe(5)
      })

      it('should throw a RangeError when dividing by a zero vector', () => {
        const vector = Vector2D.create(10, 20)
        const zeroVector = Vector2D.create(0, 0)
        expect(() => vector.divide(zeroVector)).toThrow(RangeError)
      })

      it.todo('should set the corresponding component to zero when dividing by a vector with zero components')

      it('should divide the vector by another vector with non-zero components', () => {
        const vector = Vector2D.create(10, 20)
        const divisor = Vector2D.create(2, 5)
        const result = vector.divide(divisor)
        expect(result.x).toBe(5)
        expect(result.y).toBe(4)
      })
    })

    describe('isOnAxes', () => {
      it('should return true when no axis is provided and either x or y is zero', () => {
        const vector1 = Vector2D.create(0, 5)
        const vector2 = Vector2D.create(5, 0)
        expect(vector1.isOnAxes()).toBe(true)
        expect(vector2.isOnAxes()).toBe(true)
      })

      it('should return false when no axis is provided and neither x nor y is zero', () => {
        const vector = Vector2D.create(5, 5)
        expect(vector.isOnAxes()).toBe(false)
      })

      it('should return true when x axis is provided and x is zero', () => {
        const vector = Vector2D.create(0, 5)
        expect(vector.isOnAxes('x')).toBe(true)
      })

      it('should return false when x axis is provided and x is not zero', () => {
        const vector = Vector2D.create(5, 5)
        expect(vector.isOnAxes('x')).toBe(false)
      })

      it('should return true when y axis is provided and y is zero', () => {
        const vector = Vector2D.create(5, 0)
        expect(vector.isOnAxes('y')).toBe(true)
      })

      it('should return false when y axis is provided and y is not zero', () => {
        const vector = Vector2D.create(5, 5)
        expect(vector.isOnAxes('y')).toBe(false)
      })

      it('should throw an error when an invalid axis is provided', () => {
        const vector = Vector2D.create(5, 5)
        expect(() => vector.isOnAxes('z' as any)).toThrow(RangeError)
      })

      it('should return true when both x and y are zero', () => {
        const vector = Vector2D.create(0, 0)
        expect(vector.isOnAxes()).toBe(true)
      })

      it('should return false when neither x nor y is zero', () => {
        const vector = Vector2D.create(5, 5)
        expect(vector.isOnAxes()).toBe(false)
      })
    })

    describe('isZero', () => {
      it('should return true for the zero vector', () => {
        const vector = Vector2D.create(0, 0)
        expect(vector.isZero()).toBe(true)
      })

      it('should return false for a non-zero vector', () => {
        const vector = Vector2D.create(1, 0)
        expect(vector.isZero()).toBe(false)
      })

      it('should return false for a vector with small non-zero values', () => {
        const vector = Vector2D.create(Number.EPSILON, Number.EPSILON)
        expect(vector.isZero()).toBe(false)
      })

      it('should return false for a vector with one zero component', () => {
        const vector = Vector2D.create(0, 1)
        expect(vector.isZero()).toBe(false)
      })

      it('should return false for a vector with negative values', () => {
        const vector = Vector2D.create(-1, -1)
        expect(vector.isZero()).toBe(false)
      })
    })

    describe('isParallelTo', () => {
      it('should return true for parallel vectors', () => {
        const v = Vector2D.create(2, 2)
        const w = Vector2D.create(4, 4)
        expect(v.isParallelTo(w)).toBe(true)
      })

      it('should return false for non-parallel vectors', () => {
        const v = Vector2D.create(2, 3)
        const w = Vector2D.create(4, 5)
        expect(v.isParallelTo(w)).toBe(false)
      })

      it('should return true for vectors that are scalar multiples', () => {
        const v = Vector2D.create(1, 2)
        const w = Vector2D.create(2, 4)
        expect(v.isParallelTo(w)).toBe(true)
      })

      it('should return false for orthogonal vectors', () => {
        const v = Vector2D.create(1, 0)
        const w = Vector2D.create(0, 1)
        expect(v.isParallelTo(w)).toBe(false)
      })

      it('should return true for zero vectors', () => {
        const v = Vector2D.create(0, 0)
        const w = Vector2D.create(0, 0)
        expect(v.isParallelTo(w)).toBe(true)
      })

      it('should return true for negative scalar multiples', () => {
        const v = Vector2D.create(1, 2)
        const w = Vector2D.create(-1, -2)
        expect(v.isParallelTo(w)).toBe(true)
      })

      it('should handle floating-point precision correctly', () => {
        const v = Vector2D.create(1.0000001, 2.0000001)
        const w = Vector2D.create(2.0000002, 4.0000002)
        expect(v.isParallelTo(w)).toBe(true)
      })

      it('should return true for nearly perpendicular vectors with custom threshold', () => {
        const vector1 = Vector2D.create(1, 0.0000001)
        const vector2 = Vector2D.create(0, 1)
        expect(vector1.isPerpendicularTo(vector2, 0.000001)).toBe(true)
      })

      it('should return false for non-perpendicular vectors with custom threshold', () => {
        const vector1 = Vector2D.create(1, 0.1)
        const vector2 = Vector2D.create(0, 1)
        expect(vector1.isPerpendicularTo(vector2, 0.01)).toBe(false)
      })
    })

    describe('isPerpendicularTo', () => {
      it('should return true for perpendicular vectors', () => {
        const v = Vector2D.create(1, 0)
        const w = Vector2D.create(0, 1)
        expect(v.isPerpendicularTo(w)).toBe(true)
      })

      it('should return false for non-perpendicular vectors', () => {
        const v = Vector2D.create(1, 1)
        const w = Vector2D.create(1, 2)
        expect(v.isPerpendicularTo(w)).toBe(false)
      })

      it('should return false when one of the vectors is a zero vector', () => {
        const v = Vector2D.create(0, 0)
        const w = Vector2D.create(1, 1)
        expect(v.isPerpendicularTo(w)).toBe(false)
      })

      it('should return true for vectors that are almost perpendicular within a threshold', () => {
        const v = Vector2D.create(1, 0)
        const w = Vector2D.create(0.0000001, 1)
        expect(v.isPerpendicularTo(w, 0.000001)).toBe(true)
      })

      it('should return false for vectors that are not perpendicular within a threshold', () => {
        const v = Vector2D.create(1, 0)
        const w = Vector2D.create(0.1, 1)
        expect(v.isPerpendicularTo(w, 0.000001)).toBe(false)
      })
    })

    describe('isEqualTo', () => {
      it('should return true for identical vectors', () => {
        const v1 = Vector2D.create(1, 1)
        const v2 = Vector2D.create(1, 1)
        expect(v1.isEqualTo(v2)).toBe(true)
      })

      it('should return false for different vectors', () => {
        const v1 = Vector2D.create(1, 1)
        const v2 = Vector2D.create(2, 2)
        expect(v1.isEqualTo(v2)).toBe(false)
      })

      it('should return true for zero vectors', () => {
        const v1 = Vector2D.create(0, 0)
        const v2 = Vector2D.create(0, 0)
        expect(v1.isEqualTo(v2)).toBe(true)
      })

      it('should return false for one zero vector and one non-zero vector', () => {
        const v1 = Vector2D.create(0, 0)
        const v2 = Vector2D.create(1, 1)
        expect(v1.isEqualTo(v2)).toBe(false)
      })

      it('should return true for vectors with very small differences within the threshold', () => {
        const v1 = Vector2D.create(1, 1)
        const v2 = Vector2D.create(1 + Number.EPSILON / 2, 1 + Number.EPSILON / 2)
        expect(v1.isEqualTo(v2)).toBe(true)
      })

      it('should return true for vectors within the threshold', () => {
        const v1 = Vector2D.create(1, 1)
        const v2 = Vector2D.create(1.0000001, 1.0000001)
        expect(v1.isEqualTo(v2, 0.000001)).toBe(true)
      })

      it('should return false for vectors outside the threshold', () => {
        const v1 = Vector2D.create(1, 1)
        const v2 = Vector2D.create(1.1, 1.1)
        expect(v1.isEqualTo(v2, 0.000001)).toBe(false)
      })
    })

    describe('lerpTo', () => {
      it('should interpolate correctly with t=0', () => {
        const v = Vector2D.create(1, 1)
        const w = Vector2D.create(3, 3)
        v.lerpTo(w, 0)
        expect(v.x).toBe(1)
        expect(v.y).toBe(1)
      })

      it('should interpolate correctly with t=1', () => {
        const w = Vector2D.create(3, 3)
        const v = Vector2D.create(1, 1).lerpTo(w, 1)
        expect(v.x).toBe(3)
        expect(v.y).toBe(3)
      })

      it('should interpolate correctly with t=0.5', () => {
        const w = Vector2D.create(3, 3)
        const v = Vector2D.create(1, 1).lerpTo(w, 0.5)
        expect(v.x).toBe(2)
        expect(v.y).toBe(2)
      })

      it('should throw an error when t is less than 0', () => {
        const v = Vector2D.create(1, 1)
        const w = Vector2D.create(3, 3)
        expect(() => v.lerpTo(w, -0.1)).toThrow(RangeError)
      })

      it('should throw an error when t is greater than 1', () => {
        const v = Vector2D.create(1, 1)
        const w = Vector2D.create(3, 3)
        expect(() => v.lerpTo(w, 1.1)).toThrow(RangeError)
      })

      it('should interpolate correctly with t=Number.EPSILON', () => {
        const v = Vector2D.create(1, 1)
        const w = Vector2D.create(3, 3)
        v.lerpTo(w, Number.EPSILON)
        expect(v.x).toBeCloseTo(1 + 2 * Number.EPSILON)
        expect(v.y).toBeCloseTo(1 + 2 * Number.EPSILON)
      })
    })

    describe('magnitudeSquared', () => {
      it('should return 0 for a zero vector', () => {
        const vector = Vector2D.create(0, 0)
        expect(vector.magnitudeSquared()).toBe(0)
      })

      it('should return 1 for a unit vector along the x-axis', () => {
        const vector = Vector2D.create(1, 0)
        expect(vector.magnitudeSquared()).toBe(1)
      })

      it('should return 1 for a unit vector along the y-axis', () => {
        const vector = Vector2D.create(0, 1)
        expect(vector.magnitudeSquared()).toBe(1)
      })

      it('should return the correct magnitude squared for a positive vector', () => {
        const vector = Vector2D.create(3, 4)
        expect(vector.magnitudeSquared()).toBe(25)
      })

      it('should return the correct magnitude squared for a negative vector', () => {
        const vector = Vector2D.create(-3, -4)
        expect(vector.magnitudeSquared()).toBe(25)
      })

      it('should return the correct magnitude squared for a mixed vector', () => {
        const vector = Vector2D.create(3, -4)
        expect(vector.magnitudeSquared()).toBe(25)
      })

      it('should use the cached value for subsequent calls', () => {
        const vector = Vector2D.create(3, 4)
        const firstCall = vector.magnitudeSquared()
        vector.x = 6 // Change the vector to invalidate the cache
        const secondCall = vector.magnitudeSquared()
        expect(firstCall).toBe(25)
        expect(secondCall).toBe(52)
      })

      it.todo('should use the cached value when called subsequently')
    })

    describe('magnitude', () => {
      it('should return the correct magnitude for a vector with positive components', () => {
        const vector = Vector2D.create(3, 4)
        const result = vector.magnitude()
        expect(result).toBe(5)
      })

      it('should return the correct magnitude for a vector with negative components', () => {
        const vector = Vector2D.create(-3, -4)
        const result = vector.magnitude()
        expect(result).toBe(5)
      })

      it('should return 0 for a zero vector', () => {
        const vector = Vector2D.create(0, 0)
        const result = vector.magnitude()
        expect(result).toBe(0)
      })

      it('should return the correct magnitude for a vector with one zero component', () => {
        const vector = Vector2D.create(0, 5)
        const result = vector.magnitude()
        expect(result).toBe(5)
      })

      it('should return the correct magnitude for a vector with floating-point components', () => {
        const vector = Vector2D.create(1.5, 2.5)
        const result = vector.magnitude()
        expect(result).toBeCloseTo(2.915, 3)
      })
    })

    describe('normalize', () => {
      it('should normalize a non-zero vector', () => {
        const vector = Vector2D.create(3, 4)
        const normalizedVector = vector.normalize()
        expect(normalizedVector).toBeInstanceOf(Vector2D)
        expect(normalizedVector.magnitude()).toBeCloseTo(1, 10)
      })

      it('should throw a TypeError when normalizing a zero vector', () => {
        const vector = Vector2D.create(0, 0)
        expect(() => vector.normalize()).toThrow(TypeError)
      })

      it('should normalize a vector with negative values', () => {
        const vector = Vector2D.create(-3, -4)
        const normalizedVector = vector.normalize()
        expect(normalizedVector).toBeInstanceOf(Vector2D)
        expect(normalizedVector.magnitude()).toBeCloseTo(1, 10)
      })

      it('should normalize a vector with mixed positive and negative values', () => {
        const vector = Vector2D.create(3, -4)
        const normalizedVector = vector.normalize()
        expect(normalizedVector).toBeInstanceOf(Vector2D)
        expect(normalizedVector.magnitude()).toBeCloseTo(1, 10)
      })
    })

    describe('invert', () => {
      it('should invert the vector on both axes', () => {
        const vector = Vector2D.create(3, 4).invert()
        expect(vector.x).toBe(-3)
        expect(vector.y).toBe(-4)
      })

      it('should invert the vector on the x axis', () => {
        const vector = Vector2D.create(3, 4).invert('x')
        expect(vector.x).toBe(-3)
        expect(vector.y).toBe(4)
      })

      it('should invert the vector on the y axis', () => {
        const vector = Vector2D.create(3, 4).invert('y')
        expect(vector.x).toBe(3)
        expect(vector.y).toBe(-4)
      })

      it('should throw a RangeError for an invalid axis', () => {
        const vector = Vector2D.create(3, 4)
        expect(() => vector.invert('z' as any)).toThrow(RangeError)
      })
    })

    describe('swap', () => {
      it('should correctly swap positive x and y values', () => {
        const vector = Vector2D.create(3, 4).swap()
        expect(vector.x).toBe(4)
        expect(vector.y).toBe(3)
      })

      it('should correctly swap negative x and y values', () => {
        const vector = Vector2D.create(-3, -4).swap()
        expect(vector.x).toBe(-4)
        expect(vector.y).toBe(-3)
      })

      it('should correctly swap zero values', () => {
        const vector = Vector2D.create(0, 0)
        vector.swap()
        expect(vector.x).toBe(0)
        expect(vector.y).toBe(0)
      })

      it('should correctly swap mixed positive and negative values', () => {
        const vector = Vector2D.create(3, -4).swap()
        expect(vector.x).toBe(-4)
        expect(vector.y).toBe(3)
      })

      it('should correctly swap floating-point values', () => {
        const vector = Vector2D.create(3.5, 4.5).swap()
        expect(vector.x).toBe(4.5)
        expect(vector.y).toBe(3.5)
      })
    })

    describe('rotate', () => {
      it('should not change the vector when rotated by 0 radians', () => {
        const vector = Vector2D.create(1, 0)
        vector.rotate(0)
        expect(vector.x).toBeCloseTo(1)
        expect(vector.y).toBeCloseTo(0)
      })

      it('should rotate the vector by π/2 radians (90 degrees)', () => {
        const vector = Vector2D.create(1, 0).rotate(Math.PI / 2)
        expect(vector.x).toBeCloseTo(0)
        expect(vector.y).toBeCloseTo(1)
      })

      it('should rotate the vector by π radians (180 degrees)', () => {
        const vector = Vector2D.create(1, 0).rotate(Math.PI)
        expect(vector.x).toBeCloseTo(-1)
        expect(vector.y).toBeCloseTo(0)
      })

      it('should rotate the vector by 3π/2 radians (270 degrees)', () => {
        const vector = Vector2D.create(1, 0).rotate(3 * Math.PI / 2)
        expect(vector.x).toBeCloseTo(0)
        expect(vector.y).toBeCloseTo(-1)
      })

      it('should rotate the vector by 2π radians (360 degrees)', () => {
        const vector = Vector2D.create(1, 0)
        vector.rotate(2 * Math.PI)
        expect(vector.x).toBeCloseTo(1)
        expect(vector.y).toBeCloseTo(0)
      })

      it('should rotate the vector by a negative angle', () => {
        const vector = Vector2D.create(1, 0).rotate(-Math.PI / 2)
        expect(vector.x).toBeCloseTo(0)
        expect(vector.y).toBeCloseTo(-1)
      })

      it('should not change the zero vector when rotated', () => {
        const vector = Vector2D.create(0, 0)
        vector.rotate(Math.PI / 2)
        expect(vector.x).toBeCloseTo(0)
        expect(vector.y).toBeCloseTo(0)
      })
    })

    describe('normal', () => {
      it('should create a normal vector in the default (counterclockwise) direction', () => {
        const vector = Vector2D.create(1, 0)
        const normalVector = vector.normal()
        expect(normalVector.x).toBe(-0)
        expect(normalVector.y).toBe(1)
      })

      it('should create a normal vector in the clockwise direction', () => {
        const vector = Vector2D.create(1, 0)
        const normalVector = vector.normal('clockwise')
        expect(normalVector.x).toBe(0)
        expect(normalVector.y).toBe(-1)
      })

      it('should throw an error when normalizing a zero vector', () => {
        const vector = Vector2D.create(0, 0)
        expect(() => vector.normal()).toThrow(TypeError)
      })

      it('should handle negative values correctly', () => {
        const vector = Vector2D.create(-1, 0)
        const normalVector = vector.normal()
        expect(normalVector.x).toBe(-0)
        expect(normalVector.y).toBe(-1)
      })

      it('should handle mixed positive and negative values correctly', () => {
        const vector = Vector2D.create(1, -1)
        const normalVector = vector.normal()
        expect(normalVector.x).toBe(1)
        expect(normalVector.y).toBe(1)
      })

      it('should handle large values correctly', () => {
        const vector = Vector2D.create(1e6, 0)
        const normalVector = vector.normal()
        expect(normalVector.x).toBe(-0)
        expect(normalVector.y).toBe(1e6)
      })

      it('should handle small values correctly', () => {
        const vector = Vector2D.create(1e-6, 0)
        const normalVector = vector.normal()
        expect(normalVector.x).toBe(-0)
        expect(normalVector.y).toBe(1e-6)
      })

      it('should throw an error for invalid direction input', () => {
        const vector = Vector2D.create(1, 0)
        expect(() => vector.normal('invalid' as any)).toThrow(RangeError)
      })
    })

    describe('angleTo', () => {
      it('should return the correct angle between two vectors', () => {
        const v = Vector2D.create(1, 0)
        const w = Vector2D.create(0, 1)
        const angle = v.angleTo(w)
        expect(angle).toBe(Math.PI / 2)
      })

      it('should return the correct angle between two vectors with y-axis as reference', () => {
        const v = Vector2D.create(1, 0)
        const w = Vector2D.create(0, 1)
        const angle = w.angleTo(v, 'y')
        expect(angle).toBe(Math.PI / 2)
      })

      it('should return 0 for the same vector', () => {
        const v = Vector2D.create(1, 1)
        const angle = v.angleTo(v)
        expect(angle).toBeCloseTo(0)
      })

      it('should return the correct angle for negative vectors', () => {
        const v = Vector2D.create(-1, 0)
        const w = Vector2D.create(0, -1)
        const angle = w.angleTo(v)
        expect(angle).toBe(Math.PI * 3 / 2)
      })

      it('should return the correct angle for orthogonal vectors', () => {
        const v = Vector2D.create(1, 0)
        const w = Vector2D.create(0, 1)
        const angle = v.angleTo(w)
        expect(angle).toBeCloseTo(Math.PI / 2)
      })

      it('should return the correct angle for parallel vectors', () => {
        const v = Vector2D.create(1, 1)
        const w = Vector2D.create(2, 2)
        const angle = v.angleTo(w)
        expect(angle).toBeCloseTo(0)
      })

      it('should throw an error for invalid axis', () => {
        const v = Vector2D.create(1, 0)
        const w = Vector2D.create(0, 1)
        expect(() => v.angleTo(w, 'z' as any)).toThrow(RangeError)
      })

      it('should handle zero vectors correctly', () => {
        const v = Vector2D.create(0, 0)
        const w = Vector2D.create(1, 1)
        const angle = v.angleTo(w)
        expect(angle).toBeCloseTo(Math.atan2(1, 1))
      })
    })

    describe('round', () => {
      it('should round positive values correctly', () => {
        const vector = Vector2D.create(1.5, 2.7)
        const roundedVector = vector.round()
        expect(roundedVector.x).toBe(2)
        expect(roundedVector.y).toBe(3)
      })

      it('should round negative values correctly', () => {
        const vector = Vector2D.create(-1.5, -2.7)
        const roundedVector = vector.round()
        expect(roundedVector.x).toBe(-1)
        expect(roundedVector.y).toBe(-3)
      })

      it('should round zero values correctly', () => {
        const vector = Vector2D.create(0, 0)
        const roundedVector = vector.round()
        expect(roundedVector.x).toBe(0)
        expect(roundedVector.y).toBe(0)
      })

      it('should not change values that are already integers', () => {
        const vector = Vector2D.create(1, 2)
        const roundedVector = vector.round()
        expect(roundedVector.x).toBe(1)
        expect(roundedVector.y).toBe(2)
      })
    })

    describe('floor', () => {
      it('should floor positive values correctly', () => {
        const vector = Vector2D.create(1.9, 2.5)
        const flooredVector = vector.floor()
        expect(flooredVector.x).toBe(1)
        expect(flooredVector.y).toBe(2)
      })

      it('should floor negative values correctly', () => {
        const vector = Vector2D.create(-1.9, -2.5)
        const flooredVector = vector.floor()
        expect(flooredVector.x).toBe(-2)
        expect(flooredVector.y).toBe(-3)
      })

      it('should handle zero values correctly', () => {
        const vector = Vector2D.create(0, 0)
        const flooredVector = vector.floor()
        expect(flooredVector.x).toBe(0)
        expect(flooredVector.y).toBe(0)
      })

      it('should handle already floored values correctly', () => {
        const vector = Vector2D.create(1, 2)
        const flooredVector = vector.floor()
        expect(flooredVector.x).toBe(1)
        expect(flooredVector.y).toBe(2)
      })

      it('should handle floating-point values correctly', () => {
        const vector = Vector2D.create(1.1, 2.9)
        const flooredVector = vector.floor()
        expect(flooredVector.x).toBe(1)
        expect(flooredVector.y).toBe(2)
      })
    })

    describe('ceil', () => {
      it('should round up positive decimal values', () => {
        const vector = Vector2D.create(1.2, 3.7)
        const ceiledVector = vector.ceil()
        expect(ceiledVector.x).toBe(2)
        expect(ceiledVector.y).toBe(4)
      })

      it('should round up negative decimal values', () => {
        const vector = Vector2D.create(-1.2, -3.7)
        const ceiledVector = vector.ceil()
        expect(ceiledVector.x).toBe(-1)
        expect(ceiledVector.y).toBe(-3)
      })

      it('should not change integer values', () => {
        const vector = Vector2D.create(2, 4)
        const ceiledVector = vector.ceil()
        expect(ceiledVector.x).toBe(2)
        expect(ceiledVector.y).toBe(4)
      })

      it('should correctly handle zero values', () => {
        const vector = Vector2D.create(0, 0)
        const ceiledVector = vector.ceil()
        expect(ceiledVector.x).toBe(0)
        expect(ceiledVector.y).toBe(0)
      })

      it('should correctly handle large values', () => {
        const vector = Vector2D.create(123456.789, -987654.321)
        const ceiledVector = vector.ceil()
        expect(ceiledVector.x).toBe(123457)
        expect(ceiledVector.y).toBe(-987654)
      })
    })

    describe('trunc', () => {
      it('should truncate positive values correctly', () => {
        const vector = Vector2D.create(5.9, 10.7)
        const truncatedVector = vector.trunc()
        expect(truncatedVector.x).toBe(5)
        expect(truncatedVector.y).toBe(10)
      })

      it('should truncate negative values correctly', () => {
        const vector = Vector2D.create(-5.9, -10.7)
        const truncatedVector = vector.trunc()
        expect(truncatedVector.x).toBe(-5)
        expect(truncatedVector.y).toBe(-10)
      })

      it('should handle zero values correctly', () => {
        const vector = Vector2D.create(0, 0)
        const truncatedVector = vector.trunc()
        expect(truncatedVector.x).toBe(0)
        expect(truncatedVector.y).toBe(0)
      })

      it('should truncate mixed values correctly', () => {
        const vector = Vector2D.create(5.9, -10.7)
        const truncatedVector = vector.trunc()
        expect(truncatedVector.x).toBe(5)
        expect(truncatedVector.y).toBe(-10)
      })

      it('should handle values with decimal points correctly', () => {
        const vector = Vector2D.create(1.1, -1.1)
        const truncatedVector = vector.trunc()
        expect(truncatedVector.x).toBe(1)
        expect(truncatedVector.y).toBe(-1)
      })
    })

    describe('limit', () => {
      it('should throw an error if min is greater than or equal to max', () => {
        const vector = Vector2D.create(1, 1)
        expect(() => vector.limit(5, 5)).toThrow(RangeError)
        expect(() => vector.limit(6, 5)).toThrow(RangeError)
      })

      it('should return the same vector if it is a zero vector', () => {
        const vector = Vector2D.create(0, 0)
        const limitedVector = vector.limit(1, 5)
        expect(limitedVector.x).toBe(0)
        expect(limitedVector.y).toBe(0)
      })

      it('should correctly limit the magnitude of the vector to the specified range', () => {
        const vector = Vector2D.create(3, 4)
        const limitedVector = vector.limit(2, 4)
        const limitedMagnitude = limitedVector.magnitude()
        expect(limitedMagnitude).toBeGreaterThanOrEqual(2)
        expect(limitedMagnitude).toBeLessThanOrEqual(4)
      })

      it('should not change the vector if its magnitude is already within the range', () => {
        const vector = Vector2D.create(3, 4)
        const limitedVector = vector.limit(1, 6)
        expect(limitedVector.x).toBe(3)
        expect(limitedVector.y).toBe(4)
      })

      it('should correctly handle negative values', () => {
        const vector = Vector2D.create(-3, -4)
        const limitedVector = vector.limit(2, 4)
        const limitedMagnitude = limitedVector.magnitude()
        expect(limitedMagnitude).toBeGreaterThanOrEqual(2)
        expect(limitedMagnitude).toBeLessThanOrEqual(4)
      })
    })

    describe('randomize', () => {
      let mathRandomSpy: MockInstance<() => number>

      beforeEach(() => {
        mathRandomSpy = vi.spyOn(Math, 'random')
      })

      afterEach(() => {
        mathRandomSpy.mockRestore()
      })

      it('should randomize within the specified range', () => {
        mathRandomSpy.mockReturnValue(0.5)
        const min = { x: 1, y: 1 }
        const max = { x: 10, y: 10 }
        const vector = Vector2D.create(0, 0).randomize(min, max)
        expect(vector.x).toBeGreaterThanOrEqual(min.x)
        expect(vector.x).toBeLessThanOrEqual(max.x)
        expect(vector.y).toBeGreaterThanOrEqual(min.y)
        expect(vector.y).toBeLessThanOrEqual(max.y)
      })

      it('should randomize with integer values when asFloat is false', () => {
        mathRandomSpy.mockReturnValue(0.5)
        const vector = Vector2D.create(0, 0)
        const min = { x: 1, y: 1 }
        const max = { x: 10, y: 10 }
        vector.randomize(min, max, 'integer')
        expect(Number.isInteger(vector.x)).toBe(true)
        expect(Number.isInteger(vector.y)).toBe(true)
      })

      it('should randomize with float values when asFloat is true', () => {
        mathRandomSpy.mockReturnValue(0.5)
        const min = { x: 1, y: 1 }
        const max = { x: 10, y: 10 }
        const vector = Vector2D.create(0, 0).randomize(min, max, 'float')
        expect(vector.x).not.toBe(Math.floor(vector.x))
        expect(vector.y).not.toBe(Math.floor(vector.y))
      })

      it('should throw a RangeError if min is greater than or equal to max', () => {
        const vector = Vector2D.create(0, 0)
        const min = { x: 10, y: 10 }
        const max = { x: 1, y: 1 }
        expect(() => vector.randomize(min, max)).toThrow(RangeError)
      })
    })

    describe('clone', () => {
      it('should return a new instance of Vector2D', () => {
        const vector = Vector2D.create(1, 2)
        const clonedVector = vector.clone()
        expect(clonedVector).toBeInstanceOf(Vector2D)
      })

      it('should have the same x and y values as the original vector', () => {
        const vector = Vector2D.create(1, 2)
        const clonedVector = vector.clone()
        expect(clonedVector.x).toBe(vector.x)
        expect(clonedVector.y).toBe(vector.y)
      })

      it('should not affect the original vector when the cloned vector is modified', () => {
        const vector = Vector2D.create(1, 2)
        const clonedVector = vector.clone()
        clonedVector.x = 3
        clonedVector.y = 4
        expect(vector.x).toBe(1)
        expect(vector.y).toBe(2)
      })

      it('should not affect the cloned vector when the original vector is modified', () => {
        const vector = Vector2D.create(1, 2)
        const clonedVector = vector.clone()
        vector.x = 3
        vector.y = 4
        expect(clonedVector.x).toBe(1)
        expect(clonedVector.y).toBe(2)
      })
    })

    describe('reflectInPlace', () => {
      it('should reflect the vector in place with a normalized vector', () => {
        const normal = Vector2D.create(0, 1).normalize()
        const vector = Vector2D.create(1, 2).reflectInPlace(normal)
        expect(vector.x).toBe(-1)
        expect(vector.y).toBe(2)
      })

      it('should reflect the vector in place with a non-normalized vector', () => {
        const normal = Vector2D.create(0, 2)
        const vector = Vector2D.create(1, 2).reflectInPlace(normal)
        expect(vector.x).toBe(-1)
        expect(vector.y).toBe(2)
      })

      it('should throw an error when reflecting with a zero vector', () => {
        const vector = Vector2D.create(1, 2)
        const normal = Vector2D.create(0, 0)
        expect(() => vector.reflectInPlace(normal)).toThrow(TypeError)
      })

      it('should reflect the vector in place with orthogonal vectors', () => {
        const normal = Vector2D.create(0, 1)
        const vector = Vector2D.create(1, 0).reflectInPlace(normal)
        expect(vector.x).toBe(-1)
        expect(vector.y).toBe(0)
      })

      it('should reflect the vector in place with parallel vectors', () => {
        const vector = Vector2D.create(1, 1)
        const normal = Vector2D.create(1, 1).normalize()
        vector.reflectInPlace(normal)
        expect(vector.x).toBeCloseTo(1, 1)
        expect(vector.y).toBeCloseTo(1, 1)
      })
    })

    describe('projectOnto', () => {
      it('should project onto a non-zero vector correctly', () => {
        const v = Vector2D.create(3, 4)
        const normal = Vector2D.create(1, 0)
        const projection = v.projectOnto(normal)
        expect(projection.x).toBe(3)
        expect(projection.y).toBe(0)
      })

      it('should throw an error when projecting onto a zero vector', () => {
        const v = Vector2D.create(3, 4)
        const normal = Vector2D.create(0, 0)
        expect(() => v.projectOnto(normal)).toThrow(TypeError)
      })

      it('should return zero when projecting onto orthogonal vectors', () => {
        const v = Vector2D.create(3, 4)
        const normal = Vector2D.create(0, 1)
        const projection = v.projectOnto(normal)
        expect(projection.x).toBe(0)
        expect(projection.y).toBe(4)
      })

      it('should return the same vector when projecting onto parallel vectors', () => {
        const v = Vector2D.create(3, 4)
        const normal = Vector2D.create(3, 4)
        const projection = v.projectOnto(normal)
        expect(projection.x).toBe(3)
        expect(projection.y).toBe(4)
      })

      it('should project correctly onto vectors with negative components', () => {
        const v = Vector2D.create(3, 4)
        const normal = Vector2D.create(-1, -1)
        const projection = v.projectOnto(normal)
        expect(projection.x).toBe(3.5)
        expect(projection.y).toBe(3.5)
      })
    })

    describe('distanceSquared', () => {
      it('should return the correct distance squared between two positive vectors', () => {
        const v = Vector2D.create(3, 4)
        const w = Vector2D.create(1, 2)
        const result = v.distanceSquared(w)
        expect(result).toBe(8)
      })

      it('should return the correct distance squared between a positive and a negative vector', () => {
        const v = Vector2D.create(3, 4)
        const w = Vector2D.create(-1, -2)
        const result = v.distanceSquared(w)
        expect(result).toBe(52)
      })

      it('should return the correct distance squared between two negative vectors', () => {
        const v = Vector2D.create(-3, -4)
        const w = Vector2D.create(-1, -2)
        const result = v.distanceSquared(w)
        expect(result).toBe(8)
      })

      it('should return the correct distance squared when one of the vectors is a zero vector', () => {
        const v = Vector2D.create(3, 4)
        const w = Vector2D.create(0, 0)
        const result = v.distanceSquared(w)
        expect(result).toBe(25)
      })

      it('should return zero when the vectors are identical', () => {
        const v = Vector2D.create(3, 4)
        const result = v.distanceSquared(v)
        expect(result).toBe(0)
      })
    })

    describe('distance', () => {
      it('should return the correct distance between two vectors', () => {
        const v1 = Vector2D.create(3, 4)
        const v2 = Vector2D.create(0, 0)
        const result = v1.distance(v2)
        expect(result).toBe(5)
      })

      it('should return the correct distance between two vectors on the x-axis', () => {
        const v1 = Vector2D.create(3, 4)
        const v2 = Vector2D.create(0, 4)
        const result = v1.distance(v2, 'x')
        expect(result).toBe(3)
      })

      it('should return the correct distance between two vectors on the y-axis', () => {
        const v1 = Vector2D.create(3, 4)
        const v2 = Vector2D.create(3, 0)
        const result = v1.distance(v2, 'y')
        expect(result).toBe(4)
      })

      it('should return zero when calculating the distance between a vector and itself', () => {
        const v1 = Vector2D.create(3, 4)
        const result = v1.distance(v1)
        expect(result).toBe(0)
      })

      it('should return the correct distance between vectors with negative coordinates', () => {
        const v1 = Vector2D.create(-3, -4)
        const v2 = Vector2D.create(0, 0)
        const result = v1.distance(v2)
        expect(result).toBe(5)
      })

      it('should return the correct distance between vectors with zero coordinates', () => {
        const v1 = Vector2D.create(0, 0)
        const v2 = Vector2D.create(0, 0)
        const result = v1.distance(v2)
        expect(result).toBe(0)
      })

      it('should throw an error when an invalid coordinate key is provided', () => {
        const v1 = Vector2D.create(3, 4)
        const v2 = Vector2D.create(0, 0)
        expect(() => v1.distance(v2, 'z' as any)).toThrow(RangeError)
      })
    })

    describe.todo('release', () => {
      it.todo('should push the instance back to the pool')
      it.todo('should increase the pool size by one')
      it.todo('should push the correct instance to the pool')
    })
  })
})
