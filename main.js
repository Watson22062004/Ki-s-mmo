// GIAO DIỆN (HTML) + VÒNG LẶP GAME
const $=s=>document.querySelector(s),panel=$('#panel');
const L=(id,n)=>`<span class="name">${G.ic(id)}<span>${G.ITEMS[id].n}${n!=null?` <b class="n">×${n}</b>`:''}</span></span>`;
const bar=(v,m,w)=>`<div class="bar ${w?'warn':''}"><i style="width:${Math.min(100,v/m*100)}%"></i></div>`;
const need=r=>`<div class="ing">${Object.entries(G.RECIPES[r].need).map(([k,n])=>`<span class="${G.has(k,n)?'':'lack'}">${G.ic(k)}×${n}</span>`).join('')}</div>`;
const B=(a,id,t,c='')=>`<button class="btn ${c}" data-act="${a}" data-id="${id}">${t}</button>`;
const price=p=>`${G.ic('coin')}${p}`;
const views={
 farm(){const S=G.S;let h='<h3>Hạt giống</h3><p class="hint">Chọn hạt rồi bấm vào ô đất trên cảnh để gieo. Cây chín có dấu vàng, bấm để thu hoạch.</p>';
  for(const k in G.CROPS)h+=`<div class="row ${G.ui.seed===k?'sel':''}">${L('hat_'+k,S.inv['hat_'+k]||0)}<small>${G.CROPS[k].time} giây</small>${B('seed',k,G.ui.seed===k?'Đang chọn':'Chọn',G.ui.seed===k?'gold':'')}</div>`;
  h+='<h3>Vật nuôi</h3>';
  if(!S.animals.length)h+='<p class="empty">Chưa có con nào. Mua một con ở dưới nhé.</p>';
  S.animals.forEach((a,i)=>{const d=G.ANIMALS[a.type];h+=`<div class="row"><span class="name">${G.ic(a.type)}${d.n}</span>${a.fed&&!a.ready?bar(a.t,d.time):''}${a.ready?B('collect',i,G.ic(d.make)+'Lấy '+G.ITEMS[d.make].n.toLowerCase(),'gold'):a.fed?'<small>Đang lớn</small>':B('feed',i,G.ic('cam')+'Cho ăn')}</div>`});
  h+='<h3>Mua vật nuôi</h3>';
  for(const k in G.ANIMALS)h+=`<div class="row"><span class="name">${G.ic(k)}${G.ANIMALS[k].n}</span>${B('animal',k,price(G.ANIMALS[k].cost),'gold')}</div>`;
  return h},
 market(){let h='<h3>Mua</h3>';
  for(const k in G.ITEMS)if(G.ITEMS[k].buy)h+=`<div class="row">${L(k)}${B('buy',k,price(G.ITEMS[k].buy),'gold')}</div>`;
  h+='<h3>Bán</h3>';const inv=Object.entries(G.S.inv);
  if(!inv.length)h+='<p class="empty">Kho trống, đi thu hoạch trước đã.</p>';
  inv.forEach(([k,n])=>h+=`<div class="row">${L(k,n)}<span>${B('sell',k,'Bán 1 · '+price(G.ITEMS[k].sell),'gold')} ${B('sellall',k,'Bán hết')}</span></div>`);
  return h},
 shop(){const S=G.S;let h='<h3>Khách đang chờ</h3>';
  if(!S.customers.length)h+='<p class="empty">Chưa có khách, chuẩn bị món trước nhé.</p>';
  S.customers.forEach((c,i)=>{const f=c.p/G.CFG.patience;h+=`<div class="row">${L(c.want)}<small>có ${S.inv[c.want]||0}</small>${bar(c.p,G.CFG.patience,f<.35)}${B('serve',i,'Phục vụ',G.has(c.want)?'':'red')}</div>`});
  h+='<h3>Bếp</h3>';
  S.cooking.forEach((q,i)=>h+=`<div class="row">${L(q.r)}${i?'<small>Đang chờ</small>':bar(q.t,G.RECIPES[q.r].time)}</div>`);
  for(const k in G.RECIPES)h+=`<div class="row"><span><span class="name">${G.ic(k)}<span>${G.RECIPES[k].n}<small>Bán ${G.RECIPES[k].price} đồng · ${G.RECIPES[k].time} giây</small></span></span>${need(k)}</span>${B('cook',k,'Nấu',G.canCook(k)?'':'red')}</div>`;
  return h},
 bag(){const inv=Object.entries(G.S.inv);return '<h3>Kho đồ</h3>'+(inv.length?inv.map(([k,n])=>`<div class="row">${L(k,n)}</div>`).join(''):'<p class="empty">Trống.</p>')}
};
const acts={seed:id=>G.ui.seed=id,animal:G.buyAnimal,feed:i=>G.feed(+i),collect:i=>G.collect(+i),buy:G.buy,
 sell:id=>G.sell(id),sellall:id=>G.sell(id,1),cook:G.cook,serve:i=>G.serve(+i),reset:()=>confirm('Xoá toàn bộ tiến trình?')&&G.reset()};
function show(){$('#hud').innerHTML=`<span class="chip">${G.ic('coin')}${G.S.money}</span><span class="chip">${G.ic('sun')}Ngày ${G.S.day}</span><span class="chip">${G.ic('face')}${G.S.served}</span>`;
  $('#toast').textContent=G.msgText;panel.innerHTML=views[G.ui.tab]()}
document.addEventListener('click',e=>{const t=e.target.closest('button');if(!t)return;
  if(t.dataset.tab){G.ui.tab=t.dataset.tab;document.querySelectorAll('#tabs button').forEach(b=>b.classList.toggle('on',b===t))}
  else if(acts[t.dataset.act])acts[t.dataset.act](t.dataset.id);
  show();G.save()});
cv.addEventListener('click',e=>{const r=cv.getBoundingClientRect(),x=(e.clientX-r.left)*320/r.width,y=(e.clientY-r.top)*180/r.height;
  for(let i=0;i<G.CFG.plots;i++){const p=G.plotPos(i);if(x>=p.x&&x<p.x+34&&y>=p.y&&y<p.y+34){G.plotClick(i);show();G.save();break}}});
let last=performance.now(),acc=0;
(function loop(now){const dt=Math.min((now-last)/1000,1);last=now;
  G.updateFarm(dt);G.updateKitchen(dt);G.draw(now);
  acc+=dt;if(acc>.5){acc=0;show();G.save()}
  requestAnimationFrame(loop)})(last);
G.fillIcons(document);show();
