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
- Headings use the Bengali serif; body text and UI use the system/sans stack.
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
- `h1` and `h2` use serif display type and a hairline rule; `h3`, labels and UI remain sans.
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
- Fonts are self-hosted; do not add render-blocking font services.
- Do not embed raw YouTube or Facebook iframes. Use the click-to-load facade components.
- Do not add a heavy dependency for a small interaction or calculator.
- Prefer semantic HTML and CSS over client state.
- Nothing sticky or full-width carries a `backdrop-filter`. Blurring a strip on every scroll frame
  is paid by the mid-range Android this site is read on, and buys a texture nobody looks at.
- Hash-named build output is cached immutably in `public/_headers`. Every navigation is a full
  document load, so a revalidation round-trip there is charged to the reader on every click.

## Review checklist

- [ ] The change helps trust, reading, navigation or contribution
- [ ] It works at narrow mobile width and with keyboard navigation
- [ ] Green still means structure and blue still means link
- [ ] It reuses existing tokens and component language
- [ ] It adds no unnecessary JavaScript, font or media weight
- [ ] A new exception is explained by a user need, not visual novelty
