# 02 · Layout shell

Status: verified

<!-- One value only: draft → approved (Stu) → built (agent, all agent-run checks pass) → verified (Stu, human checks pass).
     The plan-gate hook reads this line: app code is blocked until it says approved. -->

**Fixed rules for this plan: only Stu sets `approved` and `verified`. The agent sets `draft` and `built`.**

## Goal

Every page sits in the same shell: a slim top bar (name, live Lund clock and availability, menu button) that opens a full-screen menu holding all links and contact details, plus a one-line copyright footer. The homepage renders in the dark theme as a fixed 100vh frame, with the bar and footer pinned and only its project list scrolling. Every other page renders in the light theme and scrolls normally. Moving between pages cross-fades, including the dark-to-light change, with no flash.

## Brief

02 Layout shell: navbar with live metadata line, footer, route-based themes, page transitions

Stu's follow-up, after reading the first draft: the navbar should follow the attached references. A hamburger button in the top bar opens a menu that covers the entire viewport. Because the menu holds the important links and contact details, the footer is only the copyright. The homepage is a 100vh frame that wraps the content, and the content can scroll to show more than 5 projects. Group routing is confirmed. Email: boldersonstu@gmail.com, GitHub: https://github.com/stu1612, LinkedIn: https://www.linkedin.com/in/stuartbolderson/.

- Image: `docs/designs/02-nav-closed.png` — intent: "layout reference only, values from tokens": name left, menu button right, hairline under the bar.
- Image: `docs/designs/02-nav-hover.png` — intent: "layout reference only": the menu button's hover state.
- Image: `docs/designs/02-nav-menu-open.png` — intent: "layout reference only": full-screen menu, large links in two columns, close button in the same spot as the menu button, small labelled groups (FOLLOW, CONTACT) below.
- Image: `docs/designs/02-home-frame.png` — intent: "layout reference only": the homepage frame, a slim top bar and a slim bottom bar with hairline separators around the content. The gradient, rounded frame and project rows belong to plan 04.
- The references use another brand's colours (teal, yellow), a decorative vertical grid and a different font. None of that carries over. Colours, type and borders come from `tokens.css` and the Foundations rules.

## Decisions for you

1. **Changing the Navbar Must rules. Decided: yes.** The old rules ("links centre", "no hamburger") are replaced by a hamburger and a full-screen menu. `docs/design-system.md` already documents the new Navbar, Menu and Footer, written when this plan was confirmed. The other Navbar Musts stay: mono `meta` uppercase text, current page in `accent` with `aria-current="page"`, the status format with the dot and Europe/Stockholm time, tokens only.
2. **The hover dot. Decided: skip it.** The second reference shows a dot appearing on the hamburger on hover. `radius-full` is reserved for the availability dot only. Instead, the three lines extend to equal length on hover and focus (a `transform: scaleX` change, which the motion rules allow). Alternative: allow the dot and widen the `radius-full` rule to two uses, which is another Must change.
3. **Menu overlay theme. Decided:** it follows the page: dark over the homepage, light over every other page. That obeys "themes are set by route". Alternative: always dark, like the reference. It is more dramatic on light pages, but it needs a second Must change.
4. **Where the status shows. Decided:** in the top bar from 720px up ("● LUND 14:05 · OPEN TO WORK", left of the menu button), and always inside the open menu under CONTACT, so phones still see it. Alternative: menu only. The brief calls it the "live metadata line", so I'd keep it visible on desktop.
5. **Route themes. Confirmed: route groups.** `src/app/(home)/` is dark and `src/app/(pages)/` is light. Each group's `layout.tsx` wraps its children in `Shell`. The theme is in the server HTML, so there is no flash. Moving `page.tsx` into `(home)/` is a rename, and approving this plan covers it.
6. **Menu links and placeholder pages. Decided:** Blog and Now are separate routes, so the menu has five links: Index, About, Blog, Now, Contact. **Recommended:** light-theme stubs for `/about`, `/blog`, `/now` and `/contact`: an `h1` and one "Coming soon" line, replaced by plans 07, 03 and 06 (Blog and Now arrive with the content pipeline in plan 03). Without them, four menu links would 404 on the deployed site, and the light theme and `aria-current` couldn't be tested.
7. **Page transition. Recommended:** React's `<ViewTransition>` as progressive enhancement, in the root layout, with a 200ms opacity cross-fade. Next 16.4 needs no config flag. Reduced motion gets an instant swap. If the spike shows a flash on the dark-to-light change, I stop and report.
8. **Footer. Confirmed:** `© 2026 Stu Bolderson` only, in mono `meta` style under a hairline top border. Email, GitHub, LinkedIn and the status live in the menu. The real URLs go into `src/lib/site.ts`, so no placeholders remain.
9. **Small additions beyond the brief. Recommended: include.** A "Skip to content" link, visible only on focus, and a reusable `focus-ring` utility for the 2px accent outline with 3px offset that the Must rules require.
10. **No new dependencies or services.** The menu is the native `<dialog>` element, so no modal library is needed.

