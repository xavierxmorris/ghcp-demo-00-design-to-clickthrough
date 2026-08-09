# 90-second run-sheet — design file → click-through prototype

**Audience:** business analysts, product owners, designers, delivery leads — anyone
who is *not* a developer.
**Length:** 90 seconds.
**Prerequisites:** none. No Node, no Python, no server, no Figma seat, no network.
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

Everything below serves that sentence. If you only have 30 seconds, do beats 1 and 4.

---

## Beat sheet

### 0:00 — The handover *(20s)*
The script opens **`design/canvas.html`** — a design file with four frames.

> "This is what design handed over on Friday. Four screens: welcome, details,
> review, confirmation. Looks finished, doesn't it?"
>
> "Go on — click *Get started*."

**Let the silence sit.** Nothing happens. That beat is the whole demo.

> "It's a picture of an app. We sign these off, we estimate off them, we write
> requirements against them — and not one person in the approval chain has ever
> *used* the thing."

### 0:20 — The ask *(15s)*
The prompt appears in the terminal.

> "Here are four design frames for the Aurora everyday-account signup. Turn them
> into a working click-through prototype I can send round for sign-off: the
> buttons should move between screens, the form should validate, and the review
> screen should show what I actually typed."

> "That's the whole instruction. One sentence, plain English. No ticket, no
> sprint, no developer. An analyst typed that."

### 0:35 — The build *(10s)*
Three files scroll past.

> "Three files. Same colours, same type, same spacing — it reused the design
> system rather than inventing a new one. Nobody hand-wrote a line of this."

### 0:45 — The pay-off *(30s)*
The script opens **`prototype/index.html`**. **Drive it yourself. This is the money beat.**

1. Click **Get started** — it moves.
2. Press **`d`** to auto-fill the form *(or type a real audience member's name — better)*.
3. Clear the email and hit **Continue** — it stops you, in red.
4. Fix it, continue to **Review**.

> "Look at the review screen. That's the name *you* gave me. Not a placeholder —
> it remembered. A design file physically cannot do that."

5. Hit **Confirm** without ticking the box — blocked.
6. Tick it, confirm, land on the confirmation screen with a generated account number.

### 1:15 — The iteration *(15s)*
The follow-up prompt appears.

> "Add an ID verification step between details and review, and change the account
> options to include a joint account."

> "That's a stakeholder changing their mind in the room. It's not a two-week
> change request — it's a sentence, and you re-share the link before the meeting
> ends."

**Close on this:**

> "And this isn't a throwaway. It's a real repo. So the dev team doesn't start
> from a 40-page requirements doc — they start from something the business has
> already clicked through and signed off."

---

## What to say if asked

| Question | Answer |
|---|---|
| "Is this production code?" | No — it's a prototype, and that's the point. It's the *starting artefact* for the dev team, not the finished product. |
| "Did you pre-build this?" | Yes, so the 90 seconds is reliable. `.\go.ps1 -Live` regenerates it with Copilot in front of you — takes a few minutes, so it's a workshop exercise, not a keynote one. |
| "Does it need Figma?" | No. This runs with zero Figma access. The design canvas here is a stand-in, built from the same stylesheet as the prototype. If you have a Figma Dev/Full seat, Copilot can read your real file through the Figma MCP server — but nothing in this demo depends on it. |
| "Could my BA really do this?" | Yes — that's the claim being tested. They need Copilot and a folder. They do not need to know HTML. |
| "What about our design system?" | Point it at your tokens and it reuses them. Here, the prototype and the design file share one stylesheet — `assets/screens.css`. |
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
│   └── canvas.css          design-tool chrome
└── prototype/
    ├── index.html          the "after": same 4 screens, wired up
    ├── prototype.css       routing, validation, device shell
    └── app.js              ~200 lines of plain browser JavaScript
```

The before and after **share `assets/screens.css`**. That is deliberate: it's the
honest version of "it reused our design system", and it means the frames on the
canvas are the same pixels as the working screens, not a redraw.

---

## Presenter notes

- **Press `d`** in the prototype to fill the form instantly — use it if you're
  short on time. Typing a real name from the audience is better if you have 10
  seconds spare.
- **Don't explain MCP, tokens, or HTML.** This audience doesn't care and the
  clock doesn't allow it. Keep every sentence in business language.
- **Resist the demo of the terminal.** The browser is the star. The terminal is
  the autocue.
- **The silence at 0:10 is the demo.** Let them try to click a picture.
