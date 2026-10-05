/* core.js - lõi dùng chung cho mọi map: save, kho, tiền, vẽ pixel, điều khiển, vòng lặp */
(function () {
'use strict';
const W = 160, H = 240, T = 16, MY = 16, KEY = 'pixelfarm_v1', K = '#1b1420';
const NAMES = { carrot: 'CA ROT', rice: 'GAO', egg: 'TRUNG', pork: 'THIT', soup: 'SUP CA ROT', friedrice: 'COM CHIEN', grill: 'THIT NUONG' };
// Công thức xếp theo giá giảm dần (bán món đắt trước)
const RECIPES = [
  { id: 'grill', need: { pork: 1 }, price: 60 },
  { id: 'friedrice', need: { rice: 1, egg: 1 }, price: 45 },
  { id: 'soup', need: { carrot: 2 }, price: 30 }
];
const DEF = () => ({
  money: 20,
  inv: { carrot: 2, rice: 0, egg: 0, pork: 0, soup: 0, friedrice: 0, grill: 0 },
  plots: Array.from({ length: 6 }, () => ({ s: null, t: 0 })),
  pen: { chicken: Date.now(), pig: Date.now() },
  seed: 'carrot', spawn: null
});
let G;
try { G = Object.assign(DEF(), JSON.parse(localStorage.getItem(KEY) || '{}')); } catch (e) { G = DEF(); }
const save = () => { try { localStorage.setItem(KEY, JSON.stringify(G)); } catch (e) {} };

/* ---- font pixel 3x5 ---- */
const F = {};
('0:111101101101111,1:010110010010111,2:111001111100111,3:111001111001111,4:101101111001001,5:111100111001111,6:111100111101111,7:111001001010010,8:111101111101111,9:111101111001111,' +
 'A:010101111101101,B:110101110101110,C:011100100100011,D:110101101101110,E:111100110100111,F:111100110100100,G:011100101101011,H:101101111101101,I:111010010010111,J:001001001101010,K:101101110101101,L:100100100100111,M:101111111101101,' +
 'N:110101101101101,O:010101101101010,P:110101110100100,Q:010101101111011,R:110101110101101,S:011100010001110,T:111010010010010,U:101101101101111,V:101101101101010,W:101101111111101,X:101101010101101,Y:101101010010010,Z:111001010100111,' +
 '::000010000010000,+:000010111010000,-:000000111000000,/:001001010100100,.:000000000000010').split(',').forEach(s => F[s[0]] = s.slice(2));
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
// khối vuông: outline đen, 3 màu (chính / sáng góc trên trái / tối góc dưới phải)
function box(c, x, y, w, h, m, hi, sh) {
  c.fillStyle = K; c.fillRect(x, y, w, h);
  c.fillStyle = m; c.fillRect(x + 1, y + 1, w - 2, h - 2);
  c.fillStyle = hi; c.fillRect(x + 1, y + 1, w - 2, 1); c.fillRect(x + 1, y + 1, 1, h - 2);
  c.fillStyle = sh; c.fillRect(x + 1, y + h - 2, w - 2, 1); c.fillRect(x + w - 2, y + 1, 1, h - 2);
}
// nhân vật chibi: đầu to, mắt 2 pixel, tay chân đơn giản. (x,y) = giữa bàn chân. d: 0 xuống,1 lên,2 trái,3 phải
function chibi(c, x, y, d, st, hair, shirt) {
  x = Math.round(x); y = Math.round(y);
  c.fillStyle = K; c.fillRect(x - 5, y - 14, 10, 9);
  c.fillStyle = '#e8c79a'; c.fillRect(x - 4, y - 13, 8, 7);
  c.fillStyle = hair; c.fillRect(x - 4, y - 13, 8, d === 1 ? 6 : 3);
  if (d !== 1) {
    c.fillStyle = K;
    const e = d === 0 ? [-2, 1] : d === 2 ? [-3, -1] : [0, 2];
    c.fillRect(x + e[0], y - 9, 1, 1); c.fillRect(x + e[1], y - 9, 1, 1);
  }
  c.fillStyle = K; c.fillRect(x - 3, y - 6, 6, 5); c.fillRect(x - 4, y - 5, 1, 3); c.fillRect(x + 3, y - 5, 1, 3);
  c.fillStyle = shirt; c.fillRect(x - 2, y - 5, 4, 3);
  c.fillStyle = K; c.fillRect(x - 3, y - 2, 2, st === 1 ? 1 : 2); c.fillRect(x + 1, y - 2, 2, st === 2 ? 1 : 2);
}

/* ---- tile procedural (desaturated, không gradient) ---- */
const rng = s => () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296);
const TC = {};
const PAL = [['#6f8f55', '#5f7d4a', '#86a265'], ['#9a5f4a', '#6e4a3d', '#b57a62'], ['#a98660', '#8f6f4d', '#b89870'], ['#9a9484', '#807b6d', '#aaa596'], ['#6b4c33', '#58402b', '#7b5a3d']];
function tile(t, v) {
  const k = t * 4 + v; if (TC[k]) return TC[k];
  const cv = document.createElement('canvas'); cv.width = cv.height = T;
  const x = cv.getContext('2d'), r = rng(k + 7), [b, d, l] = PAL[t];
  x.fillStyle = b; x.fillRect(0, 0, T, T);
  if (t === 1) {
    x.fillStyle = d;
    for (let y = 0; y < T; y += 4) { x.fillRect(0, y, T, 1); for (let a = (y / 4 % 2) * 4; a < T; a += 8) x.fillRect(a, y, 1, 4); }
    x.fillStyle = l;
    for (let y = 1; y < T; y += 4) for (let a = ((y >> 2) % 2) * 4; a < T; a += 8) x.fillRect(a + 1, y, 3, 1);
    if (v === 3) { x.fillStyle = PAL[0][0]; for (let i = 0; i < 5; i++) x.fillRect((r() * 14) | 0, (r() * 14) | 0, 2, 1); }
    if (v === 2) { x.fillStyle = K; x.fillRect(5, 5, 1, 2); x.fillRect(6, 7, 1, 2); }
  } else if (t === 2) {
    x.fillStyle = d; for (let y = 7; y < T; y += 8) x.fillRect(0, y, T, 1);
    x.fillRect(v * 3 + 2, 0, 1, 7); x.fillRect(v * 3 + 8, 8, 1, 7);
  } else if (t === 4) {
    x.fillStyle = d; x.fillRect(0, 4, T, 2); x.fillRect(0, 10, T, 2);
    x.fillStyle = l; x.fillRect(0, 3, T, 1); x.fillRect(0, 9, T, 1);
  }
  for (let i = 0; i < 9; i++) { x.fillStyle = r() > .5 ? d : l; x.fillRect((r() * 16) | 0, (r() * 16) | 0, 1, 1); }
  if (t === 0 && v === 1) { x.fillStyle = '#c8b86a'; x.fillRect(4, 9, 1, 1); x.fillRect(11, 4, 1, 1); }
  return (TC[k] = cv);
}

/* ---- hệ thống chung ---- */
const Core = { W, H, T, G, NAMES, RECIPES, save, text, box, chibi, K, tw };
let msg = '', msgT = 0;
Core.toast = s => { msg = s; msgT = 2; };
Core.cook = () => {
  for (const r of RECIPES) if (Object.keys(r.need).every(k => G.inv[k] >= r.need[k])) {
    for (const k in r.need) G.inv[k] -= r.need[k];
    G.inv[r.id]++; Core.toast('NAU XONG ' + NAMES[r.id]); save(); return true;
  }
  Core.toast('THIEU NGUYEN LIEU'); return false;
};
Core.sell = () => {
  for (const r of RECIPES) if (G.inv[r.id] > 0) {
    G.inv[r.id]--; G.money += r.price; Core.toast('BAN ' + NAMES[r.id] + ' +' + r.price); save(); return true;
  }
  Core.toast('CHUA CO MON AN'); return false;
};
let busy = false;
Core.go = (file, spawn) => { if (busy) return; busy = true; G.spawn = spawn; save(); location.href = file; };

Core.start = function (map) {
  const cv = document.getElementById('g'), c = cv.getContext('2d');
  cv.width = W; cv.height = H; c.imageSmoothingEnabled = false;
  const fit = () => { const s = Math.max(1, Math.floor(Math.min(innerWidth / W, innerHeight / H))); cv.style.width = W * s + 'px'; cv.style.height = H * s + 'px'; };
  addEventListener('resize', fit); fit();

  const sp = G.spawn || map.spawn; G.spawn = null;
  const pl = { x: sp.x, y: sp.y, d: 0, st: 0, tm: 0 };
  const objs = map.objs(), tiles = map.tiles;
  const tAt = (px, py) => { const tx = Math.floor(px / T), ty = Math.floor(py / T); return tiles[ty] ? +tiles[ty][tx] : 1; };
  const inR = (o, x, y) => x >= o.x && x < o.x + o.w && y >= o.y && y < o.y + o.h;
  const blocked = (x, y) => {
    if (x < 5 || x > W - 5 || y < 5 || y > 191) return true;
    return [[-4, -4], [4, -4], [-4, 0], [4, 0]].some(([a, b]) => tAt(x + a, y + b) === 1 || objs.some(o => o.solid && inR(o, x + a, y + b)));
  };

  // điều khiển cảm ứng + bàn phím
  const BT = { u: [21, 209, 18, 14], d: [21, 225, 18, 14], l: [2, 216, 18, 22], r: [40, 216, 18, 22], s: [68, 212, 24, 24], k: [96, 212, 24, 24], a: [128, 210, 28, 28] };
  const ptr = new Map(), keys = {}; let press = { a: 0, s: 0, k: 0 }, bag = false;
  const hit = (p, b) => p.x >= b[0] - 3 && p.x <= b[0] + b[2] + 3 && p.y >= b[1] - 3 && p.y <= b[1] + b[3] + 3;
  const pos = e => { const r = cv.getBoundingClientRect(); return { x: (e.clientX - r.left) / r.width * W, y: (e.clientY - r.top) / r.height * H }; };
  cv.addEventListener('pointerdown', e => { e.preventDefault(); const p = pos(e); ptr.set(e.pointerId, p); for (const k of 'ask') if (hit(p, BT[k])) press[k] = 1; });
  cv.addEventListener('pointermove', e => { if (ptr.has(e.pointerId)) ptr.set(e.pointerId, pos(e)); });
  ['pointerup', 'pointercancel', 'pointerleave'].forEach(n => cv.addEventListener(n, e => ptr.delete(e.pointerId)));
  addEventListener('keydown', e => { keys[e.key] = 1; if (e.key === ' ' || e.key === 'e') press.a = 1; if (e.key === 'q') press.s = 1; if (e.key === 'b') press.k = 1; });
  addEventListener('keyup', e => { keys[e.key] = 0; });
  const held = (k, kk) => keys[kk] || [...ptr.values()].some(p => hit(p, BT[k]));
  setInterval(save, 4000);
  addEventListener('pagehide', save);
  document.addEventListener('visibilitychange', () => { if (document.hidden) save(); });

  function target() {
    let best = null, bd = 9;
    for (const o of objs) {
      if (!o.act) continue;
      const py = pl.y - 4, d = Math.hypot(Math.max(o.x - pl.x, 0, pl.x - o.x - o.w), Math.max(o.y - py, 0, py - o.y - o.h));
      if (d < bd) { bd = d; best = o; }
    }
    return best;
  }
  function tri(x, y, d, col) {
    c.fillStyle = col;
    for (let i = 0; i < 4; i++) {
      if (d === 'u') c.fillRect(x - i, y + i, 2 * i + 1, 1);
      if (d === 'd') c.fillRect(x - i, y - i, 2 * i + 1, 1);
      if (d === 'l') c.fillRect(x + i, y - i, 1, 2 * i + 1);
      if (d === 'r') c.fillRect(x - i, y - i, 1, 2 * i + 1);
    }
  }
  let last = performance.now();
  function frame(t) {
    const dt = Math.min(.05, (t - last) / 1000); last = t; const now = Date.now();
    const tg = target();
    if (press.k) bag = !bag;
    if (press.s && map.onS) map.onS();
    if (press.a) { if (bag) bag = false; else if (tg) tg.act(now); }
    press = { a: 0, s: 0, k: 0 };
    let dx = (held('r', 'ArrowRight') ? 1 : 0) - (held('l', 'ArrowLeft') ? 1 : 0), dy = (held('d', 'ArrowDown') ? 1 : 0) - (held('u', 'ArrowUp') ? 1 : 0);
    if (dx || dy) {
      if (dx && dy) { dx *= .7; dy *= .7; }
      pl.d = Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 3 : 2) : (dy > 0 ? 0 : 1);
      pl.tm += dt; pl.st = ((pl.tm * 8) | 0) % 2 ? 1 : 2;
      const nx = pl.x + dx * 52 * dt, ny = pl.y + dy * 52 * dt;
      if (!blocked(nx, pl.y)) pl.x = nx; if (!blocked(pl.x, ny)) pl.y = ny;
    } else pl.st = 0;
    if (map.exits) for (const e of map.exits) if (inR(e, pl.x, pl.y)) Core.go(e.to, e.spawn);
    if (msgT > 0) msgT -= dt;

    // vẽ
    c.fillStyle = '#14101a'; c.fillRect(0, 0, W, H);
    c.save(); c.translate(0, MY); c.beginPath(); c.rect(0, 0, W, 192); c.clip();
    for (let y = 0; y < 12; y++) for (let x = 0; x < 10; x++) c.drawImage(tile(+tiles[y][x], ((x * 73 + y * 151) >>> 0) % 4), x * T, y * T);
    const dr = objs.map(o => ({ z: o.z !== undefined ? o.z : o.y + o.h, f: () => o.draw(c, now, o) }));
    dr.push({ z: pl.y, f: () => chibi(c, pl.x, pl.y, pl.d, pl.st, '#4a3322', '#4a7aa8') });
    dr.sort((a, b) => a.z - b.z).forEach(o => o.f());
    if (tg && !bag) { const b = Math.sin(now / 150) > 0 ? 0 : 1; text(c, 'A', tg.x + (tg.w >> 1) - 1, tg.y - 7 - b, '#f2d77a'); }
    c.restore();

    // HUD
    c.fillStyle = '#2b2233'; c.fillRect(0, 0, W, 16);
    box(c, 3, 4, 8, 8, '#d8b24a', '#f2d77a', '#a8832e'); text(c, G.money, 14, 5);
    const h = map.hud ? map.hud() : ''; text(c, h, W - 4 - tw(h), 5, '#c9c2b0');
    if (msgT > 0) { box(c, (W - tw(msg)) / 2 - 3 | 0, 19, tw(msg) + 6, 9, '#3b3046', '#4f4260', '#2b2233'); text(c, msg, ((W - tw(msg)) / 2 | 0), 21); }

    // bảng kho
    if (bag) {
      box(c, 24, 36, 112, 120, '#3b3046', '#4f4260', '#2b2233'); text(c, 'KHO', 30, 42, '#f2d77a');
      let y = 54, any = false;
      for (const k in NAMES) if (G.inv[k] > 0) { any = true; text(c, NAMES[k], 30, y); text(c, 'x' + G.inv[k], 118, y); y += 8; }
      if (!any) text(c, 'TRONG', 30, y);
    }

    // thanh điều khiển
    c.fillStyle = '#2b2233'; c.fillRect(0, 208, W, 32);
    for (const k of 'udlr') { const b = BT[k], on = held(k, 'x'); box(c, b[0], b[1], b[2], b[3], on ? '#4f4260' : '#6d6a75', on ? '#6d6a75' : '#8c8996', '#4a4752'); tri(b[0] + b[2] / 2 | 0, b[1] + b[3] / 2 | 0, k, '#1b1420'); }
    const lbl = { a: 'A', s: map.sLabel || '', k: 'KHO' }, cl = { a: ['#a85a4a', '#c97a66', '#7a3f35'], s: ['#5f7d4a', '#86a265', '#46603a'], k: ['#4a7aa8', '#6e9ac4', '#365a80'] };
    for (const k of 'ask') { if (k === 's' && !map.onS) continue; const b = BT[k]; box(c, b[0], b[1], b[2], b[3], ...cl[k]); text(c, lbl[k], b[0] + (b[2] - tw(lbl[k])) / 2 | 0, b[1] + b[3] / 2 - 2 | 0); }
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
};
window.Core = Core;
})();