## What I need to understand

**Concepts and docs**

- The `<dialog>` element with `showModal()`: it renders in the browser's top layer, makes everything behind it inert, traps Tab focus, closes on Escape and returns focus to the button that opened it. I get all of that without writing focus-trap code: https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/dialog. Custom properties inherit through the DOM, so the dialog picks up the page's `data-theme` colours. Its `::backdrop` doesn't, but the dialog is full-viewport and opaque, so the backdrop is never seen.
- Animating a dialog: it toggles `display`, so a fade needs `@starting-style` and `transition-behavior: allow-discrete`. Tailwind v4 has a `starting:` variant: https://tailwindcss.com/docs/hover-focus-and-other-states. Only `opacity` animates. If the installed browser support is shaky, the fallback is no animation, which is also what reduced motion gets.
- Route groups: a folder in parentheses groups routes and layouts without changing the URL: https://nextjs.org/docs/app/api-reference/file-conventions/route-groups. Both groups share one root layout, so moving between them is a client navigation, not a reload.
- View transitions in the App Router: `<ViewTransition>` from React 19.3: https://nextjs.org/docs/app/guides/view-transitions and https://react.dev/reference/react/ViewTransition. The browser snapshots the old and new page and cross-fades them, which animates only `opacity`.
- `usePathname()` gives the current page for `aria-current`: https://nextjs.org/docs/app/api-reference/functions/use-pathname. With `cacheComponents` on, it needs no `Suspense` here because every route is static.
- `useSyncExternalStore` for the clock: https://react.dev/reference/react/useSyncExternalStore. Its server snapshot is `null`, so the server HTML never holds a time and hydration can't mismatch.
- `Intl.DateTimeFormat` with `timeZone: "Europe/Stockholm"` handles daylight saving, so I never add hours by hand.
- The 100vh frame: use `100dvh`, not `100vh`. On phones `100vh` is taller than the visible area when the browser toolbar is showing, which pushes the footer off-screen. The scrolling region is `<main>` with `min-h-0 overflow-y-auto`. `min-h-0` is what lets a flex child shrink and scroll.

**Questions you should be able to answer**

- Why a native `<dialog>` instead of a div with `position: fixed`? The browser supplies the focus trap, Escape, inert background and focus return, and those are the parts that are hard to get right by hand for keyboard and screen-reader users.
- Why route groups instead of reading the path on the client? The server renders the right theme in the first HTML, so there is no flash and nothing to hydrate.
- Why is the clock empty on the server? The page is prerendered at build time, so a time computed there would be wrong by the time anyone loads it. The client fills it in after hydration, and the slot keeps its width so nothing shifts.
- Why `100dvh` and an inner scroll on the homepage only? The index is a fixed stage with the bar and footer pinned, while reading pages need normal document scroll for find-in-page, anchor links and scroll restoration.
- Why only opacity and transform for the menu and the transition? They are compositor-only, and the design system's motion rules allow nothing else.

**Spike (steps 4 and 5):** open the menu in the browser and check the fade, Escape, Tab trapping, focus return and that the page behind doesn't scroll. Then check that `/` to `/about` cross-fades with no white flash, and that reduced motion swaps instantly. If the dialog fade doesn't work in the installed browsers, ship it without the fade and say so. If the page transition doesn't fire across the two groups, try one `<ViewTransition>` around the root layout's children, then stop and report if it still doesn't.

