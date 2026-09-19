# Generated from scripts/updater/*.ps1. Run npm run build:offline; do not edit by hand.
# Source module: 00-runtime.ps1
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

# Source module: 10-wiki-source.ps1
function Get-WikiShinyEntries {
  $ask = '[[Category:精灵]][[是否有异色::是]]|?精灵初阶名称|?精灵阶段|?精灵形态|?主属性|?副属性|?是否有异色|limit=500'
  $uri = $WikiApiUrl + "?action=ask&api_version=2&format=json&query=" + [Uri]::EscapeDataString($ask)
  $payload = Get-RemoteJson -Uri $uri
  $names = @($payload.query.results.PSObject.Properties.Name)
  if ($names.Count -lt 50 -or $names.Count -gt 500) { throw "BWiki 异色清单数量异常：$($names.Count)" }

  $entries = @()
  foreach ($name in $names) {
    $item = $payload.query.results.$name
    $rootValues = @($item.printouts.'精灵初阶名称')
    $stageValues = @($item.printouts.'精灵阶段')
    $formValues = @($item.printouts.'精灵形态')
    $seriesValues = @(@($item.printouts.'主属性') + @($item.printouts.'副属性') | Where-Object { -not [string]::IsNullOrWhiteSpace([string]$_) } | ForEach-Object { [string]$_ } | Select-Object -Unique)
    $root = if ($rootValues.Count) { [string]$rootValues[0] } else { [string]$name }
    if ([string]::IsNullOrWhiteSpace($root)) { $root = [string]$name }
    $entries += [pscustomobject][ordered]@{
      name = [string]$name
      root = $root
      stage = if ($stageValues.Count) { [string]$stageValues[0] } else { "未知阶段" }
      form = if ($formValues.Count) { [string]$formValues[0] } else { "原始形态" }
      series = @($seriesValues)
      sourceUrl = [string]$item.fullurl
    }
  }
  return $entries
}

# Source module: 20-egg-source.ps1
function Get-EggCatalog {
  $groupPayload = Get-RemoteJson -Uri ($EggApiBaseUrl.TrimEnd('/') + "/egg-groups")
  $groupRows = @($groupPayload.groups)
  if (-not $groupPayload.ok -or $groupRows.Count -lt 14 -or $groupRows.Count -gt 20) {
    throw "蛋组接口结构异常。"
  }

  $catalog = @{}
  foreach ($group in $groupRows) {
    $page = 1
    do {
      $uri = $EggApiBaseUrl.TrimEnd('/') + "/egg-group-members?group_id=$($group.group_id)&page=$page&page_size=30"
      $payload = Get-RemoteJson -Uri $uri
      if (-not $payload.ok) { throw "蛋组成员接口返回失败：$($group.group_display)" }
      foreach ($card in @($payload.cards)) {
        foreach ($node in @($card.chain_nodes)) {
          $nodeSeries = @(([string]$node.type_name -split '\s*[,，/]\s*') | ForEach-Object {
            ([string]$_ -replace '元素精灵$', '' -replace '系精灵$', '' -replace '精灵$', '').Trim()
          } | Where-Object { -not [string]::IsNullOrWhiteSpace([string]$_) } | Select-Object -Unique)
          $nodeNames = @([string]$node.display_name, [string]$node.page_name) | Where-Object { -not [string]::IsNullOrWhiteSpace($_) } | Select-Object -Unique
          $chainNames = @($card.chain_nodes | ForEach-Object { [string]$_.display_name } | Where-Object { -not [string]::IsNullOrWhiteSpace($_) } | Select-Object -Unique)
          foreach ($nodeName in $nodeNames) {
            if (-not $catalog.ContainsKey($nodeName)) {
              $catalog[$nodeName] = [pscustomobject][ordered]@{
                name = $nodeName
                root = [string]$card.root_name
                groups = @()
                series = @($nodeSeries)
                canHatch = [bool]$node.can_hatch
                baseId = [int]$node.base_id
                avatar = [string]$node.avatar_url
                stage = [int]$node.stage
                chainNames = @($chainNames)
                variants = @()
              }
            }
            $record = $catalog[$nodeName]
            $record.groups = @(@($record.groups) + @($node.egg_group_names) | Where-Object { $_ -and $_ -ne "无法孵蛋" } | Sort-Object -Unique)
            $record.series = @(@($record.series) + @($nodeSeries) | Select-Object -Unique)
            if ($node.can_hatch) { $record.canHatch = $true }
            if ([string]::IsNullOrWhiteSpace([string]$record.avatar)) { $record.avatar = [string]$node.avatar_url }
            $record.chainNames = @(@($record.chainNames) + @($chainNames) | Select-Object -Unique)
            $variantLabel = [string]$node.variant_label
            if ([bool]$node.evolution_is_final_stage -and -not [string]::IsNullOrWhiteSpace($variantLabel)) {
              $variantBaseId = [int]$node.base_id
              if (-not @($record.variants | Where-Object { [int]$_.baseId -eq $variantBaseId }).Count) {
                $record.variants += [pscustomobject][ordered]@{
                  baseId = $variantBaseId
                  label = $variantLabel
                  avatar = [string]$node.avatar_url
                  series = @($nodeSeries)
                  canHatch = [bool]$node.can_hatch
                  maternalText = [string]$node.maternal_text
                }
              }
            }
          }
        }
      }
      $totalPages = [Math]::Max(1, [int]$payload.total_pages)
      $page += 1
      if ($page -le $totalPages) { Start-Sleep -Milliseconds 80 }
    } while ($page -le $totalPages)
  }

  if ($catalog.Count -lt 350) { throw "蛋组精灵目录数量异常：$($catalog.Count)" }
  return $catalog
}

