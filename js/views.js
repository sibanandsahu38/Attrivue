/* ===== SCREENS & SHELL ===== */
const SCREENS=[
 {id:'dashboard',name:'Dashboard',icon:'home'},
 {id:'employees',name:'Employees',icon:'users'},
 {id:'add',name:'Add / Import',icon:'user-plus'},
 {id:'whatif',name:'What-if',icon:'flask'},
 {id:'insights',name:'Insights',icon:'chart'},
 {id:'planner',name:'Planner',icon:'target'},
 {id:'policy',name:'Policy simulator',icon:'shield'},
 {id:'trends',name:'Trends',icon:'trend'},
 {id:'settings',name:'Settings',icon:'settings'}
];
const MOBILE_SCREENS=['dashboard','employees','add','whatif','insights'];
const VIEWS={};
function currentScreen(){
 const id=(location.hash||'').replace(/^#\/?/,'').split('?')[0];
 return SCREENS.some(s=>s.id===id)?id:'dashboard';
}
function renderView(){
 const el=$('#view');if(!el)return;
 const v=VIEWS[currentScreen()]||VIEWS.dashboard;
 el.innerHTML=v.render();
 if(v.init)v.init();
 updateNav();
}
function renderApp(){
 $('#drawer-root').innerHTML='';$('#modal-root').innerHTML='';modalResolve=null;
 if(paletteOpen)closePalette();
 if(!state.user){$('#app').innerHTML=viewLogin();return;}
 $('#app').innerHTML=shellHTML();
 renderView();
}
function updateNav(){
 const id=currentScreen();
 $$('.nav-item[data-screen]').forEach(a=>{
  const on=a.dataset.screen===id;
  a.classList.toggle('active',on);
  if(on)a.setAttribute('aria-current','page');else a.removeAttribute('aria-current');
 });
}
function moreMenuHTML(){
 const others=SCREENS.filter(s=>MOBILE_SCREENS.indexOf(s.id)===-1);
 return '<div class="more-wrap"><button class="nav-item" data-action="more-menu" aria-haspopup="true" aria-expanded="false">'+icon('dots',18)+'<span>More</span></button>'
  +'<div class="menu" id="more-menu" hidden>'+others.map(s=>'<a class="menu-item" href="#/'+s.id+'">'+icon(s.icon,15)+' '+esc(s.name)+'</a>').join('')+'</div></div>';
}
function shellHTML(){
 const m=currentModel();
 const opts=allModels().map(x=>'<option value="'+esc(x.id)+'"'+(x.id===state.modelId?' selected':'')+'>'+esc(x.name)+'</option>').join('');
 return '<div class="shell">'
  +'<aside class="sidebar"><div class="brand">'+icon('trend',22)+'<span class="brand-text"><span class="brand-name">'+esc(APP_TITLE)+'</span><span class="brand-sub">'+esc(APP_SUBTITLE)+'</span></span></div>'
  +'<nav class="nav" aria-label="Screens">'+SCREENS.map(s=>'<a href="#/'+s.id+'" class="nav-item" data-screen="'+s.id+'">'+icon(s.icon,18)+'<span>'+esc(s.name)+'</span></a>').join('')+'</nav>'
  +'<div class="sidebar-foot"><span class="muted small">Model: <b>'+esc(m.name)+'</b></span><span class="muted small">'+employees().length+' employees</span></div></aside>'
  +'<div class="main"><header class="topbar">'
  +'<label class="tb-field"><span class="muted small">Model</span><select id="model-select" class="input input-sm" aria-label="Model">'+opts+'</select></label>'
  +'<button class="tb-icon" data-action="about-model" aria-label="About this model" title="About this model">'+icon('info',16)+'</button>'
  +'<span class="tb-spacer"></span>'
  +'<button class="tb-icon" data-action="open-palette" aria-label="Search, Ctrl or Cmd K">'+icon('search',16)+'<kbd>'+(isMac?'⌘K':'Ctrl K')+'</kbd></button>'
  +'<button class="tb-icon" data-action="toggle-privacy" aria-pressed="'+state.privacy+'" title="Privacy mode">'+icon(state.privacy?'eye-off':'eye',16)+'<span class="tb-label">Privacy</span></button>'
  +'<button class="tb-icon" data-action="toggle-theme" aria-label="Toggle light and dark mode">'+icon(isDark()?'sun':'moon',16)+'</button>'
  +'<div class="user-menu"><button class="tb-icon" id="user-btn" data-action="toggle-usermenu" aria-haspopup="true" aria-expanded="false">'+icon('user',16)+'<span class="tb-label">'+esc(state.user)+'</span></button>'
  +'<div class="menu" id="user-menu" hidden><div class="menu-head">Signed in as <b>'+esc(state.user)+'</b></div>'
  +'<button class="menu-item" data-action="goto" data-to="settings">'+icon('settings',15)+' Settings</button>'
  +'<button class="menu-item" data-action="signout">'+icon('logout',15)+' Sign out</button></div></div>'
  +'</header><main id="view" class="view" tabindex="-1"></main></div></div>'
  +'<nav class="bottombar" aria-label="Screens">'+MOBILE_SCREENS.map(id=>{const s=SCREENS.find(x=>x.id===id);return '<a href="#/'+id+'" class="nav-item" data-screen="'+id+'">'+icon(s.icon,18)+'<span>'+esc(s.name)+'</span></a>';}).join('')+moreMenuHTML()+'</nav>';
}

/* ===== LOGIN / SIGN UP ===== */
let loginViewMode='signin';
function viewLogin(){
 const creating=loginViewMode==='signup';
 return '<div class="login-wrap"><section class="login-art" aria-label="Attrition Predictor overview">'
  +'<div class="login-visuals" aria-hidden="true"><div class="login-demo"><div class="login-demo-label">Average risk</div><div class="login-demo-number">18.4%</div><svg class="login-spark" viewBox="0 0 240 48" preserveAspectRatio="none"><polyline points="0,39 30,32 60,36 90,20 120,25 150,10 180,17 210,2 240,7"/></svg></div>'
  +'<div class="login-demo login-demo-attn"><div class="login-demo-label">Needs attention</div><div class="login-attn-row"><span>Avery Chen</span><span class="login-mini-risk">High 71%</span></div><div class="login-attn-row"><span>Sam Rivera</span><span class="login-mini-risk">High 58%</span></div><div class="login-attn-row"><span>Jordan Blake</span><span class="login-mini-risk low">Low 9%</span></div></div>'
  +'<div class="login-demo login-demo-reasons"><div class="login-demo-label">Top reasons</div><div class="login-reason">Regular overtime<div class="login-reason-bar"><i style="width:86%"></i></div></div><div class="login-reason">Long gap since promotion<div class="login-reason-bar"><i style="width:62%"></i></div></div><div class="login-reason">Low job satisfaction<div class="login-reason-bar"><i style="width:41%"></i></div></div></div></div>'
  +'<div class="login-copy"><div class="login-kicker">ATTRIVUE</div><h1>Understand who is at risk of leaving, and what would actually help.</h1><p>Plain-language risk explanations, what-if simulations and ranked company actions. Everything runs locally in your browser; nothing is uploaded.</p></div></section>'
  +'<section class="login-panel"><div class="login-panel-inner"><div class="login-brand"><span class="login-mark">AP</span><span><strong>'+esc(APP_TITLE)+'</strong><small>'+esc(APP_SUBTITLE)+'</small></span></div><div class="login-tabs" role="tablist"><button class="login-tab'+(!creating?' active':'')+'" type="button" role="tab" aria-selected="'+(!creating)+'" data-action="login-tab" data-mode="signin">Log in</button><button class="login-tab'+(creating?' active':'')+'" type="button" role="tab" aria-selected="'+creating+'" data-action="login-tab" data-mode="signup">Create account</button></div>'
  +'<div class="card login-card"><h1>'+(creating?'Create your account':'Welcome back')+'</h1><p class="muted">'+(creating?'Set up a private workspace in seconds.':'Log in to your private browser workspace.')+'</p>'
  +'<form id="login-form" novalidate>'
  +'<input type="hidden" name="mode" value="'+loginViewMode+'"><label>Username<input class="input" name="username" autocomplete="username" placeholder="Your username"></label>'
  +'<label>Password<span class="pw-wrap"><input class="input" name="password" type="password" autocomplete="'+(creating?'new-password':'current-password')+'" placeholder="At least 4 characters"><button type="button" class="pw-toggle" data-action="toggle-pw" aria-label="Show password">'+icon('eye',16)+'</button></span></label>'
  +'<div id="login-error" class="form-error" role="alert" hidden></div>'
  +'<button class="btn btn-primary" style="width:100%" type="submit">'+(creating?'Create account':'Log in')+'</button>'
  +'</form>'
  +'<p class="login-note">'+icon('lock',13)+' Passwords are hashed with SHA-256. Your data stays in this browser.</p></div></div></section></div>';
}
async function hashPassword(pw){
 const data=new TextEncoder().encode('attrition-predictor:'+pw);
 if(crypto.subtle&&crypto.subtle.digest){
  try{
   const buf=await crypto.subtle.digest('SHA-256',data);
   return Array.from(new Uint8Array(buf)).map(b=>b.toString(16).padStart(2,'0')).join('');
  }catch(e){/* fall through to local hash */}
 }
 let h1=0x811c9dc5,h2=0x01000193;const s='attrition-predictor:'+pw;
 for(let i=0;i<s.length;i++){h1=Math.imul(h1^s.charCodeAt(i),16777619)>>>0;h2=Math.imul(h2^s.charCodeAt(i),2166136261)>>>0;}
 return 'x'+h1.toString(16)+h2.toString(16);
}
function setLoginLoading(form,on){form.querySelectorAll('button').forEach(b=>{b.disabled=on;b.classList.toggle('loading',on);});}
async function handleLogin(form){
 const fd=new FormData(form);
 const username=(fd.get('username')||'').toString().trim();
 const password=(fd.get('password')||'').toString();
 const mode=fd.get('mode')||'signin';
 const err=$('#login-error');
 const show=m=>{err.textContent=m;err.hidden=false;};
 if(!username){show('Please enter a username.');return;}
 if(password.length<4){show('Password must be at least 4 characters.');return;}
 err.hidden=true;
 setLoginLoading(form,true);
 if(API_MODE)return apiAuth(mode,username,password,form);
 const hash=await hashPassword(password);
 const rec=loadAccount(username);
 if(mode==='signup'){
  if(rec){setLoginLoading(form,false);show('That username is already taken. Try signing in instead.');return;}
  const fresh={hash:hash,created:new Date().toISOString(),schemaVersion:SCHEMA_VERSION,theme:'system',privacy:false,tourDone:false,modelId:'ibm',customModels:[],models:{},log:[]};
  storageSet(accountKey(username),fresh);
  signIn(username,fresh);
  toast('Account created — welcome!');
 }else{
  if(!rec){setLoginLoading(form,false);show('No account found for that username. Create one first.');return;}
  if(rec.hash!==hash){setLoginLoading(form,false);show('That password is not correct.');return;}
  signIn(username,rec);
 }
}
/* Server mode: the API checks the credentials and returns the workspace. */
async function apiAuth(mode,username,password,form){
 const err=$('#login-error');
 const show=m=>{err.textContent=m;err.hidden=false;};
 try{
  const res=await fetch('/api/'+mode,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({username:username,password:password})});
  const data=await res.json().catch(()=>({}));
  if(!res.ok){setLoginLoading(form,false);show(data.error||'Something went wrong. Please try again.');return;}
  apiToken=data.token;apiTokenSet(data.token);
  storageSet('session',username);
  storageSet('account.'+username,data.account);
  setLoginLoading(form,false);
  signIn(username,data.account);
  if(mode==='signup')toast('Account created — welcome!');
 }catch(e){setLoginLoading(form,false);show('Could not reach the server. Check your connection and try again.');}
}
function signIn(username,rec){
 state.user=username;state.hash=rec.hash;state.created=rec.created;
 state.theme=rec.theme||'system';state.privacy=!!rec.privacy;state.tourDone=!!rec.tourDone;
 state.modelId=rec.modelId||'ibm';state.customModels=rec.customModels||[];state.models=rec.models||{};state.log=rec.log||[];
 registerCustomModels();
 invalidateCache();applyTheme();storageSet('session',username);renderApp();
 if(!state.tourDone)showTour();
}
function signOut(){
 storageRemove('session');
 state.user=null;state.hash=null;state.models={};state.log=[];state.customModels=[];state.scores=null;state.companyCache=null;
 renderApp();
}

