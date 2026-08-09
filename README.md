# Demo 00 — one-page BRD → working app → revised BRD → revised app

> **Difficulty:** ⭐
> **Audience:** business analysts, product owners, HSE and operations leads — anyone who is *not* a developer
> **Length:** 1:15 of scripted beats inside a 90-second slot
> **Prerequisites:** none

```powershell
.\go.ps1
```

That's it. No install, no server, no Node, no Python, no design-tool licence, no
network. The pages run straight off the filesystem, so this works on a
locked-down laptop and on conference wifi that has given up.

---

## The one idea

> A BRD is a **description of an app**. Everyone signs it off; nobody has ever
> used it. One sentence of plain English turns it into something they can click —
> and when the requirements change, you change **the BRD**, not the code.

Your business analyst takes a document they already own and gets a working
click-through demo out of it — **without being a developer, and without writing a
line of code.** That is the entire claim, and everything in this repo exists to
make it checkable.

---

## The scenario

**Terravale Resources** — a fictional diversified miner. Iron ore operations.

Hazards and safety observations are raised on **paper triplicate forms** collected
at end of shift. Last quarter **38% arrived incomplete or illegible**, and the
median time from observation to supervisor awareness was **9.4 hours**.

The BA writes a one-page BRD for a mobile hazard reporting journey. Normally that
document then waits in a queue until a developer is free. Here it doesn't.

---

## What happens

| Beat | Time | What the room sees |
|---|---|---|
| **The business asset** | 0:00 | `BRD-2026-031 v1.0` opens. Eight requirements, five business rules, approved for build. Familiar — and completely un-clickable. |
| **The ask** | 0:15 | One plain-English sentence, with the *measured* facts of the real Copilot run that answered it. |
| **The app** | 0:27 | **Terravale Field**, working — and every screen tags the requirement references it satisfies. |
| **The revision** | 0:53 | HSE want high-potential hazards escalated. The BA edits **the BRD**, not the code. v1.1 adds REQ-009, and the app follows. |

That last beat is the whole argument: **the business asset stays the source of
truth, and the build follows it.** Nobody writes a change request in code.

### Why it lands with a business audience

- **The input is theirs.** A BRD is an artefact business analysts own and defend.
  It shares no stylesheet, markup or tokens with the app — the transformation is
  real, not two views of the same files.
- **Traceability, in their language.** Under the phone sits a live strip reading
  *"Screen 2 of 4 · REQ-003, REQ-004, REQ-008, BR-01, BR-02, BR-03"*, plus a
  **Show BRD refs on the screen** toggle that labels elements in place. That is
  acceptance criterion 2 of the BRD, demonstrably met.
- **The app remembers.** The review screen shows what the audience member typed —
  REQ-005, holding.
- **It says no.** A blank contact email is refused with a specific message
  (REQ-004, BR-01–BR-03). The declaration gates submission (BR-04).
- **It reads like mining, because it is.** Raise a hazard from the pit, the
  crusher, the workshop or the haul road. Works with no mobile signal. Reaches
  your shift supervisor immediately. Large tap targets for gloves, high contrast
  for direct sunlight — straight out of section 6 of the BRD.
- **Everything is auditable.** Both Copilot runs are evidenced by full session
  transcripts in [`iteration/`](./iteration).

### The measured runs — quote these numbers, not rounder ones

| | Run 1 — build | Run 2 — revise |
|---|---|---|
| Input | BRD v1.0 (8 REQs, 5 BRs) | BRD v1.1 (+REQ-009, +BR-06) |
| Wall clock | **24 min 11 sec** | **24 min 47 sec** |
| Produced | `prototype/` — 3 files | `prototype-v2/` — a new Risk rating step, +1034 / −80 |
| Verified | 135 checks, Chromium + installed Edge | 61 checks, Chromium + installed Edge |
| Transcript | [`run-01`](./iteration/copilot-run-01-brd-to-prototype.log) | [`run-02`](./iteration/copilot-run-02-brd-v11-to-v2.log) |

Both runs wrote and executed their **own** browser tests and fixed real defects
they found before finishing. Run 1 alone caught four, including an accessibility
bug where `aria-disabled` on the submit button prevented the app from ever
explaining *why* it was blocked. Say that out loud — it did the checking, not just
the typing.

If you re-run either, re-measure it and update `$RunOne` / `$RunTwo` in `go.ps1`.

---

## How a business analyst actually uses this

The demo is the pitch; this is the recipe. Four steps, no coding.

> **The exact prompts that built this repo are in [`PROMPTS.md`](./PROMPTS.md)** —
> verbatim, annotated clause by clause, with a fill-in-the-blanks template for
> your own BRD.

