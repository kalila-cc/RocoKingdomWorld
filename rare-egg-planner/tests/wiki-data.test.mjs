import test from 'node:test';
import assert from 'node:assert/strict';
import {parseLuaData} from '../scripts/wiki-data.mjs';
import {execFileSync} from 'node:child_process';

test('Wiki literal tables support nested records, arrays and Chinese strings', () => {
  assert.deepEqual(parseLuaData('-- generated\nreturn {pet={name="月使鹭纳",has_shiny=true,groups={1,12},image={shiny="a.png"}},["season"]="S4"}'),
    {pet:{name:'月使鹭纳',has_shiny:true,groups:[1,12],image:{shiny:'a.png'}},season:'S4'});
});
test('Wiki parser rejects executable content and unsafe keys', () => {
  for (const text of ['return os.execute("bad")','return {} os.execute("bad")','return {x=function() end}','return {["__proto__"]={x=1}}']) {
    assert.throws(() => parseLuaData(text));
  }
});
test('catalog regression guard rejects missing cards, ID drift, season and acquisition rollback', {skip:process.platform !== 'win32'}, () => {
  const script = `
    $ErrorActionPreference = 'Stop'
    . ([scriptblock]::Create([IO.File]::ReadAllText((Join-Path (Get-Location) 'scripts/updater/35-validation.ps1'), [Text.Encoding]::UTF8)))
    $current = @{pets=@(@{key='old';name='old';baseId=1;season='S4';availability='battle-pass'})}
    Assert-NoCatalogRegression $current $current
    $cases = @(
      @{pets=@(@{key='new';baseId=2;season='S4'})},
      @{pets=@(@{key='old';baseId=2;season='S4'})},
      @{pets=@(@{key='old';baseId=1;season='S3'})},
      @{pets=@(@{key='old';baseId=1;season='S4';availability='permanent'})}
    )
    foreach ($candidate in $cases) {
      $rejected = $false
      try { Assert-NoCatalogRegression $current $candidate } catch { $rejected = $true }
      if (-not $rejected) { throw 'Regression was accepted' }
    }
  `;
  execFileSync('powershell.exe', ['-NoProfile','-Command',script], {windowsHide:true});
});
