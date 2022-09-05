/**
 * @since 0.1.0
 */
import { Temporal } from '@js-temporal/polyfill'
import { Doi, isDoi } from 'doi-ts'
import * as F from 'fetch-fp-ts'
import * as E from 'fp-ts/Either'
import * as J from 'fp-ts/Json'
import * as RTE from 'fp-ts/ReaderTaskEither'
import * as RA from 'fp-ts/ReadonlyArray'
import { flow, identity, pipe } from 'fp-ts/function'
import * as s from 'fp-ts/string'
import { StatusCodes } from 'http-status-codes'
import * as C from 'io-ts/Codec'
import * as D from 'io-ts/Decoder'
import ISO6391, { LanguageCode } from 'iso-639-1'
import { Orcid, isOrcid } from 'orcid-id-ts'
import safeStableStringify from 'safe-stable-stringify'

import Codec = C.Codec
import FetchEnv = F.FetchEnv
import PlainDate = Temporal.PlainDate
import PlainYearMonth = Temporal.PlainYearMonth
import ReaderTaskEither = RTE.ReaderTaskEither

// -------------------------------------------------------------------------------------
// model
// -------------------------------------------------------------------------------------

/**
 * @category model
 * @since 0.1.0
 */
export interface Work {
  readonly abstract?: string
  readonly author: ReadonlyArray<
    | {
        family: string
        given?: string
        ORCID?: Orcid
        prefix?: string
        suffix?: string
      }
    | {
        name: string
      }
  >
  readonly DOI: Doi
  readonly 'group-title'?: string
  readonly institution: ReadonlyArray<{ name: string }>
  readonly language?: LanguageCode
  readonly license: ReadonlyArray<{ start: PartialDate; URL: URL }>
  readonly published: PartialDate
  readonly publisher: string
  readonly resource: { primary: { URL: URL } }
  readonly subtype?: string
  readonly title: ReadonlyArray<string>
  readonly type: string
}

/**
 * @category model
 * @since 0.1.1
 */
export type PartialDate = number | PlainYearMonth | PlainDate

// -------------------------------------------------------------------------------------
// constructors
// -------------------------------------------------------------------------------------

/**
 * @category constructors
 * @since 0.1.0
 */
export const getWork: (doi: Doi) => ReaderTaskEither<FetchEnv, unknown, Work> = doi =>
  pipe(
    new URL(encodeURIComponent(doi), 'https://api.crossref.org/works/'),
    F.Request('GET'),
    F.send,
    RTE.filterOrElseW(F.hasStatus(StatusCodes.OK), identity),
    RTE.chainTaskEitherKW(F.decode(WorkC)),
  )

// -------------------------------------------------------------------------------------
// codecs
// -------------------------------------------------------------------------------------

const Iso6391C = C.fromDecoder(
  pipe(
    D.string,
    D.compose(D.fromRefinement((code: string): code is LanguageCode => ISO6391.validate(code), 'ISO-639-1 Code')),
  ),
)

const JsonC = C.make(
  {
    decode: (s: string) =>
      pipe(
        J.parse(s),
        E.mapLeft(() => D.error(s, 'JSON')),
      ),
  },
  { encode: safeStableStringify },
)

const ReadonlyArrayC = flow(C.array, C.readonly)

const UrlC = C.make(
  pipe(
    D.string,
    D.parse(s =>
      E.tryCatch(
        () => new URL(s),
        () => D.error(s, 'URL'),
      ),
    ),
  ),
  { encode: String },
)

const DoiC = C.fromDecoder(D.fromRefinement(isDoi, 'DOI'))

const OrcidC = C.fromDecoder(D.fromRefinement(isOrcid, 'ORCID'))

const OrcidUrlC = C.make(pipe(D.string, D.map(s.replace(/^https?:\/\/orcid\.org\//, '')), D.compose(OrcidC)), {
  encode: orcid => `https://orcid.org/${orcid}`,
})

const GroupAuthorC = C.struct({ name: C.string })
const PersonAuthorC = pipe(
  C.struct({ family: C.string }),
  C.intersect(
    C.partial({
      given: C.string,
      ORCID: OrcidUrlC,
      prefix: C.string,
      suffix: C.string,
    }),
  ),
)

const PartialDateC = pipe(
  C.struct({
    // Unfortunately, there's no way to describe a union encoder, so we must implement it ourselves.
    // Refs https://github.com/gcanti/io-ts/issues/625#issuecomment-1007478009
    'date-parts': C.tuple(
      C.make(
        pipe(
          D.union(D.tuple(D.number, D.number, D.number), D.tuple(D.number, D.number), D.tuple(D.number)),
          D.map(
            ([year, month, day]): PartialDate =>
              day ? PlainDate.from({ day, month, year }) : month ? PlainYearMonth.from({ month, year }) : year,
          ),
        ),
        {
          encode: date =>
            date instanceof PlainDate
              ? tuple(date.year, date.month, date.day)
              : date instanceof PlainYearMonth
              ? tuple(date.year, date.month)
              : tuple(date),
        },
      ),
    ),
  }),
  C.imap(
    partialDate => partialDate['date-parts'][0],
    partialDate => ({ 'date-parts': tuple(partialDate) }),
  ),
)

/**
 * @category codecs
 * @since 0.1.0
 */
export const WorkC: Codec<string, string, Work> = pipe(
  JsonC,
  C.compose(
    C.struct({
      message: pipe(
        C.struct({
          DOI: DoiC,
          published: PartialDateC,
          publisher: C.string,
          resource: C.struct({
            primary: C.struct({ URL: UrlC }),
          }),
          title: ReadonlyArrayC(C.string),
          type: C.string,
        }),
        C.intersect(
          C.partial({
            abstract: C.string,
            author: ReadonlyArrayC(
              // Unfortunately, there's no way to describe a union encoder, so we must implement it ourselves.
              // Refs https://github.com/gcanti/io-ts/issues/625#issuecomment-1007478009
              C.make(D.union(PersonAuthorC, GroupAuthorC), {
                encode: author => ('name' in author ? GroupAuthorC.encode(author) : PersonAuthorC.encode(author)),
              }),
            ),
            'group-title': C.string,
            institution: ReadonlyArrayC(
              C.struct({
                name: C.string,
              }),
            ),
            language: Iso6391C,
            license: ReadonlyArrayC(
              C.struct({
                start: PartialDateC,
                URL: UrlC,
              }),
            ),
            subtype: C.string,
          }),
        ),
      ),
    }),
  ),
  C.imap(
    message => message.message,
    work => ({ message: work }),
  ),
  C.imap(
    work => ({ author: [], institution: [], license: [], ...work }),
    work => ({
      ...work,
      author: pipe(
        work.author,
        RA.match(() => undefined, identity),
      ),
      institution: pipe(
        work.institution,
        RA.match(() => undefined, identity),
      ),
      license: pipe(
        work.license,
        RA.match(() => undefined, identity),
      ),
    }),
  ),
)

// -------------------------------------------------------------------------------------
// utils
// -------------------------------------------------------------------------------------

function tuple<A>(a: A): [A]
function tuple<A, B>(a: A, b: B): [A, B]
function tuple<A, B, C>(a: A, b: B, c: C): [A, B, C]
function tuple(...values: ReadonlyArray<unknown>) {
  return values
}
