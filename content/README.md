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
displayName: PROBELL # capitals, digits, spaces; max 9 characters
summary: Customers abandoned bookings because the form lost their input. # the problem, one sentence
client: Probell
role: Frontend lead
year: 2025
stack: # 1 to 5 items
  - React
  - TypeScript
order: 1 # position on the homepage index, lowest first
preview: # optional; also the cover image on the case study page
  src: /previews/probell.png
  alt: The booking form with a saved draft
liveUrl: https://probell.example # optional; shows LIVE SITE on the page
draft: false
---
```

On the case study page (`/work/<filename>`), `title` is the big headline, so write it as one: "A credible US storefront for a Swedish supplement brand", not "Probell". `client` and `year` go in the small line above it, and `client` names the browser tab.

## Blog post

```yaml
---
title: Why I validate content at build time
description: Bad content should never deploy. # max 160 characters, also the meta description
published: 2026-11-24 # YYYY-MM-DD
updated: 2026-12-01 # optional
tags: # optional; shown as written
  - Next.js
  - Content
draft: false
---
```

On `/blog`, each post is a row with its `published` date, `title`, `description`, read time and `tags`, newest first. On the post page (`/blog/<filename>`), `title` is the headline and `description` the line under it. The tags and, if set, the `updated` date sit under a rule below that. Tags are plain text, not links.

Each post ends with a link to the next older post. The oldest post has none, only "All posts".

## Now

```yaml
---
updated: 2026-11-24 # YYYY-MM-DD
draft: false
---
```

## Writing the body

The page already has the headline, so start sections at `##` (a `# ` line fails a test). Plain Markdown works: paragraphs, lists, **bold**, `inline code`, [links](https://example.com) and `>` quotes.

### Callouts

```mdx
<Callout type="decision">
  Kept the site static: it ships almost no JavaScript.
</Callout>
```

`type` is `decision` (DECISION), `wrong` (WHAT WENT WRONG) or `ai` (AI NOTE). Any other value fails the build.

### Images

Put the file in `public/content/<filename>/` and use `<Figure>`. Markdown images (`![alt](src)`) fail the build.

```mdx
<Figure
  src="/content/probell/checkout.jpg"
  alt="The checkout on a phone, with the HubSpot form open"
  caption="The lead form after the region fix."
  width="1600"
  height="900"
  wide
/>
```

`width` and `height` are the image's real pixel size (they stop the page jumping while it loads). `wide` is optional: the image breaks out wider than the text. Figures are numbered FIG 1, FIG 2 for you.

### Code

Fence it with the language, and optionally a file name:

````mdx
```astro title="src/components/Hero.astro"
<Image src={hero} alt="Whey 100 Protein tub" />
```
````

The file name shows in a bar above the code, with the language on the right. Long lines scroll inside the block. There is no syntax colouring.

## Drafts

`draft: true` entries show in `npm run dev` and are left out of the production build. Every seed file starts as a draft: change it to `false` (or delete the line) when the piece is ready. A missing `draft` means `false`.

## When something is wrong

The build fails and names the file and the field. For example, a typo and a name that is too long:

```text
Validation failed on content/case-studies/probell.mdx:
- displayName: Too big: expected string to have <=9 characters
- role: Invalid input: expected string, received undefined
- : Unrecognized key: "rolee"
```

Every field above is required unless marked optional, and unknown keys are rejected, so typos can't slip through. If `content/now.mdx` is missing, the build stops with `Expected exactly one "now" entry`.

## For developers

Pages read content only through `@/lib/content` (`getCaseStudies()`, `getPost(slug)`, `getNow()` and so on). The schemas are in `src/lib/content/schemas.ts`. Render a body with `<Mdx code={entry.code} />` from `@/lib/content/mdx/mdx`, inside an element with the `article-flow` utility. MDX components (Callout, Figure, the code frame) are mapped in `src/lib/content/mdx/components.tsx`.