/* ===== DASHBOARD ===== */
function avgRiskByGroup(){
 const m=currentModel();const sc=scoredEmployees();const by={};
 sc.forEach(x=>{(by[x.emp[m.deptKey]]=by[x.emp[m.deptKey]]||[]).push(x.p);});
 return Object.keys(by).map(k=>({label:k,value:by[k].reduce((a,b)=>a+b,0)/by[k].length,color:'var(--accent)'})).sort((a,b)=>b.value-a.value);
}
VIEWS.dashboard={
 render(){
  const cs=companyStats();
  if(!cs.count)return '<div class="page-head"><h1>Dashboard</h1></div>'+emptyHTML('No employees yet','Add employees one by one, import a CSV file, or load 25 sample employees to see risk scores, reasons and charts.',[{action:'sample',label:'Load sample data',primary:true},{action:'goto',to:'add',label:'Add / Import employees'}]);
  const m=currentModel();const sc=scoredEmployees();
  const top5=sc.slice().sort((a,b)=>b.p-a.p).slice(0,5);
  const headline=cs.high>0?'<b>'+cs.high+'</b> '+(cs.high===1?'employee needs':'employees need')+' attention':'No one is at high risk right now — keep an eye on the trends.';
  return '<div class="page-head"><h1>Dashboard</h1><div class="quick">'
   +'<button class="btn btn-primary" data-action="goto" data-to="add">'+icon('user-plus',15)+' Add employee</button>'
   +'<button class="btn" data-action="goto" data-to="add" data-tab="csv">'+icon('upload',15)+' Import CSV</button>'
   +'<button class="btn" data-action="sample">'+icon('users',15)+' Load sample data</button></div></div>'
   +'<div class="kpis">'
   +kpi('Employees',fmtInt(cs.count),'people in the current model')
   +kpi('Average risk',fmtPct(cs.avg),'across all employees')
   +kpi('High-risk people',fmtInt(cs.high),'risk of 66% or more')
   +kpi('Expected leavers',cs.expected.toFixed(1),'sum of all risk scores')
   +'</div>'
   +'<h2 class="headline">'+headline+'</h2>'
   +'<div class="grid-2"><section class="card"><h3>Needs attention</h3><ul class="attn">'
   +top5.map(x=>'<li><button data-action="emp-row" data-id="'+x.emp.id+'"><span><span class="a-name">'+esc(displayName(x.emp,x.i))+'</span><br><span class="a-role">'+esc(valueLabel(m.roleKey,x.emp[m.roleKey]))+'</span></span><span class="a-risk">'+riskBadge(x.p,m)+'</span></button></li>').join('')
   +'</ul></section>'
   +'<section class="card"><h3>Average risk by '+(m.deptKey===m.roleKey?'industry':'department')+'</h3><div id="dash-chart"></div></section></div>';
 },
 init(){drawBarChart('#dash-chart',avgRiskByGroup(),{fmt:v=>fmtPct(v),alt:'Average risk by '+(currentModel().deptKey===currentModel().roleKey?'industry':'department')});}
};

