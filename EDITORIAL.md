# Editorial Standards

This document says what a page must teach, how it must prove it, and how it must put the reader to
work. English is the canonical authoring edition; how the Bangla translation should sound lives in
[STYLE.md](./STYLE.md). The workflow and visual toolkit live in
[plan/guide-playbook.md](./plan/guide-playbook.md).

## The main test

A first-time founder reading the page should be able to answer three questions:

1. Does this apply to my situation?
2. What exactly do I do now?
3. Which facts can I trust, and where do I re-check?

Assume intelligence, not prior knowledge of law, accounting, tech, or startup vocabulary.

## Every guide stands alone

Readers usually land on a page straight from search, not after reading the ones before it. Each
page must work on its own. Standalone does not mean answering every question; it means the reader
can do the job or make the decision they came for without opening another link.

A finished guide has four layers:

1. **Orientation:** who it is for, who it is not for, what job or decision it serves, and what the
   reader will have at the end.
2. **Minimum mental model:** only the concepts this task needs, explained at first use. Any
   required background is recapped inline in a sentence or two.
3. **Execution:** what to prepare, the steps in order, a worked Bangladesh-specific example, costs
   and time, common mistakes, and honest uncertainty.
4. **Verification:** what "done" looks like — which document, portal state, or number should
   exist — plus a short checklist, sources, and the next safe action.

More rules:

- Links offer depth, exceptions, or the next task. Understanding the main answer must never
  require opening one.
- Open with the reader's situation, not the site's taxonomy. "Who needs this" should branch: "if
  you are in situation X, then →".
- Define every term at its first use on this page, even if another page defines it too.

Test: give the page to someone who has never seen the site, hide the navigation, and ask them to
do the task. If the main decision needs another internal page, the guide is not finished.

## Before drafting: the page brief

Write these down before the first draft. Review will be judged against them:

- Which search or question brings the reader here
- How much the reader knows at the start
- The page's single job
- What the reader will have at the end
- The most dangerous misunderstanding to prevent
- What evidence is needed
- Which visuals are candidates, and what each one teaches
- Which facts change quickly, and how often they must be re-checked

## Teaching hard concepts

For a concept that is hard or changes a decision, use these five steps where needed:

1. **Name:** the term people actually use.
2. **Plain meaning:** one sentence.
3. **Bangladesh example:** a familiar local situation.
4. **Maths or process:** show the money or the steps.
5. **Action:** what the reader does now.

Do not stretch every small fact into five steps. The harder or riskier the concept, the deeper the
explanation.

## Examples and stories

- Make examples visible with names, cities, products, and money.
- Mark a fictional scenario with "say" or "imagine"; cite a real event.
- When a decision rests on arithmetic, show the working.
- Keep a story only when it explains a rule, risk, or decision.
- Never present invented quotes, statistics, or events as real.

A good example shortens the explanation. After giving one, do not restate the same point three
ways.

## Law, tax, fees, and risk

Plain language must not shrink legal meaning.

- State the rule first, then what it means for the reader and what to do.
- Say which person, company, area, or period the rule covers.
- Use official primary sources; never prove a government claim with a blog.
- Date fees, limits, forms, and deadlines, or set `verified:`.
- Where official information is vague or varies by office, state the range and the uncertainty.
- Drop or mark unverified claims as "needs verification".
- Say when professional help is needed for contracts, ownership, tax, foreign exchange, or large
  financial risk.
- Use `<ExpertReview>` only when an expert really reviewed the page, the scope and date are
  recorded, and the reviewer agreed to be named. Do not use the box as a template.

Never bump `verified:` without re-checking the page against official sources.

## Sources

The stronger the claim, the stronger and closer the source.

Priority:

1. Laws, gazettes, regulators, and official portals
2. Primary reports, datasets, and recognised research
3. Reliable news or specialist publications
4. Company information, labelled as "company's claim"
5. Founder statements, as experience

More rules:

- Take general source-list URLs from [plan/sources.csv](./plan/sources.csv).
- Give an exact, checked report or page URL when a specific number or decision needs one.
- Never blend a company's promotional figures with independent data.
- Keep facts, anecdotes, and hypotheses separate.
- Teach third-party material in your own words and cite it; do not copy or wholesale-translate
  long passages.
- Never hide a source inside an image; repeat it in readable text.

## What a useful page contains

A general guide gives the reader:

- who needs it and when
- where to go or which portal to use
- what papers or information to prepare
- step-by-step actions
- costs and time, dated where they change
- decision conditions or comparisons
- common mistakes
- a short closing checklist
- relevant sources

Do not force identical headings on every page. Templates, journeys, case studies, calculators,
and directories keep the smaller structure their job needs.

**In short** is the page's compact answer, not an introduction: the decision, the big warning, and
the next action. The body must not simply repeat it.

## Highlight boxes

A fixed set of boxes separates the important moments so a scanning reader finds them:

- **Warning:** where a mistake costs money or worse
- **Rule:** the rule first, then what it means for you
- **Common mistakes:** what to avoid
- **Example:** a concrete scenario, marked imaginary when it is
- **Keep in mind:** a rule of thumb or a time-saving decision

Use boxes sparingly. If everything is highlighted, nothing is.

## Visuals, charts, and calculators

A visual is a second channel for the same message, not decoration. Add one when it removes the
reader's biggest remaining confusion faster than prose or a small table. A chart never repairs
weak evidence; it makes weak evidence look stronger. Fix the evidence first, then the visual.

Which visual when:

