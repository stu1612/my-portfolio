# Writing content

Everything on the site that you write lives here, as MDX files: frontmatter between `---` lines, then the text.

| What         | Where                         | Becomes            |
| ------------ | ----------------------------- | ------------------ |
| Case studies | `content/case-studies/*.mdx`  | `/work/<filename>` |
| Blog posts   | `content/blog/*.mdx`          | `/blog/<filename>` |
| Now          | `content/now.mdx` (exactly 1) | `/now`             |

The file name is the slug: `content/blog/why-i-validate.mdx` is `/blog/why-i-validate`. Use lowercase words and dashes.

## Case study

```yaml
---
title: Rebuilding the booking flow
displayName: PROBELL # capitals, digits, spaces; max 12 characters
summary: Customers abandoned bookings because the form lost their input. # the problem, one sentence
client: Probell
role: Frontend lead
year: 2025
stack: # 1 to 5 items
  - React
  - TypeScript
order: 1 # position on the homepage index, lowest first
preview: # optional until the index has screenshots
  src: /previews/probell.png
  alt: The booking form with a saved draft
draft: false
---
```

## Blog post

```yaml
---
title: Why I validate content at build time
description: Bad content should never deploy. # max 160 characters, also the meta description
published: 2026-11-24 # YYYY-MM-DD
updated: 2026-12-01 # optional
tags: # optional
  - nextjs
  - content
draft: false
---
```

## Now

```yaml
---
updated: 2026-11-24 # YYYY-MM-DD
draft: false
---
```

## Drafts

`draft: true` entries show in `npm run dev` and are left out of the production build. Every seed file starts as a draft: change it to `false` (or delete the line) when the piece is ready. A missing `draft` means `false`.

## When something is wrong

The build fails and names the file and the field. For example, a typo and a name that is too long:

```text
Validation failed on content/case-studies/probell.mdx:
- displayName: Too big: expected string to have <=12 characters
- role: Invalid input: expected string, received undefined
- : Unrecognized key: "rolee"
```

Every field above is required unless marked optional, and unknown keys are rejected, so typos can't slip through. If `content/now.mdx` is missing, the build stops with `Expected exactly one "now" entry`.

## For developers

Pages read content only through `@/lib/content` (`getCaseStudies()`, `getPost(slug)`, `getNow()` and so on). The schemas are in `src/lib/content/schemas.ts`. Render a body with `<Mdx code={entry.code} />` from `@/components/mdx/mdx`.
