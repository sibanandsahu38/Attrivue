/* ===== EVENT DELEGATION ===== */
function handleAction(action,t){
 switch(action){
  case 'login-tab':loginViewMode=t.dataset.mode==='signup'?'signup':'signin';renderApp();break;
  case 'toggle-pw':{const inp=t.closest('.pw-wrap').querySelector('input');const show=inp.type==='password';inp.type=show?'text':'password';t.innerHTML=icon(show?'eye-off':'eye',16);t.setAttribute('aria-label',show?'Hide password':'Show password');break;}
  case 'open-palette':openPalette();break;
  case 'palette-close':closePalette();break;
  case 'palette-run':{const c=paletteItems[+t.dataset.pidx];if(c){closePalette();c.run();}break;}
  case 'toggle-privacy':togglePrivacy();break;
  case 'toggle-theme':setTheme(isDark()?'light':'dark');renderApp();break;
  case 'toggle-usermenu':{const menu=$('#user-menu');const open=menu.hidden;menu.hidden=!open;t.setAttribute('aria-expanded',String(open));break;}
  case 'signout':signOut();break;
  case 'goto':location.hash='#/'+(t.dataset.to||'dashboard')+(t.dataset.tab?'?tab='+t.dataset.tab:'');break;
  case 'about-model':location.hash='#/settings';setTimeout(()=>{const el=$('#about-model');if(el)el.scrollIntoView({behavior:'smooth',block:'start'});},80);break;
  case 'drawer-close':closeDrawer();break;
  case 'modal-resolve':resolveModal(t.dataset.v==='1');break;
  case 'add-tab':location.hash='#/add?tab='+t.dataset.tab;break;
  case 'sample':{const emps=generateSample();addEmployees(emps,'Loaded');toast('Loaded '+emps.length+' sample employees');if(currentScreen()==='add')location.hash='#/employees';else renderApp();break;}
  case 'csv-browse':$('#csv-file').click();break;
  case 'csv-parse':csvParseAction();break;
  case 'csv-confirm':csvConfirmAction();break;
  case 'csv-cancel':csvResult=null;renderView();break;
  case 'sort':{const k=t.dataset.key;if(empView.sortKey===k)empView.sortDir*=-1;else{empView.sortKey=k;empView.sortDir=(k==='p'?-1:1);}empView.page=0;renderView();break;}
  case 'page-prev':empView.page=Math.max(0,empView.page-1);renderView();break;
  case 'page-next':empView.page=empView.page+1;renderView();break;
  case 'emp-reset-filters':empView.q='';empView.risk='';empView.group='';empView.page=0;renderView();break;
  case 'emp-row':openEmployeeDrawer(t.dataset.id);break;
  case 'emp-delete':deleteOneEmployee(t.dataset.id);break;
  case 'emp-bulk':deleteSelectedEmployees();break;
  case 'emp-clear':clearAllEmployees();break;
  case 'whatif-open':closeDrawer();whatif.empId=t.dataset.id;whatif.vals={};if(location.hash.indexOf('#/whatif')===0)renderView();else location.hash='#/whatif';break;
  case 'whatif-reset':whatif.vals={};renderView();break;
  case 'whatif-apply':{const m=currentModel();const emp=findEmp(whatif.empId);if(!emp)break;const mod=applyAllActions(m,emp);whatif.vals={};whatifFields(m).forEach(k=>{whatif.vals[k]=mod[k];});renderView();toast('Applied all company actions to the what-if copy.');break;}
  case 'scenario-delete':modelData().scenarios=modelData().scenarios.filter(s=>s.id!==t.dataset.id);saveAccount();logAction('Deleted a scenario');toast('Scenario deleted');renderView();break;
  case 'scenario-clear':confirmDialog('Delete all saved scenarios?','Clear scenarios').then(ok=>{if(!ok)return;modelData().scenarios=[];saveAccount();logAction('Cleared all scenarios');toast('Scenarios cleared');renderView();});break;
  case 'scenario-compare':compareScenarios();break;
  case 'export-csv':exportCSV();break;
  case 'print-report':window.print();break;
  case 'snapshot-save':saveSnapshot();break;
  case 'snapshot-delete':modelData().snapshots=modelData().snapshots.filter(s=>s.id!==t.dataset.id);saveAccount();logAction('Deleted a snapshot');toast('Snapshot deleted');renderView();break;
  case 'snapshot-clear':confirmDialog('Delete all snapshots?','Clear snapshots').then(ok=>{if(!ok)return;modelData().snapshots=[];saveAccount();logAction('Cleared all snapshots');toast('Snapshots cleared');renderView();});break;
  case 'retention-guide':openRetentionGuide(t.dataset.id);break;
  case 'run-selftest':runSelftestAction();break;
  case 'backup-download':downloadBackup();break;
  case 'model-add':handleModelAdd();break;
  case 'log-clear':state.log=[];saveAccount();toast('Activity log cleared');renderView();break;
  case 'tour-next':tourStep++;renderTour();break;
  case 'tour-prev':tourStep=Math.max(0,tourStep-1);renderTour();break;
  case 'tour-done':case 'tour-skip':endTour();break;
  case 'more-menu':{const menu=$('#more-menu');if(menu){const open=menu.hidden;menu.hidden=!open;t.setAttribute('aria-expanded',String(open));}break;}
  case 'toggle-switch':{
   const sw=$('#'+t.dataset.target);
   const on=sw.getAttribute('aria-checked')!=='true';
   sw.setAttribute('aria-checked',String(on));
   if(t.dataset.target==='privacy-switch'){state.privacy=on;saveAccount();toast(on?'Privacy mode on — names are hidden everywhere.':'Privacy mode off.');renderApp();}
   break;
  }
 }
}
function hideUserMenu(){const m=$('#user-menu');if(m)m.hidden=true;const b=$('#user-btn');if(b)b.setAttribute('aria-expanded','false');}
function onDocClick(e){
 if(!e.target.closest('.user-menu'))hideUserMenu();
 if(!e.target.closest('.more-wrap')){const mm=$('#more-menu');if(mm)mm.hidden=true;}
 const t=e.target.closest('[data-action]');
 if(t)handleAction(t.dataset.action,t);
}
const debouncedEmpFilter=debounce(v=>{empView.q=v;empView.page=0;renderView();},DEBOUNCE_MS);
function onDocInput(e){
 const t=e.target;
 if(t.id==='emp-search'){debouncedEmpFilter(t.value);return;}
 if(t.id==='palette-input')return;
 if(t.classList.contains('wi-slider')){
  whatif.vals[t.dataset.k]=t.value;
  const out=$('#wi-out-'+t.dataset.k);
  if(out)out.textContent=fmtField(currentModel(),t.dataset.k,t.value);
  scheduleWhatifUpdate();return;
 }
 if(t.classList.contains('wi-select')){whatif.vals[t.dataset.k]=t.value;scheduleWhatifUpdate();return;}
 if(t.closest&&t.closest('#add-form')){
  t.classList.remove('invalid');
  const err=$('#form-error');
  if(err&&!err.hidden&&!$('#add-form').querySelector('.invalid'))err.hidden=true;
 }
}
function onDocChange(e){
 const t=e.target;
 if(t.id==='model-select'){switchModel(t.value);return;}
 if(t.id==='theme-select'){setTheme(t.value);return;}
 if(t.id==='wi-search'){
  const name=t.value.trim();
  const idx=employees().findIndex((e,i)=>displayName(e,i)===name);
  if(idx>-1){whatif.empId=employees()[idx].id;whatif.vals={};renderView();}
  else toast('No employee with that name.','alert');
  return;
 }
 if(t.id==='csv-file'){handleCsvFile(t.files[0]);return;}
 if(t.id==='backup-file'){handleBackupFile(t.files[0]);return;}
 if(t.id==='model-file'){handleModelFile(t.files[0]);return;}
 if(t.id==='emp-check-all'){
  const rows=currentPageRows();
  rows.forEach(r=>{if(t.checked)empView.selected.add(r.emp.id);else empView.selected.delete(r.emp.id);});
  syncBulkBtn();return;
 }
 if(t.matches('[data-check]')){
  const id=t.dataset.id;
  if(t.checked)empView.selected.add(id);else empView.selected.delete(id);
  syncBulkBtn();syncCheckAll();return;
 }
 if(t.matches('[data-filter]')){empView[t.dataset.filter]=t.value;empView.page=0;renderView();return;}
 if(t.closest&&t.closest('#planner-form')){recalcPlanner();return;}
 if(t.closest&&t.closest('#policy-form')){policy.group=$('#pol-group').value;policy.action=$('#pol-action').value;recalcPolicy();return;}
}
function onDocSubmit(e){
 if(e.target.id==='login-form'){e.preventDefault();handleLogin(e.target);}
 else if(e.target.id==='add-form'){e.preventDefault();handleAddForm(e.target);}
 else if(e.target.id==='whatif-save-form'){e.preventDefault();saveWhatifScenario(e.target);}
 else if(e.target.id==='policy-save-form'){e.preventDefault();savePolicyScenario(e.target);}
 else{e.preventDefault();}
}
function onDocKey(e){
 if((e.ctrlKey||e.metaKey)&&String(e.key).toLowerCase()==='k'){e.preventDefault();if(paletteOpen)closePalette();else openPalette();return;}
 if(e.key==='Escape'){
  if(paletteOpen)closePalette();
  else if($('#modal-root').children.length)resolveModal(false);
  else if($('#drawer-root').children.length)closeDrawer();
  else hideUserMenu();
  return;
 }
 if(paletteOpen&&e.target.id==='palette-input'){paletteKey(e);return;}
}