# Source module: 30-database-builder.ps1
function New-Database($Planner, $Summary, $WikiEntries, $EggCatalog) {
  if ([int]$Planner.v -ne 1) { throw "不支持的远端数据库格式：v=$($Planner.v)" }
  $groups = @($Planner.groups)
  $seasons = @($Planner.seasons)
  $rows = @($Planner.pets)
  if ($groups.Count -lt 10 -or $groups.Count -gt 30) { throw "蛋组数量异常：$($groups.Count)" }
  if ($rows.Count -lt 1 -or $rows.Count -gt 1000) { throw "精灵数量异常：$($rows.Count)" }

  $catalogByRoot = @{}
  foreach ($catalogName in $EggCatalog.Keys) {
    $record = $EggCatalog[$catalogName]
    if ($record.root -and -not $catalogByRoot.ContainsKey([string]$record.root)) {
      $catalogByRoot[[string]$record.root] = $record
    }
  }

  $wikiFormsByRoot = @{}
  $wikiByName = @{}
  foreach ($familyGroup in @($WikiEntries | Group-Object root)) {
    $wikiFormsByRoot[$familyGroup.Name] = @($familyGroup.Group | Sort-Object @{ Expression = { Get-StageRank $_.stage } }, name)
  }
  foreach ($wikiEntry in $WikiEntries) {
    $wikiByName[[string]$wikiEntry.name] = $wikiEntry
  }

  $summaryImageMap = @{}
  $imageRows = @($Summary.targets_with_avatar) + @($Summary.species_entries)
  foreach ($imageRow in $imageRows) {
    $imageName = [string]($imageRow.name)
    if ([string]::IsNullOrWhiteSpace($imageName)) { $imageName = [string]($imageRow.species) }
    $imageUrl = [string]($imageRow.avatar_url)
    if ([string]::IsNullOrWhiteSpace($imageUrl)) { $imageUrl = [string]($imageRow.avatar_shiny_url) }
    if ([string]::IsNullOrWhiteSpace($imageUrl)) { $imageUrl = [string]($imageRow.avatar_normal_url) }
    if (-not [string]::IsNullOrWhiteSpace($imageName) -and -not [string]::IsNullOrWhiteSpace($imageUrl)) {
      $summaryImageMap[$imageName] = $imageUrl
    }
  }

  $seasonOverrides = @{ "小独角兽" = "S2狂欢怪谈" }
  # 蛋组接口描述的是亲本配对资格，不代表地区形态本身可以遗传。
  # 磨损形态为后天形成；作为母本繁育时，后代回到“本来的样子”。
  $offspringFormOverrides = @{ 3477 = 3332 }
  $offspringFormReasons = @{ 3477 = "磨损形态为后天形成；孵蛋后代为本来的样子" }

  $seenNames = @{}
  $seenKeys = @{}
  $imageMap = @{}
  $basePets = @()
  for ($index = 0; $index -lt $rows.Count; $index += 1) {
    $row = @($rows[$index])
    if ($row.Count -lt 4) { throw "第 $($index + 1) 条精灵记录字段不足。" }
    $name = [string]$row[0]
    if ([string]::IsNullOrWhiteSpace($name)) { throw "第 $($index + 1) 条精灵名称为空。" }
    if ($seenNames.ContainsKey($name)) { throw "远端数据库包含重复精灵：$name" }

    $seasonIndex = [int]$row[1]
    if ($seasonIndex -lt 0 -or $seasonIndex -ge $seasons.Count) { throw "$name 的赛季索引无效。" }
    $petGroups = @()
    foreach ($groupIndexValue in @($row[2])) {
      $groupIndex = [int]$groupIndexValue
      if ($groupIndex -lt 0 -or $groupIndex -ge $groups.Count) { throw "$name 的蛋组索引无效。" }
      $petGroups += [string]$groups[$groupIndex]
    }
    $catalogRecord = if ($EggCatalog.ContainsKey($name)) { $EggCatalog[$name] } else { $null }
    $wikiRecord = if ($wikiByName.ContainsKey($name)) { $wikiByName[$name] } else { $null }
    $family = if ($catalogRecord -and $catalogRecord.root) { [string]$catalogRecord.root } else { $name }
    $summaryImageUrl = if ($summaryImageMap.ContainsKey($name)) { [string]$summaryImageMap[$name] } elseif ($catalogRecord -and $catalogRecord.avatar) { [string]$catalogRecord.avatar } else { "" }
    if ([string]::IsNullOrWhiteSpace($summaryImageUrl)) { throw "缺少精灵头像地址：$name" }
    $summaryBaseId = Get-AssetBaseId -Uri $summaryImageUrl
    $variantCandidates = if ($catalogRecord) { @($catalogRecord.variants | Where-Object { -not [string]::IsNullOrWhiteSpace([string]$_.label) }) } else { @() }
    $variantLabelCount = @($variantCandidates | ForEach-Object { [string]$_.label } | Sort-Object -Unique).Count
    $splitVariants = if ($variantLabelCount -gt 1) { @($variantCandidates | Sort-Object baseId -Unique) } else { @() }
    $recordsToAdd = if ($splitVariants.Count) {
      @($splitVariants)
    } else {
      @([pscustomobject][ordered]@{ baseId = $summaryBaseId; label = ""; avatar = $summaryImageUrl })
    }

    foreach ($variant in $recordsToAdd) {
      $baseId = if ([int]$variant.baseId -ge 0) { [int]$variant.baseId } elseif ($catalogRecord) { [int]$catalogRecord.baseId } else { -1 }
      $key = if ($splitVariants.Count) { "${name}::$baseId" } else { $name }
      if ($seenKeys.ContainsKey($key)) { throw "远端数据库包含重复精灵卡片：$key" }
      $seenKeys[$key] = $true
      $variantImageUrl = if (-not [string]::IsNullOrWhiteSpace([string]$variant.avatar)) { [string]$variant.avatar } else { $summaryImageUrl }
      $imageMap[$key] = $variantImageUrl
      $legacyKey = if (-not $splitVariants.Count -or $baseId -eq $summaryBaseId) { $name } else { "" }
      $petSeries = if ($variant.PSObject.Properties.Name -contains "series" -and @($variant.series).Count) {
        @($variant.series)
      } elseif ($catalogRecord -and @($catalogRecord.series).Count) {
        @($catalogRecord.series)
      } elseif ($wikiRecord -and @($wikiRecord.series).Count) {
        @($wikiRecord.series)
      } else {
        @("待核对")
      }
      $basePets += [pscustomobject][ordered]@{
        id = -1
        key = $key
        name = $name
        form = if ($splitVariants.Count) { [string]$variant.label } else { "" }
        baseId = $baseId
        legacyKey = $legacyKey
        season = [string]$seasons[$seasonIndex]
        groups = @($petGroups)
        series = @($petSeries)
        flags = [int]$row[3]
        family = $family
        stage = "孵蛋目标"
        image = ""
        evolutionChain = @()
        offspringKey = $key
        offspringReason = ""
      }
    }
    $seenNames[$name] = $true
  }

  $seasonByRoot = @{}
  $genderByRoot = @{}
  foreach ($pet in $basePets) {
    if (-not $seasonByRoot.ContainsKey($pet.family)) { $seasonByRoot[$pet.family] = $pet.season }
    $currentGender = if ($genderByRoot.ContainsKey($pet.family)) { [int]$genderByRoot[$pet.family] } else { 0 }
    $genderByRoot[$pet.family] = $currentGender -bor ([int]$pet.flags -band 12)
  }

  $wikiTargets = @()
  foreach ($familyGroup in @($WikiEntries | Group-Object root)) {
    $regularForms = @($familyGroup.Group | Where-Object { [string]$_.form -notmatch "首领" })
    if (-not $regularForms.Count) { continue }
    $finalForms = @($regularForms | Where-Object { $_.stage -eq "最终形态" })
    if ($finalForms.Count) {
      $wikiTargets += $finalForms
    } else {
      $wikiTargets += @($regularForms | Sort-Object @{ Expression = { Get-StageRank $_.stage } }, name | Select-Object -Last 1)
    }
  }

  foreach ($entry in @($wikiTargets | Sort-Object name)) {
    if ($seenNames.ContainsKey($entry.name)) { continue }
    $exactRecord = if ($EggCatalog.ContainsKey($entry.name)) { $EggCatalog[$entry.name] } else { $null }
    $familyRecord = if ($catalogByRoot.ContainsKey($entry.root)) { $catalogByRoot[$entry.root] } else { $null }
    $groupSource = if ($exactRecord) { $exactRecord } else { $familyRecord }
    $petGroups = if ($groupSource) { @($groupSource.groups) } else { @() }
    $petSeries = if ($exactRecord -and @($exactRecord.series).Count) {
      @($exactRecord.series)
    } elseif (@($entry.series).Count) {
      @($entry.series)
    } elseif ($familyRecord -and @($familyRecord.series).Count) {
      @($familyRecord.series)
    } else {
      @("待核对")
    }
    $genderFlags = if ($genderByRoot.ContainsKey($entry.root)) { [int]$genderByRoot[$entry.root] } else { 0 }
    if ($exactRecord -and $exactRecord.canHatch -and $petGroups.Count) {
      $flags = 1 -bor $genderFlags
    } elseif (-not $petGroups.Count) {
      $flags = 2 -bor 16 -bor $genderFlags
    } else {
      $flags = 2 -bor $genderFlags
    }
    $season = if ($seasonByRoot.ContainsKey($entry.root)) {
      [string]$seasonByRoot[$entry.root]
    } elseif ($seasonOverrides.ContainsKey($entry.root)) {
      [string]$seasonOverrides[$entry.root]
    } else {
      "S?待核对"
    }
    $imageUrl = if ($exactRecord -and $exactRecord.avatar) {
      [string]$exactRecord.avatar
    } elseif ($familyRecord -and $familyRecord.avatar) {
      [string]$familyRecord.avatar
    } else {
      ""
    }
    if ([string]::IsNullOrWhiteSpace($imageUrl)) { throw "缺少精灵头像地址：$($entry.name)" }
    $key = [string]$entry.name
    $imageMap[$key] = $imageUrl
    $seenNames[$entry.name] = $true
    $seenKeys[$key] = $true
    $basePets += [pscustomobject][ordered]@{
      id = -1
      key = $key
      name = [string]$entry.name
      form = ""
      baseId = Get-AssetBaseId -Uri $imageUrl
      legacyKey = $key
      season = $season
      groups = @($petGroups)
      series = @($petSeries)
      flags = $flags
      family = [string]$entry.root
      stage = [string]$entry.stage
      image = ""
      evolutionChain = @()
      offspringKey = $key
      offspringReason = ""
    }
  }

  $keyByBaseId = @{}
  foreach ($candidate in $basePets) {
    if ([int]$candidate.baseId -ge 0) { $keyByBaseId[[int]$candidate.baseId] = [string]$candidate.key }
  }
  foreach ($candidate in $basePets) {
    $baseId = [int]$candidate.baseId
    if (-not $offspringFormOverrides.ContainsKey($baseId)) { continue }
    $offspringBaseId = [int]$offspringFormOverrides[$baseId]
    if (-not $keyByBaseId.ContainsKey($offspringBaseId)) {
      throw "$($candidate.key) 的后代形态映射无效：基础 ID $offspringBaseId 不在图鉴中。"
    }
    $candidate.offspringKey = [string]$keyByBaseId[$offspringBaseId]
    $candidate.offspringReason = [string]$offspringFormReasons[$baseId]
  }

  $pets = @()
  for ($index = 0; $index -lt $basePets.Count; $index += 1) {
    $pet = $basePets[$index]
    $pet.id = $index
    if (-not $imageMap.ContainsKey($pet.key)) { throw "缺少精灵头像地址：$($pet.key)" }
    $pet.image = "$index$(Get-ImageExtension -Uri ([string]$imageMap[$pet.key]))"
    $chainRecord = if ($EggCatalog.ContainsKey($pet.name)) {
      $EggCatalog[$pet.name]
    } elseif ($catalogByRoot.ContainsKey($pet.family)) {
      $catalogByRoot[$pet.family]
    } else {
      $null
    }
    $chain = @()
    $chainCandidates = @()
    if ($chainRecord) { $chainCandidates += @($chainRecord.chainNames) }
    if ($wikiFormsByRoot.ContainsKey($pet.family)) {
      $chainCandidates += @($wikiFormsByRoot[$pet.family] | ForEach-Object { [string]$_.name })
    }
    foreach ($chainName in $chainCandidates) {
      if (-not [string]::IsNullOrWhiteSpace([string]$chainName) -and $chain -notcontains [string]$chainName) {
        $chain += [string]$chainName
      }
    }
    if (-not $chain.Count) { $chain = @([string]$pet.name) }
    $pet.evolutionChain = @($chain)
    $targets = @($basePets | Where-Object {
      if ($_.key -eq $pet.key) { return $false }
      if (-not ($_.flags -band 1) -or ($_.flags -band 2)) { return $false }
      if ($_.offspringKey -ne $_.key) { return $false }
      return @($_.groups | Where-Object { $pet.groups -contains $_ }).Count -gt 0
    } | ForEach-Object { $_.key })
    $isBattlePassTarget = [bool]($pet.flags -band 2) -and [bool]($pet.flags -band 16)
    $availability = if ($permanentShinyReasons.ContainsKey([string]$pet.name) -or $isBattlePassTarget) { "permanent" } else { "season-limited" }
    $availabilityReason = if ($permanentShinyReasons.ContainsKey([string]$pet.name)) {
      [string]$permanentShinyReasons[[string]$pet.name]
    } elseif ($isBattlePassTarget) {
      "$($pet.season)战令精灵，常驻捕捉触发"
    } else {
      "$($pet.season)赛季限时异色"
    }
    $pets += [ordered]@{
      id = $pet.id
      key = $pet.key
      name = $pet.name
      form = $pet.form
      baseId = $pet.baseId
      legacyKey = $pet.legacyKey
      season = $pet.season
      availability = $availability
      availabilityReason = $availabilityReason
      groups = @($pet.groups)
      series = @($pet.series)
      flags = $pet.flags
      family = $pet.family
      stage = $pet.stage
      image = $pet.image
      evolutionChain = @($pet.evolutionChain)
      offspringKey = $pet.offspringKey
      offspringReason = $pet.offspringReason
      maleTargets = $targets
      femaleTargets = @()
    }
  }

  if (-not ($pets.name -contains "白金独角兽")) { throw "BWiki 异色清单未能补入白金独角兽。" }
  if ($pets.Count -lt $rows.Count) { throw "合并后的精灵数量异常：$($pets.Count)" }
  $unresolvedSeries = @($pets | Where-Object { @($_.series) -contains "待核对" })
  if ($unresolvedSeries.Count) {
    throw "以下精灵缺少系列资料：$(@($unresolvedSeries.name) -join '、')"
  }

  $seriesOrder = @("普通", "火", "水", "草", "电", "冰", "武", "毒", "地", "萌", "翼", "光", "恶", "幽", "幻", "机械", "虫", "龙", "待核对")
  $seriesInDatabase = @($pets | ForEach-Object { @($_.series) } | Select-Object -Unique)
  $series = @($seriesOrder | Where-Object { $seriesInDatabase -contains $_ })
  $series += @($seriesInDatabase | Where-Object { $seriesOrder -notcontains $_ } | Sort-Object)
  $generatedAt = (Get-Date).ToUniversalTime().ToString("s") + "Z"
  $database = [ordered]@{
    schemaVersion = 7
    pets = $pets
    series = @($series)
    updatedAt = $generatedAt
    source = [ordered]@{
      planner = $PlannerUrl
      summary = $SummaryUrl
      wiki = $WikiApiUrl
      eggGroups = $EggApiBaseUrl.TrimEnd('/') + "/egg-groups"
      series = "egg-group-members.type_name; fallback BWiki 主属性/副属性"
      targetScope = "planner-shiny-final + bwiki-shiny-final + regional-final-variants + form-inheritance-overrides"
      priorityPolicy = "season-limited-shiny-first; permanent-shiny-after-limited-or-when-limited-is-not-currently-actionable"
      plannerGeneratedAt = [string]$Planner.metadata.generated_at
      plannerTargetCount = $rows.Count
      wikiEntryCount = @($WikiEntries).Count
      wikiTargetCount = @($wikiTargets).Count
      downloadedAt = $generatedAt
    }
  }

  return [pscustomobject]@{
    Database = $database
    ImageMap = $imageMap
    Groups = $groups
    Series = $series
    Seasons = $seasons
    WikiEntryCount = @($WikiEntries).Count
    WikiTargetCount = @($wikiTargets).Count
    EggCatalogCount = $EggCatalog.Count
  }
}

