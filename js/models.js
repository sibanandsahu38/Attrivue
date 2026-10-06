/* ===== MODELS (LOCKED — copied exactly from the specification) ===== */
const MODELS=[
Object.assign({id:'ibm'}, {"intercept":-1.753,"num":{"DistanceFromHome":{"mean":9.193,"scale":8.104,"coef":0.286,"min":1,"max":29},"Education":{"mean":2.913,"scale":1.024,"coef":-0.024,"min":1,"max":5},"EnvironmentSatisfaction":{"mean":2.722,"scale":1.093,"coef":-0.373,"min":1,"max":4},"JobInvolvement":{"mean":2.73,"scale":0.7113,"coef":-0.352,"min":1,"max":4},"JobLevel":{"mean":2.064,"scale":1.107,"coef":-0.196,"min":1,"max":5},"JobSatisfaction":{"mean":2.729,"scale":1.102,"coef":-0.36,"min":1,"max":4},"MonthlyIncome":{"mean":6503,"scale":4706,"coef":-0.18,"min":1009,"max":19999},"NumCompaniesWorked":{"mean":2.693,"scale":2.497,"coef":0.325,"min":0,"max":9},"PercentSalaryHike":{"mean":15.21,"scale":3.659,"coef":-0.087,"min":11,"max":25},"PerformanceRating":{"mean":3.154,"scale":0.3607,"coef":0.034,"min":3,"max":4},"RelationshipSatisfaction":{"mean":2.712,"scale":1.081,"coef":-0.219,"min":1,"max":4},"StockOptionLevel":{"mean":0.7939,"scale":0.8518,"coef":-0.442,"min":0,"max":3},"TotalWorkingYears":{"mean":11.28,"scale":7.778,"coef":-0.449,"min":0,"max":40},"TrainingTimesLastYear":{"mean":2.799,"scale":1.289,"coef":-0.198,"min":0,"max":6},"WorkLifeBalance":{"mean":2.761,"scale":0.7062,"coef":-0.183,"min":1,"max":4},"YearsAtCompany":{"mean":7.008,"scale":6.124,"coef":0.278,"min":0,"max":40},"YearsInCurrentRole":{"mean":4.229,"scale":3.622,"coef":-0.372,"min":0,"max":18},"YearsSinceLastPromotion":{"mean":2.188,"scale":3.221,"coef":0.431,"min":0,"max":15},"YearsWithCurrManager":{"mean":4.123,"scale":3.567,"coef":-0.306,"min":0,"max":17}},"cat":{"BusinessTravel":{"Non-Travel":-0.479,"Travel_Frequently":0.559,"Travel_Rarely":-0.082},"Department":{"Human Resources":0.026,"Research & Development":-0.264,"Sales":0.237},"EducationField":{"Human Resources":0.1,"Life Sciences":-0.18,"Marketing":0.125,"Medical":-0.245,"Other":-0.161,"Technical Degree":0.36},"JobRole":{"Healthcare Representative":-0.243,"Human Resources":0.066,"Laboratory Technician":0.452,"Manager":-0.023,"Manufacturing Director":-0.174,"Research Director":-0.186,"Research Scientist":-0.183,"Sales Executive":-0.063,"Sales Representative":0.352},"OverTime":{"No":-0.752,"Yes":0.751}},"catbase":{"BusinessTravel":-0.001,"Department":-0.099,"EducationField":-0.113,"JobRole":0.001,"OverTime":-0.327},"catdef":{"BusinessTravel":"Travel_Rarely","Department":"Research & Development","EducationField":"Life Sciences","JobRole":"Sales Executive","OverTime":"No"},"medians":{"DistanceFromHome":7,"Education":3,"EnvironmentSatisfaction":3,"JobInvolvement":3,"JobLevel":2,"JobSatisfaction":3,"MonthlyIncome":4919,"NumCompaniesWorked":2,"PercentSalaryHike":14,"PerformanceRating":3,"RelationshipSatisfaction":3,"StockOptionLevel":1,"TotalWorkingYears":10,"TrainingTimesLastYear":3,"WorkLifeBalance":3,"YearsAtCompany":5,"YearsInCurrentRole":3,"YearsSinceLastPromotion":1,"YearsWithCurrManager":3},"hi":0.418,"mid":0.192,"base_rate":0.161,"cv_auc":0.829,"top10_prec":0.714,"n":1470,"roleKey":"JobRole","deptKey":"Department","name":"IBM HR","fix":[{"k":"OverTime","type":"set","v":"No","from":["Yes"]},{"k":"BusinessTravel","type":"set","v":"Travel_Rarely","from":["Travel_Frequently"]},{"k":"JobSatisfaction","type":"up"},{"k":"EnvironmentSatisfaction","type":"up"},{"k":"WorkLifeBalance","type":"up"},{"k":"JobInvolvement","type":"up"},{"k":"RelationshipSatisfaction","type":"up"},{"k":"StockOptionLevel","type":"max","v":1},{"k":"YearsSinceLastPromotion","type":"min","v":2},{"k":"PercentSalaryHike","type":"max","v":15},{"k":"MonthlyIncome","type":"mul","v":1.1},{"k":"TrainingTimesLastYear","type":"max","v":3},{"k":"DistanceFromHome","type":"min","v":10}]}),
Object.assign({id:'atlas'}, {"intercept":-2.15,"num":{"DistanceFromHome":{"mean":22.5,"scale":12.81,"coef":-0.103,"min":1,"max":45},"Education":{"mean":2.913,"scale":1.024,"coef":-0.093,"min":1,"max":5},"Salary":{"mean":113000,"scale":103300,"coef":-0.001,"min":20387,"max":547204},"StockOptionLevel":{"mean":0.7939,"scale":0.8518,"coef":-0.449,"min":0,"max":3},"YearsAtCompany":{"mean":4.563,"scale":3.287,"coef":-0.074,"min":0,"max":10},"YearsInCurrentRole":{"mean":2.293,"scale":2.538,"coef":0.119,"min":0,"max":10},"YearsSinceLastPromotion":{"mean":3.441,"scale":2.944,"coef":-1.104,"min":0,"max":10},"YearsWithCurrManager":{"mean":2.239,"scale":2.505,"coef":-0.23,"min":0,"max":10}},"cat":{"BusinessTravel":{"Frequent Traveller":0.651,"No Travel":-0.654,"Some Travel":-0.031},"Department":{"Human Resources":-0.151,"Sales":0.579,"Technology":-0.462},"EducationField":{"Business Studies":0.736,"Computer Science":-0.063,"Economics":-0.529,"Human Resources":0.687,"Information Systems":-0.196,"Marketing":-0.362,"Other":-0.561,"Technical Degree":0.255},"JobRole":{"Analytics Manager":-0.176,"Data Scientist":1.337,"Engineering Manager":-0.909,"HR Business Partner":-0.646,"HR Executive":-0.394,"HR Manager":-0.255,"Machine Learning Engineer":-0.472,"Manager":-0.832,"Recruiter":1.143,"Sales Executive":0.096,"Sales Representative":0.948,"Senior Software Engineer":-0.384,"Software Engineer":0.508},"OverTime":{"No":-0.813,"Yes":0.779}},"catbase":{"BusinessTravel":0.034,"Department":-0.133,"EducationField":-0.148,"JobRole":0.267,"OverTime":-0.362},"catdef":{"BusinessTravel":"Some Travel","Department":"Technology","EducationField":"Computer Science","JobRole":"Sales Executive","OverTime":"No"},"medians":{"DistanceFromHome":22,"Education":3,"Salary":71199.5,"StockOptionLevel":1,"YearsAtCompany":4,"YearsInCurrentRole":1,"YearsSinceLastPromotion":3,"YearsWithCurrManager":1},"hi":0.449,"mid":0.191,"base_rate":0.161,"cv_auc":0.842,"top10_prec":0.653,"n":1470,"roleKey":"JobRole","deptKey":"Department","name":"Atlas Lab","fix":[{"k":"OverTime","type":"set","v":"No","from":["Yes"]},{"k":"BusinessTravel","type":"set","v":"Some Travel","from":["Frequent Traveller"]},{"k":"StockOptionLevel","type":"max","v":1},{"k":"Salary","type":"mul","v":1.1}]}),
Object.assign({id:'industry'}, {"intercept":-0.16,"num":{"YearsAtCompany":{"mean":15.72,"scale":11.22,"coef":-0.168,"min":1,"max":51},"MonthlyIncome":{"mean":7345,"scale":2597,"coef":-0.003,"min":1226,"max":50030},"NumberOfPromotions":{"mean":0.8329,"scale":0.9953,"coef":-0.212,"min":0,"max":4},"DistanceFromHome":{"mean":49.99,"scale":28.15,"coef":0.244,"min":1,"max":99},"CompanyTenureInMonths":{"mean":55.72,"scale":24.98,"coef":-0.003,"min":2,"max":128}},"cat":{"JobRole":{"Education":0.05,"Finance":-0.049,"Healthcare":-0.037,"Media":-0.069,"Technology":-0.051},"WorkLifeBalance":{"Excellent":-0.703,"Fair":0.419,"Good":-0.462,"Poor":0.59},"JobSatisfaction":{"High":-0.259,"Low":0.166,"Medium":-0.229,"Very High":0.167},"PerformanceRating":{"Average":-0.252,"Below Average":0.037,"High":-0.235,"Low":0.295},"Overtime":{"No":-0.224,"Yes":0.069},"EducationLevel":{"Associate Degree":0.228,"Bachelors Degree":0.246,"High School":0.234,"Masters Degree":0.236,"PhD":-1.099},"JobLevel":{"Entry":0.989,"Mid":0.125,"Senior":-1.269},"CompanySize":{"Large":-0.104,"Medium":-0.118,"Small":0.067},"RemoteWork":{"No":0.679,"Yes":-0.834},"LeadershipOpportunities":{"No":0.013,"Yes":-0.168},"InnovationOpportunities":{"No":-0.015,"Yes":-0.14},"CompanyReputation":{"Excellent":-0.301,"Fair":0.129,"Good":-0.332,"Poor":0.348},"EmployeeRecognition":{"High":-0.038,"Low":0.002,"Medium":-0.009,"Very High":-0.111}},"catbase":{"JobRole":-0.029,"WorkLifeBalance":-0.092,"JobSatisfaction":-0.124,"PerformanceRating":-0.178,"Overtime":-0.129,"EducationLevel":0.168,"JobLevel":0.189,"CompanySize":-0.06,"RemoteWork":0.39,"LeadershipOpportunities":0.004,"InnovationOpportunities":-0.036,"CompanyReputation":-0.099,"EmployeeRecognition":-0.017},"catdef":{"JobRole":"Technology","WorkLifeBalance":"Good","JobSatisfaction":"High","PerformanceRating":"Average","Overtime":"No","EducationLevel":"Bachelors Degree","JobLevel":"Entry","CompanySize":"Medium","RemoteWork":"No","LeadershipOpportunities":"No","InnovationOpportunities":"No","CompanyReputation":"Good","EmployeeRecognition":"Low"},"medians":{"YearsAtCompany":13,"MonthlyIncome":7348,"NumberOfPromotions":1,"DistanceFromHome":50,"CompanyTenureInMonths":56},"hi":0.81,"mid":0.646,"base_rate":0.475,"cv_auc":0.787,"top10_prec":0.868,"n":74498,"roleKey":"JobRole","deptKey":"JobRole","name":"Industry survey","fix":[{"k":"Overtime","type":"set","v":"No","from":["Yes"]},{"k":"RemoteWork","type":"set","v":"Yes","from":["No"]},{"k":"WorkLifeBalance","type":"up","order":["Poor","Fair","Good","Excellent"]},{"k":"JobSatisfaction","type":"up","order":["Low","Medium","High","Very High"]},{"k":"EmployeeRecognition","type":"up","order":["Low","Medium","High","Very High"]},{"k":"LeadershipOpportunities","type":"set","v":"Yes","from":["No"]},{"k":"InnovationOpportunities","type":"set","v":"Yes","from":["No"]},{"k":"MonthlyIncome","type":"mul","v":1.1},{"k":"NumberOfPromotions","type":"up"},{"k":"DistanceFromHome","type":"min","v":10}]})
];
const MODELS_BY_ID={};
MODELS.forEach(m=>{MODELS_BY_ID[m.id]=m;});

