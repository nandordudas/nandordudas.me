import { Line } from '../line'
import { Vector } from '../vector'

const idMock = 'line-mock'

describe('line', () => {
  describe('instance', () => {
    it('should have correct properties', () => {
      const start = new Vector(2, 3)
      const end = new Vector(4, 5)
      const line0 = new Line(idMock, start, end)
      const line1 = new Line(idMock, { x: 2, y: 3 }, { x: 4, y: 5 })

      for (const line of [line0, line1]) {
        expect(line.start).toEqual(start)
        expect(line.end).toEqual(end)
        expect(line.velocity).toEqual({ x: 0, y: 0 })
        expect(line.acceleration).toEqual({ x: 0, y: 0 })
        expect(line.position).toEqual({ x: 0, y: 0 })
        expect(line.mass).toBe(Infinity)
      }
    })

    it('should get length', () => {
      const zeroLengthLine = new Line(idMock, new Vector(2, 3), new Vector(2, 3))
      const horizontalLine = new Line(idMock, new Vector(1, 4), new Vector(7, 4))
      const verticalLine = new Line(idMock, new Vector(3, 2), new Vector(3, 8))
      const line = new Line(idMock, new Vector(2, 3), new Vector(5, 7))
      const negativeLine = new Line(idMock, new Vector(-5, -2), new Vector(-1, 3))

      expect(zeroLengthLine.length).toBe(0)
      expect(horizontalLine.length).toBe(6)
      expect(verticalLine.length).toBe(6)
      expect(line.length).toBeCloseTo(5, 6)
      expect(negativeLine.length).toBeCloseTo(6.4, 2)
    })
  })
})
