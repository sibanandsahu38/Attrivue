/* ===== FEATURES ===== */
function selftestHTML(rows){
 return '<div class="table-wrap"><table class="table"><thead><tr><th scope="col">Model</th><th scope="col">Check</th><th scope="col">Expected</th><th scope="col">Actual</th><th scope="col">Result</th></tr></thead><tbody>'
  +rows.map(r=>'<tr><td>'+esc(r.modelName)+'</td><td>'+esc(r.label)+'</td><td class="mono">'+r.expected.toFixed(4)+'</td><td class="mono">'+r.actual.toFixed(4)+'</td><td>'+(r.pass?'<span class="chip chip-good">PASS</span>':'<span class="chip chip-bad">FAIL</span>')+'</td></tr>').join('')
  +'</tbody></table></div>';
}
function runSelftestAction(){
 const rows=runSelfTest();
 const el=$('#selftest-results');if(el)el.innerHTML=selftestHTML(rows);
 const failed=rows.filter(r=>!r.pass).length;
 toast(failed?failed+' of '+rows.length+' self-test checks failed':'All '+rows.length+' self-test checks passed',failed?'alert':'check');
}

/* ----- command palette (Ctrl/Cmd+K) ----- */
let paletteOpen=false,paletteIdx=0,paletteItems=[];
function openPalette(){
 paletteOpen=true;paletteIdx=0;
 $('#palette-root').innerHTML='<div class="palette-backdrop" data-action="palette-close"></div><div class="palette card" role="dialog" aria-modal="true" aria-label="Command palette">'
  +'<input id="palette-input" class="input" placeholder="Jump to a screen, find an employee, switch model…" autocomplete="off"><ul id="palette-list" role="listbox"></ul></div>';
 const inp=$('#palette-input');
 inp.addEventListener('input',()=>renderPaletteResults(inp.value));
 inp.focus();
 renderPaletteResults('');
}
function closePalette(){paletteOpen=false;$('#palette-root').innerHTML='';}
function paletteCommands(){
 const cmds=[];const m=currentModel();
 SCREENS.forEach(s=>cmds.push({label:'Go to '+s.name,group:'Screen',run:()=>{location.hash='#/'+s.id;}}));
 employees().slice(0,200).forEach((e,i)=>cmds.push({label:displayName(e,i),group:'Employee',hint:valueLabel(m.roleKey,e[m.roleKey]),run:()=>{location.hash='#/employees';setTimeout(()=>openEmployeeDrawer(e.id),60);}}));
 allModels().forEach(x=>cmds.push({label:'Switch to model '+x.name,group:'Model',run:()=>switchModel(x.id)}));
 cmds.push({label:isDark()?'Switch to light mode':'Switch to dark mode',group:'Action',run:()=>{setTheme(isDark()?'light':'dark');renderApp();}});
 cmds.push({label:state.privacy?'Turn off privacy mode':'Turn on privacy mode',group:'Action',run:()=>togglePrivacy()});
 return cmds;
}
function renderPaletteResults(q){
 q=(q||'').toLowerCase();
 paletteItems=paletteCommands().filter(c=>!q||(c.label+' '+(c.hint||'')+' '+c.group).toLowerCase().indexOf(q)>-1);
 if(paletteIdx>=paletteItems.length)paletteIdx=0;
 const list=$('#palette-list');if(!list)return;
 if(!paletteItems.length){list.innerHTML='<li class="muted" style="cursor:default">No matches.</li>';return;}
 list.innerHTML=paletteItems.map((c,i)=>'<li role="option" aria-selected="'+(i===paletteIdx)+'" data-pidx="'+i+'" data-action="palette-run"><span class="p-group">'+esc(c.group)+'</span><span>'+esc(c.label)+'</span>'+(c.hint?'<span class="p-hint">'+esc(c.hint)+'</span>':'')+'</li>').join('');
}
function paletteKey(e){
 if(e.key==='ArrowDown'){e.preventDefault();paletteIdx=(paletteIdx+1)%paletteItems.length;paintPaletteSel();}
 else if(e.key==='ArrowUp'){e.preventDefault();paletteIdx=(paletteIdx-1+paletteItems.length)%paletteItems.length;paintPaletteSel();}
 else if(e.key==='Enter'){e.preventDefault();const c=paletteItems[paletteIdx];if(c){closePalette();c.run();}}
}
function paintPaletteSel(){
 $$('#palette-list li[data-pidx]').forEach(li=>{
  const sel=+li.dataset.pidx===paletteIdx;
  li.setAttribute('aria-selected',String(sel));
  if(sel)li.scrollIntoView({block:'nearest'});
 });
}

