---
name: Deshi Startup
description: A Bangla-first, Wikipedia-grade reference work for building a startup in Bangladesh
colors:
  page: "#f5f3ee"
  canvas: "#ffffff"
  canvas-soft: "#f8faf9"
  ink: "#202122"
  muted: "#54595d"
  faint: "#696e74"
  line: "#c8ccd1"
  line-soft: "#eaecf0"
  green: "#047857"
  green-deep: "#065f46"
  green-soft: "#eaf4ef"
  green-ground: "#f8fbf7"
  blue: "#3366cc"
  blue-hover: "#1f4fb2"
  visited: "#6b4ba1"
  yellow: "#f7c948"
  warn-bg: "#fff8df"
  warn-border: "#e1b900"
  warn-line-soft: "#e5d193"
  warn-ink: "#5f4b00"
  error: "#b42318"
  line-warm: "#d9d5cd"
  shade: "#f1f3f4"
typography:
  display:
    fontFamily: "Noto Serif Bengali, Noto Serif, Georgia, serif"
    fontSize: "clamp(2.1rem, 3vw, 3.2rem)"
    fontWeight: 700
    lineHeight: 1.3
    letterSpacing: "0"
  headline:
    fontFamily: "Noto Serif Bengali, Noto Serif, Georgia, serif"
    fontSize: "1.55rem"
    fontWeight: 700
    lineHeight: 1.25
  title:
    fontFamily: ".SF Bangla, system-ui, Noto Sans Bengali, sans-serif"
    fontSize: "1.08rem"
    fontWeight: 700
    lineHeight: 1.25
  body:
    fontFamily: ".SF Bangla, system-ui, Noto Sans Bengali, sans-serif"
    fontSize: "16px"
    fontWeight: 400
    lineHeight: 1.72
    letterSpacing: "0"
  label:
    fontFamily: ".SF Bangla, system-ui, Noto Sans Bengali, sans-serif"
    fontSize: "0.82rem"
    fontWeight: 700
    lineHeight: 1.2
  mono:
    fontFamily: "SFMono-Regular, Consolas, Liberation Mono, monospace"
    fontSize: "0.92em"
  # The enumerated ramp. Dense reference UI needs more steps than the five named
  # roles above, but every step must be distinguishable: nothing sits within
  # 0.04rem of its neighbour, which is what a hand-set ramp looks like.
  scale:
    display: "clamp(2.1rem, 3vw, 3.2rem)"
    display-narrow: "2.05rem"
    headline: "1.55rem"
    wordmark: "1.25rem"
    infobox-bar: "1.12rem"
    title: "1.08rem"
    base: "16px"
    notice: "1rem"
    sm: "0.95rem"
    xs: "0.9rem"
    meta: "0.85rem"
    label: "0.82rem"
    chip: "0.68rem"
    toggle: "10px"
rounded:
  sm: "3px"
  md: "4px"
  pill: "999px"
spacing:
  xs: "8px"
  sm: "12px"
  md: "18px"
  lg: "28px"
  xl: "48px"
components:
  search-input:
    backgroundColor: "#ffffff"
    textColor: "{colors.ink}"
    rounded: "{rounded.sm}"
    padding: "12px 16px"
  button-directory:
    backgroundColor: "{colors.canvas}"
    textColor: "{colors.green-deep}"
    rounded: "{rounded.sm}"
    padding: "6px 12px"
  button-directory-hover:
    backgroundColor: "{colors.green-ground}"
    textColor: "{colors.green-deep}"
  button-start-primary:
    backgroundColor: "{colors.green-ground}"
    textColor: "{colors.green-deep}"
    rounded: "{rounded.sm}"
    padding: "10px 18px"
  contrib-link:
    backgroundColor: "{colors.canvas}"
    textColor: "{colors.ink}"
    rounded: "{rounded.sm}"
    padding: "7px 14px"
  contrib-link-hover:
    backgroundColor: "{colors.green-soft}"
    textColor: "{colors.green-deep}"
  chip:
    backgroundColor: "{colors.canvas-soft}"
    textColor: "{colors.muted}"
    rounded: "{rounded.pill}"
    padding: "3px 12px"
  infobox-title:
    backgroundColor: "{colors.green-deep}"
    textColor: "#ffffff"
    padding: "14px 16px"
  tab-active:
    backgroundColor: "{colors.canvas}"
    textColor: "{colors.ink}"
