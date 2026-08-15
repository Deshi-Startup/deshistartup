---
name: Deshi Startup
description: Bangla-first open guide to building a startup in Bangladesh, read on a phone while doing the work.
colors:
  page: "#f5f3ee"
  canvas: "#ffffff"
  canvas-soft: "#f8faf9"
  ink: "#202122"
  muted: "#54595d"
  faint: "#696e74"
  line: "#c8ccd1"
  line-soft: "#eaecf0"
  line-warm: "#d9d5cd"
  shade: "#f1f3f4"
  green: "#047857"
  green-deep: "#065f46"
  green-soft: "#eaf4ef"
  green-ground: "#f8fbf7"
  blue: "#3366cc"
  blue-hover: "#1f4fb2"
  blue-soft: "#eef5fc"
  visited: "#6b4ba1"
  yellow: "#f7c948"
  warn-bg: "#fff8df"
  warn-border: "#e1b900"
  warn-line-soft: "#e5d193"
  warn-ink: "#5f4b00"
  error: "#b42318"
typography:
  display:
    fontFamily: "'Deshi Sans Bengali', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif"
    fontSize: "clamp(2.1rem, 3vw, 3.2rem)"
    fontWeight: 500
    lineHeight: 1.3
    letterSpacing: "0"
  headline:
    fontFamily: "{typography.display.fontFamily}"
    fontSize: "1.55rem"
    fontWeight: 600
    lineHeight: 1.25
    letterSpacing: "0"
  title:
    fontFamily: "{typography.display.fontFamily}"
    fontSize: "1.08rem"
    fontWeight: 600
    lineHeight: 1.25
  body:
    fontFamily: "{typography.display.fontFamily}"
    fontSize: "16px"
    fontWeight: 400
    lineHeight: 1.72
    letterSpacing: "0"
  label:
    fontFamily: "{typography.display.fontFamily}"
    fontSize: "0.82rem"
    fontWeight: 600
    lineHeight: 1.5
  code:
    fontFamily: "'Deshi Sans Bengali', 'SFMono-Regular', Consolas, 'Liberation Mono', monospace"
    fontSize: "0.92em"
    fontWeight: 400
rounded:
  edge: "3px"
  soft: "4px"
  popover: "6px"
  badge: "12px"
  pill: "999px"
  circle: "50%"
spacing:
  gutter-wide: "48px"
  gutter-mid: "32px"
  gutter-narrow: "18px"
  rail-pad: "28px"
  card-pad: "18px"
  block-pad: "16px"
components:
  link:
    textColor: "{colors.blue}"
  link-hover:
    textColor: "{colors.blue-hover}"
  link-visited:
    textColor: "{colors.visited}"
  button-quiet:
    backgroundColor: "{colors.canvas}"
    textColor: "{colors.ink}"
    rounded: "{rounded.edge}"
    padding: "10px 18px"
    typography: "{typography.body}"
  button-quiet-hover:
    backgroundColor: "{colors.green-soft}"
    textColor: "{colors.green-deep}"
  button-primary:
    backgroundColor: "{colors.green-ground}"
    textColor: "{colors.green-deep}"
    rounded: "{rounded.edge}"
    padding: "10px 18px"
  button-primary-hover:
    backgroundColor: "{colors.green-soft}"
    textColor: "{colors.green-deep}"
  button-disabled:
    backgroundColor: "{colors.canvas}"
    textColor: "{colors.faint}"
  input-search:
    backgroundColor: "{colors.canvas}"
    textColor: "{colors.ink}"
    rounded: "{rounded.edge}"
    padding: "12px 16px"
    height: "44px"
  card:
    backgroundColor: "{colors.canvas}"
    textColor: "{colors.ink}"
    padding: "18px"
  card-hover:
    backgroundColor: "{colors.green-ground}"
    textColor: "{colors.green-deep}"
  callout-summary:
    backgroundColor: "{colors.green-ground}"
    textColor: "{colors.ink}"
    padding: "16px 20px"
  callout-caution:
    backgroundColor: "{colors.warn-bg}"
    textColor: "{colors.warn-ink}"
    padding: "16px 18px"
  chip-count:
    backgroundColor: "{colors.canvas-soft}"
    textColor: "{colors.muted}"
    rounded: "{rounded.pill}"
    padding: "3px 12px"
  chip-stub:
    backgroundColor: "{colors.warn-bg}"
    textColor: "{colors.warn-ink}"
    rounded: "{rounded.pill}"
    padding: "0 8px"
  infobox-title:
    backgroundColor: "{colors.green-deep}"
    textColor: "{colors.canvas}"
    padding: "14px 16px"
  nav-link-active:
    textColor: "{colors.green-deep}"
    typography: "{typography.label}"
