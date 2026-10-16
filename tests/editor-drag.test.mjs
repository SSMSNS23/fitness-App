import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import fs from 'node:fs/promises';
import * as model from '../model.js';
import * as storage from '../store.js';
import * as reorder from '../reorder.js';
test('actual editor drag wiring preserves typed/logged/group data and only saves explicitly',async()=>{
 let saved=storage.defaults();const now=Date.now()-1000;model.groupExercises(saved.templates[0].exercises,[0,1],'pair');model.startSession(saved,0,now,'running');model.updateSet(saved,'running',0,0,'weight',31.25,now+1);model.updateSet(saved,'running',0,0,'done',true,now+2);
 const templatesBefore=JSON.stringify(saved.templates),stateBefore=JSON.stringify(saved),handlers={},nodes=new Map();const node=id=>{if(!nodes.has(id))nodes.set(id,{innerHTML:'',textContent:''});return nodes.get(id);};
 const listClasses=()=>({add(){},remove(){}}),rows=Array.from({length:4},(_,i)=>({classList:listClasses(),getBoundingClientRect:()=>({top:i*120,height:120})}));
 const handle={dataset:{dragExercise:'0'},isConnected:true,focus(){},setAttribute(){},removeAttribute(){},setPointerCapture(){},hasPointerCapture:()=>true,releasePointerCapture(){},closest:()=>({scrollIntoView(){}})};
 const context=vm.createContext({...model,...storage,...reorder,structuredClone,crypto,Date,URL,Blob,Number,String,Set,Math,Object,JSON,initial:saved,
 window:{scrollTo(){},scrollBy(){},requestAnimationFrame:()=>1,cancelAnimationFrame(){},addEventListener(){},innerHeight:600},document:{getElementById:node,querySelectorAll:selector=>selector==='[data-exercise-row]'?rows:[],querySelector:()=>handle,addEventListener:(name,fn)=>handlers[name]=fn},setTimeout:()=>1,clearTimeout(){},confirm:()=>true,
 FormData:class{constructor(form){this.values=form.values;}get(key){return this.values[key]??null;}has(key){return Object.hasOwn(this.values,key);}},
 commit:async fn=>{const next=fn(storage.clone(saved));storage.validate(next);saved=storage.clone(next);return storage.clone(next);}});
 let source=await fs.readFile(new URL('../app.js',import.meta.url),'utf8');source=source.replace(/^import .*;\n/gm,'').split('async function sync()')[0];vm.runInContext(source+'\ns=clone(initial);render=()=>{};setupExerciseDrag();',context);const run=code=>vm.runInContext(code,context);
 const form=()=>{const draft=run('editor.draft'),values={name:draft.name};draft.exercises.forEach((ex,i)=>{values['exercise-'+i]=ex.name;ex.sets.forEach((z,j)=>{values[`weight-${i}-${j}`]=String(z.weight);values[`reps-${i}-${j}`]=String(z.reps);});});node('editor').values=values;return values;};
 await run("action('editToday')");assert.match(run('editPage()'),/data-drag-exercise="0"/);assert.match(run('editPage()'),/todayMove:0:1/);
 form()['weight-0-0']='32.5';const fire=(type,y)=>handlers[type]({pointerId:1,button:0,isPrimary:true,clientY:y,target:{closest:()=>handle},preventDefault(){}});
 fire('pointerdown',25);fire('pointermove',340);assert.equal(JSON.stringify(saved),stateBefore);fire('pointerup',340);
 assert.equal(run('editor.draft.exercises[2].id'),saved.active.exercises[0].id);assert.equal(run('editor.draft.exercises[2].sets[0].weight'),32.5);assert.equal(run('editor.draft.exercises[2].sets[0].done'),true);assert.equal(run('editor.draft.exercises[2].group'),'pair');assert.equal(JSON.stringify(saved),stateBefore);
 form();await handlers.submit({preventDefault(){},target:{id:'editor'},submitter:{value:'today'}});
 assert.equal(saved.active.exercises[2].sets[0].weight,32.5);assert.equal(saved.active.exercises[2].sets[0].done,true);assert.equal(saved.active.exercises[2].group,'pair');assert.equal(JSON.stringify(saved.templates),templatesBefore);assert.equal(saved.history.length,0);
 await run("action('edit:0')");assert.match(run('editPage()'),/data-drag-exercise="0"/);await run("action('cancelEdit')");
 const history=storage.clone(saved.active);history.id='earlier';history.ended=Date.now();saved.history.push(history);context.historyRecord=history;run('s.history.push(clone(historyRecord))');await run("action('correct:earlier')");assert.doesNotMatch(run('editPage()'),/data-drag-exercise=/);
});