/* ----- first-use tour ----- */
const TOUR_STEPS=[
 {title:'Welcome to Attrivue',text:'Pick a model in the top bar — it decides how risk is scored. You can switch models any time; each keeps its own data.'},
 {title:'Add your employees',text:'Use Add / Import to enter people manually, import a CSV file, or load 25 sample employees to explore.'},
 {title:'Explore what-if and insights',text:'What-if shows what happens if things change for one person. Insights shows patterns for the whole company. Press Ctrl+K (or Cmd+K) any time to search.'}
];
let tourStep=0;
function showTour(){tourStep=0;renderTour();}
function renderTour(){
 const step=TOUR_STEPS[tourStep];
 $('#tour-root').innerHTML='<div class="tour-backdrop"></div><div class="tour card" role="dialog" aria-modal="true" aria-label="Tour step '+(tourStep+1)+'">'
  +'<div class="tour-step">Step '+(tourStep+1)+' of '+TOUR_STEPS.length+'</div><h3>'+esc(step.title)+'</h3><p class="muted">'+esc(step.text)+'</p>'
  +'<div class="quick">'+(tourStep>0?'<button class="btn" data-action="tour-prev">Back</button>':'')
  +(tourStep<TOUR_STEPS.length-1?'<button class="btn btn-primary" data-action="tour-next">Next</button>':'<button class="btn btn-primary" data-action="tour-done">Done</button>')
  +'<button class="btn btn-ghost" data-action="tour-skip">Skip tour</button></div></div>';
 trapFocus($('#tour-root .tour'));
}
function endTour(){$('#tour-root').innerHTML='';state.tourDone=true;saveAccount();}

/* ----- backup & restore ----- */
function downloadBackup(){
 const payload={app:APP_TITLE,schemaVersion:SCHEMA_VERSION,exported:new Date().toISOString(),modelId:state.modelId,models:state.models,customModels:state.customModels,log:state.log,theme:state.theme,privacy:state.privacy,tourDone:state.tourDone};
 downloadBlob('attrivue-backup.json','application/json',JSON.stringify(payload,null,2));
 logAction('Downloaded backup');
 toast('Backup downloaded');
}
function handleBackupFile(file){
 if(!file)return;
 const reader=new FileReader();
 reader.onload=()=>applyBackupText(String(reader.result||''),file.name);
 reader.onerror=()=>toast('Could not read that file.','alert');
 reader.readAsText(file);
}
async function applyBackupText(text,name){
 let obj;
 try{obj=JSON.parse(text);}catch(e){toast('That file is not valid JSON.','alert');return;}
 if(!obj||typeof obj.models!=='object'||!obj.models){toast('That file does not look like an Attrivue backup.','alert');return;}
 const ok=await confirmDialog('Restore the backup "'+name+'"? This replaces all current records, scenarios and snapshots.','Restore backup',false);
 if(!ok)return;
 state.models=obj.models||{};state.customModels=obj.customModels||[];state.log=obj.log||[];
 state.theme=obj.theme||'system';state.privacy=!!obj.privacy;
 registerCustomModels();
 if(!MODELS_BY_ID[state.modelId])state.modelId='ibm';
 invalidateCache();applyTheme();saveAccount();renderApp();
 logAction('Restored backup from file');
 toast('Backup restored');
}

