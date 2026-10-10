import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import vm from 'node:vm';

const context = { window: {} };
vm.runInNewContext(await readFile(new URL('../offline/assets/planner-core.js', import.meta.url), 'utf8'), context);
const api = context.window.ROCO_PLANNER;
const pet = (key, overrides = {}) => ({ key, name: key, form: '', season: 'S4', groups: ['测试组'], flags: 1, availability: 'season-limited', availabilityReason: '测试', offspringKey: key, maleTargets: [], femaleTargets: [], ...overrides });

function fixture(fatherCount = 5, missing = true) {
  const targets = [pet('偏爱', { availability: 'permanent' }), pet('待补全')];
  const fathers = Array.from({ length: fatherCount }, (_, i) => pet(`父本${i}`, { maleTargets: targets.map(p => p.key) }));
  const pets = [...fathers, ...targets];
  const owned = Object.fromEntries(fathers.map(p => [p.key, api.OWN.COMBO_M]));
  owned['偏爱'] = api.OWN.COMBO_F;
  if (!missing) owned['待补全'] = api.OWN.COMBO_F;
  return { pets, owned };
}
function connected(plan, count) {
  assert.equal(plan.slots.length, count);
  assert.equal(new Set(plan.edges.flatMap(e => [e.father, e.mother])).size, count);
}

test('owned favorite gets combo priority, one mother while shiny targets remain, exact and heuristic', () => {
  for (const fathers of [5, 6]) {
    const { pets, owned } = fixture(fathers);
    const planner = api.createPlanner(pets, ['偏爱']);
    const options = planner.makeAutoPlanOptions(owned, 10, 'all');
    for (const plan of options) {
      connected(plan, 10);
      assert.equal(plan.targetTier, 'favorite');
      assert.equal(api.parentBalance(plan.edges), 1);
      const mothers = plan.slots.filter(s => s.role === 'mother');
      assert.equal(mothers.filter(s => s.pet.key === '偏爱').length, 1);
      assert.ok(mothers.some(s => s.pet.key === '待补全' && s.targetKind === 'shiny'));
      assert.equal(mothers.find(s => s.pet.key === '偏爱').targetKind, 'combo');
    }
    assert.notEqual(api.createPlanner(pets).makeAutoPlan(owned, 10, 'all', 0).targetTier, 'favorite');
  }
});

test('after shiny collection is complete, repeat favorite mothers even when combo already owned', () => {
  const { pets, owned } = fixture(5, false);
  const plan = api.createPlanner(pets, ['偏爱']).makeAutoPlan(owned, 10, 'all', 0);
  connected(plan, 10);
  const mothers = plan.slots.filter(s => s.role === 'mother');
  assert.equal(mothers.length, 5);
  assert.ok(mothers.every(s => s.pet.key === '偏爱' && s.targetKind === 'combo'));
});

test('mixed plans keep single-trait shiny collection reachable, without downgrading favorite combo', () => {
  const favorite = pet('偏爱');
  const missing = pet('待补全', { groups: ['另组'] });
  const parents = [pet('炫彩父本', { maleTargets: ['偏爱'] }), pet('异色父本', { groups: ['另组'], maleTargets: ['待补全'] })];
  const owned = { '炫彩父本': api.OWN.COLOR_M, '异色父本': api.OWN.SHINY_M, '偏爱': api.OWN.SHINY_F };
  const planner = api.createPlanner([...parents, favorite, missing], ['偏爱']);
  const plan = planner.makeAutoPlan(owned, 4, 'all', 0);
  connected(plan, 4);
  assert.ok(plan.edges.some(e => e.mother.pet.key === '偏爱' && e.mother.targetKind === 'combo' && e.father.variant === 'colorful'));
  assert.ok(plan.edges.some(e => e.mother.pet.key === '待补全' && e.mother.targetKind === 'shiny'));
});