function Write-ProjectData([string]$ProjectRoot, $Database, [string]$ImageDirectory, $Groups) {
  $appDataPath = Join-Path $ProjectRoot "app\data.ts"
  $publicPetsPath = Join-Path $ProjectRoot "public\pets"
  if (-not (Test-Path -LiteralPath (Split-Path -Parent $appDataPath))) { return }

  $groupsJson = $Groups | ConvertTo-Json -Depth 4
  $seriesJson = $Database.series | ConvertTo-Json -Depth 4
  $petsJson = $Database.pets | ConvertTo-Json -Depth 12
  $typescript = @"
export type Pet = {
  id: number;
  key: string;
  name: string;
  form: string;
  baseId: number;
  legacyKey: string;
  season: string;
  availability: "season-limited" | "permanent";
  availabilityReason: string;
  groups: string[];
  series: string[];
  flags: number;
  family: string;
  stage: string;
  image: string;
  evolutionChain: string[];
  offspringKey: string;
  offspringReason: string;
  maleTargets: string[];
  femaleTargets: string[];
};

export const EGG_GROUPS = $groupsJson as const;

export const PET_SERIES = $seriesJson as const;

export const PETS: Pet[] = $petsJson;

export const DATA_UPDATED_AT = "$($Database.updatedAt)";

export const FLAG = {
  BREEDABLE: 1,
  RULE_NON_BREEDABLE: 2,
  FEMALE_ONLY: 4,
  MALE_ONLY: 8,
  NO_EGG_GROUP: 16,
  EXCLUDED: 32,
} as const;
"@
  Write-Utf8NoBom -Path $appDataPath -Content $typescript
  if (Test-Path -LiteralPath $publicPetsPath) {
    Copy-Item -Path (Join-Path $ImageDirectory "*.*") -Destination $publicPetsPath -Force
  }
}

