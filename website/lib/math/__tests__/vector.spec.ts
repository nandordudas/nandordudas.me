import { DivideByZeroError } from '../errors'
import * as utils from '../utils'
import { Vector } from '../vector'

const spyMathRandom = vi.spyOn(Math, 'random')

const spyRandom = vi.spyOn(utils, 'random')

const spyAdd = vi.spyOn(Vector.prototype, 'add')
const spyMultiply = vi.spyOn(Vector.prototype, 'multiply')
const spyMagnitudeSquared = vi.spyOn(Vector.prototype, 'magnitudeSquared')
const spyMagnitude = vi.spyOn(Vector.prototype, 'magnitude')
const spyNormalize = vi.spyOn(Vector.prototype, 'normalize')
const spyInvertX = vi.spyOn(Vector.prototype, 'invertX')
const spyInvertY = vi.spyOn(Vector.prototype, 'invertY')

describe('vector', () => {
  describe('static', () => {
    it('should create a new zero vector', () => {
      const v = Vector.zero()

      expect(v).toEqual({ x: 0, y: 0 })
    })

    it('should get distance between two vectors', () => {
      const v0 = new Vector(0, 0)
      const v1 = new Vector(3, 4)

      expect(Vector.distance(v0, v1)).toBe(5)
      expect(v0).toEqual({ x: 0, y: 0 })
      expect(v1).toEqual({ x: 3, y: 4 })
    })

    it('should get dot product of two vectors', () => {
      const v0 = new Vector(2, 3)
      const v1 = new Vector(4, 5)

      expect(Vector.dot(v0, v1)).toBe(23)
      expect(v0).toEqual({ x: 2, y: 3 })
      expect(v1).toEqual({ x: 4, y: 5 })
    })

    it('should get randomized vector between two vectors', () => {
      const v0 = new Vector(1, 1)
      const v1 = new Vector(3, 3)

      spyMathRandom.mockReturnValue(0.5)

      expect(Vector.randomize(v0, v1)).toEqual({ x: 2, y: 2 })
      expect(spyMathRandom).toHaveBeenCalledTimes(2)
      expect(spyRandom).toHaveBeenCalledWith(1, 3)
    })
  })

  describe('getters', () => {
    describe('standalone', () => {
      it('should return the length of the vector', () => {
        const v = new Vector(2, 3)

        expect(v.length).toBeCloseTo(3.606, 3)
        expect(spyMagnitudeSquared).toHaveBeenCalledTimes(1)
      })

      it('should check if the vector is zero', () => {
        const v = new Vector(0, 0)

        expect(v.isZero).toBeTruthy()
        expect(v.add(new Vector(1, 1)).isZero).toBeFalsy()
      })
    })

    describe('chainable', () => {
      it('should return the unit vector', () => {
        const v = new Vector(5, 12)
        const expected = new Vector(5 / 13, 12 / 13)

        expect(v.unit).toEqual(expected)
        expect(spyNormalize).toHaveBeenCalledTimes(1)
      })
    })
  })

  describe('instance', () => {
    describe('standalone', () => {
      it('should create a new vector', () => {
        const v = new Vector(0, 0)

        expect(v).toBeInstanceOf(Vector)
        expect(v).toHaveProperty('x', 0)
        expect(v).toHaveProperty('y', 0)
        expect(v).toEqual({ x: 0, y: 0 })
        expect(new Vector({ x: 0, y: 0 })).toEqual({ x: 0, y: 0 })
      })

      it('should convert to string', () => {
        expect(new Vector(0, 0).toString()).toEqual('Vector(0, 0)')
      })

      it('should get magnitude squared', () => {
        const v = new Vector(2, 3)

        expect(v.magnitudeSquared()).toEqual(13)
        expect(v).toEqual({ x: 2, y: 3 })
      })

      it('should get magnitude', () => {
        const v = new Vector(2, 3)

        expect(v.magnitude()).toBeCloseTo(3.606, 3)
        expect(spyMagnitudeSquared).toHaveBeenCalledTimes(1)
        expect(v).toEqual({ x: 2, y: 3 })
      })

      it('should get slope', () => {
        expect(new Vector(5, 12).slope()).toEqual(12 / 5)
        expect(() => new Vector(0, 5).slope()).toThrowError(DivideByZeroError)
        expect(new Vector(5, 0).slope()).toEqual(0)
      })

      it('should convert to array', () => {
        expect(new Vector(2, 3).toArray()).toEqual([2, 3])
      })
    })

    describe('chainable', () => {
      it('should add two vectors', () => {
        const v0 = new Vector(2, 3)
        const v1 = new Vector(4, 5)

        expect(v0.add(v1)).toEqual({ x: 6, y: 8 })
        expect(v0).toEqual({ x: 2, y: 3 })
        expect(v1).toEqual({ x: 4, y: 5 })
      })

      it('should subtract two vectors', () => {
        const v0 = new Vector(2, 3)
        const v1 = new Vector(4, 5)

        expect(v0.subtract(v1)).toEqual({ x: -2, y: -2 })
        expect(spyAdd).toHaveBeenCalledWith({ x: -4, y: -5 })
        expect(v0).toEqual({ x: 2, y: 3 })
        expect(v1).toEqual({ x: 4, y: 5 })
      })

      it('should multiply a vector by a scalar', () => {
        const v = new Vector(2, 3)

        expect(v.multiply(2)).toEqual({ x: 4, y: 6 })
        expect(v).toEqual({ x: 2, y: 3 })
      })

      it('should divide a vector by a scalar', () => {
        const v = new Vector(2, 3)

        expect(v.divide(2)).toEqual({ x: 1, y: 1.5 })
        expect(spyMultiply).toHaveBeenCalledWith(0.5)
        expect(v).toEqual({ x: 2, y: 3 })
      })

      it('should clone vector', () => {
        const v = new Vector(2, 3)
        const clone = v.clone()

        expect(clone).toEqual({ x: 2, y: 3 })

        clone.x = 2
        clone.y = 4

        expect(clone).toEqual({ x: 2, y: 4 })
        expect(v).toEqual({ x: 2, y: 3 })

        v.x = 3
        v.y = 2

        expect(v).toEqual({ x: 3, y: 2 })
        expect(clone).toEqual({ x: 2, y: 4 })
      })

      it('should normalize a vector', () => {
        const v = new Vector(5, 12)
        const expected = new Vector(5 / 13, 12 / 13)

        expect(v.normalize()).toEqual(expected)
        expect(spyMagnitude).toHaveBeenCalledTimes(1)
        expect(spyMultiply).toHaveBeenCalledTimes(1)
        expect(v).toEqual({ x: 5, y: 12 })
      })

      it('should get normal vector', () => {
        const v = new Vector(5, 12)

        expect(v.normal()).toEqual({ x: -12, y: 5 })
        expect(v).toEqual({ x: 5, y: 12 })
      })

      describe('mutations', () => {
        it('should invert vector', () => {
          const v = new Vector(5, 12)

          expect(v.invert()).toEqual(v)
          expect(v).toEqual({ x: -5, y: -12 })
          expect(spyInvertX).toHaveBeenCalledTimes(1)
          expect(spyInvertY).toHaveBeenCalledTimes(1)
          expect(v.invertX()).toEqual(v)
          expect(v).toEqual({ x: 5, y: -12 })
          expect(v.invertY()).toEqual(v)
          expect(v).toEqual({ x: 5, y: 12 })
        })
      })
    })
  })
})
