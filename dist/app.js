'use strict';

const $ = id => document.getElementById(id);
const marks = {
  camera:'<path d="M3 7h4l2-3h6l2 3h4v13H3z"/><circle cx="12" cy="13" r="3.5"/>',
  book:'<path d="M3 4.5c3.7-.9 6.4-.2 9 1.5 2.6-1.7 5.3-2.4 9-1.5v14c-3.7-.9-6.4-.2-9 1.5-2.6-1.7-5.3-2.4-9-1.5z"/><path d="M12 6v14"/>',
  grid:'<rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/>',
  note:'<path d="M6 3h13a1 1 0 0 1 1 1v16a1 1 0 0 1-1 1H6zM9 3v18M4 7h3M4 12h3M4 17h3"/>',
  globe:'<circle cx="12" cy="12" r="9"/><ellipse cx="12" cy="12" rx="4" ry="9"/><path d="M3 12h18"/>',
  user:'<circle cx="12" cy="8.5" r="3.2"/><path d="M5.5 20c.5-7.5 12.5-7.5 13 0"/>',
  home:'<path d="m3 10 9-7 9 7M5.5 9v11h5v-6h3v6h5V9"/>',
  chev:'<path d="m9 6 6 6-6 6"/>',arrow:'<path d="M4 12h15m-6-6 6 6-6 6"/>',
  cap:'<path d="m2 9 10-5 10 5-10 5zM6 11v5c3 3 9 3 12 0v-5m3-1v6"/>',
  clock:'<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3.5 2"/>',
  math:'<rect x="5" y="2" width="14" height="20" rx="2"/><path d="M8 6h8M8 11h2m4 0h2m-8 4h2m4 0h2m-8 4h2m4 0h2"/>',
  compass:'<circle cx="12" cy="12" r="9"/><path d="m16 8-2.4 5.6L8 16l2.4-5.6z"/>',
  group:'<circle cx="9" cy="7.5" r="3"/><path d="M2.8 20v-2c0-6.1 12.4-6.1 12.4 0v2zM16 5a3.1 3.1 0 0 1 0 6M17.5 14c3.3.4 4.2 2.3 4.2 5.4"/>',
  pizza:'<path d="m3 7 8.8 14L21 4.7C15 .8 7.8 2.2 3 7Z"/><path d="M4.5 9c4.3-4 9.6-5 15.1-2.1"/><circle cx="10" cy="10.4" r="1.2"/><circle cx="13.6" cy="13" r="1.1"/>',
  wallet:'<path d="M4 7V5.7a2 2 0 0 1 1.5-2L17 2.4l.5 4.6"/><rect x="3" y="7" width="18" height="14" rx="2"/><path d="M21 11h-6a3 3 0 0 0 0 6h6"/><circle cx="15.6" cy="14" r=".5"/>',
  bookmark:'<path d="M6 3h12v18l-6-4-6 4z"/>',
  edit:'<path d="m4 15 11-11a2.5 2.5 0 0 1 4 4L8 19l-5 1zM13 6l4 4"/>',
  light:'<path d="M8.5 15.5c0-2-3-3-3-7a6.5 6.5 0 1 1 13 0c0 4-3 5-3 7zM9 18h6m-5 3h4"/>',
  check:'<path d="m4.5 12 4.5 4.5L19.5 6"/>',
  spark:'<path d="m12 2 2.7 6.8L21 12l-6.3 2.8L12 22l-3-7.2L2 12l7-3.2z"/>',
  steps:'<path d="M3 19h5v-5h5V9h5V4h3"/>',
  x:'<path d="m6 6 12 12M18 6 6 18"/>',
  send:'<path d="m3 10 18-7-7 18-2.7-8.3zM11.3 12.7 21 3"/>',
  flag:'<path d="M5 21V3m0 1c5-4 9 4 15 0v10c-6 4-10-4-15 0"/>',
  down:'<path d="m5 9 7 7 7-7"/>',
};
function icon(name, extra='') {
  return '<svg aria-hidden="true" class="icon '+extra+'" viewBox="0 0 24 24">'+marks[name]+'</svg>';
}
function safe(value) {
  return String(value??'').replace(/[&<>"']/g, char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
}

const key='alloprof-lunch-rush-v2';
const isReload=performance.getEntriesByType('navigation')[0]?.type==='reload';
const onLocalhost=['localhost','127.0.0.1','[::1]'].includes(location.hostname);
const allyEndpoint=onLocalhost ? (location.port==='3000'?'http://127.0.0.1:3107/api/ally':null) :
  (location.protocol==='https:'?'/api/ally':null);
function removeLegacyChats(storage,activityKey){
  const saved=JSON.parse(storage.getItem(activityKey));
  if(!saved || !Object.hasOwn(saved,'chats'))return;
  const {chats,...activity}=saved;
  storage.setItem(activityKey,JSON.stringify(activity));
}
function clearStoredChats(){
  // Older versions included screenshot and message history in the activity save.
  for(const activityKey of [key,'alloprof-pizza-studio-v1']){
    try {
      if(onLocalhost)removeLegacyChats(localStorage,activityKey);
      else localStorage.removeItem(activityKey);
    } catch {}
  }
  try {
    sessionStorage.removeItem(key+'-tab-chat');
    if(onLocalhost)removeLegacyChats(sessionStorage,key);
    else sessionStorage.removeItem(key);
  } catch {}
}

const startingSkills={
  unknown:['Still figuring it out','Je ne sais pas encore'],
  pairs:['I can count in twos','Je sais compter par deux'],
  doubles:['I can double a number','Je sais doubler un nombre'],
  prices:['I can add prices','Je sais additionner des prix']
};
function tutorProfile(prefs={}){
  const age=Number(prefs.age);
  return {age:Number.isInteger(age)&&age>=5&&age<=18?age:8,
    skill:Object.hasOwn(startingSkills,prefs.skill)?prefs.skill:'unknown'};
}
function profileFields(){
  const ageLabel=tr('Practice learner age','Âge de l’élève pour cet essai');
  const skillLabel=tr('What I already know','Ce que je sais déjà faire');
  const ages=Array.from({length:14},(_,i)=>i+5).map(age=>'<option '+(age===state.learner.age?'selected':'')+'>'+age+'</option>').join('');
  const skills=Object.entries(startingSkills).map(([id,label])=>'<option value="'+id+'" '+(id===state.learner.skill?'selected':'')+'>'+tr(...label)+'</option>').join('');
  return '<div class="learner-fields"><label>'+ageLabel+'<select id="coach-age">'+ages+'</select></label><label>'+skillLabel+'<select id="coach-skill">'+skills+'</select></label></div>';
}
function comparePizzas(selected=[]){
  const products=[...new Set(selected.map(Number).filter(i=>pizzas[i]))];
  const choices=products.includes(0)&&products.includes(2)?[0,2]:products.length>=2?products:products.length===1?[products[0],products[0]===2?0:2]:[0,2];
  const [a,b]=choices.map(i=>pizzas[i]);
  const first=productName(choices[0]),second=productName(choices[1]);
  if(state.learner.skill==='prices')return [
    first+' costs $'+a.cost+' and '+second+' costs $'+b.cost+'. Now compare their cheese slices: '+a.cheese+' or '+b.cheese+'. Which helps the cheese-only table more?',
    first+' coûte '+a.cost+' $ et '+second+' coûte '+b.cost+' $. Compare leurs pointes au fromage : '+a.cheese+' ou '+b.cheese+'. Laquelle aide le plus la table fromage?'];
  if(state.learner.skill==='pairs'||state.learner.skill==='doubles')return [
    'Count in twos: '+first+' has '+a.cheese+' cheese slices and '+second+' has '+b.cheese+'. How many cheese plates can each fill?',
    'Compte par deux : '+first+' a '+a.cheese+' pointes au fromage et '+second+' en a '+b.cheese+'. Combien d’assiettes chaque pizza peut-elle remplir?'];
  return [first+' has '+a.cheese+' cheese slices; '+second+' has '+b.cheese+'. Put two on each plate. Which fills more cheese plates?',
    first+' a '+a.cheese+' pointes au fromage et '+second+' en a '+b.cheese+'. Mets-en deux par assiette. Laquelle remplit le plus d’assiettes?'];
}

function menuComparison(message){
  const input=message.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'');
  if(sectionPhase()>=2||!/compar/.test(input)||/prix|price|cost|budget|total|fee|frais|commande|orders?|trays?|tables?/.test(input))return null;
  const named=pizzas.flatMap((p,i)=>p.name.some(name=>input.includes(name.toLowerCase()))?[i]:[]);
  const item=allyArea.current();
  if(named.length<2 && item && !(item.products?.length || ['brief','pizza','order'].includes(item.kind)))return null;
  const general=/^(how (can|do|should) i compare (these|them|the pizzas)|comment (les |puis-je les )?comparer( ces pizzas)?)[ ?. !]*$/.test(input);
  if(!general && named.length<2)return null;
  return comparePizzas(named.length>=2?named:item?.products||[]);
}

function mathContext(entry,screenshot,lang){
  const stock=tally();
  const work=[];
  if(state.first)work.push({observation:'Reserved a valid first order',quantities:state.first,totals:tally(state.first)});
  if(served())work.push({observation:'Placed two-slice portions at tables',childrenServed:served(),trays:state.trays});
  const selected=screenshot?.context;
  const conversation=state.chats.slice(0,guideStep()+1).flatMap((step,phase)=>step.filter(item=>item!==entry).slice(-6).map(item=>({
    phase,student:item.question?.[lang],screenshot:item.description?.slice(0,420),tutor:item.reply?.[lang]
  }))).slice(-10);
  return {
    language:state.lang,exercise:title(), phase:['First order','More guests','Serve lunch','Finished'][sectionPhase()],
    learner:{practiceAge:state.learner.age,reportedStartingSkill:startingSkills[state.learner.skill][lang],observedActions:work,
      studentScratchpad:state.note.slice(0,1400)},
    rules:{children:guests(),slicesPerChild:2,requiredSlices:guests()*2,cheeseOnlyChildren:tableSizes()[0],
      minimumCheeseSlices:tableSizes()[0]*2,budget,allocation:'Only the cheese-only children require cheese. Everyone else may take either topping.',delivery:'$4 once per order containing at least one half-and-half pizza',
      success:'Serve every child two slices, respect the cheese-only table, and spend no more than the budget.'},
    currentOrder:{quantities:sectionCart(),totals:stock,stillNeedSlices:Math.max(0,guests()*2-stock.slices),
      stillNeedCheese:Math.max(0,tableSizes()[0]*2-stock.cheese),budgetRemaining:budget-stock.cost,trays:state.trays},
    menu:pizzas,selectedArea:selected?{kind:selected.kind,menuItems:(selected.products||[]).map(i=>pizzas[i]?.name[lang]),atCapture:screenshot?.description}:null,
    recentConversation:conversation
  };
}
function loadState(){
  const base={learner:tutorProfile(),lang:'en',saved:false,note:'',chats:[[],[],[]],...emptyShift()};
  if(!onLocalhost)return base;
  try{
    const storage=sessionStorage;
    // New or restored tabs can inherit sessionStorage. Only a refresh resumes the local attempt.
    if(!isReload){
      storage.removeItem(key);
      return base;
    }
    const current=JSON.parse(storage.getItem(key))||{};
    const prefs=current;
    base.learner=tutorProfile(prefs.learner||{});
    base.lang=prefs.lang==='fr'?'fr':'en';base.note=typeof prefs.note==='string'?prefs.note:'';base.saved=prefs.saved===true;
    const basket=value=>Array.isArray(value)&&value.length===3&&value.every(n=>Number.isInteger(n)&&n>=0&&n<=12);
    if(!basket(current.cart)||!Number.isInteger(current.phase)||current.phase<0||current.phase>3)return base;
    if(current.phase>0&&!basket(current.first))return base;
    const trays=current.trays;
    if(!Array.isArray(trays)||trays.length!==3||!trays.every((p,i)=>Array.isArray(p)&&p.length===2&&p.every(n=>Number.isInteger(n)&&n>=0)&&p[0]+p[1]<=[8,6,8][i]))return base;
    const stock=tally(current.cart);
    if(trays[0][1]||trays.reduce((s,p)=>s+p[0]*2,0)>stock.cheese||trays.reduce((s,p)=>s+p[1]*2,0)>stock.pep)return base;
    return {...base,cart:current.cart,phase:current.phase,trays,first:current.first,quote:basket(current.quote)?current.quote:null,
      topping:current.topping===1?1:0,batch:current.batch==='one'?'one':'all',
      undo:Array.isArray(current.undo)?current.undo.filter(snapshot=>Array.isArray(snapshot)&&snapshot.length===3&&snapshot.every(p=>Array.isArray(p)&&p.length===2&&p.every(Number.isInteger))):[]};
  }catch{return base;}
}
clearStoredChats();
let state=loadState();
const tr=(en,fr)=>state.lang==='fr'?fr:en;
const title=()=>tr('Pizza lunch rush','Coup de feu à la pizzeria');
const money=n=>tr('$'+n,n+' $');

const coachName=()=>tr('Ally, your learning guide','Ally, ton guide');
const act=(action,content,style='text-btn',extra='')=>'<button type="button" class="'+style+'" data-action="'+action+'" '+extra+'>'+content+'</button>';
function localSave(){
  if(!onLocalhost)return true;
  const {chats,...activity}=state;
  try{sessionStorage.setItem(key,JSON.stringify(activity));return true;}catch{return false;}
}
let guideOpen=false,modalKind='',lastFocus=null;
const guideStep=()=>Math.min(2,sectionPhase());
function renderShell(){
  document.documentElement.lang=state.lang;document.title=title()+' | Alloprof';
  $('skip').textContent=tr('Skip to the counter','Aller au comptoir');
const home='https://www.alloprof.qc.ca/'+tr('en/students','fr/eleves');
  const teacherDashboard=onLocalhost && location.port==='3000' ? 'http://'+location.hostname+':3001/#classes' : './teacher/index.html#classes';
  const teacherLabel=tr('Teacher dashboard','Tableau de bord enseignant');
  $('header').innerHTML='<div class="head-inner"><div class="brand"><a href="'+home+'" target="_blank" rel="noopener" aria-label="Alloprof"><img src="./assets/alloprof.svg" alt="Alloprof" width="139" height="30"></a><a class="student-tag" href="'+teacherDashboard+'" title="'+teacherLabel+'" aria-label="'+tr('Student zone','Zone élèves')+' · '+teacherLabel+'">'+tr('Student zone','Zone élèves')+'</a></div><nav class="primary-nav" aria-label="'+tr('Main navigation','Navigation principale')+'">'+act('library',icon('grid')+tr('Activities','Activités'),'nav-item active')+act('notebook',icon('note')+tr('My notebook','Mon cahier'),'nav-item')+'</nav><div class="header-end">'+act('language',icon('globe')+tr('FR','EN'),'lang-btn','aria-label="'+tr('Passer au français','Switch to English')+'"')+act('profile',icon('user'),'avatar','aria-label="'+tr('Student workspace','Espace élève')+'"')+'</div></div>';
  $('crumbs').innerHTML='<a href="'+home+'" target="_blank" rel="noopener" aria-label="'+tr('Student home','Accueil des élèves')+'">'+icon('home','home-icon')+'</a>'+icon('chev')+'<a href="'+home+tr('/vl/mathematics','/bv/mathematiques')+'" target="_blank" rel="noopener">'+tr('Mathematics','Mathématiques')+'</a>'+icon('chev')+act('library',tr('Activities','Activités'),'crumb-btn')+icon('chev')+'<b>'+title()+'</b>';

  $('hero-info').innerHTML='<h1 id="page-title">'+title()+'</h1>';
  $('footer').innerHTML=act('save',(state.saved?icon('check'):icon('bookmark'))+tr(state.saved?'Activity saved':'Save activity',state.saved?'Activité enregistrée':'Enregistrer l’activité'),'bookmark','aria-pressed="'+state.saved+'"');
  renderShift();renderGuide();
}
function guideReply(kind,message){
  const n=tally(), r=outcome(), prior=state.chats[guideStep()].length;
  const m=message.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'');
  if(sectionPhase()<2 && /compar|which (pizza|one)|laquelle/.test(m))return comparePizzas(allyArea.current()?.products||[]);
  if(!n.slices && /\$0\b|\b0\s*\$|total.*\b(?:zero|0)\b/.test(m))return ['Your total is $0 because your order is empty.', 'Ton total est de 0 $ car ta commande est vide.'];
  if(kind==='example')return ['Four slices give two kids two each.', 'Quatre pointes donnent deux pointes à chaque enfant.'];
  if(sectionPhase()===3)return ['Which swap could leave fewer slices?', 'Quel échange laisserait moins de pointes?'];
  if(sectionPhase()===2){
    if(/budget|cost|prix|cher/.test(m))return ['Which order costs less?', 'Quelle commande coûte moins cher?'];
    const left=tableSizes()[0]-servedAt(0);
    if(left)return ['Can you serve '+left+' kids with '+remaining(0)+' cheese portions?', 'Peux-tu servir '+left+' enfants avec '+remaining(0)+' portions au fromage?'];
    return ['Which table still has an empty seat?', 'À quelle table reste-t-il une place?'];
  }
  if(/fee|budget|cost|prix|frais|livraison|delivery/.test(m)||r.over)return ['Does your $'+n.cost+' order fit the $80 budget?', 'Tes 80 $ suffisent-ils pour payer '+n.cost+' $?'];
  if(/give.{0,15}answer|solve it|donne.{0,12}reponse|what.{0,10}buy|quoi acheter/.test(m))return ['Which pizza could feed the cheese-only guests?', 'Quelle pizza conviendrait aux personnes qui mangent seulement du fromage?'];
  if((kind==='check'||/cheese|fromage|veget/.test(m))&&n.cheese<tableSizes()[0]*2)return ['How many pairs can you make with '+n.cheese+' cheese slices?', 'Combien de paires peux-tu faire avec '+n.cheese+' pointes au fromage?'];
  if(sectionPhase()===1&&prior===0&&kind==='hint')return ['How many cheese slices do two more kids need?', 'Combien de pointes au fromage faut-il pour deux enfants de plus?'];
  if(kind==='check'||/slice|pointe|portion/.test(m))return ['Can '+guests()+' kids get two slices each from '+n.slices+' slices?', 'Avec '+n.slices+' pointes pour '+guests()+' enfants, chacun en aura-t-il deux?'];
  if(prior%2)return ['What changes if you swap one pizza?', 'Si tu changes une pizza, que devient le total?'];
  return ['Which slices would you save for the cheese-only table?', 'Quelles pointes garderais-tu pour la table qui veut seulement du fromage?'];
}
function saveChatEntry(entry){
  const history=state.chats[guideStep()];
  history.push(entry);
  if(history.length>30)history.shift();
}
const pendingReplies=new WeakSet();
function answerScreenshot(entry){
  const history=state.chats[guideStep()];
  entry.reply=allyArea.reply('','hint') || guideReply('hint','');
  if(allyEndpoint){
    pendingReplies.add(entry);
    requestAllyReply(history,entry,tr(
      'Give one short tutoring hint about the selected part of this activity.',
      'Donne un court indice sur la partie sélectionnée de cette activité.'
    ));
  }
  const draft=$('message').value;
  renderGuide();$('message').value=draft;$('message').focus({preventScroll:true});
}
function addChat(message){
  const history=state.chats[guideStep()];
  if(history.some(entry=>pendingReplies.has(entry)))return;
  const kind=/example|exemple/i.test(message)?'example':/check|vérifi/i.test(message)?'check':/hint|indice/i.test(message)?'hint':'typed';
  const comparison=menuComparison(message);
  const reply=comparison || allyArea.reply(message,kind) || guideReply(kind,message);
  const entry={kind:'typed',question:[message,message],reply};
  if(!comparison && allyEndpoint){
    pendingReplies.add(entry);
    requestAllyReply(history,entry);
  }
  saveChatEntry(entry);
  renderGuide();$('message')?.focus({preventScroll:true});
}
async function requestAllyReply(history,entry,question){
  const lang=state.lang==='fr'?1:0;
  const screenshot=entry.kind==='image'?entry:history.findLast(item=>item.kind==='image' && item.phase===sectionPhase());
  const context=mathContext(entry,screenshot,lang);
  try{
    const response=await fetch(allyEndpoint,{
      method:'POST',headers:{'Content-Type':'application/json'},signal:AbortSignal.timeout(35000),
      body:JSON.stringify({question:question ?? entry.question[lang],context:JSON.stringify(context),image:screenshot?.image?.src})
    });
    if(!response.ok)throw new Error('Ally unavailable');
    const {reply}=await response.json();
    if(typeof reply!=='string'||!reply.trim())throw new Error('Empty reply');
    entry.reply=[reply,reply];
  }catch{
    entry.localHint=true;
  }finally{
    pendingReplies.delete(entry);
    const index=history.indexOf(entry);
    if(index!==-1 && state.chats.includes(history)){
      if(history===state.chats[guideStep()]){
        const log=document.querySelector('.chat-area');
        const bubble=log?.querySelector('[data-guide-reply="'+index+'"]');
        if(bubble){
          const atBottom=log.scrollHeight-log.clientHeight-log.scrollTop<2;
          bubble.textContent=entry.reply[state.lang==='fr'?1:0];
          if(entry.localHint)bubble.title=tr('Local hint','Indice local');
          if(atBottom)log.scrollTop=log.scrollHeight;
          $('composer').querySelector('.send').disabled=history.some(item=>pendingReplies.has(item));
        }
      }
    }
  }
}
function generateTicket(index){
  const history=state.chats[guideStep()];
  const source=history[index];
  if(source!==history.at(-1)||source?.kind!=='image')return;
  const ticket=allyTicket.fromEntry(source);
  if(!ticket)return;
  const entry={kind:'animation',question:['How did I get this total?','D’où vient ce total?'],ticket,readyAt:Date.now()+3000};
  saveChatEntry(entry);
  renderGuide();$('message')?.focus({preventScroll:true});
  setTimeout(()=>{
    if(history!==state.chats[guideStep()])return;
    const i=history.indexOf(entry),log=document.querySelector('.chat-area');
    const placeholder=log?.querySelector('[data-generating="'+i+'"]');
    if(!placeholder)return;
    const atBottom=log.scrollHeight-log.clientHeight-log.scrollTop<2;
    placeholder.outerHTML=allyTicket.attachment(entry,i);
    if(atBottom)log.scrollTop=log.scrollHeight;
  },Math.max(0,entry.readyAt-Date.now()));
}
function renderGuide(){
  const i=guideStep(),lang=state.lang==='fr'?1:0;
  $('launcher-slot').innerHTML=guideOpen?'':act('toggle-guide','<img src="./assets/ally-mascot.webp" alt=""><span>Ally</span>','launcher','aria-label="'+tr('Ask Ally','Demander à Ally')+'"');
  if(!guideOpen){$('guide-slot').innerHTML='';return;}
  const selected=allyArea.current();
  const history=state.chats[i];
  const messages=history.map((c,index)=>{
    if(c.kind==='animation')return '<div class="bubble user">'+safe(c.question[lang])+'</div>'+allyTicket.attachment(c,index);
    if(c.kind==='image'){
      if(!c.image?.src?.startsWith('data:image/jpeg;base64,'))return '';
      const text=pendingReplies.has(c)?tr('Thinking…','Un instant…'):c.reply?.[lang];
      const breakdown=text?
        '<div class="bubble" data-guide-reply="'+index+'">'+safe(text)+'</div>':'';
      return '<figure class="bubble user ally-sent-image"><img src="'+safe(c.image.src)+'" alt="'+safe(c.description)+'" width="'+Number(c.image.width)+'" height="'+Number(c.image.height)+'"><figcaption>'+tr('Image sent','Image envoyée')+'</figcaption></figure>'+breakdown;
    }
    const changed=c.selection && c.selection!==history[index-1]?.selection && c.selection!==selected?.text;
    const quote=changed?'<q class="ally-quotation">'+safe(c.selection)+'</q>':'';
    const reply=pendingReplies.has(c)?tr('Thinking…','Un instant…'):c.reply[lang];
    return '<div class="bubble user">'+quote+safe(c.question[lang])+'</div><div class="bubble" data-guide-reply="'+index+'" '+(c.localHint?'title="'+tr('Local hint','Indice local')+'"':'')+'>'+safe(reply)+'</div>';
  }).join('');
  $('guide-slot').innerHTML='<section class="guide-panel" aria-label="'+coachName()+'">'+
    '<div class="guide-head"><img src="./assets/ally-mascot.webp" alt=""><h2>'+tr('Ally the AlloProf','Ally, l’AlloProf')+'</h2>'+
    act('close-guide',icon('x'),'icon-btn','aria-label="'+tr('Close','Fermer')+'"')+'</div>'+
    '<div class="chat-area" role="log" aria-live="polite">'+messages+'</div>'+
    '<div class="guide-bottom">'+allyArea.questionStarters(history)+'<form id="composer" class="composer">'+allyArea.imageButton()+
    '<input id="message" type="text" maxlength="300" autocomplete="off" aria-label="'+tr('Message to Ally','Message à Ally')+'" placeholder="Message…">'+
    '<button type="submit" class="send" '+(history.some(entry=>pendingReplies.has(entry))?'disabled ':'')+'aria-label="'+tr('Send','Envoyer')+'">'+icon('send')+'</button></form></div></section>';
  const log=document.querySelector('.chat-area');
  log.scrollTop=log.scrollHeight;
  let lastBottom=log.scrollTop;
  // A screenshot can gain its height after the chat has already scrolled.
  log.addEventListener('load',event=>{
    if(event.target.tagName!=='IMG'||log.scrollTop < lastBottom-1)return;
    log.scrollTop=log.scrollHeight;
    lastBottom=log.scrollTop;
  },true);
}
function showGuide(open){
  guideOpen=open;renderGuide();
  (open?$('message'):document.querySelector('.launcher'))?.focus({preventScroll:true});
}

