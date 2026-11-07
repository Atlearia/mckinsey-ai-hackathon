'use strict';

const allyTicket=(()=>{
  function snapshot(){
    return {quantities:sectionCart().slice(),prices:pizzas.map(p=>p.cost),fee:tally().fee,budget,slices:pizzas.map(p=>[p.cheese,p.pep])};
  }
  function valid(ticket){
    return ticket && Array.isArray(ticket.quantities) && ticket.quantities.length===pizzas.length &&
      ticket.quantities.every(q=>Number.isInteger(q)&&q>=0&&q<=12) &&
      Array.isArray(ticket.prices) && ticket.prices.length===pizzas.length && ticket.prices.every(n=>Number.isFinite(n)&&n>=0) &&
      Number.isFinite(ticket.fee) && ticket.fee>=0;
  }
  const total=t=>t.quantities.reduce((sum,q,i)=>sum+q*t.prices[i],t.fee);
  // Older screenshots saved only the selected words. Reconstruct a ticket only
  // when its visible line items and fee account for its printed total exactly.
  function previousTicket(description){
    const text=String(description || '');
    const amount='(?:\\$\\s*(\\d+)\\b|(\\d+)\\s*\\$)';
    const read=m=>Number(m[1] ?? m[2]);
    const printed=text.match(new RegExp('\\bTotal\\s+'+amount,'i'));
    if(!printed)return null;
    const ticket={quantities:[],prices:[],fee:0};
    for(const pizza of pizzas){
      const match=text.match(new RegExp('\\b(\\d+)\\s*[×x]\\s*(?:'+pizza.name.join('|')+')\\s+'+amount,'i'));
      const q=match?Number(match[1]):0;
      ticket.quantities.push(q);ticket.prices.push(q?Number(match[2] ?? match[3])/q:0);
    }
    const fee=text.match(new RegExp('(?:Trio delivery|Livraison Trio)\\s+'+amount,'i'));
    ticket.fee=fee?read(fee):0;
    const looksLikeOrder=ticket.quantities.some(Boolean)||/your order|ta commande|no pizzas|aucune pizza/i.test(text);
    return looksLikeOrder&&valid(ticket)&&total(ticket)===read(printed)?ticket:null;
  }
  const art=[];
  function fromEntry(entry){
    if(!entry)return null;
    if(entry.kind==='image' && entry.ticket===undefined)return previousTicket(entry.description);
    return valid(entry.ticket)?entry.ticket:null;
  }
  function pizzaArt(i){
    if(!art[i]){
      const holder=document.createElement('div');
      holder.innerHTML=wheel(i); drawWheels(holder);
      const small=document.createElement('canvas');
      small.width=252;small.height=224;
      small.getContext('2d').drawImage(holder.firstElementChild,0,0,small.width,small.height);
      art[i]=small.toDataURL();
    }
    return art[i];
  }
  function suggestions(ticket,index){
    const left=(Number.isFinite(ticket.budget)?ticket.budget:budget)-total(ticket);
    const balanceQuestion=left<0
      ? tr('Why am I $'+(-left)+' over budget?','Pourquoi ai-je dépassé le budget de '+(-left)+' $?')
      : tr('Why do I have $'+left+' left?','Pourquoi me reste-t-il '+left+' $?');
    return act('generate-ticket',tr('How did I get this total?','D’où vient ce total?'),'shot-question',
      'data-entry="'+index+'"')+act('draft-question',balanceQuestion,'shot-question');
  }
  function attachment(entry,index){
    const ticket=entry.ticket,first=ticket.quantities.findIndex(q=>q>0);
    const qty=ticket.quantities.reduce((sum,q)=>sum+q,0);
    const thumb='<span class="ticket-thumb" aria-hidden="true"><i></i>'+
      (first>=0?'<img alt="" src="'+pizzaArt(first)+'">':'')+'</span>';
    if(Date.now()<entry.readyAt)return '<div class="ticket-generating" role="status" data-generating="'+index+'">'+thumb+
      '<b>'+tr('Preparing your receipt…','Préparation de ton billet…')+'</b></div>';
    return act('play-ticket',thumb+'<span class="ticket-card-copy"><b>'+
      tr('Build your receipt','Recrée ton billet')+'</b><small>'+qty+(qty===1?' pizza':' pizzas')+' · '+money(total(ticket))+'</small></span>'+
      '<span class="ticket-open-icon">'+icon('arrow')+'</span>',
      'ticket-attachment','data-entry="'+index+'" aria-haspopup="dialog"');
  }
  function play(ticket,opener){
    if(!valid(ticket)||document.querySelector('dialog[open]'))return;
    const lines=ticket.quantities.flatMap((q,i)=>{
      if(!q)return [];
      const saved=ticket.slices?.[i];
      const [cheese,pep]=Array.isArray(saved) && saved.length===2 && saved.every(n=>Number.isInteger(n)&&n>=0&&n<=12) && saved[0]+saved[1]>0
        ? saved : [pizzas[i].cheese,pizzas[i].pep];
      return [{i,q,price:ticket.prices[i],cheese,pep}];
    });
    const pizzaCount=lines.reduce((sum,line)=>sum+line.q,0);
    const lastStep=Math.max(1,pizzaCount+Number(ticket.fee>0));
    const limit=Number.isFinite(ticket.budget)?ticket.budget:budget;
    const rows=lines.map(({i,q})=>{
      const slots=Array.from({length:q},()=>'<span class="ticket-slot"><img alt="" src="'+pizzaArt(i)+'"></span>').join('');
      return '<li class="ticket-item tone-'+i+'"><div class="ticket-label"><span><b class="ticket-quantity">0</b> × '+safe(productName(i))+
        '</span><b class="ticket-subtotal"></b></div><div class="ticket-pies" aria-hidden="true">'+slots+'</div></li>';
    }).join('') || '<li>'+tr('No pizzas yet.','Aucune pizza.')+'</li>';
    const feeRow=ticket.fee?'<li class="ticket-fee"><span>'+tr('Trio delivery','Livraison Trio')+'</span><strong></strong></li>':'';
    const dialog=document.createElement('dialog');
    dialog.className='ticket-theater';
    dialog.setAttribute('aria-labelledby','ticket-film-title');
    dialog.innerHTML='<header><h2 id="ticket-film-title">'+tr('How did it reach '+money(total(ticket))+'?','Comment arrive-t-on à '+money(total(ticket))+'?')+'</h2>'+
      '<button class="ticket-film-close" aria-label="'+tr('Close','Fermer')+'">'+icon('x')+'</button></header>'+
      '<div class="ticket-board"><section class="ticket-paper"><h3>'+tr('Your order','Ta commande')+'</h3>'+
      '<ul class="ticket-items">'+rows+feeRow+'</ul><div class="ticket-sum"><span>Total</span><strong></strong></div>'+
      '<div class="ticket-budget"><span></span><b></b></div>'+
      '<div class="ticket-slices"><span class="cheese"></span><span class="pep"></span></div></section></div>'+
      '<nav class="ticket-nav" aria-label="'+tr('Build the receipt','Compose le billet')+'">'+
      '<button class="ticket-back" aria-label="'+tr('Undo last addition','Annuler le dernier ajout')+'">←</button>'+
      '<div class="ticket-work" role="status" aria-live="polite" aria-atomic="true"><span class="ticket-index"></span><b class="ticket-equation"></b></div>'+
      '<button class="ticket-next" aria-label="'+tr('Add next item','Ajouter le prochain article')+'">→</button></nav>';
    const items=Array.from(dialog.querySelectorAll('.ticket-item'),row=>({
      row,slots:[...row.querySelectorAll('.ticket-slot')],qty:row.querySelector('.ticket-quantity'),subtotal:row.querySelector('.ticket-subtotal')
    }));
    const actions=lines.flatMap(({i,q,price})=>Array.from({length:q},()=>({i,price,label:productName(i)})));
    if(ticket.fee)actions.push({i:-1,price:ticket.fee,label:tr('Trio delivery','Livraison Trio')});
    const counter=dialog.querySelector('.ticket-index'),equation=dialog.querySelector('.ticket-equation');
    const back=dialog.querySelector('.ticket-back'),next=dialog.querySelector('.ticket-next');
    const fee=dialog.querySelector('.ticket-fee'),sum=dialog.querySelector('.ticket-sum strong'),balance=dialog.querySelector('.ticket-budget');
    const cheeseCount=dialog.querySelector('.ticket-slices .cheese'),pepCount=dialog.querySelector('.ticket-slices .pep');
    let step=0;
    function show(destination){
      if(destination<0 || destination>lastStep)return;
      const forward=destination>step;
      const action=forward?actions[destination-1]:destination<step?actions[step-1]:null;
      step=destination;
      let remaining=step,amount=0,cheese=0,pep=0;
      lines.forEach((line,k)=>{
        const added=Math.min(remaining,line.q);
        remaining-=added;
        amount+=added*line.price;cheese+=added*line.cheese;pep+=added*line.pep;
        const col=items[k];
        col.row.classList.toggle('changed',action?.i===line.i);
        col.slots.forEach((slot,j)=>slot.classList.toggle('filled',j<added));
        col.qty.textContent=added;col.subtotal.textContent=money(added*line.price);
      });
      if(fee){
        const addedFee=remaining?ticket.fee:0;
        fee.classList.toggle('included',Boolean(addedFee));
        fee.classList.toggle('changed',action?.i===-1);
        fee.lastElementChild.textContent=money(addedFee);amount+=addedFee;
      }
      sum.textContent=money(amount);
      const over=amount>limit;
      balance.classList.toggle('over',over);
      balance.firstElementChild.textContent=over?tr('Over budget','Dépassement'):tr('Money left','Argent restant');
      balance.lastElementChild.textContent=money(Math.abs(limit-amount));
      cheeseCount.textContent=tr(cheese+' cheese slices',cheese+' pointes au fromage');
      pepCount.textContent=tr(pep+' pepperoni slices',pep+' pointes au pepperoni');
      if(!actions.length){
        counter.textContent=step===0?tr('No pizzas yet.','Aucune pizza.'):tr('Money left','Argent restant');
        equation.textContent=step===0?tr('0 pizzas = $0','0 pizza = 0 $'):money(limit)+' − '+money(0)+' = '+money(limit);
      }else if(action){
        counter.textContent=(step===lastStep?tr('Receipt complete','Billet complet')+' · ':'')+action.label;
        const before=forward?amount-action.price:amount+action.price;
        equation.textContent=money(before)+(forward?' + ':' − ')+money(action.price)+' = '+money(amount);
      }else{
        counter.textContent=tr('Start at '+money(0),'Départ à '+money(0));
        equation.textContent=tr('Add one ','Ajoute une pizza ')+actions[0].label;
      }
      const upcoming=actions[step];
      const nextLabel=upcoming?tr('Add ','Ajouter ')+upcoming.label+' · '+money(upcoming.price):
        step<lastStep?tr('Check money left','Vérifier l’argent restant'):tr('Receipt complete','Billet complet');
      next.setAttribute('aria-label',nextLabel);next.title=nextLabel;
      const focused=document.activeElement;
      back.disabled=step===0;next.disabled=step===lastStep;
      if((back.disabled && focused===back) || (next.disabled && focused===next)){
        (back.disabled?next:back).focus({preventScroll:true});
      }
    }
    back.onclick=()=>show(step-1);next.onclick=()=>show(step+1);
    dialog.onkeydown=e=>{
      if(e.key==='ArrowLeft'||e.key==='ArrowRight'){e.preventDefault();show(step+(e.key==='ArrowLeft'?-1:1));}
    };
    dialog.querySelector('.ticket-film-close').onclick=()=>dialog.close();
    dialog.onclick=e=>{
      if(e.target!==dialog)return;
      const r=dialog.getBoundingClientRect();
      if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)dialog.close();
    };
    dialog.onclose=()=>{dialog.remove();opener?.focus({preventScroll:true});};
    document.body.append(dialog);show(0);dialog.showModal();next.focus({preventScroll:true});
  }
  return {snapshot,fromEntry,suggestions,attachment,play};
})();
