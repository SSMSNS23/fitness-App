import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import fs from 'node:fs/promises';
import * as model from '../model.js';
import * as storage from '../store.js';
test('compact logging keeps references independently collapsible and group actions tied to original indices',async()=>{
 let saved=storage.defaults();saved.templates[0].exercises[0].sets=2;saved.templates[0].exercises[2].sets=2;model.groupExercises(saved.templates[0].exercises,[0,2],'pair');
 const handlers={},nodes=new Map();const node=id=>{if(!nodes.has(id))nodes.set(id,{innerHTML:'',textContent:''});return nodes.get(id);};
 const context=vm.createContext({...model,...storage,structuredClone,crypto,Date,URL,Blob,Number,String,Set,Math,Object,JSON,initial:saved,
 window:{scrollTo(){}},document:{getElementById:node,querySelectorAll:()=>[],querySelector:()=>({}),addEventListener:(name,fn)=>handlers[name]=fn},setTimeout:()=>1,clearTimeout(){},confirm:()=>true,
 commit:async fn=>{const next=fn(storage.clone(saved));storage.validate(next);saved=storage.clone(next);return storage.clone(next);}});
 let source=await fs.readFile(new URL('../app.js',import.meta.url),'utf8');source=source.replace(/^import .*;\n/gm,'').split('async function sync()')[0];vm.runInContext(source+'\ns=clone(initial);render=()=>{};',context);const run=code=>vm.runInContext(code,context);
 await run('start(0)');await run("action('expandAll')");let html=run('active()');
 assert.match(html,/<details class="previous-reference" data-previous="0" >/);assert.doesNotMatch(html,/<details class="previous-reference"[^>]* open/);
 assert.match(html,/class="current-sets"/);assert.match(html,/class="set-fields"/);assert.match(html,/class="bigbtn set-log" data-action="log:2:1"/);
 assert.equal((html.match(/class="exercise-group"/g)||[]).length,1);assert.ok(html.indexOf('id="exercise-0"')<html.indexOf('id="exercise-2"'));assert.ok(html.indexOf('id="exercise-2"')<html.indexOf('id="exercise-1"'));
 assert.equal((html.match(/id="exercise-2"/g)||[]).length,1);assert.match(html,/2 exercises together/);assert.match(html,/Rest after the full round/);
 const before=JSON.stringify(saved);handlers.toggle({target:{dataset:{previous:'0'},open:true,isConnected:true}});assert.equal(JSON.stringify(saved),before);
 await run("action('adjust:0:0:weight:1')");await run("action('log:0:0')");html=run('active()');assert.match(html,/<details class="previous-reference" data-previous="0" open>/);assert.match(html,/<details class="previous-reference" data-previous="2" >/);assert.equal(saved.active.exercises[0].sets[0].done,true);assert.equal(saved.active.restStarted,null);
 await run("action('log:2:0')");assert.ok(saved.active.restStarted);assert.equal(saved.active.exercises[1].sets[0].done,false);
 handlers.toggle({target:{dataset:{previous:'0'},open:false,isConnected:true}});assert.match(run('active()'),/<details class="previous-reference" data-previous="0" >/);assert.equal(run('expanded.has(0)'),true);assert.equal(saved.active.exercises[0].sets[0].done,true);
 await run("action('compare:Light')");assert.equal(run('referenceOpen.has(0)'),false);handlers.toggle({target:{dataset:{previous:'2'},open:true,isConnected:false}});assert.equal(run('referenceOpen.has(2)'),false);
 const originalNames=saved.active.exercises.map(ex=>ex.name);await run("action('finishConfirmed:'+s.active.id)");assert.deepEqual(saved.history[0].exercises.map(ex=>ex.name),originalNames);const recordHtml=run('workoutDetails(s.history[0])');assert.match(recordHtml,/exercise-group record-group/);assert.ok(recordHtml.indexOf(originalNames[2])<recordHtml.indexOf(originalNames[1]));
});