/* ===== EMPLOYEES ===== */
const empView={q:'',risk:'',group:'',sortKey:'p',sortDir:-1,page:0,selected:new Set()};
function empRows(){
 const m=currentModel();
 let rows=scoredEmployees();
 if(empView.q){const q=empView.q.toLowerCase();rows=rows.filter(x=>(displayName(x.emp,x.i)+' '+x.emp[m.roleKey]+' '+x.emp[m.deptKey]).toLowerCase().indexOf(q)>-1);}
 if(empView.risk)rows=rows.filter(x=>x.lvl===empView.risk);
 if(empView.group)rows=rows.filter(x=>x.emp[m.deptKey]===empView.group);
 rows.sort((a,b)=>{
  const k=empView.sortKey;let va,vb;
  if(k==='name'){va=a.emp.name.toLowerCase();vb=b.emp.name.toLowerCase();}
  else if(k==='role'){va=String(a.emp[m.roleKey]);vb=String(b.emp[m.roleKey]);}
  else{va=a.p;vb=b.p;}
  return (va<vb?-1:va>vb?1:0)*empView.sortDir;
 });
 return rows;
}
function currentPageRows(){
 const all=empRows();const pages=Math.max(1,Math.ceil(all.length/PAGE_SIZE));
 const page=Math.min(empView.page,pages-1);
 return all.slice(page*PAGE_SIZE,(page+1)*PAGE_SIZE);
}
function thBtn(key,label){
 const arrow=empView.sortKey===key?(empView.sortDir===1?'▲':'▼'):'';
 return '<button class="th-btn" data-action="sort" data-key="'+key+'">'+esc(label)+' <span class="mono">'+arrow+'</span></button>';
}
function syncBulkBtn(){
 const b=$('[data-action="emp-bulk"]');
 if(b){b.disabled=!empView.selected.size;b.innerHTML='Delete selected ('+empView.selected.size+')';}
}
function syncCheckAll(){
 const box=$('#emp-check-all');if(!box)return;
 const rows=currentPageRows();
 box.checked=rows.length>0&&rows.every(r=>empView.selected.has(r.emp.id));
}
VIEWS.employees={
 render(){
  const m=currentModel();
  const groups=Array.from(new Set(employees().map(e=>e[m.deptKey]))).sort();
  const all=empRows();
  const pages=Math.max(1,Math.ceil(all.length/PAGE_SIZE));
  if(empView.page>=pages)empView.page=pages-1;
  const pageRows=currentPageRows();
  const start=all.length?empView.page*PAGE_SIZE+1:0;
  const end=Math.min(all.length,(empView.page+1)*PAGE_SIZE);
  const groupLabel=m.deptKey===m.roleKey?'industries':'departments';
  return '<div class="page-head"><h1>Employees</h1><div class="quick">'
   +'<button class="btn" data-action="emp-bulk"'+(empView.selected.size?'':' disabled')+'>Delete selected ('+empView.selected.size+')</button>'
   +'<button class="btn btn-danger" data-action="emp-clear"'+(employees().length?'':' disabled')+'>Clear all</button>'
   +'<button class="btn btn-primary" data-action="goto" data-to="add">Add employee</button></div></div>'
   +'<div class="toolbar">'
   +'<input id="emp-search" class="input" type="search" placeholder="Search name or role…" value="'+esc(empView.q)+'" aria-label="Search employees">'
   +'<select class="input input-sm" data-filter="risk" aria-label="Filter by risk level"><option value="">All risk levels</option><option'+(empView.risk==='High'?' selected':'')+'>High</option><option'+(empView.risk==='Medium'?' selected':'')+'>Medium</option><option'+(empView.risk==='Low'?' selected':'')+'>Low</option></select>'
   +'<select class="input input-sm" data-filter="group" aria-label="Filter by '+groupLabel+'"><option value="">All '+groupLabel+'</option>'+groups.map(g=>'<option'+(empView.group===g?' selected':'')+'>'+esc(g)+'</option>').join('')+'</select>'
   +'<span class="muted small">Risk level '+infoTip(RISK_BANDS_TEXT)+' · '+all.length+' of '+employees().length+' employees</span>'
   +'</div>'
   +(employees().length===0
    ?emptyHTML('No employees yet','Add employees manually, import a CSV, or load sample data. Then they show up here with their risk and top reasons.',[{action:'goto',to:'add',label:'Add / Import employees',primary:true},{action:'sample',label:'Load sample data'}])
    :all.length===0
    ?'<div class="card empty"><p>No employees match your filters.</p><button class="btn" data-action="emp-reset-filters">Clear filters</button></div>'
    :'<div class="table-wrap"><table class="table"><thead><tr>'
    +'<th scope="col"><input type="checkbox" id="emp-check-all" aria-label="Select all on this page"'+(pageRows.length&&pageRows.every(r=>empView.selected.has(r.emp.id))?' checked':'')+'></th>'
    +'<th scope="col">'+thBtn('name','Name')+'</th>'
    +'<th scope="col">'+thBtn('role',m.roleKey===m.deptKey?'Industry':'Role')+'</th>'
    +'<th scope="col">'+thBtn('p','Risk')+'</th>'
    +'<th scope="col">Top reasons</th><th scope="col">Actions</th></tr></thead><tbody>'
    +pageRows.map(x=>'<tr>'
     +'<td><input type="checkbox" data-check data-id="'+x.emp.id+'"'+(empView.selected.has(x.emp.id)?' checked':'')+' aria-label="Select '+esc(displayName(x.emp,x.i))+'"></td>'
     +'<td><button class="row-link" data-action="emp-row" data-id="'+x.emp.id+'">'+esc(displayName(x.emp,x.i))+'</button></td>'
     +'<td>'+esc(valueLabel(m.roleKey,x.emp[m.roleKey]))+'</td>'
     +'<td>'+riskBadge(x.p,m)+'</td>'
     +'<td><div class="reasons-mini">'+(reasonsFor(m,x.emp,TOP_LIST).map(r=>'<span>'+esc(r.label)+'</span>').join('')||'<span class="muted">none</span>')+'</div></td>'
     +'<td><div class="quick"><button class="tb-icon" data-action="whatif-open" data-id="'+x.emp.id+'" aria-label="What-if for '+esc(displayName(x.emp,x.i))+'" title="What-if">'+icon('flask',15)+'</button>'
     +'<button class="tb-icon" data-action="emp-delete" data-id="'+x.emp.id+'" aria-label="Delete '+esc(displayName(x.emp,x.i))+'" title="Delete">'+icon('trash',15)+'</button></div></td>'
     +'</tr>').join('')
    +'</tbody></table></div>'
    +'<div class="pager"><span class="muted small">Showing '+start+'–'+end+' of '+all.length+'</span>'
    +'<button class="btn" data-action="page-prev"'+(empView.page===0?' disabled':'')+'>'+icon('chev-l',15)+' Prev</button>'
    +'<span class="mono small">Page '+(empView.page+1)+' / '+pages+'</span>'
    +'<button class="btn" data-action="page-next"'+(empView.page>=pages-1?' disabled':'')+'>Next '+icon('chev-r',15)+'</button></div>');
 }
};
function openEmployeeDrawer(id){
 const m=currentModel();const idx=employees().findIndex(e=>e.id===id);
 if(idx<0)return;
 const emp=employees()[idx];
 const p=scoreEmployee(m,emp);
 const reasons=reasonsFor(m,emp,TOP_DETAIL);
 const maxC=Math.max.apply(null,reasons.map(r=>r.c).concat([0.0001]));
 const suggestions=m.fix.map(a=>({a,advice:actionAdvice(a),np:scoreEmployee(m,applyAction(m,emp,a))}))
  .map(s=>({advice:s.advice,np:s.np,drop:p-s.np})).filter(s=>s.drop>0.0005).sort((a,b)=>b.drop-a.drop);
 const numKeys=Object.keys(m.num),catKeys=Object.keys(m.cat);
 openDrawer(
  '<div class="drawer-head"><div><h2>'+esc(displayName(emp,idx))+'</h2><p class="muted">'+esc(valueLabel(m.roleKey,emp[m.roleKey]))+' · '+esc(valueLabel(m.deptKey,emp[m.deptKey]))+'</p></div>'+riskBadge(p,m)+'</div>'
  +'<div class="quick"><button class="btn btn-primary" data-action="retention-guide" data-id="'+id+'">'+icon('users',15)+' Prepare a retention conversation</button>'
  +'<button class="btn" data-action="whatif-open" data-id="'+id+'">'+icon('flask',15)+' What-if</button></div>'
  +'<h3>Why this employee may leave, and how to help</h3>'
  +(reasons.length?reasons.map((r,ri)=>{
    const ex=explainReason(m,emp,r,p);
    return '<article class="explain">'
     +'<div class="reason-top"><b>'+(ri+1)+'. '+esc(r.label)+'</b><span class="mono small">impact +'+r.c.toFixed(2)+'</span></div>'
     +'<div class="bar"><i style="width:'+Math.min(100,r.c/maxC*100).toFixed(0)+'%"></i></div>'
     +'<div class="explain-why"><span class="explain-tag">'+icon('info',13)+' Why</span><p>'+esc(ex.why)+'</p></div>'
     +'<div class="explain-help"><span class="explain-tag">'+icon('check',13)+' How to help</span><p>'+esc(ex.help)+'</p>'
     +(ex.changeable&&ex.drop>0.0005?'<p class="explain-effect">Estimated effect: risk '+fmtPct(p)+' → '+fmtPct(ex.np)+' ('+'−'+(ex.drop*100).toFixed(1)+' pp)</p>':'')
     +(!ex.changeable?'<p class="explain-effect muted">This is not something to change directly. Support the person instead.</p>':'')
     +'</div></article>';
   }).join('')+'<p class="muted small">'+CAUSE_TEXT+'</p>'
   :'<p class="muted">No strong risk factors. Risk is close to the company average.</p>')
  +'<h3>All suggested actions</h3>'
  +(suggestions.length?suggestions.map(s=>'<div class="sugg"><b>'+esc(s.advice)+'</b><span class="muted">Risk would fall from '+fmtPct(p)+' to '+fmtPct(s.np)+'</span></div>').join(''):'<p class="muted">No company action would lower this employee\'s risk much.</p>')
  +'<h3>All fields</h3><dl class="fields">'
  +numKeys.concat(catKeys).map(k=>'<dt>'+esc(FIELD_LABELS[k]||k)+'</dt><dd>'+esc(fmtField(m,k,emp[k]))+'</dd>').join('')
  +'</dl>',
  'Employee details');
}
function openRetentionGuide(id){
 const m=currentModel();const idx=employees().findIndex(e=>e.id===id);
 if(idx<0)return;
 const emp=employees()[idx];
 const reasons=reasonsFor(m,emp,TOP_DETAIL);
 const points=buildTalkGuide(reasons.map(r=>r.field));
 openModal('<h3>Retention conversation guide</h3>'
  +'<p class="muted">For '+esc(displayName(emp,idx))+' · '+esc(valueLabel(m.roleKey,emp[m.roleKey]))+'</p>'
  +'<div class="callout">This is a supportive conversation, not a warning.</div>'
  +'<ol class="guide">'+points.map(p=>'<li>'+esc(p)+'</li>').join('')+'</ol>'
  +'<p class="muted small">Talk about support and working conditions. Never use the risk score to pressure, punish or dismiss anyone.</p>'
  +'<div class="quick" style="margin-top:14px"><button class="btn btn-primary" data-action="modal-resolve" data-v="1">Done</button></div>');
}
function deleteOneEmployee(id){
 const emp=findEmp(id);
 const name=emp?displayName(emp,employees().indexOf(emp)):'employee';
 confirmDialog('Delete '+name+'?','Delete employee').then(ok=>{
  if(!ok)return;
  const removed=deleteEmployeesById([id]);
  empView.selected.delete(id);
  renderView();
  toast('Deleted '+name,'undo',UNDO_MS,{label:'Undo',fn:()=>{restoreEmployees(removed);toast('Employee restored');renderView();}});
 });
}
function deleteSelectedEmployees(){
 const ids=Array.from(empView.selected);
 if(!ids.length)return;
 confirmDialog('Delete '+ids.length+' selected employee'+(ids.length===1?'':'s')+'?','Delete employees').then(ok=>{
  if(!ok)return;
  const removed=deleteEmployeesById(ids);
  empView.selected.clear();
  renderView();
  toast('Deleted '+removed.length+' employee'+(removed.length===1?'':'s'),'undo',UNDO_MS,{label:'Undo',fn:()=>{restoreEmployees(removed);toast('Employees restored');renderView();}});
 });
}
function clearAllEmployees(){
 confirmDialog('Delete ALL employees in this model?','Clear all employees').then(ok=>{
  if(!ok)return;
  const removed=employees().map((emp,idx)=>({idx,emp}));
  modelData().employees=[];
  invalidateCache();saveAccount();logAction('Cleared all employees ('+removed.length+')');
  empView.selected.clear();
  renderView();
  toast('Deleted all employees','undo',UNDO_MS,{label:'Undo',fn:()=>{restoreEmployees(removed);toast('Employees restored');renderView();}});
 });
}

