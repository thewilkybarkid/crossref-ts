/**
 * @since 0.1.0
 */
import { Doi, isDoi } from 'doi-ts'
import * as E from 'fp-ts/Either'
import * as J from 'fp-ts/Json'
import { flow, pipe } from 'fp-ts/function'
import * as C from 'io-ts/Codec'
import * as D from 'io-ts/Decoder'
import safeStableStringify from 'safe-stable-stringify'

import Codec = C.Codec

// -------------------------------------------------------------------------------------
// model
// -------------------------------------------------------------------------------------

/**
 * @category model
 * @since 0.1.0
 */
export type Work = Readonly<{
  abstract?: string
  DOI: Doi
  title: Readonly<[string]>
}>

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

const ReadonlyTupleC = flow(C.tuple, C.readonly)

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
          title: ReadonlyTupleC(C.string),
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