---

# Design System: Deshi Startup

> **How to read this document.** Everything here is a reasoned default, not a ruling. It exists so
> contributions cohere and so nobody re-derives settled questions on every PR – not to put the design
> beyond argument. Nothing in it is permanently off the table. If a choice here is wrong, or was right
> in July 2026 and is not right now, say so: an issue or PR with the reasoning and a rendered
> before/after is exactly how this file is meant to change.
>
> The one thing that is not a matter of taste is what the design is *for*. A first-time,
> non-technical founder, on a mid-range Android phone, on patchy bandwidth, has to trust this page and
> be able to read it fast. Weigh proposals against that. A change that serves it wins, however far it
> departs from what is written below.

## Overview

**Creative North Star: "The National Reference Work"**

Deshi Startup looks like the reference book Bangladesh never printed for its founders: a warm-paper
encyclopedia page carrying a white reading canvas, ruled at the top in deep Bangladesh green, with
serif Bangla headings that give the page the gravity of a standard work rather than a blog. The
Wikipedia lineage is deliberate and load-bearing. Trust is the product's moat, and the interface
earns it the way a good encyclopedia does: by receding. Nothing performs. The chrome is hairline
borders and quiet grays; the color budget is spent only where it means something.

The system runs on a strict division of labor between two accents. Green is *structure* – the top
rule, active navigation, hover washes, the infobox header, section badges. Blue is *language* –
links, and only links. That single discipline is most of why the site reads as calm and
authoritative instead of busy. Depth is nearly flat: surfaces sit inside 1px rules, and one soft
shadow lifts only the reading canvas and floating search results off the paper. Corners are square
or barely eased (3px); the only true curves are pill toggles. Asides are bounded by hairline rules and
named by a label, never by a colored bar down one edge.

It is built for a first-time, non-technical founder reading on a mid-range Android phone on patchy
bandwidth. So the aesthetic is inseparable from the engineering: self-hosted Bengali fonts that most
devices never download, near-zero JavaScript, Bengali numerals, and a layout that collapses cleanly
to a single column with a drawer sidebar. Legibility and speed are the design, not a constraint on
it.

**Key Characteristics:**
- Warm paper page framing a bordered white reading canvas with a deep-green top rule
- Two-accent discipline: green for structure, blue for links, nothing else competing
- Serif Bangla display headings over a system-sans body; encyclopedic, not editorial-flashy
- Flat by default: hairline borders do the work; one soft shadow, used twice
- Square-cornered geometry with pills reserved for toggles and count chips; no circles
- Mobile-first and near-zero-JS; the visual language is also a performance budget

## Colors

A restrained, paper-and-ink palette with a single green identity accent, a wiki-blue link color, and
a warm yellow used only for cautions and toggles.

### Primary
- **Bangladesh Emerald** (`#047857`, `--green`): the identity accent and structural green. Top-of-tab
  rules, the green top border of the reading canvas (in its deeper sibling), checkbox accent,
  hover-state borders on cards. This is the color that says "Bangladesh" without a flag.
- **Deep Deshi Green** (`#065f46`, `--green-deep`): the darker, higher-contrast structural green. The
  5px canvas top rule, active sidebar links, the infobox title bar, section-stat numerals, and any
  green text that must clear contrast on white.
- **Green Wash** (`#eaf4ef`, `--green-soft`): the hover/selected tint. Search results, sidebar and
  FAQ hover, path-row hover, contribution-link hover. Green's quietest register.

