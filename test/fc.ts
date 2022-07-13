import { Doi, isDoi } from 'doi-ts'
import * as fc from 'fast-check'
import { MockResponseObject } from 'fetch-mock'
import * as _ from '../src'

export * from 'fast-check'

export const error = (): fc.Arbitrary<Error> => fc.string().map(error => new Error(error))

export const statusCode = (): fc.Arbitrary<number> => fc.integer({ min: 200, max: 599 })

export const doi = (): fc.Arbitrary<Doi> =>
  fc
    .tuple(
      fc.stringOf(fc.constantFrom('0', '1', '2', '3', '4', '5', '6', '7', '8', '9'), { minLength: 2 }),
      fc.unicodeString({ minLength: 1 }),
    )
    .map(([prefix, suffix]) => `10.${prefix}/${suffix}`)
    .filter(isDoi)

const headerName = () =>
  fc.stringOf(
    fc.char().filter(char => /^[\^_`a-zA-Z\-0-9!#$%&'*+.|~]$/.test(char)),
    { minLength: 1 },
  )

const headers = () => fc.option(fc.dictionary(headerName(), fc.string()), { nil: undefined })

export const response = ({
  status,
  text,
}: { status?: fc.Arbitrary<number>; text?: fc.Arbitrary<string> } = {}): fc.Arbitrary<MockResponseObject> =>
  fc.record({
    body: text ?? fc.oneof(fc.string(), fc.constant(undefined)),
    headers: headers(),
    status: status ?? fc.oneof(statusCode(), fc.constant(undefined)),
  })

export const crossrefWork = (): fc.Arbitrary<_.Work> =>
  fc.record(
    {
      abstract: fc.string(),
      DOI: doi(),
      title: fc.tuple(fc.string()),
    },
    { requiredKeys: ['DOI', 'title'] },
  )
