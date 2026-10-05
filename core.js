/* core.js v2 - lõi dùng chung: save, kho, tiền, nhiệm vụ, camera, chạm để đi, menu chạm vào vật */
(function () {
'use strict';
const W = 120, H = 260, T = 16, TOP = 24, K = '#1b1420', KEY = 'pixelfarm_v2';
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
function chibi(c, x, y, d, st, hair, shirt) {
  x = Math.round(x); y = Math.round(y);
  c.fillStyle = K; c.fillRect(x - 5, y - 14, 10, 9);
  c.fillStyle = '#e8c79a'; c.fillRect(x - 4, y - 13, 8, 7);
  c.fillStyle = hair; c.fillRect(x - 4, y - 13, 8, d === 1 ? 6 : 3);
  if (d !== 1) { c.fillStyle = K; const e = d === 0 ? [-2, 1] : d === 2 ? [-3, -1] : [0, 2]; c.fillRect(x + e[0], y - 9, 1, 1); c.fillRect(x + e[1], y - 9, 1, 1); }
  c.fillStyle = K; c.fillRect(x - 3, y - 6, 6, 5); c.fillRect(x - 4, y - 5, 1, 3); c.fillRect(x + 3, y - 5, 1, 3);
  c.fillStyle = shirt; c.fillRect(x - 2, y - 5, 4, 3);
  c.fillStyle = K; c.fillRect(x - 3, y - 2, 2, st === 1 ? 1 : 2); c.fillRect(x + 1, y - 2, 2, st === 2 ? 1 : 2);
}

/* sprite pixel 12 cot: k vien den, w trang, a xam, r do, o cam, h cam sang, d cam toi, g xanh, G xanh dam, y vang, Y vang dam, p hong, P hong dam, b nau, B nau dam */
const SPC = { k: K, w: '#f1ead8', a: '#b8b3a3', r: '#c0453a', o: '#e08a3b', h: '#f2a65a', d: '#a85f28', g: '#6fae4a', G: '#4a8a3c', y: '#e6cf6a', Y: '#b8a040', p: '#e8a6ac', P: '#c9828a', b: '#8a6a46', B: '#5e4430' };
const S = {
  carrot: ['..g..gg..g..', '...gggggg...', '...kkkkkk...', '..khhooodk..', '..khoooodk..', '...koooodk..', '...kooodk...', '....koodk...', '.....kodk...', '.....kdk....', '......k.....'],
  rice: ['.y...yy...y.', '.yy.yYYy.yy.', '.yYyyYYyyYy.', '..yYyyYyYy..', '...gyyYyg...', '...g..g..g..', '...g..g..g..', '...G..G..G..', '..GGGGGGGG..'],
  sprout: ['...gg..gg...', '....gggg....', '.....gG.....', '.....G......', '....bbbb....', '...bBBBBb...'],
  seed: ['............', '....bbbb....', '...bBBBBb...'],
  chicken: ['....rr......', '...kkkkk....', '..kwkwwkwk..', '..kwwwoowwk.', '.kwwwwwwwwk.', '.kwwwwwwwak.', '.kwwwwwwwak.', '..kwwwwwak..', '...kkkkkk...', '....o..o....'],
  pig: ['..kk....kk..', '.kppkkkkppk.', '.kppppppppk.', '.kpkppppkpk.', '.kpPPPPPPpk.', '.kpPkPPkPpk.', '.kppPPPPppk.', '..kppppppk..', '...kkkkkk...', '..kk....kk..']
};
const SC = new Map();
function spr(c, rows, x, y) {
  let cv = SC.get(rows);
  if (!cv) {
    cv = document.createElement('canvas'); cv.width = 12; cv.height = rows.length; const x2 = cv.getContext('2d');
    rows.forEach((r, j) => { for (let i = 0; i < r.length; i++) if (r[i] !== '.') { x2.fillStyle = SPC[r[i]]; x2.fillRect(i, j, 1, 1); } });
    SC.set(rows, cv);
  }
  c.drawImage(cv, Math.round(x), Math.round(y));
}

/* tile procedural: 0 co, 1 gach, 2 san go, 3 duong da, 4 dat cay, 5 nuoc */
const rng = s => () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296);
const TC = {};
const PAL = [['#6f8f55', '#5f7d4a', '#86a265'], ['#9a5f4a', '#6e4a3d', '#b57a62'], ['#a98660', '#8f6f4d', '#b89870'], ['#9a9484', '#807b6d', '#aaa596'], ['#6b4c33', '#58402b', '#7b5a3d'], ['#5a7fa0', '#4a6c8c', '#7a9fbe']];
function tile(t, v) {
  const k = t * 4 + v; if (TC[k]) return TC[k];
  const cv = document.createElement('canvas'); cv.width = cv.height = T;
  const x = cv.getContext('2d'), r = rng(k + 7), [b, d, l] = PAL[t];
  x.fillStyle = b; x.fillRect(0, 0, T, T);
  if (t === 1) {
    x.fillStyle = d;
    for (let y = 0; y < T; y += 4) { x.fillRect(0, y, T, 1); for (let a = (y / 4 % 2) * 4; a < T; a += 8) x.fillRect(a, y, 1, 4); }
    x.fillStyle = l; for (let y = 1; y < T; y += 4) for (let a = ((y >> 2) % 2) * 4; a < T; a += 8) x.fillRect(a + 1, y, 3, 1);
    if (v === 3) { x.fillStyle = PAL[0][0]; for (let i = 0; i < 5; i++) x.fillRect((r() * 14) | 0, (r() * 14) | 0, 2, 1); }
  } else if (t === 2) { x.fillStyle = d; for (let y = 7; y < T; y += 8) x.fillRect(0, y, T, 1); x.fillRect(v * 3 + 2, 0, 1, 7); x.fillRect(v * 3 + 8, 8, 1, 7); }
  else if (t === 4) { x.fillStyle = d; x.fillRect(0, 4, T, 2); x.fillRect(0, 10, T, 2); x.fillStyle = l; x.fillRect(0, 3, T, 1); x.fillRect(0, 9, T, 1); }
  else if (t === 5) { x.fillStyle = l; x.fillRect(2 + v * 2, 5, 4, 1); x.fillRect(8, 11, 4, 1); }
  for (let i = 0; i < 9; i++) { x.fillStyle = r() > .5 ? d : l; x.fillRect((r() * 16) | 0, (r() * 16) | 0, 1, 1); }
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
  draw(c) { const x = tx * T, y = ty * T; box(c, x + 6, y + 6, 4, 10, '#8a6a46', '#a8855a', '#5e4430'); box(c, x, y - 8, 16, 14, '#5f8f45', '#86b25f', '#3f6a32'); c.fillStyle = '#86b25f'; c.fillRect(x + 4, y - 4, 2, 2); }
});
Core.npc = (x, y, hair, shirt, fn) => ({ x: x - 5, y: y - 6, w: 10, h: 6, solid: true, hh: 14, menu: fn, draw(c, n) { chibi(c, x, y + (Math.sin(n / 400 + x) > .7 ? -1 : 0), 0, 0, hair, shirt); } });
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
  const mg = () => { const h = 18 + menu.items.length * 14; return { y: H - h - 4, h }; };
  const pos = e => { const r = cv.getBoundingClientRect(); return { x: (e.clientX - r.left) / r.width * W, y: (e.clientY - r.top) / r.height * H }; };

  cv.addEventListener('pointerdown', e => {
    e.preventDefault(); const p = pos(e);
    if (menu) {
      const m = menu, { y } = mg(); menu = null;
      m.items.forEach((it, i) => { const by = y + 14 + i * 14; if (!it.off && p.x >= 8 && p.x <= W - 8 && p.y >= by && p.y < by + 12) { it.fn(); save(); } });
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
    dr.push({ z: pl.y, f: () => chibi(c, pl.x, pl.y, pl.d, pl.st, '#4a3322', '#4a7aa8') });
    dr.sort((a, b) => a.z - b.z).forEach(o => o.f());
    if (pl.goal && !pl.goal.o && Math.sin(now / 120) > 0) { c.fillStyle = '#f1ead8'; const g = pl.goal; c.fillRect(g.x - 2, g.y, 1, 1); c.fillRect(g.x + 2, g.y, 1, 1); c.fillRect(g.x, g.y - 2, 1, 1); c.fillRect(g.x, g.y + 2, 1, 1); }
    c.restore();

    c.fillStyle = '#2b2233'; c.fillRect(0, 0, W, TOP);
    box(c, 3, 3, 8, 8, '#d8b24a', '#f2d77a', '#a8832e'); text(c, G.money, 14, 4);
    box(c, W - 24, 1, 21, 11, '#4a7aa8', '#6e9ac4', '#365a80'); text(c, 'KHO', W - 21, 4);
    text(c, G.q < QUESTS.length ? 'NV:' + QUESTS[G.q][0] : 'HET NHIEM VU', 3, 15, '#f2d77a');
    if (msgT > 0) { box(c, ((W - tw(msg)) / 2 | 0) - 3, TOP + 3, tw(msg) + 6, 9, '#3b3046', '#4f4260', '#2b2233'); text(c, msg, (W - tw(msg)) / 2 | 0, TOP + 5); }
    if (map.name) text(c, map.name, W - 28 - tw(map.name), 4, '#c9c2b0');

    if (menu) {
      const { y, h } = mg(); box(c, 4, y, W - 8, h, '#3b3046', '#4f4260', '#2b2233'); text(c, menu.title, 9, y + 5, '#f2d77a');
      menu.items.forEach((it, i) => { const by = y + 14 + i * 14; box(c, 8, by, W - 16, 12, ...(it.off ? ['#4a4752', '#5a5762', '#3a3742'] : ['#5f7d4a', '#86a265', '#46603a'])); text(c, it.label, 12, by + 4, it.off ? '#8c8996' : '#f1ead8'); });
    }
    if (bag) {
      box(c, 6, 30, W - 12, 130, '#3b3046', '#4f4260', '#2b2233'); text(c, 'KHO DO', 12, 36, '#f2d77a');
      let y = 48, any = false;
      for (const k in NAMES) if (G.inv[k] > 0) { any = true; text(c, NAMES[k], 12, y); text(c, 'x' + G.inv[k], W - 30, y); y += 9; }
      if (!any) text(c, 'TRONG', 12, y);
    }
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
};
window.Core = Core;
})();
