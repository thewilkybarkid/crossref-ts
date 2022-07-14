import { Doi } from 'doi-ts'
import { expectTypeOf } from 'expect-type'
import { FetchEnv } from 'fetch-fp-ts'
import { ReaderTaskEither } from 'fp-ts/ReaderTaskEither'
import { Codec } from 'io-ts/Codec'
import { Orcid } from 'orcid-id-ts'
import * as _ from '../src'

import Work = _.Work

declare const doi: Doi
declare const work: Work

//
// Work
//

expectTypeOf(work.abstract).toEqualTypeOf<string | undefined>()
expectTypeOf(work.author).toEqualTypeOf<
  ReadonlyArray<{ family: string; given?: string; ORCID?: Orcid; prefix?: string; suffix?: string } | { name: string }>
>()
expectTypeOf(work.DOI).toEqualTypeOf<Doi>()
expectTypeOf(work.title).toEqualTypeOf<ReadonlyArray<string>>()

//
// getWork
//

expectTypeOf(_.getWork(doi)).toMatchTypeOf<ReaderTaskEither<FetchEnv, unknown, Work>>()

//
// WorkC
//

expectTypeOf(_.WorkC).toEqualTypeOf<Codec<string, string, Work>>()
