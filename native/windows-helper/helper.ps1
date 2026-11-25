param(
  [Parameter(Mandatory = $true)]
  [ValidateSet('list-windows', 'focus-window', 'close-window', 'inspect-uia', 'uia-click', 'uia-type', 'capture-screen', 'recycle-item')]
  [string]$Action,

  [Parameter(Mandatory = $false)]
  [string]$PayloadBase64 = ''
)

$ErrorActionPreference = 'Stop'
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8

$payload = @{}
if ($PayloadBase64 -ne '') {
  $jsonText = [System.Text.Encoding]::UTF8.GetString([Convert]::FromBase64String($PayloadBase64))
  $payload = $jsonText | ConvertFrom-Json
}

Add-Type @"
using System;
using System.Runtime.InteropServices;
public static class Win32Helper {
  [DllImport("user32.dll")]
  public static extern IntPtr GetForegroundWindow();

  [DllImport("user32.dll")]
  public static extern bool SetForegroundWindow(IntPtr hWnd);

  [DllImport("user32.dll")]
  public static extern bool ShowWindow(IntPtr hWnd, int nCmdShow);
}
"@

function Test-SensitiveTitle([string]$title, [string]$procName) {
  $blocked = @('1password', 'bitwarden', 'keepass', 'windows security', 'user account control', 'credential manager', 'authenticator', 'captcha', 'recaptcha', 'turnstile')
  $combined = ("$title $procName").ToLowerInvariant()
  foreach ($b in $blocked) {
    if ($combined.Contains($b)) { return $true }
  }
  return $false
}

