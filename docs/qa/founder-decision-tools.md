# Founder decision tools: editorial briefs and QA

Scope: three new bilingual guides and additive improvements to two existing guides. Existing contributor prose is preserved. Proposed for QA, not certified as cold-reader tested.

| Route | Reader question / starting knowledge | Single job and output | Dangerous misunderstanding | Visual and evidence brief |
|---|---|---|---|---|
| metrics/startup-analytics | First product or manual service; no tracking plan | Define collection rules and export a four-week measurement plan | Clicks equal fulfilled value, or every event should contain personal data | Four-week timeline plus event table; Twilio primary docs support tracking-plan practice; example and template are original |
| metrics/discount-retention | Has orders and promotion costs | Compare equal-window repeat behaviour and contribution; export assumptions/results | Observational differences prove promotion incrementality | Static retention bars with exact table plus interactive scenario calculator; NIST randomized-design reference supports causal caution |
| b2b/sme-sales | Founder selling to businesses | Track accounts through scoped offer, contract, invoice and matched cash | Signed or invoiced means paid, or a tiny funnel forecasts reliably | Static account/cash table; interactive nested-cohort funnel; preserves existing sources |
| validation/mvp-experiment-planner | Can run a small demand test | Apply pre-set thresholds, completion and guardrails; export decision record | A rule passing proves statistical significance or permits ignoring a serious failure | Four-outcome decision table and interactive rule checker; original decision example |
| product/ai-feature-evaluation | Considering a narrow AI extraction feature | Test with synthetic labelled cases and estimate cost per correctly completed task | High average accuracy or cheap tokens makes the workflow safe/profitable | Downloadable JSON cases; static exact cost table and interactive cost bars; NIST AI RMF supports evaluation and monitoring |

All numbers are explicitly synthetic teaching inputs, not Bangladesh market benchmarks or provider prices. Amounts are BDT; sample sizes do not establish population estimates. New guides cite sources checked 2026-10-21. Recheck external methods/docs when materially changed; no rapidly changing provider fees or legal rules are asserted. Model/prompt/rubric changes trigger a new evaluation version.

## Interaction contracts

- Page-local state only. No API calls, storage or analytics of entered values.
- Download plain UTF-8 Markdown; evaluation dataset is synthetic JSON. No spreadsheet formula execution.
- Invalid, blank, non-finite, negative, impossible nested counts and out-of-range percentages must not yield plausible results.
- Zero successful AI tasks has undefined cost per success, not zero; zero paid B2B accounts has no usable contact forecast.
- Discount outputs are contribution before fixed costs, for a fixed complete window; comparison is not causal uplift. Repeat frequency means additional orders among returners.
- Experiment guardrail failure pauses the test; incomplete observations cannot produce proceed/stop conclusions from the primary count.
- No chart-only information. Defaults server-render, result tables and prose remain; inputs are disabled until hydration so no-JavaScript readers cannot edit values beside stale results. Interactive changes require JavaScript.
- Page-specific imports preserve code splitting. Shared styles use existing theme tokens, keyboard focus, accessible labels and responsive grids.

## Required human QA before merge

- Have target founders use each tool on an ordinary phone (320/360 px); record misunderstandings, time to first useful action and their resulting decision.
- Native Bangla editorial review, particularly technical terms and numeric-input expectations. The named translate-bangla-guide/deshi-bangla skills were not available in this environment; translation follows checked-in STYLE.md and preserves examples/citations.
- Check keyboard/range controls, screen-reader verdicts, enlarged text, dark mode, downloads, and no-JavaScript reading.
- Review every model assumption and verify that users understand scenario results versus evidence.

Automated and browser verification results belong in the PR description. A green build is not a substitute for the human reality gate in EDITORIAL.md.

## Follow-up hardening

- Reject missing required numeric inputs explicitly, overflow in the full-repeat contribution denominator, and B2B forecasts outside JavaScript's safe integer range. These must not display a plausible result.
- Require actual booleans for experiment completion and guardrail gates; strings such as `"false"` cannot qualify as completed observation.
- Keep static example results and worksheet downloads available without JavaScript, with calculator inputs disabled until hydration.
- Browser installation was retried but the Chromium download failed. Interactive browser and human cold-reader checks remain outstanding; neither is claimed as passed.
