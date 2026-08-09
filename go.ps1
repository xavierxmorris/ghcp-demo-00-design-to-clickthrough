<#
.SYNOPSIS
    90-second demo: a design file becomes a working click-through prototype.

.DESCRIPTION
    One command. No server, no Node, no Python, no design-tool licence, no network.
    The pages run straight off the filesystem, so this works on a locked-down
    laptop and on conference wifi that has given up.

    Beats:
      1. The handover   - four static design frames. Click one. Nothing happens.
      2. The ask        - one plain-English sentence. No code, no ticket.
      3. The prototype  - the same four screens, now usable.
      4. The iteration  - a real change request, really made by Copilot, and
                          the changed prototype opened beside it.

    Beat 4 is the important one. The v2 prototype in prototype-v2\ was genuinely
    produced by Copilot from the change request below - the full transcript is in
    iteration\copilot-run.log. Nothing in this script pretends to generate code.

.PARAMETER Manual
    Advance each beat with Enter instead of a timer. Use this when presenting
    live - it means questions can't derail the run.

.PARAMETER Live
    Actually invoke Copilot CLI to regenerate the prototype from the design
    frames, into prototype-live\. Takes minutes, not seconds, and the output
    varies run to run. Great for a workshop, wrong for a 90-second slot.

.PARAMETER Check
    Validate the demo assets and exit. Prints a verdict and sets the exit code.

.PARAMETER NoBrowser
    Print the beats without opening browser windows.

.EXAMPLE
    .\go.ps1
    The full 90-second timed run.

.EXAMPLE
    .\go.ps1 -Manual
    Same run, you control the pacing.
#>

[CmdletBinding()]
param(
    [switch]$Manual,
    [switch]$Live,
    [switch]$Check,
    [switch]$NoBrowser
)

$ErrorActionPreference = 'Stop'
$root = $PSScriptRoot

$Canvas    = Join-Path $root 'design\canvas.html'
$Prototype = Join-Path $root 'prototype\index.html'
$V2        = Join-Path $root 'prototype-v2\index.html'
$RunLog    = Join-Path $root 'iteration\copilot-run.log'

$Assets = @(
    'assets\screens.css',
    'design\canvas.html',
    'design\canvas.css',
    'prototype\index.html',
    'prototype\prototype.css',
    'prototype\app.js',
    'prototype-v2\index.html',
    'prototype-v2\prototype.css',
    'prototype-v2\app.js',
    'iteration\copilot-run.log'
)

$Prompt = 'Here are four design frames for the Aurora everyday-account signup. ' +
          'Turn them into a working click-through prototype I can send round for ' +
          'sign-off: the buttons should move between screens, the form should ' +
          'validate, and the review screen should show what I actually typed.'

$IteratePrompt = 'Add a joint account option. When the customer chooses a joint ' +
                 'account, ask for the second applicant''s name and email, ' +
                 'validate them the same way, and show them on the review screen.'

# Real, measured facts about the run that produced prototype-v2\.
# If you re-run it, update these - never quote a number you did not measure.
$RunFacts = [ordered]@{
    'Captured'   = '9 August 2026'
    'Wall clock' = '9 min 34 sec'
    'Changed'    = '3 files, +105 / -5 lines'
    'Verified'   = "30 / 30 of Copilot's own browser checks"
    'Transcript' = 'iteration\copilot-run.log (187 lines)'
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
            Write-Ok ("{0,-26} {1,7:N0} bytes" -f $rel, $size)
        } else {
            Write-Fail ("{0,-26} missing" -f $rel)
            $failed++
        }
    }
    return $failed
}

try { Clear-Host } catch { }   # redirected/CI hosts have no console buffer

