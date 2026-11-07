const paths = {
 grid:'<rect x="3" y="3" width="7" height="7" rx="1.4"/><rect x="14" y="3" width="7" height="7" rx="1.4"/><rect x="3" y="14" width="7" height="7" rx="1.4"/><rect x="14" y="14" width="7" height="7" rx="1.4"/>',
 layers:'<path d="m3 8 9-5 9 5-9 5zM3 12l9 5 9-5M3 16l9 5 9-5"/>',
 activity:'<path d="M2 12h5l3-8 4 16 3-8h5"/>',sprout:'<path d="M12 21v-6M12 15Q4 16 4 8q8 0 8 7ZM12 13q0-9 9-10 1 8-9 10Z"/>',
 right:'<path d="m9 5 7 7-7 7"/>',arrow:'<path d="M4 12h15m-6-6 6 6-6 6"/>',down:'<path d="m6 9 6 6 6-6"/>',
 calendar:'<rect x="3" y="5" width="18" height="16" rx="3"/><path d="M7 3v4m10-4v4M3 10h18"/>',
 spark:'<path d="m11 3 2.5 6.5L20 12l-6.5 2.5L11 21l-2.5-6.5L2 12l6.5-2.5ZM19 2l.9 2.1L22 5l-2.1.9L19 8l-.9-2.1L16 5l2.1-.9z"/>',
 people:'<circle cx="9" cy="8" r="3"/><path d="M2 20v-2a7 7 0 0 1 14 0v2M16 5a3 3 0 0 1 0 6m2 3q4 1 4 6"/>',
 file:'<path d="M6 2h9l4 4v16H6zM15 2v5h4M9 12h7m-7 4h5"/>',
 target:'<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1"/>',
 chat:'<path d="M21 11a8 8 0 0 1-8 8H8l-5 3 1-6a8 8 0 1 1 17-5Z"/><path d="M8 10h8m-8 4h5"/>',
 quiz:'<rect x="5" y="4" width="14" height="17" rx="2"/><path d="M9 3h6v3H9zM8 12l2 2 5-5m-6 9h6"/>',
 bulb:'<path d="M8.7 16.5q0-2-1.6-3.6a6.5 6.5 0 1 1 9.8 0q-1.6 1.6-1.6 3.6zM9 19h6m-5 3h4"/>',
 menu:'<path d="M3 6h18M3 12h18M3 18h18"/>',close:'<path d="m5 5 14 14M19 5 5 19"/>'
};
const icon = name => '<svg class="ico" viewBox="0 0 24 24" aria-hidden="true">'+paths[name]+'</svg>';
document.querySelectorAll('[data-i]').forEach(el=>el.outerHTML=icon(el.dataset.i));

const exercise = {
  name: 'Pizza lunch rush', guests:18, cheeseOnly:6, slicesEach:2, budget:80, delivery:4,
  menu:[
    {name:'Cheese classic', cheese:8, pepperoni:0, price:14},
    {name:'Pepperoni', cheese:0, pepperoni:8, price:11},
    {name:'Half & half', cheese:6, pepperoni:6, price:20}
  ]
};

const topics=[
  {name:'Comparing cheese portions',short:'cheese portions',
   pattern:'Students find the total slices for 18 guests, then count pepperoni toward the cheese-only table.',
   next:'Give each pair a menu. Ask them to draw two cheese slices on each of six plates, then test their order against the drawing.'},
  {name:'Making groups of two',short:'groups of two',
   pattern:'Students can make a two-slice plate for one child. Their orders still use the guest count as the slice target.',
   next:'Start with three plates and two counters per plate. Add a fourth plate and ask what changes. Then extend the pattern to 18 plates.'},
  {name:'Counting delivery once',short:'the delivery fee',
   pattern:'Students add the menu prices correctly, then charge delivery for each half-and-half pizza.',
   next:'Compare receipts for one and two Trio pizzas. Circle the delivery line and ask which amount changes with the second pizza.'}
];
const $=id=>document.getElementById(id);
const requiredSlices=exercise.guests*exercise.slicesEach;
const requiredCheese=exercise.cheeseOnly*exercise.slicesEach;