### Secondary
- **Wiki Link Blue** (`#3366cc`, `--blue`): hyperlinks, and nothing but hyperlinks. The most familiar
  "this is clickable" signal on the web, kept exactly where readers expect it.
- **Deep Link Blue** (`#1f4fb2`, `--blue-hover`): link hover, with underline.
- **Read-Link Violet** (`#6b4ba1`, `--visited`): visited in-article links **and visited guide links in
  the generated section indexes and "recently updated" list**, so a founder returning to a topic can
  see which guides they have already read. Stub links are excluded – they keep their muted dashed
  treatment, because "visited" there would falsely read as "finished". It lets a founder see how
  far they have read through a topic. A genuine encyclopedia affordance.

### Tertiary
- **Marker Yellow** (`#f7c948`, `--yellow`): the highlighter accent. The language-switcher thumb and
  small emphasis moments. Warm, human, sparing.
- **Notice Cream / Gold / Brown** (`#fff8df` / `#e1b900` / `#5f4b00`, `--warn-bg` / `--warn-border` /
  `--warn-ink`): the caution family for stub notices and the homepage "still being written" banner.
  Reads as an editorial margin note, not an error.

### Neutral
- **Warm Paper** (`#f5f3ee`, `--page`): the body/page background. The "book page" the canvas rests on.
- **Reading White** (`#ffffff`, `--canvas`): the content canvas and every reading surface.
- **Cool Paper** (`#f8faf9`, `--canvas-soft`): soft insets – blockquotes, TOC, stat pills, card wells.
- **Manuscript Ink** (`#202122`, `--ink`): primary body text and headings.
- **Slate Gray** (`#54595d`, `--muted`): secondary text, captions, sidebar group labels.
- **Meta Gray** (`#696e74`, `--faint`): tertiary metadata – dates, breadcrumbs, footnote-weight text.
  Dark enough to clear AA on Warm Paper (4.64:1), not only on Reading White, because the sidebar note
  and footer legal line sit on the paper.
- **Fault Red** (`#b42318`): the single error ink, used only for a failed search. It is not part of the
  accent system and never appears as a fill, border, or badge.
- **Hairline Gray** (`#c8ccd1`, `--line`): the primary border and divider. The workhorse of the whole
  flat system.
- **Whisper Line** (`#eaecf0`, `--line-soft`): the softest divider, between list rows and inside cards.

### Named Rules
**The Two-Accent Rule.** Green is structure; blue is links. A link is never green and a structural
element (rule, tab, active state, badge) is never blue. If a new element needs a third color, it
almost always wants a neutral or a hairline instead.

**The Frugal-Yellow Rule.** Yellow appears only on cautions (the notice family) and the one toggle
thumb. It is never a decoration or a general highlight; its scarcity is what keeps a stub banner
readable as "unfinished," not "broken."

## Typography

**Display Font:** Noto Serif Bengali 700 (with Noto Serif, Georgia, serif)
**Body Font:** `.SF Bangla` / system-ui stack, with self-hosted Noto Sans Bengali as the cross-device
fallback (`--sans`)
**Mono Font:** SFMono-Regular, Consolas, monospace (inline code only)

**Character:** A Bengali serif for display and a system Bengali sans for reading. The serif gives
headings the weight of a printed reference; the system-sans body renders instantly and natively on
the Android phones most readers hold. Bold weights carry hierarchy; italics are essentially unused in
Bangla.

### Hierarchy
- **Display / h1** (serif, `clamp(2.1rem, 3vw, 3.2rem)`, weight 700, line-height 1.3): the page
  title, underlined by a hairline `border-bottom` – the encyclopedia entry heading.
- **Headline / h2** (serif, 1.55rem, weight 700, line-height 1.25): section headings, also
  hairline-underlined. On the homepage, some h2s switch to sans for a lighter "module" feel.
