import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import fs from 'node:fs/promises';
import * as model from '../model.js';
import * as storage from '../store.js';
test('actual session order screen previews, cancels, saves and drives sequence without changing history',async()=>{
 let saved=storage.defaults();saved.templates[2].name='<Upper & B>';const when=Date.now()-10000;model.startSession(saved,1,when,'old');model.finishSession(saved,'old',when+1);
 const before=JSON.stringify(saved),historyBefore=JSON.stringify(saved.history),handlers={},nodes=new Map();const node=id=>{if(!nodes.has(id))nodes.set(id,{innerHTML:'',textContent:''});return nodes.get(id);};
 const context=vm.createContext({...model,...storage,structuredClone,crypto,Date,URL,Blob,Number,String,Set,Math,Object,JSON,initial:saved,
 window:{scrollTo(){}},document:{getElementById:node,querySelectorAll:()=>[],querySelector:()=>({}),addEventListener:(name,fn)=>handlers[name]=fn},setTimeout:()=>1,clearTimeout(){},confirm:()=>true,
 commit:async fn=>{const next=fn(storage.clone(saved));storage.validate(next);saved=storage.clone(next);return storage.clone(next);}});
 let source=await fs.readFile(new URL('../app.js',import.meta.url),'utf8');source=source.replace(/^import .*;\n/gm,'').split('async function sync()')[0];vm.runInContext(source+'\ns=clone(initial);selected=s.next;render=()=>{};',context);const run=code=>vm.runInContext(code,context);
 assert.match(run('training()'),/Reorder sessions/);await run("action('reorderSessions')");assert.equal(run('page'),'sessionOrder');assert.match(run('sessionOrderPage()'),/&lt;Upper &amp; B&gt;/);assert.doesNotMatch(run('sessionOrderPage()'),/<Upper & B>/);
 await run("action('orderMove:2:-1')");assert.equal(JSON.stringify(saved),before);assert.equal(JSON.stringify(run('orderDraft.indices')),'[0,2,1,3]');
 context.confirm=()=>false;await run("go('history')");assert.equal(run('page'),'sessionOrder');await run("action('cancelOrder')");assert.equal(JSON.stringify(saved),before);
 context.confirm=()=>true;await run("action('reorderSessions')");await run("action('orderMove:2:-1')");await run("action('saveOrder')");assert.equal(run('page'),'training');assert.deepEqual(saved.programme.order,[0,2,1,3]);assert.equal(saved.next,2);assert.deepEqual(saved.programme.completed,[1]);assert.equal(JSON.stringify(saved.history),historyBefore);
 const sessionList=run('training()').split('<h2>Programme sessions</h2>')[1];assert.ok(sessionList.indexOf('&lt;Upper &amp; B&gt;')<sessionList.indexOf('Lower A'));
 run('detail=null');const historyHtml=run('history()');assert.ok(historyHtml.indexOf('value="2"')<historyHtml.indexOf('value="1"'));
 await run('start(2)');assert.equal(saved.active.name,'<Upper & B>');const activeBefore=JSON.stringify(saved);await run("action('reorderSessions')");assert.equal(JSON.stringify(saved),activeBefore);assert.equal(run('page'),'active');
 await run("action('finishConfirmed:'+s.active.id)");assert.equal(saved.next,3);assert.equal(saved.history[0].id,'old');assert.equal(JSON.stringify(saved.history[0]),JSON.stringify(JSON.parse(historyBefore)[0]));
 const restored=storage.migrate(JSON.parse(JSON.stringify(saved)));assert.deepEqual(model.sessionOrder(restored),[0,2,1,3]);
});
