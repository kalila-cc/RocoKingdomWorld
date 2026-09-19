import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import vm from 'node:vm';
const context={window:{}};
vm.runInNewContext(await readFile(new URL('../offline/assets/planner-core.js',import.meta.url),'utf8'),context);
const api=context.window.ROCO_PLANNER;
function fixture(fathers,mothers){
  const make=(key)=>({key,name:key,form:'',season:'S4',groups:['测试组'],flags:1,availability:'season-limited',availabilityReason:'测试',offspringKey:key,maleTargets:[],femaleTargets:[]});
  const targets=Array.from({length:mothers},(_,i)=>make(`mother-${i}`));
  const parents=Array.from({length:fathers},(_,i)=>({...make(`father-${i}`),maleTargets:targets.map(p=>p.key)}));
  return {planner:api.createPlanner([...parents,...targets]),owned:Object.fromEntries(parents.map(p=>[p.key,api.OWN.COMBO_M]))};
}
function checkConnected(plan,nests){
  assert.equal(plan.slots.length,nests);
  assert.equal(new Set(plan.edges.flatMap(e=>[e.father,e.mother])).size,nests);
}
test('exact and heuristic branches prefer 5:5 over repeated surplus mothers',()=>{
  for(const count of [5,6]){
    const {planner,owned}=fixture(count,2);
    const plan=planner.makeAutoPlan(owned,10,'all',0);
    checkConnected(plan,10);
    assert.equal(plan.slots.filter(s=>s.role==='father').length,5);
    assert.equal(api.parentBalance(plan.edges),1);
    assert.equal(new Set(plan.edges.map(e=>e.mother.pet.key)).size,2);
    assert.ok(plan.edges.some(e=>plan.edges.filter(x=>x.father===e.father).length>1),'extra cross-links remain allowed');
    const options=planner.makeAutoPlanOptions(owned,10,'all');
    assert.equal(api.parentBalance(options[0].edges),1);
  }
});
test('scarce fathers and odd nest counts remain usable without isolated nests',()=>{
  // A single father cannot reach nine mothers on the existing adjacency grid.
  for(const [fathers,nests,expected] of [[1,3,1],[2,10,2],[5,9,4]]){
    const {planner,owned}=fixture(fathers,2);
    const plan=planner.makeAutoPlan(owned,nests,'all',0);
    checkConnected(plan,nests);
    assert.equal(plan.slots.filter(s=>s.role==='father').length,expected);
  }
});
test('5:5 beats higher target coverage in exact and heuristic search and option sorting',()=>{
  for (const fathers of [5,6]) {
  const {planner,owned}=fixture(fathers,7);
  const plan=planner.makeAutoPlan(owned,10,'all',0);
  checkConnected(plan,10);
  assert.equal(new Set(plan.edges.map(e=>e.mother.pet.key)).size,5);
  assert.equal(plan.slots.filter(s=>s.role==='father').length,5);
  const options=planner.makeAutoPlanOptions(owned,10,'all');
  assert.equal(api.parentBalance(options[0].edges),1);
  assert.equal(new Set(options[0].edges.map(e=>e.mother.pet.key)).size,5);
  assert.equal(api.parentBalance([...plan.edges,...plan.edges]),api.parentBalance(plan.edges));
  }
});