---

# Design System: Deshi Startup

## Overview

**Creative North Star: "The Field Manual"**

Deshi Startup is not read at leisure. It is opened one-handed, on a mid-range Android, on patchy
bandwidth, in the middle of doing the thing it describes: at the RJSC counter, in front of a bank
form, halfway through a VAT registration. So the interface behaves like a good field manual rather
than a magazine. Warm paper surrounds a bordered white reading canvas ruled at the top in deep
Bangladesh green. Everything on it is either the text, the structure that locates the text, or the
one next action. Nothing performs.

Trust is what the interface is actually for, and it earns trust the way a working manual does: by
receding, staying legible, and never overstating. The chrome is hairline borders and quiet grays.
The color budget is spent only where it carries meaning, under a strict division of labor between
two accents. Green is structure, meaning the top rule, active navigation, hover washes, the infobox
header and section badges. Blue is language, meaning links, and only links. That single discipline
is most of the reason the page reads calm and authoritative instead of busy.

The type system is one self-hosted Bengali variable face, and the whole hierarchy is built out of
scale, weight and hairline rules rather than a second family. That is a design decision and a
performance decision at the same time, which is the pattern across this system: the visual language
and the byte budget are the same argument. The rejected alternatives are specific, not abstract:
the startup-blog look (gradients, saturated fills, card grids, a hero that sells), and the
translated-Western-template look that would treat Bangla as text poured into a Latin layout.

These are reasoned defaults, not untouchable rules. A deliberate change with a stated reason and a
rendered before/after is welcome. What the system must not do is drift as a side effect of
unrelated work.

**Key Characteristics:**

- Warm paper page framing a bordered white reading canvas with a deep-green top rule.
- Two-accent discipline: green for structure, blue for links, nothing else competing.
- One Bengali face for everything; hierarchy carried by scale, weight and hairline rules.
- Flat by default. Hairline borders do the work; one soft ambient shadow, used twice.
- Square-cornered geometry (3px), with pills reserved for toggles, counts and status chips.
- Mobile-first and near-zero-JS. The visual language is also the performance budget.

What a first-time founder on patchy bandwidth must be able to do on any page:

- trust that the page is a reference, not an advertisement;
- scan the structure and find the next action quickly;
- read dense Bangla without fighting the layout;
- understand what is clickable and what is only information; and
- use the core article without waiting for heavy JavaScript.

## Colors

A warm-paper neutral field carrying two working accents, plus a caution family and one violet that
exists for a single genuine affordance. Nothing in the palette is decorative.

### Primary

- **Bangladesh Emerald** (`#047857`): the working green. Active tab top rule, focus and hover
  borders, checkbox accent, the search field's active border, card hover edges.
- **Deep Deshi Green** (`#065f46`): the authority green. The 5px rule across the top of the reading
  canvas, the infobox header ground, active navigation labels, focus rings, and the text color of
  every quiet action in its hover and primary states.
- **Structure Wash** (`#eaf4ef`) and **Structure Ground** (`#f8fbf7`): the two green grounds. The
  wash is the hover state (search results, nav, buttons, disclosure summaries); the ground is the
  resting fill for the summary callout, the primary action and a hovered path card.

### Secondary

- **Reference Blue** (`#3366cc`): links, and only links. **Link Pressed** (`#1f4fb2`) is the hover
  and the visited-hover. **Link Wash** (`#eef5fc`) is the rare selected-link ground.
- **Read Violet** (`#6b4ba1`): the visited-link color inside articles, section indexes and recent
  lists. It is a real encyclopedia affordance, not styling: returning to a section, a founder can
  see which guides they already read, at zero JavaScript and zero tracking. Stub links are excluded
  on purpose, because "visited" there would falsely read as "finished".

