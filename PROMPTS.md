# PROMPTS — how to turn a BRD into a working click-through app

These are the **exact prompts** that produced `prototype/` and `prototype-v2/` in
this repo. Nothing here is idealised after the fact — copy them out of
[`iteration/`](./iteration) and you'll find the same text at the top of each
transcript.

You need Copilot and a folder. You do not need to write code.

---

## Prompt 1 — build the app from the BRD

Run this from the repo root with the BRD already in `brd/`.

```text
Read the business requirements document at brd/terravale-field-hazard-report-brd.html.
Build a working click-through prototype that satisfies every requirement REQ-001 to
REQ-008 and every business rule BR-01 to BR-05 in it. Put it in a new folder called
prototype, as index.html plus prototype.css plus app.js. Requirements: it must run
straight from the filesystem by double-clicking index.html, with no server, no
framework, no library, no build step and no CDN. Use the existing Terravale design
system stylesheet at assets/screens.css exactly as it is - link to it, reuse its
existing classes and CSS variables, and do not modify that file. Present the journey
inside a 390x844 phone frame centred on the page. This is a mining site safety tool
used in gloves and direct sunlight, so keep tap targets large and contrast high. On
every screen section add a data-req attribute listing the requirement references that
screen satisfies, and show a small trace strip under the phone that reads the current
screen data-req live, plus a toggle that labels the requirement references on the
screen itself. Verify your work in a real browser before you finish.
```

**Result:** 24 min 11 sec. Three files. It wrote and ran **135 browser checks**
against its own output, and fixed four real defects before finishing — including
an `aria-disabled` submit button that meant the app could never explain *why* it
was blocked.

### Why each clause is there

| Clause | What it buys you |
|---|---|
| *"Read the business requirements document at …"* | The BRD is the **input**, not a summary you retyped. Point at the file. |
| *"satisfies every requirement REQ-001 to REQ-008 and every business rule BR-01 to BR-05"* | Names the contract explicitly, so nothing quietly gets skipped. |
| *"run straight from the filesystem … no server, no framework, no build step, no CDN"* | The single most valuable constraint. It means **anyone** can open it — on a locked-down laptop, with no install, forever. |
| *"Use the existing design system … exactly as it is … do not modify that file"* | Output looks like your product instead of a generic form. |
| *"inside a 390x844 phone frame"* | Stops it building a desktop web page when the journey is mobile. |
| *"gloves and direct sunlight … tap targets large and contrast high"* | Real-world context changes real design decisions. Lift this straight from your BRD's brand section. |
| *"add a data-req attribute … trace strip … toggle"* | **The BA superpower.** Every screen declares which requirements it meets, so you can check the build against your own acceptance criteria. |
| *"Verify your work in a real browser before you finish"* | **Do not skip this line.** It is the difference between a first draft and something that has been tested. It's what caught all four defects. |

---

## Prompt 2 — change the BRD, and let the app follow

Revise the document first: bump the version, add the new requirement and rule,
and mark what changed. Then:

```text
The business requirements document has been revised. Compare
brd/terravale-field-hazard-report-brd.html (v1.0) with
brd/terravale-field-hazard-report-brd-v1.1.html (v1.1) and identify what changed. Copy
the prototype folder to a new folder called prototype-v2, then update prototype-v2 so
it satisfies the revised document, including the newly added requirement and business
rule. Keep everything else exactly as it is: same visual style, reuse
assets/screens.css unmodified, no framework, library, build step or CDN, and it must
still run straight from the filesystem. This is a mining site safety tool used in
gloves and direct sunlight, so keep tap targets large and contrast high. Keep the
data-req traceability attributes and the trace strip accurate and up to date for any
screen you change, and update the BRD version reference shown on the page to match the
revised document. Do not modify the original prototype folder or either BRD. Verify
your work in a real browser before you finish, and remove any scratch folders you
create.
```

**Result:** 24 min 47 sec. It diffed the two documents, worked out that v1.1 added
**REQ-009** and **BR-06**, and gave risk rating its own screen with glove-sized
option cards. 61 checks, and it caught a 102px overflow on the escalated review
screen and reworked the layout rather than shipping something clipped.

### Why each clause is there

