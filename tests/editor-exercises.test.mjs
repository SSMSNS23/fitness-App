import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import fs from 'node:fs/promises';
import * as model from '../model.js';
import * as storage from '../store.js';
import * as exercises from '../exercises.js';
test('actual exercise library, history, live search, picker and custom creation flows',async()=>{
 let saved=storage.defaults();saved.templates[0].exercises[0].name='<Row & press>';model.groupExercises(saved.templates[0].exercises,[0,1],'pair');
 model.startSession(saved,0,1700000000000,'old');model.updateSet(saved,'old',0,0,'weight',31.25,1700000000001);model.updateSet(saved,'old',0,0,'done',true,1700000000002);model.finishSession(saved,'old',1700000000003);
 const historyBefore=JSON.stringify(saved.history),handlers={},nodes=new Map();
 const node=id=>{if(!nodes.has(id))nodes.set(id,{innerHTML:'',textContent:''});return nodes.get(id);};
 const context=vm.createContext({...model,...storage,...exercises,structuredClone,crypto,Date,URL,Blob,Number,String,Set,Math,Object,JSON,
  initial:saved,window:{scrollTo(){}},document:{getElementById:node,querySelectorAll:()=>[],querySelector:()=>({open:false}),addEventListener:(name,fn)=>handlers[name]=fn},
  setTimeout:()=>1,clearTimeout(){},confirm:()=>true,
  FormData:class{constructor(form){this.values=form.values;}get(key){return this.values[key]??null;}has(key){return Object.hasOwn(this.values,key);}},
  commit:async fn=>{const next=fn(storage.clone(saved));storage.validate(next);saved=storage.clone(next);return storage.clone(next);}});
 let source=await fs.readFile(new URL('../app.js',import.meta.url),'utf8');source=source.replace(/^import .*;\n/gm,'').split("document.addEventListener('change'")[0];vm.runInContext(source+'\ns=clone(initial);render=()=>{};',context);
 const run=code=>vm.runInContext(code,context);
 const form=()=>{const draft=run('editor.draft'),today=run('!!editor.active'),values={name:draft.name,phase:Object.hasOwn(draft,'phase')?draft.phase??'none':'inherit'};draft.exercises.forEach((ex,i)=>{values['exercise-'+i]=ex.name;if(today)ex.sets.forEach((z,j)=>{values[`weight-${i}-${j}`]=String(z.weight);values[`reps-${i}-${j}`]=String(z.reps);});else{values['sets-'+i]=String(ex.sets);values['weight-'+i]=String(ex.weight);values['reps-'+i]=String(ex.reps);values['increment-'+i]=ex.increment?String(ex.increment):'';}});node('editor').values=values;return values;};
 const submit=async value=>handlers.submit({preventDefault(){},target:{id:'editor'},submitter:{value}});
 await run("go('exercises')");let html=run('exerciseLibrary()');assert.match(html,/&lt;Row &amp; press&gt;/);assert.doesNotMatch(html,/<Row & press>/);assert.match(html,/1 session/);
 handlers.input({target:{name:'query',form:{id:'exercise-search'},value:'ROW',dataset:{}}});assert.match(node('exercise-results').innerHTML,/Row &amp; press/);
 handlers.input({target:{name:'query',form:{id:'exercise-search'},value:'zznomatch',dataset:{}}});assert.match(node('exercise-results').innerHTML,/No matching/);
 run("exerciseQuery=''");run('exerciseLibrary()');const index=run('catalogue.find(e=>e.stats.sessions).index');await run(`action('exerciseDetail:${index}')`);
 assert.match(run('exerciseDetailPage()'),/31.25 kg/);await run("action('exercisePhase:Light')");assert.match(run('exerciseDetailPage()'),/No logged sets in this range/);
 await run("action('exercisePhase:all')");await run("action('exerciseWorkout:old')");assert.match(run('history()'),/WORKOUT RECORD/);await run("action('historyBack')");assert.equal(run('page'),'exercises');assert.ok(run('exerciseFocus'));
 await run("action('edit:0')");const values=form();values.name='Draft preserved';await run("action('pickExercise:add')");run('exercisePickerPage()');await run("action('pickerBack')");assert.equal(run('editor.draft.name'),'Draft preserved');
 form();await run("action('pickExercise:replace:0')");run('exercisePickerPage()');const pick=run('catalogue.find(e=>e.exercise.id===s.templates[0].exercises[2].id).index');const before=JSON.stringify(saved.templates);
 await run(`action('pickKnown:${pick}')`);assert.equal(run('page'),'editor');assert.equal(run('editor.draft.exercises[0].group'),'pair');assert.equal(JSON.stringify(saved.templates),before);form();await submit();assert.equal(saved.templates[0].name,'Draft preserved');assert.equal(JSON.stringify(saved.history),historyBefore);
 await run('start(0)');await run("action('log:0:0')");await run("action('editToday')");form();await run("action('pickExercise:replace:0')");run('exercisePickerPage()');context.confirm=()=>false;
 await run(`action('pickKnown:${pick}')`);assert.equal(run('page'),'exercisePicker');assert.equal(run('editor.draft.exercises[0].sets[0].done'),true);context.confirm=()=>true;
 await run(`action('pickKnown:${pick}')`);assert.equal(run('page'),'editor');assert.ok(run('editor.draft.exercises[0].sets.every(z=>!z.done)'));
 const templateBeforeToday=JSON.stringify(saved.templates);form();await submit('today');assert.equal(JSON.stringify(saved.templates),templateBeforeToday);
 await run("action('editToday')");form();await run("action('pickExercise:add')");const count=run('editor.draft.exercises.length');
 await handlers.submit({preventDefault(){},target:{id:'custom-exercise',values:{name:'Cable · new machine'}}});assert.equal(run('editor.draft.exercises.length'),count+1);assert.equal(run('editor.draft.exercises.at(-1).name'),'Cable · new machine');assert.ok(run('editor.draft.exercises.at(-1).sets.every(z=>!z.done&&z.weight===0)'));
 form();await submit('today');assert.equal(JSON.stringify(saved.templates),templateBeforeToday);assert.equal(JSON.stringify(saved.history),historyBefore);storage.validate(storage.migrate(JSON.parse(JSON.stringify(saved))));
});