| Reader's difficulty | Best start | Example |
|---|---|---|
| "Which path applies to me?" | decision tree | full VAT registration vs turnover tax |
| "What happens in what order?" | process diagram or timeline | name clearance → documents → submission → certificate |
| "Where do I click, and what do I see?" | annotated screenshot | RJSC application or query screen |
| "How do the options differ?" | comparison table | sole proprietorship vs private limited |
| "How does one number affect another?" | chart | margin vs break-even return rate |
| "How do I work out my situation?" | worked example, then calculator | unit economics |
| "What does good behaviour sound like?" | short video or role-play | good vs leading interview questions |
| Nothing is hard to imagine | text only | a short definition or checklist |

### Charts

A chart's one job is answering one question faster than prose.

- Put the finding in the title: "cheap products break even at far lower return rates", not "RTO
  chart".
- State the takeaway in text above or below.
- Show units, dates, base, definitions, assumptions, and sources.
- Label directly; skip legends and decoration.
- No data, no chart; never build one from a single isolated statistic.
- Never dual axes or 3D.
- Design at 360 px first. Bars start at zero, labels stay horizontal, long names get horizontal
  bars. At most 5–7 bars and 4 lines.
- Keep the numbers in a table too, so screen readers, slow connections, and blocked images still
  get the full meaning.
- Keep the data and the calculation so the chart can be regenerated.

### Screenshots

Screenshots teach recognition and navigation, not procedure.

- One screenshot, one action. A wide orientation shot first, then readable crops.
- Mark the control under discussion with a number or outline.
- Put the instruction beside the screenshot, not paragraphs away.
- Keep the portal's exact English label; explain it in plain words.
- Show error and completion states, not only the happy path.
- Use dummy data; redact personal information.
- Add source and checked dates, and a rule for replacing the image when the interface changes.

### Tables

- Tables are for exact comparison, not sequential instructions.
- Usually two to four meaningful columns.
- Units and dates go in column headers.
- Split tables that answer more than one question.
- Put the decision takeaway in prose; never make the reader infer it from twenty cells.
- Test every table at 320 px and at large text size.

### Worked examples, templates, and calculators

Show one complete worked example before asking the reader to do their own. Every quantitative
guide offers:

1. a Bangladesh-specific scenario
2. inputs and their sources
3. the visible formula
4. the intermediate steps
5. the result
6. which decision the result changes
7. a blank, copy-ready version

Start with a table or worksheet. Build an interactive calculator only when the page's whole job is
the reader's own calculation — and keep it a small client island: the server renders the worked
example as static HTML, and JavaScript only enables editing. Write the inputs, formula,
assumptions, units, and limits; default the numbers to a real Bangladesh example; never present
the result as a guarantee.

### Video

Video earns its place when the movement itself is the message: a screen walkthrough, a demo, a
role-play, pronunciation, or a story where sequence and human behaviour matter.

- One video, one job.
- Keep the key answer and steps in text; the page must survive the video disappearing.
- Title, thumbnail, upload or check date, and caption.
- Human-checked subtitles and a descriptive transcript; automatic captions alone are not enough.
- Original Bangla video gets English subtitles or a transcript, not a second production.
- Describe the scene in the narration: which field, graph, or action is visible.
- Never autoplay.
- Third-party video starts at the relevant moment and says why that segment is included.

### The media brief

Before adding any image, chart, or video, record:

- which confusion it removes
- why text or a table is not enough
- source and rights
- caption and text alternative
- how each locale will treat it
- check date
- what happens on mobile and slow connections
- what event should trigger replacing it

### Media in two languages

- Share one dataset and concept across locales.
- Translate captions, transcripts, descriptions, and chart labels.
- Annotate screenshots with numbers so one clean image serves both languages.
- Preserve exact official portal terminology.
- Do not bake long text into raster images.

## Page-type rules

- **Case study:** follow [plan/case-study-format.md](./plan/case-study-format.md). Separate what
  is known, who claims it, and what is unknown.
- **Journey:** orders existing guides only. Every step has a clear outcome.
- **Directory:** structured data in `data/directory/`, never a prose table. Every entry carries a
  source URL and last-verified date.
- **Template/script:** copy-ready material first, explanation after.
- **Stub:** `<StubNotice />` and starting sources only — no full-guide boilerplate.

## Does the writing work

Written, built, and attractive is not finished. Have a cold reader attempt the real task and
record where they stop, decide wrongly, skip steps, or misread a visual. Rewrite those places.

## Before submitting

- [ ] A first-time reader knows who the answer is for
- [ ] The main answer and next action work without opening a link
- [ ] Hard concepts have plain meanings and useful examples
- [ ] The action says where, what to prepare, cost, and time
- [ ] Arithmetic behind decisions is shown
- [ ] Laws, fees, limits, and numbers have strong sources
- [ ] Uncertainty, company claims, and experience are labelled
- [ ] No invented facts, quotes, or statistics
- [ ] No unnecessary stories, repetition, or visuals
- [ ] Every chart or image has a one-line "what it shows" and the numbers in a table
- [ ] Charts survive mobile width; screenshots hide personal data and carry source and check dates
- [ ] The reader has a clear next action
- [ ] The Bangla edition, once translated, passes STYLE.md's checklist

### Five gates before calling it done

A guide is finished when all five gates open. A broken gate cannot be bought off with good visuals
or nice prose.

1. **Cold entry:** a new reader can name the scope, applicability, outcome, and first action.
2. **Task:** the decision or task completes without browsing other pages.
3. **Trust:** consequential claims are sourced, dated, scoped, and honest about uncertainty.
4. **Media:** every visual removes a named confusion, and the page survives without images or
   sound.
5. **Reality:** at least a few target readers have attempted the task on an ordinary phone.

Measure task completion, dangerous mistakes, time to first useful action, recognising "done", and
confidence versus correctness. Pageviews, dwell time, and video plays are secondary — longer time
on a page often just means more confusion.
