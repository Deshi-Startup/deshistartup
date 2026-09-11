---
name: Deshi Startup
description: Free, open-source manual for building startups in Bangladesh, available in Bangla and English.
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
  social-card-field: "#064e3b"
  social-card-identity: "#fbfaf7"
  social-card-monogram: "#f7f3e8"
  social-card-copy: "#315548"
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
    fontFamily: "'Deshi Sans Bengali', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif"
    fontSize: "1.55rem"
    fontWeight: 600
    lineHeight: 1.25
    letterSpacing: "0"
  title:
    fontFamily: "'Deshi Sans Bengali', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif"
    fontSize: "1.08rem"
    fontWeight: 600
    lineHeight: 1.25
  home-display:
    fontSize: "clamp(2.5rem, 5.2vw, 4.75rem)"
    fontWeight: 500
    lineHeight: 1.2
  home-entry:
    fontSize: "1.125rem"
    fontWeight: 500
    lineHeight: 1.5
  home-situation:
    fontSize: "1.0625rem"
    fontWeight: 500
    lineHeight: 1.5
  home-action:
    fontSize: "0.95rem"
    fontWeight: 400
    lineHeight: 1.72
  home-meta:
    fontSize: "0.9rem"
    fontWeight: 400
    lineHeight: 1.72
  body:
    fontFamily: "'Deshi Sans Bengali', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif"
    fontSize: "16px"
    fontWeight: 400
    lineHeight: 1.72
    letterSpacing: "0"
  label:
    fontFamily: "'Deshi Sans Bengali', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif"
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
broken. The on-demand contribution diff is the sole semantic exception: Notice Gold and Notice
Cream identify removed text, always paired with a minus marker and a spoken “removed” label so
color never carries the meaning alone. This exception does not make yellow available as a general
highlight.

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
  and the homepage hero stacks. The homepage path grid halves from four columns to two at 1280px.
- **1024px / 1023px**: exactly one "on this page" list at every width. The rail owns it above,
  the inline accordion owns it below. The two rules are a pair; move one and the other has to move
  with it.
- **860px**: the phone layout. Header stacks to two rows and search takes the second, the rail
  becomes an off-canvas drawer behind a toggle, scroll clearance rises to 152px, and simple tables
  switch to a fixed layout so the column settles first and the text wraps inside it.
- **620px / 560px / 520px**: single-column filter panels and footers, the brand tagline
  truncates; the compact infobox keeps its label/value columns. Page metadata follows the article,
  so its date cannot shift the headline after paint.

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

Pages print. The header, rail, reading controls, footers, metadata and table of contents are
removed, the canvas loses its border and shadow, body drops to 11pt, links become underlined ink,
and the external-link marker is suppressed.

### Footer

The everyday guide layout sets the footer's alignment and density. It occupies the reading column
of the page grid, below the canvas, with matching 48px / 32px / 18px gutters on warm paper. A thin
separator spans the full page grid above the footer, including beneath the sidebar. A short
project description leads into compact, labeled rows of links: Project, Community, and Help &
policies. Footer copy uses the available width rather than a prose measure that forces short lines.
The full disclaimer remains in Terms and About instead of repeating below every page. At 620px
and below the labels sit above their links; targets are at least 44px high from 860px down.
Wide collections use the same structure within their 1360px article boundary. The shared page grid
keeps the footer aligned with its content when the sidebar opens or closes.

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
  "লেখা বাকি". It is deliberately not styled as visited-able. Markdown links resolve readiness
  from the generated content index too, including curated lists that link across sections. The
  status label stays outside the link text and search index; unfinished links carry `nofollow`.

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
- **Touch:** important mobile actions are at least 44px; directory controls keep that height
  at every width.

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
- **Filters:** glossary, directory and Startup 50 text fields use normal-weight 1rem text and
  at least 44px height. Labels stay distinct from the values the reader enters or selects.
- **Validation:** messages sit beside the control they belong to. Error Red carries text, never a
  fill.
- **Search:** focusing the field prepares the index; reading a page does not download it. Results
  belong to the current query only, and late responses cannot reopen a dismissed panel. A failed
  download offers an inline retry that keeps the query and the reader's place.

### Navigation

- **Rail:** 0.9rem, grouped under muted 0.82rem labels separated by warm hairlines.
  Start links, all topics and resources stay visible. Topic and contact links use native
  disclosures, with the current section open on arrival. The most specific matching destination
  takes strong deep-green text. The paper stays unfilled and the text keeps its alignment,
  with no marker beside it. Underlining appears on hover; weight distinguishes the current
  location beyond color, and a parent uses `aria-current="location"`.
  The desktop rail follows the document scroll, with no independent scrollbar or height cap.
  Below 860px it becomes the existing off-canvas drawer with a backdrop, its own scrolling
  and its own heavier shadow.
