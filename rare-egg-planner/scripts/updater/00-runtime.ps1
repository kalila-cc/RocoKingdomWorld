param(
  [switch]$CheckOnly,
  [switch]$Force,
  [switch]$NoPause,
  [switch]$SyncProjectSource,
  [string]$PlannerUrl = "https://roco.gptvip.chat/api/shiny-transfer-planner",
  [string]$SummaryUrl = "https://roco.gptvip.chat/api/shiny-transfer-summary",
  [string]$WikiApiUrl = "https://wiki.biligame.com/rocom/api.php",
  [string]$EggApiBaseUrl = "https://roco.gptvip.chat/api"
)

$ErrorActionPreference = "Stop"
$ProgressPreference = "SilentlyContinue"
[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12

$script:StageRoot = $null
$script:TargetRoot = $null
$userAgent = "RocoRarePlannerUpdater/1.1 (offline noncommercial tool)"
$permanentShinyReasons = @{
  "雅丹鬃" = "常驻捕捉触发"
  "疾光千兽" = "S1 战令精灵，常驻捕捉触发"
  "绒仙子" = "S1 战令精灵，常驻捕捉触发"
  "爆焰喷喷" = "S2 战令精灵，常驻捕捉触发"
  "雪怪" = "S2 战令精灵，常驻捕捉触发"
  "离心舞者" = "S3 战令精灵，常驻捕捉触发"
  "胡桃王子" = "S3 战令精灵，常驻捕捉触发"
}

function Write-UpdateStep([string]$Message) {
  Write-Host "[更新器] $Message" -ForegroundColor Cyan
}

function Wait-ForUser {
  if (-not $NoPause) {
    [void](Read-Host "按回车键关闭窗口")
  }
}

function Write-Utf8NoBom([string]$Path, [string]$Content) {
  $encoding = New-Object System.Text.UTF8Encoding($false)
  [IO.File]::WriteAllText($Path, $Content, $encoding)
}

function Get-RemoteJson([string]$Uri) {
  $attempt = 0
  do {
    $attempt += 1
    try {
      return Invoke-RestMethod -Uri $Uri -Method Get -Headers @{ "User-Agent" = $userAgent; "Accept" = "application/json" } -TimeoutSec 30
    } catch {
      $curl = Get-Command "curl.exe" -ErrorAction SilentlyContinue
      if ($curl) {
        try {
          $raw = & $curl.Source --silent --show-error --fail --location --compressed --max-time 30 -A $userAgent -H "Accept: application/json" -- $Uri | Out-String
          if ($LASTEXITCODE -eq 0) { return $raw | ConvertFrom-Json -ErrorAction Stop }
        } catch {
          # Continue to the bounded retry below.
        }
      }
      if ($attempt -ge 3) { throw }
      Start-Sleep -Milliseconds (1000 * [Math]::Pow(2, $attempt - 1))
    }
  } while ($attempt -lt 3)
}

function Get-StageRank([string]$Stage) {
  switch ($Stage) {
    "Ⅰ阶" { return 10 }
    "Ⅱ阶" { return 20 }
    "Ⅲ阶" { return 30 }
    "最终形态" { return 100 }
    default { return 50 }
  }
}

function Save-RemoteFile([string]$Uri, [string]$Destination) {
  $attempt = 0
  do {
    $attempt += 1
    try {
      Invoke-WebRequest -UseBasicParsing -Uri $Uri -Headers @{ "User-Agent" = $userAgent } -TimeoutSec 30 -OutFile $Destination
      return
    } catch {
      if ($attempt -ge 3) { throw }
      Start-Sleep -Milliseconds (350 * $attempt)
    }
  } while ($attempt -lt 3)
}

function Test-ImageFile([string]$Path) {
  if (-not (Test-Path -LiteralPath $Path -PathType Leaf)) { return $false }
  $item = Get-Item -LiteralPath $Path
  if ($item.Length -lt 256) { return $false }
  $stream = [IO.File]::OpenRead($Path)
  try {
    $header = New-Object byte[] 12
    if ($stream.Read($header, 0, 12) -ne 12) { return $false }
    $riff = [Text.Encoding]::ASCII.GetString($header, 0, 4)
    $webp = [Text.Encoding]::ASCII.GetString($header, 8, 4)
    $isWebP = $riff -eq "RIFF" -and $webp -eq "WEBP"
    $isPng = $header[0] -eq 0x89 -and $header[1] -eq 0x50 -and $header[2] -eq 0x4e -and $header[3] -eq 0x47
    return $isWebP -or $isPng
  } finally {
    $stream.Dispose()
  }
}

function Get-ImageExtension([string]$Uri) {
  try {
    $extension = [IO.Path]::GetExtension(([Uri]$Uri).AbsolutePath).ToLowerInvariant()
    if ($extension -eq ".png") { return ".png" }
  } catch {
    # Unknown URLs fall back to the WebP format used by the main CDN.
  }
  return ".webp"
}

function Get-AssetBaseId([string]$Uri) {
  if ([string]::IsNullOrWhiteSpace($Uri)) { return -1 }
  if ($Uri -match '/(?:head|body)/(\d+)\.(?:webp|png)') { return [int]$Matches[1] }
  return -1
}

function Remove-SafeStage {
  if (-not $script:StageRoot -or -not (Test-Path -LiteralPath $script:StageRoot)) { return }
  $fullStage = [IO.Path]::GetFullPath($script:StageRoot)
  $parent = [IO.Path]::GetDirectoryName($fullStage)
  $leaf = [IO.Path]::GetFileName($fullStage)
  if ($parent -eq $script:TargetRoot -and $leaf.StartsWith(".database-update-")) {
    Remove-Item -LiteralPath $fullStage -Recurse -Force
  }
}

function Find-TargetRoot {
  $scriptParent = Split-Path -Parent $PSScriptRoot
  $offlineCandidate = Join-Path $scriptParent "assets\data.js"
  if (Test-Path -LiteralPath $offlineCandidate) {
    return [IO.Path]::GetFullPath($scriptParent).TrimEnd('\')
  }

  $projectOffline = Join-Path $scriptParent "offline\assets\data.js"
  if (Test-Path -LiteralPath $projectOffline) {
    return [IO.Path]::GetFullPath((Join-Path $scriptParent "offline")).TrimEnd('\')
  }

  throw "找不到离线版 assets/data.js。请不要把更新脚本单独移出工具目录。"
}

function Read-CurrentDatabase([string]$DataPath) {
  try {
    $text = [IO.File]::ReadAllText($DataPath, [Text.Encoding]::UTF8)
    $json = $text -replace '^\s*window\.ROCO_DATA\s*=\s*', '' -replace ';\s*$', ''
    return $json | ConvertFrom-Json
  } catch {
    return $null
  }
}
