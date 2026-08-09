# 90-second run-sheet — one-page BRD → click-through prototype → revised prototype

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
The script opens **`brd/aurora-everyday-account-brd.html`** — BRD-2026-014 v1.0.

> "One page. Eight requirements, five business rules, a sponsor, and a status of
> *approved for build*. Your BA wrote this. Everybody in this room has signed one."

> "And now it sits in a queue until a developer is free. Nobody in that approval
> chain has ever *used* the thing they approved."

Point at **acceptance criterion 2** — *"every screen traces to at least one
requirement reference"*. You'll cash that cheque in 30 seconds.

*Design-led room instead? `.\go.ps1 -Design` opens the visual handover.*

### 0:15 — The ask *(12s)*
The prompt appears, followed by the **measured** facts of the real run.

> "Read the BRD. Build a working click-through prototype that satisfies every
> requirement and business rule in it, using our existing design system. Tag each
> screen with the requirement references it satisfies."

> "One sentence. And the BRD is the input — not a spec somebody rewrote into
> developer language first. Seventeen minutes, and it wrote and ran its own
> browser tests: seventy-eight of them."

### 0:27 — The prototype *(26s)*
The script opens **`prototype/index.html`**. **Drive it yourself.**

1. Click **Get started**.
2. Press **`d`** to auto-fill *(or type a real audience member's name — much better)*.
3. Clear the email, hit **Continue** — refused, with a specific message.
4. Fix it, continue to **Review**.

> "That's the name *you* gave me. REQ-005 — the review screen shows what was
> actually entered. And look under the phone."

**Point at the trace strip:** *Screen 3 of 4 · REQ-005, REQ-006, REQ-008, BR-04, BR-05.*

> "Every screen declares which requirements it satisfies. Tick *Show BRD refs on
> the screen* and it labels them in place. That's the acceptance criterion from
> the document — met, and checkable by the person who wrote it."

### 0:53 — The revision *(22s)* — **the beat that proves the claim**
**`brd/…-v1.1.html`** opens, then **`prototype-v2/index.html`**.

> "Steering committee wants joint accounts. So the analyst opens the BRD and adds
> REQ-009 and BR-06 — see the change bars. That's it. That's the whole change
> request."

> "Copilot compared v1.0 to v1.1, worked out what changed, and updated the build."

**Drive v2:** choose **Joint Everyday Account** → two fields appear → leave them
blank and Continue (BR-06 refuses) → fill them → review shows **both applicants**,
and the chips now include **REQ-009**.

**Close on this:**

> "Nobody wrote a change request in code. The analyst changed the document they
> already own, and the build followed it. The BRD stays the source of truth —
> and the delivery team starts from something the business has already clicked."

---

## The measured claims — quote these numbers, not rounder ones

| | Run 1 — build | Run 2 — revise |
|---|---|---|
| Input | BRD v1.0 (8 REQs, 5 BRs) | BRD v1.1 (+REQ-009, +BR-06) |
| Wall clock | **16 min 56 sec** | **16 min 31 sec** |
| Produced | `prototype/` — 3 files | `prototype-v2/` — +551 / −31 lines |
| Verified | 78 checks, Chromium + installed Edge 151 | 45 checks, both browsers |
| Transcript | [`run-01`](./iteration/copilot-run-01-brd-to-prototype.log) | [`run-02`](./iteration/copilot-run-02-brd-v11-to-v2.log) |

Both runs wrote and ran their **own** browser tests, found real defects — a
swallowed keyboard shortcut, a 68px overflow once the joint fields appear — and
fixed them before finishing. That detail is worth saying out loud: it did the
checking, not just the typing.

If you re-run either, **re-measure it** and update `$RunOne` / `$RunTwo` in
`go.ps1`. Never quote a number you didn't take.

---

## What to say if asked

| Question | Answer |
|---|---|
| "Did Copilot really build that from the BRD?" | Yes. Two runs, both transcripts committed in `iteration/`. Offer to open one — it shows it reading the BRD, writing the files, testing them, and fixing what it found. |
| "Is it staged?" | The prototypes are pre-built so the run is reliable and fits the slot. The *building* was real and is evidenced. The script only opens pages and prints cues — it never fakes generation. |
| "Why not run it live?" | You can: `.\go.ps1 -Live`. It took ~17 minutes when captured, so it's a workshop exercise, not a keynote one. |
| "Seventeen minutes isn't instant." | No — and don't pretend otherwise. Compare it to the queue the BRD would otherwise sit in. The unit of change moved from a sprint to a coffee. |
| "Is this production code?" | No, and the BRD says so — BR-05, and the note to delivery. It's the *starting artefact*, not the product. |
| "Could my BA really do this?" | They'd need Copilot and a folder. They would not need to write code. That's the claim — no more, no less. |
| "What about our design system?" | Section 6 of the BRD points at it, and the prototype reuses `assets/screens.css` unmodified. Point yours at your own tokens. |
| "Can you send me the link?" | Not as-is — it runs off `file://`. Publish the static files to an approved host first. Don't promise a link the demo can't produce. |
| "Where does the data go?" | Nowhere. BR-05. Nothing is submitted, nothing is stored, there is no backend. |

---

## Flags

| Command | Use it when |
|---|---|
| `.\go.ps1` | Timed 90-second run. |
| `.\go.ps1 -Manual` | **Presenting live.** Enter advances each beat. |
| `.\go.ps1 -Check` | Pre-flight before you walk on stage. Exits 0/1, CI-safe. |
| `.\go.ps1 -NoBrowser` | Rehearsing the words without opening windows. |
| `.\go.ps1 -Live` | Workshop mode — Copilot really rebuilds it into `prototype-live\`. Minutes, not seconds. Your known-good copy is never touched. |

---

## Files

```
.
├── go.ps1                  the runner — this is the whole demo
├── RUN-SHEET.md            you are here
├── brd/
│   ├── …-brd.html          v1.0 — the business asset the demo starts from
│   └── …-brd-v1.1.html     v1.1 — adds REQ-009, change-barred
├── assets/screens.css      the existing Aurora design system
├── design/                 optional visual opener (.\go.ps1 -Design)
├── prototype/              built by Copilot from BRD v1.0
├── prototype-v2/           built by Copilot from BRD v1.1
└── iteration/              both full session transcripts — the evidence
```

The BRD shares **no** stylesheet, markup or tokens with the prototype. That is
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