- **Reading controls:** one compact row above the headline. Breadcrumbs use short navigation
  labels and list ancestors only; on phones, show just the parent link with a back arrow. Long
  fallback labels stay on one line, with their full text available to assistive technology and
  in the link title. The article headline is never repeated in this row.
- **Page tools:** a native disclosure holds editing, discussion, history and mistake reporting.
  Contents uses the same row below 1024px; the desktop sidebar retains its contents list.
  Opening either disclosure closes the other. Escape returns focus to its trigger; clicking
  outside or following a link closes the panel. Both work as native disclosures without JavaScript.
  While editing, a single Back to guide control invokes the existing unsaved-work protection.
- **Disclosure:** one open/closed sign across the site, a `+` that becomes `–`. The browser's own
  triangle is suppressed, because it was the last control on the site drawn in a different family
  from the accordions beside it.

### Infobox

The encyclopedia-style signature card keeps its Deep Deshi Green header and centered canvas-white text.
Its paper-toned definition list answers three questions: languages, access and how much is written.
A single hairline frames the box. Written and unwritten guide counts are stated separately
without turning them into a scoreboard. A 6rem label column stays beside the value on phones.
It sits beside the homepage introduction on desktop and after the starting
choices below 1180px, where the facts use three columns until the phone layout stacks them.
Nothing else in the system gets a filled header.

### Homepage discovery

The homepage is the manual's cover: a larger charcoal masthead, the existing short
introduction and one framed starting action beside a blue topic link. Its display size ranges
from 2.5rem to 4.75rem; Bangla keeps its natural tracking. Four starting situations form a joined,
ruled index with a complete outer border and small line icons. Hover and keyboard focus fill a
brief green rule across the chosen entry; reduced motion makes the response immediate. There is no entrance animation or
additional client JavaScript.

The masthead uses weight 500, with size carrying its emphasis. Section headings keep weight 600;
situation titles use 1.0625rem and topic and portal titles use 1.125rem, all at weight 500 with
1.5 line height. The situation cards have 16px side padding and a 6px icon gap to give longer
Bangla headings room. Destination
cues, fact labels and closed FAQ questions use normal weight. Opening a question gives it medium
weight and aligns its answer with the question text, within a 72ch reading measure.

Topic browsing uses blue links in paired rows, separated by hairlines, with one direct link to
the complete topic index. Recent updates pair titles with right-aligned dates when space allows.
FAQs, official portals and contribution information follow in the same order; the legal note
sits with the official portals. The contribution action sits beside its explanation on desktop
and below it on phones. Homepage styles remain scoped to the landing component.

### Section indexes

Finished guides appear first, in their existing editorial groups. A single native disclosure
below them contains all unwritten topics, grouped by the same source data and still marked as
unfinished. Empty sections say that the detailed guides have yet to be written. Counts are a
plain line of available and unwritten items; a redundant total does not need a third badge.
The generated content index owns availability, so this presentation updates when a guide lands.

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
summary of the result count, and one flat card per entry. The filter grid responds to the article's
available width, including the sidebar: one row when roomy, two columns below 820px with search
across the top, and one column below 480px. Cards rather than a wide table: directory
values are sentences (coverage areas, rate bands, application steps), a column grid gave each a
track too narrow to hold a word, and a new field should cost one more labelled line rather than one
more squeezed column. There is no horizontal scroll at any width.

### Ecosystem overview and help chooser

The ecosystem page starts with a need-based chooser, then explains the customer–startup
relationship and the supporting roles. `EcosystemHelp` uses native radio inputs and CSS to show
the matching contact, question, preparation and useful outcome. The whole label is a touch target;
the selected wash and focus outline use structural green. It needs no client script. Browsers
without `:has()` show every path as a readable reference, and print includes all four paths.

Prose, heading rules, the chooser and the map share the site's `--measure`; this page must not add
a separate paragraph-only width cap. On phones the chooser becomes one column, its label/value
rows stack, and the map keeps customers and the startup side by side with their exchange below.
The role links remain ordinary in-page anchors. Official links sit with the government-office
rows, and the first-contact section provides a reusable message before the detailed precautions.

### Startup 50 watchlist