Write-Host ''
Write-Host '  DESIGN FILE  ->  CLICK-THROUGH PROTOTYPE' -ForegroundColor White
Write-Host '  75 seconds. No code written by hand. No build step. No network.' -ForegroundColor DarkGray

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
    Write-Note 'Re-running the iteration for real, in front of you.'
    Write-Note 'Output goes to prototype-live\ - prototype\ and prototype-v2\ are untouched.'
    Write-Note 'The captured run took about 10 minutes. Do not do this in the 90s slot.'
    Write-Host ''

    $livePrompt = 'Copy the prototype folder to a new folder called prototype-live, ' +
                  'then make this change in prototype-live only: ' + $IteratePrompt +
                  ' Keep the existing visual style exactly - reuse assets/screens.css, ' +
                  'and add no framework, library, build step or CDN. Do not modify ' +
                  'anything in the original prototype folder.'

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
Write-Beat '0:00' 'THE HANDOVER'
Open-Page $Canvas 'the design handover - four frames, read-only'
Write-Say 'This is what design handed over on Friday. Four screens.'
Write-Say 'Go on - click the Get started button. Nothing happens.'
Write-Note 'It is a picture of an app. Everyone signs it off, nobody has used it.'
Wait-Beat 15

# ---- Beat 2 -----------------------------------------------------------------
Write-Beat '0:15' 'THE ASK'
Write-Host ''
Write-Host "  $Prompt" -ForegroundColor Yellow
Write-Host ''
Write-Say 'That is the whole instruction. One sentence, plain English.'
Write-Note 'No ticket. No sprint. Nobody wrote code by hand.'
Wait-Beat 12

# ---- Beat 3 -----------------------------------------------------------------
Write-Beat '0:27' 'THE PROTOTYPE'
Open-Page $Prototype 'the click-through prototype'
Write-Say 'Same four screens. Now click Get started.'
Write-Say 'Type a name. Leave the email blank - it stops you.'
Write-Say 'And on the review screen: that is what YOU typed, not Jordan Blake.'
Write-Note 'Presenter shortcut: press "d" in the browser to fill the form instantly.'
Write-Note 'A design file cannot do that. This one remembers.'
Wait-Beat 26

# ---- Beat 4 -----------------------------------------------------------------
# The honest core of the demo: a real change request, really executed by
# Copilot, with the resulting build opened side by side.
Write-Beat '0:53' 'THE ITERATION'
Write-Host ''
Write-Host "  $IteratePrompt" -ForegroundColor Yellow
Write-Host ''
Write-Host '        Copilot actually ran this. Measured, not staged:' -ForegroundColor DarkGray
foreach ($k in $RunFacts.Keys) {
    Write-Host ('          {0,-11} {1}' -f $k, $RunFacts[$k]) -ForegroundColor Green
}
Write-Host ''
Open-Page $V2 'version 2 - built by Copilot from that sentence'
Write-Say 'Pick "Joint Everyday Account" in the dropdown.'
Write-Say 'Two new fields appear, they validate, and they reach the review screen.'
Write-Note 'That is a stakeholder changing their mind, answered in minutes.'
Write-Note "Transcript is in the repo if anyone wants to audit it."
Wait-Beat 22

$sw.Stop()

Write-Host ''
Write-Rule
Write-Host ''
Write-Host ('  DONE - {0:mm\:ss} elapsed' -f $sw.Elapsed) -ForegroundColor Green
Write-Host '  Design handover -> working prototype -> revised prototype,' -ForegroundColor DarkGray
Write-Host '  with nobody writing code by hand at any point.' -ForegroundColor DarkGray
Write-Host ''
Write-Host '  Run again       : .\go.ps1' -ForegroundColor DarkGray
Write-Host '  Present live    : .\go.ps1 -Manual      (Enter advances each beat)' -ForegroundColor DarkGray
Write-Host '  Audit the claim : iteration\copilot-run.log' -ForegroundColor DarkGray
Write-Host '  Do it again live: .\go.ps1 -Live        (workshop mode, ~10 minutes)' -ForegroundColor DarkGray
Write-Host ''
