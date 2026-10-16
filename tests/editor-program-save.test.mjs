import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import fs from 'node:fs/promises';
import * as model from '../model.js';
import * as storage from '../store.js';

test('the rendered Save today and program button updates both workout and future template',async()=>{
 let saved=storage.defaults();model.startSession(saved,0,Date.now()-1000,'running');const history=JSON.stringify(saved.history),nodes=new Map(),handlers={};
 const node=id=>{if(!nodes.has(id))nodes.set(id,{innerHTML:'',textContent:''});return nodes.get(id);};
 const context=vm.createContext({...model,...storage,structuredClone,crypto,Date,URL,Blob,Number,String,Set,Math,Object,JSON,initial:saved,window:{scrollTo(){}},document:{getElementById:node,querySelectorAll:()=>[],querySelector:()=>({}),addEventListener:(name,fn)=>handlers[name]=fn},setTimeout:()=>1,clearTimeout(){},confirm:()=>true,
 FormData:class{constructor(form){this.values=form.values;}get(key){return this.values[key]??null;}has(key){return Object.hasOwn(this.values,key);}},
 commit:async fn=>{const next=fn(storage.clone(saved));storage.validate(next);saved=storage.clone(next);return storage.clone(next);}});
 let source=await fs.readFile(new URL('../app.js',import.meta.url),'utf8');source=source.replace(/^import .*;\n/gm,'').split('async function sync()')[0];vm.runInContext(source+'\ns=clone(initial);render=()=>{};',context);const run=code=>vm.runInContext(code,context);
 await run("action('editToday')");const html=run('editPage()'),value=html.match(/<button class="ghost" type="submit" value="([^"]+)">Save today &amp; program<\/button>/)?.[1];assert.ok(value,'use the action value actually rendered for the user');
 const draft=run('editor.draft'),values={name:'Session updated for future workouts'};draft.exercises.forEach((ex,i)=>{values['exercise-'+i]=ex.name;ex.sets.forEach((set,j)=>{values[`weight-${i}-${j}`]=String(i===0?22.5:set.weight);values[`reps-${i}-${j}`]=String(i===0?7:set.reps);});});node('editor').values=values;
 await handlers.submit({preventDefault(){},target:{id:'editor'},submitter:{value}});
 assert.equal(saved.active.name,values.name);assert.equal(saved.templates[0].name,values.name);assert.equal(saved.active.exercises[0].sets[0].weight,22.5);assert.equal(saved.templates[0].exercises[0].weight,22.5);assert.equal(saved.templates[0].exercises[0].reps,7);assert.deepEqual(saved.templates[0].exercises[0].presets[0],{weight:22.5,reps:7});assert.equal(JSON.stringify(saved.history),history);
});