The Startup 50 opens with one large folio number and continues into a flat, ruled company list.
Each row shows the reviewed company mark, name, sector, a short description and one useful lesson.
A small Details control reveals the company background, latest update, public funding information
and official website without sending readers to a second record page.

The folio and the edition line under it are one masthead, not two blocks. A single 2px green spine
runs the full height of both rows, a hairline divides them, and the heavy green rule closes the
block at the bottom rather than bisecting it. Everything in the seam column is left-aligned on the
same edge: the folio numeral, the edition heading and the last-updated line. The numeral is pulled
left by its own side bearing so it starts on that edge rather than a dozen pixels inside it, and
its line box is trimmed to cap and baseline so a mark whose box is a third taller than its ink
still centres on what a reader sees. Bengali figures stop short of the cap line that Latin figures
overshoot, so the Bangla edition takes a small documented correction to sit on the same axis. The
two columns of the edition row start on the same cap, which equal top padding gives them for
free: the smaller line carries proportionally more of its own leading than the heading does, and at
these two sizes that offsets the heading's taller ascent almost exactly. Two blocks either side of
a heavy rule want their tops to agree rather than their baselines, and no figure here has to be
kept in step with a font size by hand.

Wherever the folio sits in the seam column, it is sized from that track and not from the viewport:
at 0.8 of the track the wider of the two numerals still clears the spine, whichever face the
platform serves the Latin digits from. This is a rule, not a preference. A viewport-derived numeral
beside a fixed seam printed the 50 straight over the body copy between 681px and 860px, and any
future per-breakpoint override of either value can reintroduce that. The two-column masthead has one
seam ramp and one size formula for exactly this reason.

Below 680px the rule does not apply, and the exception is deliberate. The masthead stacks, the folio
loses its right-hand border and takes a band of its own across the full canvas, and the seam
variable is not read by that layout at all. There is no column to overflow and no spine to reach,
so the numeral is free to stay viewport-fluid there and does: it runs at 22vw between a 5.2rem floor
and a 7.6rem ceiling. The ceiling is what keeps it honest. At its largest the mark is about 141px of
ink inside a canvas of at least 517px, so the band cannot be filled by the numeral at any width this
layout serves. The rule above is about collision with the spine; where there is no spine there is
nothing for it to govern.

The block is sized by its content and its stated padding. There is no min-height on it; the last one
invented eighty pixels above the headline that no rule in this system had authored.

The complete list is server-rendered. A small client component only filters the existing records by
name and sector, so every company and link remains available without JavaScript. At narrow widths,
the folio becomes a compact masthead and each row stacks in reading order without horizontal scroll.

Both `/startup-50` and `/en/startup-50` start with the sidebar hidden. Content is centered within
a 1360px article boundary, including its gutters, so company rows stay comfortable on large screens.
The header's Sidebar control shows or hides a docked rail on desktop; it remains reachable when
opened partway down the list and can scroll without a visible scrollbar. Phones retain the existing
modal drawer, with focus containment, Escape dismissal and focus return. Search and the language
switch stay in the header, and the footer follows the same content column and gutters. Other pages keep their usual
desktop rail; additional collections can opt into this layout.

Company rows respond to their container rather than the window. They stack by default and add
columns only when their minimum widths and spacing fit. This keeps the list usable when canvas
gutters or the surrounding layout change, and browsers without container queries retain the
readable stacked row.

Green is used for structure, rules, hover and focus; blue remains for links. Company marks are
reviewed before use, stored in R2 through the site's media pipeline and linked to their source in the
authored logo manifest. The page is reviewed monthly when practical and at least quarterly. It has no
rank numbers, public scores, trophy language or sponsor-controlled placement.

Each language has its own 1200×630 sharing image. It carries the same folio idea as the page: one
large 50 on a deep-green field, then the title, watch line, project mark and short URL on warm paper.
It is deliberately not a screenshot, logo wall or miniature list. The copy and logical R2 paths live
in `data/social-images.json`; `npm run social:images` renders the bytes into the gitignored
`media/og/{locale}/` staging directory, and the normal media upload gives each revision a new
content-addressed R2 URL. The SEO pass uses a configured image only after its registry entry confirms
that the object is remote, otherwise it safely falls back to the site-wide card.

### Case-study gallery and articles

The case-study gallery has an approved, scoped exception to the manual's flat list treatment:
portrait covers with company-specific grounds, cream lettering, reviewed company marks and crisp
vector artwork. Pathao uses a red route map; 10 Minute School uses a deep-green ground with stacked
lesson pages. These covers retain the approved prototype's composition, 9px corners and a small
hover lift. Other pages keep the existing palette and geometry.

