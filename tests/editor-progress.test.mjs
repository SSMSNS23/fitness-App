import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import fs from 'node:fs/promises';
import * as model from '../model.js';
import * as storage from '../store.js';
import * as exercises from '../exercises.js';
import * as progress from '../progress.js';
test('actual Progress render, period/range/exercise controls, units and workout/back navigation',async()=>{
 const now=Date.now(),DAY=86400000;let saved=storage.defaults();saved.templates[0].exercises[0].name='<Cable & row>';
 const add=(id,days,weight,phase)=>{saved.programme.step=phase==='Mid'?2:0;const when=now-days*DAY;model.startSession(saved,0,when,id);model.updateSet(saved,id,0,0,'weight',weight,when+1);model.updateSet(saved,id,0,0,'done',true,when+2);if(id==='latest')model.updateSet(saved,id,1,0,'done',true,when+3);model.finishSession(saved,id,when+4);};
 add('older',60,30,'Heavy');add('recent',7,35,'Heavy');add('latest',1,25,'Mid');
 const before=JSON.stringify(saved),handlers={},nodes=new Map();const node=id=>{if(!nodes.has(id))nodes.set(id,{innerHTML:'',textContent:''});return nodes.get(id);};
 const context=vm.createContext({...model,...storage,...exercises,...progress,structuredClone,crypto,Date,URL,Blob,Number,String,Set,Math,Object,JSON,
 initial:saved,window:{scrollTo(){}},document:{getElementById:node,querySelectorAll:()=>[],querySelector:()=>({}),addEventListener:(name,fn)=>handlers[name]=fn},setTimeout:()=>1,clearTimeout(){},confirm:()=>true,
 commit:async fn=>{const next=fn(storage.clone(saved));storage.validate(next);saved=storage.clone(next);return storage.clone(next);}});
 let source=await fs.readFile(new URL('../app.js',import.meta.url),'utf8');source=source.replace(/^import .*;\n/gm,'').split('async function sync()')[0];vm.runInContext(source+'\ns=clone(initial);render=()=>{};',context);const run=code=>vm.runInContext(code,context);
 await run("go('progress')");assert.equal(run('page'),'progress');let html=run('trainingProgress()');assert.match(html,/Volume \(kg × reps\)/);assert.match(html,/&lt;Cable &amp; row&gt;/);assert.doesNotMatch(html,/<Cable & row>/);assert.match(html,/role="img"/);assert.doesNotMatch(html,/NaN|Infinity/);
 const exerciseIndex=run('progressCatalogue.find(e=>e.exercise.id===s.templates[0].exercises[0].id).index');
 await handlers.change({target:{id:'progress-exercise',value:String(exerciseIndex)}});await handlers.change({target:{id:'progress-phase',value:'Heavy'}});
 html=run('trainingProgress()');assert.match(html,/35 kg/);assert.match(html,/progressWorkout:recent/);assert.doesNotMatch(html,/progressWorkout:older/);assert.doesNotMatch(html,/progressWorkout:latest/);
 await run("action('progressPeriod:84')");html=run('trainingProgress()');assert.match(html,/progressWorkout:older/);assert.match(html,/<polyline/);
 await run("action('progressWorkout:older')");assert.equal(run('page'),'history');assert.match(run('history()'),/WORKOUT RECORD/);await run("action('historyBack')");assert.equal(run('page'),'progress');assert.equal(run('progressDays'),84);assert.equal(run('progressPhase'),'Heavy');
 await handlers.change({target:{id:'progress-phase',value:'Light'}});html=run('trainingProgress()');assert.match(html,/No logged sets for this exercise/);assert.doesNotMatch(html,/<svg/);
 await handlers.change({target:{id:'progress-phase',value:'Heavy'}});await run("action('unit:lb')");html=run('trainingProgress()');assert.match(html,/Volume \(lb × reps\)/);assert.match(html,/77.16 lb/);assert.match(html,/in lb/);
 const chart=run("loadChart([{started:Date.now()-1000,load:0,id:'zero'}],{name:'Zero'},28,Date.now())");assert.match(chart,/<circle/);assert.doesNotMatch(chart,/NaN|Infinity|<polyline/);
 // Only the explicit unit preference action wrote state; Progress itself stays read-only.
 const expected=JSON.parse(before);expected.settings.unit='lb';assert.deepEqual(saved,expected);
});
