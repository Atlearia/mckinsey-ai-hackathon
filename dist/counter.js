'use strict';

const budget = 80;
const pizzas = [
  {id:'cheese', name:['Cheese classic','Classique fromage'], shop:'Solo', cheese:8, pep:0, cost:14},
  {id:'pep', name:['Pepperoni','Pepperoni'], shop:'Solo', cheese:0, pep:8, cost:11},
  {id:'party', name:['Half & half','Moitié-moitié'], shop:'Trio', cheese:6, pep:6, cost:20}
];
const tableNames = [['Garden table','Table jardin'],['Band table','Table musicale'],['Stage crew','Équipe de scène']];
const freshTrays = () => [[0,0],[0,0],[0,0]];
const emptyShift = () => ({phase:0, cart:[0,0,0], quote:null, first:null, trays:freshTrays(), topping:0, batch:'all', undo:[]});
// Browsing a section does not submit an order or advance the shift.
let viewedPhase=null;
const sectionPhase=()=>viewedPhase ?? state.phase;
const sectionCart=()=>viewedPhase===0 && state.first ? state.first : state.cart;
const tableSizes = () => sectionPhase()===0 ? [6,6,6] : [8,6,8];
const guests = () => tableSizes().reduce((a,b)=>a+b,0);
function tally(cart=sectionCart()){
  const fee=cart[2]>0?4:0;
  const cheese=cart.reduce((sum,n,i)=>sum+n*pizzas[i].cheese,0);
  const pep=cart.reduce((sum,n,i)=>sum+n*pizzas[i].pep,0);
  const cost=cart.reduce((sum,n,i)=>sum+n*pizzas[i].cost,fee);
  return {cheese,pep,slices:cheese+pep,cost,fee};
}
function outcome(cart=sectionCart()){
  const stock=tally(cart);
  const veg=Math.min(stock.cheese/2,tableSizes()[0]);
  const flexible=Math.min((stock.slices-veg*2)/2,guests()-tableSizes()[0]);
  return {served:veg+flexible,short:guests()-veg-flexible,over:Math.max(stock.cost-budget,0)};
}
const servedAt=i=>state.trays[i][0]+state.trays[i][1];
const served=()=>state.trays.reduce((n,pair)=>n+pair[0]+pair[1],0);
function remaining(t){
  const stock=tally();
  return (t===0?stock.cheese:stock.pep)/2-state.trays.reduce((n,pair)=>n+pair[t],0);
}
function productName(i){return tr(...pizzas[i].name);}
function tableName(i){return tr(...tableNames[i]);}
const toppingName=t=>t===0?tr('Cheese','Fromage'):tr('Pepperoni','Pepperoni');
const phaseNames=()=>[tr('Order','Commander'),tr('Change','Modifier'),tr('Serve','Servir')];
let feedback='';