function activityCard(){
  return act('resume','<img src="./assets/pizza-truck.webp" alt=""><span><b>'+title()+'</b><small>'+tr('Mathematics','Mathématiques')+'</small></span>'+icon('chev'),'library-card');
}
function activityPreviews(){
  const previews = [
    ['below-zero-bay', tr('Below Zero Bay','La baie sous zéro'), tr('Depth and signed numbers','Profondeurs et nombres relatifs')],
    ['kickflip-blueprint', tr('Kickflip blueprint','Dessine ton skatepark'), tr('Scale drawings','Dessins à l’échelle')],
    ['mirrorwing', tr('The mirrorwing moth','Le papillon miroir'), tr('Lines of symmetry','Axes de symétrie')],
    ['offbeat', tr('The missing downbeat','Le temps fort disparu'), tr('Fractions and rhythm','Fractions et rythme')]
  ];
  const cards = previews.map(([image, name, topic]) =>
    '<div class="library-card activity-preview"><img src="./assets/activity-previews/'+image+'.webp" alt=""><span><b>'+name+'</b><small>'+topic+'</small></span></div>'
  );
  return '<section><h3>'+tr('Preview only','Aperçus seulement')+'</h3>'+cards.join('')+'</section>';
}
function note(){
  return '<label class="sr-only" for="scratch-note">'+tr('Activity notes','Notes de l’activité')+'</label><textarea class="note-area" id="scratch-note" maxlength="5000" placeholder="'+tr('Write your idea…','Note ton idée…')+'">'+safe(state.note)+'</textarea><div class="modal-foot"><small id="note-status">'+(onLocalhost?tr('Notes stay in this tab','Notes conservées dans cet onglet'):tr('Refreshing clears your notes','Actualiser efface tes notes'))+'</small>'+act('close-modal',tr('Done','Terminé'),'action')+'</div>';
}
function openModal(kind,renew=false){
  modalKind=kind;
  if(!renew&&!$('modal').open)lastFocus=document.activeElement;
  let heading='',body='';
  if(kind==='library'){heading=tr('Learning activities','Activités d’apprentissage');body=activityCard()+activityPreviews();}
  if(kind==='notebook'){
    heading=tr('My notebook','Mon cahier');
    body='<h3>'+tr('Current activity','Activité en cours')+'</h3>'+activityCard()+act('save',icon(state.saved?'check':'bookmark')+tr(state.saved?'Saved to notebook':'Save to notebook',state.saved?'Enregistrée dans le cahier':'Enregistrer dans le cahier'),'bookmark','aria-pressed="'+state.saved+'"')+'<h3>'+tr('My scratchpad','Mon brouillon')+'</h3>'+note();
  }
  if(kind==='scratch'){heading=tr('My scratchpad','Mon brouillon');body=note();}
  if(kind==='profile'){heading=tr('Student workspace','Espace élève');body=profileFields()+'<p>'+(onLocalhost?tr('Closing this tab resets your activity.','Fermer cet onglet réinitialise ton activité.'):tr('Refreshing starts a new activity.','Actualiser recommence l’activité.'))+'</p><div class="actions">'+act('notebook',icon('note')+tr('My notebook','Mon cahier'),'action')+act('restart',tr('Restart activity','Recommencer l’activité'))+'</div>';}
  if(kind==='restart'){heading=tr('Start over?','Recommencer?');body='<p class="confirm">'+tr('Your order will be cleared.','Ta commande sera effacée.')+'</p><div class="actions">'+act('do-restart',tr('Start again','Recommencer'),'action')+act('close-modal',tr('Keep my work','Garder mon travail'),'action secondary')+'</div>';}
  if(kind==='arrival'){
    heading=tr('More guests!','De la visite!');
    body='<div class="arrival-art">'+icon('group')+'<strong>+4</strong></div><p>'+tr('Four more kids are coming. Two eat only cheese pizza. You still have $80.','Quatre enfants de plus arrivent. Deux mangent seulement de la pizza au fromage. Tu as toujours 80 $.')+'</p><div class="actions">'+act('ack-arrival',tr('Change my order','Changer ma commande')+icon('arrow'),'action')+'</div>';
  }
  if(kind==='preview'){if(!renew)trial={trays:freshTrays(),topping:0,status:''};heading=tr('Practice round','Essai');body=previewBody();}
  if(kind==='reopen'){heading=tr('Return the trays to the counter?','Reprendre les plateaux?');body='<p>'+tr('The tables will be empty again.','Les tables seront de nouveau vides.')+'</p><div class="actions">'+act('confirm-reopen',tr('Reopen order','Revoir la commande'),'action')+act('close-modal',tr('Keep serving','Continuer le service'),'action secondary')+'</div>';}
  $('modal').innerHTML='<div class="modal-body"><div class="modal-head"><h2 id="modal-title">'+heading+'</h2>'+act('close-modal',icon('x'),'icon-btn','aria-label="'+tr('Close dialog','Fermer la fenêtre')+'"')+'</div>'+body+'</div>';
  if(!$('modal').open)$('modal').showModal();
  if(kind==='scratch')$('scratch-note').focus();
}
function closeModal(){
  if($('modal').open)$('modal').close();
}
$('modal').addEventListener('close',()=>{modalKind='';if(lastFocus?.isConnected)lastFocus.focus({preventScroll:true});lastFocus=null;});
$('modal').addEventListener('click',e=>{if(e.target===$('modal')){const rect=$('modal').getBoundingClientRect();if(e.clientX<rect.left||e.clientX>rect.right||e.clientY<rect.top||e.clientY>rect.bottom)closeModal();}});
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&guideOpen&&!document.querySelector('dialog[open]')){showGuide(false);}});