/* ===== ADD / IMPORT ===== */
const addView={tab:'form'};
let csvResult=null,csvPendingText='',csvPendingName='';
VIEWS.add={
 render(){
  const m=location.hash.match(/tab=(\w+)/);
  addView.tab=m?m[1]:'form';
  const tabs=[['form','Manual form'],['csv','Import CSV'],['sample','Sample data']];
  let body='';
  if(addView.tab==='csv')body=csvHTML();
  else if(addView.tab==='sample')body=sampleHTML();
  else body=formHTML(currentModel());
  return '<div class="page-head"><h1>Add / Import</h1></div><div class="tabs" role="tablist">'
   +tabs.map(t=>'<button class="tab'+(addView.tab===t[0]?' active':'')+'" role="tab" aria-selected="'+(addView.tab===t[0])+'" data-action="add-tab" data-tab="'+t[0]+'">'+esc(t[1])+'</button>').join('')
   +'</div>'+body;
 },
 init(){if(addView.tab==='csv')wireDropzone();}
};
function formHTML(m){
 const t=typicalEmployee(m);
 const groups=FORM_GROUPS.map(g=>({title:g[0],keys:g[1].filter(k=>(m.num[k]||m.cat[k]))})).filter(g=>g.keys.length);
 return '<form id="add-form" class="card" novalidate><h3>New employee</h3>'
  +'<label>Name<input class="input" name="name" placeholder="e.g. Alex Morgan"></label>'
  +'<div class="form-grid">'
  +groups.map(g=>'<div class="form-section">'+esc(g.title)+'</div>'+g.keys.map(k=>{
   if(m.num[k]){
    const f=m.num[k];const isMoney=(k==='MonthlyIncome'||k==='Salary');const unit=FIELD_UNITS[k]||'';
    return '<label>'+esc(FIELD_LABELS[k]||k)+'<div class="num-wrap">'+(isMoney?'<span class="unit pre">$</span>':'')+'<input class="input" type="number" name="'+esc(k)+'" min="'+f.min+'" max="'+f.max+'" step="1" value="'+t[k]+'">'+(isMoney?'':'<span class="unit">'+esc(unit)+'</span>')+'</div></label>';
   }
   return '<label>'+esc(FIELD_LABELS[k]||k)+'<select class="input" name="'+esc(k)+'">'+Object.keys(m.cat[k]).map(v=>'<option value="'+esc(v)+'"'+(t[k]===v?' selected':'')+'>'+esc(valueLabel(k,v))+'</option>').join('')+'</select></label>';
  }).join('')).join('')
  +'</div><div id="form-error" class="form-error" role="alert" hidden></div>'
  +'<button class="btn btn-primary" type="submit">'+icon('plus',15)+' Add employee</button></form>';
}
function handleAddForm(form){
 const m=currentModel();const fd=new FormData(form);
 const name=(fd.get('name')||'').toString().trim();
 const errs=[];
 form.querySelectorAll('.invalid').forEach(el=>el.classList.remove('invalid'));
 if(!name)errs.push('Please enter a name.');
 const emp={id:uid(),name:name};
 for(const k in m.num){
  const f=m.num[k];const raw=(fd.get(k)||'').toString().trim();
  if(raw===''){emp[k]=Math.round(m.medians[k]);continue;}
  const v=Number(raw);
  if(!Number.isFinite(v)){errs.push((FIELD_LABELS[k]||k)+' must be a number.');form.querySelector('[name="'+k+'"]').classList.add('invalid');continue;}
  if(v<f.min||v>f.max){errs.push((FIELD_LABELS[k]||k)+' must be between '+f.min+' and '+f.max+'.');form.querySelector('[name="'+k+'"]').classList.add('invalid');continue;}
  emp[k]=Math.round(v);
 }
 for(const k in m.cat){emp[k]=String(fd.get(k)||m.catdef[k]);}
 const errBox=form.querySelector('#form-error');
 if(errs.length){
  errBox.innerHTML=errs.map(e=>'<div>'+icon('alert',13)+' '+esc(e)+'</div>').join('');
  errBox.hidden=false;return;
 }
 errBox.hidden=true;
 addEmployees([emp]);
 toast('Added '+displayName(emp,employees().length-1));
 location.hash='#/employees';
}
function csvHTML(){
 return '<div class="card"><h3>Import CSV</h3>'
  +'<p class="muted small">The first row must be a header. Column names are matched ignoring case, spaces and symbols (e.g. "Monthly Income" matches MonthlyIncome). Missing columns get typical values; unknown columns are ignored; values outside the allowed range are clipped and counted. Maximum '+MAX_CSV_ROWS.toLocaleString('en-US')+' rows.</p>'
  +'<div class="dropzone" id="dropzone" tabindex="0" role="button" data-action="csv-browse" aria-label="Drop a CSV file here or click to browse">'+icon('upload',22)+'<br>Drag &amp; drop a CSV file here, or click to browse</div>'
  +'<input type="file" id="csv-file" accept=".csv,text/csv" hidden>'
  +'<label>Paste CSV instead<textarea id="csv-paste" class="input mono" rows="4" placeholder="name,MonthlyIncome,OverTime…"></textarea></label>'
  +'<button class="btn btn-primary" data-action="csv-parse">'+icon('search',15)+' Preview import</button>'
  +'<div id="csv-report" style="margin-top:16px"></div></div>';
}
function sampleHTML(){
 return '<div class="card empty"><h2>Load sample data</h2><p class="muted" style="max-width:52ch">Creates '+SAMPLE_SIZE+' realistic employees with a mix of low, medium and high risk, using the current model\'s fields. Sample employees are added to your list — delete them any time.</p><button class="btn btn-primary" data-action="sample">'+icon('users',15)+' Load sample data</button></div>';
}
function wireDropzone(){
 const dz=$('#dropzone');if(!dz)return;
 dz.addEventListener('dragover',e=>{e.preventDefault();dz.classList.add('drag');});
 dz.addEventListener('dragleave',()=>dz.classList.remove('drag'));
 dz.addEventListener('drop',e=>{e.preventDefault();dz.classList.remove('drag');const f=e.dataTransfer.files&&e.dataTransfer.files[0];if(f)handleCsvFile(f);});
 dz.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();$('#csv-file').click();}});
}
function parseCSVText(text){
 text=String(text).replace(/^﻿/,'');
 const rows=[];let row=[],field='',q=false;
 for(let i=0;i<text.length;i++){
  const c=text[i];
  if(q){if(c==='"'){if(text[i+1]==='"'){field+='"';i++;}else q=false;}else field+=c;}
  else if(c==='"')q=true;
  else if(c===','){row.push(field);field='';}
  else if(c==='\n'){row.push(field);rows.push(row);row=[];field='';}
  else if(c!=='\r')field+=c;
 }
 if(field!==''||row.length){row.push(field);rows.push(row);}
 return rows.filter(r=>r.some(c=>c.trim()!==''));
}
function normKey(s){return String(s).toLowerCase().replace(/[^a-z0-9]/g,'');}
function importCSV(text){
 const m=currentModel();
 const rows=parseCSVText(text);
 if(!rows.length)return {valid:[],rejected:[{row:1,reason:'The file is empty.'}],clipped:0,missing:Object.keys(m.num).concat(Object.keys(m.cat)),preview:[],total:0,truncated:false};
 const header=rows[0].map(normKey);
 const fieldFor={};
 Object.keys(m.num).concat(Object.keys(m.cat)).forEach(f=>{fieldFor[normKey(f)]=f;});
 const colField=header.map(h=>fieldFor[h]||null);
 const nameCols=new Set(['name','employeename','employee','fullname','worker']);
 const nameIdx=header.findIndex(h=>nameCols.has(h));
 const typical=typicalEmployee(m);
 const fields=Object.keys(m.num).concat(Object.keys(m.cat));
 const missing=fields.filter(f=>header.indexOf(normKey(f))===-1);
 let clipped=0;const valid=[],rejected=[];
 const seen=new Set(employees().map(e=>e.name.toLowerCase()));
 const body=rows.slice(1);
 let truncated=false;
 for(let ri=0;ri<body.length;ri++){
  if(valid.length+rejected.length>=MAX_CSV_ROWS){truncated=true;break;}
  const r=body[ri];const rowNum=ri+2;
  const name=nameIdx>-1?String(r[nameIdx]||'').trim():'';
  if(!name){rejected.push({row:rowNum,reason:'Missing name'});continue;}
  if(seen.has(name.toLowerCase())){rejected.push({row:rowNum,reason:'Duplicate name'});continue;}
  const emp={id:uid(),name:name};
  let bad=null;
  colField.forEach((f,ci)=>{
   if(!f)return;
   const raw=String(r[ci]||'').trim();
   if(m.num[f]){
    let v=raw===''?null:Number(raw);
    if(raw!==''&&!Number.isFinite(v)){bad='Column "'+header[ci]+'" is not a number';return;}
    if(v===null)v=typical[f];
    const spec=m.num[f];
    if(v<spec.min||v>spec.max){clipped++;v=Math.min(spec.max,Math.max(spec.min,v));}
    emp[f]=Math.round(v);
   }else{
    const v=raw===''?typical[f]:raw;
    if(!Object.prototype.hasOwnProperty.call(m.cat[f],v)){bad='Unknown value "'+raw+'" for '+(FIELD_LABELS[f]||f);return;}
    emp[f]=v;
   }
  });
  if(bad){rejected.push({row:rowNum,reason:bad});continue;}
  seen.add(name.toLowerCase());
  valid.push(emp);
 }
 if(truncated)rejected.push({row:MAX_CSV_ROWS+2,reason:'Row limit of '+MAX_CSV_ROWS.toLocaleString('en-US')+' reached — extra rows ignored'});
 const preview=valid.slice(0,5).map((e,i)=>({name:state.privacy?('Employee '+String(i+1).padStart(3,'0')):e.name,role:valueLabel(m.roleKey,e[m.roleKey]),risk:fmtPct(scoreEmployee(m,e))}));
 return {valid,rejected,clipped,missing,preview,total:Math.min(body.length,MAX_CSV_ROWS),truncated};
}
function renderCsvReport(res){
 const el=$('#csv-report');if(!el)return;
 const m=currentModel();
 const dupCount=res.rejected.filter(r=>r.reason==='Duplicate name').length;
 el.innerHTML='<div class="card"><h3>Data quality report</h3><div class="chips">'
  +'<span class="chip chip-good">'+icon('check',12)+' '+res.valid.length+' valid rows</span>'
  +'<span class="chip chip-bad">'+icon('alert',12)+' '+res.rejected.length+' rejected rows</span>'
  +'<span class="chip">'+icon('info',12)+' '+res.clipped+' values clipped to the allowed range</span>'
  +'<span class="chip">'+icon('info',12)+' '+dupCount+' duplicate names</span>'
  +'<span class="chip">'+icon('info',12)+' '+res.total.toLocaleString('en-US')+' rows read (max '+MAX_CSV_ROWS.toLocaleString('en-US')+')</span></div>'
  +'<p><b>Missing columns</b> (filled with typical values): '+(res.missing.length?esc(res.missing.map(k=>FIELD_LABELS[k]||k).join(', ')):'none')+'</p>'
  +(res.preview.length?'<h4>Preview — first '+res.preview.length+' valid rows</h4><div class="table-wrap"><table class="table"><thead><tr><th scope="col">Name</th><th scope="col">'+esc(m.roleKey===m.deptKey?'Industry':'Role')+'</th><th scope="col">Risk</th></tr></thead><tbody>'+res.preview.map(r=>'<tr><td>'+esc(r.name)+'</td><td>'+esc(r.role)+'</td><td class="mono">'+r.risk+'</td></tr>').join('')+'</tbody></table></div>':'')
  +(res.rejected.length?'<h4>Rejected rows</h4><ul class="rej">'+res.rejected.slice(0,50).map(r=>'<li>Row '+r.row+': '+esc(r.reason)+'</li>').join('')+(res.rejected.length>50?'<li>…and '+(res.rejected.length-50)+' more</li>':'')+'</ul>':'')
  +'<div class="quick" style="margin-top:12px"><button class="btn btn-primary" data-action="csv-confirm"'+(res.valid.length?'':' disabled')+'>Import '+res.valid.length+' valid rows</button><button class="btn" data-action="csv-cancel">Start over</button></div></div>';
}
function handleCsvFile(file){
 if(!file)return;
 const btn=$('[data-action="csv-parse"]');
 if(btn){btn.disabled=true;btn.classList.add('loading');}
 const reader=new FileReader();
 reader.onload=()=>{
  csvPendingText=String(reader.result||'');csvPendingName=file.name;
  if(btn){btn.disabled=false;btn.classList.remove('loading');}
  runCsvImport(csvPendingText,file.name);
 };
 reader.onerror=()=>{if(btn){btn.disabled=false;btn.classList.remove('loading');}toast('Could not read that file.','alert');};
 reader.readAsText(file);
}
function runCsvImport(text,name){
 const rep=$('#csv-report');
 if(rep)rep.innerHTML='<div class="skel-wrap">'+skel()+'</div>';
 setTimeout(()=>{
  csvResult=importCSV(text);
  csvResult.name=name||'pasted text';
  renderCsvReport(csvResult);
 },30);
}
function csvParseAction(){
 const paste=(($('#csv-paste')||{}).value||'').trim();
 const text=paste||csvPendingText;
 if(!text){toast('Upload a CSV file or paste CSV text first.','alert');return;}
 runCsvImport(text,csvPendingName||'pasted text');
}
function csvConfirmAction(){
 if(!csvResult){toast('Preview an import first.','alert');return;}
 if(!csvResult.valid.length){toast('No valid rows to import.','alert');return;}
 const n=csvResult.valid.length;
 addEmployees(csvResult.valid,'Imported');
 toast('Imported '+n+' employee'+(n===1?'':'s')+' from CSV');
 csvResult=null;csvPendingText='';csvPendingName='';
 location.hash='#/employees';
}
function mulberry32(a){return function(){a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296;};}
const SAMPLE_FIRST=['Ava','Liam','Noah','Emma','Olivia','Sophia','Mia','Lucas','Ethan','Isabella','Amelia','Jack','Chloe','Daniel','Layla','Mateo','Nora','Leo','Zoe','Owen','Ruby','Felix','Ivy','Hugo'];
const SAMPLE_LAST=['Carter','Nguyen','Müller','Rossi','Kowalski','Silva','Novak','Tanaka','Haddad','Petrov','Lindqvist','Okafor','Brown','Kim','Fischer','Reyes','Andersson','Costa','Weber','Hassan'];
const SAMPLE_SEED=20240607;
const SAMPLE_MIN_RISK=0.02;
const SAMPLE_MAX_RISK=0.97;
const SAMPLE_JITTER=0.012;
const SAMPLE_FIELD_NOISE=0.35;
const SAMPLE_SEARCH_STEPS=40;
const SAMPLE_RETRY_STEP=0.007;
const SAMPLE_MAX_RETRIES=12;
/* Each field gets a low-risk end and a high-risk end. A single "blend" value (plus per-field noise)
   moves every field between those ends, so risk rises steadily with the blend and can be bisected. */
