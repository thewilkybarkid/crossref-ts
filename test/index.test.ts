import fetchMock from 'fetch-mock'
import * as E from 'fp-ts/Either'
import { pipe } from 'fp-ts/function'
import { StatusCodes } from 'http-status-codes'
import * as D from 'io-ts/Decoder'
import * as _ from '../src'
import * as fc from './fc'

describe('crossref-ts', () => {
  describe('constructors', () => {
    describe('getWork', () => {
      test('when the work can be decoded', async () => {
        await fc.assert(
          fc.asyncProperty(
            fc.doi(),
            fc
              .crossrefWork()
              .chain(work =>
                fc.tuple(
                  fc.constant(work),
                  fc.response({ status: fc.constant(StatusCodes.OK), text: fc.constant(_.WorkC.encode(work)) }),
                ),
              ),
            async (doi, [work, response]) => {
              const fetch = fetchMock
                .sandbox()
                .getOnce(`https://api.crossref.org/works/${encodeURIComponent(doi)}`, response)

              const actual = await _.getWork(doi)({ fetch })()

              expect(actual).toStrictEqual(D.success(work))
            },
          ),
        )
      })

      test('when the work cannot be decoded', async () => {
        await fc.assert(
          fc.asyncProperty(fc.doi(), fc.response({ status: fc.constant(StatusCodes.OK) }), async (doi, response) => {
            const fetch = fetchMock
              .sandbox()
              .getOnce(`https://api.crossref.org/works/${encodeURIComponent(doi)}`, response)

            const actual = await _.getWork(doi)({ fetch })()

            expect(actual).toStrictEqual(D.failure(expect.anything(), expect.anything()))
          }),
        )
      })

      test('when the response has a non-200 status code', async () => {
        await fc.assert(
          fc.asyncProperty(
            fc.doi(),
            fc.response({ status: fc.statusCode().filter(status => status !== StatusCodes.OK) }),
            async (doi, response) => {
              const fetch = fetchMock
                .sandbox()
                .getOnce(`https://api.crossref.org/works/${encodeURIComponent(doi)}`, response)

              const actual = await _.getWork(doi)({ fetch })()

              expect(actual).toStrictEqual(E.left(expect.objectContaining({ status: response.status })))
            },
          ),
        )
      })

      test('when fetch throws an error', async () => {
        await fc.assert(
          fc.asyncProperty(fc.doi(), fc.error(), async (doi, error) => {
            const actual = await _.getWork(doi)({ fetch: () => Promise.reject(error) })()

            expect(actual).toStrictEqual(E.left(error))
          }),
        )
      })
    })
  })

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
