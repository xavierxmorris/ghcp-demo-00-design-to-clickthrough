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

Copy this and fill in the four bracketed bits. Everything else is load-bearing —
keep it.

```text
Read the business requirements document at [PATH TO YOUR BRD].
Build a working click-through prototype that satisfies every requirement and every
business rule in it. Put it in a new folder called prototype, as index.html plus
prototype.css plus app.js. It must run straight from the filesystem by double-clicking
index.html, with no server, no framework, no library, no build step and no CDN.
Use the existing design system at [PATH TO YOUR STYLESHEET OR TOKENS] exactly as it is
- link to it, reuse its existing classes and variables, and do not modify that file.
Present the journey inside a [390x844 phone frame / desktop layout] centred on the page.
[ONE SENTENCE OF REAL-WORLD CONTEXT: who uses this, where, and under what conditions.]
On every screen section add a data-req attribute listing the requirement references
that screen satisfies, and show a small trace strip that reads the current screen's
data-req live, plus a toggle that labels those references on the screen itself.
Verify your work in a real browser before you finish.
```

No design system to point at? Drop that sentence and add: *"Pick a clean, modern
visual style and apply it consistently across every screen."*

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
