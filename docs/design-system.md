# Design system

Read this for any plan that touches UI. Tokens live in `src/styles/tokens.css`.

**Must** = a fixed rule. Do not change it; raise it in the plan if you think it is wrong.
**Suggested** = a starting approach. Propose a better one in the plan's Ask step if you have it.

## Foundations

- **Must:** no raw colour, spacing, radius or font values outside `tokens.css`.
- **Must:** themes are set by route. The homepage layout sets `data-theme="dark"`; every other page is light. No theme toggle.
- **Must:** Archivo for everything people read (body 400, headings 700–800, index caps 900 at `font-stretch: 125%`). IBM Plex Mono only for labels, metadata and code. Paragraphs are never mono.
- **Must:** spacing uses only steps 1, 2, 4, 6, 8, 12, 16, 24 (4px base).
- **Must:** the system is mostly square. `radius-full` is for the availability dot only. Borders, not shadows.
- **Suggested:** body measure 60–72ch; `text-wrap: balance` on headings.

## Motion and performance

- **Must:** no animation libraries.
- **Must:** animate only `transform` and `opacity`. The one exception is the index title's `color` fade.
- **Must:** never animate `filter`, `backdrop-filter`, `box-shadow`, size or position properties, `background-position`, `font-stretch` or `font-variation-settings`.
- **Must:** all motion respects `prefers-reduced-motion: reduce` (instant or fade only).
- **Suggested:** 150ms for links and focus, 200ms for index dimming, 400ms for the title fade; easing `--ease-out-soft`.
- **Suggested:** page transitions via Next.js / React view transition support, as progressive enhancement. The dark homepage to light page change should cross-fade, not flash.

## Accessibility

- **Must:** WCAG AA. Text 4.5:1, large display text and UI boundaries 3:1, in the theme where they appear.
- **Must:** every hover state has an identical `:focus-visible` state.
- **Must:** focus ring is a 2px `accent` outline with 3px offset.
- **Must:** colour never carries meaning alone (form states pair colour with text and an icon).

## Components

### Navbar

A slim top bar: name left, status, then a menu button right. A hairline sits under the bar. The links live in the Menu, not the bar.

- **Must:** all text mono `meta` style, uppercase.
- **Must:** status shows the availability dot plus "LUND HH:MM · OPEN TO WORK", time in Europe/Stockholm. The words carry the meaning, not the dot's colour.
- **Must:** works on both themes using tokens only.
- **Must:** the menu button is a three-line icon of unequal lengths with an accessible name, `aria-expanded` and `aria-controls`. Hover and `:focus-visible` look identical: the lines extend to equal length (`transform` only). No dot on hover; `radius-full` stays for the availability dot.
- **Suggested:** availability text read from site config; status shown in the bar from 720px up, and always inside the Menu.

### Menu

A full-viewport overlay opened from the navbar. It holds the links and contact details.

- **Must:** covers the whole viewport (`100dvw` by `100dvh`), is a native `<dialog>` opened with `showModal()` (focus trap, Escape, inert background, focus returns to the button), and is opaque.
- **Must:** follows the page theme: dark over the homepage, light elsewhere. It never forces its own theme.
- **Must:** its top bar repeats the name left and puts the close button where the menu button was, so nothing jumps.
- **Must:** links are Index, About, Blog, Now, Contact, in the `h1` role. The current page uses `accent` and `aria-current="page"`. Choosing a link closes the menu.
- **Must:** below the links, small groups labelled in `meta` style, `ink-muted`: FOLLOW (GitHub, LinkedIn) and CONTACT (email, location, live status).
- **Must:** only `opacity` fades; the page behind does not scroll while the menu is open; reduced motion is instant.
- **Suggested:** links in two columns from 720px up, one column below; the content scrolls inside the menu if it doesn't fit.

### Footer

Copyright only: `© 2026 Stu Bolderson`.

- **Must:** mono `meta` style, `ink-muted`, under a hairline top border. No links; they live in the Menu.
- **Must:** on the homepage the footer is pinned at the bottom of the frame.

### Page frame

- **Must:** the homepage is a fixed `100dvh` frame. The bar and footer stay pinned, and only `<main>` scrolls (`min-h-0 overflow-y-auto`).
- **Must:** every other page scrolls the document normally, with the footer after the content.

### ProjectIndex (homepage)

Extended-caps project rows over a fixed dark gradient stage. Rows: PROBELL, SUNDET, PORTFOLIO.

- **Must:** stage is three radial fields (`field-1` to `field-3`) over `stage-base`, plus static grain. The stage never changes colour.
- **Must:** each row is a plain link: display name, mono info (stack and year, `ink-muted`), arrow.
- **Must:** selecting a row (hover or focus) dims the other rows to about 35% opacity.
- **Must:** the selected title fades from solid `ink` into the gradient, filled with the glow tints (`glow-1` to `glow-3`), never the deep field colours.
- **Must:** short display names; the longest must fit one line at every width.
- **Must:** a sharp preview screenshot of the selected project appears (beside the list on desktop, in a fixed area on mobile).
- **Suggested:** title fill via `background-clip: text` with the gradient always present and `color` transitioning to transparent; `background-attachment: fixed` to align it with the stage.
- **Suggested:** on mobile, a scroll-snapped list where the centred row is active, set with a small `IntersectionObserver`.
- **Suggested:** grain as an inline SVG noise data URI at about 6% opacity.

### Callout (case studies)

Three variants: Decision, What went wrong, AI note.

- **Must:** variants differ by label and icon, not colour. No coloured left borders, no tinted backgrounds.
- **Must:** `surface-raised`, 1px `hairline` border, `radius-md`; mono uppercase label in `ink-muted`; body in `body-sm`.
- **Suggested:** MDX API `<Callout type="decision | wrong | ai">`.

## Not yet designed

Case study header, MDX prose, code block, form fields, figure with caption, 404. For these, propose two or three options within the foundations above in the plan's Ask step, with a recommendation. Do not build one without approval.