**1. Write the BRD as you normally would.** Numbered requirements, business rules,
acceptance criteria. Two things make the output dramatically better:
   - a **brand and visual direction** section pointing at your design system
   - an acceptance criterion asking for **traceability** back to requirement refs

**2. Ask in one sentence.** Open Copilot in the folder and say:

> *"Read the business requirements document in `brd/`. Build a working
> click-through prototype that satisfies every requirement and business rule in
> it, using our existing design system. Tag each screen with the requirement
> references it satisfies. Verify it in a real browser before you finish."*

That last clause matters more than anything else in the sentence — it's what turns
a first draft into something that has been checked.

**3. Click through it, and mark it against your own acceptance criteria.** You
wrote them; now test them. This is the part a BA is *better* at than a developer.

**4. When it changes, change the document.** Revise the BRD, mark what moved, then:

> *"The BRD has been revised to v1.1. Compare it with v1.0, work out what
> changed, and update the prototype to match."*

The document stays the source of truth. The build follows it. Nobody translates
requirements into a ticket, then a ticket into code, losing intent at each hop.

---

## Running it

| Command | Use it when |
|---|---|
| `.\go.ps1` | Timed run. |
| `.\go.ps1 -Manual` | **Presenting live.** Enter advances each beat, so questions can't run down the clock. |
| `.\go.ps1 -Check` | Pre-flight before you walk on stage. Exits 0/1, CI-safe. |
| `.\go.ps1 -NoBrowser` | Rehearsing the words without opening windows. |
| `.\go.ps1 -Live` | Workshop mode — Copilot really rebuilds the app from the BRD into `prototype-live\`. Took ~24 minutes when captured. `prototype\` and `prototype-v2\` are never touched. |

Full presenter script, including what to say and how to answer the awkward
questions: **[`RUN-SHEET.md`](./RUN-SHEET.md)**.

Prefer to skip the terminal? Just open the pages in order:

- `brd/terravale-field-hazard-report-brd.html` — the business asset (v1.0)
- `prototype/index.html` — built from it
- `brd/terravale-field-hazard-report-brd-v1.1.html` — the revision (+REQ-009)
- `prototype-v2/index.html` — built from the revision

---

## Layout

```
.
├── go.ps1                  the runner — this is the whole demo
├── RUN-SHEET.md            presenter run-sheet: beats, script, Q&A
├── PROMPTS.md              the exact prompts that built this, annotated
├── brd/
│   ├── terravale-field-hazard-report-brd.html       v1.0 — the business asset
│   └── terravale-field-hazard-report-brd-v1.1.html  v1.1 — adds REQ-009 / BR-06
├── assets/
│   └── screens.css         the Terravale design system, reused unmodified
├── prototype/              built by Copilot from BRD v1.0
├── prototype-v2/           built by Copilot from BRD v1.1
└── iteration/              both full session transcripts — the evidence
```

---

## Honesty notes

Worth being straight about these if anyone asks — the demo is stronger for it.

- **Both apps were genuinely built by Copilot from the BRDs.** Two runs, both
  transcripts committed in [`iteration/`](./iteration). If someone doubts it,
  open a log — it shows Copilot reading the document, writing the files, testing
  them in a browser, finding defects and fixing them.
- **The apps are pre-built** so the run is reliable and fits the slot. The
  *building* was real; only the *replay* is staged.
- **The script never fakes generation.** It opens pages and prints presenter
  cues — no invented progress, no invented file writes, no invented timings.
- **Twenty-four minutes is not instant** — say so. The comparison that matters is
  the queue the BRD would otherwise sit in.
- **The BRD is independent of the app.** It shares no stylesheet, markup or
  tokens. The design system it points at (`assets/screens.css`) is a pre-existing
  org asset the BRD references in section 6, exactly as a real BRD would.
- **"Without a developer" means without writing code.** Someone still had to
  clone a repo and run a script. The defensible claim is: *the analyst created
  and revised a working prototype without writing code.*
- **This is prototype code, not production code** — the BRD says so itself
  (BR-05 and the note to delivery).
- **`file://` is not a shareable link.** To actually send it round, publish the
  static files to an approved host first.
- **No data goes anywhere.** Everything stays in the browser. Nothing is
  submitted, nothing is stored, there is no backend.
- **Terravale Resources is fictional.** The company, the site, the BRD, its
  reference numbers and the safety statistics are all invented for the demo. Any
  resemblance to a real miner's documents or systems is coincidental.

---

## Presenter cheat sheet

- Press **`d`** in the app to fill the form instantly if you're short on time.
  Typing a real audience member's name is better if you have ten seconds.
- **The browser is the star. The terminal is the autocue.** Don't demo the script.
- **Point at the trace chips.** They're the bridge from their world to ours.
- **Close on the document, not the code:** *"the analyst changed the BRD, and the
  build followed it."*

---

## Licence

MIT — see [LICENSE](./LICENSE).