### Tertiary

- **Marker Yellow** (`#f7c948`): the language-switcher thumb, and nothing else.
- **Notice Gold** (`#e1b900`), **Notice Cream** (`#fff8df`), **Notice Ink** (`#5f4b00`),
  **Notice Hairline** (`#e5d193`): the caution family. Stub notices, the homepage unfinished-work
  notice, the stub chip beside an unwritten link.
- **Error Red** (`#b42318`): error text and error state only. It never means emphasis.

### Neutral

- **Field Paper** (`#f5f3ee`): the page beneath everything. Warm, so the white canvas reads as a
  sheet laid on it rather than as a hole.
- **Reading White** (`#ffffff`): the article canvas, cards, the infobox, table bodies.
- **Cool White** (`#f8faf9`): recessed utility surfaces. Fenced blocks, the search submit button,
  filter panels, count chips.
- **Manuscript Ink** (`#202122`): body text and headings. Also published as bare channels
  (`--ink-channels: 32 33 34`) for the four places that need it at an alpha, so a scrim can never
  drift off the ink it was made from.
- **Muted Ink** (`#54595d`): secondary text, labels, descriptions, table meta.
- **Faint Ink** (`#696e74`): placeholders and disabled text. It is stated explicitly because left to
  the browser a placeholder is `#757575` in Chrome but 40% black in Safari, which is 3.6:1 on white.
- **Hairline** (`#c8ccd1`): the standard border on white. **Soft Hairline** (`#eaecf0`): dividers
  inside a bordered surface. **Warm Hairline** (`#d9d5cd`): the divider tuned for the paper page,
  used in the sidebar, because the standard hairline is tuned for white.
- **Shade** (`#f1f3f4`): table headers and inline code grounds.

### Named Rules

**The Two-Accent Rule.** Green is structure; blue is language. A link is never green, and a
structural element (rule, tab, active state, badge, wash) is never blue. If a new element seems to
need a third accent, it almost always wants a neutral, a label, a hairline or a spacing change
instead.

**The Frugal-Yellow Rule.** Yellow belongs to cautions and the one toggle thumb. It is never a
highlight or a decoration. Its scarcity is what lets a stub banner read as unfinished rather than
broken.

**The Earned-Violet Rule.** The violet is the only color in this palette justified by a reader
behavior rather than a role. It may not be borrowed for anything that is not literally "you have
been here".

## Typography

**Display Font:** Deshi Sans Bengali, a self-hosted variable subset covering weights 400 to 700,
renamed after subsetting to comply with the original face's Reserved Font Name.
**Body Font:** the same face, leading a platform sans stack (system-ui, -apple-system,
BlinkMacSystemFont, Segoe UI, Roboto, Helvetica Neue, Arial).
**Mono:** SFMono-Regular, Consolas, Liberation Mono, used for inline `code` only, and always behind
the Bengali face in the stack.

**Character:** one voice, at several volumes. The Bengali face is fenced to the Bengali unicode
range and listed first, so the browser resolves the stack per character: Bangla lands on the
self-hosted face, Latin and digits land on the platform sans and download nothing. Mixed Bangla and
English text needs no locale wrapper and no hand-written spans. The face leads on purpose; listed
last it would never be reached at all, because macOS resolves `system-ui` to a composite cascade
that already carries a Bengali fallback and would claim the character first.

### Hierarchy

- **Display / h1** (500, `clamp(2.1rem, 3vw, 3.2rem)`, 1.3): the page title, closed by a hairline
  border-bottom. Drops to 2.05rem below 860px.
- **Headline / h2** (600, 1.55rem, 1.25): section headings, also hairline-underlined. Leading opens
  to 1.34 below 860px.
- **Title / h3** (600, 1.08rem, 1.25): sub-sections, no rule. Rises to 1.2rem below 860px, because
  against a 16px body the desktop size was a 1.28px step, which is a weight change rather than a
  level.
- **Body** (400, 16px, 1.72): the reading default. Article prose opens to 1.78 below 860px. Capped
  at a 65rem measure.
