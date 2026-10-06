// ICON PIXEL ART 8x8 tự vẽ bằng chuỗi ký tự. Mỗi ký tự = 1 màu trong bảng P. Tự thêm viền tối.
(()=>{
const P={k:'#2a1a10',w:'#fff3d6',y:'#f2b632',g:'#6fb04e',G:'#3f8a3a',b:'#8b5a2b',B:'#5a3a20',r:'#c8462e',p:'#f1c9a0',c:'#e8d27a',e:'#fffaf0',o:'#e8892a',d:'#d9a066',s:'#8fc8e0',n:'#6b4a30'};
const S={
 nep:['......cc','.....ccc','....ccc.','...ccc..','..cc.G..','....G...','....G...','....G...'],
 dau_xanh:['......GG','.....GgG','....GggG','...GggG.','..GggG..','.GggG...','GggG....','.GG.....'],
 hanh:['..g...g.','..g...g.','.gg..gg.','.gGg.gG.','..GgGg..','...GG...','...ee...','...ee...'],
 dua:['..bbbb..','.bbbbbb.','bbwbbbbb','bwbbbbBb','bbbbbbbb','bbBbbbbb','.bbbbbb.','..bbbb..'],
 trung:['...ee...','..eeee..','.eeeeee.','.eeeeee.','.eeeeee.','.eeepee.','..eppe..','...ee...'],
 sua:['..nnnn..','...ww...','..wwww..','..wwww..','..ssss..','..wwww..','..wwww..','..wwww..'],
 cam:['..yyyy..','.yyyyyy.','..bbbb..','.bbbbbb.','bbybybbb','bbbbbbbb','bybbybyb','.bbbbbb.'],
 duong:['........','..wwww..','.wwwwws.','wwwwwwss','wwwwwsss','wwwwsss.','.ssss...','........'],
 muoi:['..bbbb..','..bwbw..','..wwww..','.wwwwww.','.wsswww.','.wwwwww.','.wwwwww.','..wwww..'],
 seed:['........','...yy...','..yyyy..','.yyoyy..','.yyyyy..','..yyy...','...y....','........'],
 bowl:['........','.aaaaaa.','eeeeeeee','rrrrrrrr','.rrrrrr.','.rrrrrr.','..rrrr..','........'],
 flan:['........','..bbbb..','.bbbbbb.','.yyyyyy.','.yyyyyy.','.yyyyyy.','wwwwwwww','........'],
 ga:['....r...','...eee..','..eeeeo.','.eeeee..','eeeeee..','eeeee...','..o.o...','........'],
 bo:['n......n','nddddddn','.dddddd.','dkddddkd','.dddddd.','..pppp..','..pkkp..','..pppp..'],
 coin:['..yyyy..','.yooooy.','yoyyyyoy','yoyooyoy','yoyooyoy','yoyyyyoy','.yooooy.','..yyyy..'],
 sun:['...y....','y..y..y.','.yyyyy..','.yyyyy.y','yyyyyyy.','.yyyyy..','y..y..y.','...y....'],
 face:['..BBBB..','.BBBBBB.','.pppppp.','.pkppkp.','.pppppp.','..prrp..','.rrrrrr.','.rrrrrr.']
};
const tint={xoi_dau:'#9ac45a',xoi_man:'#d98a3a',xoi_dua:'#fff8e8'};
const cache={};
function make(rows,over={}){const c=document.createElement('canvas');c.width=c.height=10;const x=c.getContext('2d');
 const px=(i,j)=>rows[j]&&rows[j].padEnd(8,'.')[i];const f=(i,j)=>{const k=px(i,j);return k&&k!=='.'};
 for(let j=-1;j<9;j++)for(let i=-1;i<9;i++){
  if(f(i,j)){x.fillStyle=over[px(i,j)]||P[px(i,j)]||'#f0f';x.fillRect(i+1,j+1,1,1)}
  else if(f(i+1,j)||f(i-1,j)||f(i,j+1)||f(i,j-1)){x.fillStyle=P.k;x.fillRect(i+1,j+1,1,1)}}
 return c.toDataURL()}
G.iconUrl=id=>cache[id]||(cache[id]=
 id.startsWith('hat_')?make(S.seed,{y:G.CROPS[id.slice(4)].color}):
 tint[id]?make(S.bowl,{a:tint[id]}):S[id]?make(S[id]):id==='flan'?make(S.flan):make(S.face));
G.ic=id=>`<img class="ic" alt="" src="${G.iconUrl(id)}">`;
G.fillIcons=root=>root.querySelectorAll('[data-ic]').forEach(e=>e.innerHTML=G.ic(e.dataset.ic));
})();
