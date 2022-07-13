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

## Work (interface)

**Signature**

```ts
export interface Work {
  readonly abstract?: string
  readonly DOI: Doi
  readonly title: Readonly<[string]>
}
```

Added in v0.1.0
