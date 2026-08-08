param(
  [string]$PackageName = ""
)

$ErrorActionPreference = "Stop"
if ([string]::IsNullOrWhiteSpace($PackageName)) {
  $PackageName = "roco-rare-egg-planner"
}
$projectRoot = [IO.Path]::GetFullPath((Split-Path -Parent $PSScriptRoot)).TrimEnd('\')
$sourceRoot = [IO.Path]::GetFullPath((Join-Path $projectRoot "offline")).TrimEnd('\')
$outputsRoot = [IO.Path]::GetFullPath((Join-Path $projectRoot "outputs")).TrimEnd('\')
$targetRoot = [IO.Path]::GetFullPath((Join-Path $outputsRoot $PackageName)).TrimEnd('\')
$zipPath = Join-Path $outputsRoot "$PackageName.zip"

if (-not $sourceRoot.StartsWith($projectRoot + '\', [StringComparison]::OrdinalIgnoreCase)) { throw "Offline source is outside the project root." }
if (-not $targetRoot.StartsWith($outputsRoot + '\', [StringComparison]::OrdinalIgnoreCase)) { throw "Package target is outside the outputs root." }
if (-not (Test-Path -LiteralPath (Join-Path $sourceRoot "index.html"))) { throw "Offline entry file does not exist." }

New-Item -ItemType Directory -Path $outputsRoot -Force | Out-Null
New-Item -ItemType Directory -Path $targetRoot -Force | Out-Null
$backupRoot = Join-Path $sourceRoot "backup"
& robocopy $sourceRoot $targetRoot /MIR /XD $backupRoot /NFL /NDL /NJH /NJS /NP
$copyCode = $LASTEXITCODE
if ($copyCode -ge 8) { throw "Robocopy failed with exit code $copyCode." }

Compress-Archive -LiteralPath $targetRoot -DestinationPath $zipPath -CompressionLevel Optimal -Force
Write-Host "Offline package created: $zipPath"