- **Title / h3** (sans, 1.08rem, weight 700): sub-sections, no underline.
- **Body** (sans, 16px, line-height 1.72): the reading measure. Generous leading for dense Bangla
  conjuncts; drops to 15px under 860px. Prose, headings and lists are capped at `--measure` (65rem);
  see The Measure Rule below.
- **Label** (sans, ~0.82–0.85rem, weight 700, Slate Gray): sidebar group headers, meta bar, stat
  pills, breadcrumb text. Never uppercased – Bangla has no case, and Latin labels stay sentence-case.
- **Brand wordmark** (sans, 1.25rem, weight 800): the header lockup title, the one place weight 800
  appears.

### Named Rules
**The Serif-Display Rule.** Serif is for display headings (h1, h2) and the infobox name only. Body,
UI, labels, and h3 are sans. The serif/sans switch is the primary signal of "this is a heading."

**The Hairline-Underline Rule.** h1 and h2 are separated from their content by a `--line`
`border-bottom`, not by size or space alone. It is the single most Wikipedia-defining type detail and
must survive any restyle of headings.

**The Measure Rule.** Prose blocks in `.article` (`p`, lists, `dl`, `blockquote`, `h1`–`h4`, the ToC)
are capped at `--measure` (65rem ≈ 1040px). The canvas has no right-hand rail, so on a wide monitor an
uncapped paragraph ran to ~86 Bangla characters a line and the eye lost its place on the return sweep;
the cap holds it near 73. It is a no-op at or below ~1500px. Headings are capped **with** the text so
their hairline underline ends on the same edge, and tables, `pre` and the generated indexes are
deliberately exempt – they need the full canvas.

## Layout

A centered two-column shell inside a `min(1660px, 100%)` container: a fixed **282px** left sidebar and
a fluid reading canvas. The sidebar navigation is `position: sticky` under the 96px header; the canvas
is bounded left and right by `--line` rules and topped by a 5px `--green-deep` rule, so the reading
area reads as a bordered sheet laid on the paper page.

Reading rhythm is set in explicit px, not a token scale: article padding is **48px** on desktop,
tightening to 32px (≤1180px) and 18px (≤860px). Vertical spacing keys off heading margins (h2 at
`34px` top) and a 1.72 body line-height. The homepage is its own grid: a `1fr / 360px` hero with a
right-rail infobox, a 4-up path grid, and 2-up scope/source grids, all collapsing progressively.

Responsive behavior is a genuine mobile-first collapse, not a shrink. At ≤860px the shell becomes a
single column, the header search drops to its own row, and the sidebar becomes a fixed off-canvas
drawer (`translateX(-104%)` → `0`) over a scrim. Article actions and the right-rail hide; the "on this
page" TOC becomes a `<details>` accordion that is itself hidden again ≥1024px on desktop.

## Elevation & Depth

Overwhelmingly **flat**. Depth comes from 1px `--line` borders and the layering of Warm Paper behind
Reading White, not from shadows. This is a defining choice: the encyclopedia feel depends on surfaces
sitting *in* the page, not floating above it.

### Shadow Vocabulary
- **Canvas Lift** (`box-shadow: 0 14px 32px rgb(32 33 34 / 8%)`, `--shadow`): a single soft ambient
  shadow, used in exactly two places – under the reading canvas (desktop) and under the floating
  search-results popover. Removed on mobile, where the canvas goes edge-to-edge.
- **Drawer Shadow** (`12px 0 40px rgb(32 33 34 / 20%)`): a heavier shadow reserved for the mobile
  sidebar drawer, the one true overlay in the system.

### Named Rules
**The One-Shadow Rule.** The ambient `--shadow` lifts only the reading canvas and the search popover.
Cards, infoboxes, tables, notices, and buttons are flat with borders. New surfaces default to a
hairline border, never a shadow.

## Shapes

