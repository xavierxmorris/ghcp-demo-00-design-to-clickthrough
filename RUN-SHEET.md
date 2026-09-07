# 90-second run-sheet — one-page BRD → working app → revised BRD → revised app

**Audience:** business analysts, product owners, designers, delivery leads — anyone
who is *not* a developer.
**Length:** 1:15 of scripted beats inside a 90-second slot.
**Prerequisites:** none. No Node, no Python, no server, no design-tool licence, no network.
**One command:**

```powershell
.\go.ps1
```

Presenting live? Use `.\go.ps1 -Manual` so questions can't run down the clock —
you advance each beat with Enter.

For the longer, participant-driven exercise, use [WORKSHOP.md](WORKSHOP.md).
The replay is offline; live generation uses Copilot and network access.

---

## The one idea

> A BRD is a **description of an app**. Everyone signs it off; nobody has used it.
> One sentence of plain English turns it into something they can actually click —
> and when the requirements change, you change **the BRD**, not the code.

Everything below serves that sentence. If you only have 30 seconds, do beats 1 and 4 — the un-clickable document, then the real change.

---

## Beat sheet

Measured runtime **1:15**, leaving ~15 seconds of buffer inside a 90-second slot
for browser focus and a question.

### 0:00 — The business asset *(15s)*
The script opens **`brd/terravale-field-hazard-report-brd.html`** — BRD-2026-031 v1.0.

> "One page. Eight requirements, five business rules, a sponsor, and a status of
> *approved for build*. Your BA wrote this. Everyone in this room has signed one."

> "Today those hazards go on **paper triplicate forms** collected at end of shift.
> Thirty-eight per cent arrive incomplete or illegible, and the supervisor hears
> about it **nine and a half hours later**."

> "And this document now waits in a queue until a developer is free."

Point at **acceptance criterion 2** — *"every screen traces to at least one
requirement reference"*. You'll cash that cheque in 30 seconds.

### 0:15 — The ask *(12s)*
The prompt appears, followed by the **measured** facts of the real run.

> "Read the BRD. Build a working click-through prototype that satisfies every
> requirement and business rule in it, using our existing design system. Tag each
> screen with the requirement references it satisfies."

> "One sentence. And the BRD is the input — not a spec somebody rewrote into
> developer language first. Twenty-four minutes, and it wrote and ran its own
> browser tests: a hundred and thirty-five of them."

### 0:27 — The app *(26s)*
The script opens **`prototype/index.html`** — *Terravale Field*. **Drive it yourself.**

1. **Start hazard report**.
2. Press **`d`** to auto-fill, or enter a fictional participant and example email.
3. Clear the contact email, hit **Continue** — refused, with a specific message.
4. Fix it, continue to **Check your report**.

> "That's the name *you* gave me. REQ-005 — the review screen shows what was
> actually entered. And look under the phone."

**Point at the trace strip:** *Screen 3 of 4 · REQ-005, REQ-006, REQ-008, BR-04, BR-05.*

> "Every screen declares which requirements it satisfies. Tick *Show BRD refs on
> the screen* and it labels them in place. That's the acceptance criterion from
> the document — met, and checkable by the person who wrote it."

Worth landing if you have a spare breath: the prototype works without a network
and shows the intended notification journey, but **no supervisor is notified**.
The tap-target requirement comes from section 6's fictional field-use scenario.

### 0:53 — The revision *(22s)* — **the beat that proves the claim**
**`…-brd-v1.1.html`** opens, then **`prototype-v2/index.html`**.

> "After the Q3 significant-hazard review, HSE want high-potential hazards
> escalated. So the BA opens the BRD and adds REQ-009 and BR-06 — see the change
> bars. That's it. That's the whole change request."

> "Copilot compared v1.0 to v1.1, worked out what changed, and updated the build."

**Drive v2:** there's now a **Risk rating** step — Low / Moderate / **High
potential** (*"could have killed or permanently injured someone"*). Choose **High
potential** → the escalation panel appears → hit Continue with it blank (BR-06
refuses) → fill it → the review shows a **High potential** pill and an
**ESCALATED — SUPERVISOR NOTIFIED** block.

*On the escalated review the declaration sits just below the fold — scroll to it.
That's deliberate: there is genuinely more to confirm when a hazard is escalated.*

**Close on this:**

> "Nobody wrote a change request in code. The analyst changed the document they
> already own, and the build followed it. Your BA takes a BRD in and gets a
> click-through demo out — without being a developer."

---

## The measured claims — quote these numbers, not rounder ones

