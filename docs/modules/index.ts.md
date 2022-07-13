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
- [model](#model)
  - [Work (type alias)](#work-type-alias)

---

# codecs

## WorkC

**Signature**

```ts
export declare const WorkC: C.Codec<
  string,
  string,
  Readonly<{ abstract?: string | undefined; DOI: Doi<string>; title: readonly [string] }>
>
```

Added in v0.1.0

# model

## Work (type alias)

**Signature**

```ts
export type Work = Readonly<{
  abstract?: string
  DOI: Doi
  title: Readonly<[string]>
}>
```

Added in v0.1.0
