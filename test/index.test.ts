import { pipe } from 'fp-ts/function'
import * as D from 'io-ts/Decoder'
import * as _ from '../src'
import * as fc from './fc'

describe('crossref-ts', () => {
  describe('codecs', () => {
    describe('WorkC', () => {
      test('when the work can be decoded', () => {
        fc.assert(
          fc.property(fc.crossrefWork(), work => {
            const actual = pipe(work, _.WorkC.encode, _.WorkC.decode)

            expect(actual).toStrictEqual(D.success(work))
          }),
        )
      })

      test('when the work cannot be decoded', () => {
        fc.assert(
          fc.property(fc.string(), string => {
            const actual = _.WorkC.decode(string)

            expect(actual).toStrictEqual(D.failure(expect.anything(), expect.anything()))
          }),
        )
      })
    })
  })
})
