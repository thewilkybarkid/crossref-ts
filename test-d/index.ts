import { Doi } from 'doi-ts'
import { expectTypeOf } from 'expect-type'
import { Codec } from 'io-ts/Codec'
import * as _ from '../src'

import Work = _.Work

declare const work: Work

//
// Work
//

expectTypeOf(work.DOI).toEqualTypeOf<Doi>()

//
// WorkC
//

expectTypeOf(_.WorkC).toEqualTypeOf<Codec<string, string, Work>>()
