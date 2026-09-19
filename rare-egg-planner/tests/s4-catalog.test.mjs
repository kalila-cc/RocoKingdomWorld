import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import vm from 'node:vm';
import sharp from 'sharp';
const root = new URL('../',import.meta.url);
const scope={window:{}};
vm.runInNewContext(await readFile(new URL('offline/assets/data.js',root),'utf8'),scope);
vm.runInNewContext(await readFile(new URL('offline/assets/planner-core.js',root),'utf8'),scope);
const pets=JSON.parse(JSON.stringify(scope.window.ROCO_DATA.pets));
const s4=pets.filter(p=>p.season==='S4月涌狂想');
test('S4 scope and acquisition types stay distinct',()=>{
  assert.equal(pets.length,78);
  assert.equal(s4.length,19);
  assert.equal(s4.filter(p=>p.availability==='season-limited').length,17);
  assert.deepEqual(pets.filter(p=>p.availability==='permanent').map(p=>p.name),['雅丹鬃']);
  for(const season of ['S1','S2','S3','S4']) assert.equal(pets.filter(p=>p.season.startsWith(season)&&p.availability==='battle-pass').length,2);
  assert.deepEqual(s4.filter(p=>p.availability==='battle-pass').map(p=>p.name),['月使鹭纳','圣凯布米龙']);
  assert.ok(s4.filter(p=>p.availability==='battle-pass').every(p=>!scope.window.ROCO_PLANNER.isBreedable(p)));
});
test('S4 regional keys, inheritance, cross-season reach and filters',()=>{
  const moons=s4.filter(p=>p.name==='月亮砣');
  assert.deepEqual(moons.map(p=>p.baseId),[3583,3585]);
  assert.equal(new Set(moons.map(p=>p.key)).size,2);
  assert.ok(moons.every(p=>p.offspringKey===p.key));
  assert.ok(s4.every(p=>scope.window.ROCO_PLANNER.seasonMatches(p,'S4')));
  assert.ok(s4.every(p=>!scope.window.ROCO_PLANNER.seasonMatches(p,'S3')));
  assert.ok(pets.some(p=>p.season.startsWith('S1')&&p.maleTargets.some(k=>s4.some(s=>s.key===k))));
  assert.ok(s4.some(p=>p.maleTargets.some(k=>pets.some(s=>s.key===k&&s.season.startsWith('S1')))));
  for(const pet of pets) for(const key of pet.maleTargets) assert.ok(pets.some(p=>p.key===key),key);
  assert.equal(pets.find(p=>p.key==='千棘盔::3477').offspringKey,'千棘盔::3332');
});
test('online/offline catalog and all S4 local avatars match',async()=>{
  const source=await readFile(new URL('app/data.ts',root),'utf8');
  const online=JSON.parse(source.match(/export const PETS: Pet\[\] = ([\s\S]*?);\s*export const DATA_UPDATED_AT/)[1]);
  assert.deepEqual(online,pets);
  for(const pet of s4){
    const a=await readFile(new URL('public/pets/'+pet.image,root));
    const b=await readFile(new URL('offline/assets/pets/'+pet.image,root));
    assert.deepEqual(a,b);
    const meta=await sharp(a).metadata();
    assert.equal(meta.format,'webp');
    assert.ok(meta.width<=128&&meta.height<=128);
  }
});