switch ($Action) {
  'list-windows' {
    $fg = [Win32Helper]::GetForegroundWindow()
    $procs = Get-Process | Where-Object { $_.MainWindowHandle -ne 0 -and $_.MainWindowTitle -ne '' }
    $items = foreach ($p in $procs) {
      [PSCustomObject]@{
        hwnd         = [int64]$p.MainWindowHandle
        pid          = $p.Id
        processName  = "$($p.ProcessName).exe"
        title        = $p.MainWindowTitle
        isForeground = ($p.MainWindowHandle -eq $fg)
        isSensitive  = (Test-SensitiveTitle $p.MainWindowTitle $p.ProcessName)
      }
    }
    @{ ok = $true; windows = @($items) } | ConvertTo-Json -Depth 5 -Compress
  }

  'focus-window' {
    $targetPid = [int]$payload.pid
    $proc = Get-Process -Id $targetPid -ErrorAction Stop
    if (Test-SensitiveTitle $proc.MainWindowTitle $proc.ProcessName) {
      throw "Blocked sensitive security/credential window."
    }
    [void][Win32Helper]::ShowWindow($proc.MainWindowHandle, 9)
    $ok = [Win32Helper]::SetForegroundWindow($proc.MainWindowHandle)
    @{ ok = $ok; pid = $targetPid; title = $proc.MainWindowTitle } | ConvertTo-Json -Compress
  }

  'close-window' {
    $targetPid = [int]$payload.pid
    $proc = Get-Process -Id $targetPid -ErrorAction Stop
    if (Test-SensitiveTitle $proc.MainWindowTitle $proc.ProcessName) {
      throw "Blocked closing protected security window."
    }
    $closed = $proc.CloseMainWindow()
    @{ ok = $closed; pid = $targetPid } | ConvertTo-Json -Compress
  }

  'inspect-uia' {
    Add-Type -AssemblyName UIAutomationClient
    Add-Type -AssemblyName UIAutomationTypes
    $hwnd = if ($payload.hwnd) { [IntPtr][int64]$payload.hwnd } else { [Win32Helper]::GetForegroundWindow() }
    if ($hwnd -eq [IntPtr]::Zero) {
      throw "No active foreground window handle available."
    }
    $root = [System.Windows.Automation.AutomationElement]::FromHandle($hwnd)
    $rootName = $root.Current.Name
    if (Test-SensitiveTitle $rootName '') {
      throw "Blocked inspecting sensitive window."
    }
    $children = $root.FindAll([System.Windows.Automation.TreeScope]::Children, [System.Windows.Automation.Condition]::TrueCondition)
    $nodes = @()
    $limit = [Math]::Min($children.Count, 40)
    for ($i = 0; $i -lt $limit; $i++) {
      $el = $children.Item($i)
      if ($el.Current.IsPassword) { continue }
      $rect = $el.Current.BoundingRectangle
      $nodes += [PSCustomObject]@{
        name         = $el.Current.Name
        automationId = $el.Current.AutomationId
        controlType  = $el.Current.ControlType.ProgrammaticName
        isEnabled    = $el.Current.IsEnabled
        bounds       = @{
          x      = if ([double]::IsInfinity($rect.X)) { 0 } else { [int]$rect.X }
          y      = if ([double]::IsInfinity($rect.Y)) { 0 } else { [int]$rect.Y }
          width  = if ([double]::IsInfinity($rect.Width)) { 0 } else { [int]$rect.Width }
          height = if ([double]::IsInfinity($rect.Height)) { 0 } else { [int]$rect.Height }
        }
      }
    }
    @{ ok = $true; windowTitle = $rootName; elements = $nodes } | ConvertTo-Json -Depth 6 -Compress
  }

  'uia-click' {
    Add-Type -AssemblyName UIAutomationClient
    Add-Type -AssemblyName UIAutomationTypes
    $hwnd = [IntPtr][int64]$payload.hwnd
    $targetName = [string]$payload.elementName
    $root = [System.Windows.Automation.AutomationElement]::FromHandle($hwnd)
    if (Test-SensitiveTitle $root.Current.Name '') {
      throw "Blocked automating sensitive window."
    }
    $cond = New-Object System.Windows.Automation.PropertyCondition([System.Windows.Automation.AutomationElement]::NameProperty, $targetName)
    $el = $root.FindFirst([System.Windows.Automation.TreeScope]::Descendants, $cond)
    if ($null -eq $el) {
      throw "UI Automation element '$targetName' not found."
    }
    if ($el.Current.IsPassword) {
      throw "Blocked interacting with password element."
    }
    $invokePattern = $null
    if ($el.TryGetCurrentPattern([System.Windows.Automation.InvokePattern]::Pattern, [ref]$invokePattern)) {
      $invokePattern.Invoke()
      @{ ok = $true; method = 'UIA.InvokePattern'; element = $targetName } | ConvertTo-Json -Compress
    } else {
      throw "Element '$targetName' does not expose InvokePattern."
    }
  }

  'uia-type' {
    Add-Type -AssemblyName UIAutomationClient
    Add-Type -AssemblyName UIAutomationTypes
    Add-Type -AssemblyName System.Windows.Forms
    $hwnd = [IntPtr][int64]$payload.hwnd
    $text = [string]$payload.text
    $root = [System.Windows.Automation.AutomationElement]::FromHandle($hwnd)
    if (Test-SensitiveTitle $root.Current.Name '') {
      throw "Blocked typing into sensitive window."
    }
    $focused = [System.Windows.Automation.AutomationElement]::FocusedElement
    if ($null -ne $focused -and $focused.Current.IsPassword) {
      throw "Blocked typing into password input control."
    }
    [void][Win32Helper]::SetForegroundWindow($hwnd)
    Start-Sleep -Milliseconds 60
    [System.Windows.Forms.SendKeys]::SendWait($text)
    @{ ok = $true; length = $text.Length } | ConvertTo-Json -Compress
  }

  'capture-screen' {
    Add-Type -AssemblyName System.Windows.Forms
    Add-Type -AssemblyName System.Drawing
    $outPath = [string]$payload.outputPath
    $dir = Split-Path -Parent $outPath
    if (-not (Test-Path -LiteralPath $dir)) {
      New-Item -ItemType Directory -Force -Path $dir | Out-Null
    }
    $screens = [System.Windows.Forms.Screen]::AllScreens
    $idx = if ($null -ne $payload.displayIndex) { [Math]::Min([Math]::Max([int]$payload.displayIndex, 0), $screens.Length - 1) } else { 0 }
    $bounds = $screens[$idx].Bounds
    $bmp = New-Object System.Drawing.Bitmap($bounds.Width, $bounds.Height)
    $gfx = [System.Drawing.Graphics]::FromImage($bmp)
    try {
      $gfx.CopyFromScreen($bounds.Location, [System.Drawing.Point]::Empty, $bounds.Size)
      $bmp.Save($outPath, [System.Drawing.Imaging.ImageFormat]::Png)
      $info = Get-Item -LiteralPath $outPath
      @{ ok = $true; filePath = $outPath; width = $bounds.Width; height = $bounds.Height; sizeBytes = $info.Length } | ConvertTo-Json -Compress
    } catch {
      @{ ok = $false; headlessSessionBlocked = $true; reason = $_.Exception.Message; width = $bounds.Width; height = $bounds.Height } | ConvertTo-Json -Compress
    } finally {
      $gfx.Dispose()
      $bmp.Dispose()
    }
  }

  'recycle-item' {
    Add-Type -AssemblyName Microsoft.VisualBasic
    $targetPath = [string]$payload.targetPath
    if (-not (Test-Path -LiteralPath $targetPath)) {
      throw "Target path does not exist."
    }
    $item = Get-Item -LiteralPath $targetPath -Force
    if ($item.PSIsContainer) {
      [Microsoft.VisualBasic.FileIO.FileSystem]::DeleteDirectory(
        $targetPath,
        [Microsoft.VisualBasic.FileIO.UIOption]::OnlyErrorDialogs,
        [Microsoft.VisualBasic.FileIO.RecycleOption]::SendToRecycleBin
      )
    } else {
      [Microsoft.VisualBasic.FileIO.FileSystem]::DeleteFile(
        $targetPath,
        [Microsoft.VisualBasic.FileIO.UIOption]::OnlyErrorDialogs,
        [Microsoft.VisualBasic.FileIO.RecycleOption]::SendToRecycleBin
      )
    }
    @{ ok = $true; recycled = $targetPath } | ConvertTo-Json -Compress
  }
}