The gallery keeps Pathao, 10 Minute School and bKash in its first desktop row. ShopUp / SILQ,
Revora and Shikho follow in the second row; Truck Lagbe, Chaldal and Shohoz form the third.
Dorik, Arogga and iFarmer retain their approved covers below. Order stays stable as studies are
completed. Finished studies link directly to their articles.
Unwritten studies use "To be written" in the bottom CTA and link to their starting sources.
There is no duplicate status beside the company name. Readiness comes from the content manifest,
so a completed study automatically gets the reading link.
Reviewed marks come from the media registry. Full wordmarks for the covers are recorded in
`data/case-study-logos.json`, with the Startup 50 marks as the fallback. Official white artwork
keeps its original colour on a contrasting logo plate. A company name is used only where no
reviewed logo is available. Revora keeps the permanent `myalice` route.

Headings use the available width, aiming for two lines without truncation or narrow character-count
limits. The grid fits three columns when space allows, then two, then one. The full writing list
remains a native disclosure driven by the existing content manifest.

Inside a study, the original company-name H1 and complete body remain. A horizontal company banner,
a cited decision timeline and a highlighted existing decision passage add structure. Prose keeps
the normal article measure; neither titles nor explanations inherit the prototype's narrow widths.
The gallery and article additions are server-rendered and require no client JavaScript. Reduced
motion, visible keyboard focus, mobile wrapping and the printed article remain supported.

### Tools and Templates

The bilingual Tools hub uses six previews of the resources themselves: interview sheets,
a cash-timing chart, a hiring scorecard, a worked COD receipt, a sales message and data-room
folders. Each preview links to its existing guide or calculator. The paper, green, lavender,
salmon and ochre grounds belong to these previews; the surrounding page keeps the manual's
normal canvas, typography and navigation. Preview values and excerpts come from the linked
guides and are labelled as examples, never presented as the reader's own results.

The gallery uses two columns, then one when the content area becomes narrow. Titles use the
full card width and aim for two lines. Each whole card links to its resource; the preview,
title and description need no separate CTA or repeated subject labels. Six previews are easy to scan
directly, so the hub has no separate filter toolbar or resource-search island. The site-wide search
remains available.
The page title, Featured Resources and Browse by Task use the site's standard heading dividers.
The planned-topics disclosure retains its standard top and bottom rules.
Cards and the software link use space rather than rules; adjacent task rows retain their separators.
Lines inside the resource illustrations remain part of their artwork.

A compact link introduces the software guide. Below it, six native disclosures organize the
full resource catalogue by task. Each opens to a two-column list on desktop and a single column
on mobile. The lists remain in the static HTML and expand for printing. Usage instructions live
in the linked resources; the existing section index shows only its planned-topic disclosure,
avoiding a second listing of the software guide. Planned items must not imply that implementation
has started.

The entire hub is server-rendered and needs no page-specific client JavaScript. Readiness comes
from the content manifest. The public editor protects the layout tags and their category labels
while keeping the resource links and descriptions editable.

### Contributor record

The two recognition surfaces, `/contributors` and `/contributors/{slug}`, are set as a ruled
ledger rather than a scoreboard. The register is a book index: a quiet ordinal hanging in the left
margin, the name and its middot line of roles in the reading column, and one right-aligned numeric
column of accepted-work counts in tabular numerals, captioned once above the list and separated by
a single hairline drawn down the whole list rather than repeated per row. The profile is the same
idea turned on its side: a chronology whose acceptance dates hang in the margin against the same
continuous rule, with the work itself owning the reading column. One date, however many entries it
accepted; seven guides accepted the same day are one dateline, not the same date set seven times
down the margin.

Rank exists because public credit is the point, but it is never the row's headline number. The
count is, because the count is what is actually being measured, and the copy beside it says plainly
that the order is activity and not merit. On a profile the count is read as a figure in tabular
numerals beside the pages it reached, not buried mid-sentence in a meta line.

A profile answers three questions at three altitudes, and never the same one twice: the masthead
says who, the topic index says which parts of the guide exist because of this person, and the
chronology says when each piece landed and where its proof is. The topic index is a ruled list
borrowing the register's numeric column, one section a row, and it is what the chronology cannot
say on its own. The published pages under an entry are listed rather than collapsed behind a
count, because those pages are the record's whole substance; a disclosure there hid it. Hovering
or focusing an entry lights the ledger's own continuous rule green beside it rather than drawing a
second line next to it. Every profile closes on its own small print: the snapshot date, and the
route to correct or remove a naming.