| Clause | What it buys you |
|---|---|
| *"Compare v1.0 with v1.1 and identify what changed"* | **This is the whole idea.** You describe the change in the document you already own; it works out the code implications. |
| *"Copy the prototype folder to a new folder"* | You keep the version everyone already signed off. Nothing is overwritten. |
| *"Keep everything else exactly as it is"* | Stops unrelated drift, so the diff is reviewable. |
| *"Keep the data-req … accurate and up to date"* | Traceability survives the change instead of rotting. |
| *"Do not modify the original prototype folder or either BRD"* | Explicit guard rails. Cheap to write, saves a bad afternoon. |
| *"remove any scratch folders you create"* | Leaves the repo clean. |

---

## Adapt it to your own BRD

**This template is battle-tested.** It was run repeatedly against
[BRD v1.1](./brd/terravale-field-hazard-report-brd-v1.1.html) from a clean folder
containing nothing but the BRD and a stylesheet — see
[Battle test](#battle-test-what-happens-when-you-actually-run-this) below for what
survived and what had to be fixed.

Copy this and fill in the five bracketed bits. Everything else is load-bearing —
keep it, especially the last four lines.

```text
Read the business requirements document at [PATH TO YOUR BRD].
Build a working click-through prototype that satisfies every requirement and every
business rule in it. Put it in a new folder called [OUTPUT FOLDER NAME], as index.html
plus prototype.css plus app.js. It must run straight from the filesystem by
double-clicking index.html, with no server, no framework, no library, no build step
and no CDN.
Use the existing design system at [PATH TO YOUR STYLESHEET OR TOKENS] exactly as it is
- link to it, reuse its existing classes and variables, and do not modify that file.
Present the journey inside a [390x844 phone frame / desktop layout] centred on the page.
[ONE SENTENCE OF REAL-WORLD CONTEXT: who uses this, where, and under what conditions.]
On every screen section add a data-req attribute listing the requirement references
that screen satisfies, and show a small trace strip that reads the current screen's
data-req live, plus a toggle that labels those references on the screen itself.
Do not modify any file or folder outside [OUTPUT FOLDER NAME], and remove any scratch
folders you create.
Verify your work in a real browser before you finish: walk the whole journey, check
every requirement and rule, and confirm nothing is clipped or unreachable at the
target screen size.
Stop once the journey works end to end and nothing is clipped - do not keep polishing.
Finish by listing which requirement each screen satisfies, and anything you had to
decide that the document did not specify.
```

No design system to point at? Drop that sentence and add: *"Pick a clean, modern
visual style and apply it consistently across every screen."*

### The five lines people delete, and shouldn't

| Line | What goes wrong without it |
|---|---|
| *"…called [OUTPUT FOLDER NAME]"* | Hardcoding `prototype` silently overwrites the version your stakeholders already signed off. Name it per attempt: `prototype-v3`, `prototype-tues`. |
| *"Do not modify any file or folder outside…"* | Without it, a run may read and drift toward whatever else is lying around, and can leave `node_modules` in your repo. |
| *"…and remove any scratch folders you create"* | Verification often installs a browser driver. Say this or you'll be committing it. |
| *"Stop once the journey works end to end… do not keep polishing"* | **The single biggest cost control.** Unbounded, a run kept chasing sub-pixel hit-area issues long past useful. Bounded runs finished in ~25 minutes. |
| *"…anything you had to decide that the document did not specify"* | It **will** fill gaps your BRD left. You want that list — it's your next set of requirements. |

---

## Battle test: what happens when you actually run this

The template above was run **four more times from scratch**, each in a separate clean
folder containing *only* BRD v1.1 and `assets/screens.css` — no example
implementation to copy from — plus two earlier runs of the unbounded version.

### Result: 4 / 4 produced a complete, working, self-verified app

| Run | Time | Its own browser checks |
|---|---|---|
| 1 | 24 min 08 s | 84 / 84 pass |
| 2 | 30 min 44 s | 101 / 101 pass |
| 3 | 22 min 31 s | 79 / 79 pass |
| 4 | 22 min 08 s | 82 / 82 pass |

Every run wrote its *own* test suite, drove a real browser, found its own defects and
fixed them before finishing. None needed a correction from a human. All four
transcripts, and the exact prompt used, are committed in
[`iteration/battle-test/`](./iteration/battle-test).

**The "stop once it works" line is what makes this predictable.** Without it, an
earlier run was still polishing sub-pixel hit areas after **90 minutes**. With it,
all four landed between 22 and 31 minutes.

**The "list what you decided" line works.** Run 3 finished with, unprompted:

> *"**Step split.** Capture is 4 steps (5 with High potential); the BRD gives fields,
> not screen boundaries… **Date entry.** BR-03's 'DD / MM / YYYY' implemented as three
> digit boxes…"*

That is a requirements conversation you would otherwise have had six weeks later.

### What was identical every time

- Every requirement and business rule implemented and traceable to a screen
- Runs from `file://` — no server, framework, build step or CDN
- Reused the design system untouched, and left no scratch folders behind
- Refused invalid input with a specific, rule-referenced message
- Review screen replayed exactly what was typed
- Escalation appeared only for the high-risk rating, and validated
- A live trace strip plus an on-screen reference toggle

### What varied — expect this

| | Examples across the six runs |
|---|---|
| Journey shape | 4, 5 and 6 screens; "Step N of 4" vs "Screen N of 5" |
| Date entry | one masked field, or three separate DD / MM / YYYY boxes |
| Hazard category | dropdown, or large tap-target option cards |
| Refs toggle | checkbox, or a `button` with `aria-pressed` |
| Frame size | literal `390`/`844`, or `var(--frame-w)` from the design system |

None of those are wrong. **If a specific shape matters, put it in the BRD** — not the
prompt. That is the whole point of the method.

### It fills gaps in your document, sensibly

One run added a rule the BRD never stated: **"Date observed cannot be in the future."**
BR-03 only specified the format. For a *hazard observation* date that inference is
obviously right — and it's exactly what a BA wants surfaced rather than buried.

Another read *"reports can be raised without mobile signal"* in REQ-001 and put a
`NO SIGNAL` indicator in the phone status bar.

### The honest caveats

- **Run it in a folder with the BRD and your design system, and little else.** A run
  inside a repo full of prior implementations drifts toward copying them rather than
  reading the document — we watched it happen.
- **Budget 20–30 minutes.** Most of that is it testing and fixing its own work.
- **Markup is not stable between runs.** Element IDs, control types and screen counts
  all change. Don't write automated tests against one run's markup and expect them to
  pass against the next — we tried, and a single generic test driver could not walk
  all four builds. Test the *journey*, not the selectors.

---

## Writing the BRD so this works well

The prompt matters less than the document. Four things make the output
dramatically better, and a good BA is already doing three of them.

1. **Number your requirements and rules.** `REQ-001`, `BR-01`. They become the
   contract, the traceability tags, and your test checklist.
2. **Write rules as testable statements.** *"Contact email is mandatory and must
   be a structurally valid address"* produces validation. *"The form should be
   user-friendly"* produces nothing.
3. **Add a brand and visual direction section.** Point at your design system,
   name the target screen size, and say who uses it and where. In this repo,
   *"gloves and direct sunlight"* is why the tap targets are the size they are.
4. **Add an acceptance criterion asking for traceability.** Ours reads *"every
   screen traces to at least one requirement reference above"* — and the trace
   strip in the app exists to satisfy it. You can then mark the build against
   your own criteria, which is the part a BA does better than a developer.

---

## What to expect, honestly

- **It takes about 20–25 minutes**, not seconds. Most of that is it testing and
  fixing its own work. Compare it to the queue the BRD would otherwise sit in.
- **It will make design decisions the BRD didn't specify.** Here it gave risk
  rating its own screen rather than squeezing a field onto an existing one. Review
  those decisions — they're a conversation with your stakeholders, not a defect.
- **It is a prototype, not production.** That's the point: it's the artefact the
  business signs off, and the starting point for the delivery team.
- **Read the transcript.** [`iteration/`](./iteration) has both full sessions. If
  anyone doubts what happened, the evidence is right there.

---

## Reproduce it yourself

```powershell
.\go.ps1 -Live
```

Runs prompt 1 for real against this repo's BRD, into `prototype-live/`.
`prototype/` and `prototype-v2/` are never touched. Took ~24 minutes when captured.