| | Run 1 — build | Run 2 — revise |
|---|---|---|
| Input | BRD v1.0 (8 REQs, 5 BRs) | BRD v1.1 (+REQ-009, +BR-06) |
| Wall clock | **24 min 11 sec** | **24 min 47 sec** |
| Produced | `prototype/` — 3 files | `prototype-v2/` — new Risk rating step, +1034 / −80 |
| Verified | 135 checks, Chromium + installed Edge | 61 checks, Chromium + installed Edge |
| Defects it found and fixed itself | 4 | 1 |
| Transcript | [`run-01`](./iteration/copilot-run-01-brd-to-prototype.log) | [`run-02`](./iteration/copilot-run-02-brd-v11-to-v2.log) |

The defect detail is worth saying out loud — it did the **checking**, not just the
typing:

- Run 1 found that `aria-disabled` on the submit button meant the app could never
  explain *why* it was blocked — an accessibility bug it then fixed.
- Run 1 also caught a clipped form when all four errors showed, and three
  traceability chips being cut off by the design system's `overflow:hidden`.
- Run 2 measured a **102px overflow** on the escalated review screen and
  reworked the layout rather than shipping something clipped.

If you re-run either, **re-measure it** and update `$RunOne` / `$RunTwo` in
`go.ps1`. Never quote a number you didn't take.

---

## What to say if asked

| Question | Answer |
|---|---|
| "Did Copilot really build that from the BRD?" | Yes. Two runs, both transcripts committed in `iteration/`. Offer to open one — it shows it reading the BRD, writing the files, testing in a browser, and fixing what it found. |
| "Is it staged?" | The apps are pre-built so the run is reliable and fits the slot. The *building* was real and is evidenced. The script only opens pages and prints cues — it never fakes generation. |
| "Why not run it live?" | You can: `.\go.ps1 -Live`. It took ~24 minutes when captured, so it's a workshop exercise, not a keynote one. |
| "Twenty-four minutes isn't instant." | No — and don't pretend otherwise. Compare it to the queue the BRD would otherwise sit in, and to 9.4 hours of paper. |
| "Is this production code?" | No, and the BRD says so — BR-05 and the note to delivery. It's the *starting artefact*, not the product. |
| "Could my BA really do this?" | They'd need Copilot and a folder. They would not need to write code. That's the claim — no more, no less. |
| "Is Terravale real?" | No. The company, the site, the reference numbers and the safety statistics are invented. Only the shape of the document is real. |
| "What about our design system?" | Section 6 of the BRD points at it, and the app reuses `assets/screens.css` unmodified. Point yours at your own tokens. |
| "Can you send me the link?" | Not as-is — it runs off `file://`. Publish the static files to an approved host first. |
| "Where does the data go?" | Nowhere. BR-05. Nothing is submitted, nothing is stored, there is no backend. |

---

## Flags

| Command | Use it when |
|---|---|
| `.\go.ps1` | Timed 90-second run. |
| `.\go.ps1 -Manual` | **Presenting live.** Enter advances each beat. |
| `.\go.ps1 -Check` | Required-asset pre-flight, not a rerun of browser assertions. |
| `.\go.ps1 -NoBrowser` | Rehearsing the words without opening windows. |
| `.\go.ps1 -Live` | Requests a rebuild into `prototype-live\`, with all tools allowed. Use a disposable clone: instructions do not isolate the original files. |

---

## Files

```
.
├── go.ps1                  the runner - this is the whole demo
├── RUN-SHEET.md            you are here
├── brd/
│   ├── ...-brd.html        v1.0 - the business asset the demo starts from
│   └── ...-brd-v1.1.html   v1.1 - adds REQ-009 / BR-06, change-barred
├── assets/screens.css      the Terravale design system, reused unmodified
├── prototype/              built by Copilot from BRD v1.0
├── prototype-v2/           built by Copilot from BRD v1.1
└── iteration/              both full session transcripts - the evidence
```

The BRD shares **no** stylesheet, markup or tokens with the app. That is
deliberate: the input is genuinely independent of the output, so the
transformation is real rather than two views of the same files.

---

## Presenter notes

- **Press `d`** in the prototype to fill the form instantly — use it if you're
  short on time. Typing a real name from the audience is better if you have 10
  seconds spare.
- **Never imply Copilot is generating during the run.** It isn't. The script
  opens pages and prints cues. The genuine Copilot work is evidenced by two
  committed transcripts — a stronger story than a fake progress bar, and it
  survives being challenged.
- **Say "nobody wrote code by hand", not "no developer."** Someone still cloned a
  repo and ran a script. The narrower claim is true and defensible.
- **Point at the trace chips.** They're the bridge from their world to ours, and
  they're the acceptance criterion the BRD itself asks for.
- **Don't explain MCP, tokens, or HTML.** This audience doesn't care and the
  clock doesn't allow it. Keep every sentence in business language.
- **Resist the demo of the terminal.** The browser is the star. The terminal is
  the autocue.
