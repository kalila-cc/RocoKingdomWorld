try {
  $script:TargetRoot = Find-TargetRoot
  $assetsRoot = Join-Path $script:TargetRoot "assets"
  $currentDataPath = Join-Path $assetsRoot "data.js"
  $currentPetsPath = Join-Path $assetsRoot "pets"
  if (-not (Test-Path -LiteralPath $currentDataPath) -or -not (Test-Path -LiteralPath $currentPetsPath)) {
    throw "离线数据库文件不完整，无法安全更新。"
  }

  Write-UpdateStep "正在读取 BWiki 异色清单与蛋组资料……"
  $planner = Get-RemoteJson -Uri $PlannerUrl
  $summary = Get-RemoteJson -Uri $SummaryUrl
  $wikiEntries = @(Get-WikiShinyEntries)
  $eggCatalog = Get-EggCatalog
  $result = New-Database -Planner $planner -Summary $summary -WikiEntries $wikiEntries -EggCatalog $eggCatalog
  $database = $result.Database

  $current = Read-CurrentDatabase -DataPath $currentDataPath
  $currentCount = if ($current) { @($current.pets).Count } else { 0 }
  $currentVersion = if ($current -and $current.updatedAt) { [string]$current.updatedAt } else { "未知" }
  $remoteCount = @($database.pets).Count
  $remoteVersion = [string]$database.updatedAt

  Write-Host ""
  Write-Host "当前数据库：$currentCount 只，版本 $currentVersion"
  Write-Host "远端数据库：$remoteCount 只，版本 $remoteVersion"
  Write-Host "BWiki 异色形态：$($result.WikiEntryCount) 条；归一后的 Wiki 目标：$($result.WikiTargetCount) 只"
  Write-Host "蛋组数量：$(@($result.Groups).Count)；蛋组目录：$($result.EggCatalogCount) 只；素材数量：$($result.ImageMap.Count)"

  if ($CheckOnly) {
    Write-Host ""
    Write-Host "检查完成：远端数据结构与素材清单有效，未修改本地文件。" -ForegroundColor Green
    Wait-ForUser
    exit 0
  }

  if (-not $Force) {
    $answer = Read-Host "确认下载并安装这次更新？输入 Y 继续，其他键取消"
    if ($answer.Trim().ToUpperInvariant() -ne "Y") {
      Write-Host "已取消，本地数据库没有变化。" -ForegroundColor Yellow
      Wait-ForUser
      exit 0
    }
  }

  $script:StageRoot = Join-Path $script:TargetRoot (".database-update-" + [guid]::NewGuid().ToString("N"))
  $stagePets = Join-Path $script:StageRoot "pets"
  New-Item -ItemType Directory -Path $stagePets -Force | Out-Null

  Write-UpdateStep "正在下载 $remoteCount 张精灵头像……"
  for ($index = 0; $index -lt $database.pets.Count; $index += 1) {
    $pet = $database.pets[$index]
    Write-Progress -Activity "更新精灵素材" -Status "$($index + 1) / $remoteCount  $($pet.name)" -PercentComplete ((($index + 1) / $remoteCount) * 100)
    $imagePath = Join-Path $stagePets ([string]$pet.image)
    Save-RemoteFile -Uri $result.ImageMap[$pet.key] -Destination $imagePath
    if (-not (Test-ImageFile -Path $imagePath)) { throw "下载到的素材不是有效 PNG/WebP：$($pet.key)" }
  }
  Write-Progress -Activity "更新精灵素材" -Completed

  $stageData = Join-Path $script:StageRoot "data.js"
  $databaseJson = $database | ConvertTo-Json -Depth 16 -Compress
  Write-Utf8NoBom -Path $stageData -Content ("window.ROCO_DATA = " + $databaseJson + ";`n")

  $stageDatabase = Read-CurrentDatabase -DataPath $stageData
  if (-not $stageDatabase -or @($stageDatabase.pets).Count -ne $remoteCount) { throw "生成后的数据库校验失败。" }
  if (@(Get-ChildItem -LiteralPath $stagePets -File).Count -ne $remoteCount) { throw "素材文件数量校验失败。" }

  $backupRoot = Join-Path $script:TargetRoot "backup"
  $backupName = "database-" + (Get-Date -Format "yyyyMMdd-HHmmss") + "-" + [guid]::NewGuid().ToString("N").Substring(0, 6)
  $backupPath = Join-Path $backupRoot $backupName
  New-Item -ItemType Directory -Path $backupPath -Force | Out-Null
  $backupData = Join-Path $backupPath "data.js"
  $backupPets = Join-Path $backupPath "pets"

  Write-UpdateStep "正在备份旧数据库并安装新版本……"
  Move-Item -LiteralPath $currentDataPath -Destination $backupData
  Move-Item -LiteralPath $currentPetsPath -Destination $backupPets
  try {
    Move-Item -LiteralPath $stageData -Destination $currentDataPath
    Move-Item -LiteralPath $stagePets -Destination $currentPetsPath
  } catch {
    if (Test-Path -LiteralPath $currentDataPath) { Remove-Item -LiteralPath $currentDataPath -Force }
    if (Test-Path -LiteralPath $currentPetsPath) { Remove-Item -LiteralPath $currentPetsPath -Recurse -Force }
    if (Test-Path -LiteralPath $backupData) { Move-Item -LiteralPath $backupData -Destination $currentDataPath }
    if (Test-Path -LiteralPath $backupPets) { Move-Item -LiteralPath $backupPets -Destination $currentPetsPath }
    throw
  }

  $report = [ordered]@{
    installedAt = (Get-Date).ToString("s")
    previousVersion = $currentVersion
    newVersion = $remoteVersion
    previousCount = $currentCount
    newCount = $remoteCount
    backup = $backupPath
  } | ConvertTo-Json -Depth 4
  Write-Utf8NoBom -Path (Join-Path $backupPath "update-report.json") -Content $report

  if ($SyncProjectSource) {
    $possibleProjectRoot = Split-Path -Parent $script:TargetRoot
    if (Test-Path -LiteralPath (Join-Path $possibleProjectRoot "app\data.ts")) {
      Write-ProjectData -ProjectRoot $possibleProjectRoot -Database $database -ImageDirectory $currentPetsPath -Groups $result.Groups
    }
  }

  Remove-SafeStage
  Write-Host ""
  Write-Host "更新成功：现有登记记录会继续按精灵名称保留。" -ForegroundColor Green
  Write-Host "备份位置：$backupPath"
  Write-Host "请重新打开 index.html，或刷新已经打开的页面。"
  Wait-ForUser
  exit 0
} catch {
  Remove-SafeStage
  Write-Host ""
  Write-Host "更新失败，本地数据库未被替换。" -ForegroundColor Red
  Write-Host $_.Exception.Message -ForegroundColor Red
  Wait-ForUser
  exit 1
}
