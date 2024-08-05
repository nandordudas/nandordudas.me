import { Point } from '../point'
import { Vector } from '../vector'

const idMock = 'point-mock'

describe('point', () => {
  describe('instance', () => {
    it('should have correct properties', () => {
      const mass = 5
      const point0 = new Point(idMock, new Vector(2, 3))
      const point1 = new Point(idMock, new Vector(2, 3), mass)

      expect(point0.position).toEqual({ x: 2, y: 3 })
      expect(point0.mass).toBe(1)
      expect(point0.velocity).toEqual({ x: 0, y: 0 })
      expect(point0.acceleration).toEqual({ x: 0, y: 0 })
      expect(point1.position).toEqual({ x: 2, y: 3 })
      expect(point1.mass).toBe(mass)
      expect(point1.velocity).toEqual({ x: 0, y: 0 })
      expect(point1.position).toEqual({ x: 2, y: 3 })
      expect(point1.acceleration).toEqual({ x: 0, y: 0 })
    })

    it('should apply force', () => {
      const mass = 4
      const force = new Vector(2, 3)
      const point0 = new Point(idMock, new Vector(2, 3))
      const point1 = new Point(idMock, new Vector(2, 3), mass)

      expect(point0.acceleration).toEqual({ x: 0, y: 0 })
      expect(point1.acceleration).toEqual({ x: 0, y: 0 })

      point0.applyForce(force)
      point1.applyForce(force)

      expect(point0.acceleration).toEqual({ x: 2, y: 3 })
      expect(point1.acceleration).toEqual({ x: 0.5, y: 0.75 })
    })

    it('should update velocity ', () => {
      const mass = 4
      const force = new Vector(2, 3)
      const point0 = new Point(idMock, new Vector(2, 3))
      const point1 = new Point(idMock, new Vector(2, 3), mass)

      expect(point0.velocity).toEqual({ x: 0, y: 0 })
      expect(point1.velocity).toEqual({ x: 0, y: 0 })

      point0.applyForce(force)
      point0.update(2)

      expect(point0.velocity).toEqual({ x: 4, y: 6 })

      point1.applyForce(force)
      point1.update(2)

      expect(point1.velocity).toEqual({ x: 1, y: 1.5 })
    })
  })
})
