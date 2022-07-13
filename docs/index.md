---
title: Home
nav_order: 1
---

A [Crossref API] client for use with [fp-ts].

# Example

```ts
import fetch from 'cross-fetch'
import { getWork } from 'crossref-ts'
import { Doi } from 'doi-ts'
import { FetchEnv } from 'fetch-fp-ts'
import * as C from 'fp-ts/Console'
import * as RTE from 'fp-ts/ReaderTaskEither'
import { pipe } from 'fp-ts/function'

const env: FetchEnv = {
  fetch,
}

void pipe(
  getWork('10.5555/12345678' as Doi),
  RTE.chainFirstIOK(work => C.log(`Title is "${work.title[0]}"`)),
)(env)()
/*
Title is "Toward a Unified Theory of High-Energy Metaphysics: Silly String Theory"
*/
```

[crossref api]: https://www.crossref.org/documentation/retrieve-metadata/rest-api/
[fp-ts]: https://gcanti.github.io/fp-ts/
