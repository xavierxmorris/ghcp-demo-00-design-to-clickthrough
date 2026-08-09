# Demo 00 — one-page BRD → click-through prototype → revised prototype

> **Difficulty:** ⭐
> **Audience:** business analysts, product owners, delivery leads — anyone who is *not* a developer
> **Length:** 1:15 of scripted beats inside a 90-second slot
> **Prerequisites:** none

```powershell
.\go.ps1
```

That's it. No install, no server, no Node, no Python, no design-tool licence, no network.
The pages run straight off the filesystem, so this works on a locked-down laptop
and on conference wifi that has given up.

---

## The one idea

> A BRD is a **description of an app**. Everyone signs it off; nobody has ever
> used it. One sentence of plain English turns it into something they can click —
> and when the requirements change, you change **the BRD**, not the code.

This is the demo to open with when the room is **not** full of engineers. It never
mentions a framework, a token, or a line of HTML.

---

## What happens

| Beat | Time | What the room sees |
|---|---|---|
| **The business asset** | 0:00 | A one-page BRD opens. Eight requirements, five business rules, approved for build. Familiar — and completely un-clickable. |
| **The ask** | 0:15 | One plain-English sentence, with the *measured* facts of the real Copilot run that answered it. |
| **The prototype** | 0:27 | The journey, working — and every screen tags the requirement references it satisfies. |
| **The revision** | 0:53 | The analyst edits **the BRD**, not the code. v1.1 adds REQ-009, and the prototype follows. |

That last beat is the whole argument: **the business asset stays the source of
truth, and the build follows it.** Nobody writes a change request in code.

### Why it lands with a business audience

- **The input is theirs.** A BRD is an artefact business analysts own and defend.
  It shares no stylesheet, markup or tokens with the prototype — the
  transformation is real, not two views of the same files.
- **Traceability, in their language.** Under the phone sits a live strip reading
  *"Screen 2 of 4 · REQ-003, REQ-004, REQ-008, BR-01, BR-02, BR-03, BR-05"*, plus
  a **Show BRD refs on the screen** toggle that labels elements in place. That is
  acceptance criterion 2 of the BRD, demonstrably met.
- **The prototype remembers.** The review screen shows the name the audience
  member typed — REQ-005, holding.
- **It says no.** Blank email is refused with a specific message (REQ-004,
  BR-01–BR-03). Consent gates submission (BR-04).
- **Everything is auditable.** Both Copilot runs are evidenced by full session
  transcripts in [`iteration/`](./iteration).

### The measured runs — quote these numbers, not rounder ones

| | Run 1 — build | Run 2 — revise |
|---|---|---|
| Input | BRD v1.0 (8 REQs, 5 BRs) | BRD v1.1 (+REQ-009, +BR-06) |
| Wall clock | **16 min 56 sec** | **16 min 31 sec** |
| Produced | `prototype/` — 3 files | `prototype-v2/` — +551 / −31 lines |
| Verified | 78 checks, Chromium + installed Edge 151 | 45 checks, both browsers |
| Transcript | [`run-01`](./iteration/copilot-run-01-brd-to-prototype.log) | [`run-02`](./iteration/copilot-run-02-brd-v11-to-v2.log) |

Both runs wrote and executed their **own** browser tests, found real defects
(a swallowed keyboard shortcut, a 68px overflow when the joint fields appear) and
fixed them before finishing. If you re-run either, re-measure it and update
`$RunOne` / `$RunTwo` in `go.ps1`.

## Running it

