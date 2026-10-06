/* ===== UI HELPERS ===== */
const $=s=>document.querySelector(s);
const $$=s=>Array.from(document.querySelectorAll(s));
function esc(s){return String(s===null||s===undefined?'':s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
function fmtPct(p,d){return (p*100).toFixed(d===undefined?1:d)+'%';}
function fmtInt(n){return Math.round(n).toLocaleString('en-US');}
function fmtMoney(n){return '$'+Math.round(n).toLocaleString('en-US');}
function fmtDate(iso){const d=new Date(iso);return isNaN(d)?String(iso):d.toLocaleString('en-US',{year:'numeric',month:'short',day:'numeric',hour:'2-digit',minute:'2-digit'});}
function fmtDateShort(iso){const d=new Date(iso);return isNaN(d)?String(iso):d.toLocaleDateString('en-US',{month:'short',day:'numeric'});}
function trunc(s,n){s=String(s);return s.length>n?s.slice(0,n-1)+'…':s;}
function uid(){return Date.now().toString(36)+Math.random().toString(36).slice(2,7);}
function slug(s){return String(s).toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-+|-+$/g,'')||'model';}
function debounce(fn,ms){let t;return function(){const a=arguments,c=this;clearTimeout(t);t=setTimeout(()=>fn.apply(c,a),ms);};}
function fmtField(m,k,v){
 if(v===undefined||v===null)return '—';
 if(m.num[k]){const n=Number(v);return (k==='MonthlyIncome'||k==='Salary')?fmtMoney(n):n.toLocaleString('en-US');}
 return valueLabel(k,v);
}
const ICONS={
 home:'M3 10.5 12 3l9 7.5M5 9.5V21h14V9.5M9 21v-6h6v6',
 users:'M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM22 21v-2a4 4 0 0 0-3-3.9M15 3.1a4 4 0 0 1 0 7.8',
 'user-plus':'M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM19 8v6M22 11h-6',
 flask:'M9 3h6M10 3v5.2L4.6 17.5A2 2 0 0 0 6.3 21h11.4a2 2 0 0 0 1.7-3.5L14 8.2V3M7.5 14.5h9',
 chart:'M5 21v-8M12 21V4M19 21v-8M3 21h18',
 target:'M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20zM12 16a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM12 2v2M12 20v2M2 12h2M20 12h2',
 shield:'M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z',
 trend:'M3 17l6-6 4 4 8-8M15 7h6v6',
 settings:'M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8zM12 2v3M12 19v3M2 12h3M19 12h3M4.9 4.9l2.2 2.2M16.9 16.9l2.2 2.2M19.1 4.9 16.9 7.1M7.1 16.9l-2.2 2.2',
 search:'M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16zM21 21l-4.3-4.3',
 sun:'M12 17a5 5 0 1 0 0-10 5 5 0 0 0 0 10zM12 1v2M12 21v2M4.2 4.2l1.4 1.4M18.4 18.4l1.4 1.4M1 12h2M21 12h2M4.2 19.8l1.4-1.4M18.4 5.6l1.4-1.4',
 moon:'M21 12.8A9 9 0 1 1 11.2 3 7 7 0 0 0 21 12.8z',
 eye:'M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7zM12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z',
 'eye-off':'M17.9 17.9A10.4 10.4 0 0 1 12 19c-7 0-11-7-11-7a19.8 19.8 0 0 1 5-5.9M9.9 4.2A9.9 9.9 0 0 1 12 5c7 0 11 7 11 7a19.8 19.8 0 0 1-3.2 4.3M1 1l22 22M9.9 9.9a3 3 0 1 0 4.2 4.2',
 x:'M18 6 6 18M6 6l12 12',
 check:'M20 6 9 17l-5-5',
 alert:'M12 3 2 20h20L12 3zM12 10v4M12 17h.01',
 trash:'M3 6h18M8 6V4h8v2M6 6l1 15h10l1-15M10 11v6M14 11v6',
 download:'M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3',
 upload:'M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12',
 plus:'M12 5v14M5 12h14',
 'chev-l':'M15 18l-6-6 6-6',
 'chev-r':'M9 18l6-6-6-6',
 printer:'M6 9V3h12v6M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2M6 14h12v7H6z',
 info:'M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20zM12 16v-4M12 8h.01',
 undo:'M3 7v6h6M21 17a9 9 0 1 0-2.6-6.4L21 13',
 dots:'M12 5h.01M12 12h.01M12 19h.01',
 'arrow-up':'M12 19V5M5 12l7-7 7 7',
 'arrow-down':'M12 5v14M19 12l-7 7-7-7',
 save:'M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2zM17 21v-8H7v8M7 3v5h8',
 user:'M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z',
 logout:'M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9',
 lock:'M5 11h14v10H5zM8 11V7a4 4 0 0 1 8 0v4'
};
function icon(name,size){size=size||18;return '<svg width="'+size+'" height="'+size+'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="'+(ICONS[name]||ICONS.info)+'"/></svg>';}

/* ===== COMPONENTS ===== */
function toast(msg,type,ms,action){
 type=type||'check';ms=ms===undefined?4000:ms;
 const el=document.createElement('div');
 el.className='toast t-'+type;el.setAttribute('role','status');
 el.innerHTML=icon(type==='alert'?'alert':type==='undo'?'undo':'check',16)+'<span>'+esc(msg)+'</span>';
 if(action){
  const b=document.createElement('button');b.className='toast-btn';b.type='button';b.textContent=action.label;
  b.addEventListener('click',()=>{action.fn();dismiss();});
  el.appendChild(b);
 }
 $('#toasts').appendChild(el);
 function dismiss(){el.classList.add('out');setTimeout(()=>el.remove(),200);}
 if(ms)setTimeout(dismiss,ms);
}
let modalResolve=null;
function resolveModal(v){$('#modal-root').innerHTML='';if(modalResolve){const r=modalResolve;modalResolve=null;r(v);}}
function openModal(html){
 $('#modal-root').innerHTML='<div class="modal-backdrop" data-action="modal-resolve" data-v="0"></div><div class="modal card" role="dialog" aria-modal="true">'+html+'</div>';
 trapFocus($('#modal-root .modal'));
}
function confirmDialog(message,title,danger){
 return new Promise(res=>{
  modalResolve=res;
  openModal('<h3>'+esc(title||'Please confirm')+'</h3><p class="muted">'+esc(message)+'</p><div class="quick" style="margin-top:14px"><button class="btn" data-action="modal-resolve" data-v="0">Cancel</button><button class="btn '+(danger===false?'btn-primary':'btn-danger')+'" data-action="modal-resolve" data-v="1">'+(danger===false?'OK':'Delete')+'</button></div>');
 });
}
function trapFocus(container){
 if(!container)return;
 const sel='button,[href],input,select,textarea,[tabindex]:not([tabindex="-1"])';
 const list=()=>Array.from(container.querySelectorAll(sel)).filter(el=>!el.disabled);
 const first=list()[0];if(first)first.focus();
 container.addEventListener('keydown',e=>{
  if(e.key!=='Tab')return;
  const l=list();if(!l.length)return;
  const f=l[0],last=l[l.length-1];
  if(e.shiftKey&&document.activeElement===f){e.preventDefault();last.focus();}
  else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();f.focus();}
 });
}
function openDrawer(html,label){
 $('#drawer-root').innerHTML='<div class="drawer-backdrop" data-action="drawer-close"></div><aside class="drawer" role="dialog" aria-modal="true" aria-label="'+esc(label||'Details')+'">'+html+'</aside>';
 document.body.style.overflow='hidden';
 trapFocus($('#drawer-root .drawer'));
 $('#drawer-root .drawer').scrollTop=0;
}
function closeDrawer(){$('#drawer-root').innerHTML='';document.body.style.overflow='';}
function switchHTML(id,on,label){return '<button type="button" class="switch" id="'+id+'" role="switch" aria-checked="'+(on?'true':'false')+'" data-action="toggle-switch" data-target="'+id+'" aria-label="'+esc(label)+'"><span class="knob"></span></button>';}
function riskBadge(p,m){
 const lvl=riskLevel(m,p);
 const cls=lvl==='High'?'r-high':lvl==='Medium'?'r-med':'r-low';
 const ic=lvl==='High'?'alert':lvl==='Medium'?'info':'check';
 return '<span class="badge '+cls+'">'+icon(ic,12)+'<b>'+lvl+'</b><span>'+fmtPct(p)+'</span></span>';
}
function infoTip(text){return '<button type="button" class="info" data-tip="'+esc(text)+'" aria-label="More information">i</button>';}
function kpi(label,num,sub){return '<div class="kpi"><div class="kpi-label">'+esc(label)+'</div><div class="kpi-num">'+num+'</div><div class="kpi-sub">'+esc(sub)+'</div></div>';}
function emptyHTML(title,text,btns){
 return '<div class="card empty">'+icon('users',34)+'<h2>'+esc(title)+'</h2><p class="muted" style="max-width:52ch">'+esc(text)+'</p><div class="empty-actions">'
  +btns.map(b=>'<button class="btn '+(b.primary?'btn-primary':'')+'" data-action="'+b.action+'"'+(b.to?' data-to="'+b.to+'"':'')+(b.tab?' data-tab="'+b.tab+'"':'')+'>'+esc(b.label)+'</button>').join('')+'</div></div>';
}
function skel(){return '<div class="skel"></div><div class="skel"></div><div class="skel"></div><div class="skel"></div>';}
function gaugeSVG(p,m){
 const lvl=riskLevel(m,p);
 const color=lvl==='High'?'var(--red)':lvl==='Medium'?'var(--amber)':'var(--green)';
 const cx=110,cy=100,r=78,W=220,H=118;
 const frac=Math.max(0,Math.min(1,p));
 const a1=Math.PI*(1-frac);
 const x1=cx+r*Math.cos(a1),y1=cy-r*Math.sin(a1);
 return '<svg viewBox="0 0 '+W+' '+H+'" width="100%" class="gauge" role="img" aria-label="Risk gauge: '+lvl+', '+fmtPct(p)+'">'
  +'<title>Risk '+fmtPct(p)+' — '+lvl+' risk</title>'
  +'<path d="M '+(cx-r)+' '+cy+' A '+r+' '+r+' 0 0 1 '+(cx+r)+' '+cy+'" fill="none" stroke="var(--line-soft)" stroke-width="14" stroke-linecap="round"/>'
  +'<path d="M '+(cx-r)+' '+cy+' A '+r+' '+r+' 0 0 1 '+x1.toFixed(2)+' '+y1.toFixed(2)+'" fill="none" stroke="'+color+'" stroke-width="14" stroke-linecap="round"/>'
  +'<text x="'+(cx-r)+'" y="'+(cy+20)+'" class="g-tick" text-anchor="middle">0%</text>'
  +'<text x="'+(cx+r)+'" y="'+(cy+20)+'" class="g-tick" text-anchor="middle">100%</text>'
  +'<text x="'+cx+'" y="'+(cy-34)+'" class="g-val" text-anchor="middle" fill="'+color+'">'+fmtPct(p)+'</text>'
  +'<text x="'+cx+'" y="'+(cy-14)+'" class="g-lvl" text-anchor="middle">'+lvl+' risk</text>'
  +'</svg>';
}
function drawBarChart(sel,data,opts){
 opts=opts||{};
 const el=$(sel);if(!el)return;
 if(!data.length){el.innerHTML='<p class="muted">No data yet.</p>';return;}
 const W=560,H=260,padL=48,padB=64,padT=18,padR=8;
 const max=Math.max.apply(null,data.map(d=>d.value).concat([0.0001]));
 const iw=W-padL-padR,ih=H-padT-padB,bw=iw/data.length;
 let s='<svg viewBox="0 0 '+W+' '+H+'" width="100%" role="img" aria-label="'+esc(opts.alt||'Bar chart')+'"><title>'+esc(opts.alt||'Bar chart')+'</title>';
 for(let i=0;i<=4;i++){
  const v=max*i/4,y=padT+ih*(1-i/4);
  s+='<line x1="'+padL+'" y1="'+y+'" x2="'+(W-padR)+'" y2="'+y+'" class="c-grid"/>';
  s+='<text x="'+(padL-6)+'" y="'+(y+4)+'" class="c-tick" text-anchor="end">'+(opts.fmt?opts.fmt(v):v.toFixed(2))+'</text>';
 }
 data.forEach((d,i)=>{
  const h=ih*(d.value/max);
  const x=padL+i*bw+bw*0.16,y=padT+ih-h,w=bw*0.68;
  const val=opts.fmt?opts.fmt(d.value):d.value.toFixed(2);
  s+='<g tabindex="0" role="img" aria-label="'+esc(d.label)+': '+esc(val)+'"><title>'+esc(d.label)+': '+esc(val)+'</title>'
   +'<rect x="'+x.toFixed(1)+'" y="'+y.toFixed(1)+'" width="'+w.toFixed(1)+'" height="'+h.toFixed(1)+'" fill="'+(d.color||'var(--accent)')+'" class="c-bar"/>';
  if(h>14)s+='<text x="'+(x+w/2).toFixed(1)+'" y="'+(y-5).toFixed(1)+'" class="c-tick" text-anchor="middle">'+esc(val)+'</text>';
  s+='<text x="'+(x+w/2).toFixed(1)+'" y="'+(H-padB+16)+'" class="c-lab" text-anchor="end" transform="rotate(-35 '+(x+w/2).toFixed(1)+' '+(H-padB+16)+')">'+esc(trunc(d.label,16))+'</text></g>';
 });
 s+='</svg>';
 el.innerHTML=s;
}
function drawHistogram(sel,ps){
 const bins=new Array(HISTOGRAM_BINS).fill(0);
 ps.forEach(p=>{const i=Math.min(HISTOGRAM_BINS-1,Math.floor(p*HISTOGRAM_BINS));bins[i]++;});
 drawBarChart(sel,bins.map((c,i)=>({label:(i*10)+'–'+(i*10+10)+'%',value:c,color:'var(--accent)'})),{fmt:v=>String(Math.round(v)),alt:'Histogram of the risk distribution across employees, 10 bars from 0% to 100% risk'});
}
function drawLineChart(sel,pts){
 const el=$(sel);if(!el)return;
 if(!pts.length){el.innerHTML='<p class="muted">No snapshots yet.</p>';return;}
 const W=560,H=240,padL=48,padB=56,padT=16,padR=10;
 const max=Math.max.apply(null,[0.2].concat(pts.map(p=>p.value)));
 const iw=W-padL-padR,ih=H-padT-padB;
 const X=i=>padL+iw*(pts.length===1?0.5:i/(pts.length-1));
 const Y=v=>padT+ih*(1-v/max);
 let s='<svg viewBox="0 0 '+W+' '+H+'" width="100%" role="img" aria-label="Line chart of average risk over time"><title>Average risk over time</title>';
 for(let i=0;i<=4;i++){
  const v=max*i/4,y=Y(v);
  s+='<line x1="'+padL+'" y1="'+y+'" x2="'+(W-padR)+'" y2="'+y+'" class="c-grid"/>';
  s+='<text x="'+(padL-6)+'" y="'+(y+4)+'" class="c-tick" text-anchor="end">'+fmtPct(v,0)+'</text>';
 }
 s+='<polyline points="'+pts.map((p,i)=>X(i).toFixed(1)+','+Y(p.value).toFixed(1)).join(' ')+'" class="c-line"/>';
 pts.forEach((p,i)=>{
  s+='<g tabindex="0" role="img" aria-label="'+esc(p.label)+': '+fmtPct(p.value)+'"><title>'+esc(p.label)+': '+fmtPct(p.value)+'</title>'
   +'<circle cx="'+X(i).toFixed(1)+'" cy="'+Y(p.value).toFixed(1)+'" r="4.5" class="c-dot"/></g>';
  s+='<text x="'+X(i).toFixed(1)+'" y="'+(H-padB+18)+'" class="c-lab" text-anchor="end" transform="rotate(-35 '+X(i).toFixed(1)+' '+(H-padB+18)+')">'+esc(p.label)+'</text>';
 });
 s+='</svg>';
 el.innerHTML=s;
}
function changeChip(a,b){
 const d=(b-a)*100;
 if(d>0.05)return '<span class="chip chip-bad">'+icon('arrow-up',12)+' +'+d.toFixed(1)+' pp</span>';
 if(d<-0.05)return '<span class="chip chip-good">'+icon('arrow-down',12)+' −'+Math.abs(d).toFixed(1)+' pp</span>';
 return '<span class="chip">'+icon('info',12)+' no change</span>';
}
function reasonsDiff(m,base,mod){
 const a=reasonsFor(m,base,TOP_DETAIL).map(r=>r.field);
 const b=reasonsFor(m,mod,TOP_DETAIL).map(r=>r.field);
 const appeared=b.filter(f=>a.indexOf(f)===-1);
 const resolved=a.filter(f=>b.indexOf(f)===-1);
 let out='';
 if(appeared.length)out+='<p><b class="c-red">Appeared:</b> '+appeared.map(f=>esc(reasonLabel(m,f,mod[f]))).join('; ')+'</p>';
 if(resolved.length)out+='<p><b class="c-green">Resolved:</b> '+resolved.map(f=>esc(reasonLabel(m,f,base[f]))).join('; ')+'</p>';
 if(!out)out='<p class="muted">No change in the top risk reasons.</p>';
 return out;
}

/* ===== THEME & PRIVACY ===== */
function isDark(){
 if(state.theme==='dark')return true;
 if(state.theme==='light')return false;
 return window.matchMedia&&window.matchMedia('(prefers-color-scheme: dark)').matches;
}
function applyTheme(){document.documentElement.dataset.theme=isDark()?'dark':'light';}
function setTheme(t){state.theme=t;applyTheme();saveAccount();}
function togglePrivacy(){
 state.privacy=!state.privacy;saveAccount();renderApp();
 toast(state.privacy?'Privacy mode on — names are hidden everywhere.':'Privacy mode off.');
}
function switchModel(id){
 if(!MODELS_BY_ID[id])return;
 state.modelId=id;invalidateCache();saveAccount();renderApp();
}