There is no social-card block on the page. A picture of the card repeated the name and count directly
above it, out-shouted the record underneath, and cost the surface its only client component. The
generated card survives as the profile's `og:image`, which is where a shared link actually needs
it.

The social card is an editorial colophon, not a miniature profile. A full-height deep-green field
carries only the contributor's architectural monogram; the project mark sits beside the English
brand name in the warm-white masthead, where its green grid remains legible. That field also carries
the person's name, `CONTRIBUTOR`, up to three English role labels, and the stable profile URL. It has
no inset card, rounded frame, shadow, portrait, organization, count,
date, rank, badge, or other changing statistic. The image therefore stays useful when activity or
affiliation changes, while the profile page remains the complete evidence record.
Its raster-only palette uses Social Card Field (`#064e3b`), Social Card Identity (`#fbfaf7`) and
Social Card Monogram (`#f7f3e8`). These are documented output colors, not new interface tokens.
At 1200×630, its own raster type ramp is 78px for a short one-line name, up to 62px over two lines,
24px for the contributor label, 17–22px for roles, 18px for the URL, and 156px for the monogram.
Names keep a 32px floor; only the documented 180-character edge case receives bounded horizontal
compression to stay inside the 660px identity column.

Roles are a middot line, never bordered chips. Three type sizes carry a register row: name, meta,
count. Avatars keep the system's circles, and a monogram avatar takes the structure wash rather
than the near-white ground, so it carries the same weight as a photograph beside it.

### Guide byline

Every written guide keeps its short byline and verified or updated date after the article,
followed by a closed contribution-details disclosure containing the full `#credits` record.
Reading begins with the headline and guide content;
credit, freshness and contribution details remain available below it. Mistake reporting is
available in Page tools and the contribution footer. The byline and full record still use the
same committed contributor events.

The verb comes from the strongest role on the page, so an editor-only guide reads
`সম্পাদনা করেছেন` and never claims authorship. One or two people are named outright; past two the
lead holds the line and the remainder becomes a counted link down to the record, which is what
stops the line growing without limit on a phone. An adaptation states itself
(`X-এর লেখা অবলম্বনে`) and keeps stating itself after other people contribute. A guide with nobody
in the ledger names the team and links to the editorial policy, because a blank there cannot be
told apart from "not recorded". Stubs and non-guide pages carry no byline at all.

Contributor names are set in Reference Blue: they are links to a person, and looking like one is
most of why the line is worth adding. The visited violet is deliberately not extended here, because a person is not a guide you have read.
No avatars, no role chips: faces would mean a third-party request on every guide view, and a chip
would repeat what the verb already says at twice the width. The byline and date wrap naturally on narrow screens, below the reading content.

The byline, disclosure and footer links form one compact closing area, aligned to the article's
text measure with a single rule above it. Names are visible once until the reader opens the full
record. Edit, feedback and contribution links are plain underlined text with comfortable touch
targets; they do not need a separate heading or a row of bordered buttons.

The `#credits` target lives inside the native disclosure, so following the counted byline link
reveals the record without JavaScript. The summary takes the same `target-land` cue as the glossary.
The expanded record is one left-aligned column, with a shared date and source link for each accepted
change. Its labels use the reader's language: "added", "see the source", and "worked at". The full
record also remains available when printing.

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
- **Do** import feature styles from the component that uses them. Keep the shared shell and
  article styles in `app/globals.css`; editor and dialog styles load with their lazy components.
  Page-specific MDX widgets use explicit imports so their styles and scripts stay off other pages.

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
- **Don't** suppress a list marker with `list-style: none` alone. `html[lang='bn'] ol` sets
  `list-style-type` at a higher specificity, so the marker survives in Bangla only; add the list to
  that rule's `:not()` instead.
- **Don't** separate a Bengali numeral from its classifier. `৩টি` is one word, so a gap, a margin
  or a flex `gap` between the number and its unit is a spelling error, not spacing.
- **Don't** use an em dash in page content under `app/(contents)/`. Use an en dash, a comma, or two
  sentences; enforced by `npm run lint:bangla`.

### Review test

- [ ] The change helps trust, reading, navigation or contribution.
- [ ] It works at narrow mobile width and with keyboard navigation.
- [ ] Green still means structure and blue still means link.
- [ ] It reuses existing tokens and component language.
- [ ] It adds no unnecessary JavaScript, font or media weight.
- [ ] A new exception is explained by a user need, not visual novelty.
