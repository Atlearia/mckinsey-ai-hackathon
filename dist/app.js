'use strict';

const $ = id => document.getElementById(id);
const marks = {
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
const key='alloprof-pizza-studio-v1';
const blankAnswers=()=>({slices:'',pizzas:'',single:'',bundle:'',choice:'',left:'',pitch:''});
let state={lang:'en',done:0,view:0,saved:false,note:'',answers:blankAnswers(),chats:[[],[],[]]};
try {
  const existing=JSON.parse(localStorage.getItem(key));
  if(existing && ['en','fr'].includes(existing.lang) && Number.isInteger(existing.done) && existing.done>=0 && existing.done<=3){
    state={...state,...existing,answers:{...blankAnswers(),...existing.answers}};
    state.view=Math.max(0,Math.min(state.done,Number(state.view)||0));
    if(!Array.isArray(state.chats)||state.chats.length!==3) state.chats=[[],[],[]];
  }
} catch {}
const tr=(en,fr)=>state.lang==='fr'?fr:en;
const stepNames=()=>[tr('Plan the order','Planifier la commande'),tr('Compare the deals','Comparer les offres'),tr('Make your case','Justifier ton choix')];
const title=()=>tr('Pizza party planner','Mission pizza');
const money=n=>tr('$'+n,n+' $');
const level=()=>tr('Secondary 1','Secondaire 1');
const coachName=()=>tr('Allo, your learning guide','Allo, ton guide');
const act=(action,content,style='text-btn',extra='')=>'<button type="button" class="'+style+'" data-action="'+action+'" '+extra+'>'+content+'</button>';
const localSave=()=>{try{localStorage.setItem(key,JSON.stringify(state));return true;}catch{return false;}};
let guideOpen=false,modalKind='',lastFocus=null,feedback='';
const guideStep=()=>Math.min(state.view,2);
function renderShell(){
  document.documentElement.lang=state.lang;
  document.title=title()+' | Alloprof';
  $('skip').textContent=tr('Skip to the activity','Aller à l’activité');
  const home='https://www.alloprof.qc.ca/'+tr('en/students','fr/eleves');
  $('header').innerHTML='<div class="head-inner"><div class="brand"><a href="'+home+'" target="_blank" rel="noopener" aria-label="Alloprof"><img src="./assets/alloprof.svg" alt="Alloprof" width="139" height="30"></a><span class="student-tag">'+tr('Student zone','Zone élèves')+'</span></div><nav class="primary-nav" aria-label="'+tr('Main navigation','Navigation principale')+'">'+act('library',icon('grid')+tr('Activities','Activités'),'nav-item active')+act('notebook',icon('note')+tr('My notebook','Mon cahier'),'nav-item')+'</nav><div class="header-end">'+act('language',icon('globe')+tr('FR','EN'),'lang-btn','aria-label="'+tr('Passer au français','Switch to English')+'"')+act('profile',icon('user'),'avatar','aria-label="'+tr('Student workspace','Espace élève')+'"')+'</div></div>';
  $('crumbs').innerHTML='<a href="'+home+'" target="_blank" rel="noopener" aria-label="'+tr('Student home','Accueil des élèves')+'">'+icon('home','home-icon')+'</a>'+icon('chev')+'<a href="'+home+tr('/vl/mathematics','/bv/mathematiques')+'" target="_blank" rel="noopener">'+tr('Mathematics','Mathématiques')+'</a>'+icon('chev')+act('library',tr('Activities','Activités'),'crumb-btn')+icon('chev')+'<b>'+title()+'</b>';
  $('hero-info').innerHTML='<span class="category">'+icon('compass')+tr('Real-world activity','Activité en contexte')+'</span><h1 id="page-title">'+title()+'</h1><p class="hero-desc">'+tr('Can you feed your whole class a pizza lunch and stay within budget?','Peux-tu offrir un dîner pizza à toute ta classe tout en respectant le budget?')+'</p><div class="meta"><span>'+icon('math')+tr('Mathematics','Mathématiques')+'</span><span>'+icon('cap')+level()+'</span><span>'+icon('clock')+tr('10–15 min','10 à 15 min')+'</span></div>'+act('resume',tr('Go to activity','Aller à l’activité')+icon('arrow'),'hero-cta action');
  const facts=[['group','24',tr('classmates','élèves')],['pizza','2',tr('slices per person','pointes par élève')],['wallet',money(80),tr('class budget','budget de classe')]];
  $('mission').innerHTML='<div class="section-head"><span class="icon-box">'+icon('flag')+'</span><h2>'+tr('Your mission','Ta mission')+'</h2></div><p class="mission-copy">'+tr('It’s Friday, and your class is having a pizza party! Two pizza trucks have sent their offers. Your job is to <b>feed everyone</b> and <b>stay within budget</b>.','C’est vendredi et ta classe organise un dîner pizza! Deux camions de cuisine de rue proposent des offres. Ta mission est de <b>nourrir tout le monde</b> en <b>respectant le budget</b>.')+'</p><div class="facts">'+facts.map(([i,val,label])=>'<div class="fact"><span class="fact-icon">'+icon(i)+'</span><div><strong>'+val+'</strong><small>'+label+'</small></div></div>').join('')+'</div>';
  $('coach-invite').innerHTML='<div class="row">'+icon('light')+'<h2>'+tr('Need a hand?','Besoin d’un coup de main?')+'</h2></div><p>'+tr('Allo, your AI guide, has a hint for the step you’re working on.','Allo, ton guide IA, te propose un indice lié à l’étape en cours.')+'</p>'+act('guide',tr('Get a hint','Obtenir un indice')+icon('arrow'));
  $('footer').innerHTML='<span>'+tr('Alloprof activity concept · Interactive demo','Concept d’activité Alloprof · Démo interactive')+'</span>'+act('save',(state.saved?icon('check'):icon('bookmark'))+tr(state.saved?'Activity saved':'Save activity',state.saved?'Activité enregistrée':'Enregistrer l’activité'),'bookmark','aria-pressed="'+state.saved+'"');
  renderProgress();renderWork();renderGuide();
}
function renderProgress(){
  $('progress').innerHTML='<div class="progress-title"><h2>'+tr('Your progress','Ta progression')+'</h2><span class="count">'+state.done+' / 3</span></div><div class="meter" role="progressbar" aria-label="'+tr('Steps completed','Étapes terminées')+'" aria-valuemin="0" aria-valuemax="3" aria-valuenow="'+state.done+'">'+[0,1,2].map(i=>'<i class="'+(i<state.done?'full':'')+'"></i>').join('')+'</div><ol class="road">'+stepNames().map((s,i)=>'<li><button type="button" data-action="step" data-step="'+i+'" '+(i>state.done?'disabled':'')+' class="'+(i<state.done?'past ':'')+(i===state.view?'here':'')+'" '+(i===state.view?'aria-current="step"':'')+'><span class="step-dot">'+(i<state.done?icon('check'):i+1)+'</span>'+s+'</button></li>').join('')+'</ol>';
}
function field(name,label,unit){
  return '<div class="field"><label for="f-'+name+'">'+label+'</label><div class="field-wrap"><input id="f-'+name+'" name="'+name+'" data-answer="'+name+'" inputmode="decimal" autocomplete="off" maxlength="12" placeholder="—" value="'+safe(state.answers[name])+'" aria-describedby="feedback"><span>'+unit+'</span></div></div>';
}
function offers(){
  return '<div class="offers"><article class="offer"><h3>Pizza Solo</h3><p>'+tr('$14 per pizza, plus one $4 delivery fee per order.','14 $ par pizza, plus 4 $ de livraison par commande.')+'</p></article><article class="offer"><h3>Pizza Trio</h3><p>'+tr('$37 per bundle of 3 pizzas. Delivery included.','37 $ par lot de 3 pizzas. Livraison incluse.')+'</p></article></div>';
}
function stepBody(i){
  const a=state.answers;
  if(i===0)return '<p class="prompt-text">'+tr('Each pizza is cut into <b>8 slices</b>. What is the smallest whole-pizza order that gives every classmate their two slices?','Chaque pizza est coupée en <b>8 pointes</b>. Combien de pizzas entières faut-il commander au minimum pour que chaque élève ait ses deux pointes?')+'</p><div class="fields">'+field('slices',tr('Slices needed','Pointes nécessaires'),tr('slices','pointes'))+field('pizzas',tr('Pizzas to order','Pizzas à commander'),tr('pizzas','pizzas'))+'</div>';
  if(i===1)return '<p class="prompt-text">'+tr('You need <b>6 pizzas</b>. Both trucks use the same size pizza, and all prices include tax. Work out what each order would cost.','Il te faut <b>6 pizzas</b>. Les deux camions vendent des pizzas de même taille et les prix incluent les taxes. Calcule le coût de chaque commande.')+'</p>'+offers()+'<div class="fields">'+field('single',tr('Pizza Solo total','Total Pizza Solo'),'$')+field('bundle',tr('Pizza Trio total','Total Pizza Trio'),'$')+'</div>';
  return '<p class="prompt-text">'+tr('Tell your class which truck you’d order from. Use the order totals and the class budget to back up your choice.','Dis à ta classe quel camion tu choisirais. Appuie ton choix sur les coûts des deux commandes et le budget de la classe.')+'</p><div class="offers"><article class="offer"><h3>Pizza Solo</h3><p>'+money(88)+'</p></article><article class="offer"><h3>Pizza Trio</h3><p>'+money(74)+'</p></article></div><fieldset><legend>'+tr('My pick','Mon choix')+'</legend><div class="radio-row">'+['Solo','Trio'].map(v=>'<label><input type="radio" name="choice" data-answer="choice" value="'+v+'" '+(a.choice===v?'checked':'')+'> Pizza '+v+'</label>').join('')+'</div></fieldset>'+field('left',tr('Budget left after the order','Budget restant après la commande'),'$')+'<div class="field"><label for="pitch">'+tr('My reason','Ma justification')+'</label><textarea id="pitch" data-answer="pitch" maxlength="1000" placeholder="'+tr('I would choose this truck because…','Je choisirais ce camion parce que…')+'">'+safe(a.pitch)+'</textarea></div>';
}
function summary(){
  return '<div class="success-strip">'+icon('check')+tr('Activity complete','Activité terminée')+'</div><h2 id="work-title">'+tr('The class is fed!','La classe est servie!')+'</h2><p class="prompt-text">'+tr('You planned the portions, compared prices, and made a case for your order.','Tu as planifié les portions, comparé les prix et justifié ta commande.')+'</p><div class="summary"><div><span>'+tr('Your order','Ta commande')+'</span><b>6 pizzas · Pizza Trio</b></div><div><span>'+tr('Total cost','Coût total')+'</span><b>'+money(74)+'</b></div><div><span>'+tr('Budget left','Budget restant')+'</span><b>'+money(6)+'</b></div></div><h3>'+tr('Your recommendation','Ta recommandation')+'</h3><p class="reflection">'+safe(state.answers.pitch)+'</p><div class="actions">'+act('notebook',icon('note')+tr('Open my notebook','Ouvrir mon cahier'),'action')+act('restart',tr('Try again','Recommencer'),'text-btn')+'</div>';
}
function renderWork(){
  const i=state.view;
  if(i===3){$('work').innerHTML=summary();return;}
  const review=i<state.done;
  const label=review?tr('Continue','Continuer'):i===2?tr('Finish activity','Terminer l’activité'):tr('Check my work','Vérifier mon travail');
  $('work').innerHTML='<div class="work-top"><span class="eyebrow">'+tr('Step ','Étape ')+(i+1)+tr(' of 3',' sur 3')+'</span>'+act('scratch',icon('edit')+tr('Scratchpad','Brouillon'),'scratch-toggle')+'</div><h2 id="work-title">'+stepNames()[i]+'</h2><form id="work-form" class="work-form" novalidate>'+stepBody(i)+'<div class="feedback" id="feedback" role="status">'+safe(feedback)+'</div><div class="actions"><button class="action" type="submit">'+label+icon('arrow')+'</button>'+act('guide',icon('spark')+tr('Ask for a hint','Demander un indice'))+'</div></form>';
  if(review) $('work-form').querySelectorAll('input,textarea').forEach(el=>{el.disabled=true;});
}
function validateStep(){
  const a=state.answers,i=state.view;
  const n=value=>/^\d+(?:[.,]\d+)?$/.test(String(value).trim())?Number(String(value).trim().replace(',','.')):NaN;
  if(i===0){
    if(n(a.slices)!==48)return tr('Start with portions. How many slices would 24 classmates need if each gets two?','Commence par les portions. Combien de pointes faut-il pour 24 élèves qui en mangent deux chacun?');
    if(n(a.pizzas)!==6)return tr('Your slice count works. Group those slices into whole pizzas of 8 slices each.','Ton nombre de pointes est bon. Regroupe-les en pizzas entières de 8 pointes.');
  }
  if(i===1){
    if(n(a.single)!==88)return tr('For Pizza Solo, price all six pizzas first. Then add the delivery fee just once.','Pour Pizza Solo, calcule le prix des six pizzas. Ajoute ensuite les frais de livraison une seule fois.');
    if(n(a.bundle)!==74)return tr('For Pizza Trio, count how many bundles of three make up your order. Each bundle costs $37.','Pour Pizza Trio, détermine combien de lots de trois il te faut. Chaque lot coûte 37 $.');
  }
  if(i===2){
    if(a.choice!=='Trio')return tr('Which order can the class pay for with $80? Check both totals against the budget.','Quelle commande la classe peut-elle payer avec 80 $? Compare les deux coûts au budget.');
    if(n(a.left)!==6)return tr('Start with the class budget and subtract the cost of the truck you chose.','Pars du budget de la classe et soustrais le coût de la commande choisie.');
    if(!a.pitch.trim())return tr('Write a reason in your own words. What makes this order work for the class?','Écris une justification dans tes mots. Pourquoi cette commande convient-elle à ta classe?');
  }
  return '';
}
function moveTo(i){
  feedback='';state.view=i;localSave();renderProgress();renderWork();renderGuide();
  $('work').scrollIntoView({block:'start'});$('work').focus({preventScroll:true});
}
document.addEventListener('input',event=>{
  const name=event.target.dataset.answer;
  if(name&&Object.hasOwn(state.answers,name)){state.answers[name]=event.target.value;localSave();if(feedback){feedback='';$('feedback').textContent='';}}
  if(event.target.id==='scratch-note'){state.note=event.target.value;const ok=localSave();if($('note-status'))$('note-status').textContent=ok?tr('Saved on this device','Enregistré sur cet appareil'):tr('Saved for this session','Enregistré pour cette séance');}
});
document.addEventListener('submit',event=>{
  if(event.target.id==='work-form'){
    event.preventDefault();
    if(state.view===state.done){
      feedback=validateStep();
      if(feedback){$('feedback').textContent=feedback;return;}
      state.done++;
    }
    moveTo(Math.min(3,state.view+1));
  }
  if(event.target.id==='composer'){event.preventDefault();const input=$('message');if(input.value.trim()){const value=input.value.trim();input.value='';addChat(value);}}
});

const hintSteps=[
  [
    ['Look at the class size and the serving size. Which operation would give you the number of slices for everyone?', 'Regarde la taille de la classe et la portion par élève. Quelle opération te donnerait le nombre total de pointes?'],
    ['Imagine a row of classmates with two slices in front of each person. How could you count the slices without counting one at a time?', 'Imagine une rangée d’élèves avec deux pointes devant chaque personne. Comment pourrais-tu compter les pointes sans les compter une à une?'],
    ['Once you have the slice total, make groups of eight. What does one full group represent?', 'Une fois le total de pointes trouvé, forme des groupes de huit. Que représente un groupe complet?']
  ],
  [
    ['The two price tags buy different things. What does one Pizza Solo price cover? What does one Pizza Trio price cover?', 'Les deux prix correspondent à des quantités différentes. Que couvre le prix chez Pizza Solo? Et chez Pizza Trio?'],
    ['Start with the number of pizzas in your order. For each truck, how many single pizzas or bundles do you have to pay for?', 'Pars du nombre de pizzas à commander. Pour chaque camion, combien de pizzas individuelles ou de lots faut-il payer?'],
    ['Look for a one-time fee. Which truck charges it, and when would you add it to the pizza cost?', 'Repère les frais payables une seule fois. Quel camion les facture? Quand les ajouterais-tu au coût des pizzas?']
  ],
  [
    ['Both offers feed the class. Which total is within the budget, and how could you show that to a classmate?', 'Les deux offres nourrissent la classe. Quel coût respecte le budget? Comment le montrerais-tu à un autre élève?'],
    ['Think of the budget as the money in a wallet. What operation would tell you what remains after paying?', 'Imagine le budget comme l’argent dans un portefeuille. Quelle opération donnerait le montant restant après le paiement?'],
    ['Try a sentence that names your truck, the number of people it feeds, and what happens to the budget. Use your own numbers.', 'Essaie une phrase qui nomme le camion, les personnes qu’il nourrit et ce qui arrive au budget. Utilise tes propres nombres.']
  ]
];
const starters=[
  ['Let’s start with portions. Which two facts in your mission tell you how many slices the class needs?','Commençons par les portions. Quelles données de ta mission te permettront de trouver le nombre de pointes nécessaires?'],
  ['You’ve planned the portions. Look at the two offers. Is each price for one pizza or for a whole bundle?','Les portions sont planifiées. Regarde les deux offres. Chaque prix correspond-il à une pizza ou à un lot?'],
  ['Time to defend your choice. Which part would you like to check: the budget, the order, or your explanation?','Il est temps de justifier ton choix. Que veux-tu vérifier en premier, le budget, la commande ou ta justification?']
];
const examples=[
  ['Try a smaller party. Four friends each want two slices. Draw the slices, then group them into pizzas of four. How would this method change for your class?', 'Essaie un petit dîner. Quatre amis veulent deux pointes chacun. Dessine les pointes, puis regroupe-les en pizzas de quatre pointes. Comment adapter cette méthode à ta classe?'],
  ['Imagine needing four drinks sold in pairs. Would you pay for four pairs? Sketch the pairs first. Now try the same idea with bundles of pizzas.', 'Imagine quatre boissons vendues par paires. Paierais-tu quatre paires? Dessine les paires. Essaie la même idée avec les lots de pizzas.'],
  ['If you had $10 and lunch cost $7, how would you check what was left? Try that same check with your class budget.', 'Si tu avais 10 $ et qu’un dîner coûtait 7 $, comment vérifierais-tu la monnaie restante? Fais le même calcul avec le budget de ta classe.']
];
function answerGuide(message,kind,i){
  const m=message.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'');
  const words=(en,fr)=>[en,fr];
  const seen=state.chats[i].filter(e=>e.kind==='hint').length;
  if(kind==='example')return examples[i];
  if(kind==='hint')return hintSteps[i][Math.min(seen,2)];
  if(kind==='check'){
    const a=state.answers;
    if(i===0&&a.slices)return words('You wrote '+a.slices+' slices. Divide your number by the class size. Would each person get the promised portion?','Tu as écrit '+a.slices+' pointes. Divise ce nombre par la taille de la classe. Chaque élève aurait-il la portion prévue?');
    if(i===1&&a.single)return words('You entered $'+a.single+' for Pizza Solo. If you take away delivery, does the rest pay for exactly your pizza order?','Tu as inscrit '+a.single+' $ pour Pizza Solo. Si tu retires les frais de livraison, le reste paie-t-il exactement tes pizzas?');
    if(i===2&&a.choice)return words('You picked Pizza '+a.choice+'. What two numbers could you compare to show the class can afford that order?','Tu as choisi Pizza '+a.choice+'. Quels nombres pourrais-tu comparer pour démontrer que la classe peut payer cette commande?');
    return words('Tell me the first calculation you’re considering, or enter your attempt in the activity and ask me to check it.','Dis-moi quel calcul tu envisages, ou essaie une démarche dans l’activité et demande-moi de la vérifier.');
  }
  if(/give.{0,15}answer|just.{0,15}answer|solve it|do it for me|donne.{0,15}reponse|fais.{0,8}pour moi/.test(m))return hintSteps[i][0];
  if(i===0){
    if(/\b48\b|24\s*[x×*]\s*2|2\s*[x×*]\s*24/.test(m))return words('Try labelling that calculation in slices. How would you group those slices into pizzas?','Essaie d’exprimer ce calcul en pointes. Comment regrouperais-tu ces pointes en pizzas?');
    if(/\b6\b|pizza|divide|divis/.test(m))return words('To check a pizza count, multiply it by the slices in one pizza. Does that cover everyone’s portion with the smallest possible order?','Pour vérifier un nombre de pizzas, multiplie-le par le nombre de pointes d’une pizza. Est-ce la plus petite commande qui donne sa portion à chaque élève?');
    if(/\b24\b|\b2\b|multipl|slice|pointe/.test(m))return hintSteps[i][1];
  }
  if(i===1){
    if(/solo|deliver|livraison|\b14\b|\b88\b/.test(m))return hintSteps[i][2];
    if(/trio|bundle|lot|37|74/.test(m))return words('Draw a box around every group of three pizzas in your order. How many price tags belong on your drawing?','Encadre chaque lot de trois pizzas de ta commande. Combien d’étiquettes de prix devrais-tu placer sur ton dessin?');
  }
  if(i===2){
    if(/budget|left|reste|80|74|soustra|subtract/.test(m))return hintSteps[i][1];
    if(/choose|choi|solo|trio|raison|reason/.test(m))return hintSteps[i][2];
  }
  if(/start|commenc|stuck|bloqu|hint|indice|sais pas|don.t know/.test(m))return hintSteps[i][0];
  return words('I can walk through this step with you. Try “Another hint” for a question about the pizza order, or “Check my approach” to work from what you’ve entered.','Je peux te guider dans cette étape. Essaie « Un autre indice » pour explorer la commande ou « Vérifier ma démarche » pour partir de ce que tu as inscrit.');
}
function chipLabels(i){
  return {
    hint:state.chats[i].length?['Another hint','Un autre indice']:['Help me start','Par où commencer?'],
    check:['Check my approach','Vérifier ma démarche'],
    example:['Try a smaller example','Un exemple plus simple']
  };
}
function addChat(message,kind='typed'){
  const i=guideStep(), reply=answerGuide(message,kind,i);
  const question=kind==='typed'?[message,message]:chipLabels(i)[kind];
  state.chats[i].push({kind,question,reply});
  if(state.chats[i].length>30)state.chats[i].shift();
  localSave();renderGuide();$('message')?.focus({preventScroll:true});
}
function renderGuide(){
  const i=guideStep(),t=state.lang==='fr'?1:0;
  $('launcher-slot').innerHTML=act('toggle-guide','<img src="./assets/guide.svg" alt=""><span class="launch-text">'+(guideOpen?tr('Close guide','Fermer le guide'):tr('Ask Allo','Demander à Allo'))+'</span>'+icon(guideOpen?'down':'spark'),'launcher','aria-expanded="'+guideOpen+'" aria-controls="allo-panel"');
  if(!guideOpen){$('guide-slot').innerHTML='';return;}
  const chats=state.chats[i], chips=chipLabels(i);
  const intro=state.view===3?tr('Your order is ready. Think back to the part that was tricky. Which check would you use again in another problem?','Ta commande est prête. Repense à la partie difficile. Quelle vérification te servirait dans un autre problème?'):starters[i][t];
  $('guide-slot').innerHTML='<section id="allo-panel" class="guide-panel" aria-label="'+coachName()+'"><div class="guide-head"><img src="./assets/guide.svg" alt=""><div><h2>'+tr('Ask Allo','Demander à Allo')+'</h2><p>'+tr('Your AI learning guide','Ton guide d’apprentissage IA')+'</p></div>'+act('close-guide',icon('x'),'icon-btn','aria-label="'+tr('Close guide','Fermer le guide')+'"')+'</div><div class="chat-area" role="log" aria-live="polite"><div class="eyebrow">'+stepNames()[i]+'</div><div class="bubble">'+intro+'</div>'+chats.map(c=>'<div class="bubble user">'+safe(c.question[t])+'</div><div class="bubble">'+safe(c.reply[t])+'</div>').join('')+'<div class="guide-suggestions">'+Object.entries(chips).map(([k,v])=>act('chip',v[t],'','data-kind="'+k+'"')).join('')+'</div></div><div class="guide-bottom"><form id="composer" class="composer"><input id="message" type="text" maxlength="300" autocomplete="off" aria-label="'+tr('Message to Allo','Message à Allo')+'" placeholder="'+tr('Ask about this step…','Pose une question sur cette étape…')+'"><button type="submit" class="send" aria-label="'+tr('Send message','Envoyer le message')+'">'+icon('send')+'</button></form><small>'+tr('Demo guide · Scripted hints','Guide de démonstration · Indices scénarisés')+'</small></div></section>';
  const log=document.querySelector('.chat-area');log.scrollTop=log.scrollHeight;
}
function showGuide(open){
  guideOpen=open;renderGuide();
  if(open)document.querySelector('.guide-head .icon-btn')?.focus({preventScroll:true});
  else document.querySelector('.launcher')?.focus({preventScroll:true});
}
function activityCard(){
  return act('resume','<img src="./assets/pizza-truck.webp" alt=""><span><b>'+title()+'</b><small>'+tr('Mathematics','Mathématiques')+' · '+level()+'</small></span>'+icon('chev'),'library-card');
}
function note(){
  return '<label class="sr-only" for="scratch-note">'+tr('Activity notes','Notes de l’activité')+'</label><textarea class="note-area" id="scratch-note" maxlength="5000" placeholder="'+tr('Try a calculation or jot down an idea…','Essaie un calcul ou note une idée…')+'">'+safe(state.note)+'</textarea><div class="modal-foot"><small id="note-status">'+tr('Notes stay on this device','Notes conservées sur cet appareil')+'</small>'+act('close-modal',tr('Done','Terminé'),'action')+'</div>';
}
function openModal(kind,renew=false){
  modalKind=kind;
  if(!renew&&!$('modal').open)lastFocus=document.activeElement;
  let heading='',body='';
  if(kind==='library'){heading=tr('Learning activities','Activités d’apprentissage');body='<p>'+tr('Mathematics · Secondary 1','Mathématiques · Secondaire 1')+'</p>'+activityCard();}
  if(kind==='notebook'){
    heading=tr('My notebook','Mon cahier');
    body='<h3>'+tr('Current activity','Activité en cours')+'</h3>'+activityCard()+act('save',icon(state.saved?'check':'bookmark')+tr(state.saved?'Saved to notebook':'Save to notebook',state.saved?'Enregistrée dans le cahier':'Enregistrer dans le cahier'),'bookmark','aria-pressed="'+state.saved+'"')+'<h3>'+tr('My scratchpad','Mon brouillon')+'</h3>'+note();
  }
  if(kind==='scratch'){heading=tr('My scratchpad','Mon brouillon');body=note();}
  if(kind==='profile'){heading=tr('Student workspace','Espace élève');body='<p>'+tr('Your activity progress and notes are stored in this browser. Pick up where you left off whenever you come back.','Ta progression et tes notes sont conservées dans ce navigateur. Tu peux reprendre ton activité lors de ta prochaine visite.')+'</p><div class="actions">'+act('notebook',icon('note')+tr('My notebook','Mon cahier'),'action')+act('restart',tr('Restart activity','Recommencer l’activité'))+'</div>';}
  if(kind==='restart'){heading=tr('Start a new attempt?','Commencer un nouvel essai?');body='<p class="confirm">'+tr('This clears your answers, progress, and guide conversation. Your scratchpad and saved activity are kept.','Tes réponses, ta progression et tes échanges avec Allo seront effacés. Ton brouillon et ton activité enregistrée sont conservés.')+'</p><div class="actions">'+act('do-restart',tr('Start again','Recommencer'),'action')+act('close-modal',tr('Keep my work','Garder mon travail'),'action secondary')+'</div>';}
  $('modal').innerHTML='<div class="modal-body"><div class="modal-head"><h2 id="modal-title">'+heading+'</h2>'+act('close-modal',icon('x'),'icon-btn','aria-label="'+tr('Close dialog','Fermer la fenêtre')+'"')+'</div>'+body+'</div>';
  if(!$('modal').open)$('modal').showModal();
  if(kind==='scratch')$('scratch-note').focus();
}
function closeModal(){
  if($('modal').open)$('modal').close();
}
$('modal').addEventListener('close',()=>{modalKind='';if(lastFocus?.isConnected)lastFocus.focus({preventScroll:true});lastFocus=null;});
$('modal').addEventListener('click',e=>{if(e.target===$('modal')){const rect=$('modal').getBoundingClientRect();if(e.clientX<rect.left||e.clientX>rect.right||e.clientY<rect.top||e.clientY>rect.bottom)closeModal();}});
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&guideOpen&&!$('modal').open){showGuide(false);}});
document.addEventListener('click',event=>{
  const btn=event.target.closest('[data-action]');if(!btn)return;
  const action=btn.dataset.action;
  if(['notebook','scratch','library','profile','restart'].includes(action)){openModal(action);return;}
  switch(action){
    case 'close-modal':closeModal();break;
    case 'language':state.lang=tr('fr','en');localSave();feedback='';renderShell();document.querySelector('.lang-btn').focus();break;
    case 'guide':showGuide(true);break;
    case 'toggle-guide':showGuide(!guideOpen);break;
    case 'close-guide':showGuide(false);break;
    case 'chip':addChat('',btn.dataset.kind);break;
    case 'step':moveTo(Number(btn.dataset.step));break;
    case 'save':
      state.saved=!state.saved;localSave();renderShell();
      if(modalKind==='notebook'){openModal('notebook',true);$('modal').querySelector('[data-action="save"]').focus();}
      else $('footer').querySelector('button').focus({preventScroll:true});
      $('notice').textContent=state.saved?tr('Activity saved','Activité enregistrée'):tr('Bookmark removed','Marque-page retiré');
      break;
    case 'resume':
      closeModal();moveTo(state.done);
      if(state.done===0) mission.scrollIntoView({block:'start'});
      break;
    case 'do-restart':
      closeModal();state.done=0;state.answers=blankAnswers();state.chats=[[],[],[]];guideOpen=false;moveTo(0);break;
  }
});
renderShell();
