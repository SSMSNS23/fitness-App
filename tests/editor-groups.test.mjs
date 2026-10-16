import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import fs from 'node:fs/promises';
import * as model from '../model.js';
import * as storage from '../store.js';
test('actual editor handlers group/save/log/ungroup with historical snapshots and manual expansion',async()=>{
 let saved=storage.defaults();const handlers={},nodes=new Map(),panel={open:false};
 const node=id=>{if(!nodes.has(id))nodes.set(id,{innerHTML:'',textContent:''});return nodes.get(id);};
 const context=vm.createContext({...model,...storage,structuredClone,crypto,Date,URL,Blob,Number,String,Set,Math,Object,JSON,
  initial:saved,window:{scrollTo(){}},document:{getElementById:node,querySelectorAll:()=>[],querySelector:()=>panel,addEventListener:(name,fn)=>handlers[name]=fn},
  setTimeout:()=>1,clearTimeout(){},confirm:()=>true,
  FormData:class{constructor(form){this.values=form.values;}get(key){return this.values[key]??null;}has(key){return Object.hasOwn(this.values,key);}},
  commit:async fn=>{const next=fn(storage.clone(saved));storage.validate(next);saved=storage.clone(next);return storage.clone(next);}});
 let source=await fs.readFile(new URL('../app.js',import.meta.url),'utf8');
 source=source.replace(/^import .*;\n/gm,'').split("document.addEventListener('change'")[0];
 vm.runInContext(source+'\ns=clone(initial);render=()=>{};',context);
 const run=code=>vm.runInContext(code,context);
 const form=()=>{const draft=run('editor.draft'),today=run('!!editor.active');const values={name:draft.name,phase:Object.hasOwn(draft,'phase')?draft.phase??'none':'inherit'};draft.exercises.forEach((ex,i)=>{values['exercise-'+i]=ex.name;if(today)ex.sets.forEach((z,j)=>{values[`weight-${i}-${j}`]=String(z.weight);values[`reps-${i}-${j}`]=String(z.reps);});else{values['sets-'+i]=String(ex.sets);values['weight-'+i]=String(ex.weight);values['reps-'+i]=String(ex.reps);values['increment-'+i]=ex.increment?String(ex.increment):'';}});node('editor').values=values;return values;};
 const submit=async value=>handlers.submit({preventDefault(){},target:{id:'editor'},submitter:{value}});
 await run("action('edit:0')");assert.match(run('editPage()'),/Supersets &amp; giant sets/);
 const original=JSON.stringify(saved),values=form();values['group-select-0']='on';values['group-select-2']='on';
 await run("action('groupSelected')");assert.equal(panel.open,true);assert.match(run('editPage()'),/Superset 1/);assert.equal(JSON.stringify(saved),original);
 form();await submit();assert.equal(saved.templates[0].exercises[0].group,saved.templates[0].exercises[2].group);
 assert.match(run('training()'),/Superset 1/);
 await run('start(0)');await run("action('expandAll')");const openBefore=JSON.stringify([...run('expanded')]);
 assert.match(run('active()'),/Superset 1 · 2\/2/);
 await run("action('log:2:0')");assert.equal(saved.active.restStarted,null);
 await run("action('log:0:0')");assert.ok(saved.active.restStarted);assert.equal(JSON.stringify([...run('expanded')]),openBefore);
 const templateBefore=JSON.stringify(saved.templates);
 await run("action('editToday')");const today=form();for(const i of [0,1,2])today['group-select-'+i]='on';await run("action('groupSelected')");
 assert.match(run('editPage()'),/Giant set 1/);form();await submit('today');assert.equal(JSON.stringify(saved.templates),templateBefore);
 assert.equal(saved.active.restStarted,null);assert.equal(saved.active.exercises[2].sets[0].done,true);
 await run("action('log:1:0')");assert.ok(saved.active.restStarted);
 await run("action('finish')");assert.equal(run('page'),'finishReview');assert.match(run('finishReview()'),/Giant set 1/);
 await run("action('finishConfirmed:'+s.active.id)");assert.equal(saved.history.length,1);assert.match(run('summaryPage()'),/Giant set 1/);
 context.workoutId=saved.history[0].id;run('detail=workoutId');assert.match(run('history()'),/Giant set 1/);
 const historyBefore=JSON.stringify(saved.history);await run("action('edit:0')");form();await run("action('groupClear:0')");assert.ok(run('editor.draft.exercises.every(ex=>!ex.group)'));
 form();await submit();assert.ok(saved.templates[0].exercises.every(ex=>!ex.group));assert.equal(JSON.stringify(saved.history),historyBefore);
 const restored=storage.migrate(JSON.parse(JSON.stringify(saved)));assert.equal(model.exerciseGroup(restored.history[0].exercises,restored.history[0].exercises[0]).title,'Giant set 1');
});
