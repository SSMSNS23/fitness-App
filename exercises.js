import {clone} from './store.js';
import {matches,previousSet} from './model.js';

export function exerciseRecords(state,exercise,phase='all'){
 return state.history.filter(w=>phase==='all'||(w.phase??'Earlier')===phase).map(workout=>({workout,exercises:workout.exercises.filter(ex=>matches(ex,exercise)&&ex.sets.some(z=>z.done))})).filter(record=>record.exercises.length).sort((a,b)=>b.workout.started-a.workout.started);
}
export function exerciseStats(records){const sets=records.flatMap(r=>r.exercises.flatMap(ex=>ex.sets.filter(z=>z.done)));return {sessions:records.length,heaviest:sets.length?Math.max(...sets.map(z=>z.weight)):null,latest:records[0]??null};}
export function exerciseCatalogue(state){
 const entries=[];
 const add=(exercise,inProgramme=false)=>{let entry=entries.find(e=>matches(e.exercise,exercise));if(!entry){entry={exercise:clone(exercise),inProgramme,index:entries.length};entries.push(entry);}else if(inProgramme)entry.inProgramme=true;};
 state.templates.filter(t=>!t.deleted).forEach(t=>t.exercises.forEach(ex=>add(ex,true)));
 [...state.history].sort((a,b)=>b.started-a.started).forEach(w=>w.exercises.filter(ex=>ex.sets.some(z=>z.done)).forEach(ex=>add(ex)));
 for(const entry of entries){entry.records=exerciseRecords(state,entry.exercise);entry.stats=exerciseStats(entry.records);}
 return entries.sort((a,b)=>(b.stats.latest?.workout.started??-1)-(a.stats.latest?.workout.started??-1)||a.exercise.name.localeCompare(b.exercise.name,'en-AU'));
}
export function searchExercises(entries,query){const words=String(query).trim().toLocaleLowerCase('en-AU').split(/\s+/).filter(Boolean);return entries.filter(entry=>{const aliases=Array.isArray(entry.exercise.aliases)?entry.exercise.aliases.filter(x=>typeof x==='string'):[];const text=[entry.exercise.name,...aliases].join(' ').toLocaleLowerCase('en-AU');return words.every(word=>text.includes(word));});}
export function reusableExercise(exercise){const copy=clone(exercise);delete copy.group;copy.sets=Array.isArray(copy.sets)?Math.max(1,Math.min(12,copy.sets.length)):copy.sets;copy.weight=Number.isFinite(copy.weight)?copy.weight:0;copy.reps=Number.isInteger(copy.reps)?copy.reps:10;if(copy.presets)copy.presets=copy.presets.slice(0,copy.sets);return copy;}
export function insertLibraryExercise(draft,exercise,{active=false,index=null,state=null}={}){
 const template=reusableExercise(exercise);
 const replacing=index!==null;
 if(replacing&&(!Number.isInteger(index)||!draft.exercises[index]))throw Error('Exercise no longer exists');
 if(active)template.sets=Array.from({length:template.sets},(_,j)=>{const prior=state?previousSet(state,template,j,draft.phase??null):null;return {weight:prior?.weight??template.presets?.[j]?.weight??template.weight,reps:prior?.reps??template.presets?.[j]?.reps??template.reps,done:false};});
 if(replacing){const group=draft.exercises[index].group;if(group)template.group=group;draft.exercises[index]=template;}else draft.exercises.push(template);
 return template;
}
