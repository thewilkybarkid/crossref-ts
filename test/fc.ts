import { Temporal } from '@js-temporal/polyfill'
import { mod11_2 } from 'cdigit'
import { Doi, isDoi } from 'doi-ts'
import * as fc from 'fast-check'
import { MockResponseObject } from 'fetch-mock'
import { Orcid, isOrcid } from 'orcid-id-ts'
import * as _ from '../src'

export * from 'fast-check'

export const error = (): fc.Arbitrary<Error> => fc.string().map(error => new Error(error))

export const statusCode = (): fc.Arbitrary<number> => fc.integer({ min: 200, max: 599 })

export const url = (): fc.Arbitrary<URL> => fc.webUrl().map(url => new URL(url))

export const doi = (): fc.Arbitrary<Doi> =>
  fc
    .tuple(
      fc.stringOf(fc.constantFrom('0', '1', '2', '3', '4', '5', '6', '7', '8', '9'), { minLength: 2 }),
      fc.unicodeString({ minLength: 1 }),
    )
    .map(([prefix, suffix]) => `10.${prefix}/${suffix}`)
    .filter(isDoi)

export const orcid = (): fc.Arbitrary<Orcid> =>
  fc
    .stringOf(fc.constantFrom('0', '1', '2', '3', '4', '5', '6', '7', '8', '9'), {
      minLength: 4 + 4 + 4 + 3,
      maxLength: 4 + 4 + 4 + 3,
    })
    .map(value => mod11_2.generate(value).replace(/.{4}(?=.)/g, '$&-'))
    .filter(isOrcid)

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

const year = (): fc.Arbitrary<number> => fc.integer({ min: -271820, max: 275759 })

const plainYearMonth = (): fc.Arbitrary<Temporal.PlainYearMonth> =>
  fc
    .record({
      year: year(),
      month: fc.integer({ min: 1, max: 12 }),
    })
    .map(args => Temporal.PlainYearMonth.from(args))

const plainDate = (): fc.Arbitrary<Temporal.PlainDate> =>
  fc
    .record({
      year: year(),
      month: fc.integer({ min: 1, max: 12 }),
      day: fc.integer({ min: 1, max: 31 }),
    })
    .map(args => Temporal.PlainDate.from(args))

const partialDate = (): fc.Arbitrary<_.PartialDate> => fc.oneof(year(), plainYearMonth(), plainDate())

export const crossrefWork = (): fc.Arbitrary<_.Work> =>
  fc.record(
    {
      abstract: fc.string(),
      author: fc.array(
        fc.oneof(
          fc.record(
            {
              family: fc.string(),
              given: fc.string(),
              ORCID: orcid(),
              prefix: fc.string(),
              suffix: fc.string(),
            },
            { requiredKeys: ['family'] },
          ),
          fc.record({ name: fc.string() }),
        ),
      ),
      DOI: doi(),
      institution: fc.array(fc.record({ name: fc.string() })),
      license: fc.array(fc.record({ start: partialDate(), URL: url() })),
      published: partialDate(),
      title: fc.array(fc.string()),
    },
    { requiredKeys: ['author', 'DOI', 'institution', 'license', 'published', 'title'] },
  )
