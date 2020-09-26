import { parse } from '../index'

describe('parse()', () => {
  describe('given a sensor and a value', () => {
    it('returns the object', () => {
      expect(parse(0b010100000000000100000011)).toEqual({
        sensorId: '40',
        value: '259',
      })

      expect(parse(0b010100010000000100000011)).toEqual({
        sensorId: '40',
        value: '-259',
      })

      expect(parse(0b111111110011111111111111)).toEqual({
        sensorId: '127',
        value: '-16383',
      })

      expect(parse(0b111111100011111111111111)).toEqual({
        sensorId: '127',
        value: '16383',
      })

      expect(parse(0b111111101111111111111111)).toEqual({
        sensorId: '127',
        value: '16.383',
      })

      expect(parse(0b111111111111111111111111)).toEqual({
        sensorId: '127',
        value: '-16.383',
      })
    })
  })
})