function sampleRanges(m){
 const num={},cat={};
 for(const k in m.num){const f=m.num[k];num[k]=f.coef<0?{lo:f.max,hi:f.min}:{lo:f.min,hi:f.max};}
 for(const k in m.cat){if(k===m.roleKey||k===m.deptKey)continue;const c=m.cat[k];cat[k]=Object.keys(c).sort((a,b)=>c[a]-c[b]);}
 return {num,cat};
}
function blendEmployee(base,ranges,noise,T){
 const e=Object.assign({},base);
 for(const k in ranges.num){const r=ranges.num[k];const t=Math.min(1,Math.max(0,T+noise[k]));e[k]=Math.round(r.lo+(r.hi-r.lo)*t);}
 for(const k in ranges.cat){const opts=ranges.cat[k];const t=Math.min(1,Math.max(0,T+noise[k]));e[k]=opts[Math.round(t*(opts.length-1))];}
 return e;
}
function employeeForRisk(m,base,ranges,noise,target){
 let lo=-1,hi=2;
 for(let s=0;s<SAMPLE_SEARCH_STEPS;s++){const mid=(lo+hi)/2;if(scoreEmployee(m,blendEmployee(base,ranges,noise,mid))<target)lo=mid;else hi=mid;}
 return blendEmployee(base,ranges,noise,hi);
}
function generateSample(){
 const m=currentModel();const rng=mulberry32(SAMPLE_SEED);const ranges=sampleRanges(m);
 const roles=Object.keys(m.cat[m.roleKey]);const depts=Object.keys(m.cat[m.deptKey]);
 const targets=[];
 for(let i=0;i<SAMPLE_SIZE;i++)targets.push(SAMPLE_MIN_RISK+(SAMPLE_MAX_RISK-SAMPLE_MIN_RISK)*i/(SAMPLE_SIZE-1)+(rng()-0.5)*2*SAMPLE_JITTER);
 for(let i=targets.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));const tmp=targets[i];targets[i]=targets[j];targets[j]=tmp;}
 const used=new Set();const emps=[];
 for(let i=0;i<SAMPLE_SIZE;i++){
  const base=Object.assign(typicalEmployee(m),{id:uid(),name:SAMPLE_FIRST[i%SAMPLE_FIRST.length]+' '+SAMPLE_LAST[(i*7)%SAMPLE_LAST.length]});
  base[m.roleKey]=roles[i%roles.length];
  if(m.deptKey!==m.roleKey)base[m.deptKey]=depts[i%depts.length];
  const noise={};
  Object.keys(ranges.num).concat(Object.keys(ranges.cat)).forEach(k=>{noise[k]=(rng()-0.5)*2*SAMPLE_FIELD_NOISE;});
  const pMin=scoreEmployee(m,blendEmployee(base,ranges,noise,-1));
  const pMax=scoreEmployee(m,blendEmployee(base,ranges,noise,2));
  let target=Math.min(pMax,Math.max(pMin,targets[i]));
  let e=employeeForRisk(m,base,ranges,noise,target);
  /* keep every shown percentage unique */
  for(let r=0;r<SAMPLE_MAX_RETRIES&&used.has(fmtPct(scoreEmployee(m,e)));r++){
   target=Math.min(pMax,Math.max(pMin,target+(r%2?-1:1)*SAMPLE_RETRY_STEP*(r+1)));
   e=employeeForRisk(m,base,ranges,noise,target);
  }
  used.add(fmtPct(scoreEmployee(m,e)));
  emps.push(e);
 }
 return emps;
}

