<#
.SYNOPSIS
    90-second demo: a one-page BRD becomes a working click-through prototype.

.DESCRIPTION
    One command. No server, no Node, no Python, no design-tool licence, no
    network. The pages run straight off the filesystem, so this works on a
    locked-down laptop and on conference wifi that has given up.

    Beats:
      1. The BRD        - a one-page business requirements document. Familiar,
                          approved, and completely un-clickable.
      2. The ask        - one plain-English sentence. No code, no ticket.
      3. The prototype  - the journey, working, with every screen traceable back
                          to a requirement reference.
      4. The revision   - the BA edits the BRD, not the code. v1.1 adds REQ-009,
                          and the prototype follows.

    Both prototypes were genuinely produced by Copilot from the documents in
    brd\. The full session transcripts are in iteration\. Nothing in this script
    pretends to generate code - it opens pages and prints presenter cues.

.PARAMETER Manual
    Advance each beat with Enter instead of a timer. Use this when presenting
    live - it means questions can't derail the run.

.PARAMETER Design
    Open the visual design handover (design\canvas.html) instead of the BRD in
    beat 1. Use it for design-led audiences. The BRD is the better opener for
    business analysts, because it is an artefact they own.

.PARAMETER Live
    Actually invoke Copilot CLI to rebuild the prototype from the BRD, into
    prototype-live\. Took ~17 minutes when captured. Great for a workshop,
    wrong for a 90-second slot.

.PARAMETER Check
    Validate the demo assets and exit. Prints a verdict and sets the exit code.

.PARAMETER NoBrowser
    Print the beats without opening browser windows.

.EXAMPLE
    .\go.ps1
    The full timed run.

.EXAMPLE
    .\go.ps1 -Manual
    Same run, you control the pacing.
#>

[CmdletBinding()]
param(
    [switch]$Manual,
    [switch]$Design,
    [switch]$Live,
    [switch]$Check,
    [switch]$NoBrowser
)

$ErrorActionPreference = 'Stop'
$root = $PSScriptRoot

$Brd       = Join-Path $root 'brd\aurora-everyday-account-brd.html'
$BrdV11    = Join-Path $root 'brd\aurora-everyday-account-brd-v1.1.html'
$Canvas    = Join-Path $root 'design\canvas.html'
$Prototype = Join-Path $root 'prototype\index.html'
$V2        = Join-Path $root 'prototype-v2\index.html'

$Assets = @(
    'brd\aurora-everyday-account-brd.html',
    'brd\aurora-everyday-account-brd-v1.1.html',
    'assets\screens.css',
    'design\canvas.html',
    'design\canvas.css',
    'prototype\index.html',
    'prototype\prototype.css',
    'prototype\app.js',
    'prototype-v2\index.html',
    'prototype-v2\prototype.css',
    'prototype-v2\app.js',
    'iteration\copilot-run-01-brd-to-prototype.log',
    'iteration\copilot-run-02-brd-v11-to-v2.log'
)

$Prompt = 'Read the business requirements document in brd\. Build a working ' +
          'click-through prototype that satisfies every requirement and business ' +
          'rule in it, using our existing Aurora design system. Tag each screen ' +
          'with the requirement references it satisfies.'

$IteratePrompt = 'The BRD has been revised to v1.1. Compare it with v1.0, work out ' +
                 'what changed, and update the prototype to match.'

# Real, measured facts. Both runs are evidenced by transcripts in iteration\.
# If you re-run either one, re-measure it - never quote a number you did not take.
$RunOne = [ordered]@{
    'Input'      = 'BRD-2026-014 v1.0, one page, 8 requirements + 5 rules'
    'Wall clock' = '16 min 56 sec'
    'Produced'   = 'prototype\ - 3 files, no framework, no build step'
    'Verified'   = '78 checks, headless Chromium AND installed Edge 151'
}
$RunTwo = [ordered]@{
    'Input'      = 'BRD v1.1 - adds REQ-009 (joint account) and BR-06'
    'Wall clock' = '16 min 31 sec'
    'Produced'   = 'prototype-v2\ - +551 / -31 lines'
    'Verified'   = '45 checks, both browsers, v1.0 prototype untouched'
}

# --------------------------------------------------------------------- ui ---

function Write-Rule {
    param([string]$Text = '')
    if ($Text) {
        $pad = 74 - $Text.Length - 4
        if ($pad -lt 0) { $pad = 0 }
        Write-Host ''
        Write-Host ("-- $Text " + ('-' * $pad)) -ForegroundColor DarkGray
    } else {
        Write-Host ('-' * 74) -ForegroundColor DarkGray
    }
}