Squared and orthogonal. Most surfaces – cards, tables, notices, the infobox, inputs, the canvas
itself – have **no radius**, edged by `--line`. Interactive fields and inline code take a barely-there
**3px** radius; a few internal buttons/results use **4px**. The only real curves are **999px pills**
(the language toggle, stat and directory-summary chips, the stub chip). There are no circles.

### Named Rules
**The Rule-and-Label Rule** *(revised 2026-07-25; supersedes the "margin rule" motif)*. An aside is
bounded by **hairline rules and named by a label**, never by a thick colored bar down one edge. The
`সারকথা` summary block takes a 1px `--line` rule above and below with no fill, so the bold `সারকথা:`
lead-in does the naming; the caution family (stub notice, homepage notice) keeps its Notice Cream
ground and 1px gold hairline and names itself with a bold heading line.

*Why it changed.* The previous motif was a 5–6px green or gold `border-left` on five block types. It
was reasoned as a print margin rule, but at that weight it is the single most recognizable signature
of machine-generated UI, and it was doing decorative work the label and ground already did. Rules and
a label are what a printed reference work actually uses. Colored `border-left` above 1px is now out of
the vocabulary; if a block needs to announce itself, give it a label.

## Components

### Buttons
The site is link-driven; true buttons are utilitarian and quiet.
- **Shape:** square to 3px radius; bordered, never filled with a loud color.
- **Homepage start pair** (`.wiki-start`): the one ranked pair of actions on the site. The primary is
  distinguished by a Green Ground fill, a `--green-deep` border, weight 700 and a trailing `→` that
  steps 3px on hover; the secondary is an ordinary bordered chip. Rank is carried by ground, rule and
  the arrow – never by a saturated fill.
- **Directory action** (`.directory-controls button`): white background, Deep Deshi Green text,
  `--line` border, `6px 12px`. **Hover:** border → green-deep, background → Green Ground.
- **Search submit:** a square-capped grid cell joined to the input (`3px` outer corners only), light
  `#f8f9fa` fill, Green Wash on hover.
- **Contribution link** (`contrib-link`): bordered chip-links ("edit", "history", "report a mistake"),
  `7px 14px`, 3px radius. **Hover:** Green Wash fill, green-deep border and text.

### Chips
- **Style:** Cool Paper fill, Slate Gray text, `--line` border, fully pill (999px), `3px 12px`.
- **Variants:** section-stat pills (with a green-deep bold count), the directory result-count summary,
  and the amber **stub chip** (Notice Cream fill, gold border, Notice Brown text) that flags
  unwritten links.

### Cards / Containers
- **Corner Style:** square (no radius).
- **Background:** Reading White on the paper page.
- **Shadow Strategy:** none – flat with a `--line` border (see The One-Shadow Rule).
- **Border:** 1px `--line`; hover lifts the border to Bangladesh Emerald on interactive path/scope
  cards (no shadow, no lift).
- **Internal Padding:** 18px; path cards hold a `178px` min-height so a grid row stays even.

### Inputs / Fields
- **Style:** white fill, `--line` stroke, 3px radius.
- **Focus:** border → Bangladesh Emerald with an `inset 0 0 0 1px` green ring (search); directory
  controls use a `color-mix` green outline. Focus is a green tightening, never a blue glow.

### Navigation
- **Header:** sticky, translucent white (`92%`) with a 14px backdrop blur and a `--line` bottom border;
  brand lockup, search, GitHub link, and the yellow-thumbed language toggle.
- **Sidebar:** sticky grouped link list; group labels are Slate Gray 700 labels over a hairline;
  **active link** is Deep Deshi Green, weight 700. Collapses to an off-canvas drawer on mobile.
- **Article tabs:** Wikipedia-style tab row. It *looks* like tabs but is a labelled `<nav>` of ordinary
  links; the current page is a `<span aria-current="page">`, never a button, because there is no tab
  panel to switch. The **active tab** carries a 3px green top border and sits on the canvas, inactive
  tabs are borderless Slate Gray.
