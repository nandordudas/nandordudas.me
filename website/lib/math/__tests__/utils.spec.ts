import { random } from '../utils'

const spyMathFloor = vi.spyOn(Math, 'floor')
const spyMathRandom = vi.spyOn(Math, 'random')

describe('utils', () => {
  describe('random', () => {
    const min = 0
    const max = 10

    it('should return a random number between min and max', () => {
      const result = random(min, max)

      expect(result).toBeGreaterThanOrEqual(min)
      expect(result).toBeLessThanOrEqual(max)
      expect(spyMathFloor).toHaveBeenCalledTimes(1)
      expect(spyMathRandom).toHaveBeenCalledTimes(1)

      const mockValue = 0.5
      const expected = mockValue * (max - min + 1) + min

      spyMathRandom.mockReturnValueOnce(mockValue)

      expect(random(min, max)).toBe(5)
      expect(spyMathFloor).toHaveBeenCalledWith(expected)
    })
  })
})
