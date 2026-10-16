import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import fs from 'node:fs/promises';
import * as model from '../model.js';
import * as storage from '../store.js';

test('enabling blocks replaces fixed future ranges while preserving history and exercise defaults',()=>{
 const s=storage.defaults();s.templates[0].phase='Light';s.templates[1].phase=null;
 model.startSession(s,0,Date.now()-1000,'past');model.finishSession(s,'past',Date.now());model.setProgrammeMode(s,'manual');
 const history=JSON.stringify(s.history),exercises=JSON.stringify(s.templates.map(t=>t.exercises)),next=s.next;
 model.useTrainingBlocks(s);assert.equal(s.programme.mode,'auto');assert.equal(s.next,next);assert.deepEqual(s.programme.completed,[]);
 assert.ok(s.templates.every(t=>!Object.hasOwn(t,'phase')));assert.equal(JSON.stringify(s.history),history);assert.equal(JSON.stringify(s.templates.map(t=>t.exercises)),exercises);
 model.startSession(s,1,Date.now(),'new');assert.equal(s.active.phase,model.cycle(s).phase);storage.validate(s);
});

test('applying blocks keeps an existing automatic round and rejects changes during a workout',()=>{
 const s=storage.defaults();s.programme.step=3;s.programme.completed=[0];s.next=1;s.templates[1].phase='Heavy';
 model.useTrainingBlocks(s);assert.equal(s.programme.step,3);assert.deepEqual(s.programme.completed,[0]);assert.equal(model.sessionPhase(s,s.templates[1]),'Mid');
 model.startSession(s,1,Date.now(),'running');const before=JSON.stringify(s);assert.throws(()=>model.useTrainingBlocks(s),/Finish/);assert.equal(JSON.stringify(s),before);
});

test('actual block dashboard follows completed rounds, preserves next action and handles manual setup',async()=>{
 let saved=storage.defaults();model.deleteSession(saved,3);const nodes=new Map(),handlers={},node=id=>{if(!nodes.has(id))nodes.set(id,{innerHTML:'',textContent:''});return nodes.get(id);};
 const context=vm.createContext({...model,...storage,structuredClone,crypto,Date,URL,Blob,Number,String,Set,Math,Object,JSON,initial:saved,window:{scrollTo(){}},document:{getElementById:node,querySelectorAll:()=>[],querySelector:()=>({}),addEventListener:(name,fn)=>handlers[name]=fn},setTimeout:()=>1,clearTimeout(){},confirm:()=>true,
 commit:async fn=>{const next=fn(storage.clone(saved));storage.validate(next);saved=storage.clone(next);return storage.clone(next);}});
 let source=await fs.readFile(new URL('../app.js',import.meta.url),'utf8');source=source.replace(/^import .*;\n/gm,'').split('async function sync()')[0];vm.runInContext(source+'\ns=clone(initial);selected=s.next;render=()=>{};',context);const run=code=>vm.runInContext(code,context);
 let html=run('training()');assert.match(html,/aria-current="step"[\s\S]*?<h2>Heavy<\/h2>/);assert.match(html,/Round 1 of 2/);assert.match(html,/0 of 3/);assert.match(html,/Start next workout/);assert.match(html,/Manage programme/);assert.doesNotMatch(html,/Training structure|phase-steps/);
 await run("action('choose:2')");assert.match(run('training()'),/Start selected workout/);assert.match(run('training()'),/Back to next workout/);assert.equal(saved.next,0);
 await run('start(0)');await run("action('choose:2')");html=run('training()');assert.match(html,/WORKOUT IN PROGRESS/);assert.match(html,/Resume workout/);assert.match(html,/In progress/);assert.match(html,/<h2 class="hero-title">Upper A<\/h2>/);
 await run("action('finishConfirmed:'+s.active.id)");html=run('training()');assert.match(html,/1 of 3/);assert.match(html,/Completed/);assert.equal(saved.next,1);
 await run('start(0)');await run("action('finishConfirmed:'+s.active.id)");assert.match(run('training()'),/1 of 3/);
 for(const i of [1,2]){await run('start('+i+')');await run("action('finishConfirmed:'+s.active.id)");}
 assert.match(run('training()'),/Round 2 of 2/);assert.match(run('training()'),/0 of 3/);
 for(const i of [0,1,2]){await run('start('+i+')');await run("action('finishConfirmed:'+s.active.id)");}
 html=run('training()');assert.match(html,/aria-current="step"[\s\S]*?<h2>Medium<\/h2>/);assert.match(html,/Round 1 of 2/);assert.equal(model.cycle(saved).phase,'Mid');
 model.setProgrammeMode(saved,'manual');saved.templates[0].phase='Light';context.latest=saved;run('s=clone(latest)');assert.match(run('training()'),/Use training blocks/);
 const history=JSON.stringify(saved.history);await run("action('useBlocks')");assert.doesNotMatch(run('training()'),/Use training blocks/);assert.equal(JSON.stringify(saved.history),history);
});