function wheel(i,size=''){
  return '<canvas class="pizza-wheel '+size+'" data-pizza="'+i+'" width="360" height="320" aria-hidden="true"></canvas>';
}
// Each wedge is a separate sector; the diagrams show the actual slice count and toppings.
function drawWheels(root=document){
  root.querySelectorAll('canvas[data-pizza]').forEach(canvas=>{
    const i=Number(canvas.dataset.pizza), count=i===2?12:8,ctx=canvas.getContext('2d');
    if(!ctx)return;
    ctx.clearRect(0,0,360,320);
    ctx.save();ctx.translate(180,166);ctx.scale(1,.88);
    ctx.fillStyle='rgba(63,46,33,.14)';ctx.beginPath();ctx.ellipse(4,13,142,137,-.05,0,Math.PI*2);ctx.fill();
    const start=-Math.PI/2+(i===1?.11:-.09), radius=141;
    for(let w=0;w<count;w++){
      const from=start+w*Math.PI*2/count+.012,to=start+(w+1)*Math.PI*2/count-.012,mid=(from+to)/2;
      ctx.save();ctx.translate(Math.cos(mid)*2,Math.sin(mid)*2);
      function wedge(r,color){
        ctx.beginPath();ctx.moveTo(0,0);ctx.arc(0,0,r,from,to);ctx.closePath();ctx.fillStyle=color;ctx.fill();
      }
      wedge(radius+1,'#75452c');wedge(radius-2,'#d88b3d');wedge(radius-7,'#f5bd62');wedge(radius-14,'#d96733');wedge(radius-18,'#ffc961');
      for(let j=0;j<7;j++){
        const a=from+(to-from)*(.17+((j*7+w*3)%13)/20);
        const r=26+((w*13+j*23)%91);
        ctx.beginPath();ctx.ellipse(Math.cos(a)*r,Math.sin(a)*r,3+(j%4),2.3+j%3,a,0,Math.PI*2);ctx.fillStyle=['#f3ac49','#ffe39a','#dd8e34'][j%3];ctx.fill();
      }
      if(i===1||(i===2&&w>=6)){
        const a=mid, r=86+(w%2)*7,x=Math.cos(a)*r,y=Math.sin(a)*r;
        ctx.fillStyle='#9c4630';ctx.beginPath();ctx.arc(x,y,15,0,Math.PI*2);ctx.fill();ctx.fillStyle='#d65b40';ctx.beginPath();ctx.arc(x-1,y-2,12.5,0,Math.PI*2);ctx.fill();
        ctx.fillStyle='#faae76';for(const [dx,dy] of [[-4,-3],[4,2],[0,7]]){ctx.beginPath();ctx.arc(x+dx,y+dy,1.6,0,Math.PI*2);ctx.fill();}
      }else{
        const x=Math.cos(mid)*85,y=Math.sin(mid)*85;
        ctx.save();ctx.translate(x,y);ctx.rotate(mid+.4);ctx.fillStyle='#5e873c';ctx.beginPath();ctx.ellipse(0,0,8,3.6,0,0,Math.PI*2);ctx.fill();ctx.restore();
      }
      ctx.beginPath();ctx.arc(0,0,radius-7,from+.065,mid);ctx.strokeStyle='#ffe1a4';ctx.lineWidth=3;ctx.stroke();
      ctx.restore();
    }
    ctx.restore();
  });
}
function renderPhases(){
  const selected=Math.min(sectionPhase(),2);
  $('phases').setAttribute('aria-label',tr('Activity sections','Sections de l’activité'));
  $('phases').innerHTML=phaseNames().map((name,i)=>act('section',
    '<span class="phase-no">'+(i<state.phase?icon('check'):i+1)+'</span>'+name,
    'phase '+(selected===i?'active ':i<state.phase?'complete ':''),
    'data-section="'+i+'" aria-controls="work"'+(selected===i?' aria-current="step"':''))).join('<span class="phase-connector" aria-hidden="true"></span>');
}
function goToSection(i){
  if(!Number.isInteger(i)||i<0||i>2)return;
  viewedPhase=i===Math.min(2,state.phase)?null:i;
  renderShift();renderGuide();
  $('phases').scrollIntoView({block:'start'});
  $('work').focus({preventScroll:true});
}
function renderBrief(){
  const kids=guests(), cheese=tableSizes()[0];
  const heading=tr('Feed '+kids+' kids','Un dîner pour '+kids+' enfants');
  const facts=[tr('2 slices each','2 pointes chacun'),tr(cheese+' eat only cheese pizza',cheese+' mangent seulement du fromage'),tr(money(budget)+' to spend','Budget de '+money(budget))];
  $('brief').innerHTML='<div class="dispatch '+(sectionPhase()>0?'revised':'')+'"><span class="dispatch-icon">'+icon('group')+'</span><div><h2>'+heading+'</h2><div class="manifest">'+facts.map(f=>'<span>'+f+'</span>').join('')+'</div></div></div>';
}
function menuCard(p,i){
  const slices=p.cheese+p.pep;
  const detail=i===2?tr('6 cheese + 6 pepperoni','6 fromage + 6 pepperoni'):tr(slices+' '+(i===0?'cheese':'pepperoni')+' slices',slices+' pointes '+(i===0?'au fromage':'au pepperoni'));
  const name=productName(i);
  const delivery=i===2?'<span class="fee-line">'+tr('+$4 delivery, once','Livraison : +4 $ en tout')+'</span>':'';
  return '<article class="menu-card type-'+i+'"><button type="button" draggable="true" data-drag="pizza" data-index="'+i+'" data-action="add" class="pizza-art" aria-label="'+tr('Add ','Ajouter ')+name+'"><span class="shop-tag">Pizza '+p.shop+'</span>'+wheel(i)+'</button><div class="menu-text"><div class="name-price"><h3>'+name+'</h3><b>'+money(p.cost)+'</b></div><p>'+detail+'</p>'+delivery+'<div class="quant"><button type="button" data-action="remove" data-index="'+i+'" aria-label="'+tr('Remove one ','Retirer une pizza ')+name+'" '+(sectionCart()[i]===0?'disabled':'')+'>−</button><span aria-label="'+tr('Quantity','Quantité')+'">'+sectionCart()[i]+'</span><button type="button" data-action="add" data-index="'+i+'" aria-label="'+tr('Add one ','Ajouter une pizza ')+name+'" '+(sectionCart()[i]>=12?'disabled':'')+'>+</button></div></div></article>';
}
function renderPlanner(){
  const heading=sectionPhase()===0?tr('Pick your pizzas','Choisis tes pizzas'):tr('Change your order','Change ta commande');
  $('board').innerHTML='<div class="board-head"><div><h2 id="work-title">'+heading+'</h2></div>'+act('scratch',icon('edit')+tr('Notes','Notes'),'scratch-toggle')+'</div><div class="menu-grid">'+pizzas.map(menuCard).join('')+'</div>';
}
function renderTicket(){
  const n=tally(),planning=sectionPhase()<2;
  const lines=sectionCart().map((qty,i)=>qty?'<li><span>'+qty+' × '+productName(i)+'</span><b>'+money(qty*pizzas[i].cost)+'</b></li>':'').join('');
  const bal=budget-n.cost;
  const button=sectionPhase()===0?tr('Reserve order','Réserver'):tr('Serve lunch','Servir le dîner');
  $('ticket').innerHTML='<div class="receipt'+(planning?' can-drop':'')+'" '+(planning?'data-drop="order"':'')+'><h2>'+tr('Your order','Ta commande')+'</h2><div class="receipt-lines">'+(lines?'<ul>'+lines+(n.fee?'<li><span>'+tr('Trio delivery','Livraison Trio')+'</span><b>'+money(n.fee)+'</b></li>':'')+'</ul>':'<p class="empty-order">'+tr('No pizzas yet.','Aucune pizza.')+'</p>')+'</div><div class="bill"><span>'+tr('Total','Total')+'</span><strong>'+money(n.cost)+'</strong></div><div class="balance '+(bal<0?'over':'')+'"><span>'+tr(bal<0?'Over budget':'Money left',bal<0?'De trop':'Argent restant')+'</span><b>'+money(Math.abs(bal))+'</b></div><div class="stock-line"><span class="dot cheese"></span>'+n.cheese+' '+tr('cheese slices','pointes fromage')+'</div><div class="stock-line"><span class="dot pep"></span>'+n.pep+' '+tr('pepperoni slices','pointes pepperoni')+'</div>'+(state.first&&sectionPhase()>0?'<div class="original-cost">'+tr('First reservation','Première réservation')+' · '+money(tally(state.first).cost)+'</div>':'')+(planning?'<div class="ticket-actions">'+act('reserve',button+icon('arrow'),'action','')+'</div>':'')+(feedback&&planning&&viewedPhase===null?'<p role="status" class="event-feedback">'+safe(feedback)+'</p>':'')+'</div>';
}

