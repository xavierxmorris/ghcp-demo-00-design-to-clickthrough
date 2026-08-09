# Demo 00 — design file → click-through prototype

> **Difficulty:** ⭐
> **Audience:** business analysts, product owners, delivery leads — anyone who is *not* a developer
> **Length:** 90 seconds
> **Prerequisites:** none

```powershell
.\go.ps1
```

That's it. No install, no server, no Node, no Python, no Figma seat, no network.
The pages run straight off the filesystem, so this works on a locked-down laptop
and on conference wifi that has given up.

---

## The one idea

> A design file is a **picture of an app**. Everyone signs it off; nobody has ever
> used it. One sentence of plain English turns it into something they can click —
> and changing it is another sentence, not another sprint.

This is the demo to open with when the room is **not** full of engineers. It never
mentions a framework, a token, or a line of HTML.

---

## What happens

| Beat | Time | What the room sees |
|---|---|---|
| **The handover** | 0:00 | A design file with four frames opens. "Click *Get started*." Nothing happens. |
| **The ask** | 0:20 | One plain-English sentence. No ticket, no sprint, no developer. |
| **The build** | 0:35 | Three files. It reused the existing design system. |
| **The pay-off** | 0:45 | The same four screens — now clickable, with validation and memory. |
| **The iteration** | 1:15 | A stakeholder change request becomes another sentence. |

The demo hinges on the silence at 0:10, when someone tries to click a button on a
picture and nothing happens.

### Why it lands with a business audience

- **The prototype remembers.** The review screen shows the name *the audience
  member* typed — not a placeholder. A design file physically cannot do that.
- **It says no.** Leave the email blank and it stops you, in red. Skip the consent
  tick and it blocks you.
- **"It reused our design system" is literally true.** The design canvas and the
  working prototype share one stylesheet, [`assets/screens.css`](./assets/screens.css).
  The frames are the same pixels as the screens, not a redraw.
- **It closes on the handoff**, not on a limitation: this is a real repo, so the
  dev team starts from something the business has already clicked through.

---

## Running it

| Command | Use it when |
|---|---|
| `.\go.ps1` | Timed 90-second run. |
| `.\go.ps1 -Manual` | **Presenting live.** Enter advances each beat, so questions can't run down the clock. |
| `.\go.ps1 -Check` | Pre-flight before you walk on stage. Exits 0/1, CI-safe. |
| `.\go.ps1 -NoBrowser` | Rehearsing the words without opening windows. |
| `.\go.ps1 -Live` | Workshop mode — Copilot really rebuilds the prototype into `prototype-live\`. Minutes, not seconds. Your known-good copy is never touched. |

Full presenter script, including what to say and how to answer the awkward
questions: **[`RUN-SHEET.md`](./RUN-SHEET.md)**.

Prefer to skip the terminal? Just open the two pages side by side:

- `design/canvas.html` — the before
- `prototype/index.html` — the after

---

## Layout

```
.
├── go.ps1                  the runner — this is the whole demo
├── RUN-SHEET.md            presenter run-sheet: beats, script, Q&A
├── assets/
│   └── screens.css         ONE design system, shared by both sides
├── design/
│   ├── canvas.html         the "before": four static frames, inert on purpose
│   └── canvas.css          design-tool chrome
└── prototype/
    ├── index.html          the "after": same four screens, wired up
    ├── prototype.css       routing, validation, device shell
    └── app.js              plain browser JavaScript, no framework
```

---

## Honesty notes

Worth being straight about these if anyone asks — the demo is stronger for it.

- **The prototype is pre-built** so the 90 seconds is reliable. It was generated
  by Copilot from the design frames, and `.\go.ps1 -Live` regenerates it in front
  of you. That takes minutes, which is why it's a workshop exercise rather than a
  keynote one.
- **The design canvas is a stand-in for a design tool**, not a screenshot of one
  and not a live Figma connection. It's built from the same stylesheet as the
  prototype, which is exactly why the two sides match so precisely. Nothing here
  touches the Figma API, consumes a seat, or needs a licence.
- **This is prototype code, not production code.** That's the point. It's the
  starting artefact for a delivery team, not the finished product.
- **No data goes anywhere.** Everything stays in the browser. Nothing is
  submitted, nothing is stored, there is no backend.
- **Aurora is fictional.** The brand, the product, the numbers and
  `jordan@example.com` are all invented for the demo.

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