# Source module: 35-validation.ps1
function Assert-NoCatalogRegression($Current, $Database) {
  if (-not $Current) { return }
  $incoming = @{}
  foreach ($pet in @($Database.pets)) {
    $key = if ($pet.key) { [string]$pet.key } else { [string]$pet.name }
    if ($incoming.ContainsKey($key)) { throw "更新包含重复卡片键：$key" }
    $incoming[$key] = $pet
    if ([string]$pet.season -match '待核对|S\?') { throw "赛季未确认，停止更新：$key" }
  }
  foreach ($pet in @($Current.pets)) {
    $key = if ($pet.key) { [string]$pet.key } else { [string]$pet.name }
    if (-not $incoming.ContainsKey($key)) {
      throw "远端清单遗漏已有卡片 $key，可能是旧数据源或形态合并错误。停止安装，保留本地数据。"
    }
    if ([int]$incoming[$key].baseId -ne [int]$pet.baseId) {
      throw "卡片 $key 的基础 ID 发生变化，需人工核对登记映射。"
    }
    if ([string]$incoming[$key].season -ne [string]$pet.season) {
      throw "卡片 $key 的异色赛季发生变化，需核对源版本后人工确认。"
    }
    if ($pet.availability -and [string]$incoming[$key].availability -ne [string]$pet.availability) {
      throw "卡片 $key 的获取类型发生变化，停止覆盖已核实分类。"
    }
  }
}

# Source module: 40-install.ps1
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
  Assert-NoCatalogRegression -Current $current -Database $database
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
