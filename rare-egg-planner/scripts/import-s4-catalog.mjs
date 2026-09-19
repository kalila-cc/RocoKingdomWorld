// One-time, reviewed S4 snapshot import. No Wiki API calls or private progress reads.
import { readFile, writeFile, copyFile, mkdtemp } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import assert from 'node:assert/strict';
import sharp from 'sharp';

const root = new URL('../', import.meta.url);
const manifest = JSON.parse(await readFile(new URL('s4-catalog.json', import.meta.url), 'utf8'));
const dataPath = new URL('app/data.ts', root);
const offlinePath = new URL('offline/assets/data.js', root);
const source = await readFile(dataPath, 'utf8');
const match = source.match(/export const PETS: Pet\[\] = ([\s\S]*?);\s*export const DATA_UPDATED_AT/);
assert.ok(match, 'Could not locate generated catalog');
const oldPets = JSON.parse(match[1]);
const pets = structuredClone(oldPets);
const passNames = new Set(['月使鹭纳', '圣凯布米龙']);
assert.equal(manifest.rows.length, 19);
const images = [];
for (const [baseId, name, form, series, groups, chain, avatarPath] of manifest.rows) {
  const key = form ? `${name}::${baseId}` : name;
  const existing = pets.find(p => p.key === key);
  if (existing) { assert.equal(existing.baseId, baseId); continue; }
  const id = Math.max(...pets.map(p => p.id)) + 1;
  const battlePass = passNames.has(name);
  pets.push({id, key, name, form, baseId, legacyKey:name, season:'S4月涌狂想',
    availability:battlePass ? 'battle-pass' : 'season-limited',
    availabilityReason:battlePass ? 'S4月涌狂想战令异色，来自月涌通行证' : 'S4月涌狂想赛季限时异色',
    groups, series, flags:battlePass ? 18 : 1, family:chain[0], stage:'最终形态',
    image:`${id}.webp`, evolutionChain:chain, offspringKey:key, offspringReason:'', maleTargets:[], femaleTargets:[]});
  images.push({file:`${id}.webp`, url:`https://patchwiki.biligame.com/images/nrc/${avatarPath}`});
}
for (const pet of pets) {
  if (pet.availabilityReason.includes('战令')) {
    pet.availability = 'battle-pass';
    pet.availabilityReason = `${pet.season}战令异色`;
  }
  // Preserve existing sex flags and inheritance exceptions; do not infer missing sex ratios.
  if ((pet.flags & 1) && !(pet.flags & 6)) {
    pet.maleTargets = pets.filter(target => target.key !== pet.key && (target.flags & 1) && !(target.flags & 10)
      && target.offspringKey === target.key && target.groups.some(group => pet.groups.includes(group))).map(p => p.key);
  } else pet.maleTargets = [];
}
assert.equal(pets.length, 78);
assert.equal(new Set(pets.map(p => p.key)).size, 78);
assert.deepEqual(pets.filter(p => p.availability === 'permanent').map(p => p.name), ['雅丹鬃']);
for (const season of ['S1','S2','S3','S4']) assert.equal(pets.filter(p => p.season.startsWith(season) && p.availability === 'battle-pass').length, 2);
for (const old of oldPets) {
  const pet = pets.find(p => p.key === old.key);
  for (const field of ['key','legacyKey','id','baseId','flags','offspringKey']) assert.equal(pet[field], old[field], `${old.key}: ${field} drift`);
}
console.log(JSON.stringify({previous:oldPets.length, total:pets.length, newImages:images.length, s4:19, s4BattlePass:2, s4Breedable:17}));
if (!process.argv.includes('--install')) process.exit(0);
const stage = await mkdtemp(path.join(tmpdir(), 'roco-s4-'));
console.log(`Backup/staging: ${stage}`);
await copyFile(dataPath, path.join(stage,'data.ts.backup'));
await copyFile(offlinePath, path.join(stage,'data.js.backup'));
// Complete and decode every download before replacing either catalog.
for (const image of images) {
  const response = await fetch(image.url, {signal:AbortSignal.timeout(30000)});
  assert.ok(response.ok, `Image HTTP ${response.status}: stop`);
  assert.match(response.headers.get('content-type') || '', /^image\//);
  const bytes = Buffer.from(await response.arrayBuffer());
  const metadata = await sharp(bytes).metadata();
  assert.ok(metadata.width > 0 && metadata.height > 0);
  await sharp(bytes).resize(128,128,{fit:'inside',withoutEnlargement:true}).webp({quality:90}).toFile(path.join(stage,image.file));
}
const database = JSON.parse((await readFile(offlinePath,'utf8')).replace(/^\s*window\.ROCO_DATA\s*=\s*/,'').replace(/;\s*$/,''));
database.pets = pets;
database.updatedAt = new Date().toISOString();
database.source.s4 = {...manifest, rows:undefined, columns:undefined};
const updated = source.replace(match[1], JSON.stringify(pets,null,4)).replace(/export const DATA_UPDATED_AT = "[^"]+"/, `export const DATA_UPDATED_AT = "${database.updatedAt}"`);
try {
  for (const image of images) for (const folder of ['public/pets/','offline/assets/pets/']) await copyFile(path.join(stage,image.file),new URL(folder+image.file,root));
  await writeFile(dataPath,updated);
  await writeFile(offlinePath,`window.ROCO_DATA = ${JSON.stringify(database)};\n`);
} catch (error) {
  await copyFile(path.join(stage,'data.ts.backup'),dataPath);
  await copyFile(path.join(stage,'data.js.backup'),offlinePath);
  throw error;
}
console.log('Installed verified S4 snapshot; original catalog backups retained.');