/* ===== WHAT-IF ===== */
const whatif={empId:null,vals:{}};
function whatifFields(m){
 const ks=[];
 m.fix.forEach(a=>{if(ks.indexOf(a.k)===-1)ks.push(a.k);});
 return ks;
}
function whatifModified(){
 const m=currentModel();const emp=findEmp(whatif.empId);if(!emp)return null;
 const mod=Object.assign({},emp);
 whatifFields(m).forEach(k=>{if(k in whatif.vals)mod[k]=m.num[k]?Number(whatif.vals[k]):whatif.vals[k];});
 return {emp,mod};
}
let wiRaf=null;
function scheduleWhatifUpdate(){
 if(wiRaf)cancelAnimationFrame(wiRaf);
 wiRaf=requestAnimationFrame(updateWhatifNumbers);
}
function updateWhatifNumbers(){
 const got=whatifModified();if(!got)return;
 const m=currentModel();
 const base=scoreEmployee(m,got.emp),np=scoreEmployee(m,got.mod);
 const gb=$('#wi-gauge-base'),gn=$('#wi-gauge-new'),ch=$('#wi-chip'),rs=$('#wi-reasons');
 if(gb)gb.innerHTML=gaugeSVG(base,m);
 if(gn)gn.innerHTML=gaugeSVG(np,m);
 if(ch)ch.innerHTML=changeChip(base,np);
 if(rs)rs.innerHTML=reasonsDiff(m,got.emp,got.mod);
}
function collectChanges(m,emp,mod){
 const ch={};
 whatifFields(m).forEach(k=>{if(emp[k]!==mod[k])ch[k]=mod[k];});
 return ch;
}
VIEWS.whatif={
 render(){
  const m=currentModel();
  if(!employees().length)return '<div class="page-head"><h1>What-if</h1></div>'+emptyHTML('No employees yet','What-if works on employee records. Add employees first.',[{action:'goto',to:'add',label:'Add / Import employees',primary:true}]);
  const opts=employees().map((e,i)=>'<option value="'+esc(displayName(e,i))+'"></option>').join('');
  let body='';
  const emp=findEmp(whatif.empId);
  if(!emp){
   body='<div class="card"><label>Choose an employee<input class="input" id="wi-search" list="wi-list" placeholder="Type a name…" aria-label="Choose an employee for what-if"><datalist id="wi-list">'+opts+'</datalist></label><p class="muted small">Pick someone to see how changes would affect their risk. The real record is never changed.</p></div>';
  }else{
   const idx=employees().indexOf(emp);
   const fields=whatifFields(m);
   fields.forEach(k=>{if(!(k in whatif.vals))whatif.vals[k]=emp[k];});
   const got=whatifModified();
   const base=scoreEmployee(m,emp),np=scoreEmployee(m,got.mod);
   const editors=fields.map(k=>{
    if(m.num[k]){
     const f=m.num[k];
     return '<div class="wi-field"><div class="wi-top"><label for="wi-'+esc(k)+'">'+esc(FIELD_LABELS[k]||k)+'</label><output class="mono" id="wi-out-'+esc(k)+'">'+esc(fmtField(m,k,whatif.vals[k]))+'</output></div>'
      +'<input type="range" class="wi-slider" id="wi-'+esc(k)+'" data-k="'+esc(k)+'" min="'+f.min+'" max="'+f.max+'" step="1" value="'+Number(whatif.vals[k])+'"></div>';
    }
    return '<div class="wi-field"><label for="wi-'+esc(k)+'">'+esc(FIELD_LABELS[k]||k)+'</label><select class="input wi-select" id="wi-'+esc(k)+'" data-k="'+esc(k)+'">'
     +Object.keys(m.cat[k]).map(v=>'<option value="'+esc(v)+'"'+(whatif.vals[k]===v?' selected':'')+'>'+esc(valueLabel(k,v))+'</option>').join('')+'</select></div>';
   }).join('');
   body='<div class="callout warn small">'+WARNING_TEXT+'</div>'
    +'<div class="card"><label>Employee<input class="input" id="wi-search" list="wi-list" value="'+esc(displayName(emp,idx))+'" aria-label="Choose an employee for what-if"><datalist id="wi-list">'+opts+'</datalist></label></div>'
    +'<div class="grid-2"><section class="card"><h3>Changeable fields</h3><p class="muted small">Only things a company can change appear here — never tenure, role, age or education.</p>'+editors+'</section>'
    +'<section class="card"><h3>Actual vs what-if</h3><div class="wi-gauges">'
    +'<div><h4>Actual</h4><div id="wi-gauge-base">'+gaugeSVG(base,m)+'</div></div>'
    +'<div><h4>What-if</h4><div id="wi-gauge-new">'+gaugeSVG(np,m)+'</div></div></div>'
    +'<p style="text-align:center" id="wi-chip">'+changeChip(base,np)+'</p>'
    +'<div id="wi-reasons">'+reasonsDiff(m,emp,got.mod)+'</div>'
    +'<div class="quick" style="margin-top:12px"><button class="btn" data-action="whatif-reset">'+icon('undo',15)+' Reset</button>'
    +'<button class="btn" data-action="whatif-apply">'+icon('check',15)+' Apply all company actions</button></div></section></div>'
    +'<section class="card"><h3>Save this scenario</h3><form id="whatif-save-form" class="quick"><input class="input" name="note" placeholder="Note (e.g. \'If we cap overtime\')" aria-label="Scenario note"><button class="btn btn-primary" type="submit">Save scenario</button></form>'
    +'<p class="muted small">Saving a scenario never changes the real employee record.</p></section>';
  }
  const scs=scenarios();
  body+='<section class="card"><h3>Saved scenarios</h3>'
   +(scs.length
    ?'<div class="quick" style="margin-bottom:10px"><button class="btn" data-action="scenario-compare">Compare selected two</button><button class="btn btn-danger" data-action="scenario-clear">Clear all</button></div>'
     +'<div class="table-wrap"><table class="table"><thead><tr><th scope="col"></th><th scope="col">Employee / group</th><th scope="col">Note</th><th scope="col">Saved</th><th scope="col">Risk</th><th scope="col"></th></tr></thead><tbody id="sc-list">'
     +scs.map(s=>'<tr><td><input type="checkbox" data-sc-check data-id="'+s.id+'" aria-label="Select scenario"></td><td>'+esc(scenarioName(s))+'</td><td>'+esc(s.note||'—')+'</td><td class="mono small">'+fmtDate(s.date)+'</td><td class="mono">'+fmtPct(s.baseP)+' → '+fmtPct(s.newP)+'</td><td><button class="tb-icon" data-action="scenario-delete" data-id="'+s.id+'" aria-label="Delete scenario">'+icon('trash',15)+'</button></td></tr>').join('')
     +'</tbody></table></div><div id="sc-compare" style="margin-top:14px"></div>'
    :'<p class="muted">No saved scenarios yet. Run a what-if above and save it with a note.</p>')
   +'</section>';
  return '<div class="page-head"><h1>What-if</h1></div>'+body;
 }
};
function saveWhatifScenario(form){
 const got=whatifModified();
 if(!got){toast('Choose an employee first.','alert');return;}
 const m=currentModel();
 const note=String(new FormData(form).get('note')||'').trim();
 scenarios().push({id:uid(),date:new Date().toISOString(),empId:got.emp.id,empName:displayName(got.emp,employees().indexOf(got.emp)),note:note,baseP:scoreEmployee(m,got.emp),newP:scoreEmployee(m,got.mod),changes:collectChanges(m,got.emp,got.mod)});
 saveAccount();logAction('Saved what-if scenario'+(note?' "'+note+'"':''));
 toast('Scenario saved');
 renderView();
}
function scenarioName(s){
 if(s.empId){
  const idx=employees().findIndex(e=>e.id===s.empId);
  if(idx>-1)return displayName(employees()[idx],idx);
 }
 return s.empName;
}
function compareScenarios(){
 const ids=$$('#sc-list [data-sc-check]:checked').map(c=>c.dataset.id);
 if(ids.length!==2){toast('Select exactly two scenarios to compare.','alert');return;}
 const a=scenarios().find(s=>s.id===ids[0]),b=scenarios().find(s=>s.id===ids[1]);
 if(!a||!b)return;
 const m=currentModel();
 const keys=[];
 Object.keys(a.changes||{}).forEach(k=>{if(keys.indexOf(k)===-1)keys.push(k);});
 Object.keys(b.changes||{}).forEach(k=>{if(keys.indexOf(k)===-1)keys.push(k);});
 const typical=typicalEmployee(m);
 const rows=keys.map(k=>'<tr><td>'+esc(FIELD_LABELS[k]||k)+'</td><td class="mono">'+esc(a.changes&&a.changes[k]!==undefined?fmtField(m,k,a.changes[k]):fmtField(m,k,typical[k]))+'</td><td class="mono">'+esc(b.changes&&b.changes[k]!==undefined?fmtField(m,k,b.changes[k]):fmtField(m,k,typical[k]))+'</td></tr>').join('');
 $('#sc-compare').innerHTML='<h4>Compare: '+esc(scenarioName(a))+' vs '+esc(scenarioName(b))+'</h4>'
  +'<div class="table-wrap"><table class="table"><thead><tr><th scope="col">Field</th><th scope="col">'+esc(trunc(a.note||'Scenario A',24))+'</th><th scope="col">'+esc(trunc(b.note||'Scenario B',24))+'</th></tr></thead><tbody>'+(rows||'<tr><td colspan="3" class="muted">No field differences.</td></tr>')+'</tbody></table></div>'
  +'<p class="mono small">Risk: '+esc(scenarioName(a))+' '+fmtPct(a.baseP)+' → '+fmtPct(a.newP)+' · '+esc(scenarioName(b))+' '+fmtPct(b.baseP)+' → '+fmtPct(b.newP)+'</p>';
}