test('favorites never bypass battle pass, inherited form, season or unavailable combo constraints', () => {
  const { pets, owned } = fixture(2);
  const forbidden = pet('战令', { availability: 'battle-pass', availabilityReason: '', maleTargets: ['待补全'] });
  const form = pet('后天形态', { offspringKey: '待补全' });
  const otherSeason = pet('其他赛季', { season: 'S3' });
  owned['战令'] = api.OWN.COMBO_M | api.OWN.COMBO_F;
  const planner = api.createPlanner([...pets, forbidden, form, otherSeason], ['战令', '后天形态', '其他赛季']);
  for (const plan of planner.makeAutoPlanOptions(owned, 4, 'S4')) {
    assert.notEqual(plan.targetTier, 'favorite');
    assert.ok(plan.slots.every(s => !['战令', '后天形态', '其他赛季'].includes(s.pet.key)));
  }
  assert.equal(api.isBreedable(forbidden), false, 'battle-pass overrides stale breedable flags');
  assert.equal(api.isBreedable(pet('旧战令', { availabilityReason: '战令来源' })), false);
  const noCombo = api.createPlanner([pet('父', { maleTargets: ['喜爱', '未收集'] }), pet('喜爱'), pet('未收集')], ['喜爱']);
  const plan = noCombo.makeAutoPlan({ '父': api.OWN.SHINY_M, '喜爱': api.OWN.SHINY_F }, 4, 'all', 0);
  assert.notEqual(plan.targetTier, 'favorite');
  assert.ok(plan.edges.every(e => e.mother.pet.key !== '喜爱'));
});

test('likes do not merge form keys, mutate owned data, or leak across planner caches', () => {
  const { pets, owned } = fixture(2);
  const before = JSON.stringify(owned);
  const planner = api.createPlanner(pets, ['偏爱']);
  assert.equal(planner.makeAutoPlan(owned, 4, 'S4', 0).targetTier, 'favorite');
  assert.notEqual(planner.makeAutoPlan(owned, 4, 'S1', 0).targetTier, 'favorite');
  assert.equal(planner.makeAutoPlan(owned, 4, 'S4', 0).targetTier, 'favorite');
  assert.equal(JSON.stringify(owned), before);
  const keys = [pet('同名::1'), pet('同名::2')];
  assert.equal(JSON.stringify(api.normalizeFavorites(keys, ['同名::1', '同名::1', '同名', '__proto__', 1, null])), '["同名::1"]');
  for (const value of [undefined, null, {}, '同名::1']) assert.equal(api.normalizeFavorites(keys, value).length, 0);
});

test('multiple favorites, including a missing favorite, each get at most one mother', () => {
  const { pets, owned } = fixture(5);
  const extra = pet('另一个未收集');
  pets.push(extra);
  for (const p of pets.filter(p => p.key.startsWith('父本'))) p.maleTargets.push(extra.key);
  const planner = api.createPlanner(pets, ['偏爱', '待补全']);
  for (const plan of planner.makeAutoPlanOptions(owned, 10, 'all')) {
    connected(plan, 10);
    for (const key of ['偏爱', '待补全']) {
      const mothers = plan.slots.filter(s => s.role === 'mother' && s.pet.key === key);
      assert.equal(mothers.length, 1);
      assert.equal(mothers[0].targetKind, 'combo');
    }
    assert.ok(plan.slots.some(s => s.role === 'mother' && s.pet.key === extra.key));
  }
});

test('sex constraints cannot be bypassed by favorite or stale imported ownership', () => {
  const femaleOnly = pet('仅雌性', { flags: api.FLAG.BREEDABLE | api.FLAG.FEMALE_ONLY, maleTargets: ['普通'] });
  const maleOnly = pet('仅雄性', { flags: api.FLAG.BREEDABLE | api.FLAG.MALE_ONLY });
  const planner = api.createPlanner([femaleOnly, maleOnly, pet('普通')], ['仅雄性']);
  assert.equal(planner.maleParents({ '仅雌性': api.OWN.COMBO_M }, 'combo').length, 0);
  assert.equal(api.isEggTarget(maleOnly), false);
});
