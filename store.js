import {starter} from './starter.js';
export const SANDBOX=typeof location!=='undefined'&&new URLSearchParams(location.search).get('sandbox')==='true';
export const KEY='personal-training-log-v1'+(SANDBOX?'-qa':'');
export const clone=x=>structuredClone(x);
export const defaults=()=>({version:2,revision:0,templates:clone(starter).map((t,i)=>({...t,id:`session-${i}`,example:true,exercises:t.exercises.map((e,j)=>({...e,id:`starter-${i}-${j}`}))})),history:[],active:null,next:0,programme:{step:0,completed:[]},settings:{theme:'system',unit:'kg',increment:2.5,inactivityHours:12,restTimer:true,overrides:{}}});
function number(n,min=0){return typeof n==='number'&&Number.isFinite(n)&&n>=min}
export function validate(s){
 if(s?.templates?.some(t=>t.deleted!==undefined&&(typeof t.deleted!=='boolean'||t.deleted&&t.enabled!==false)))throw Error('Invalid deleted session');
 if(s?.programme?.mode!==undefined&&!['auto','manual'].includes(s.programme.mode))throw Error('Invalid programme mode');
 if(s?.templates?.some(t=>t.phase!==undefined&&t.phase!==null&&!['Heavy','Mid','Light'].includes(t.phase)))throw Error('Invalid session tag');
 if(!s||![1,2].includes(s.version)||!Array.isArray(s.templates)||(s.templates.length<1||s.templates.filter(t=>!t.deleted).length>50||!s.templates.some(t=>!t.deleted&&t.enabled!==false))||!Array.isArray(s.history)||!Number.isInteger(s.next)||s.next<0||s.next>=s.templates.length||!s.settings)throw Error('Unrecognised training data');
 if(s.programme?.order!==undefined&&(!Array.isArray(s.programme.order)||s.programme.order.length>s.templates.length||new Set(s.programme.order).size!==s.programme.order.length||s.programme.order.some(i=>!Number.isInteger(i)||i<0||i>=s.templates.length)))throw Error('Invalid session order');
 if(!['system','light','dark'].includes(s.settings.theme)||!['kg','lb'].includes(s.settings.unit)||!number(s.settings.increment,.01)||!number(s.settings.inactivityHours,2)||s.settings.inactivityHours>24)throw Error('Invalid preferences');
 if(s.templates.some(t=>typeof t.name!=='string'||!t.name.trim()||!Array.isArray(t.exercises)||t.exercises.some(e=>typeof e.name!=='string'||!e.name.trim()||!Number.isInteger(e.sets)||e.sets<1||e.sets>12||!Number.isInteger(e.reps)||!number(e.reps)||!number(e.weight))))throw Error('Invalid programme');
 const records=[...s.history,...(s.active?[s.active]:[])];
 if([...s.templates,...records].some(w=>w.exercises?.some(e=>e.group!=null&&(typeof e.group!=='string'||e.group.length>200))))throw Error('Invalid exercise group');
 if(records.some(w=>typeof w.id!=='string'||typeof w.name!=='string'||!number(w.started)||!number(w.lastActivity)||!Number.isInteger(w.templateIndex)||w.templateIndex<0||!Array.isArray(w.exercises)||w.exercises.some(e=>typeof e.name!=='string'||!Array.isArray(e.sets)||e.sets.some(z=>!number(z.weight)||!Number.isInteger(z.reps)||!number(z.reps)||typeof z.done!=='boolean'))))throw Error('Invalid workout records');
 if(s.history.some(w=>!number(w.ended)||w.ended<w.started)||new Set(records.map(w=>w.id)).size!==records.length)throw Error('Invalid workout dates or duplicate records');
 if(s.settings.overrides&& (typeof s.settings.overrides!=='object'||Object.values(s.settings.overrides).some(v=>!number(v,.01))))throw Error('Invalid exercise increments');
 if(records.some(w=>w.exercises.some(e=>e.increment!==undefined&&!number(e.increment,.01)))||s.templates.some(t=>t.exercises.some(e=>e.increment!==undefined&&!number(e.increment,.01))))throw Error('Invalid weight step');
 if(s.programme&&(!Number.isInteger(s.programme.step)||s.programme.step<0||s.programme.step>5||!Array.isArray(s.programme.completed)||s.programme.completed.length>s.templates.length||s.programme.completed.some(i=>!Number.isInteger(i)||i<0||i>=s.templates.length)||new Set(s.programme.completed).size!==s.programme.completed.length))throw Error('Invalid programme rotation');
 if(records.some(w=>w.phase!=null&&!['Heavy','Mid','Light'].includes(w.phase)))throw Error('Invalid workout phase');
 if(records.some(w=>w.restStarted!=null&&!number(w.restStarted)))throw Error('Invalid rest timer');
 if(s.settings.restTimer!==undefined&&typeof s.settings.restTimer!=='boolean')throw Error('Invalid timer preference');
 if(s.templates.some(t=>t.enabled!==undefined&&typeof t.enabled!=='boolean'))throw Error('Invalid session status');
 if(s.templates.some(t=>t.exercises.some(e=>e.presets!==undefined&&(!Array.isArray(e.presets)||e.presets.length>e.sets||e.presets.some(z=>!number(z.weight)||!Number.isInteger(z.reps)||!number(z.reps))))))throw Error('Invalid per-set starting values');
 return s;
}
export function migrate(raw){const s=validate(raw);if(s.version===1){s.version=2;s.revision=0;s.templates.forEach((t,i)=>{t.id=`session-${i}`;t.exercises.forEach((e,j)=>{e.id=`migrated-${i}-${j}`;if(Object.hasOwn(s.settings.overrides??{},e.name))e.increment=s.settings.overrides[e.name];})});}if(s.templates[s.next]?.enabled===false)s.next=[...(s.programme?.order??[]),...s.templates.map((t,i)=>i)].find(i=>s.templates[i].enabled!==false);s.settings.overrides??={};s.settings.restTimer??=true;s.programme??={step:0,completed:[]};return s;}
let db,queue=Promise.resolve();
export async function open(){
 db=await new Promise((resolve,reject)=>{const r=indexedDB.open('personal-training-log'+(SANDBOX?'-qa':''),1);r.onupgradeneeded=()=>r.result.createObjectStore('state');r.onsuccess=()=>resolve(r.result);r.onerror=()=>reject(r.error);r.onblocked=()=>reject(Error('Close other Training Log tabs and try again'));});
 db.onversionchange=()=>db.close();
 return transaction(s=>s);
}
function transaction(fn){return new Promise((resolve,reject)=>{
 const tx=db.transaction('state','readwrite'),store=tx.objectStore('state');let result,failure;
 const r=store.get('current');r.onsuccess=()=>{try{const raw=r.result??JSON.parse(localStorage.getItem(KEY)||'null');const s=raw?migrate(raw):defaults();result=fn(clone(s))||s;result.revision=(s.revision||0)+1;validate(result);store.put(result,'current');}catch(e){failure=e;tx.abort();}};
 tx.oncomplete=()=>resolve(clone(result));tx.onabort=tx.onerror=()=>reject(failure||tx.error||Error('Saving failed'));
 });}
export function commit(fn){const p=queue.then(()=>transaction(fn));queue=p.catch(()=>{});return p;}
export async function read(){await queue;return new Promise((resolve,reject)=>{const tx=db.transaction('state','readonly');const r=tx.objectStore('state').get('current');r.onsuccess=()=>{try{resolve(migrate(r.result))}catch(e){reject(e)}};r.onerror=()=>reject(r.error);});}

export async function recover(){if(!db)return localStorage.getItem(KEY);return new Promise((resolve,reject)=>{const r=db.transaction('state','readonly').objectStore('state').get('current');r.onsuccess=()=>resolve(r.result?JSON.stringify(r.result):localStorage.getItem(KEY));r.onerror=()=>reject(r.error);});}