- **Label** (600, 0.82rem): sidebar group headers, meta rows, table captions, chips. Never
  uppercased.
- **Code** (0.92em inline): names a field, a file or a form.

### Named Rules

**The One-Face Rule.** One Bengali face, one download. `h1` and `h2` keep the `--display` role name
so a future face has somewhere to land, but hierarchy is carried by size, weight, balanced wrapping
and the hairline rules, never by a second family. A second family is a new font download charged to
a mid-range Android on every first visit.

**The Hairline-Underline Rule.** `h1` and `h2` are separated from their content by a `1px` hairline
border-bottom, not by size or space alone. It is the single most reference-defining type detail in
the system and must survive any restyle of headings.

**The Step-Not-Weight Rule.** Every heading level stays a clear size step above the body at every
width. If a level only distinguishes itself by getting bolder, the level is broken; fix the size,
not the weight.

**The Upright-Emphasis Rule.** Bengali emphasis is weight 600 and stays upright. This family has no
native italic convention, and the browser's synthetic slant deforms conjuncts. English emphasis uses
the platform face's native italic.

**The Reading-Face Fence Rule.** A fenced block on this site holds Bangla prose, a fee sum or a
message template, so it is set in the reading face and wraps on a phone. Inline `code` keeps the
monospace, where it is naming a field. Left to `monospace` alone, Bangla fell through to whatever
face the platform keeps behind it and a paragraph changed typeface mid-page.

## Layout

The desktop shell is a two-column grid inside a `min(1660px, 100%)` container: a 282px navigation
rail and the reading canvas beside it. The canvas is bordered left and right with a hairline, ruled
across the top with 5px of deep green, and lifted off the paper by the system's one ambient shadow.
Article padding is 48px horizontal at full width, 32px from 1180px down, 18px on a phone. The
sticky header carries the brand, search and top actions on an opaque white ground, and reserves its
own clearance through `--header-h` (84px, remeasured from JS while editing because the header
stacks on phones).

Prose is capped at a 65rem measure (`--measure`). Paragraphs, lists, blockquotes, headings and the
inline table of contents obey it, so a heading's hairline underline ends on the same edge as the
text it heads. Dense tables (four or more columns), generated indexes and the shell's own utility
surfaces are exempt and keep the full canvas, because they need the room. Long Bangla runs use
`overflow-wrap: anywhere` and `text-wrap: pretty`, since Bengali sentences are long and the mobile
column is narrow; table cells step down to `break-word` so a 110px column stops shredding words
mid-grapheme.

Responsive behavior, by the breakpoints that actually exist:

- **1180px**: the rail narrows to 238px, gutters drop to 32px, social labels collapse to icons,
  the homepage hero stacks and the path grid halves from four columns to two.
- **1024px / 1023px**: exactly one "on this page" list at every width. The rail owns it above,
  the inline accordion owns it below. The two rules are a pair; move one and the other has to move
  with it.
- **860px**: the phone layout. Header stacks to two rows and search takes the second, the rail
  becomes an off-canvas drawer behind a toggle, scroll clearance rises to 152px, and simple tables
  switch to a fixed layout so the column settles first and the text wraps inside it.
- **620px / 560px / 520px**: single-column filter panels and footers, tabs scroll horizontally,
  the brand tagline truncates, the infobox definition rows stop being a two-column grid.
- **420px**: the meta row reserves its exact two-row grid before the client-formatted date arrives,
  so nothing shifts after paint.

**The Phone-Is-The-Reader Rule.** The narrow column gets the larger body, not the smaller one.
Bangla carries matra above the line and conjuncts below it, and at 15px the stacked forms are where
a founder on a mid-range Android starts guessing. 16px costs about one word per line and buys back
the shapes; the opened leading is the other half of the same fix.

**The Even-Column Rule.** A table divides the phone column evenly rather than sizing itself from its
longest word. Only a genuinely dense grid earns its own horizontal scroll surface.

**The Nothing-After-Paint Rule.** Nothing appears above the article once the page has painted. The
shell is one client component that cannot know the route while the static HTML renders, so anything
it discovered from the DOM used to arrive a moment late and push the reading down. Both "on this
page" lists are written into the HTML by `scripts/postbuild-seo.mjs`, marked `deshi:toc`, and
reproduced exactly by the shell's first client render. The rule is stated once and implemented
twice, so a change to either side has to be made on both.

