/**
 * @since 0.1.0
 */
import { Doi, isDoi } from 'doi-ts'
import * as F from 'fetch-fp-ts'
import * as E from 'fp-ts/Either'
import * as J from 'fp-ts/Json'
import * as RTE from 'fp-ts/ReaderTaskEither'
import { flow, identity, pipe } from 'fp-ts/function'
import { StatusCodes } from 'http-status-codes'
import * as C from 'io-ts/Codec'
import * as D from 'io-ts/Decoder'
import safeStableStringify from 'safe-stable-stringify'

import Codec = C.Codec
import FetchEnv = F.FetchEnv
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
  readonly DOI: Doi
  readonly title: ReadonlyArray<string>
}

// -------------------------------------------------------------------------------------
// constructors
// -------------------------------------------------------------------------------------

/**
 * @category constructors
 * @since 0.1.0
 */
export const getWork: (doi: Doi) => ReaderTaskEither<FetchEnv, unknown, Work> = doi =>
  pipe(
    new URL(doi, 'https://api.crossref.org/works/'),
    F.Request('GET'),
    F.send,
    RTE.filterOrElseW(F.hasStatus(StatusCodes.OK), identity),
    RTE.chainTaskEitherKW(F.decode(WorkC)),
  )

// -------------------------------------------------------------------------------------
// codecs
// -------------------------------------------------------------------------------------

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

const DoiC = C.fromDecoder(D.fromRefinement(isDoi, 'DOI'))

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
          title: ReadonlyArrayC(C.string),
        }),
        C.intersect(
          C.partial({
            abstract: C.string,
          }),
        ),
      ),
    }),
  ),
  C.imap(
    message => message.message,
    work => ({ message: work }),
  ),
)
