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
