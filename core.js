/* core.js v2 - lõi dùng chung: save, kho, tiền, nhiệm vụ, camera, chạm để đi, menu chạm vào vật */
(function () {
'use strict';
const W = 260, H = 120, T = 16, TOP = 14, K = '#1b1420', KEY = 'pixelfarm_v2';
const NAMES = { seed_carrot: 'HAT CA ROT', seed_rice: 'HAT LUA', carrot: 'CA ROT', rice: 'LUA GAO', egg: 'TRUNG', pork: 'THIT', soup: 'SUP CA ROT', friedrice: 'COM CHIEN', grill: 'THIT NUONG' };
const RECIPES = [
  { id: 'grill', need: { pork: 1 }, price: 60, hint: 'THIT' },
  { id: 'friedrice', need: { rice: 1, egg: 1 }, price: 45, hint: 'LUA+TRUNG' },
  { id: 'soup', need: { carrot: 2 }, price: 30, hint: '2 CA ROT' }
];
const QUESTS = [['THU 3 CA ROT', 'carrot', 3, 30], ['NAU 1 MON AN', 'cook', 1, 40], ['BAN 3 MON AN', 'sold', 3, 80], ['THU 3 TRUNG', 'egg', 3, 50], ['THU 5 LUA GAO', 'rice', 5, 100]];
const DEF = () => ({
  money: 30,
  inv: { seed_carrot: 3, seed_rice: 2, carrot: 0, rice: 0, egg: 0, pork: 0, soup: 0, friedrice: 0, grill: 0 },
  plots: Array.from({ length: 12 }, () => ({ s: null, w: 0, t: 0 })),
  pen: [Date.now(), Date.now(), Date.now(), Date.now()],
  st: { carrot: 0, rice: 0, egg: 0, cook: 0, sold: 0 }, q: 0, spawn: null
});
let G;
try { G = Object.assign(DEF(), JSON.parse(localStorage.getItem(KEY) || '{}')); } catch (e) { G = DEF(); }
const save = () => { try { localStorage.setItem(KEY, JSON.stringify(G)); } catch (e) {} };

/* font pixel 3x5 */
const F = {};
('0:111101101101111,1:010110010010111,2:111001111100111,3:111001111001111,4:101101111001001,5:111100111001111,6:111100111101111,7:111001001010010,8:111101111101111,9:111101111001111,' +
 'A:010101111101101,B:110101110101110,C:011100100100011,D:110101101101110,E:111100110100111,F:111100110100100,G:011100101101011,H:101101111101101,I:111010010010111,J:001001001101010,K:101101110101101,L:100100100100111,M:101111111101101,' +
 'N:110101101101101,O:010101101101010,P:110101110100100,Q:010101101111011,R:110101110101101,S:011100010001110,T:111010010010010,U:101101101101111,V:101101101101010,W:101101111111101,X:101101010101101,Y:101101010010010,Z:111001010100111,' +
 '::000010000010000,+:000010111010000,-:000000111000000,/:001001010100100,.:000000000000010,%:101001010100101,<:001010100010001').split(',').forEach(s => F[s[0]] = s.slice(2));
const tw = s => String(s).length * 4 - 1;
function text(c, s, x, y, col) {
  s = String(s).toUpperCase();
  [[1, 1, K], [0, 0, col || '#f1ead8']].forEach(([ox, oy, cl]) => {
    c.fillStyle = cl;
    for (let i = 0; i < s.length; i++) {
      const g = F[s[i]]; if (!g) continue;
      for (let j = 0; j < 15; j++) if (g[j] === '1') c.fillRect(x + i * 4 + (j % 3) + ox, y + ((j / 3) | 0) + oy, 1, 1);
    }
  });
}
function box(c, x, y, w, h, m, hi, sh) {
  c.fillStyle = K; c.fillRect(x, y, w, h);
  c.fillStyle = m; c.fillRect(x + 1, y + 1, w - 2, h - 2);
  c.fillStyle = hi; c.fillRect(x + 1, y + 1, w - 2, 1); c.fillRect(x + 1, y + 1, 1, h - 2);
  c.fillStyle = sh; c.fillRect(x + 1, y + h - 2, w - 2, 1); c.fillRect(x + w - 2, y + 1, 1, h - 2);
}
const mix = (h, a) => { const n = parseInt(h.slice(1), 16), f = v => Math.max(0, Math.min(255, Math.round(a > 0 ? v + (255 - v) * a : v * (1 + a)))); return '#' + [16, 8, 0].map(sh => f((n >> sh) & 255).toString(16).padStart(2, '0')).join(''); };
// chibi cuc manh: dau 14x11, than 8x5, mat 2 diem den, trang phuc/mu la nhan dien. (x,y)=giua chan. d: 0 xuong,1 len,2 trai,3 phai
function chibi(c, x, y, d, st, hair, shirt, hat) {
  x = Math.round(x); y = Math.round(y);
  const hy = y - (st ? 1 : 0), by = hy - 8, hd = hy - 19;
  c.fillStyle = K; c.fillRect(x - 3, y - 3, 2, 3 - (st === 1 ? 1 : 0)); c.fillRect(x + 1, y - 3, 2, 3 - (st === 2 ? 1 : 0));
  c.fillRect(x - 4, by, 8, 5); c.fillRect(x - 5, by + 1, 1, 3); c.fillRect(x + 4, by + 1, 1, 3);
  c.fillStyle = shirt; c.fillRect(x - 3, by + 1, 6, 3); c.fillStyle = mix(shirt, .4); c.fillRect(x - 3, by + 1, 6, 1); c.fillStyle = mix(shirt, -.3); c.fillRect(x - 3, by + 3, 6, 1);
  c.fillStyle = K; c.fillRect(x - 7, hd, 14, 11);
  c.fillStyle = '#ffd9a8'; c.fillRect(x - 6, hd + 1, 12, 9); c.fillStyle = '#ffe8c8'; c.fillRect(x - 6, hd + 1, 12, 1); c.fillStyle = '#e8b888'; c.fillRect(x - 6, hd + 9, 12, 1);
  c.fillStyle = hair; c.fillRect(x - 6, hd + 1, 12, d === 1 ? 8 : 3);
  if (d !== 1) { c.fillStyle = K; const e = d === 0 ? [-3, 2] : d === 2 ? [-5, -1] : [0, 4]; c.fillRect(x + e[0], hd + 6, 1, 2); c.fillRect(x + e[1], hd + 6, 1, 2); }
  if (hat === 'straw') { c.fillStyle = K; c.fillRect(x - 9, hd - 1, 18, 4); c.fillRect(x - 5, hd - 5, 10, 5); c.fillStyle = '#ffd860'; c.fillRect(x - 8, hd, 16, 2); c.fillRect(x - 4, hd - 4, 8, 4); c.fillStyle = '#fff0a0'; c.fillRect(x - 4, hd - 4, 8, 1); c.fillStyle = '#e04848'; c.fillRect(x - 4, hd - 1, 8, 1); }
  else if (hat === 'cap') { c.fillStyle = K; c.fillRect(x - 7, hd - 3, 14, 5); if (d !== 1) c.fillRect(x - 8, hd + 1, 16, 3); c.fillStyle = '#e84848'; c.fillRect(x - 6, hd - 2, 12, 3); c.fillStyle = '#ff8080'; c.fillRect(x - 6, hd - 2, 12, 1); if (d !== 1) { c.fillStyle = '#b02828'; c.fillRect(x - 7, hd + 1, 14, 2); } }
  else if (hat === 'chef') { c.fillStyle = K; c.fillRect(x - 6, hd - 8, 12, 9); c.fillStyle = '#fffbe8'; c.fillRect(x - 5, hd - 7, 10, 7); c.fillStyle = '#c8c0b0'; c.fillRect(x - 5, hd - 2, 10, 1); }
}

/* sprite pixel 12 cot: k vien den, w trang, a xam, r do, o cam, h cam sang, d cam toi, g xanh, G xanh dam, y vang, Y vang dam, p hong, P hong dam, b nau, B nau dam */
const SPC = { k: K, w: '#fffbe8', a: '#c8c0b0', r: '#e04848', o: '#f08830', h: '#ffb050', d: '#c06020', g: '#58c040', G: '#389030', y: '#ffe060', Y: '#d0a830', p: '#ffb8c0', P: '#e888a0', b: '#b07840', B: '#7a4a28' };
const S = {
  carrot: ['..g..gg..g..', '...gggggg...', '...kkkkkk...', '..khhooodk..', '..khoooodk..', '...koooodk..', '...kooodk...', '....koodk...', '.....kodk...', '.....kdk....', '......k.....'],
  rice: ['.y...yy...y.', '.yy.yYYy.yy.', '.yYyyYYyyYy.', '..yYyyYyYy..', '...gyyYyg...', '...g..g..g..', '...g..g..g..', '...G..G..G..', '..GGGGGGGG..'],
  sprout: ['...gg..gg...', '....gggg....', '.....gG.....', '.....G......', '....bbbb....', '...bBBBBb...'],
  seed: ['............', '....bbbb....', '...bBBBBb...'],
  chicken: ['....rr......', '...kkkkk....', '..kwkwwkwk..', '..kwwwoowwk.', '.kwwwwwwwwk.', '.kwwwwwwwak.', '.kwwwwwwwak.', '..kwwwwwak..', '...kkkkkk...', '....o..o....'],
  pig: ['..kk....kk..', '.kppkkkkppk.', '.kppppppppk.', '.kpkppppkpk.', '.kpPPPPPPpk.', '.kpPkPPkPpk.', '.kppPPPPppk.', '..kppppppk..', '...kkkkkk...', '..kk....kk..']
};
const SC = new Map();
function spr(c, rows, x, y, s) {
  let cv = SC.get(rows);
  if (!cv) {
    cv = document.createElement('canvas'); cv.width = 12; cv.height = rows.length; const x2 = cv.getContext('2d');
    rows.forEach((r, j) => { for (let i = 0; i < r.length; i++) if (r[i] !== '.') { x2.fillStyle = SPC[r[i]]; x2.fillRect(i, j, 1, 1); } });
    SC.set(rows, cv);
  }
  c.drawImage(cv, Math.round(x), Math.round(y), 12 * (s || 1), rows.length * (s || 1));
}

/* tile procedural: 0 co, 1 gach, 2 san go, 3 duong da, 4 dat cay, 5 nuoc */
const rng = s => () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296);
const TC = {};
const PAL = [['#7ec850', '#6bb542', '#9ae068'], ['#d0745a', '#a85440', '#e8947a'], ['#d8a868', '#b88848', '#eec888'], ['#d8cba0', '#bfae80', '#ece2c0'], ['#9a6a3c', '#7a4f2a', '#b4824e'], ['#4ab0e8', '#3890cc', '#80d0f8']];
function tile(t, v) {
  const k = t * 4 + v; if (TC[k]) return TC[k];
  const cv = document.createElement('canvas'); cv.width = cv.height = T;
  const x = cv.getContext('2d'), r = rng(k + 7), [b, d, l] = PAL[t];
  x.fillStyle = b; x.fillRect(0, 0, T, T);
  if (t === 1) {
    x.fillStyle = d;
    for (let y = 0; y < T; y += 4) { x.fillRect(0, y, T, 1); for (let a = (y / 4 % 2) * 4; a < T; a += 8) x.fillRect(a, y, 1, 4); }
    x.fillStyle = l; for (let y = 1; y < T; y += 4) for (let a = ((y >> 2) % 2) * 4; a < T; a += 8) x.fillRect(a + 1, y, 3, 1);
  } else if (t === 2) { x.fillStyle = d; for (let y = 7; y < T; y += 8) x.fillRect(0, y, T, 1); x.fillRect(v * 3 + 2, 0, 1, 7); x.fillRect(v * 3 + 8, 8, 1, 7); }
  else if (t === 4) { x.fillStyle = d; x.fillRect(0, 4, T, 2); x.fillRect(0, 10, T, 2); x.fillStyle = l; x.fillRect(0, 3, T, 1); x.fillRect(0, 9, T, 1); }
  else if (t === 5) { x.fillStyle = l; x.fillRect(2 + v * 2, 5, 4, 1); x.fillRect(8, 11, 4, 1); }
  for (let i = 0; i < 4; i++) { x.fillStyle = r() > .5 ? d : l; x.fillRect((r() * 16) | 0, (r() * 16) | 0, 1, 1); }
  if (t === 0 && v === 1) { x.fillStyle = '#c8b86a'; x.fillRect(4, 9, 1, 1); x.fillRect(11, 4, 1, 1); }
  return (TC[k] = cv);
}

const Core = { W, H, T, G, NAMES, RECIPES, save, text, box, chibi, spr, S, K, tw };
let msg = '', msgT = 0, menu = null, bag = false;
Core.toast = s => { msg = s; msgT = 2.5; };
Core.open = (title, items) => { menu = { title, items }; };
Core.stat = (k, n) => {
  G.st[k] += n || 1;
  while (G.q < QUESTS.length && G.st[QUESTS[G.q][1]] >= QUESTS[G.q][2]) { G.money += QUESTS[G.q][3]; Core.toast('XONG NV! +' + QUESTS[G.q][3]); G.q++; }
};
Core.canCook = r => Object.keys(r.need).every(k => G.inv[k] >= r.need[k]);
Core.cook = r => { for (const k in r.need) G.inv[k] -= r.need[k]; G.inv[r.id]++; Core.stat('cook'); Core.toast('NAU XONG ' + NAMES[r.id]); };
Core.grid = (cols, rows, base, rects) => {
  const g = Array.from({ length: rows }, () => Array(cols).fill(base));
  rects.forEach(([t, x, y, w, h]) => { for (let j = y; j < y + h; j++) for (let i = x; i < x + w; i++) if (g[j] && g[j][i] !== undefined) g[j][i] = t; });
  return g.map(r => r.join(''));
};
Core.tree = (tx, ty) => ({
  x: tx * T + 4, y: ty * T + 8, w: 8, h: 8, solid: true,
  draw(c) { const x = tx * T, y = ty * T; box(c, x + 6, y + 4, 5, 12, '#b07840', '#d09858', '#7a4a28'); box(c, x - 3, y - 16, 22, 20, '#58c040', '#90e868', '#389030'); c.fillStyle = '#90e868'; c.fillRect(x + 2, y - 11, 3, 2); c.fillRect(x + 11, y - 8, 3, 2); }
});
Core.npc = (x, y, hair, shirt, fn, hat) => ({ x: x - 5, y: y - 6, w: 10, h: 6, solid: true, hh: 24, menu: fn, draw(c, n) { chibi(c, x, y, 0, Math.sin(n / 300 + x) > .6 ? 1 : 0, hair, shirt, hat); } });
let busy = false;
Core.go = (file, spawn) => { if (busy) return; busy = true; G.spawn = spawn; save(); location.href = file; };

Core.start = function (map) {
  const cv = document.getElementById('g'), c = cv.getContext('2d');
  cv.width = W; cv.height = H; c.imageSmoothingEnabled = false;
  const fit = () => { const s = Math.max(1, Math.floor(Math.min(innerWidth / W, innerHeight / H))); cv.style.width = W * s + 'px'; cv.style.height = H * s + 'px'; };
  addEventListener('resize', fit); fit();
  const ww = map.cols * T, wh = map.rows * T, VH = H - TOP, tiles = map.tiles, objs = map.objs();
  const sp = G.spawn || map.spawn; G.spawn = null;
  const pl = { x: sp.x, y: sp.y, d: 0, st: 0, tm: 0, goal: null, stuck: 0 };
  let cx = 0, cy = 0;
  const tAt = (px, py) => { const tx = Math.floor(px / T), ty = Math.floor(py / T); return tiles[ty] ? +tiles[ty][tx] : 1; };
  const inR = (o, x, y) => x >= o.x && x < o.x + o.w && y >= o.y && y < o.y + o.h;
  const blocked = (x, y) => {
    if (x < 5 || x > ww - 5 || y < 8 || y > wh - 1) return true;
    return [[-4, -3], [4, -3], [-4, 0], [4, 0]].some(([a, b]) => { const t = tAt(x + a, y + b); return t === 1 || t === 5 || objs.some(o => o.solid && inR(o, x + a, y + b)); });
  };
  const mg = () => { const h = 18 + menu.items.length * 14; return { x: W - 118, y: TOP + 3, h }; };
  const pos = e => { const r = cv.getBoundingClientRect(); return { x: (e.clientX - r.left) / r.width * W, y: (e.clientY - r.top) / r.height * H }; };

  cv.addEventListener('pointerdown', e => {
    e.preventDefault(); const p = pos(e);
    if (menu) {
      const m = menu, { x, y } = mg(); menu = null;
      m.items.forEach((it, i) => { const by = y + 14 + i * 14; if (!it.off && p.x >= x + 4 && p.x <= x + 110 && p.y >= by && p.y < by + 12) { it.fn(); save(); } });
      return;
    }
    if (bag) { bag = false; return; }
    if (p.y < TOP) { if (p.x > W - 26 && p.y < 13) bag = true; return; }
    const wx = p.x + cx, wy = p.y - TOP + cy; let best = null, bd = 1e9;
    for (const o of objs) if (o.menu && wx >= o.x - 3 && wx <= o.x + o.w + 3 && wy >= o.y - (o.hh || 8) && wy <= o.y + o.h + 3) {
      const d = Math.hypot(wx - o.x - o.w / 2, wy - o.y - o.h / 2); if (d < bd) { bd = d; best = o; }
    }
    pl.goal = best ? { x: best.x + best.w / 2, y: best.y + best.h / 2, o: best } : { x: Math.max(8, Math.min(ww - 8, wx)), y: Math.max(10, Math.min(wh - 2, wy)) };
  });
  setInterval(save, 4000); addEventListener('pagehide', save);
  document.addEventListener('visibilitychange', () => { if (document.hidden) save(); });
  Core.toast('CHAM VAO MAN HINH DE DI');

  function walk(dt) {
    const g = pl.goal; if (!g) { pl.st = 0; return; }
    let dx = g.x - pl.x, dy = g.y - pl.y; const d = Math.hypot(dx, dy);
    if (g.o) {
      const o = g.o, py = pl.y - 3;
      if (Math.hypot(Math.max(o.x - pl.x, 0, pl.x - o.x - o.w), Math.max(o.y - py, 0, py - o.y - o.h)) <= 8) { pl.goal = null; const m = o.menu(); if (m) Core.open(m.title, m.items); return; }
    } else if (d < 2) { pl.goal = null; return; }
    const s = 62 * dt, vx = dx / d * s, vy = dy / d * s, ox = pl.x, oy = pl.y;
    if (!blocked(pl.x + vx, pl.y)) pl.x += vx; if (!blocked(pl.x, pl.y + vy)) pl.y += vy;
    pl.stuck = Math.hypot(pl.x - ox, pl.y - oy) < s * .2 ? pl.stuck + dt : 0;
    if (pl.stuck > .4) { pl.goal = null; pl.stuck = 0; }
    pl.d = Math.abs(vx) > Math.abs(vy) ? (vx > 0 ? 3 : 2) : (vy > 0 ? 0 : 1);
    pl.tm += dt; pl.st = ((pl.tm * 8) | 0) % 2 ? 1 : 2;
  }
  let last = performance.now();
  function frame(t) {
    const dt = Math.min(.05, (t - last) / 1000); last = t; const now = Date.now();
    if (!menu) walk(dt);
    if (map.exits) for (const e of map.exits) if (inR(e, pl.x, pl.y)) Core.go(e.to, e.spawn);
    if (msgT > 0) msgT -= dt;
    cx = Math.round(Math.max(0, Math.min(ww - W, pl.x - W / 2))); cy = Math.round(Math.max(0, Math.min(wh - VH, pl.y - 8 - VH / 2)));

    c.fillStyle = '#14101a'; c.fillRect(0, 0, W, H);
    c.save(); c.beginPath(); c.rect(0, TOP, W, VH); c.clip(); c.translate(-cx, TOP - cy);
    for (let y = Math.floor(cy / T); y <= Math.ceil((cy + VH) / T) && y < map.rows; y++)
      for (let x = Math.floor(cx / T); x <= Math.ceil((cx + W) / T) && x < map.cols; x++) c.drawImage(tile(+tiles[y][x], ((x * 73 + y * 151) >>> 0) % 4), x * T, y * T);
    const dr = objs.map(o => ({ z: o.z !== undefined ? o.z : o.y + o.h, f: () => o.draw(c, now, o) }));
    dr.push({ z: pl.y, f: () => chibi(c, pl.x, pl.y, pl.d, pl.st, '#7a4a28', '#3a8ae8', 'straw') });
    dr.sort((a, b) => a.z - b.z).forEach(o => o.f());
    if (pl.goal && !pl.goal.o && Math.sin(now / 120) > 0) { c.fillStyle = '#f1ead8'; const g = pl.goal; c.fillRect(g.x - 2, g.y, 1, 1); c.fillRect(g.x + 2, g.y, 1, 1); c.fillRect(g.x, g.y - 2, 1, 1); c.fillRect(g.x, g.y + 2, 1, 1); }
    c.restore();

    c.fillStyle = '#2b2233'; c.fillRect(0, 0, W, TOP);
    box(c, 3, 3, 8, 8, '#ffd860', '#fff0a0', '#d0a830'); text(c, G.money, 14, 4);
    text(c, G.q < QUESTS.length ? 'NV:' + QUESTS[G.q][0] : 'HET NHIEM VU', 50, 4, '#ffe060');
    if (map.name) text(c, map.name, W - 30 - tw(map.name), 4, '#c9c2b0');
    box(c, W - 24, 1, 21, 12, '#4aa0e8', '#80c8f8', '#3070b0'); text(c, 'KHO', W - 21, 4);
    if (msgT > 0) { box(c, ((W - tw(msg)) / 2 | 0) - 3, TOP + 3, tw(msg) + 6, 9, '#3b3046', '#4f4260', '#2b2233'); text(c, msg, (W - tw(msg)) / 2 | 0, TOP + 5); }
    if (menu) {
      const { x, y, h } = mg(); box(c, x, y, 114, h, '#3b3046', '#4f4260', '#2b2233'); text(c, menu.title, x + 5, y + 5, '#ffe060');
      menu.items.forEach((it, i) => { const by = y + 14 + i * 14; box(c, x + 4, by, 106, 12, ...(it.off ? ['#4a4752', '#5a5762', '#3a3742'] : ['#58a040', '#80d060', '#3a7030'])); text(c, it.label, x + 8, by + 4, it.off ? '#8c8996' : '#fffbe8'); });
    }
    if (bag) {
      box(c, 70, TOP + 3, 120, 98, '#3b3046', '#4f4260', '#2b2233'); text(c, 'KHO DO', 76, TOP + 8, '#ffe060');
      let y = TOP + 20, any = false;
      for (const k in NAMES) if (G.inv[k] > 0) { any = true; text(c, NAMES[k], 76, y); text(c, 'x' + G.inv[k], 170, y); y += 8; }
      if (!any) text(c, 'TRONG', 76, y);
    }
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
};
window.Core = Core;
})();
