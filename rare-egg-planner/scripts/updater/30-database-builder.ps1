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
  foreach ($familyGroup in @($WikiEntries | Group-Object root)) {
    $wikiFormsByRoot[$familyGroup.Name] = @($familyGroup.Group | Sort-Object @{ Expression = { Get-StageRank $_.stage } }, name)
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
      $basePets += [pscustomobject][ordered]@{
        id = -1
        key = $key
        name = $name
        form = if ($splitVariants.Count) { [string]$variant.label } else { "" }
        baseId = $baseId
        legacyKey = $legacyKey
        season = [string]$seasons[$seasonIndex]
        groups = @($petGroups)
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

  $generatedAt = (Get-Date).ToUniversalTime().ToString("s") + "Z"
  $database = [ordered]@{
    schemaVersion = 6
    pets = $pets
    updatedAt = $generatedAt
    source = [ordered]@{
      planner = $PlannerUrl
      summary = $SummaryUrl
      wiki = $WikiApiUrl
      eggGroups = $EggApiBaseUrl.TrimEnd('/') + "/egg-groups"
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
