# Workshop: turn requirements into observable acceptance

**Audience:** business analysts, product owners, and delivery leads.
**Time:** 45-60 minutes; allow additional time for optional live generation.
**Outcome:** an acceptance record and a change-impact assessment that do not
require the participant to write code.

Terravale and all safety statistics are fictional. Use synthetic report data.
This is a sign-off prototype, not a safety-reporting channel; nothing is sent
to a supervisor or retained as an operational report.

## 1. Choose replay or authoring - 5 minutes

| Track | Prerequisites | What actually happens |
| --- | --- | --- |
| Inspect the shipped pages | Browser | Opens already-built HTML locally |
| Presenter replay | PowerShell and browser | `go.ps1` opens pages and prints cues |
| Requirements workshop | Browser, editor or notes | You evaluate and revise acceptance criteria |
| Optional live authoring | Copilot access, network, approved tools | A new generation run with its own duration and results |

```powershell
.\go.ps1 -Check
.\go.ps1 -Manual
```

Run them separately. `-Check` verifies the listed assets exist; it does not
execute the historical 135/61 browser assertions. `-Manual` is interactive
presentation mode. The original run evidence remains under [iteration/](iteration/).

## 2. Read the business contract - 8 minutes

Open [BRD v1.0](brd/terravale-field-hazard-report-brd.html) before
[prototype/index.html](prototype/index.html). Identify a requirement, a business
rule, and an acceptance criterion. They are not interchangeable.

| Artifact | Question it answers |
| --- | --- |
| Numbered requirement | What must the journey let a person do? |
| Business rule | Under what conditions is an action valid? |
| Acceptance criterion | What observable result lets us accept it? |
| Design direction in section 6 | How should the prototype look and behave in its stated setting? |
| Trace chip in the app | Which requirement does the implementation claim to satisfy? |

A trace chip is a claim of coverage, not proof. Pick `REQ-005` and check whether
the review screen displays your actual input rather than the demo-fill values.

```text
Read the BRD only. List each requirement and business rule with one observable
acceptance check. Mark ambiguities separately. Do not infer backend services
from prototype wording and do not change the document or implementation.
```

## 3. Walk the positive, negative, and state cases - 12 minutes

Use a fictional name such as `Alex Demo`, an address such as
`alex@example.test`, and a date in the format specified by the BRD.
Record actual results in a copy of this table:

| Check | Reference | Expected observation |
| --- | --- | --- |
| Start from introduction | REQ-002 | One action starts the report |
| Blank name, then one character | REQ-004, BR-01 | Progress refused with a specific message |
| Two-character name | BR-01 | Name no longer fails the minimum-length rule |
| Blank/malformed email | REQ-004, BR-02 | Error identifies the email problem |
| Missing or wrong-format date | BR-03 | Date input is refused visibly |
| Edit, continue, go back | REQ-008 | Values remain during the current journey |
| Review | REQ-005 | All entered values are represented accurately |
| Submit without declaration | REQ-006, BR-04 | Submission remains blocked |
| Confirm declaration and submit | REQ-007, BR-05 | Simulated confirmation; no real dispatch |

Do not infer real calendar validation, future-date policy, offline synchronization,
or persistence after refresh from a format-only requirement. If you need those,
write them as additional acceptance criteria first.

Check keyboard navigation and visible errors as well as the happy-path clicks.
The no-storage rule means back-navigation retention is not durable storage.

**Checkpoint:** one requirement has a positive and negative observation, and
one state-retention check uses values you entered yourself.

## 4. Analyze the revision before opening v2 - 10 minutes

Read [BRD v1.1](brd/terravale-field-hazard-report-brd-v1.1.html).
It adds `REQ-009` and `BR-06`: a risk choice and conditional supervisor details.

```text
Compare BRD v1.0 and v1.1. Separate new requirements, changed behavior, and
unchanged regression obligations. Propose acceptance checks for each risk
choice and for changing a choice after entering supervisor details.
Do not claim that notifications are implemented.
```

Then open [prototype-v2/index.html](prototype-v2/index.html):

| Risk path | Check |
| --- | --- |
| Low | Progress does not require supervisor details |
| Moderate | Same conditional requirement boundary as Low |
| High potential, details blank | BR-06 blocks progression |
| High potential, invalid supervisor email | Same email standard as BR-02 |
| High potential, valid details | Review includes the relevant escalation details |
| High potential changed to Low | Determine that no hidden mandatory field blocks the Low path |

If the BRD does not specify whether hidden supervisor values should be cleared
or retained, record that as a decision for the document owner. Do not quietly
assume your preferred behavior is already required.

## 5. Optional authoring with a safe boundary - 10 minutes to prepare

Use a disposable clone or an isolated environment containing only approved
demo material. The shipped `-Live` runner grants all tools; requesting a new
output folder does not prevent edits elsewhere.

A more controlled option is an interactive Copilot session in that clone:

```text
Read BRD v1.1 and the existing design-system asset. Propose a plan for a
click-through prototype in a new workshop-output folder. Keep the shipped
prototypes, BRDs, and assets unchanged. No backend, storage, or real report
submission. Show the plan before edits; request approval for tool execution.
```

After generation, repeat the same acceptance matrix against the new output.
Record elapsed time and any failures honestly. A different layout can satisfy
the same requirement; familiar markup is not the acceptance criterion.

## 6. Debrief: what is still missing? - 10 minutes

Prepare a one-page delivery handoff containing requirement IDs, expected versus
observed behavior, screenshots, unresolved decisions, and the exact revision
reviewed. Identify production work explicitly:

| Production concern | Why the prototype does not settle it |
| --- | --- |
| Reporting, notifications, identity | No backend or delivery mechanism exists |
| Offline persistence/synchronization | Local viewing is not an offline data architecture |
| Accessibility | Selected checks are not a full conformance assessment |
| Security, privacy, retention | Synthetic browser-only data avoids, rather than solves, these requirements |
| Field usability | A desktop demonstration does not establish operation in real field conditions |

For a stretch exercise, draft a photo-attachment requirement with file-size,
privacy, removal, and offline expectations. Stop at the revised contract unless
implementation is explicitly in scope.

## Troubleshooting, reset, and evidence

If a page fails to open, inspect the extracted folder structure and its
relative assets. If values are lost after refresh, distinguish that from losing
values on Back: only the latter is part of this journey's state requirement.

Reload to start a fresh synthetic report. Preserve any generated exercise
folder separately; never delete someone else's prototype edits to reset a demo.

Retain the matrix, a before/after requirements comparison, and observed
limitations. Historical generation timings are historical evidence, not a
promise of today's speed or a result from `-Check`.

Guide reviewed **2026-09-07** against the shipped BRD versions and runner.
For stronger test traceability, continue with
[Demo 10](https://github.com/xavierxmorris/ghcp-demo-10-ato-brd-to-clickthrough).