/* ===== BOOT ===== */
/* Server mode: swap the stored token for the workspace, then resume the session. */
async function restoreServerSession(){
 if(!API_MODE)return;
 const token=apiTokenGet();
 if(!token)return;
 try{
  const res=await fetch('/api/bootstrap',{headers:{'Authorization':'Bearer '+token}});
  if(!res.ok){apiTokenSet(null);return;}
  const data=await res.json();
  apiToken=token;
  Object.assign(apiCache,data.kv||{});
 }catch(e){return;}
 const user=storageGet('session',null);
 if(user&&!state.user){const rec=loadAccount(user);if(rec)signIn(user,rec);}
}
function showBanner(msg){
 let b=$('#banner');
 if(!b){document.body.insertAdjacentHTML('beforeend','<div class="banner" id="banner" role="alert"></div>');b=$('#banner');}
 b.innerHTML=icon('alert',16)+'<span>'+esc(msg)+'</span><button data-action="goto" data-to="settings">Open Settings</button>';
 b.hidden=false;
}
function boot(){
 applyTheme();
 document.addEventListener('click',onDocClick);
 document.addEventListener('change',onDocChange);
 document.addEventListener('input',onDocInput);
 document.addEventListener('submit',onDocSubmit);
 document.addEventListener('keydown',onDocKey);
 window.addEventListener('hashchange',renderApp);
 if(window.matchMedia){
  const mq=window.matchMedia('(prefers-color-scheme: dark)');
  const onChange=()=>{if(state.theme==='system')applyTheme();};
  if(mq.addEventListener)mq.addEventListener('change',onChange);
  else if(mq.addListener)mq.addListener(onChange);
 }
 const lastUser=storageGet('session',null);
 let resumed=false;
 if(lastUser){const rec=loadAccount(lastUser);if(rec){signIn(lastUser,rec);resumed=true;}}
 if(!location.hash)location.hash='#/dashboard';
 if(!resumed)renderApp();
 restoreServerSession();
 const results=runSelfTest();
 const failed=results.filter(r=>!r.pass);
 if(failed.length)showBanner(failed.length+' of '+results.length+' self-test checks failed. Open Settings → Self-test for details.');
}
boot();