function Write-Beat {
    param([string]$Clock, [string]$Title)
    Write-Host ''
    Write-Host "  $Clock  " -ForegroundColor DarkGray -NoNewline
    Write-Host $Title -ForegroundColor White
}

function Write-Say {
    param([string]$Text)
    Write-Host '        " ' -ForegroundColor DarkGray -NoNewline
    Write-Host $Text -ForegroundColor Cyan
}

function Write-Note {
    param([string]$Text)
    Write-Host "        $Text" -ForegroundColor DarkGray
}

function Write-Ok {
    param([string]$Text)
    Write-Host '  [ OK ] ' -ForegroundColor Green -NoNewline
    Write-Host $Text -ForegroundColor Gray
}

function Write-Fail {
    param([string]$Text)
    Write-Host '  [FAIL] ' -ForegroundColor Red -NoNewline
    Write-Host $Text -ForegroundColor Gray
}

function Wait-Beat {
    param([int]$Seconds)

    if ($Manual) {
        Write-Host ''
        Write-Host '        [Enter] to continue ' -ForegroundColor DarkGray -NoNewline
        try {
            [void](Read-Host)
            return
        } catch {
            # Redirected or non-interactive host (CI, piped output): fall through
            # to the timer rather than dying mid-demo.
            Write-Host ''
            Write-Note 'Non-interactive host - using the timer instead.'
        }
    }

    for ($i = $Seconds; $i -gt 0; $i--) {
        Write-Host ("`r        next in {0,2}s " -f $i) -ForegroundColor DarkGray -NoNewline
        Start-Sleep -Seconds 1
    }
    Write-Host "`r                        `r" -NoNewline
}

function Open-Page {
    param([string]$Path, [string]$Label)

    if ($NoBrowser) {
        Write-Note "would open: $Label"
        return
    }
    Start-Process $Path | Out-Null
    Write-Note "opened: $Label"
}

# -------------------------------------------------------------- preflight ---

function Test-Assets {
    $failed = 0
    foreach ($rel in $Assets) {
        $full = Join-Path $root $rel
        if (Test-Path $full) {
            $size = (Get-Item $full).Length
            Write-Ok ("{0,-46} {1,7:N0} bytes" -f $rel, $size)
        } else {
            Write-Fail ("{0,-46} missing" -f $rel)
            $failed++
        }
    }
    return $failed
}

try { Clear-Host } catch { }   # redirected/CI hosts have no console buffer

Write-Host ''
Write-Host '  ONE-PAGE BRD  ->  CLICK-THROUGH PROTOTYPE  ->  REVISED PROTOTYPE' -ForegroundColor White
Write-Host '  1:15 of beats. No code written by hand. No build step. No network.' -ForegroundColor DarkGray

Write-Rule 'Preflight'
$failed = Test-Assets

if ($failed -gt 0) {
    Write-Host ''
    Write-Host "  NOT READY - $failed asset(s) missing." -ForegroundColor Red
    exit 1
}

if ($Check) {
    Write-Host ''
    Write-Host ("  READY - {0}/{0} assets present." -f $Assets.Count) -ForegroundColor Green
    Write-Host '  Prerequisites: none.  Servers required: 0.  Network required: no.' -ForegroundColor DarkGray
    Write-Host ''
    exit 0
}

# ------------------------------------------------------------- live mode ---

if ($Live) {
    Write-Rule 'Live mode'
    Write-Note 'Rebuilding the prototype from the BRD for real, in front of you.'
    Write-Note 'Output goes to prototype-live\ - prototype\ and prototype-v2\ are untouched.'
    Write-Note 'The captured run took about 17 minutes. Do not do this in the 90s slot.'
    Write-Host ''

    $livePrompt = 'Read the business requirements document at ' +
                  'brd/aurora-everyday-account-brd.html. Build a working ' +
                  'click-through prototype in a new folder called prototype-live ' +
                  'that satisfies every requirement REQ-001 to REQ-008 and every ' +
                  'business rule BR-01 to BR-05. It must run straight from the ' +
                  'filesystem with no server, framework, library, build step or ' +
                  'CDN. Use the existing design system at assets/screens.css ' +
                  'unmodified. Tag each screen with a data-req attribute listing ' +
                  'the requirements it satisfies. Do not modify the prototype or ' +
                  'prototype-v2 folders. Verify in a real browser before finishing.'

    Write-Host '  copilot -p "<the prompt below>" --allow-all-tools' -ForegroundColor Yellow
    Write-Host ''
    Write-Host "  $livePrompt" -ForegroundColor Gray
    Write-Host ''

    $liveSw = [System.Diagnostics.Stopwatch]::StartNew()
    & copilot -C $root -p $livePrompt --allow-all-tools
    $liveSw.Stop()

    $liveIndex = Join-Path $root 'prototype-live\index.html'
    if (Test-Path $liveIndex) {
        Write-Ok ('prototype-live\index.html generated in {0:mm\:ss}' -f $liveSw.Elapsed)
        Open-Page $liveIndex 'the freshly generated prototype'
    } else {
        Write-Fail 'no prototype-live\index.html was produced'
        exit 1
    }
    exit 0
}