Pages print. The header, rail, tabs, footers, breadcrumbs, meta row and table of contents are
removed, the canvas loses its border and shadow, body drops to 11pt, links become underlined ink,
and the external-link marker is suppressed.

## Elevation & Depth

This system is flat. Depth comes from tonal layering (warm paper under white canvas under cool-white
utility surfaces) and from hairline borders, not from shadows. Radii are small, fills are absent,
and no surface floats without a structural reason.

### Shadow Vocabulary

- **Canvas lift** (`box-shadow: 0 14px 32px rgb(32 33 34 / 8%)`): the one ambient shadow. It lifts
  the reading canvas off the paper page, and the search-results popover off the canvas. That is the
  whole list.
- **Drawer** (`box-shadow: 12px 0 40px rgb(32 33 34 / 20%)`): heavier, reserved for the mobile
  off-canvas navigation drawer, the one true overlay in the system.
- **Popover lift** (`box-shadow: 0 4px 20px rgb(32 33 34 / 16%)`): the glossary term popover.
- **Focus fill** (`box-shadow: inset 0 0 0 1px <green>`): not depth. It thickens the search field's
  border on focus from the inside, because the field shares an edge with its submit button.

### Named Rules

**The One-Shadow Rule.** The ambient lift belongs to the reading canvas and the search popover.
Cards, infoboxes, tables, notices, chips and buttons are flat with borders. A new surface defaults
to a hairline, never a shadow.

**The No-Blur Rule.** Nothing sticky or full-width carries a `backdrop-filter`. Blurring a strip on
every scroll frame is paid by exactly the mid-range Android this site is read on, and what it buys
is a smear of paper nobody looks at. The header is opaque canvas white, which is also the honest
answer: the article is white, and the header is the top of it.

## Shapes

Square by default. The standard corner is 3px, which is barely an easing: buttons, the search
field's outer corners, notices, chips with square shoulders, editor controls. 4px appears on search
result rows, 6px on the glossary popover, 12px on the expert-review badge, 2px on citation markers.
True curves are rationed to two jobs: `999px` pills for toggles, count chips, status chips and the
stub chip, and `50%` circles for avatars and step badges.

Borders carry the form language. Almost every bounded thing on this site is a 1px hairline in
`--line` on white or `--line-warm` on paper, with `--line-soft` for divisions inside an already
bounded surface. A callout is bounded on all four sides and identified by a labelled first line plus
a ground, never by a thick colored slab down one edge. Separators are a single hairline capped to
the measure, and a separator immediately above a heading collapses to nothing, because the heading's
own underline is already the division.

**The Square-By-Default Rule.** New interactive elements are square or 3px. Pills mean "this is a
toggle or a count", and circles mean "this is a person or a step". Borrowing either for anything
else costs the site the meaning.

## Components

Buttons, cards and inputs are quiet and hard-wearing: a hairline border, a white ground, a 3px
corner, a green wash on hover, and a name made of text rather than of an icon. Nothing is filled and
nothing is lifted. A control should look like it will still be there in five years.

### Links

- **Default:** Reference Blue, no underline; underline appears on hover with the pressed blue.
- **Visited:** Read Violet inside articles, section indexes and recent lists; hover returns to the
  pressed blue.
- **External:** an `↗` marker is appended after any `http` link in an article. Most external links
  here are government portals, and a founder should know before the tab changes. Suppressed in print.
- **Stub link:** muted ink with a dashed hairline underline offset 3px, plus a pill chip reading
  "লেখা বাকি". It is deliberately not styled as visited-able.

### Buttons

- **Shape:** barely eased corners (3px), 1px hairline border, white ground.
- **Quiet (default):** `--ink` text on `--canvas`, 10px 18px padding, named by its text. Hover moves
  the border to Bangladesh Emerald, the ground to the structure wash, the text to Deep Deshi Green.
- **Primary:** the same geometry, distinguished only by a Deep Deshi Green border, the structure
  ground, green text, weight 600 and a trailing `→` that steps 3px forward on hover. There is one
  ranked pair of actions on the site (the homepage start row); everything else is quiet.