| Command | Use it when |
|---|---|
| `.\go.ps1` | Timed 90-second run. |
| `.\go.ps1 -Manual` | **Presenting live.** Enter advances each beat, so questions can't run down the clock. |
| `.\go.ps1 -Check` | Pre-flight before you walk on stage. Exits 0/1, CI-safe. |
| `.\go.ps1 -NoBrowser` | Rehearsing the words without opening windows. |
| `.\go.ps1 -Design` | Open the visual design handover instead of the BRD in beat 1, for design-led rooms. |
| `.\go.ps1 -Live` | Workshop mode — Copilot really rebuilds the prototype from the BRD into `prototype-live\`. Took ~17 minutes when captured. `prototype\` and `prototype-v2\` are never touched. |

Full presenter script, including what to say and how to answer the awkward
questions: **[`RUN-SHEET.md`](./RUN-SHEET.md)**.

Prefer to skip the terminal? Just open the pages in order:

- `brd/aurora-everyday-account-brd.html` — the business asset (v1.0)
- `prototype/index.html` — built from it
- `brd/aurora-everyday-account-brd-v1.1.html` — the revision (+REQ-009)
- `prototype-v2/index.html` — built from the revision

---

## Layout

```
.
├── go.ps1                  the runner — this is the whole demo
├── RUN-SHEET.md            presenter run-sheet: beats, script, Q&A
├── brd/
│   ├── aurora-everyday-account-brd.html       v1.0 — the business asset
│   └── aurora-everyday-account-brd-v1.1.html  v1.1 — adds REQ-009 / BR-06
├── assets/
│   └── screens.css         the existing Aurora design system, reused unmodified
├── design/                 optional visual opener for design-led rooms
│   ├── canvas.html
│   └── canvas.css
├── prototype/              built by Copilot from BRD v1.0
│   ├── index.html
│   ├── prototype.css
│   └── app.js
├── prototype-v2/           built by Copilot from BRD v1.1
│   ├── index.html
│   ├── prototype.css
│   └── app.js
└── iteration/
    ├── copilot-run-01-brd-to-prototype.log   the real transcript, run 1
    └── copilot-run-02-brd-v11-to-v2.log      the real transcript, run 2
```

---

## Honesty notes

Worth being straight about these if anyone asks — the demo is stronger for it.

- **Both prototypes were genuinely built by Copilot from the BRDs.** Two runs,
  both transcripts committed in [`iteration/`](./iteration). If someone doubts the
  claim, open a log — it shows Copilot reading the document, writing the files,
  testing them in a browser, finding defects and fixing them.
- **The prototypes are pre-built** so the run is reliable and fits the slot. The
  *building* was real; only the *replay* is staged.
- **The script never fakes generation.** It opens pages and prints presenter
  cues. It shows no invented progress, no invented file writes, no invented
  timings. Every number was measured.
- **Seventeen minutes is not instant** — say so. The comparison that matters is
  the queue the BRD would otherwise sit in.
- **The BRD is independent of the prototype.** It shares no stylesheet, markup or
  tokens. The design system it points at (`assets/screens.css`) is a pre-existing
  org asset that the BRD explicitly references in section 6 — exactly as a real
  BRD would.
- **"Without a developer" means without writing code.** Someone still had to
  clone a repo and run a script. The defensible claim is: *the analyst created
  and revised a working prototype without writing code.*
- **This is prototype code, not production code** — the BRD says so itself
  (BR-05 and the note to delivery).
- **`file://` is not a shareable link.** To actually send it round, publish the
  static files to an approved host first.
- **No data goes anywhere.** Everything stays in the browser. Nothing is
  submitted, nothing is stored, there is no backend.
- **Aurora is fictional.** The bank, the product, the BRD, its author and
  `jordan@example.com` are all invented for the demo.
- **The optional design opener** (`.\go.ps1 -Design`) is a deliberately unbranded
  stand-in for a design tool, imitating no specific product. Unlike the BRD, it
  *does* share a stylesheet with the prototype — so prefer the BRD when the point
  you're making is transformation.

---

## Presenter cheat sheet

- Press **`d`** in the prototype to fill the form instantly if you're short on
  time. Typing a real audience member's name is better if you have ten seconds.
- **The browser is the star. The terminal is the autocue.** Don't demo the script.
- **Let the silence at 0:10 sit.** Watching people try to click a picture is the
  entire demo.

---

## Licence

MIT — see [LICENSE](./LICENSE).