/* ===== FIELD LABELS, VALUES, REASONS, ADVICE ===== */
const FIELD_LABELS={DistanceFromHome:'Distance from home',Education:'Education level',EnvironmentSatisfaction:'Environment satisfaction',JobInvolvement:'Job involvement',JobLevel:'Job level',JobSatisfaction:'Job satisfaction',MonthlyIncome:'Monthly income',NumCompaniesWorked:'Companies worked',PercentSalaryHike:'Salary hike',PerformanceRating:'Performance rating',RelationshipSatisfaction:'Relationship satisfaction',StockOptionLevel:'Stock option level',TotalWorkingYears:'Total working years',TrainingTimesLastYear:'Training times last year',WorkLifeBalance:'Work-life balance',YearsAtCompany:'Years at company',YearsInCurrentRole:'Years in current role',YearsSinceLastPromotion:'Years since last promotion',YearsWithCurrManager:'Years with current manager',Salary:'Salary',NumberOfPromotions:'Promotions',CompanyTenureInMonths:'Tenure at company',BusinessTravel:'Business travel',Department:'Department',EducationField:'Education field',JobRole:'Job role',OverTime:'Overtime',Overtime:'Overtime',EducationLevel:'Education level',CompanySize:'Company size',RemoteWork:'Remote work',LeadershipOpportunities:'Leadership opportunities',InnovationOpportunities:'Innovation opportunities',CompanyReputation:'Company reputation',EmployeeRecognition:'Employee recognition'};
const FIELD_UNITS={DistanceFromHome:'km',PercentSalaryHike:'%',YearsAtCompany:'yrs',YearsInCurrentRole:'yrs',YearsSinceLastPromotion:'yrs',YearsWithCurrManager:'yrs',TotalWorkingYears:'yrs',CompanyTenureInMonths:'mo',TrainingTimesLastYear:'×',NumberOfPromotions:'×',NumCompaniesWorked:'×'};
const VALUE_LABELS={
 Education:{1:'Below college',2:'College',3:'Bachelor',4:'Master',5:'Doctor'},
 PerformanceRating:{3:'Excellent',4:'Outstanding'},
 StockOptionLevel:{0:'None',1:'Level 1',2:'Level 2',3:'Level 3'},
 JobLevel:{1:'Level 1',2:'Level 2',3:'Level 3',4:'Level 4',5:'Level 5',Entry:'Entry',Mid:'Mid',Senior:'Senior'},
 WorkLifeBalance:{Poor:'Poor',Fair:'Fair',Good:'Good',Excellent:'Excellent',1:'Poor',2:'Fair',3:'Good',4:'Excellent'},
 JobSatisfaction:{Low:'Low',Medium:'Medium',High:'High','Very High':'Very high',1:'Low',2:'Fair',3:'Good',4:'Excellent'},
 CompanyReputation:{Poor:'Poor',Fair:'Fair',Good:'Good',Excellent:'Excellent'},
 EmployeeRecognition:{Low:'Low',Medium:'Medium',High:'High','Very High':'Very high'},
 BusinessTravel:{'Non-Travel':'No travel','Travel_Frequently':'Travels frequently','Travel_Rarely':'Travels rarely','Frequent Traveller':'Frequent traveller','No Travel':'No travel','Some Travel':'Some travel'},
 RemoteWork:{No:'No',Yes:'Yes'},LeadershipOpportunities:{No:'No',Yes:'Yes'},InnovationOpportunities:{No:'No',Yes:'Yes'},
 Overtime:{No:'No',Yes:'Yes'},OverTime:{No:'No',Yes:'Yes'},CompanySize:{Small:'Small',Medium:'Medium',Large:'Large'}
};
function valueLabel(field,v){
 const map=VALUE_LABELS[field];
 if(map&&Object.prototype.hasOwnProperty.call(map,v))return map[v];
 return String(v).replace(/_/g,' ');
}
const REASON_NUM={DistanceFromHome:'Long distance from home',Education:'Lower education level',EnvironmentSatisfaction:'Low satisfaction with the work environment',JobInvolvement:'Low job involvement',JobLevel:'Junior job level',JobSatisfaction:'Low job satisfaction',MonthlyIncome:'Lower monthly income',NumCompaniesWorked:'Has worked at many companies',PercentSalaryHike:'Small recent salary hike',PerformanceRating:'Lower performance rating',RelationshipSatisfaction:'Low relationship satisfaction',StockOptionLevel:'Low stock option level',TotalWorkingYears:'Fewer total working years',TrainingTimesLastYear:'Little training last year',WorkLifeBalance:'Poor work-life balance',YearsAtCompany:'New to the company',YearsInCurrentRole:'Little time in current role',YearsSinceLastPromotion:'Long gap since last promotion',YearsWithCurrManager:'Little time with current manager',Salary:'Lower salary',NumberOfPromotions:'Few promotions so far',CompanyTenureInMonths:'Short company tenure'};
const REASON_CAT={
 OverTime:{Yes:'Works regular overtime'},Overtime:{Yes:'Works regular overtime'},
 BusinessTravel:{'Travel_Frequently':'Travels frequently for work','Frequent Traveller':'Travels frequently for work'},
 WorkLifeBalance:{Poor:'Poor work-life balance',Fair:'Fair work-life balance'},
 JobSatisfaction:{Low:'Low job satisfaction'},
 PerformanceRating:{Low:'Low performance rating','Below Average':'Below-average performance rating'},
 EducationLevel:{'High School':'Only high school education','Associate Degree':'Lower education level'},
 JobLevel:{Entry:'Entry-level position'},
 CompanyReputation:{Poor:'Company reputation rated poor',Fair:'Company reputation rated fair'},
 EmployeeRecognition:{Low:'Low employee recognition'},
 RemoteWork:{No:'Does not work remotely'},
 LeadershipOpportunities:{No:'No leadership opportunities'},
 InnovationOpportunities:{No:'No innovation opportunities'}
};
function reasonLabel(model,field,value){
 if(model.num[field])return REASON_NUM[field]||FIELD_LABELS[field]||field;
 const byVal=REASON_CAT[field];
 if(byVal&&Object.prototype.hasOwnProperty.call(byVal,value))return byVal[value];
 if(field===model.roleKey&&field===model.deptKey)return 'Works in '+value;
 if(field===model.roleKey)return 'Role: '+value;
 if(field===model.deptKey)return 'Department: '+value;
 if(field==='EducationField')return 'Studied '+value;
 return (FIELD_LABELS[field]||field)+': '+valueLabel(field,value);
}
const ACTION_ADVICE={OverTime:'Cap overtime and rebalance workload',Overtime:'Cap overtime and rebalance workload',BusinessTravel:'Reduce required business travel',JobSatisfaction:'Improve job satisfaction with regular supportive check-ins',EnvironmentSatisfaction:'Improve the day-to-day work environment',WorkLifeBalance:'Protect work-life balance with flexible hours',JobInvolvement:'Give people more meaningful, involving work',RelationshipSatisfaction:'Improve relationships and team climate',StockOptionLevel:'Grant more stock options as a long-term reward',YearsSinceLastPromotion:'Keep gaps between promotions short',PercentSalaryHike:'Give larger salary hikes to people who earn them',MonthlyIncome:'Raise pay by 10%',Salary:'Raise pay by 10%',TrainingTimesLastYear:'Offer more training each year',DistanceFromHome:'Reduce commute distance with remote work or relocation support',RemoteWork:'Allow remote work',EmployeeRecognition:'Recognize people\'s work more often',LeadershipOpportunities:'Create leadership opportunities and clear growth paths',InnovationOpportunities:'Create room for innovation and new ideas',NumberOfPromotions:'Open up more promotion opportunities',CompanyTenureInMonths:'Support people early in their tenure'};
function actionAdvice(action){return ACTION_ADVICE[action.k]||(action.type==='up'?'Improve '+(FIELD_LABELS[action.k]||action.k).toLowerCase():'Adjust '+(FIELD_LABELS[action.k]||action.k).toLowerCase());}
/* Plain "why it matters" and "how to help" text shown under each reason */
const REASON_WHY={
 OverTime:'Regular overtime is one of the strongest signs of burnout. People who work long hours for months often start looking elsewhere.',
 Overtime:'Regular overtime is one of the strongest signs of burnout. People who work long hours for months often start looking elsewhere.',
 BusinessTravel:'Frequent travel takes time away from home and family, which wears people down over time.',
 DistanceFromHome:'A long commute costs time and energy every day, so a closer or remote job becomes attractive.',
 JobSatisfaction:'People who do not enjoy their daily work are much more open to offers from other companies.',
 EnvironmentSatisfaction:'An uncomfortable or unsupportive workplace makes every day harder and pushes people away.',
 RelationshipSatisfaction:'Weak relationships at work mean less support and less reason to stay.',
 WorkLifeBalance:'When work crowds out personal life, people look for a job that gives them time back.',
 JobInvolvement:'People who feel their work does not matter tend to disengage, and leaving is often the next step.',
 MonthlyIncome:'Pay below what similar people earn makes outside offers easy to accept.',
 Salary:'Pay below what similar people earn makes outside offers easy to accept.',
 PercentSalaryHike:'A small raise can feel like a lack of recognition, even when overall pay is fair.',
 StockOptionLevel:'Without long-term rewards like stock options, there is little financial reason to stay for years.',
 YearsSinceLastPromotion:'A long wait for promotion makes people feel stuck, so they look for growth elsewhere.',
 NumberOfPromotions:'Few promotions can signal limited growth, which pushes ambitious people to move on.',
 TrainingTimesLastYear:'Little training means slower growth, and people who want to learn may leave to do so.',
 NumCompaniesWorked:'People who have changed jobs often in the past are statistically more likely to move again.',
 TotalWorkingYears:'Early-career people change jobs more often while they explore their path.',
 YearsAtCompany:'Newer employees have fewer ties to the company and leave more easily.',
 CompanyTenureInMonths:'Newer employees have fewer ties to the company and leave more easily.',
 YearsInCurrentRole:'Little time in a role can mean the person is still settling in or unsure about the fit.',
 YearsWithCurrManager:'A new manager relationship has not yet built the trust that keeps people in a team.',
 JobLevel:'Junior roles usually come with lower pay and less influence, so people move up by moving out.',
 Education:'In the training data, this education level was linked with leaving more often.',
 EducationLevel:'In the training data, this education level was linked with leaving more often.',
 EducationField:'In the training data, people from this field of study left more often, often because other industries compete for them.',
 PerformanceRating:'Performance feedback that feels low or unfair can make people lose motivation.',
 EmployeeRecognition:'When good work goes unnoticed, people feel undervalued.',
 CompanyReputation:'If people do not feel proud of where they work, a better-known employer is tempting.',
 RemoteWork:'Many people now expect some remote work, and roles without it lose people to companies that offer it.',
 LeadershipOpportunities:'Without a path to lead, ambitious people look for one elsewhere.',
 InnovationOpportunities:'People who want to try new ideas leave when there is no room for them.',
 CompanySize:'In the training data, people at companies of this size left more often.'
};
const REASON_HELP={
 JobRole:'Check whether this role has a heavier workload or a busier job market than others, and review pay and growth paths for the role.',
 Department:'Ask the team what makes work harder in this department, and fix the most common issue first.',
 EducationField:'Offer projects that use their skills, and show a clear path for growth inside the company.',
 Education:'Offer learning support, such as courses or tuition help, and a clear growth path.',
 EducationLevel:'Offer learning support, such as courses or tuition help, and a clear growth path.',
 JobLevel:'Explain the path to the next level, with clear steps and a realistic timeline.',
 NumCompaniesWorked:'Build an early connection: a mentor, regular check-ins and a visible career plan.',
 TotalWorkingYears:'Pair them with a mentor and agree on a development plan for the next year.',
 YearsAtCompany:'Make onboarding strong: a buddy, regular check-ins and early wins in the first months.',
 CompanyTenureInMonths:'Make onboarding strong: a buddy, regular check-ins and early wins in the first months.',
 YearsInCurrentRole:'Check in on how the role fits, and clarify what success looks like.',
 YearsWithCurrManager:'Encourage regular one-to-ones with the new manager to build trust quickly.',
 PerformanceRating:'Give clear, fair feedback and agree on concrete support to improve.',
 CompanyReputation:'Share the company\'s goals and successes, and listen to what would make them proud to work here.',
 CompanySize:'Give a clear voice in decisions and visible recognition, so they feel seen whatever the company size.'
};
function explainReason(m,emp,r,p){
 const action=m.fix.find(a=>a.k===r.field);
 let drop=0,np=p;
 if(action){np=scoreEmployee(m,applyAction(m,emp,action));drop=p-np;}
 const help=action?actionAdvice(action)+'.':(REASON_HELP[r.field]||'Talk openly about this topic and agree on one small step that would help.');
 const why=REASON_WHY[r.field]||'In the training data, this was linked with people leaving more often.';
 return {why,help,drop,np,changeable:!!action};
}
const TALK_POINTS=[
 {re:/overtime/i,text:'Ask how the workload feels lately and whether overtime is manageable.'},
 {re:/promotion/i,text:'Discuss a path to promotion and what they need to get there.'},
 {re:/satisfaction/i,text:'Ask what would make the work more enjoyable day to day.'},
 {re:/work.?life/i,text:'Ask about work-life balance and what flexibility would help.'},
 {re:/income|salary|hike/i,text:'Review pay against the market together, openly.'},
 {re:/training/i,text:'Ask what training or learning would help them grow.'},
 {re:/recognition/i,text:'Ask what recognition would mean to them.'},
 {re:/relationship|manager/i,text:'Ask about the working relationship with their manager.'},
 {re:/distance/i,text:'Ask about the commute and whether remote work would help.'},
 {re:/travel/i,text:'Ask how business travel affects them and their family.'},
 {re:/stock/i,text:'Explain stock options and other long-term rewards.'},
 {re:/involvement/i,text:'Ask what kind of work would feel more meaningful to them.'},
 {re:/leadership/i,text:'Ask about their leadership and growth ambitions.'},
 {re:/innovation/i,text:'Ask what ideas they would like room to try.'},
 {re:/remote/i,text:'Ask about their ideal remote-work setup.'},
 {re:/performance/i,text:'Ask what support they need to do their best work.'},
 {re:/./,text:'Check in on how settled and valued they feel in the team.'}
];
function buildTalkGuide(fields){
 const points=[];const seen=new Set();
 fields.forEach(f=>{const tp=TALK_POINTS.find(x=>x.re.test(f));if(tp&&!seen.has(tp.text)){seen.add(tp.text);points.push(tp.text);}});
 if(points.length<3)points.push('Ask openly how things are going and what support they need.');
 points.push('Thank them for their openness and agree on one small next step together.');
 return points.slice(0,5);
}
const FORM_GROUPS=[
 ['Role & background',['JobRole','Department','EducationField','EducationLevel','Education','JobLevel','CompanySize']],
 ['Work style',['BusinessTravel','OverTime','Overtime','RemoteWork']],
 ['Satisfaction & performance',['JobSatisfaction','EnvironmentSatisfaction','RelationshipSatisfaction','WorkLifeBalance','EmployeeRecognition','CompanyReputation','PerformanceRating']],
 ['Pay & rewards',['MonthlyIncome','Salary','PercentSalaryHike','StockOptionLevel']],
 ['Time & growth',['YearsAtCompany','YearsInCurrentRole','YearsSinceLastPromotion','YearsWithCurrManager','TotalWorkingYears','NumCompaniesWorked','NumberOfPromotions','TrainingTimesLastYear','CompanyTenureInMonths','DistanceFromHome','LeadershipOpportunities','InnovationOpportunities']]
];
