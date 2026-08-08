function Get-WikiShinyEntries {
  $ask = '[[Category:精灵]][[是否有异色::是]]|?精灵初阶名称|?精灵阶段|?精灵形态|?主属性|?是否有异色|limit=500'
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
    $root = if ($rootValues.Count) { [string]$rootValues[0] } else { [string]$name }
    if ([string]::IsNullOrWhiteSpace($root)) { $root = [string]$name }
    $entries += [pscustomobject][ordered]@{
      name = [string]$name
      root = $root
      stage = if ($stageValues.Count) { [string]$stageValues[0] } else { "未知阶段" }
      form = if ($formValues.Count) { [string]$formValues[0] } else { "原始形态" }
      sourceUrl = [string]$item.fullurl
    }
  }
  return $entries
}
