/* ===== ENGINE (pure scoring functions, no screen code) ===== */
const sigmoid=z=>1/(1+Math.exp(-z));
function numOf(model,k,v){const n=Number(v);return Number.isFinite(n)?n:(model.medians[k]!==undefined?model.medians[k]:model.num[k].min);}
function scoreEmployee(model,emp){
 let z=model.intercept;
 for(const k in model.num){const f=model.num[k];z+=f.coef*(numOf(model,k,emp[k])-f.mean)/f.scale;}
 for(const k in model.cat){const c=model.cat[k];const v=emp[k];z+=(c&&Object.prototype.hasOwnProperty.call(c,v))?c[v]:0;}
 return sigmoid(z);
}
/* Fixed bands for every model: Low < 33%, Medium 33-66%, High >= 66%.
   The model's own hi/mid values stay in the locked data but are not used for levels. */
const RISK_MEDIUM_FROM=0.33;
const RISK_HIGH_FROM=0.66;
const RISK_BANDS_TEXT='Low = under 33%, Medium = 33% to 66%, High = 66% and above.';
function riskLevel(model,p){return p>=RISK_HIGH_FROM?'High':p>=RISK_MEDIUM_FROM?'Medium':'Low';}
function contributions(model,emp){
 const out=[];
 for(const k in model.num){const f=model.num[k];const v=numOf(model,k,emp[k]);out.push({field:k,kind:'num',value:v,c:f.coef*(v-f.mean)/f.scale});}
 for(const k in model.cat){const c=model.cat[k];const v=emp[k];const b=(c&&Object.prototype.hasOwnProperty.call(c,v))?c[v]:0;out.push({field:k,kind:'cat',value:v,c:b-(model.catbase[k]||0)});}
 return out;
}
function reasonsFor(model,emp,limit){
 return contributions(model,emp).filter(x=>x.c>REASON_THRESHOLD).sort((a,b)=>b.c-a.c).slice(0,limit||TOP_LIST)
  .map(x=>({field:x.field,kind:x.kind,value:x.value,c:x.c,label:reasonLabel(model,x.field,x.value)}));
}
function typicalEmployee(model){
 const e={};
 for(const k in model.num)e[k]=model.medians[k];
 for(const k in model.cat)e[k]=model.catdef[k];
 return e;
}
function applyAction(model,emp,action){
 const e=Object.assign({},emp);const k=action.k;
 switch(action.type){
  case 'set':if(!action.from||action.from.indexOf(emp[k])!==-1)e[k]=action.v;break;
  case 'min':e[k]=Math.min(action.v,numOf(model,k,emp[k]));break;
  case 'max':e[k]=Math.max(action.v,numOf(model,k,emp[k]));break;
  case 'mul':e[k]=Math.round(numOf(model,k,emp[k])*action.v);break;
  case 'up':
   if(action.order){const i=action.order.indexOf(emp[k]);if(i>-1&&i<action.order.length-1)e[k]=action.order[i+1];}
   else{const f=model.num[k];if(f)e[k]=Math.min(numOf(model,k,emp[k])+1,f.max);}
   break;
 }
 return e;
}
function applyAllActions(model,emp){return model.fix.reduce((e,a)=>applyAction(model,e,a),Object.assign({},emp));}
function actionStats(model,emps,action){
 if(!emps.length)return {helped:0,avgDrop:0,prevented:0};
 let helped=0,dropSum=0;
 for(const emp of emps){const d=scoreEmployee(model,emp)-scoreEmployee(model,applyAction(model,emp,action));dropSum+=d;if(d>=HELP_THRESHOLD)helped++;}
 return {helped,avgDrop:dropSum/emps.length,prevented:dropSum};
}
function companyActions(model,emps){
 return model.fix.map((a,i)=>({index:i,action:a,advice:actionAdvice(a),stats:actionStats(model,emps,a)}))
  .filter(x=>x.stats.avgDrop>0).sort((a,b)=>b.stats.avgDrop-a.stats.avgDrop);
}
function overtimeKey(model){for(const k in model.cat){if(/overtime/i.test(k))return k;}return null;}
const SELF_TESTS=[
 {model:'ibm',label:'Typical employee',expected:0.024},
 {model:'ibm',label:'Overtime = Yes',expected:0.0995,ot:true},
 {model:'ibm',label:'All company actions applied',expected:0.0046,all:true},
 {model:'atlas',label:'Typical employee',expected:0.0354},
 {model:'atlas',label:'Overtime = Yes',expected:0.1529,ot:true},
 {model:'atlas',label:'All company actions applied',expected:0.0354,all:true},
 {model:'industry',label:'Typical employee',expected:0.5153},
 {model:'industry',label:'Overtime = Yes',expected:0.5876,ot:true},
 {model:'industry',label:'All company actions applied',expected:0.1049,all:true}
];
function runSelfTest(){
 return SELF_TESTS.map(t=>{
  const m=MODELS_BY_ID[t.model];let emp=typicalEmployee(m);let actual;
  if(t.ot){emp[overtimeKey(m)]='Yes';actual=scoreEmployee(m,emp);}
  else if(t.all){actual=scoreEmployee(m,applyAllActions(m,emp));}
  else{actual=scoreEmployee(m,emp);}
  return {model:t.model,modelName:m.name,label:t.label,expected:t.expected,actual,pass:Math.abs(actual-t.expected)<=SELF_TEST_TOLERANCE};
 });
}
