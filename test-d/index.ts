import { Temporal } from '@js-temporal/polyfill'
import { Doi } from 'doi-ts'
import { expectTypeOf } from 'expect-type'
import { FetchEnv } from 'fetch-fp-ts'
import { ReaderTaskEither } from 'fp-ts/ReaderTaskEither'
import { Codec } from 'io-ts/Codec'
import { Orcid } from 'orcid-id-ts'
import * as _ from '../src'

import PartialDate = _.PartialDate
import PlainDate = Temporal.PlainDate
import PlainYearMonth = Temporal.PlainYearMonth
import Work = _.Work

declare const doi: Doi
declare const partialDate: PartialDate
declare const work: Work

//
// Work
//

expectTypeOf(work.abstract).toEqualTypeOf<string | undefined>()
expectTypeOf(work.author).toEqualTypeOf<
  ReadonlyArray<{ family: string; given?: string; ORCID?: Orcid; prefix?: string; suffix?: string } | { name: string }>
>()
expectTypeOf(work.DOI).toEqualTypeOf<Doi>()
expectTypeOf(work.institution).toEqualTypeOf<ReadonlyArray<{ name: string }>>()
expectTypeOf(work.license).toEqualTypeOf<ReadonlyArray<{ start: PartialDate; URL: URL }>>()
expectTypeOf(work.published).toEqualTypeOf(partialDate)
expectTypeOf(work.publisher).toEqualTypeOf<string>()
expectTypeOf(work.title).toEqualTypeOf<ReadonlyArray<string>>()

//
// PartialDate
//

expectTypeOf<number>().toMatchTypeOf<PartialDate>()
expectTypeOf<PlainYearMonth>().toMatchTypeOf<PartialDate>()
expectTypeOf<PlainDate>().toMatchTypeOf<PartialDate>()

//
// getWork
//

expectTypeOf(_.getWork(doi)).toMatchTypeOf<ReaderTaskEither<FetchEnv, unknown, Work>>()

//
// WorkC
//

expectTypeOf(_.WorkC).toEqualTypeOf<Codec<string, string, Work>>()
