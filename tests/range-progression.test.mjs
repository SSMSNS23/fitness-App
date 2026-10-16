import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import fs from 'node:fs/promises';
import * as model from '../model.js';
import * as storage from '../store.js';
const one={Heavy:1,Mid:1,Light:1},two={Heavy:2,Mid:2,Light:2};
function finish(s,index=s.next){const id=crypto.randomUUID(),now=Date.now();model.startSession(s,index,now,id);model.updateSet(s,id,0,0,'done',true,now+1);return model.finishSession(s,id,now+2);}

test('one round per range advances Heavy, Medium, Light and wraps without repeat-session inflation',()=>{
 const s=storage.defaults();model.deleteSession(s,3);model.configureProgression(s,{order:['Heavy','Mid','Light'],rounds:one});
 for(const phase of ['Heavy','Mid','Light']){assert.equal(model.cycle(s).phase,phase);assert.equal(model.cycle(s).rounds,1);finish(s,0);finish(s,0);assert.deepEqual(s.programme.completed,[0]);finish(s,1);assert.equal(model.cycle(s).phase,phase);finish(s,2);}
 assert.equal(model.cycle(s).phase,'Heavy');assert.equal(s.history.length,12);storage.validate(s);
});

test('custom Medium Heavy Light order and independent round counts survive backups and finish boundaries',()=>{
 let s=storage.defaults();for(const i of [1,2,3])model.deleteSession(s,i);
 model.configureProgression(s,{order:['Mid','Heavy','Light'],rounds:{Mid:2,Heavy:1,Light:2}});model.setCurrentBlock(s,'Mid',1);
 const expected=[['Mid',1],['Mid',2],['Heavy',1],['Light',1],['Light',2],['Mid',1]];
 for(const [phase,round] of expected){const c=model.cycle(s);assert.equal(c.phase,phase);assert.equal(c.rotation,round);s=storage.migrate(storage.clone(s));finish(s);}
 assert.equal(model.cycle(s).phase,'Mid');assert.equal(model.cycle(s).rotation,2);storage.validate(s);
});

test('moving back and undo restore range, round, completion and next session without changing history',()=>{
 const s=storage.defaults();s.programme.step=3;finish(s,0);const history=JSON.stringify(s.history),before=storage.clone(s);
 model.setCurrentBlock(s,'Heavy',2);assert.equal(model.cycle(s).phase,'Heavy');assert.deepEqual(s.programme.completed,[]);assert.equal(s.next,0);assert.ok(model.canUndoBlockChange(s));
 const restored=storage.migrate(storage.clone(s));assert.ok(model.canUndoBlockChange(restored));model.undoBlockChange(restored);
 assert.deepEqual(restored.programme,before.programme);assert.equal(restored.next,before.next);assert.equal(JSON.stringify(restored.history),history);assert.ok(!model.canUndoBlockChange(restored));
});

test('undo of Use training blocks restores manual mode and the original per-session ranges',()=>{
 const s=storage.defaults();model.setProgrammeMode(s,'manual');s.templates[0].phase='Light';s.templates[1].phase=null;const before=storage.clone(s);
 model.useTrainingBlocks(s);assert.ok(model.canUndoBlockChange(s));assert.equal(model.sessionPhase(s,s.templates[0]),'Heavy');model.undoBlockChange(s);
 assert.deepEqual(s.programme,before.programme);assert.equal(s.templates[0].phase,'Light');assert.equal(s.templates[1].phase,null);assert.equal(Object.hasOwn(s.templates[2],'phase'),false);
});

test('stale forms, active workouts and invalid sequences cannot partially change progression',()=>{
 const s=storage.defaults(),stamp=model.blockStamp(s);finish(s);const before=JSON.stringify(s);
 assert.throws(()=>model.setCurrentBlock(s,'Light',1,stamp),/elsewhere/);assert.equal(JSON.stringify(s),before);
 for(const input of [{order:['Heavy','Heavy','Light'],rounds:one},{order:['Mid','Heavy','Light'],rounds:{...one,Mid:3}},{order:['Heavy','Mid','Light'],rounds:{Heavy:1,Mid:1}}]){assert.throws(()=>model.configureProgression(s,input));assert.equal(JSON.stringify(s),before);}
 assert.throws(()=>model.setCurrentBlock(s,'Unknown',1));assert.equal(JSON.stringify(s),before);
 model.startSession(s,s.next,Date.now(),'active');const active=JSON.stringify(s);assert.throws(()=>model.configureProgression(s,{order:['Mid','Heavy','Light'],rounds:one}),/Finish/);assert.throws(()=>model.setCurrentBlock(s,'Light',1),/Finish/);assert.equal(JSON.stringify(s),active);
});