/* ----- import model ----- */
function validateModel(o){
 const errs=[];
 if(!o||typeof o!=='object'||Array.isArray(o))return ['The file does not contain a JSON object.'];
 if(typeof o.name!=='string'||!o.name.trim())errs.push('"name" must be a non-empty string.');
 ['intercept','hi','mid','base_rate','cv_auc','top10_prec','n'].forEach(k=>{if(typeof o[k]!=='number'||!Number.isFinite(o[k]))errs.push('"'+k+'" must be a number.');});
 if(!o.num||typeof o.num!=='object')errs.push('"num" must be an object of numeric fields.');
 else Object.keys(o.num).forEach(k=>{const f=o.num[k];if(!f||typeof f!=='object'){errs.push('"num.'+k+'" must be an object.');return;}['mean','scale','coef','min','max'].forEach(p=>{if(typeof f[p]!=='number'||!Number.isFinite(f[p]))errs.push('"num.'+k+'.'+p+'" must be a number.');});});
 if(!o.cat||typeof o.cat!=='object')errs.push('"cat" must be an object of category fields.');
 else Object.keys(o.cat).forEach(k=>{const c=o.cat[k];if(!c||typeof c!=='object'){errs.push('"cat.'+k+'" must be an object.');return;}Object.keys(c).forEach(v=>{if(typeof c[v]!=='number'||!Number.isFinite(c[v]))errs.push('"cat.'+k+'.'+v+'" must be a number.');});});
 ['catbase','medians'].forEach(key=>{
  if(!o[key]||typeof o[key]!=='object')errs.push('"'+key+'" must be an object.');
  else Object.keys(o[key]).forEach(k=>{if(typeof o[key][k]!=='number'||!Number.isFinite(o[key][k]))errs.push('"'+key+'.'+k+'" must be a number.');});
 });
 if(!o.catdef||typeof o.catdef!=='object')errs.push('"catdef" must be an object.');
 if(typeof o.roleKey!=='string'||!o.roleKey)errs.push('"roleKey" must be a string.');
 if(typeof o.deptKey!=='string'||!o.deptKey)errs.push('"deptKey" must be a string.');
 if(!Array.isArray(o.fix))errs.push('"fix" must be an array of company actions.');
 else o.fix.forEach((a,i)=>{if(!a||typeof a.k!=='string'||['set','min','max','mul','up'].indexOf(a.type)===-1)errs.push('"fix['+i+']" must have a field "k" and a valid "type" (set, min, max, mul, up).');});
 return errs;
}
let pendingModelFile='';
function handleModelFile(file){
 if(!file)return;
 const reader=new FileReader();
 reader.onload=()=>{pendingModelFile=String(reader.result||'');const ta=$('#model-json');if(ta)ta.value=pendingModelFile;toast('File loaded — press "Validate & add model".');};
 reader.onerror=()=>toast('Could not read that file.','alert');
 reader.readAsText(file);
}
function handleModelAdd(){
 const ta=$('#model-json'),msg=$('#model-msg');
 const text=((ta&&ta.value)||'').trim()||pendingModelFile;
 if(!text){msg.innerHTML='<p class="c-red">Paste a model JSON or upload a file first.</p>';return;}
 let obj;
 try{obj=JSON.parse(text);}catch(e){msg.innerHTML='<p class="c-red">That is not valid JSON: '+esc(e.message)+'</p>';return;}
 const errs=validateModel(obj);
 if(errs.length){msg.innerHTML='<p class="c-red">The model was rejected:</p><ul class="rej">'+errs.map(e=>'<li>'+esc(e)+'</li>').join('')+'</ul>';return;}
 obj.id=slug(obj.name);let n=2;
 while(MODELS_BY_ID[obj.id]){obj.id=slug(obj.name)+'-'+n;n++;}
 obj.name=obj.name.trim();
 state.customModels.push(obj);MODELS_BY_ID[obj.id]=obj;
 saveAccount();logAction('Imported model "'+obj.name+'"');
 msg.innerHTML='<p class="c-green">Model "'+esc(obj.name)+'" added. It appears in the model selector.</p>';
 if(ta)ta.value='';pendingModelFile='';
 toast('Model "'+obj.name+'" added');
 renderApp();
}
