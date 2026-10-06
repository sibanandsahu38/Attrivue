/* ===== STORE (every storage call wrapped in try/catch) =====
   Two transports share one shape: the browser (localStorage) when the page is
   opened as a static file, and the Python API + SQLite when served by server.py.
   The server sets window.__ATTRIVUE_API__ when it serves index.html. */
const API_MODE=typeof window!=='undefined'&&!!window.__ATTRIVUE_API__;
const apiCache={};
let apiToken=null;
let apiSaveTimer=null;
/* One request per burst of edits instead of one per change. */
function apiSaveAccount(account){
 if(!apiToken)return;
 clearTimeout(apiSaveTimer);
 apiSaveTimer=setTimeout(()=>{
  fetch('/api/account',{method:'POST',headers:{'Content-Type':'application/json','Authorization':'Bearer '+apiToken},body:JSON.stringify(account)})
   .then(r=>{if(!r.ok)throw new Error(String(r.status));})
   .catch(()=>toast('Could not save to the server. Your change may be lost.','alert',6000));
 },300);
}
function apiTokenGet(){try{return localStorage.getItem(PREFIX+'token');}catch(e){return null;}}
function apiTokenSet(t){
 try{if(t)localStorage.setItem(PREFIX+'token',t);else localStorage.removeItem(PREFIX+'token');}
 catch(e){toast('Storage is unavailable in this browser. You will need to log in again after a reload.','alert',8000);}
}
function storageGet(key,fallback){
 if(API_MODE)return Object.prototype.hasOwnProperty.call(apiCache,key)?apiCache[key]:fallback;
 try{const raw=localStorage.getItem(PREFIX+key);return raw?JSON.parse(raw):fallback;}
 catch(e){return fallback;}
}
function storageSet(key,value){
 if(API_MODE){
  apiCache[key]=value;
  if(key.indexOf('account.')===0)apiSaveAccount(value);
  return true;
 }
 try{localStorage.setItem(PREFIX+key,JSON.stringify(value));return true;}
 catch(e){toast('Storage is unavailable or full in this browser. Your changes may not be saved.','alert',8000);return false;}
}
function storageRemove(key){
 if(API_MODE){
  delete apiCache[key];
  if(apiToken){fetch('/api/logout',{method:'POST',headers:{'Authorization':'Bearer '+apiToken}}).catch(()=>{});}
  apiToken=null;apiTokenSet(null);
  return;
 }
 try{localStorage.removeItem(PREFIX+key);}catch(e){}
}
function accountKey(username){return 'account.'+username;}
function loadAccount(username){return storageGet(accountKey(username),null);}
function saveAccount(){
 if(!state.user)return;
 storageSet(accountKey(state.user),{hash:state.hash,created:state.created,schemaVersion:SCHEMA_VERSION,theme:state.theme,privacy:state.privacy,tourDone:state.tourDone,modelId:state.modelId,customModels:state.customModels,models:state.models,log:state.log});
}
function logAction(text){
 state.log.unshift({time:new Date().toISOString(),text});
 if(state.log.length>LOG_LIMIT)state.log.length=LOG_LIMIT;
 saveAccount();
}

/* ===== STATE ===== */
const state={user:null,hash:null,created:null,modelId:'ibm',theme:'system',privacy:false,tourDone:false,customModels:[],models:{},log:[],scores:null,companyCache:null};
function currentModel(){return MODELS_BY_ID[state.modelId]||MODELS[0];}
function allModels(){return MODELS.concat(state.customModels);}
function registerCustomModels(){state.customModels.forEach(m=>{MODELS_BY_ID[m.id]=m;});}
function modelData(){const m=currentModel();if(!state.models[m.id])state.models[m.id]={employees:[],scenarios:[],snapshots:[]};return state.models[m.id];}
function employees(){return modelData().employees;}
function scenarios(){return modelData().scenarios;}
function snapshots(){return modelData().snapshots;}
function invalidateCache(){state.scores=null;state.companyCache=null;}
function scoredEmployees(){
 if(!state.scores||state.scores.length!==employees().length){
  const m=currentModel();
  state.scores=employees().map(emp=>scoreEmployee(m,emp));
 }
 const m=currentModel();
 return employees().map((emp,i)=>({emp,i,p:state.scores[i],lvl:riskLevel(m,state.scores[i])}));
}
function companyStats(){
 if(state.companyCache)return state.companyCache;
 const sc=scoredEmployees();
 const avg=sc.length?sc.reduce((s,x)=>s+x.p,0)/sc.length:0;
 const high=sc.filter(x=>x.lvl==='High').length;
 const expected=sc.reduce((s,x)=>s+x.p,0);
 state.companyCache={count:sc.length,avg,high,expected};
 return state.companyCache;
}
function displayName(emp,i){return state.privacy?('Employee '+String(i+1).padStart(3,'0')):emp.name;}
function findEmp(id){return employees().find(e=>e.id===id)||null;}
function addEmployees(list,verb){
 modelData().employees.push.apply(modelData().employees,list);
 invalidateCache();saveAccount();
 logAction((verb||'Added')+' '+list.length+' employee'+(list.length===1?'':'s'));
}
function deleteEmployeesById(ids){
 const set=new Set(ids);const removed=[];const keep=[];
 employees().forEach((e,i)=>{if(set.has(e.id))removed.push({idx:i,emp:e});else keep.push(e);});
 modelData().employees=keep;
 invalidateCache();saveAccount();
 logAction('Deleted '+removed.length+' employee'+(removed.length===1?'':'s'));
 return removed;
}
function restoreEmployees(removed){
 const all=employees().map((emp,i)=>({idx:i,emp}));
 removed.forEach(r=>all.push(r));
 all.sort((a,b)=>a.idx-b.idx);
 modelData().employees=all.map(x=>x.emp);
 invalidateCache();saveAccount();
 logAction('Restored '+removed.length+' employee'+(removed.length===1?'':'s'));
}