function orderTotals(cart) {
  const total={cheese:0,pepperoni:0,cost:cart[2]?exercise.delivery:0};
  exercise.menu.forEach((pizza,i)=>{
    total.cheese+=pizza.cheese*cart[i];
    total.pepperoni+=pizza.pepperoni*cart[i];
    total.cost+=pizza.price*cart[i];
  });
  return {...total,slices:total.cheese+total.pepperoni};
}
const approaches=[
  {cart:[0,3,1],note:'18 + 18 = 36. My order has 36 slices, so everyone can eat.',
   known:'Correctly doubles 18 to get the 36-slice target.',
   next:'Check whether there are 12 cheese slices for the six cheese-only guests.',
   question:'How can I compare these?',
   inference:'may overlook toppings when comparing pizzas, counting 36 slices even though only 6 are cheese.',
   hint:'Cheese classic has 8 cheese slices. Half & half has 6. Which fills more two-slice cheese plates?'},
  {cart:[0,4,1],note:'I counted 44 slices. That is more than 36, so all six cheese eaters are covered.',
   known:'Compares the order total with 36 correctly.',
   next:'Separate the cheese slices before checking who can eat.',
   question:'There are enough slices. Why are kids still waiting?',
   inference:'may miss who can eat which slices because they count all 44 together.',
   hint:'Your half-and-half gives you 6 cheese slices. Make plates of 2. How many cheese eaters get a plate?'},
  {cart:[1,2,0],note:'Three kids get six slices. For the big group I checked whether my order had at least 18 slices.',
   known:'Makes three equal groups of two in a small example.',
   next:'Apply the same grouping to all 18 children.',
   question:'I have 24 slices for 18 kids. Is that enough?',
   inference:'may be counting one slice per child, aiming for 18 slices for 18 kids.',
   hint:'Put your 24 slices into pairs. How many children could take one pair?'},
  {cart:[1,2,2],receiptEstimate:84,note:'The pizzas cost $76. Two Trio pizzas mean two $4 fees, so I got $84.',
   known:'Adds the pizza prices correctly to get $76.',
   next:'Distinguish a fee per delivery from a price per pizza.',
   question:'I got $84. Why does the receipt say $80?',
   inference:'may think delivery costs $4 per pizza because they added the fee twice.',
   hint:'Both Trio pizzas arrive in one delivery. What do you get when you add $4 to $76 once?'},
  {cart:[2,3,0],note:'I need 36 slices, including 12 cheese. I have 40 slices and 16 are cheese. My $61 order fits.',
   known:'Checks total slices, cheese portions and price separately.',
   next:'Adjust the plan when four more guests arrive, two of them cheese-only.',
   question:'What changes when four more kids arrive?',
   inference:'is planning for more guests after correctly filling the first order.',
   hint:'Give each new guest two slices. How many extra cheese slices do the two new cheese eaters need?'}
];


const classes = [
  {id:'3a', name:'Math 3A', size:24, active:[22,20], mixes:[[10,6,4],[8,5,3]], offset:0, color:'lilac'},
  {id:'3b', name:'Math 3B', size:20, active:[19,18], mixes:[[4,9,3],[4,7,4]], offset:24, color:'mint'},
  {id:'3c', name:'Math 3C', size:18, active:[17,16], mixes:[[3,4,8],[2,4,7]], offset:44, color:'butter'}
];
const names = ('Maya Leo Nora Eli Ava Theo Zoe Luca Iris Noah Sara Owen Jade Finn Aria Milo Lucy Adam Ella Liam Ruby Alex Nina Hugo '+
  'Amir Isla Ezra Emma Ryan Cleo Evan Ines Lina Remy Sami Rose Felix Hana Axel Mina Lila Leon Esme Nico '+
  'Anya Ben Cora Dylan Eden Freya Gabe Hazel Ivan June Kai Lena Max Neve Omar Pia Ravi Tess').split(' ');
