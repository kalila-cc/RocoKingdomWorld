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
          $nodeNames = @([string]$node.display_name, [string]$node.page_name) | Where-Object { -not [string]::IsNullOrWhiteSpace($_) } | Select-Object -Unique
          $chainNames = @($card.chain_nodes | ForEach-Object { [string]$_.display_name } | Where-Object { -not [string]::IsNullOrWhiteSpace($_) } | Select-Object -Unique)
          foreach ($nodeName in $nodeNames) {
            if (-not $catalog.ContainsKey($nodeName)) {
              $catalog[$nodeName] = [pscustomobject][ordered]@{
                name = $nodeName
                root = [string]$card.root_name
                groups = @()
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