function portions(take,available){
  if(state.batch==='one')return Math.min(1,take,available);
  return Math.min(take,available);
}
function seatsMarkup(i,tray=state.trays[i]){
  return '<div class="seat-map" aria-hidden="true">'+Array.from({length:tableSizes()[i]},(_,k)=>'<span class="seat '+(k<tray[0]?'cheese':k<tray[0]+tray[1]?'pep':'empty')+'">'+(k<tray[0]+tray[1]?'◒':'')+'</span>').join('')+'</div>';
}
function tableCard(i,tray,interactive=true){
  const amount=tray[0]+tray[1],cap=tableSizes()[i];
  return '<article class="table-card '+(amount===cap?'fed':'')+'" '+(interactive?'data-drop="table" data-index="'+i+'"':'')+'><div class="table-title"><h3>'+tableName(i)+'</h3><span>'+amount+' / '+cap+'</span></div><p>'+ (i===0?tr('Cheese only','Fromage seulement'):tr('Either topping','Les deux saveurs'))+'</p>'+seatsMarkup(i,tray)+(interactive?'<div class="table-actions">'+act('serve',amount===cap?icon('check')+tr('Table served','Table servie'):tr('Serve','Servir'),'serve-btn','data-index="'+i+'" '+(amount===cap?'disabled':''))+act('clear-tray',tr('Return tray','Reprendre le plateau'),'return-btn','data-index="'+i+'" '+(amount?'':'disabled'))+'</div>':'')+'</article>';
}
function renderService(){
  const pantry=[0,1].map(t=>'<button type="button" draggable="true" data-drag="portion" data-action="select-topping" data-index="'+t+'" aria-pressed="'+(state.topping===t)+'" class="pantry-tile '+(state.topping===t?'chosen':'')+'"><span class="portion-icon '+(t?'pep':'cheese')+'">◒</span><span><b>'+toppingName(t)+'</b><small>'+remaining(t)+' '+tr('two-slice portions','portions de deux pointes')+'</small></span></button>').join('');
  $('board').innerHTML='<div class="board-head"><div><h2 id="work-title">'+tr('Serve the tables','Sers les tables')+'</h2><p>'+tr('Pick a topping. Tap Serve at a table.','Choisis une saveur. Touche Servir à une table.')+'</p></div><span class="service-count">'+served()+' / '+guests()+' '+tr('served','servis')+'</span></div><div class="pantry">'+pantry+'</div><div class="batch">'+['all','one'].map(b=>act('batch',b==='all'?tr('Fill table','Remplir la table'):tr('One guest','Une personne'),'batch-btn','data-batch="'+b+'" aria-pressed="'+(state.batch===b)+'"')).join('')+'</div><div class="tables">'+tableSizes().map((_,i)=>tableCard(i,state.trays[i])).join('')+'</div><div class="service-tools">'+act('undo',tr('Undo','Annuler'),'text-btn',state.undo.length?'':'disabled')+act('reopen',tr('Reopen order','Revoir la commande'),'text-btn')+act('finish',tr('Finish','Terminer')+icon('arrow'),'action',served()===guests()?'':'disabled')+'</div><div class="service-status" role="status">'+safe(viewedPhase===null?feedback:'')+'</div>';
}
function renderEnd(){
  const n=tally();
  $('board').innerHTML='<div class="end-card"><div class="done-icon">'+icon('check')+'</div><h2 id="work-title">'+tr('Lunch is served!','Le dîner est servi!')+'</h2><div class="end-numbers"><div><b>'+served()+'</b><small>'+tr('guests fed','personnes servies')+'</small></div><div><b>'+money(budget-n.cost)+'</b><small>'+tr('for art supplies','pour le matériel d’art')+'</small></div><div><b>'+(n.slices-served()*2)+'</b><small>'+tr('spare slices','pointes en surplus')+'</small></div></div><div class="actions">'+act('scratch',icon('note')+tr('My notes','Mes notes'),'action secondary')+act('restart',tr('Play again','Rejouer'),'action')+'</div></div>';
}
function renderShift(){
  renderPhases();renderBrief();
  if(sectionPhase()<2)renderPlanner();else if(sectionPhase()===2)renderService();else renderEnd();
  renderTicket();drawWheels($('board'));
  if(viewedPhase!==null){
    const note=viewedPhase<state.phase?tr('Completed section','Étape terminée'):
      viewedPhase===1?tr('Reserve your order to edit it here.','Réserve ta commande pour la modifier ici.'):
      tr('Confirm your order in Change to serve lunch.','Confirme ta commande à l’étape Modifier pour servir le dîner.');
    $('brief').insertAdjacentHTML('beforeend','<p class="section-note">'+note+'</p>');
    $('work').querySelectorAll('button:not([data-action="scratch"])').forEach(button=>{button.disabled=true;});
    $('work').querySelectorAll('[draggable]').forEach(el=>{el.draggable=false;});
  }
}
let trial=null;
function previewBody(){
  const n=tally(),stock=[n.cheese/2,n.pep/2];
  trial.trays.forEach(pair=>{stock[0]-=pair[0];stock[1]-=pair[1];});
  const controls=stock.map((amount,t)=>act('trial-topping',toppingName(t)+' · '+amount,'batch-btn','data-index="'+t+'" aria-pressed="'+(trial.topping===t)+'"')).join('');
  const tables=trial.trays.map((tray,i)=>{
    const full=tray[0]+tray[1]===tableSizes()[i];
    return '<div class="trial-table">'+tableCard(i,tray,false)+act('trial-transfer',tr('Serve','Servir'),'serve-btn','data-index="'+i+'" '+(full?'disabled':''))+'</div>';
  }).join('');
  const count=trial.trays.reduce((sum,p)=>sum+p[0]+p[1],0);
  return '<p>'+tr('Pick a topping. Tap Serve.','Choisis une saveur. Touche Servir.')+'</p><div class="batch"><span>'+tr('Portions left','Portions restantes')+'</span>'+controls+'</div><div class="preview-tables">'+tables+'</div><p class="preview-result">'+count+' / '+guests()+' '+tr('guests fed','personnes servies')+' · '+money(n.cost)+' / '+money(budget)+'</p><p role="status" class="trial-status">'+safe(trial.status)+'</p><div class="modal-foot">'+act('trial-reset',tr('Clear tables','Vider les tables'),'text-btn')+act('close-modal',tr('Back to counter','Retour au comptoir'),'action')+'</div>';
}
function trialAction(action,i){
  if(!trial)return;
  trial.status='';
  if(action==='trial-reset')trial.trays=freshTrays();
  if(action==='trial-topping')trial.topping=i;
  if(action==='trial-transfer'){
    const t=trial.topping,n=tally(),left=(t===0?n.cheese:n.pep)/2-trial.trays.reduce((s,p)=>s+p[t],0);
    const count=Math.min(left,tableSizes()[i]-trial.trays[i][0]-trial.trays[i][1]);
    if(i===0&&t===1)trial.status=tr('This table ordered cheese only.','Cette table a commandé seulement du fromage.');
    else if(count===0)trial.status=tr('No portions of this topping remain.','Il ne reste aucune portion de cette saveur.');
    else trial.trays[i][t]+=count;
  }
  openModal('preview',true);
  const target=$('modal').querySelector('[data-action="'+action+'"]'+(Number.isInteger(i)?'[data-index="'+i+'"]':''));
  (target&&!target.disabled?target:$('modal').querySelector('[data-action="close-modal"]')).focus({preventScroll:true});
}
function refresh(action,index){
  localSave();renderShift();
  if(action){
    const selector='[data-action="'+action+'"]'+(index===undefined?'':'[data-index="'+index+'"]');
    const targets=[...document.querySelectorAll(selector)].filter(b=>!b.disabled);
    (targets.find(b=>b.closest('.quant'))||targets[0])?.focus({preventScroll:true});
  }
}
function adjustCart(i,delta){
  if(state.phase>1||!pizzas[i])return;
  const qty=Math.max(0,Math.min(12,state.cart[i]+delta));
  if(qty===state.cart[i])return;
  state.cart[i]=qty;feedback='';refresh(delta>0?'add':'remove',i);
  const row=$('board').querySelector('.type-'+i+' canvas');
  if(row&&!matchMedia('(prefers-reduced-motion: reduce)').matches)row.animate([{transform:'rotate(-5deg) scale(.94)'},{transform:'rotate(2deg) scale(1.03)'},{transform:'none'}],{duration:290});
  $('notice').textContent=productName(i)+' × '+qty+' · '+money(tally().cost);
}
function reserve(){
  if(state.phase>1)return;
  const {short,over}=outcome();
  if(short||over){
    feedback=[short?tr(short+' kids still need pizza.',short+' enfants attendent encore leur pizza.'):'',over?tr('The order exceeds the budget by '+money(over)+'.','La commande dépasse le budget de '+money(over)+'.'):''].filter(Boolean).join(' ');
    renderTicket();return;
  }
  feedback='';
  if(state.phase===0){state.first=state.cart.slice();state.phase=1;refresh();openModal('arrival');}
  else{state.phase=2;state.trays=freshTrays();state.undo=[];refresh();focusBoard();}
  if(guideOpen)renderGuide();
}
function focusBoard(){
  $('work').scrollIntoView({block:'start'});$('work').focus({preventScroll:true});
}
function transfer(i,t=state.topping){
  if(state.phase!==2||![0,1,2].includes(i)||![0,1].includes(t))return;
  const cap=tableSizes()[i],amount=portions(cap-servedAt(i),remaining(t));
  const origin=document.querySelector('.pantry-tile[data-index="'+t+'"]')?.getBoundingClientRect();
  if(i===0&&t===1)feedback=tr('Cheese only at this table.','Seulement du fromage à cette table.');
  else if(!amount)feedback=servedAt(i)===cap?tr('This table is full.','Cette table est complète.'):tr('None of this topping left.','Il ne reste plus de cette saveur.');
  else{
    state.undo.push(state.trays.map(pair=>pair.slice()));state.trays[i][t]+=amount;
    feedback=tr(amount+' portions delivered to ','Portions livrées : '+amount+' · ')+tableName(i)+'.';
  }
  state.topping=t;refresh('serve',i);
  if(amount&&!(i===0&&t===1)&&!matchMedia('(prefers-reduced-motion: reduce)').matches){
    const card=document.querySelector('.table-card[data-index="'+i+'"]');
    card?.animate([{transform:'translateY(4px)',backgroundColor:'#fce3a5'},{transform:'none'}],{duration:430});
    if(origin&&card)flyPortion(origin,card.getBoundingClientRect(),t);
  }
}
function flyPortion(origin,dest,t){
  const token=document.createElement('span');
  token.className='flying-portion '+(t?'pep':'cheese');token.setAttribute('aria-hidden','true');token.textContent='◒';
  const x=origin.left+origin.width/2,y=origin.top+origin.height/2;
  token.style.left=x+'px';token.style.top=y+'px';document.body.append(token);
  const dx=dest.left+dest.width/2-x,dy=dest.top+dest.height/2-y;
  const flight=token.animate([{transform:'translate(-50%,-50%) scale(.6)',opacity:.6},{transform:'translate('+dx*.5+'px,'+(dy*.5-26)+'px) rotate(-14deg)',opacity:1},{transform:'translate('+dx+'px,'+dy+'px) scale(.65)',opacity:0}],{duration:460,easing:'ease-out'});
  flight.finished.then(()=>token.remove(),()=>token.remove());
}
function handleCounter(action,btn){
  if(viewedPhase!==null)return;
  const i=Number(btn.dataset.index);
  switch(action){
    case 'add':adjustCart(i,1);break;
    case 'remove':adjustCart(i,-1);break;
    case 'reserve':reserve();break;
    case 'select-topping':state.topping=i;feedback='';refresh(action,i);break;
    case 'batch':state.batch=btn.dataset.batch;feedback='';refresh();document.querySelector('[data-batch="'+state.batch+'"]')?.focus({preventScroll:true});break;
    case 'serve':transfer(i);break;
    case 'clear-tray':if(state.phase===2&&servedAt(i)){state.undo.push(state.trays.map(pair=>pair.slice()));state.trays[i]=[0,0];feedback='';refresh('serve',i);}break;
    case 'undo':if(state.phase===2&&state.undo.length){state.trays=state.undo.pop();feedback='';refresh();}break;
    case 'reopen':if(served())openModal('reopen');else reopenOrder();break;
    case 'confirm-reopen':closeModal();reopenOrder();break;
    case 'finish':if(state.phase===2&&served()===guests()){state.phase=3;feedback='';refresh();focusBoard();}break;
  }
}
function reopenOrder(){state.phase=1;state.trays=freshTrays();state.undo=[];feedback='';refresh();focusBoard();}
let dragItem=null;
document.addEventListener('dragstart',event=>{
  const source=event.target.closest('[data-drag]');if(!source)return;
  dragItem={kind:source.dataset.drag,i:Number(source.dataset.index)};
  event.dataTransfer.setData('text/plain',source.dataset.drag);event.dataTransfer.effectAllowed='copy';
});
function acceptsDrop(target){return dragItem&&target&&((dragItem.kind==='pizza'&&target.dataset.drop==='order')||(dragItem.kind==='portion'&&target.dataset.drop==='table'));}
document.addEventListener('dragover',event=>{
  const target=event.target.closest('[data-drop]');if(!acceptsDrop(target))return;
  event.preventDefault();event.dataTransfer.dropEffect='copy';target.classList.add('drop-ready');
});
document.addEventListener('dragleave',event=>{const target=event.target.closest('[data-drop]');if(target&&!target.contains(event.relatedTarget))target.classList.remove('drop-ready');});
document.addEventListener('drop',event=>{
  const target=event.target.closest('[data-drop]');if(!acceptsDrop(target))return;
  event.preventDefault();target.classList.remove('drop-ready');
  if(dragItem.kind==='pizza')adjustCart(dragItem.i,1);else transfer(Number(target.dataset.index),dragItem.i);
  dragItem=null;
});
document.addEventListener('dragend',()=>{dragItem=null;document.querySelectorAll('.drop-ready').forEach(el=>el.classList.remove('drop-ready'));});
