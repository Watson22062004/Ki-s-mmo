// VẼ CẢNH TRÊN CANVAS (320x180) — toàn bộ bằng khối pixel
const cv=document.getElementById('cv'),cx=cv.getContext('2d');
const R=(x,y,w,h,c)=>{cx.fillStyle=c;cx.fillRect(x|0,y|0,w|0,h|0)};
G.plotPos=i=>({x:12+(i%4)*38,y:14+Math.floor(i/4)*38});
const tufts=Array.from({length:40},(_,i)=>[(i*97)%316,(i*53)%176]);
function drawCrop(x,y,p,c){const g=p.t/c.time;
  if(g<.33){R(x+15,y+20,3,5,'#3f8a3a');R(x+12,y+19,3,2,'#6fb04e');R(x+18,y+19,3,2,'#6fb04e')}
  else if(g<1){R(x+15,y+10,3,15,'#3f8a3a');R(x+9,y+12,6,4,'#6fb04e');R(x+18,y+14,6,4,'#6fb04e')}
  else{R(x+15,y+8,3,17,'#3f8a3a');R(x+9,y+4,15,9,'#2a1a10');R(x+10,y+5,13,7,c.color);R(x+12,y+6,4,2,'#fff8')}}
function drawAnimal(a,i,t){const d=G.ANIMALS[a.type],bx=172+(i%3)*46,by=26+Math.floor(i/3)*40,w=Math.sin(t/400+i)*2;
  R(bx+w+2,by+22,22,3,'#0003');
  if(a.type==='ga'){R(bx+w,by+8,15,11,'#2a1a10');R(bx+w+1,by+9,13,9,'#fffaf0');R(bx+w+9,by+2,8,8,'#2a1a10');R(bx+w+10,by+3,6,6,'#fffaf0');R(bx+w+16,by+5,3,3,'#e8892a');R(bx+w+12,by,3,3,'#c8462e');R(bx+w+3,by+11,6,3,'#e6d9bd')}
  else{R(bx+w,by+4,26,16,'#2a1a10');R(bx+w+1,by+5,24,14,'#fffaf0');R(bx+w+5,by+7,8,6,'#5a3a20');R(bx+w+16,by+11,6,5,'#5a3a20');R(bx+w+22,by,10,11,'#2a1a10');R(bx+w+23,by+1,8,9,'#fffaf0');R(bx+w+26,by+7,5,4,'#f1c9a0');R(bx+w+3,by+19,4,5,'#2a1a10');R(bx+w+20,by+19,4,5,'#2a1a10')}
  if(a.ready){R(bx+6,by-12+Math.sin(t/200)*2,12,10,'#2a1a10');R(bx+7,by-11+Math.sin(t/200)*2,10,8,'#f2b632')}
  else if(!a.fed){R(bx+6,by-12,12,10,'#2a1a10');R(bx+7,by-11,10,8,'#c8462e')}}
G.draw=t=>{const S=G.S;
  for(let y=0;y<180;y+=10)for(let x=0;x<320;x+=10)R(x,y,10,10,(x+y)/10%2?'#6aa84f':'#63a049');
  tufts.forEach(([x,y])=>{R(x,y,1,3,'#4f8a3a');R(x+2,y+1,1,2,'#4f8a3a')});
  // chuồng + hàng rào
  R(166,10,148,98,'#2a1a10');R(169,13,142,92,'#a67c4a');for(let x=169;x<311;x+=12)R(x,13,2,92,'#9a7040');
  for(let x=164;x<314;x+=12){R(x,6,5,18,'#5a3a20');R(x+1,7,3,16,'#8b5a2b')}R(164,12,150,3,'#8b5a2b');
  S.plots.forEach((p,i)=>{const{x,y}=G.plotPos(i);R(x-2,y-2,38,38,'#2a1a10');R(x,y,34,34,'#6b4423');
    for(let k=4;k<34;k+=8)R(x+2,y+k,30,2,'#7d5230');
    if(p)drawCrop(x,y,p,G.CROPS[p.crop]);
    if(p&&p.t>=G.CROPS[p.crop].time)R(x+12,y-6+Math.sin(t/180)*2,10,5,'#f2b632');
    if(i===G.hover)R(x-2,y-2,38,3,'#f2b632')});
  S.animals.forEach((a,i)=>drawAnimal(a,i,t));
  // quầy xôi: mái sọc đỏ trắng
  R(8,126,146,50,'#2a1a10');R(11,140,140,33,'#8b5a2b');R(11,140,140,3,'#5a3a20');
  for(let x=11;x<151;x+=14){R(x,128,14,14,(x-11)/14%2?'#fffaf0':'#c8462e')}R(8,126,146,3,'#2a1a10');
  [[20,'#fffaf0','#e9d98a'],[56,'#fffaf0','#d98a3a'],[92,'#fffaf0','#fff8e8']].forEach(([x,a,b])=>{R(x,152,28,18,'#2a1a10');R(x+2,154,24,14,'#c8462e');R(x+2,150,24,6,a);R(x+4,148,20,4,b)});
  if(S.cooking.length)for(let k=0;k<3;k++)R(170+k*8+Math.sin(t/300+k)*3,104-((t/40+k*9)%22),3,3,'#fff9');
  S.customers.forEach((c,i)=>{const x=172+i*34,f=c.p/G.CFG.patience;R(x,128,14,22,'#2a1a10');R(x+2,130,10,18,['#3b6ea5','#a53b6e','#3ba56e','#a5883b'][i%4]);
    R(x+1,118,12,12,'#2a1a10');R(x+2,119,10,10,'#f1c9a0');R(x+2,119,10,3,'#2a1a10');
    R(x-2,110,20,5,'#2a1a10');R(x-1,111,18*f,3,f>.5?'#7bc96f':'#e2674a')})};
