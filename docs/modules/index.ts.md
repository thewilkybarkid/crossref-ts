---
title: index.ts
nav_order: 1
parent: Modules
---

## index overview

Added in v0.1.0

---

<h2 class="text-delta">Table of contents</h2>

- [codecs](#codecs)
  - [WorkC](#workc)
- [constructors](#constructors)
  - [getWork](#getwork)
- [model](#model)
  - [PartialDate (type alias)](#partialdate-type-alias)
  - [Work (interface)](#work-interface)

---

# codecs

## WorkC

**Signature**

```ts
export declare const WorkC: C.Codec<string, string, Work>
```

Added in v0.1.0

# constructors

## getWork

**Signature**

```ts
export declare const getWork: (doi: Doi) => ReaderTaskEither<FetchEnv, unknown, Work>
```

Added in v0.1.0

# model

## PartialDate (type alias)

**Signature**

```ts
export type PartialDate = number | PlainYearMonth | PlainDate
```

Added in v0.1.1

## Work (interface)

**Signature**

```ts
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
  readonly description?: string
  readonly DOI: Doi
  readonly 'group-title'?: string
  readonly institution: ReadonlyArray<{ name: string }>
  readonly language?: LanguageCode
  readonly license: ReadonlyArray<{ start: PartialDate; URL: URL }>
  readonly published?: PartialDate
  readonly publisher: string
  readonly resource: { primary: { URL: URL } }
  readonly subtype?: string
  readonly title: ReadonlyArray<string>
  readonly type: string
}
```

Added in v0.1.0
