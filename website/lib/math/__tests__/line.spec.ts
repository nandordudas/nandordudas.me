import { Line } from '../line'
import { Vector } from '../vector'

describe('line', () => {
  describe('instance', () => {
    it('should have correct properties', () => {
      const start = new Vector(2, 3)
      const end = new Vector(4, 5)
      const line = new Line(start, end)

      expect(line.start).toEqual(start)
      expect(line.end).toEqual(end)
      expect(line.velocity).toEqual({ x: 0, y: 0 })
      expect(line.acceleration).toEqual({ x: 0, y: 0 })
      expect(line.position).toEqual({ x: 0, y: 0 })
      expect(line.mass).toBe(Infinity)
    })

    it('should get length', () => {
      const zeroLengthLine = new Line(new Vector(2, 3), new Vector(2, 3))
      const horizontalLine = new Line(new Vector(1, 4), new Vector(7, 4))
      const verticalLine = new Line(new Vector(3, 2), new Vector(3, 8))
      const line = new Line(new Vector(2, 3), new Vector(5, 7))
      const negativeLine = new Line(new Vector(-5, -2), new Vector(-1, 3))

      expect(zeroLengthLine.length).toBe(0)
      expect(horizontalLine.length).toBe(6)
      expect(verticalLine.length).toBe(6)
      expect(line.length).toBeCloseTo(5, 6)
      expect(negativeLine.length).toBeCloseTo(6.4, 2)
    })
  })
})
