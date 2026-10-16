import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import fs from 'node:fs/promises';
import * as model from '../model.js';
import * as storage from '../store.js';
import {exerciseCatalogue} from '../exercises.js';

test('deleting a session preserves history and stable indices through backup and reorder',()=>{
 const s=storage.defaults(),now=Date.now()-1000;
 model.saveSessionOrder(s,[2,0,3,1]);model.startSession(s,0,now,'earlier');model.updateSet(s,'earlier',0,0,'done',true,now+1);model.finishSession(s,'earlier',now+2);
 const history=JSON.stringify(s.history),third=JSON.stringify(s.templates[3]);
 model.deleteSession(s,0,s.templates[0].id);
 assert.equal(JSON.stringify(s.history),history);assert.equal(JSON.stringify(s.templates[3]),third);
 assert.deepEqual(model.sessionOrder(s),[2,3,1]);assert.equal(s.next,3);assert.deepEqual(s.programme.completed,[]);
 assert.throws(()=>model.startSession(s,0,now,'deleted'),/deleted/);assert.throws(()=>model.toggleSession(s,0),/not found/);assert.throws(()=>model.duplicateSessionDraft(s,0,'copy'),/not found/);
 model.saveSessionOrder(s,[1,2,3]);assert.deepEqual(model.sessionOrder(storage.migrate(storage.clone(s))),[1,2,3]);
 const entries=exerciseCatalogue(s);assert.ok(entries.some(e=>e.stats.sessions));assert.ok(!entries.some(e=>e.exercise.id===s.templates[0].exercises[1].id&&e.inProgramme));
 assert.equal(JSON.stringify(s.history),history);storage.validate(s);
});

test('deleting the next session chooses the next unfinished session in custom order',()=>{
 const s=storage.defaults();model.saveSessionOrder(s,[2,0,3,1]);s.next=3;s.programme.completed=[0];
 model.deleteSession(s,3,s.templates[3].id);assert.equal(s.next,1);assert.deepEqual(s.programme.completed,[0]);
 s.templates.push({...storage.clone(s.templates[1]),id:'new-session'});assert.deepEqual(model.sessionOrder(s),[2,0,1,4]);storage.validate(s);
});

test('deletion rejects running, stale, missing and last-active sessions without partial mutation',()=>{
 const s=storage.defaults(),before=JSON.stringify(s);
 assert.throws(()=>model.deleteSession(s,0,'wrong-id'),/changed/);assert.equal(JSON.stringify(s),before);
 assert.throws(()=>model.deleteSession(s,99),/no longer/);assert.equal(JSON.stringify(s),before);
 model.startSession(s,1,Date.now(),'running');const running=JSON.stringify(s);
 assert.throws(()=>model.deleteSession(s,0),/Finish/);assert.equal(JSON.stringify(s),running);
 s.active=null;for(const i of [1,2,3])model.deleteSession(s,i);const last=JSON.stringify(s);
 assert.throws(()=>model.deleteSession(s,0),/at least one/);assert.equal(JSON.stringify(s),last);
});

test('deleted sessions do not consume the limit for adding programme sessions',()=>{
 const s=storage.defaults();while(s.templates.length<50)s.templates.push({...storage.clone(s.templates[0]),id:'session-'+s.templates.length});
 model.deleteSession(s,1);s.templates.push(model.duplicateSessionDraft(s,0,'replacement'));
 assert.equal(s.templates.length,51);assert.equal(model.sessionOrder(s).length,50);storage.validate(s);
 assert.throws(()=>model.duplicateSessionDraft(s,0,'too-many'),/Maximum/);
});

test('deleting the only remaining session completes the current rotation exactly once',()=>{
 const s=storage.defaults();s.programme.step=1;s.programme.completed=[0,1,2];s.next=3;
 model.deleteSession(s,3);assert.equal(s.programme.step,2);assert.deepEqual(s.programme.completed,[]);assert.equal(s.next,0);
 const restored=storage.migrate(storage.clone(s));assert.equal(restored.programme.step,2);assert.deepEqual(model.enabledIndices(restored),[0,1,2]);
});

test('actual simplified editor preserves defaults, and delete confirmation protects history and stale drafts',async()=>{
 let saved=storage.defaults();saved.templates[0].exercises[0].increment=1.25;saved.templates[0].exercises[0].presets=Array.from({length:saved.templates[0].exercises[0].sets},(_,i)=>({weight:30+i,reps:8-i}));
 model.startSession(saved,0,Date.now()-1000,'past');model.finishSession(saved,'past',Date.now());const history=JSON.stringify(saved.history),original=storage.clone(saved.templates[0].exercises[0]);
 const handlers={},nodes=new Map(),node=id=>{if(!nodes.has(id))nodes.set(id,{innerHTML:'',textContent:''});return nodes.get(id);};let confirmations=0,accept=false;
 const context=vm.createContext({...model,...storage,structuredClone,crypto,Date,URL,Blob,Number,String,Set,Math,Object,JSON,initial:saved,window:{scrollTo(){}},document:{getElementById:node,querySelectorAll:()=>[],querySelector:()=>({}),addEventListener:(name,fn)=>handlers[name]=fn},setTimeout:()=>1,clearTimeout(){},confirm:()=>{confirmations++;return accept;},
 FormData:class{constructor(form){this.values=form.values;}get(key){return this.values[key]??null;}has(key){return Object.hasOwn(this.values,key);}},
 commit:async fn=>{const next=fn(storage.clone(saved));storage.validate(next);saved=storage.clone(next);return storage.clone(next);}});
 let source=await fs.readFile(new URL('../app.js',import.meta.url),'utf8');source=source.replace(/^import .*;\n/gm,'').split('async function sync()')[0];vm.runInContext(source+'\ns=clone(initial);render=()=>{};',context);const run=code=>vm.runInContext(code,context);
 const form=()=>{const draft=run('editor.draft'),values={name:draft.name,phase:'inherit'};draft.exercises.forEach((ex,i)=>{values['exercise-'+i]=ex.name;values['sets-'+i]=String(ex.sets);});node('editor').values=values;return values;};
 await run("action('edit:0')");assert.doesNotMatch(run('editPage()'),/Starting reps|Starting weight|Weight step|name="(?:weight|reps|increment)-0"/);
 form()['sets-0']='1';await handlers.submit({preventDefault(){},target:{id:'editor'}});
 assert.equal(saved.templates[0].exercises[0].weight,original.weight);assert.equal(saved.templates[0].exercises[0].reps,original.reps);assert.equal(saved.templates[0].exercises[0].increment,1.25);assert.deepEqual(saved.templates[0].exercises[0].presets,original.presets.slice(0,1));
 assert.match(run('training()'),/data-action="deleteSession:0"/);const before=JSON.stringify(saved);
 await run("action('deleteSession:0')");assert.equal(JSON.stringify(saved),before);assert.equal(confirmations,1);
 accept=true;await run("action('deleteSession:0')");assert.ok(saved.templates[0].deleted);assert.doesNotMatch(run('training()'),/data-action="(?:choose|edit|deleteSession):0"/);assert.match(run('history()'),/deleted session/);assert.equal(JSON.stringify(saved.history),history);
 await run("action('edit:1')");form();model.deleteSession(saved,1);const afterDelete=JSON.stringify(saved);
 await handlers.submit({preventDefault(){},target:{id:'editor'}});assert.equal(JSON.stringify(saved),afterDelete);assert.ok(run('saveError'));
});
