'use strict';

// Only the activity under the box is read. Canvas pizzas use their menu card as a text equivalent.
const allyArea = (() => {
  let attachment = null;
  const scope = () => [state.lang, sectionPhase()].join('/');
  function current() {
    if(attachment?.scope===scope())return attachment;
    const last=state.chats[guideStep()].findLast(entry=>entry.kind==='image');
    if(last?.phase!==sectionPhase()||!last.context)return null;
    return {...last.context,text:last.description||''};
  }
  const sections = [
    ['pizza', '.menu-card'], ['fee', '.fee-line'], ['balance', '.balance'],
    ['total', '.bill'], ['stock', '.stock-line'], ['ticket', '.receipt-lines'],
    ['quote', '.quote-box'], ['table', '.table-card'], ['pantry', '.pantry-tile'],
    ['brief', '.dispatch'], ['order', '.board-head'], ['result', '.end-card'],
    ['phase', '.phase'], ['hero', '.hero'], ['receipt', '.receipt']
  ];
  function targets() {
    return sections.flatMap(([kind, selector]) => Array.from(document.querySelectorAll(selector), el => ({kind, el})))
      .filter(({el}) => el.closest('main') && el.getBoundingClientRect().width);
  }
  const area = r => r.width * r.height;
  function overlap(a, b) {
    return Math.max(0, Math.min(a.right,b.right)-Math.max(a.left,b.left)) *
      Math.max(0, Math.min(a.bottom,b.bottom)-Math.max(a.top,b.top));
  }
  function name(el) {
    if (el.matches('.fee-line')) return tr('Pickup and delivery','Ramassage et livraison');
    if (el.matches('.receipt-lines')) return tr('Order lines','Articles du billet');
    const heading = el.querySelector('h1,h2,h3') || (el.matches('.balance,.bill') && el.firstElementChild);
    return (heading?.textContent || el.innerText).trim().replace(/\s+/g,' ').slice(0,90);
  }
  function excerpt(box) {
    const walker = document.createTreeWalker(document.querySelector('main'), NodeFilter.SHOW_TEXT);
    const range = document.createRange(), words = [];
    let node;
    while ((node = walker.nextNode()) && words.length < 48) {
      if (!node.textContent.trim() || !overlap(node.parentElement.getBoundingClientRect(), box)) continue;
      for (const token of node.textContent.matchAll(/\S+/g)) {
        range.setStart(node,token.index); range.setEnd(node,token.index+token[0].length);
        if (Array.from(range.getClientRects()).some(r => overlap(r,box) >= area(r)*0.35 && area(r)>0)) words.push(token[0]);
        if (words.length >= 48) break;
      }
    }
    return words.join(' ').slice(0,260);
  }
  function capture(box, entries) {
    const hits = entries.map(entry => {
      const rect = entry.el.getBoundingClientRect();
      const hit=overlap(rect,box);
      return {...entry,score:hit/Math.min(area(rect),area(box)),fit:hit/(area(rect)+area(box)-hit)};
    }).filter(entry => entry.score > 0).sort((a,b) => b.score-a.score || b.fit-a.fit);
    const words = excerpt(box);
    if (!hits.length && !words && !overlap(box,document.querySelector('main').getBoundingClientRect())) return null;
    const {el,kind} = hits[0] || {el:null,kind:'text'};
    const title = el ? name(el) : tr('Activity text','Texte de l’activité');
    const text = words || (el?.querySelector('canvas') ? el.querySelector('.menu-text p')?.textContent : '');
    const products = hits.filter(hit => hit.kind === 'pizza' && hit.score > .28)
      .map(hit => Number(hit.el.querySelector('[data-pizza]').dataset.pizza));
    const receipt=document.querySelector('#ticket .receipt');
    const isReceipt=receipt && overlap(receipt.getBoundingClientRect(),box) >= area(box)/2;
    const ticket=isReceipt ? allyTicket.snapshot() : null;
    return {scope:scope(),kind,title,text:text || title,products,index:el?.querySelector('[data-pizza]')?.dataset.pizza,ticket};
  }
  async function snapshot(box) {
    let canvas = await html2canvas(document.documentElement,{
      x:scrollX+box.left, y:scrollY+box.top, width:Math.ceil(box.width), height:Math.ceil(box.height),
      scale:Math.min(2,560/Math.max(box.width,box.height)), logging:false,
      ignoreElements:el=>el.matches('dialog,#guide-slot,#launcher-slot')
    });
    // Keep all three phases' saved conversations within the browser's storage budget.
    let src = canvas.toDataURL('image/jpeg',0.85);
    while (src.length > 32000) {
      const reduced = document.createElement('canvas');
      reduced.width=Math.max(1,Math.round(canvas.width*0.75));
      reduced.height=Math.max(1,Math.round(canvas.height*0.75));
      reduced.getContext('2d').drawImage(canvas,0,0,reduced.width,reduced.height);
      canvas=reduced; src=canvas.toDataURL('image/jpeg',0.82);
    }
    if (!src.startsWith('data:image/jpeg;base64,')) throw new Error('Empty capture');
    return {src,width:canvas.width,height:canvas.height};
  }
  function open() {
    const draft = document.getElementById('message')?.value || '';
    const picker = document.createElement('dialog');
    picker.className = 'ally-picker';
    picker.setAttribute('aria-label', tr('Screenshot','Capture d’écran'));
    picker.setAttribute('aria-describedby','ally-capture-help');
    picker.tabIndex=-1;
    picker.autofocus=true;
    const cancel=tr('Cancel screenshot','Annuler la capture');
    picker.innerHTML = '<div class="ally-drag-box" hidden></div>'+
      '<span class="sr-only" id="ally-capture-help">'+tr('Drag a box or tap an item. Use Tab to choose an item and Enter to capture it.','Trace un cadre ou touche un élément. Utilise Tab pour choisir un élément et Entrée pour le capturer.')+'</span>'+
      '<div role="status" class="ally-capture-status"></div>'+
      '<button class="ally-cancel" type="button" aria-label="'+cancel+'" title="'+cancel+'">'+icon('x')+'</button>';
    document.body.append(picker);
    const boxEl=picker.firstElementChild, status=picker.querySelector('[role="status"]');
    const entries=targets();
    function highlight(rect) {
      Object.assign(boxEl.style,{left:rect.x+'px',top:rect.y+'px',width:rect.width+'px',height:rect.height+'px'});
      boxEl.hidden=false;
    }
    function finish(picked) {
      picker.close(); picker.remove();
      if (picked) attachment=picked;
      showGuide(true);
      const input=document.getElementById('message');
      input.value=draft; input.focus({preventScroll:true});
    }
    let sending = false;
    async function use(box) {
      if (sending) return;
      const picked = capture(box,entries);
      if (!picked) {status.textContent = tr('Choose part of the activity.','Choisis une partie de l’activité.'); return;}
      sending=true;
      picker.setAttribute('aria-busy','true');
      status.textContent='';
      highlight(box);
      try {
        const image=await snapshot(box);
        if (!picker.open) return;
        const context={kind:picked.kind,products:picked.products,index:picked.index};
        const entry={kind:'image',image,description:picked.text,ticket:picked.ticket,phase:sectionPhase(),context};
        saveChatEntry(entry);
        finish(picked);
        if(!picked.ticket)answerScreenshot(entry);
      } catch {
        status.textContent=tr('Try drawing the box again.','Essaie de tracer la zone à nouveau.');
      } finally {sending=false; picker.removeAttribute('aria-busy');}
    }
    for (const {el} of entries) {
      const target=document.createElement('button');
      target.type='button'; target.className='sr-only'; target.textContent=name(el);
      target.onfocus=()=>{
        el.scrollIntoView({block:'nearest',behavior:'instant'});
        highlight(el.getBoundingClientRect());
      };
      target.onblur=()=>{boxEl.hidden=true;};
      target.onclick=()=>use(el.getBoundingClientRect());
      picker.append(target);
    }
    picker.querySelector('.ally-cancel').onclick=()=>finish();
    picker.oncancel=event=>{event.preventDefault(); finish();};
    let start = null;
    const rectangle = (x,y) => new DOMRect(Math.min(start.x,x),Math.min(start.y,y),Math.abs(x-start.x),Math.abs(y-start.y));
    picker.onpointerdown = e => {
      if (sending || e.target !== picker || !e.isPrimary || e.button !== 0) return;
      start = {x:e.clientX,y:e.clientY,id:e.pointerId};
      picker.setPointerCapture(e.pointerId);
    };
    picker.onpointermove = e => {
      if (start?.id !== e.pointerId) return;
      const b = rectangle(e.clientX,e.clientY);
      highlight(b);
    };
    picker.onpointercancel = () => {start=null; boxEl.hidden=true;};
    picker.onpointerup = e => {
      if (start?.id !== e.pointerId) return;
      let b = rectangle(e.clientX,e.clientY); start=null; boxEl.hidden=true;
      if (b.width < 6 && b.height < 6) {
        const point = new DOMRect(e.clientX-1,e.clientY-1,2,2);
        const hit = entries.find(({el})=>overlap(el.getBoundingClientRect(),point));
        b = hit ? hit.el.getBoundingClientRect() : point;
      }
      if (b.width && b.height) use(b);
    };
    showGuide(false); picker.showModal(); picker.focus({preventScroll:true});
  }
  function imageButton() {
    const label=tr('Screenshot','Capture d’écran');
    return act('select-area',icon('camera')+'<span class="ally-tooltip" aria-hidden="true">'+label+'</span>','ally-image-button','aria-label="'+label+'"');
  }
  function reply(message,kind) {
    const item = current();
    if (!item) return null;
    const input = message.toLowerCase();
    const example = kind === 'example' || /example|exemple/.test(input);
    if (/\bfees?\b|delivery|livraison|frais/.test(input) || item.kind === 'fee')
      return example ? ['How many delivery fees for one trip?', 'Pour un seul trajet, combien de fois paies-tu la livraison?'] :
        ['Trio charges $4 for the whole delivery.', 'Chez Trio, la livraison coûte 4 $ en tout.'];
    if (sectionPhase()<2 && (/compar|which one|laquelle/.test(input) || (item.products?.length>1 && !input)))return comparePizzas(item.products||[]);
    if (item.kind === 'pizza' && (/cost|prix|price|coût|cher/.test(input) || /^\$?\d+\s*\$?$/.test(item.text))) {
      const p = pizzas[Number(item.index)];
      return ['If one pizza costs $'+p.cost+', what would two cost?', 'Si une pizza coûte '+p.cost+' $, combien coûtent deux pizzas?'];
    }
    if (item.kind === 'balance' || item.kind === 'total' || /budget|afford|coût|cost|prix|price|cher/.test(input))
      return example ? ['Spending $3 from $10 leaves $7.', 'Si tu dépenses 3 $ sur 10 $, il reste 7 $.'] :
        ['After spending $'+tally().cost+', what’s left from $80?', 'Après avoir payé '+tally().cost+' $, combien reste-t-il sur 80 $?'];
    if (item.kind === 'pizza') {
      const p = pizzas[Number(item.index)];
      if(!p)return null;
      if(/kids can it feed|enfants peut-elle nourrir/.test(input)){
        const slices=p.cheese+p.pep;
        return ['How many pairs can you make with '+slices+' slices?', 'Combien de paires peux-tu faire avec '+slices+' pointes?'];
      }
      return example ? ['How many plates hold four slices, two per plate?', 'Combien d’assiettes pour quatre pointes, deux par assiette?'] :
        ['With '+p.cheese+' cheese slices, how many pairs can you make?', 'Avec '+p.cheese+' pointes au fromage, combien de paires peux-tu faire?'];
    }
    if (item.kind === 'brief') return [
      'How many slices give '+guests()+' kids two each?',
      'Combien de pointes donneront deux pointes à chacun des '+guests()+' enfants?'];
    if (['table','stock','pantry'].includes(item.kind)) return [
      'Which topping could you serve here?', 'Quelle saveur pourrais-tu servir ici?'];
    if (item.kind === 'ticket' || item.kind === 'quote') return [
      'Does buying more pizzas change the price?',
      'Le prix change-t-il si tu prends plus de pizzas?'];
    return kind==='check' ? ['What did you try first?', 'Qu’as-tu essayé en premier?'] :
      ['Which word or number is tricky?', 'Quel mot ou nombre te pose problème?'];
  }
  function questionStarters(history) {
    const index=history.length-1,entry=history[index];
    if(entry?.kind!=='image'||(entry.phase!==undefined&&entry.phase!==sectionPhase()))return '';
    const group='<div class="shot-questions" role="group" aria-label="'+tr('Suggested questions','Questions suggérées')+'">';
    const ticket=allyTicket.fromEntry(entry);
    if(ticket)return group+allyTicket.suggestions(ticket,index)+'</div>';
    const context=entry.context||{};
    let questions;
    if(context.kind==='fee'){
      questions=[tr('What is this fee?','À quoi servent ces frais?'),tr('Do I pay it twice?','Est-ce que je paie deux fois?')];
    }else if(context.kind==='pizza'&&context.products?.length>1){
      questions=[tr('How can I compare these?','Comment les comparer?'),tr('Which has more cheese?','Laquelle a plus de fromage?')];
    }else if(context.kind==='pizza'){
      questions=[tr('How many kids can it feed?','Combien d’enfants peut-elle nourrir?'),tr('Who can eat this pizza?','Qui peut manger cette pizza?')];
    }else if(['receipt','ticket','total','balance','quote'].includes(context.kind)){
      questions=[tr('What do these prices mean?','Que signifient ces prix?')];
    }else if(['stock','pantry','table'].includes(context.kind)){
      questions=[tr('Who can eat these slices?','Qui peut manger ces pointes?'),tr('Do I have enough?','Est-ce que j’en ai assez?')];
    }else if(context.kind==='brief'){
      questions=[tr('What should I count first?','Que dois-je compter en premier?'),tr('How many slices do we need?','Combien de pointes faut-il?')];
    }else{
      questions=[tr('What does this mean?','Ça veut dire quoi?'),tr('Where do I start?','Par où commencer?')];
    }
    return group+questions.map(q=>act('draft-question',safe(q),'shot-question')).join('')+'</div>';
  }
  return {open, imageButton, reply, questionStarters, current, clear:() => {attachment=null;}};
})();

