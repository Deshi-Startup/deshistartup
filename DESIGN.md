# Deshi Startup design principles

The interface should feel like a national reference work: calm, credible, readable and fast on a
mid-range Android phone. This document records the durable decisions. Exact tokens and component
styles live in [`app/globals.css`](./app/globals.css); do not duplicate them here.

These are defaults, not untouchable rules. A deliberate change with a reason and rendered
before/after is welcome.

## What the design is for

A first-time founder on patchy bandwidth must be able to:

- trust that the page is a reference, not an advertisement;
- scan the structure and find the next action quickly;
- read dense Bangla without fighting the layout;
- understand what is clickable and what is only information; and
- use the core article without waiting for heavy JavaScript.

## Visual language

- Warm paper surrounds a white reading canvas with a deep-green top rule.
- Green means structure and active state. Blue means links.
- Body text and UI use a script-aware sans stack. Headings use the dedicated `--display` role;
  today it shares the same family and separates through scale, weight, spacing and hairline rules.
- Hairline borders create hierarchy. Shadows and large radii are rare.
- Yellow is reserved for cautions and the language-toggle thumb.
- Error red is for errors only.

If a new element needs another accent, shadow, gradient or decorative shape, first try a neutral,
label, border or spacing change.

## Layout and typography

- The desktop shell has a left navigation rail and a readable article canvas.
- The article collapses to one column on mobile; navigation becomes a drawer.
- Body copy is at least 15–16px with generous Bangla line-height.
- Long prose has a readable measure. Tables and indexes may use the wider canvas.
- `h1` and `h2` use the display role and a hairline rule; `h3`, labels and UI remain sans.
- Touch targets for important mobile actions are at least 44px.

The exact breakpoints, widths and type sizes are implementation details in `app/globals.css`.

## Components

### Links and buttons

Links are blue and underlined on hover. Structural navigation is green. Buttons are quiet,
bordered and named by text; saturated fills are not the default.

### Cards and callouts

Cards are flat white surfaces with a hairline border. A callout identifies itself with a label and
subtle ground. Do not use a thick coloured side border as generic decoration.

The summary and warning families are distinct:

- **সারকথা / In short:** green rule and very light green ground.
- **Stub/caution:** gold rule and cream ground.

### Search, forms and editor

Inputs use the same paper, ink, border and focus language as the rest of the site. Focus must be
visible. Validation messages sit beside the relevant control.

The inline contribution editor extends the article canvas rather than opening a visually separate
CMS. Its complexity should improve editing, recovery, accessibility or security; it should not
create a second design system.

### Infobox and directory

The infobox is the one encyclopedia-style signature card. Directory filters and result summaries
remain utilitarian. Neither needs decorative depth.

## Interaction and accessibility

- Keyboard focus is always visible.
- Drawers and modals trap focus, close with Escape and restore focus on exit.
- Colour is never the only status signal.
- Bengali UI uses Bengali numerals; English UI uses Latin numerals.
- Images need useful alt text. Captions and sources remain selectable text.
- Animation must respect reduced motion and never block reading.

## Performance rules

- Article pages stay near-zero-JS outside search, navigation and contribution controls.
- Latin uses the local system stack and downloads nothing. Bengali uses one renamed, self-hosted
  variable subset covering weights 400–700. The browser resolves the stack per character, so mixed
  Bangla and English text needs no markup or locale-specific font override.
- Bengali emphasis stays upright at weight 600 rather than synthesising an italic slant through
  conjuncts. English emphasis uses the platform face's native italic.
- Fonts are self-hosted; do not add render-blocking font services.
- Do not embed raw YouTube or Facebook iframes. Use the click-to-load facade components.
- Do not add a heavy dependency for a small interaction or calculator.
- Prefer semantic HTML and CSS over client state.
- Nothing sticky or full-width carries a `backdrop-filter`. Blurring a strip on every scroll frame
  is paid by the mid-range Android this site is read on, and buys a texture nobody looks at.
- Hash-named build output is cached immutably in `public/_headers`. Every navigation is a full
  document load, so a revalidation round-trip there is charged to the reader on every click.
- Nothing appears above the article after the page has painted. The shell is one client component
  that cannot know the route while the static HTML is rendered, so anything it discovers from the
  DOM used to arrive a moment late and push the reading down. Both "on this page" lists are now
  written into the HTML by `scripts/postbuild-seo.mjs`, marked with `deshi:toc`, and reproduced
  exactly by the shell's first client render. The rule is stated once and implemented twice, so a
  change to either side has to be made on both.
- Dates stay client-side on purpose. Node and Chrome ship different CLDR data — Node writes
  "৩১ জানুয়ারী", Chrome writes "৩১ জানুয়ারি" — so a build-time Bengali date would not survive
  hydration. Formatting a date in the browser is the only way both agree.
- Analytics is `lazyOnload`, behind the window load event. It is the largest main-thread bill on the
  page and none of it is what the reader came for.

## Review checklist

- [ ] The change helps trust, reading, navigation or contribution
- [ ] It works at narrow mobile width and with keyboard navigation
- [ ] Green still means structure and blue still means link
- [ ] It reuses existing tokens and component language
- [ ] It adds no unnecessary JavaScript, font or media weight
- [ ] A new exception is explained by a user need, not visual novelty