# ------------------------------------------------------------ the 90s run ---

$sw = [System.Diagnostics.Stopwatch]::StartNew()

Write-Rule 'Run'

# ---- Beat 1 -----------------------------------------------------------------
Write-Beat '0:00' 'THE BUSINESS ASSET'
if ($Design) {
    Open-Page $Canvas 'the design handover - four frames, read-only'
    Write-Say 'This is what design handed over on Friday. Four screens.'
    Write-Say 'Go on - click the Get started button. Nothing happens.'
} else {
    Open-Page $Brd 'BRD-2026-014 v1.0 - one page, approved for build'
    Write-Say 'One page. Eight requirements, five business rules, approved.'
    Write-Say 'Your BA wrote this. Everybody signed it.'
    Write-Note 'And now it waits in a queue until a developer is free.'
}
Write-Note 'Nobody in that approval chain has ever used the thing they approved.'
Wait-Beat 15

# ---- Beat 2 -----------------------------------------------------------------
Write-Beat '0:15' 'THE ASK'
Write-Host ''
Write-Host "  $Prompt" -ForegroundColor Yellow
Write-Host ''
foreach ($k in $RunOne.Keys) {
    Write-Host ('          {0,-11} {1}' -f $k, $RunOne[$k]) -ForegroundColor Green
}
Write-Host ''
Write-Say 'One sentence. The BRD is the input - not a spec someone rewrote.'
Write-Note 'Measured, not staged. The transcript is in iteration\.'
Wait-Beat 12

# ---- Beat 3 -----------------------------------------------------------------
Write-Beat '0:27' 'THE PROTOTYPE'
Open-Page $Prototype 'the click-through prototype, built from the BRD'
Write-Say 'Click Get started. Type a name. Leave the email blank - it stops you.'
Write-Say 'The review screen shows what YOU typed. REQ-005, and it holds.'
Write-Say 'Look under the phone: every screen tags the requirements it satisfies.'
Write-Note 'Tick "Show BRD refs on the screen" to label them in place.'
Write-Note 'Presenter shortcut: press "d" to fill the form instantly.'
Wait-Beat 26

# ---- Beat 4 -----------------------------------------------------------------
# The honest core: the analyst edits the BUSINESS ASSET, and the build follows.
Write-Beat '0:53' 'THE REVISION'
Open-Page $BrdV11 'BRD v1.1 - REQ-009 and BR-06, change-barred'
Write-Host ''
Write-Host "  $IteratePrompt" -ForegroundColor Yellow
Write-Host ''
foreach ($k in $RunTwo.Keys) {
    Write-Host ('          {0,-11} {1}' -f $k, $RunTwo[$k]) -ForegroundColor Green
}
Write-Host ''
Open-Page $V2 'version 2 - built from the revised BRD'
Write-Say 'The analyst changed the DOCUMENT. Not the code. Not a ticket.'
Write-Say 'Pick "Joint Everyday Account" - two fields appear, and they validate.'
Write-Say 'Review now shows both applicants. The trace chips include REQ-009.'
Write-Note 'The BRD stays the source of truth. The build follows it.'
Wait-Beat 22

$sw.Stop()

Write-Host ''
Write-Rule
Write-Host ''
Write-Host ('  DONE - {0:mm\:ss} elapsed' -f $sw.Elapsed) -ForegroundColor Green
Write-Host '  BRD -> working prototype -> revised BRD -> revised prototype,' -ForegroundColor DarkGray
Write-Host '  with nobody writing code by hand at any point.' -ForegroundColor DarkGray
Write-Host ''
Write-Host '  Run again       : .\go.ps1' -ForegroundColor DarkGray
Write-Host '  Present live    : .\go.ps1 -Manual      (Enter advances each beat)' -ForegroundColor DarkGray
Write-Host '  Audit the claims: iteration\ (both full session transcripts)' -ForegroundColor DarkGray
Write-Host '  Design-led room: .\go.ps1 -Design       (opens the visual handover instead)' -ForegroundColor DarkGray
Write-Host ''