const labels=['Checking cheese portions','Making groups of two','Counting delivery once'];
let currentClass, week, studentView, roster, ranking;

function mainGap(attempt) {
  const total=orderTotals(attempt.cart);
  if(total.slices<requiredSlices)return 1;
  if(total.cheese<requiredCheese)return 0;
  if(attempt.receiptEstimate!==undefined && attempt.receiptEstimate!==total.cost)return 2;
  return null;
}

// Sample submissions are ordered oldest first. The most recent occurrence breaks a tie.
function summarize(attempts) {
  const counts=new Map();
  attempts.forEach((attempt,i)=>{
    const gap=mainGap(attempt);
    if(gap!==null)counts.set(gap,{gap,count:(counts.get(gap)?.count||0)+1,last:i});
  });
  return [...counts.values()].sort((a,b)=>b.count-a.count||b.last-a.last)[0];
}

function classRoster(group,period) {
  const mix=group.mixes[period];
  return Array.from({length:group.size},(_,i)=>{
    const student={id:i+1,name:names[group.offset+i],age:(group.offset+i)%3===2?9:8,attempts:[]};
    if(i>=group.active[period])return student;
    const slot=(i*5+period*3)%group.active[period];
    const position=(i+group.offset+period*3)%group.active[period];
    const gap=position<mix[0]?0:position<mix[0]+mix[1]?1:position<mix.reduce((a,b)=>a+b)?2:null;
    const primary=gap===null?4:gap===0?i%2:gap+1;
    const warmup=gap===null?4:slot%3===0?(gap===2?0:gap+2):4;
    student.attempts=[approaches[warmup],approaches[primary],approaches[primary]];
    student.summary=summarize(student.attempts);
    return student;
  });
}