/* ===== INSIGHTS ===== */
VIEWS.insights={
 render(){
  const m=currentModel();const cs=companyStats();
  if(!cs.count)return '<div class="page-head"><h1>Insights</h1></div>'+emptyHTML('No employees yet','Insights need employee data. Add employees or load sample data first.',[{action:'goto',to:'add',label:'Add / Import employees',primary:true},{action:'sample',label:'Load sample data'}]);
  const actions=companyActions(m,employees());
  let afterSum=0;employees().forEach(e=>{afterSum+=scoreEmployee(m,applyAllActions(m,e));});
  const afterAvg=afterSum/employees().length;
  const maxDrop=actions.length?Math.max.apply(null,actions.map(a=>a.stats.avgDrop)):0;
  return '<div class="page-head"><h1>Insights</h1><div class="quick">'
   +'<button class="btn" data-action="export-csv">'+icon('download',15)+' Export CSV</button>'
   +'<button class="btn" data-action="print-report">'+icon('printer',15)+' Print report</button></div></div>'
   +'<div class="kpis">'
   +kpi('Employees',fmtInt(cs.count),'in the current model')
   +kpi('Average risk',fmtPct(cs.avg),'across all employees')
   +kpi('High-risk people',fmtInt(cs.high),'risk of 66% or more')
   +kpi('Expected leavers',cs.expected.toFixed(1),'sum of all risk scores')
   +'</div><div class="grid-2">'
   +'<section class="card"><h3>Average risk by '+(m.deptKey===m.roleKey?'industry':'department')+'</h3><div id="ins-chart"></div></section>'
   +'<section class="card"><h3>Risk distribution</h3><div id="ins-hist"></div></section></div>'
   +'<section class="card"><h3>Company actions, ranked</h3><p class="muted small">Actions that would lower risk for the current employees, biggest effect first.</p>'
   +(actions.length?actions.map(a=>'<div class="reason"><div class="reason-top"><span><b>'+esc(a.advice)+'</b><br><span class="muted small">'+a.stats.helped+' '+(a.stats.helped===1?'employee':'employees')+' helped · average drop '+(a.stats.avgDrop*100).toFixed(1)+' pp</span></span></div><div class="bar"><i style="width:'+(maxDrop?Math.max(4,a.stats.avgDrop/maxDrop*100):0).toFixed(0)+'%"></i></div></div>').join(''):'<p class="muted">No company action would reduce risk for the current employees.</p>')
   +'</section>'
   +'<div class="callout">If all actions were applied, average risk would fall from <b>'+fmtPct(cs.avg)+'</b> to <b>'+fmtPct(afterAvg)+'</b>.</div>'
   +'<p class="muted small">'+CAUSE_TEXT+'</p>';
 },
 init(){
  drawBarChart('#ins-chart',avgRiskByGroup(),{fmt:v=>fmtPct(v),alt:'Average risk by group'});
  drawHistogram('#ins-hist',scoredEmployees().map(x=>x.p));
 }
};
function csvCell(s){s=String(s);return /[",\n]/.test(s)?'"'+s.replace(/"/g,'""')+'"':s;}
function downloadBlob(name,type,content){
 const a=document.createElement('a');
 a.href=URL.createObjectURL(new Blob([content],{type:type}));
 a.download=name;a.click();
 setTimeout(()=>URL.revokeObjectURL(a.href),1000);
}
function exportCSV(){
 const m=currentModel();const sc=scoredEmployees();
 const lines=['name,'+m.roleKey+',risk,level,top_reasons'];
 sc.slice().sort((a,b)=>b.p-a.p).forEach(x=>{
  const reasons=reasonsFor(m,x.emp,TOP_LIST).map(r=>r.label).join('; ');
  lines.push([displayName(x.emp,x.i),valueLabel(m.roleKey,x.emp[m.roleKey]),fmtPct(x.p),x.lvl,reasons].map(csvCell).join(','));
 });
 downloadBlob('attrition-insights.csv','text/csv',lines.join('\n'));
 toast('CSV exported');
}

/* ===== PLANNER ===== */
const planner={costs:{},replacement:REPLACEMENT_COST_DEFAULT,budget:0};
VIEWS.planner={
 render(){
  const m=currentModel();
  if(!employees().length)return '<div class="page-head"><h1>Planner</h1></div>'+emptyHTML('No employees yet','The planner needs employee data to estimate costs and savings.',[{action:'sample',label:'Load sample data',primary:true},{action:'goto',to:'add',label:'Add / Import employees'}]);
  return '<div class="page-head"><h1>Planner</h1></div>'
   +'<p class="muted">Type what each action would cost per employee and what replacing a leaver costs. The planner ranks actions by net saving and can pick a set that fits a budget.</p>'
   +'<form id="planner-form" class="card"><h3>Costs</h3><div class="grid-2">'
   +m.fix.map((a,i)=>'<label>Cost per employee for: <b>'+esc(actionAdvice(a))+'</b><div class="num-wrap"><span class="unit pre">$</span><input class="input" type="number" min="0" step="50" data-pk="'+i+'" value="'+(planner.costs[i]||0)+'"></div></label>').join('')
   +'</div><div class="grid-2" style="margin-top:14px">'
   +'<label>Cost of replacing one leaver<div class="num-wrap"><span class="unit pre">$</span><input class="input" type="number" min="0" step="100" id="pl-replacement" value="'+planner.replacement+'"></div></label>'
   +'<label>Total budget (optional)<div class="num-wrap"><span class="unit pre">$</span><input class="input" type="number" min="0" step="100" id="pl-budget" placeholder="No limit"></div></label>'
   +'</div></form><div id="planner-results" style="margin-top:20px"></div>';
 },
 init(){recalcPlanner();}
};
function recalcPlanner(){
 planner.costs={};
 $$('#planner-form [data-pk]').forEach(el=>{planner.costs[el.dataset.pk]=Number(el.value)||0;});
 const rp=$('#pl-replacement'),pb=$('#pl-budget');
 planner.replacement=rp?Number(rp.value)||0:REPLACEMENT_COST_DEFAULT;
 planner.budget=pb?Number(pb.value)||0:0;
 const el=$('#planner-results');if(el)el.innerHTML=plannerResultsHTML();
}
function plannerResultsHTML(){
 const m=currentModel();const emps=employees();
 const rows=m.fix.map((a,i)=>{
  const s=actionStats(m,emps,a);
  const cost=(planner.costs[i]||0)*s.helped;
  const savings=s.prevented*planner.replacement;
  const net=savings-cost;
  return {advice:actionAdvice(a),helped:s.helped,prevented:s.prevented,cost,savings,net,roi:cost>0?net/cost:null};
 }).sort((a,b)=>b.net-a.net);
 if(!rows.length)return '<div class="card"><p class="muted">No company actions are available for this model.</p></div>';
 const maxNet=Math.max.apply(null,rows.map(r=>r.net).concat([0]));
 let html='<section class="card"><h3>Actions ranked by net saving '+infoTip('ROI = net saving ÷ cost. Shows "n/a" when the cost is 0.')+'</h3><div class="table-wrap"><table class="table"><thead><tr>'
  +'<th scope="col">Action</th><th scope="col">Employees helped</th><th scope="col">Leavers prevented</th><th scope="col">Cost</th><th scope="col">Savings</th><th scope="col">Net</th><th scope="col">ROI</th><th scope="col"></th></tr></thead><tbody>'
  +rows.map(r=>'<tr><td>'+esc(r.advice)+'</td><td class="mono">'+r.helped+'</td><td class="mono">'+r.prevented.toFixed(2)+'</td><td class="mono">'+fmtMoney(r.cost)+'</td><td class="mono">'+fmtMoney(r.savings)+'</td><td class="mono" style="color:'+(r.net>=0?'var(--green)':'var(--red)')+'"><b>'+fmtMoney(r.net)+'</b></td><td class="mono">'+(r.roi===null?'n/a':fmtPct(r.roi,0))+'</td><td style="min-width:120px"><div class="bar"><i style="width:'+(maxNet>0?Math.max(3,r.net/maxNet*100):3).toFixed(0)+'%"></i></div></td></tr>').join('')
  +'</tbody></table></div></section>';
 if(planner.budget>0){
  const free=rows.filter(r=>r.cost===0&&r.net>0);
  const paid=rows.filter(r=>r.cost>0).sort((a,b)=>(b.net/b.cost)-(a.net/a.cost));
  let spent=0;const picked=free.slice();
  paid.forEach(r=>{if(spent+r.cost<=planner.budget+1e-9){picked.push(r);spent+=r.cost;}});
  picked.sort((a,b)=>b.net-a.net);
  const totPrev=picked.reduce((s,r)=>s+r.prevented,0);
  const totNet=picked.reduce((s,r)=>s+r.net,0);
  html+='<section class="card"><h3>Best set within a budget of '+fmtMoney(planner.budget)+'</h3>'
   +(picked.length
    ?'<ul class="guide">'+picked.map(r=>'<li><b>'+esc(r.advice)+'</b> — cost '+fmtMoney(r.cost)+', prevents '+r.prevented.toFixed(2)+' leavers, net '+fmtMoney(r.net)+'</li>').join('')+'</ul><p>Total cost <b class="mono">'+fmtMoney(spent)+'</b> · leavers prevented <b class="mono">'+totPrev.toFixed(2)+'</b> · net saving <b class="mono">'+fmtMoney(totNet)+'</b></p>'
    :'<p class="muted">No action fits within this budget.</p>')
   +'</section>';
 }
 html+='<div class="callout warn">These are estimates. '+CAUSE_TEXT+'</div>';
 return html;
}

/* ===== GROUP POLICY SIMULATOR ===== */
const policy={group:'all',action:'all'};
VIEWS.policy={
 render(){
  const m=currentModel();
  if(!employees().length)return '<div class="page-head"><h1>Group policy simulator</h1></div>'+emptyHTML('No employees yet','The policy simulator needs employee data.',[{action:'sample',label:'Load sample data',primary:true},{action:'goto',to:'add',label:'Add / Import employees'}]);
  const deptVals=Array.from(new Set(employees().map(e=>e[m.deptKey]))).sort();
  const groupLabel=m.deptKey===m.roleKey?'Industry':'Department';
  return '<div class="page-head"><h1>Group policy simulator</h1></div>'
   +'<p class="muted">Pick a group and one action (or all actions) to see what would happen if the company applied it to that group.</p>'
   +'<form id="policy-form" class="card"><div class="grid-2">'
   +'<label>Group<select class="input" id="pol-group"><option value="all">All employees</option><option disabled>— Risk level —</option>'
   +'<option value="risk:High"'+(policy.group==='risk:High'?' selected':'')+'>Risk level: High</option>'
   +'<option value="risk:Medium"'+(policy.group==='risk:Medium'?' selected':'')+'>Risk level: Medium</option>'
   +'<option value="risk:Low"'+(policy.group==='risk:Low'?' selected':'')+'>Risk level: Low</option>'
   +'<option disabled>— '+groupLabel+' —</option>'
   +deptVals.map(v=>'<option value="'+esc(v)+'"'+(policy.group===v?' selected':'')+'>'+esc(v)+'</option>').join('')
   +'</select></label>'
   +'<label>Action<select class="input" id="pol-action"><option value="all"'+(policy.action==='all'?' selected':'')+'>All actions (one after another)</option>'
   +m.fix.map((a,i)=>'<option value="'+i+'"'+(policy.action===String(i)?' selected':'')+'>'+esc(actionAdvice(a))+'</option>').join('')
   +'</select></label></div></form>'
   +'<div id="policy-results" style="margin-top:20px"></div>'
   +'<section class="card"><h3>Save as scenario</h3><form id="policy-save-form" class="quick"><input class="input" name="note" placeholder="Note (e.g. \'Remote work for Technology\')" aria-label="Scenario note"><button class="btn btn-primary" type="submit">Save as scenario</button></form></section>';
 },
 init(){recalcPolicy();}
};
function policyGroupEmps(){
 const m=currentModel();let emps=employees();
 if(policy.group==='all')return emps;
 if(policy.group.indexOf('risk:')===0)return emps.filter(e=>riskLevel(m,scoreEmployee(m,e))===policy.group.slice(5));
 return emps.filter(e=>e[m.deptKey]===policy.group);
}
function policyCalc(){
 const m=currentModel();const emps=policyGroupEmps();
 if(!emps.length)return null;
 const before=emps.map(e=>scoreEmployee(m,e));
 const after=emps.map(e=>scoreEmployee(m,policy.action==='all'?applyAllActions(m,e):applyAction(m,e,m.fix[Number(policy.action)])));
 const expB=before.reduce((a,b)=>a+b,0),expA=after.reduce((a,b)=>a+b,0);
 return {count:emps.length,avgB:expB/emps.length,avgA:expA/emps.length,expB,expA,prevented:expB-expA};
}
function recalcPolicy(){
 const r=policyCalc();const el=$('#policy-results');if(!el)return;
 if(!r){el.innerHTML='<div class="card"><p class="muted">No employees in this group.</p></div>';return;}
 el.innerHTML='<div class="kpis">'
  +kpi('Employees',fmtInt(r.count),'in this group')
  +kpi('Expected leavers before',r.expB.toFixed(2),'sum of risk scores')
  +kpi('Expected leavers after',r.expA.toFixed(2),'after the action')
  +kpi('Leavers prevented',r.prevented.toFixed(2),'expected difference')
  +'</div><div class="grid-2">'
  +'<div class="card"><h3>Average risk</h3><p class="mono" style="font-size:22px">'+fmtPct(r.avgB)+' → '+fmtPct(r.avgA)+'</p></div>'
  +'<div class="card"><h3>Change</h3><p class="mono" style="font-size:22px;color:var(--green)">−'+((r.avgB-r.avgA)*100).toFixed(1)+' pp average risk</p></div></div>'
  +'<div class="callout">These are estimates. '+CAUSE_TEXT+'</div>';
}
function savePolicyScenario(form){
 const r=policyCalc();
 if(!r){toast('Nothing to save — no employees in this group.','alert');return;}
 const note=String(new FormData(form).get('note')||'').trim();
 scenarios().push({id:uid(),date:new Date().toISOString(),empId:null,empName:'Policy: '+(policy.group==='all'?'all employees':policy.group),note:note,baseP:r.avgB,newP:r.avgA,changes:{},policy:true});
 saveAccount();logAction('Saved policy scenario'+(note?' "'+note+'"':''));
 toast('Scenario saved');
 form.reset();
}

/* ===== TRENDS ===== */
VIEWS.trends={
 render(){
  const snaps=snapshots();const cs=companyStats();
  return '<div class="page-head"><h1>Trends</h1><div class="quick">'
   +'<button class="btn btn-primary" data-action="snapshot-save"'+(employees().length?'':' disabled')+'>'+icon('save',15)+' Save snapshot</button>'
   +(snaps.length?'<button class="btn btn-danger" data-action="snapshot-clear">Clear all</button>':'')
   +'</div></div>'
   +(snaps.length
    ?'<section class="card"><h3>Snapshots over time</h3><div id="trend-chart"></div></section>'
     +'<section class="card"><h3>Snapshot history</h3><div class="table-wrap"><table class="table"><thead><tr><th scope="col">Date</th><th scope="col">Average risk</th><th scope="col">High-risk count</th><th scope="col">Expected leavers</th><th scope="col"></th></tr></thead><tbody>'
     +snaps.map(s=>'<tr><td class="mono">'+fmtDate(s.date)+'</td><td class="mono">'+fmtPct(s.avg)+'</td><td class="mono">'+s.high+'</td><td class="mono">'+s.expected.toFixed(1)+'</td><td><button class="tb-icon" data-action="snapshot-delete" data-id="'+s.id+'" aria-label="Delete snapshot">'+icon('trash',15)+'</button></td></tr>').join('')
     +'</tbody></table></div></section>'
    :emptyHTML('No snapshots yet','Save a snapshot each month to see whether things are improving.',[{action:'snapshot-save',label:'Save snapshot',primary:true}]));
 },
 init(){
  if(snapshots().length){
   const pts=snapshots().slice().reverse().map(s=>({label:fmtDateShort(s.date),value:s.avg}));
   drawLineChart('#trend-chart',pts);
  }
 }
};
function saveSnapshot(){
 const cs=companyStats();
 if(!cs.count){toast('Add employees before saving a snapshot.','alert');return;}
 snapshots().push({id:uid(),date:new Date().toISOString(),avg:cs.avg,high:cs.high,expected:cs.expected});
 saveAccount();logAction('Saved trend snapshot');
 toast('Snapshot saved');
 renderView();
}

/* ===== SETTINGS ===== */
VIEWS.settings={
 render(){
  const m=currentModel();
  return '<div class="page-head"><h1>Settings</h1></div>'
   +'<div class="grid-2"><div class="card" id="about-model"><h3>About the model: '+esc(m.name)+'</h3><dl class="fields">'
   +'<dt>Trained on</dt><dd>'+esc(MODEL_TRAINED_ON[m.id]||'A custom model imported by you.')+'</dd>'
   +'<dt>Rows</dt><dd class="mono">'+fmtInt(m.n)+'</dd>'
   +'<dt>Share who left</dt><dd class="mono">'+fmtPct(m.base_rate)+'</dd>'
   +'<dt>Accuracy (CV AUC) '+infoTip('How well the model ranks leavers above stayers. 0.5 is a coin flip, 1.0 is perfect.')+'</dt><dd class="mono">'+m.cv_auc.toFixed(3)+'</dd>'
   +'<dt>Top-10% precision '+infoTip('Of the riskiest 10% of employees the model flags, this share really did leave in the training data.')+'</dt><dd class="mono">'+fmtPct(m.top10_prec)+'</dd>'
   +'</dl>'
   +(m.id==='industry'?'<div class="callout warn">This model\'s leaver rate is 47%, which is unrealistic. Trust the ranking of employees, not the exact percentages.</div>':'')
   +'<div class="callout danger">'+WARNING_TEXT+'</div></div>'
   +'<div class="card"><h3>Appearance &amp; privacy</h3>'
   +'<label>Theme<select id="theme-select" class="input"><option value="system"'+(state.theme==='system'?' selected':'')+'>Follow system</option><option value="light"'+(state.theme==='light'?' selected':'')+'>Light</option><option value="dark"'+(state.theme==='dark'?' selected':'')+'>Dark</option></select></label>'
   +'<div class="set-row">'+switchHTML('privacy-switch',state.privacy,'Privacy mode')+'<div><b>Privacy mode</b><p class="muted small">Every name becomes "Employee 001", "Employee 002"… in the order of the list — on every screen and in every export and printout.</p></div></div>'
   +'<p class="muted small">The theme follows your system by default; your choice is remembered.</p></div></div>'
   +'<div class="grid-2" style="margin-top:20px"><div class="card"><h3>Backup &amp; restore</h3>'
   +'<p class="muted small">Download saves all records, scenarios and snapshots of this account as one JSON file.</p>'
   +'<button class="btn" data-action="backup-download">'+icon('download',15)+' Download backup</button>'
   +'<hr class="sep"><p class="muted small">Restore asks for the JSON backup file you downloaded here. It replaces the current data after you confirm.</p>'
   +'<input type="file" id="backup-file" accept=".json" class="input" aria-label="Restore backup file"></div>'
   +'<div class="card"><h3>Import model</h3>'
   +'<p class="muted small">Add another model by pasting or uploading a JSON file with the same keys as the built-in models (name, intercept, num, cat, catbase, catdef, medians, hi, mid, base_rate, cv_auc, top10_prec, n, roleKey, deptKey, fix).</p>'
   +'<textarea id="model-json" class="input mono" rows="5" placeholder="Paste a model JSON here…" aria-label="Model JSON"></textarea>'
   +'<input type="file" id="model-file" accept=".json" class="input" aria-label="Upload model JSON file" style="margin-top:10px">'
   +'<button class="btn btn-primary" data-action="model-add" style="margin-top:10px">Validate &amp; add model</button>'
   +'<div id="model-msg"></div></div></div>'
   +'<div class="card" style="margin-top:20px"><h3>Activity log</h3>'
   +(state.log.length
    ?'<ul class="log-list">'+state.log.map(e=>'<li><span class="mono small">'+fmtDate(e.time)+'</span> — '+esc(e.text)+'</li>').join('')+'</ul><button class="btn btn-danger" data-action="log-clear" style="margin-top:10px">Clear log</button>'
    :'<p class="muted">No activity yet. Imports, deletes, clears, restores and snapshots are recorded here (last '+LOG_LIMIT+').</p>')
   +'</div>'
   +'<div class="card" style="margin-top:20px"><h3>Self-test</h3>'
   +'<p class="muted small">Checks the scoring engine against known values for all three built-in models (tolerance ±0.003). It also runs silently at startup; a red banner appears if a check fails.</p>'
   +'<button class="btn" data-action="run-selftest">Run self-test</button>'
   +'<div id="selftest-results" style="margin-top:12px">'+selftestHTML(runSelfTest())+'</div></div>';
 }
};