test('undo expires after another workout or program change and cannot remove logged history',()=>{
 const s=storage.defaults();model.setCurrentBlock(s,'Light',1);finish(s);const before=JSON.stringify(s);assert.ok(!model.canUndoBlockChange(s));assert.throws(()=>model.undoBlockChange(s),/unavailable/);assert.equal(JSON.stringify(s),before);
 model.setCurrentBlock(s,'Heavy',1);model.deleteSession(s,3);assert.ok(!model.canUndoBlockChange(s));assert.throws(()=>model.undoBlockChange(s));
});

test('configuration edits preserve current completion, import preserves range plan and deletion uses custom wrap',()=>{
 const s=storage.defaults();s.programme.step=3;finish(s,0);const history=JSON.stringify(s.history);
 model.configureProgression(s,{order:['Mid','Heavy','Light'],rounds:one});assert.equal(model.cycle(s).phase,'Mid');assert.equal(model.cycle(s).rotation,1);assert.deepEqual(s.programme.completed,[0]);assert.equal(s.next,1);
 s.programme.step=2;s.programme.completed=[0,1,2];s.next=3;model.deleteSession(s,3);assert.equal(model.cycle(s).phase,'Mid');assert.equal(s.programme.step,0);
 model.importProgramme(s,{format:'training-log-programme',version:1,sessions:storage.clone(s.templates.slice(0,2))});assert.deepEqual(model.rangePlan(s),{order:['Mid','Heavy','Light'],rounds:one});assert.equal(JSON.stringify(s.history),history);assert.ok(!s.programme.blockUndo);storage.validate(s);
});

test('legacy default cycles and running workout snapshots migrate without changing their meaning',()=>{
 for(const step of [0,1,2,3,4,5]){const s=storage.defaults();s.programme.step=step;const now=Date.now();model.startSession(s,0,now,'legacy');const before=JSON.stringify(s.active),restored=storage.migrate(storage.clone(s));assert.equal(model.cycle(restored).phase,['Heavy','Mid','Light'][Math.floor(step/2)]);assert.equal(model.cycle(restored).rotation,step%2+1);assert.equal(JSON.stringify(restored.active),before);storage.validate(restored);}
 const s=storage.defaults();model.configureProgression(s,{order:['Heavy','Mid','Light'],rounds:one});s.programme.step=3;assert.throws(()=>storage.validate(s),/rotation/);
});

test('actual range forms support custom order, current block changes and undo with Program labels',async()=>{
 let saved=storage.defaults();const nodes=new Map(),handlers={},node=id=>{if(!nodes.has(id))nodes.set(id,{innerHTML:'',textContent:''});return nodes.get(id);};
 const context=vm.createContext({...model,...storage,structuredClone,crypto,Date,URL,Blob,Number,String,Set,Math,Object,JSON,initial:saved,window:{scrollTo(){}},document:{getElementById:node,querySelectorAll:()=>[],querySelector:()=>({}),addEventListener:(name,fn)=>handlers[name]=fn},setTimeout:()=>1,clearTimeout(){},confirm:()=>true,
 FormData:class{constructor(form){this.values=form.values;}get(key){return this.values[key]??null;}has(key){return Object.hasOwn(this.values,key);}},
 commit:async fn=>{const next=fn(storage.clone(saved));storage.validate(next);saved=storage.clone(next);return storage.clone(next);}});
 let source=await fs.readFile(new URL('../app.js',import.meta.url),'utf8');source=source.replace(/^import .*;\n/gm,'').split('async function sync()')[0];vm.runInContext(source+'\ns=clone(initial);selected=s.next;render=()=>{};',context);const run=code=>vm.runInContext(code,context);
 let html=run('training()');assert.match(html,/Change current block/);assert.match(html,/Manage program/);assert.match(html,/Program sessions/);assert.doesNotMatch(html,/Manage programme|Programme sessions/);
 const submit=async(id,values,stamp=model.blockStamp(saved))=>handlers.submit({preventDefault(){},target:{id,values,dataset:{expected:stamp}}});
 await submit('range-progression',{mode:'auto','range-0':'Mid','rounds-0':'1','range-1':'Heavy','rounds-1':'2','range-2':'Light','rounds-2':'1'});
 html=run('training()');const track=html.split('<ol class="range-track">')[1].split('</ol>')[0];assert.ok(track.indexOf('Medium')<track.indexOf('Heavy'));assert.ok(track.indexOf('Heavy')<track.indexOf('Light'));assert.deepEqual(saved.programme.rangeRounds,{Mid:1,Heavy:2,Light:1});
 await submit('current-block',{block:'Mid:1'});assert.equal(model.cycle(saved).phase,'Mid');assert.match(run('training()'),/Round 1 of 1/);assert.match(run('training()'),/Undo last change/);
 await run("action('undoBlocks')");assert.equal(model.cycle(saved).phase,'Heavy');assert.deepEqual(saved.programme.rangeOrder,['Mid','Heavy','Light']);
 const before=JSON.stringify(saved);await submit('range-progression',{mode:'auto','range-0':'Heavy','rounds-0':'1','range-1':'Heavy','rounds-1':'1','range-2':'Light','rounds-2':'1'});assert.equal(JSON.stringify(saved),before);
});