- **Disabled:** soft hairline, faint ink, weight back to 400, default cursor.
- **Focus:** a 2px Deep Deshi Green outline at 3px offset, site-wide, on every link, button, input,
  select and summary.
- **Touch:** important mobile actions are at least 44px; directory controls grow from 36px to 44px
  below 860px.

**The No-Saturated-Fill Rule.** A button is never a solid brand-colored slab. Rank is expressed by
border color, ground tint, weight and the arrow, in that order.

### Cards and Callouts

- **Cards:** flat white, 1px hairline, 18px padding, square corners. A hovered navigational card
  answers on its whole surface (border to green, ground to the structure ground, title deepens) so
  it reads as one target rather than an outlined region. When a grid's item count leaves a remainder,
  the last card takes the full row and reads across it, because a lone card in a final row reads as
  an accident.
- **Summary callout (সারকথা):** the green family. Full hairline border in Bangladesh Emerald,
  structure ground, 16px 20px. A summary is not a warning, and it is bounded on all four sides so it
  does not sit in the same register as the separators around it.
- **Caution / stub notice:** the gold family. Notice Gold hairline, Notice Cream ground, Notice Ink
  text, a bold first line that names the state. Labelled the way a printed reference labels a note,
  not with a letter inside a colored circle.

### Chips

- **Count chip:** pill, cool-white ground, hairline, muted label with the number in Deep Deshi
  Green.
- **Stub chip:** pill, Notice Cream ground, Notice Hairline border, Notice Ink text. It sits beside
  a link the reader is deciding whether to follow, so on a phone it grows to 0.78rem rather than
  merely being present.

### Inputs and Forms

- **Style:** the same paper, ink, hairline and focus language as the rest of the site. The search
  field is a 1fr/54px grid with the submit button sharing its edge, so the outer corners are eased
  and the inner ones are square.
- **Focus:** a mouse click gets the quieter treatment (green border plus an inset 1px fill); keyboard
  focus additionally gets the site focus ring, drawn inset so it closes rather than cutting across
  the adjacent button.
- **Placeholder:** stated explicitly in Faint Ink at full opacity, never left to the browser.
- **Validation:** messages sit beside the control they belong to. Error Red carries text, never a
  fill.

### Navigation

- **Rail:** 0.9rem, sticky at 96px, grouped under muted 0.82rem labels separated by warm hairlines.
  The active link is Deep Deshi Green at weight 600. Below 860px the rail becomes an off-canvas
  drawer with a backdrop and its own heavier shadow.
- **Tabs:** the article/edit pair. The active tab takes a hairline border, a 3px Bangladesh Emerald
  top rule and the canvas ground; whichever view you are in is set in ink and the other stays a
  link.
- **Disclosure:** one open/closed sign across the site, a `+` that becomes `–`. The browser's own
  triangle is suppressed, because it was the last control on the site drawn in a different family
  from the accordions beside it.

### Infobox

The one encyclopedia-style signature card, and the only place a saturated ground appears: a Deep
Deshi Green header bar with canvas-white text, a centered 112px mark, a centered name, a centered
caption between soft hairlines, and a definition list on a 112px label column that collapses to
104px below 860px and to stacked blocks below 520px. It earns its weight by being singular. Nothing
else in the system gets a filled header.

### Glossary

The site's one lookup surface, and the only page whose spine is alphabetical rather than
editorial. A reader arrives having just heard a single English word, so the page answers that
first: a filter field, theme pills, an A–Z strip that doubles as the table of contents, and then
every term on a dictionary's two-column grid, headword rail on the left and meaning on the right.
The rail is what the eye runs down; that is why this is not a card list. The headword is the
English term in both editions with the Bangla gloss beneath, because the English word is what was
heard. Every term is server-rendered and the controls only hide rows, so browser find, Pagefind
and a reader without JavaScript all get the whole glossary. The page carries no `h2`, on purpose:
the letter strip is a better contents list than a rail of single letters. Its one authored moment
is the green ground that fades off an entry arrived at by `#id`, which answers "where did I land"
once and then leaves.

### Directory

