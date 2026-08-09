# 90-second run-sheet — design handover → click-through prototype → revised prototype

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

> A design file is a **picture of an app**. Everyone signs it off; nobody has used it.
> One sentence of plain English turns it into something they can actually click —
> and changing it is another sentence, not another sprint.

Everything below serves that sentence. If you only have 30 seconds, do beats 1 and 4 — the inert design file, then the real change.

---

## Beat sheet

Measured runtime **1:15**, leaving ~15 seconds of buffer inside a 90-second slot
for browser focus and a question.

### 0:00 — The handover *(15s)*
The script opens **`design/canvas.html`** — a design handover with four frames.

> "This is what design handed over on Friday. Four screens: welcome, details,
> review, confirmation. Looks finished, doesn't it?"
>
> "Go on — click *Get started*."

**Let the silence sit.** Nothing happens. That beat is the whole demo.

> "It's a picture of an app. We sign these off, we estimate off them, we write
> requirements against them — and not one person in the approval chain has ever
> *used* the thing."

### 0:15 — The ask *(12s)*
The prompt appears in the terminal.

> "Here are four design frames for the Aurora everyday-account signup. Turn them
> into a working click-through prototype I can send round for sign-off: the
> buttons should move between screens, the form should validate, and the review
> screen should show what I actually typed."

> "That's the whole instruction. One sentence, plain English. No ticket, no
> sprint, and nobody wrote a line of code by hand."

Say **"nobody wrote code by hand"**, not "no developer" — someone still cloned a
repo and ran a script, and the distinction is easy to defend.

### 0:27 — The prototype *(26s)*
The script opens **`prototype/index.html`**. **Drive it yourself. This is the first payoff.**

1. Click **Get started** — it moves.
2. Press **`d`** to auto-fill *(or type a real audience member's name — much better)*.
3. Clear the email and hit **Continue** — it stops you, in red.
4. Fix it, continue to **Review**.

> "Look at the review screen. That's the name *you* gave me. Not a placeholder —
> it remembered. A design file physically cannot do that."

5. Hit **Confirm** without ticking the box — blocked.
6. Tick it, confirm, land on the confirmation screen.

### 0:53 — The iteration *(22s)* — **the beat that proves the claim**
The change request and the **measured** run facts appear, then
**`prototype-v2/index.html`** opens.

> "Add a joint account option. When the customer chooses a joint account, ask for
> the second applicant's name and email, validate them the same way, and show them
> on the review screen."

**Drive v2:** pick **Joint Everyday Account** in the dropdown. Two fields appear.
Leave them blank and hit Continue — they validate. Fill them, continue, and the
review screen now shows **Joint applicant** and **Joint email**.

> "Copilot actually ran that. Nine and a half minutes, three files, and it wrote
> and ran its own browser tests — thirty of them, all passing. The full transcript
> is committed in the repo; anyone who wants to audit it can."

**Close on this:**

> "That's a stakeholder changing their mind, answered before the meeting ends.
> And it isn't a throwaway — it's a real repo, so the delivery team starts from
> something the business has already clicked through."

---

## The measured claim — quote these numbers, not rounder ones

| | |
|---|---|
| Captured | 9 August 2026 |
| Wall clock | 9 min 34 sec |
| Changed | 3 files, +105 / −5 lines |
| Verified | 30 / 30 of Copilot's own browser checks |
| Transcript | [`iteration/copilot-run.log`](./iteration/copilot-run.log) |

If you re-run the iteration, **re-measure it** and update `$RunFacts` in `go.ps1`.
Never quote a number you didn't measure — the transcript is in the repo precisely
so the claim survives being checked.

---

## What to say if asked

| Question | Answer |
|---|---|
| "Did Copilot really do that, or is it staged?" | The v1 prototype is pre-built so the run is reliable. **The v2 change is real** — one Copilot run, 9m34s, and the whole session transcript is committed at `iteration/copilot-run.log`. Offer to open it. |
| "Why not run it live?" | You can: `.\go.ps1 -Live`. It takes about ten minutes and varies run to run, so it's a workshop exercise rather than a keynote one. |
| "Is that real Figma?" | **No, and don't imply otherwise.** It's a deliberately unbranded stand-in for a design handover. Nothing here connects to a design tool. If they want a real design-tool import, that's a separate conversation with their own file. |
| "Isn't the 'design file' just more code?" | Yes — the handover and the prototype share one stylesheet. Say so. This demo proves **iteration**, not design-file parsing, and iteration is the thing they actually care about. |
| "Is this production code?" | No — it's a prototype, and that's the point. It's the *starting artefact* for the delivery team. |
| "Could my BA really do this?" | They'd need Copilot and a folder. They would not need to write code. That's the claim — no more, no less. |
| "What about our design system?" | Point it at your tokens and it reuses them. Here, the handover and the prototype share `assets/screens.css`. |
| "Can you send me the link?" | Not from this repo as-is — it runs off `file://`. Publish the static files to an approved host first. Don't promise a link the demo can't produce. |
| "Where does the data go?" | Nowhere. It's all in the browser. Nothing is submitted, nothing is stored. |

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
├── assets/screens.css      ONE design system, shared by both sides
├── design/
│   ├── canvas.html         the "before": 4 static frames, deliberately inert
│   └── canvas.css          unbranded design-handover chrome
├── prototype/              v1: the same 4 screens, wired up
├── prototype-v2/           v2: Copilot's answer to the change request
└── iteration/
    └── copilot-run.log     the real session transcript — the evidence
```

The handover and the prototype **share `assets/screens.css`**. Be upfront about
that: it means the frames are the same pixels as the working screens, and it means
this demo proves **iteration**, not design-file parsing. Iteration is the part the
business actually cares about.

---

## Presenter notes

- **Press `d`** in the prototype to fill the form instantly — use it if you're
  short on time. Typing a real name from the audience is better if you have 10
  seconds spare.
- **Never imply Copilot is generating during the run.** It isn't. The script
  opens pages and prints cues. The genuine Copilot work is v2, and it's evidenced
  by a committed transcript — that's a stronger story than a fake progress bar,
  and it survives being challenged.
- **Don't explain MCP, tokens, or HTML.** This audience doesn't care and the
  clock doesn't allow it. Keep every sentence in business language.
- **Resist the demo of the terminal.** The browser is the star. The terminal is
  the autocue.
- **The silence at 0:08 is the demo.** Let them try to click a picture.
