<#
.SYNOPSIS
    90-second demo: a design file becomes a working click-through prototype.

.DESCRIPTION
    One command. No server, no Node, no Python, no Figma seat, no network.
    The pages run straight off the filesystem, so this works on a locked-down
    laptop and on conference wifi that has given up.

    Beats:
      1. The handover   - four static design frames. Click one. Nothing happens.
      2. The ask        - one plain-English sentence. No code, no ticket.
      3. The build      - what Copilot produced.
      4. The pay-off    - the same four screens, now clickable.
      5. The iteration  - changing it is another sentence, not another sprint.

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

$Assets = @(
    'assets\screens.css',
    'design\canvas.html',
    'design\canvas.css',
    'prototype\index.html',
    'prototype\prototype.css',
    'prototype\app.js'
)

$Prompt = 'Here are four design frames for the Aurora everyday-account signup. ' +
          'Turn them into a working click-through prototype I can send round for ' +
          'sign-off: the buttons should move between screens, the form should ' +
          'validate, and the review screen should show what I actually typed.'

$IteratePrompt = 'Add an ID verification step between details and review, and ' +
                 'change the account options to include a joint account.'

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
        [void](Read-Host)
        return
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
Write-Host '  90 seconds. No developer. No build step. No network.' -ForegroundColor DarkGray

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
    Write-Host '  Figma API calls required: 0     Servers required: 0' -ForegroundColor DarkGray
    Write-Host ''
    exit 0
}

# ------------------------------------------------------------- live mode ---

if ($Live) {
    Write-Rule 'Live mode'
    Write-Note 'Regenerating the prototype with Copilot CLI.'
    Write-Note 'Output goes to prototype-live\ - your known-good copy is untouched.'
    Write-Note 'This takes minutes and varies run to run. Do not use it in the 90s slot.'
    Write-Host ''

    $livePrompt = $Prompt + ' The design frames and their stylesheet are in ' +
                  'design\canvas.html and assets\screens.css. Reuse that exact ' +
                  'visual system - same tokens, same spacing, same type scale. ' +
                  'Write plain HTML, CSS and JavaScript with no framework and no ' +
                  'build step, into a new folder called prototype-live.'

    Write-Host '  copilot -p "<the prompt below>" --allow-all-tools' -ForegroundColor Yellow
    Write-Host ''
    Write-Host "  $livePrompt" -ForegroundColor Gray
    Write-Host ''

    & copilot -C $root -p $livePrompt --allow-all-tools

    $liveIndex = Join-Path $root 'prototype-live\index.html'
    if (Test-Path $liveIndex) {
        Write-Ok 'prototype-live\index.html generated'
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
Open-Page $Canvas 'the design file - four frames, read-only'
Write-Say 'This is what design handed over on Friday. Four screens.'
Write-Say 'Go on - click the Get started button. Nothing happens.'
Write-Note 'It is a picture of an app. Everyone signs it off, nobody has used it.'
Wait-Beat 20

# ---- Beat 2 -----------------------------------------------------------------
Write-Beat '0:20' 'THE ASK'
Write-Host ''
Write-Host "  $Prompt" -ForegroundColor Yellow
Write-Host ''
Write-Say 'That is the whole instruction. One sentence, plain English.'
Write-Note 'No JIRA ticket. No sprint. No developer. An analyst typed that.'
Wait-Beat 15

# ---- Beat 3 -----------------------------------------------------------------
Write-Beat '0:35' 'THE BUILD'
foreach ($rel in @('prototype\index.html', 'prototype\prototype.css', 'prototype\app.js')) {
    $size = (Get-Item (Join-Path $root $rel)).Length
    Write-Host ('        + {0,-24} {1,6:N0} bytes' -f $rel, $size) -ForegroundColor Green
    Start-Sleep -Milliseconds 220
}
Write-Say 'Three files. Same colours, same type, same spacing as the design.'
Write-Note 'It reused the design system stylesheet rather than inventing a new one.'
Wait-Beat 10

# ---- Beat 4 -----------------------------------------------------------------
Write-Beat '0:45' 'THE PAY-OFF'
Open-Page $Prototype 'the click-through prototype'
Write-Say 'Same four screens. Now click Get started.'
Write-Say 'Type a name. Leave the email blank - it stops you.'
Write-Say 'And on the review screen: that is what YOU typed, not Jordan Blake.'
Write-Note 'Presenter shortcut: press "d" in the browser to fill the form instantly.'
Write-Note 'A design file cannot do that. This one remembers.'
Wait-Beat 30

# ---- Beat 5 -----------------------------------------------------------------
Write-Beat '1:15' 'THE ITERATION'
Write-Host ''
Write-Host "  $IteratePrompt" -ForegroundColor Yellow
Write-Host ''
Write-Say 'Stakeholder asks for a change in the room. That is the change request.'
Write-Say 'Not a two-week ticket. A sentence, and you re-share the link.'
Write-Note 'And this is a real repo - so the dev team starts from something'
Write-Note 'the business has already clicked through and signed off.'
Wait-Beat 15

$sw.Stop()

Write-Host ''
Write-Rule
Write-Host ''
Write-Host ('  DONE - {0:mm\:ss} elapsed' -f $sw.Elapsed) -ForegroundColor Green
Write-Host '  Figma API calls: 0   Servers started: 0   Lines of code written by hand: 0' -ForegroundColor DarkGray
Write-Host ''
Write-Host '  Run again      : .\go.ps1' -ForegroundColor DarkGray
Write-Host '  Present live   : .\go.ps1 -Manual      (Enter advances each beat)' -ForegroundColor DarkGray
Write-Host '  Rebuild for real: .\go.ps1 -Live       (workshop mode, takes minutes)' -ForegroundColor DarkGray
Write-Host ''