Utilitarian by design. A bordered cool-white filter panel on a data-attribute-keyed grid, a pill
summary of the result count, and one flat card per entry. Cards rather than a wide table: directory
values are sentences (coverage areas, rate bands, application steps), a column grid gave each a
track too narrow to hold a word, and a new field should cost one more labelled line rather than one
more squeezed column. There is no horizontal scroll at any width.

### Contribution editor

The inline editor extends the article canvas rather than opening a visually separate CMS. Its theme
variables are bound to the site's own tokens, its buttons are the same quiet geometry, and the
rendered article stays in place at 42% opacity while it hands over rather than blanking. Added
complexity there must improve editing, recovery, accessibility or security. It must not become a
second design system.

## Do's and Don'ts

### Do:

- **Do** frame reading surfaces as Reading White (`#ffffff`) on Field Paper (`#f5f3ee`), bounded by
  a `--line` hairline, with the 5px `--green-deep` top rule intact. That framing is the brand.
- **Do** keep the Two-Accent Rule: green for structure, blue for links only.
- **Do** underline `h1` and `h2` with a `--line` border-bottom, and carry every other level
  difference through size and weight rather than a second font family.
- **Do** convey depth with hairlines and paper/canvas layering; reserve the ambient shadow for the
  canvas and the search popover.
- **Do** keep new interactive elements square or 3px, and reserve pills for toggles and count or
  status chips.
- **Do** give important mobile actions at least 44px, and keep keyboard focus visible everywhere.
- **Do** trap focus in drawers and modals, close them with Escape, and restore focus on exit.
- **Do** use Bengali numerals (০ to ৯) in the Bangla UI and Latin numerals in the English UI.
- **Do** keep dates client-side. Node and Chrome ship different CLDR data (Node writes
  "৩১ জানুয়ারী", Chrome writes "৩১ জানুয়ারি"), so a build-time Bengali date would not survive
  hydration. Formatting in the browser is the only way both agree.
- **Do** give images useful alt text, and keep captions and sources as selectable text.
- **Do** respect `prefers-reduced-motion`, and keep animation out of the way of reading.
- **Do** self-host fonts, and keep the Bengali face fenced to its unicode range so Latin downloads
  nothing.
- **Do** load analytics `lazyOnload`, behind the window load event. It is the largest main-thread
  bill on the page and none of it is what the reader came for.
- **Do** keep hash-named build output cached immutably in `public/_headers`. Every navigation here
  is a full document load, so a revalidation round-trip is charged to the reader on every click.
- **Do** prefer semantic HTML and CSS over client state.

### Don't:

- **Don't** let the shell drift as a side effect of unrelated work. The paper page, bordered white
  canvas, green top rule and absent right-hand rail are a reasoned default recorded here, and this
  file is their only record. A proposal that demonstrably serves readers better is welcome; erosion
  by accident is not.
- **Don't** fill buttons, cards or notices with a saturated brand color, or add a drop shadow to
  make something pop. Flat with borders is the system.
- **Don't** add a second display family, a serif, or any additional font download. One Bengali face.
- **Don't** use a thick colored side border as generic callout decoration. A callout is bounded on
  four sides and identified by its label.
- **Don't** color a link green or a structural element blue.
- **Don't** spend yellow on decoration; it belongs to cautions and the one toggle thumb. Error red is
  for errors only.
- **Don't** put a `backdrop-filter` on anything sticky or full-width.
- **Don't** synthesize italic Bengali. Emphasis is weight 600, upright.
- **Don't** embed raw YouTube or Facebook iframes; use the click-to-load facade components.
- **Don't** add a heavy dependency for a small interaction or a calculator.
- **Don't** let anything appear above the article after paint.
- **Don't** use an em dash in page content under `app/(contents)/`. Use an en dash, a comma, or two
  sentences; enforced by `npm run lint:bangla`.

### Review test

- [ ] The change helps trust, reading, navigation or contribution.
- [ ] It works at narrow mobile width and with keyboard navigation.
- [ ] Green still means structure and blue still means link.
- [ ] It reuses existing tokens and component language.
- [ ] It adds no unnecessary JavaScript, font or media weight.
- [ ] A new exception is explained by a user need, not visual novelty.