document.addEventListener('input',event=>{
  if(event.target.id==='scratch-note'){
    state.note=event.target.value;const saved=localSave();
    $('note-status').textContent=saved?(onLocalhost?tr('Saved in this tab','Enregistré dans cet onglet'):tr('Saved until refresh','Gardé jusqu’à l’actualisation')):tr('Saved for this session','Enregistré pour cette séance');
  }
});
document.addEventListener('change',event=>{
  if(event.target.id==='coach-age')state.learner=tutorProfile({...state.learner,age:event.target.value});
  else if(event.target.id==='coach-skill')state.learner=tutorProfile({...state.learner,skill:event.target.value});
  else return;
  localSave();
});document.addEventListener('submit',event=>{
  if(event.target.id!=='composer')return;
  event.preventDefault();const value=$('message').value.trim();if(value)addChat(value);
});
document.addEventListener('click',event=>{
  const btn=event.target.closest('[data-action]');if(!btn)return;
  const action=btn.dataset.action;
  if(['notebook','scratch','library','profile','restart','preview'].includes(action)){openModal(action);return;}
  if(action.startsWith('trial-')){trialAction(action,Number(btn.dataset.index));return;}
  switch(action){
    case 'close-modal':closeModal();break;
    case 'section':goToSection(Number(btn.dataset.section));break;
    case 'ack-arrival':closeModal();focusBoard();break;
    case 'language':state.lang=tr('fr','en');feedback='';localSave();renderShell();document.querySelector('.lang-btn').focus();break;
    case 'toggle-guide':showGuide(true);break;
    case 'draft-question': {
      const input=$('message');
      if(!input||input.value.trim())break;
      input.value=btn.textContent;
      input.focus({preventScroll:true});
      input.setSelectionRange(input.value.length,input.value.length);
      input.dispatchEvent(new Event('input',{bubbles:true}));
      break;
    }
    case 'select-area':allyArea.open();break;
    case 'generate-ticket':generateTicket(Number(btn.dataset.entry));break;
    case 'play-ticket': {
      const entry=state.chats[guideStep()][Number(btn.dataset.entry)];
      if(entry?.kind==='animation' && Date.now()>=entry.readyAt)allyTicket.play(allyTicket.fromEntry(entry),btn);
      break;
    }
    case 'close-guide':showGuide(false);break;
    case 'save':
      state.saved=!state.saved;localSave();renderShell();
      if(modalKind==='notebook'){openModal('notebook',true);$('modal').querySelector('[data-action="save"]').focus();}
      else $('footer').querySelector('button').focus({preventScroll:true});
      $('notice').textContent=state.saved?tr('Activity saved','Activité enregistrée'):tr('Bookmark removed','Marque-page retiré');
      break;
    case 'resume':closeModal();viewedPhase=null;renderShift();renderGuide();focusBoard();break;
    case 'do-restart':
      closeModal();viewedPhase=null;allyArea.clear();Object.assign(state,emptyShift(),{chats:[[],[],[]]});feedback='';guideOpen=false;localSave();renderShell();focusBoard();break;
    default:handleCounter(action,btn);
  }
});
renderShell();