function status(student) {
  return student.summary?labels[student.summary.gap]:student.attempts.length?'Exercise goals met':'No work this week';
}
function studentButton(student) {
  return `<button class="student-row" data-student="${student.id}">
    <span class="initial">${student.name[0]}</span><span class="student-name">${student.name}</span>
    <span class="student-status">${status(student)}</span>${icon('right')}</button>`;
}
function directory() {
  document.title='My classes | Alloprof Teacher zone';
  return `<section class="page-intro directory-intro"><div><h1>My classes</h1>
    <small class="sample-note">Sample classes</small></div><img class="intro-ally" src="assets/ally-mascot.webp" width="192" height="192" alt="Ally waving"></section>
    <nav class="directory panel" aria-label="Classes">${classes.map(c=>`<a class="class-row" href="#class/${c.id}">
      <span aria-hidden="true" class="class-mark ${c.color}"></span><strong class="class-name">${c.name}</strong>
      <span class="roster-size">${c.size} students</span>${icon('right')}</a>`).join('')}</nav>`;
}
function rankRows() {
  return ranking.filter(group=>group.students.length).map((group,i)=>`<details class="rank-row">
    <summary><span class="rank-number">${i+1}</span><strong class="rank-body">${labels[group.gap]}</strong>
    <span class="count">${group.students.length} students</span>${icon('down')}</summary>
    <div class="matches">${group.students.map(studentButton).join('')}</div></details>`).join('');
}
function classUrl(view,period=week) {return `#class/${currentClass.id}/${view}/${period}`;}
function classPage() {
  document.title=currentClass.name+' | Alloprof Teacher zone';
  const ordered=[...ranking.flatMap(group=>group.students),...roster.filter(s=>!s.summary)];
  return `<div class="top-line"><a class="back-link" href="#classes">← Classes</a>
    <label class="week-select">${icon('calendar')}<select aria-label="Reporting week" id="week"><option value="0" ${week===0?'selected':''}>This week</option><option value="1" ${week===1?'selected':''}>Last week</option></select></label></div>
    <div class="page-intro class-intro"><h1>${currentClass.name}</h1><button class="exercise-name" data-exercise>Pizza lunch rush</button></div>
    <section class="panel results"><div class="ally-toolbar"><img src="assets/ally-mascot.webp" width="48" height="48" alt=""><h2>Ally’s summary</h2></div>
    <nav class="view-switch" aria-label="Summary view"><a aria-current="${studentView?'false':'page'}" href="${classUrl('gaps')}">Difficulties</a>
    <a aria-current="${studentView?'page':'false'}" href="${classUrl('students')}">Students</a></nav>
    ${studentView?ordered.map(studentButton).join(''):rankRows()}</section>`;
}
function render() {
  const [page,id,view,period]=location.hash.slice(1).split('/');
  currentClass=page==='class'?classes.find(c=>c.id===id):null;
  week=period==='1'?1:0;
  studentView=view==='students';
  if(currentClass){
    roster=classRoster(currentClass,week);
    ranking=topics.map((_,gap)=>({gap,students:roster.filter(student=>student.summary?.gap===gap)}))
      .sort((a,b)=>b.students.length-a.students.length||a.gap-b.gap);
  }
  $('main').innerHTML=currentClass?classPage():directory();
}
function show(body) {
  $('details').innerHTML=body;
  $('detail').setAttribute('aria-label',$('details').querySelector('h2').textContent);
  $('detail').showModal();
  $('detail').scrollTop=0;
}
function studentDetail(id) {
  const s=roster.find(student=>student.id===id);
  if(!s)return;
  const evidence=s.summary?s.attempts[s.summary.last]:s.attempts.at(-1);
  const heading=`<div class="eyeline">${currentClass.name} · Age ${s.age}</div><h2>${s.name}</h2>`;
  if(!evidence)return show(heading+'<p>No pizza work submitted this week.</p>');
  const newestFirst=s.attempts.slice().reverse();
  const questions=newestFirst.filter((attempt,i)=>attempt.question &&
    newestFirst.findIndex(other=>other.question===attempt.question)===i);
  function questionCard(attempt) {
    return `<section class="question-pair"><h3>${s.name} asked</h3>
      <blockquote>“${attempt.question}”</blockquote>
      <div class="hint"><strong>What Ally noticed</strong><p>${s.name} ${attempt.inference}</p></div></section>`;
  }
  const [latest,...earlier]=questions;
  const past=earlier.length?`<details class="work-example"><summary>Earlier questions (${earlier.length})</summary>
    ${earlier.map(questionCard).join('')}</details>`:'';
  show(heading+`<h3>${status(s)}</h3>${s.summary?'<p>'+s.summary.count+' of '+s.attempts.length+' attempts</p>':''}
    ${latest?questionCard(latest):'<p>No questions recorded this week.</p>'}${past}`);
}
function exerciseDetail() {
  show(`<div class="eyeline">Math exercise</div><h2>Pizza lunch rush</h2><p>Feed 18 children two slices each on an $80 budget. Six eat only cheese.</p>
    <div class="menu-list">${exercise.menu.map(p=>`<div><strong>${p.name}</strong><span>${p.cheese} cheese · ${p.pepperoni} pepperoni · $${p.price}</span></div>`).join('')}</div>
    <p>Half & half adds a $4 delivery fee once per order.</p>`);
}
document.addEventListener('change',event=>{
  if(event.target.id==='week')location.hash=classUrl(studentView?'students':'gaps',Number(event.target.value));
});
document.addEventListener('click',event=>{
  const button=event.target.closest('button');
  if(button?.matches('.close'))$('detail').close();
  else if(button?.hasAttribute('data-student'))studentDetail(Number(button.dataset.student));
  else if(button?.hasAttribute('data-exercise'))exerciseDetail();
});
window.addEventListener('hashchange',()=>{
  if($('detail').open)$('detail').close();
  render();
  $('main').focus({preventScroll:true});
  window.scrollTo(0,0);
});
render();