- **Breadcrumbs:** Meta Gray, `›` separators, links darken to blue on hover.

### Infobox (signature component)
The right-rail **wiki-infobox** is the system's signature: a bordered white card with a centered
**Deep Deshi Green** title bar in white sans, a 112px logo, a serif name, and a `<dl>` of
label/value rows split on hairline `--line-soft` dividers. It is the encyclopedia "fact box," and it
anchors the homepage hero and topic pages.

### Stub Notice (signature component)
A first-class content state, not an afterthought: a Notice Cream banner with a 1px gold hairline,
Notice Brown text, telling the reader the page is an honest stub and inviting a contribution. Its
existence in the design system reflects that most pages are stubs by design.

## Do's and Don'ts

### Do:
- **Do** frame reading surfaces as Reading White (`#ffffff`) on Warm Paper (`#f5f3ee`), bounded by
  `--line`, with the `--green-deep` top rule intact. That framing is the brand.
- **Do** keep the Two-Accent Rule: green for structure, `--blue` for links only.
- **Do** underline h1/h2 with a `--line` `border-bottom` and set them in Noto Serif Bengali 700.
- **Do** mark links that leave the site with the trailing `↗` on `.article a[href^="http"]`. Most of them
  are government portals, and a founder should know the tab is about to change.
- **Do** convey depth with hairline borders and paper/canvas layering; reserve `--shadow` for the
  canvas and the search popover only.
- **Do** use Bengali numerals (০–৯) in Bangla UI and render dates via `toLocaleDateString('bn-BD')`.
- **Do** keep new interactive elements square or 3px, and reserve pills (999px) for toggles and
  count/stat chips.
- **Do** bound a new aside with hairline rules and a bold label (The Rule-and-Label Rule), and cap new
  prose at `--measure` (The Measure Rule).
- **Do** let a grid's last row fill: when the item count leaves a remainder, the final card spans the
  row (`:last-child:nth-child(4n + 1)`) and lays out across it. A lone card in a four-wide row reads as
  an accident, and a magic `min-height` to even the rows is not the fix.
- **Do** respect the near-zero-JS budget: self-hosted Bengali fonts, no render-blocking Google Fonts,
  no heavy embeds. The look must not cost the founder bandwidth.

### Don't:
- **Don't** restyle the wiki shell as a side effect of another task – the paper page, bordered white
  canvas, green top rule, and absent right-hand ToC rail carry the reference-work credibility this
  project runs on. Proposing a change to them on purpose, with reasoning, is welcome and always has
  been; drifting away from them while fixing something else is what this rule is against.
- **Don't** fill buttons, cards, or notices with a saturated brand color, or add drop shadows to make
  things "pop." Flat-with-borders is the system.
- **Don't** put a colored `border-left`/`border-right` above 1px on a card, callout, notice or list row.
  It is the most recognizable machine-generated-UI signature there is, and the label and ground already
  do that work – see The Rule-and-Label Rule.
- **Don't** set a letter or digit inside a colored circle as an icon, and don't reach for `<em>` or
  `<b>` as a styling hook (an `em` carrying `font-style: normal` is the giveaway). Name the element for
  what it is and style the class.
- **Don't** leave a `font-size` off the `typography.scale` ramp, or a raw hex outside the `colors`
  block. Five sizes inside 0.05rem of each other is drift, not a system.
- **Don't** introduce a Google-Font display face or a second serif; the Bengali serif/sans pair is the
  whole type system.
- **Don't** color a link green or a structural element blue.
- **Don't** use an em dash in page content under `app/(contents)/` (use an en dash, comma, or two
  sentences) – enforced by `npm run lint:bangla`.
- **Don't** spend yellow on decoration; it belongs to cautions and the one toggle thumb.