## Implementation notes

Model: Opus — this is now novel UI: a full-screen modal menu with an animated icon, a top-layer fade, and a pinned-frame layout with an inner scroll region. It has more moving parts than a typical feature.

**Files**

- `src/lib/site.ts`: site config, typed and `as const`: `name` ("Stu Bolderson"), `location` ("Lund"), `timeZone` ("Europe/Stockholm"), `availability` (`{ open: true, label: "OPEN TO WORK" }`), `email` ("boldersonstu@gmail.com"), `github` ("https://github.com/stu1612"), `linkedin` ("https://www.linkedin.com/in/stuartbolderson/"), `nav` (`Index /`, `About /about`, `Blog /blog`, `Now /now`, `Contact /contact`).
- `src/lib/local-time.ts`: `formatLocalTime(date: Date, timeZone: string): string` returns `"HH:MM"` in 24-hour form via `Intl.DateTimeFormat("en-GB", { hour: "2-digit", minute: "2-digit", hourCycle: "h23", timeZone })`.
- `src/lib/nav.ts`: `isCurrent(pathname, href)`. `/` matches only exactly. Other links match the exact path or any child (`/blog/foo` marks Blog current).
- `src/components/shell.tsx` (server): takes `theme: "dark" | "light"`, `frame?: boolean` and `children`. It renders `<div data-theme={theme} …>` holding the skip link, `Navbar`, `<main id="main">` and `Footer`. For light it omits the attribute, because light is the `:root` default.
  - `frame` (homepage): the wrapper is `h-dvh overflow-hidden flex flex-col`, and `<main>` is `min-h-0 flex-1 overflow-y-auto`. The bar and footer stay pinned and only `<main>` scrolls.
  - Not `frame` (every other page): `min-h-dvh flex flex-col`, `<main>` is `flex-1`, and the document scrolls.
- `src/components/navbar.tsx` (`"use client"`): `<header>` with a `border-b border-hairline` bar. The name sits left (`type-meta`, a link to `/`), then `AvailabilityStatus` (hidden under 720px), then the menu button. It owns the open state and a `ref` to the dialog, and renders `MenuOverlay`.
- `src/components/menu-button.tsx`: a `<button>` with `aria-expanded`, `aria-controls` and a visually hidden "Menu" label. Three `<span>` lines of different lengths (the reference's shape), with `focus-ring`. Hover and `:focus-visible` extend the lines to equal length with `scaleX`, `origin-right`, 150ms, `--ease-out-soft`. The identical rule for both states satisfies the "hover equals focus" Must.
- `src/components/menu-overlay.tsx` (`"use client"`): a `<dialog>` that is `fixed inset-0 h-dvh w-dvw max-h-none max-w-none bg-surface text-ink`, opened with `showModal()` and closed with `close()`.
  - Its own top bar repeats the name on the left and a close button (an X) on the right, in the same spot as the menu button, so nothing jumps.
  - Five large links in a two-column grid on 720px and up and a single column below, in the `h1` role with `type-heading`. The current page is `text-accent` with `aria-current="page"`.
  - Below the links, two small groups with `type-meta text-ink-muted` labels: FOLLOW (GitHub, LinkedIn, opening in a new tab with `rel="noopener noreferrer"`) and CONTACT (the email as a `mailto:`, "Lund, Sweden", and `AvailabilityStatus`). On a phone the content scrolls inside the dialog if it doesn't fit.
  - Clicking a link closes the dialog and navigates. The `close` event resets the open state, so Escape works too. Fade: `opacity-0 starting:opacity-0 open:opacity-100`, `transition-opacity`, `transition-discrete`, `--duration-page`. `body:has(dialog[open]) { overflow: hidden }` stops the page behind from scrolling.
- `src/components/availability-status.tsx` (`"use client"`): the dot (`bg-success`, `rounded-full`, `aria-hidden`), then "LUND HH:MM · OPEN TO WORK" in `type-meta`. It reads `useSyncExternalStore`, with a subscription that ticks on the next minute boundary, then every 60s. The server snapshot is `null` and renders `--:--`. The time uses `tabular-nums` so nothing shifts. The words carry the meaning, never the dot's colour. The dialog contents aren't rendered while it is closed, so the clock isn't duplicated for screen readers.
- `src/components/footer.tsx` (server): `<footer>` with `border-t border-hairline`, containing `© 2026 Stu Bolderson` in `type-meta text-ink-muted`.
- `src/app/layout.tsx`: stays the root. The body keeps `bg-surface text-ink`, which is the light default, so a route outside both groups (the 404) still renders readable. `{children}` is wrapped in `<ViewTransition>` here (step 5).
- `src/app/(home)/layout.tsx` and `src/app/(home)/page.tsx`: the moved placeholder, inside `<Shell theme="dark" frame>`.
- `src/app/(pages)/layout.tsx`, `about/page.tsx`, `blog/page.tsx`, `now/page.tsx`, `contact/page.tsx`: `<Shell theme="light">` and the four stubs. Each stub exports its own `metadata.title`.
- `src/styles/tokens.css`: add `@utility focus-ring` (2px `accent` outline, 3px offset) and the motion tokens `--duration-link: 150ms` and `--duration-page: 200ms`. These are the only edits to that file.
- `src/app/globals.css`: the `::view-transition-old(root)` / `::view-transition-new(root)` rules (opacity only, `--duration-page`, `--ease-out-soft`), the `prefers-reduced-motion` override, and the body scroll lock. These can't be written as utility classes, and globals.css already holds the `@import`s.
- `e2e/routes.ts`: add `/about`, `/blog`, `/now` and `/contact`, so smoke, axe and screenshots cover them automatically.

**Must rules this plan touches:** themes by route and no toggle, tokens only, the mono `meta` uppercase navbar text, current page `accent` with `aria-current`, the status format with the dot and Europe/Stockholm, hover equals `:focus-visible`, focus ring 2px with 3px offset, `radius-full` only on the dot, borders not shadows, opacity and transform only, and reduced motion respected. The Navbar rules on link position and "no hamburger" are the ones Decision 1 changes.

**Known gap, not fixed here:** `display-hero` and the 125% index caps overflow at 375px (plan 01 findings). The placeholder homepage uses neither. Plan 04 owns the index caps and plan 07 owns the hero. The menu's large links use the `h1` role (3rem), and the longest, "Contact", fits at 327px.

## Out of scope

- The homepage content: the project index and the dark gradient stage (plan 04). It keeps its placeholder text here, on the plain dark surface. The frame it will sit in is built here.
- Real About, Blog, Now and Contact content (plans 07, 03 and 06). The stubs are replaced, not extended.
- The reference's vertical grid lines, the rounded device frame and the top and bottom "label" bars of the homepage reference. They belong to the stage in plan 04, if you want them.
- A designed 404 page. It renders in the light default with no bar.
- Theme toggle, per-page transitions beyond the one cross-fade, shared-element transitions, and staggered or animated link reveals inside the menu.
- Availability read from anywhere but `site.ts`.

## Steps

### 1. Site config and pure logic

Create `src/lib/site.ts`, `src/lib/local-time.ts` and `src/lib/nav.ts`. Add `src/lib/local-time.test.ts` (a fixed UTC date gives `"14:05"` in winter and `"15:05"` in summer for Europe/Stockholm, including a case across the daylight-saving change, and midnight gives `"00:00"` not `"24:00"`) and `src/lib/nav.test.ts` (`/` is current only on `/`; `/blog/foo` marks Blog; `/about` does not mark `/`). Check: `npm test`, typecheck and lint pass. Commit: `feat(shell): site config, local time and nav helpers`.

### 2. Route groups, themes, frame and footer

Add `Shell` with the themed wrapper, `<main>` and `Footer`, and the `frame` behaviour. Move `page.tsx` into `(home)/` with a dark framed `Shell`. Create `(pages)/` with the light layout and the three stubs. Add the routes to `e2e/routes.ts`. Add `e2e/layout.spec.ts` with these checks:

- `/` has a `data-theme="dark"` element and a dark computed background.
- `/about`, `/blog`, `/now` and `/contact` have no dark theme and a light computed background.
- A client-side click from `/` to `/about` changes the theme without a full reload (a marker set on `window` survives). Until the menu exists, navigate with `page.evaluate` and the Next router, or a temporary test link in a test-only fixture. Don't leave test links in the app.
- On `/`, the document doesn't scroll (`scrollHeight <= innerHeight`), `<main>` has `overflow-y: auto`, and the footer's bottom edge is at the viewport's bottom at 375 / 768 / 1440px.
- On `/about`, the footer sits below the content with the document scrolling normally.

Check: typecheck, lint, unit tests, and e2e including axe on all five routes. Commit: `feat(shell): route-group themes, framed homepage and footer`.

### 3. Top bar, menu button and status

Add `Navbar` (bar only, with the menu button inert for now), `MenuButton`, `AvailabilityStatus`, the skip link, the `focus-ring` utility and the motion tokens. Add to `layout.spec.ts`:

- The bar shows the name, and the status text matches `/LUND \d\d:\d\d · OPEN TO WORK/` at 1440px (use `page.clock.setFixedTime` and assert the exact time).
- The status is hidden at 375px.
- There is no horizontal scroll at 375 / 768 / 1440px.
- Tab reaches the skip link first, and the focus ring is visible on the menu button.
- The hover and `:focus-visible` states of the button compute to the same transform.

Check: typecheck, lint, unit tests, e2e and axe, and `npm run build` (this proves the clock is fine under `cacheComponents`). Commit: `feat(shell): top bar with live Lund time and menu button`.

### 4. Full-screen menu

Add `MenuOverlay` and wire it to the button. Add to `layout.spec.ts`, on light and dark routes:

- Clicking the button opens a `dialog[open]` whose bounding box equals the viewport at 375 / 768 / 1440px.
- The dialog contains the five links in order with `aria-current="page"` on the current one, the GitHub and LinkedIn links with the right `href` and `rel`, and a `mailto:` link.
- It shows the live status.
- Escape closes it and returns focus to the menu button.
- Tab and Shift+Tab stay inside the dialog.
- Clicking "About" navigates to `/about` and the dialog is closed afterwards.
- The page behind doesn't scroll while it is open.
- `aria-expanded` follows the state.
- With `reducedMotion: "reduce"` emulated, the dialog's computed `transition-duration` is `0s`.

Check: typecheck, lint, unit tests, e2e and axe (with the menu open too). Look at the fade in the browser. If it doesn't work, ship it without the fade and say so in the report. Commit: `feat(shell): full-screen menu with links and contact details`.

### 5. Page transitions (spike)

Add `<ViewTransition>` and the `globals.css` rules. In the browser check `/` to `/about` and back through the menu: a cross-fade, no white flash, and reduced motion (DevTools emulation) swaps instantly. Add an e2e check that `document.startViewTransition` is called on a client navigation, and that the reduced-motion override is in the loaded CSS. Check: typecheck, lint, unit tests, e2e and axe. If it flashes or doesn't fire, stop and report. Commit: `feat(shell): cross-fade page transitions`.

### 6. Screenshots and findings

Run `npm run screenshots` for all five routes at 375 / 768 / 1440px, with the menu closed and open. Compare each with the four reference images for structure (bar, menu layout, frame) and with the Must rules for values, and list every difference. Report findings without changing the design system. Fix only shell bugs inside this plan's files. Check: all checks pass, then commit any fix as `fix(shell): <what>`, or make no commit if nothing changed.

## Verification

- **Agent-run:** typecheck, lint, unit tests, `npm run build`, e2e and axe on all five routes in both themes (menu open and closed), and screenshots at 375 / 768 / 1440px compared with the references, with differences listed. Reduced motion is checked by emulation.
- **Stu:**
  - the feel of the menu fade, the button hover and the page cross-fade on a real device;
  - the homepage frame on a real phone, where the browser toolbar changes the viewport height;
  - screen-reader behaviour of the menu, if you can;
  - that the clock shows Lund time when viewed from another timezone;
  - whether the large menu links and the two-column layout feel right next to your references.

## AGENTS.md updates

Proposals only, for Stu to review at close-out:

- "Design system" section: replace "Themes are set by route: the homepage is `data-theme="dark"`, every other page is light." with the same sentence plus "Set by the `(home)` and `(pages)` route-group layouts through `Shell`. New light pages go in `(pages)/`. The homepage is a fixed `100dvh` frame with an inner scroll region."
- `docs/design-system.md`: already updated (Navbar, Menu and Footer sections). At close-out I check them against what was built and propose any corrections.

## Result

Closed out on `dev` as a one-off exception: the branch had already been merged into `dev` before close-out ran. Stu approved it.

**Changes from the plan, and why**

- **`<main>` ids are per theme (`main-dark`, `main-light`), not a single `id="main"`.** With `cacheComponents`, Next keeps the previous route hidden in the DOM after a client navigation, so both groups' `<main>` elements can exist at once. One shared id would be duplicated, and the skip link could target the hidden one. `Shell` exports `mainId(theme)`, and the skip link uses it.
- **`<ViewTransition default="page-fade">`, with the group's size and position morph switched off.** The plan asked for an opacity-only cross-fade. React's default would also animate the root group's geometry, so it is turned off, leaving opacity only. In a check at 3× slow motion, `/` to `/about` blends dark into light with no white frame.
- **The menu fade works in the installed Chrome.** The no-fade fallback wasn't needed.
- **The screenshot spec targets `header:visible`** for the same reason as the ids: a hidden previous route's header can still be in the DOM.
- No `fix(shell)` commits came out of step 6. The screenshots showed no shell bugs.

**Test files changed**

- `e2e/layout.spec.ts` (new): themes, frame and scroll, footer, top bar, clock, menu (viewport cover, links, Escape and focus return, focus trap, navigation, scroll lock, reduced motion) and view transitions.
- `e2e/routes.ts`: adds `/about`, `/blog`, `/now` and `/contact`.
- `e2e/a11y.spec.ts`: adds axe runs with the menu open, on light and dark routes.
- `e2e/screenshots.spec.ts`: adds a menu-open screenshot per route and width, plus a `REDUCED_MOTION=1` variant.
- `src/lib/local-time.test.ts` (new) and `src/lib/nav.test.ts` (new).

**Checks run at close-out (2026-11-24)**

- `npm run test:e2e`: 53 of 53 passed (e2e and axe, all five routes, menu open and closed).
- `npm run screenshots`: 30 of 30, plus 30 of 30 with `REDUCED_MOTION=1`, at 375, 768 and 1440px for all five routes, with the menu open and closed.

**Screenshot differences from the references** (structure only; the references' colours, fonts and grid are intentionally not carried over)

1. `02-nav-closed`: the structure matches (name left, three-line button right, hairline under the bar). Differences: the name is mono `meta` uppercase text, not a logo. The status "● LUND HH:MM · OPEN TO WORK" sits left of the button from 720px up (Decision 4). The hairline is `hairline`, not the reference's yellow. There are no vertical grid lines.
2. `02-nav-hover`: there is no dot. The lines extend to equal length instead (Decision 2). This was checked by e2e, not by screenshot.
3. `02-nav-menu-open`:
   - The links fill column by column, as in the reference: Index/About/Blog, then Now/Contact.
   - At 3rem (the `h1` role) the links are smaller than the reference's.
   - The menu has its own bar with the name and a hairline. The reference shows only the X.
   - FOLLOW and CONTACT sit side by side in the two columns from 720px up. The reference stacks them in one column.
   - At 768px, the email and "Lund, Sweden" wrap onto two lines. At 1440px they share one line.
   - Below 720px everything stacks in a single column, as planned.
   - The current page is in `accent`. The reference has no current-page state.
4. `02-home-frame`: the bar and footer are pinned with hairlines and `<main>` scrolls between them, as in the reference. There is no gradient, rounded frame or label bars (plan 04). The footer holds only the copyright, not the reference's links.
5. Reduced motion: the screenshots match the motion versions. The menu is visible straight away, with no fade in progress.

The design system's Navbar, Menu, Footer and Page frame sections match what was built. No corrections are proposed.

**Pending for Stu** (from Verification → Stu)

- The feel of the menu fade, the button hover and the page cross-fade on a real device.
- The homepage frame on a real phone, where the browser toolbar changes the viewport height.
- Screen-reader behaviour of the menu, if you can.
- That the clock shows Lund time when viewed from another timezone.
- Whether the large menu links and the two-column layout feel right next to your references.
