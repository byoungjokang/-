// 신뢰형 테마 (레드 · 차콜, 밝은 본문 + 레드 표지)
const pptxgen = require("pptxgenjs");
const S = require(process.argv[3] || "./slides.js");
const FONT = "Pretendard", HFONT = "Pretendard Black";
const RED = "B0000C", DRED = "E9B5B5", HOT = "B0000C", GOLD = "B0000C";
const TXT = "111111", MUTE = "6B6B6B", DIM = "A3A3A3", CARD = "F4F4F4", CARDL = "F4F4F4", HOTC = "B0000C", HOTL = "B0000C", INKD = "111827";
const W = 13.333, H = 7.5;
const pres = new pptxgen();
pres.layout = "LAYOUT_WIDE";
pres.author = "병조쌤";
pres.title = "AI 전자책 무료 라이브";
pres.theme = { headFontFace: HFONT, bodyFontFace: FONT };
const BG = { main: "bg6_main.png", big: "bg6_big.png", cover: "bg6_cover.png" };

// *강조* → 레드, ~골드~ → 골드, #가림# → 흰 박스로 가림, \n → 줄바꿈
function runs(text, base) {
  const out = [];
  String(text).split("\n").forEach((ln, li, arr) => {
    const parts = ln.split(/(\*[^*]+\*|#[^#]+#|~[^~]+~)/).filter(s => s !== "");
    if (!parts.length) parts.push(" ");
    parts.forEach((p, pi) => {
      let o = Object.assign({}, base), t = p;
      if (/^\*[^*]+\*$/.test(p)) { o.color = HOT; t = p.slice(1, -1); }
      else if (/^~[^~]+~$/.test(p)) { o.color = GOLD; t = p.slice(1, -1); }
      else if (/^#[^#]+#$/.test(p)) { o.color = TXT; o.highlight = TXT; t = p.slice(1, -1); }
      if (pi === parts.length - 1 && li < arr.length - 1) o.breakLine = true;
      out.push({ text: t, options: o });
    });
  });
  return out;
}
const T = (s, text, o, base) => s.addText(runs(text, Object.assign({ fontFace: FONT, color: TXT }, base)), Object.assign({ isTextBox: true, margin: 0, align: "center", valign: "middle" }, o));
const H1 = (s, text, o, base) => T(s, text, o, Object.assign({ fontFace: HFONT, bold: false }, base));
const box = (s, x, y, w, h, fill, line, r = 0.12, lw = 1) => s.addShape(r ? pres.shapes.ROUNDED_RECTANGLE : pres.shapes.RECTANGLE, { x, y, w, h, rectRadius: r, fill: { color: fill }, line: { color: line || fill, width: lw } });
const hline = (s, x, y, w, c = DRED, wt = 1.5) => s.addShape(pres.shapes.LINE, { x, y, w, h: 0, line: { color: c, width: wt } });
let num = 0, curSec = "", secNo = "", secName = "";

// 상단 레드 라벨 (좌우 짧은 선)
function label(s, t, y = 0.42) {
  T(s, t, { x: 0.9, y, w: 8, h: 0.3, align: "left" }, { fontSize: 10, bold: true, color: DIM, charSpacing: 2 });
}
function addFoot(s) {
  T(s, "강작가", { x: 0.9, y: H - 0.6, w: 5, h: 0.26, align: "left" }, { fontSize: 9, color: DIM, bold: true });
  T(s, String(num).padStart(3, "0"), { x: W - 1.55, y: H - 0.62, w: 0.8, h: 0.26, align: "right" }, { fontSize: 9, color: DIM, charSpacing: 2 });
}
function placeholder(s, lbl, x, y, w, h) {
  s.addShape(pres.shapes.RECTANGLE, { x, y, w, h, fill: { color: "FAFAFA" }, line: { color: "A3A3A3", width: 1.25, dashType: "dash" }, objectName: "자료자리" });
  s.addText([{ text: "자료 넣을 자리", options: { fontSize: 11, color: GOLD, bold: true, charSpacing: 3, breakLine: true } }, { text: lbl, options: { fontSize: 15, color: MUTE } }],
    { x: x + 0.2, y, w: w - 0.4, h, align: "center", valign: "middle", isTextBox: true, fontFace: FONT });
}
const head = (s, t, y = 0.8, size = 32) => H1(s, t, { x: 0.9, y, w: W - 1.8, h: 0.95, align: "left" }, { fontSize: size });
const subT = (s, t, y = 1.75) => T(s, t, { x: 0.9, y, w: W - 1.8, h: 0.45, align: "left" }, { fontSize: 16, color: MUTE });
const top = d => (d.sub ? 2.45 : 2.05);

const K = {};
K.line = K.q = K.big = K.blind = (s, d, k) => {
  const big = k === "big", size = d.size || (big ? 64 : 46), ph = d.photo, tw = ph ? 7.2 : W - 1.8, ty = d.sub ? 1.9 : 2.3;
  if (ph) picFit(s, ph, 7.9, 0.9, 4.9, 5.7, false);
  if (k === "q") T(s, "QUESTION", { x: 0.9, y: ty - 0.5, w: 3, h: 0.3, align: "left" }, { fontSize: 12, bold: true, color: HOT, charSpacing: 4 });
  H1(s, d.t, { x: 0.9, y: ty, w: tw, h: 2.6, align: "left" }, { fontSize: ph ? Math.min(size, 44) : size });
  if (d.sub) T(s, d.sub, { x: 0.9, y: ty + 2.7, w: tw, h: 0.8, align: "left", valign: "top" }, { fontSize: 20, color: MUTE });
};
K.img = (s, d) => { head(s, d.t); if (d.sub) subT(s, d.sub); placeholder(s, d.img, 1.6, top(d), W - 3.2, H - top(d) - 0.95); };
K.imgs = (s, d) => {
  head(s, d.t); if (d.sub) subT(s, d.sub);
  const n = d.imgs.length, gap = 0.35, w = (W - 1.8 - gap * (n - 1)) / n, y = top(d) + 0.45, h = H - y - 0.95;
  d.imgs.forEach((im, i) => { const x = 0.9 + i * (w + gap); T(s, im[0], { x, y: y - 0.45, w, h: 0.38 }, { fontSize: 15, bold: true, color: i === d.hl ? GOLD : MUTE, charSpacing: 2 }); placeholder(s, im[1], x, y, w, h); });
};
K.list = (s, d) => {
  head(s, d.t); if (d.sub) subT(s, d.sub);
  const n = d.items.length, tp = top(d) + 0.05, gap = 0.16, avail = H - tp - 1.0, h = Math.min(0.9, (avail - gap * (n - 1)) / n), x = 2.2, w = W - 4.4;
  d.items.forEach((it, i) => {
    const y = tp + i * (h + gap);
    box(s, x, y, w, h, CARD, CARDL, 0.08);
    s.addShape(pres.shapes.RECTANGLE, { x, y, w: 0.07, h, fill: { color: RED }, line: { color: RED } });
    T(s, String(i + 1).padStart(2, "0"), { x: x + 0.3, y, w: 0.7, h }, { fontSize: 18, fontFace: HFONT, color: GOLD });
    T(s, it, { x: x + 1.1, y, w: w - 1.4, h, align: "left" }, { fontSize: 21, bold: true });
  });
};
K.two = (s, d) => {
  head(s, d.t); if (d.sub) subT(s, d.sub);
  [d.a, d.b].forEach((txt, i) => {
    const x = i === 0 ? 1.0 : W / 2 + 0.25, w = W / 2 - 1.25, y = top(d) + 0.1, h = H - y - 1.0, hot = i === (d.hl ?? 1);
    box(s, x, y, w, h, hot ? HOTC : CARD, hot ? HOTL : CARDL, 0.1);
    if (hot) s.addShape(pres.shapes.RECTANGLE, { x, y, w, h: 0.07, fill: { color: RED }, line: { color: RED } });
    const [hd, ...body] = String(txt).split("\n");
    H1(s, hd, { x: x + 0.3, y: y + 0.35, w: w - 0.6, h: 0.8 }, { fontSize: 26, color: hot ? "FFFFFF" : TXT });
    hline(s, x + w / 2 - 0.3, y + 1.25, 0.6, hot ? "FFFFFF" : "CCCCCC", 2);
    if (body.length) T(s, body.join("\n"), { x: x + 0.4, y: y + 1.45, w: w - 0.8, h: h - 1.7 }, { fontSize: 20, color: hot ? "FFFFFF" : "333333" });
  });
  if (d.vs !== false) { s.addShape(pres.shapes.OVAL, { x: W / 2 - 0.4, y: top(d) + 1.9, w: 0.8, h: 0.8, fill: { color: "FFFFFF" }, line: { color: GOLD, width: 1.5 } }); T(s, "VS", { x: W / 2 - 0.4, y: top(d) + 1.9, w: 0.8, h: 0.8 }, { fontSize: 15, fontFace: HFONT, color: GOLD }); }
};
K.flow = (s, d) => {
  head(s, d.t); if (d.sub) subT(s, d.sub);
  const rows = d.rows || [{ items: d.items }];
  rows.forEach((r, ri) => {
    const n = r.items.length, gap = 0.42, w = Math.min(2.55, (W - 1.6 - gap * (n - 1)) / n), total = n * w + (n - 1) * gap, x0 = (W - total) / 2;
    const h = rows.length > 1 ? 1.15 : 1.6, y = rows.length > 1 ? 2.85 + ri * 2.0 : 3.25;
    if (r.label) T(s, r.label, { x: x0, y: y - 0.5, w: total, h: 0.4, align: "left" }, { fontSize: 15, bold: true, color: r.hot ? GOLD : MUTE, charSpacing: 2 });
    r.items.forEach((it, i) => {
      const x = x0 + i * (w + gap), last = (r.hot ?? true) && i === n - 1;
      box(s, x, y, w, h, last ? RED : CARD, last ? RED : CARDL, 0.08);
      if (!last) T(s, String(i + 1).padStart(2, "0"), { x: x + 0.15, y: y + 0.1, w: 0.6, h: 0.3, align: "left" }, { fontSize: 10, color: GOLD, bold: true });
      T(s, it, { x: x + 0.1, y, w: w - 0.2, h }, { fontSize: 18, bold: true, color: last ? "FFFFFF" : TXT });
      if (i < n - 1) T(s, "›", { x: x + w, y, w: gap, h }, { fontSize: 30, color: HOT });
    });
    if (r.tail) T(s, r.tail, { x: x0, y: y + h + 0.08, w: total, h: 0.4, align: "right" }, { fontSize: 14, color: r.hot ? HOT : MUTE, bold: true });
  });
};
K.table = (s, d) => {
  head(s, d.t); if (d.sub) subT(s, d.sub);
  const cols = d.rows[0].length;
  const rows = d.rows.map((r, ri) => r.map((c, ci) => {
    const mark = c === "○" || c === "✕", lastCol = ci === cols - 1 && d.hlLast;
    return { text: c, options: { bold: ri === 0 || ci === 0 || mark, color: ri === 0 ? "FFFFFF" : (c === "○" ? HOT : lastCol ? TXT : "333333"), fill: { color: ri === 0 ? (lastCol ? RED : "1A1A1A") : (lastCol ? "FBEDED" : (ri % 2 ? "FFFFFF" : "FAFAFA")) }, fontSize: mark ? 22 : (cols > 3 ? 15 : 17), align: "center", valign: "middle", fontFace: FONT } };
  }));
  const tw = W - 1.8, colW = d.colW || (cols === 2 ? [tw * 0.4, tw * 0.6] : cols === 3 ? [tw * 0.4, tw * 0.3, tw * 0.3] : Array(cols).fill(tw / cols));
  s.addTable(rows, { x: 0.9, y: top(d), w: tw, colW, border: { type: "solid", pt: 0.75, color: "EAEAEA" }, rowH: Math.min(0.75, (H - top(d) - 1.0) / d.rows.length) });
};
K.eq = (s, d) => {
  if (d.t) head(s, d.t, 1.0);
  const items = d.items, terms = items.filter((_, i) => i % 2 === 0).length, ops = items.length - terms;
  const tw = 2.7, ow = 0.9, total = terms * tw + ops * ow, x0 = (W - total) / 2, y = 3.0, h = 1.8;
  let x = x0;
  items.forEach((it, i) => {
    if (i % 2) { T(s, it, { x, y, w: ow, h }, { fontSize: 40, color: GOLD }); x += ow; }
    else { const hot = (d.hl || []).includes(i); box(s, x, y, tw, h, hot ? RED : CARD, hot ? RED : CARDL, 0.08); H1(s, it, { x: x + 0.1, y, w: tw - 0.2, h }, { fontSize: 28, color: hot ? "FFFFFF" : TXT }); x += tw; }
  });
  if (d.sub) T(s, d.sub, { x: 1, y: 5.3, w: W - 2, h: 0.7 }, { fontSize: 20, color: MUTE });
};
K.sum = (s, d) => {
  head(s, d.t, 1.0);
  const tot = d.segs.reduce((a, b) => a + b.v, 0), x0 = 1.3, tw = W - 2.6, y = 3.1, h = 1.4;
  let x = x0;
  d.segs.forEach((g, i) => {
    const w = tw * g.v / tot;
    s.addShape(pres.shapes.RECTANGLE, { x, y, w, h, fill: { color: g.hot ? RED : (i % 2 ? "D9D9D9" : "EAEAEA") }, line: { color: "FFFFFF", width: 3 } });
    T(s, g.label, { x, y, w, h }, { fontSize: g.size || 22, bold: true, color: g.hot ? "FFFFFF" : TXT });
    if (g.cap) T(s, g.cap, { x, y: y + h + 0.12, w, h: 0.45 }, { fontSize: 14, color: g.hot ? HOT : MUTE });
    x += w;
  });
  if (d.total) H1(s, d.total, { x: x0, y: y - 0.95, w: tw, h: 0.8, align: "right" }, { fontSize: 34, color: GOLD });
  if (d.sub) T(s, d.sub, { x: 1, y: 5.5, w: W - 2, h: 0.6 }, { fontSize: 20, color: MUTE });
};
K.bars = (s, d) => {
  head(s, d.t); if (d.sub) subT(s, d.sub);
  const max = Math.max(...d.bars.map(b => b.v)), x0 = 3.8, mw = W - x0 - 1.1, tp = top(d) + 0.35, gh = Math.min(1.3, (H - tp - 1.1) / d.bars.length);
  d.bars.forEach((b, i) => {
    const y = tp + i * gh, w = Math.max(0.3, mw * b.v / max), bh = gh * 0.55;
    T(s, b.label, { x: 0.8, y, w: 2.8, h: bh, align: "right" }, { fontSize: 18, bold: true, color: b.hot ? HOT : "333333" });
    box(s, x0, y, w, bh, b.hot ? RED : "D9D9D9", null, 0.04);
    if (b.txt) { const inside = w > 4.5; T(s, b.txt, { x: inside ? x0 + 0.2 : x0 + w + 0.2, y, w: inside ? w - 0.4 : W - x0 - w - 1.2, h: bh, align: "left" }, { fontSize: 15, bold: true, color: inside ? (b.hot ? "FFFFFF" : TXT) : (b.hot ? HOT : "333333") }); }
  });
};
K.phone = (s, d) => {
  const px = d.left ? 1.3 : 8.1, pw = 3.4, py = 0.75, ph = 6.0;
  box(s, px - 0.05, py - 0.05, pw + 0.1, ph + 0.1, "D9D9D9", "D9D9D9", 0.42);
  box(s, px, py, pw, ph, "050505", "050505", 0.4);
  s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: px + pw / 2 - 0.45, y: py + 0.15, w: 0.9, h: 0.18, rectRadius: 0.09, fill: { color: "1A1A1A" }, line: { color: "1A1A1A" } });
  H1(s, d.clock || "02:14", { x: px, y: py + 0.55, w: pw, h: 0.8 }, { fontSize: 40, color: "FFFFFF" });
  (d.notes || []).forEach((n, i) => {
    const y = py + 1.6 + i * 1.08;
    box(s, px + 0.25, y, pw - 0.5, 0.95, "F2F2F2", "F2F2F2", 0.14);
    s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: px + 0.4, y: y + 0.17, w: 0.28, h: 0.28, rectRadius: 0.06, fill: { color: RED }, line: { color: RED } });
    T(s, n[0], { x: px + 0.78, y: y + 0.12, w: pw - 1.2, h: 0.36, align: "left" }, { fontSize: 11, bold: true, color: "7A7A7A" });
    T(s, n[1], { x: px + 0.4, y: y + 0.5, w: pw - 0.8, h: 0.36, align: "left" }, { fontSize: 12, bold: true, color: INKD });
  });
  const tx = d.left ? 5.5 : 1.0, tw = 6.4;
  hline(s, tx, 2.25, 0.7, RED, 3);
  H1(s, d.t, { x: tx, y: 2.45, w: tw, h: 1.9, align: "left" }, { fontSize: 38 });
  if (d.sub) T(s, d.sub, { x: tx, y: 4.45, w: tw, h: 1.0, align: "left", valign: "top" }, { fontSize: 19, color: MUTE });
};
K.day = (s, d) => {
  head(s, d.t, 0.95); if (d.sub) subT(s, d.sub, 1.9);
  const x0 = 1.0, tw = W - 2.0, y = 3.1, h = 1.2, a = d.start ?? 6, b = d.end ?? 30, X = t => x0 + tw * (t - a) / (b - a);
  s.addShape(pres.shapes.RECTANGLE, { x: x0, y, w: tw, h, fill: { color: "FFFFFF" }, line: { color: "EAEAEA" } });
  d.segs.forEach(g => { s.addShape(pres.shapes.RECTANGLE, { x: X(g.from), y, w: X(g.to) - X(g.from), h, fill: { color: g.hot ? RED : "D9D9D9" }, line: { color: "FFFFFF", width: 3 } }); T(s, g.label, { x: X(g.from), y, w: X(g.to) - X(g.from), h }, { fontSize: 17, bold: true, color: g.hot ? "FFFFFF" : TXT }); });
  for (let t = a; t <= b; t += 3) T(s, `${t % 24}시`, { x: X(t) - 0.4, y: y + h + 0.1, w: 0.8, h: 0.3 }, { fontSize: 11, color: DIM });
  if (d.cap) H1(s, d.cap, { x: 1, y: 5.15, w: W - 2, h: 0.9 }, { fontSize: 26 });
};
K.cards = (s, d) => {
  head(s, d.t); if (d.sub) subT(s, d.sub);
  const n = d.cards.length, cols = d.cols || Math.min(n, n === 4 ? 4 : 3), rows = Math.ceil(n / cols), gap = 0.3;
  const tp = top(d) + 0.15, w = (W - 1.8 - gap * (cols - 1)) / cols, h = Math.min(2.6, (H - tp - 1.0 - gap * (rows - 1)) / rows);
  d.cards.forEach((c, i) => {
    const x = 0.9 + (i % cols) * (w + gap), y = tp + Math.floor(i / cols) * (h + gap), hot = (d.hl || []).includes(i);
    box(s, x, y, w, h, hot ? RED : CARD, hot ? RED : CARDL, 0.08);
    T(s, String(i + 1).padStart(2, "0"), { x: x + 0.25, y: y + 0.2, w: 0.8, h: 0.3, align: "left" }, { fontSize: 11, bold: true, color: hot ? "FFFFFF" : GOLD, charSpacing: 2 });
    H1(s, c[0], { x: x + 0.2, y: y + 0.45, w: w - 0.4, h: c[1] ? h * 0.36 : h - 0.7 }, { fontSize: d.fs || 26, color: hot ? "FFFFFF" : TXT });
    if (c[1]) T(s, c[1], { x: x + 0.2, y: y + 0.45 + h * 0.38, w: w - 0.4, h: h * 0.4 }, { fontSize: 15, color: hot ? "F9D9D9" : MUTE });
  });
};
K.map = (s, d) => {
  head(s, d.t); if (d.sub) subT(s, d.sub);
  const n = d.pairs.length, tp = top(d) + 0.4, gap = 0.2, h = Math.min(0.95, (H - tp - 1.0 - gap * (n - 1)) / n);
  if (d.heads) { T(s, d.heads[0], { x: 0.9, y: tp - 0.45, w: 5.2, h: 0.35 }, { fontSize: 13, bold: true, color: MUTE, charSpacing: 2 }); T(s, d.heads[1], { x: 7.2, y: tp - 0.45, w: 5.2, h: 0.35 }, { fontSize: 13, bold: true, color: GOLD, charSpacing: 2 }); }
  d.pairs.forEach((p, i) => {
    const y = tp + i * (h + gap);
    box(s, 0.9, y, 5.2, h, CARD, CARDL, 0.08); T(s, p[0], { x: 1.0, y, w: 5.0, h }, { fontSize: 18, bold: true, color: "333333" });
    T(s, "›", { x: 6.1, y, w: 1.1, h }, { fontSize: 34, color: HOT });
    box(s, 7.2, y, 5.2, h, HOTC, HOTL, 0.08); T(s, p[1], { x: 7.3, y, w: 5.0, h }, { fontSize: 18, bold: true, color: "FFFFFF" });
  });
};
K.bubbles = (s, d) => {
  head(s, d.t, 0.8);
  const pos = [[1.3, 2.0], [4.4, 1.85], [7.6, 2.0], [10.3, 2.3], [2.5, 3.95], [5.6, 3.7], [8.7, 4.1], [1.0, 5.25], [10.9, 4.8]];
  d.words.forEach((wd, i) => { const [x, y] = pos[i % pos.length], r = 1.65 + (i % 3) * 0.22, hot = (d.hl || []).includes(i);
    s.addShape(pres.shapes.OVAL, { x, y, w: r * 1.15, h: r * 0.75, fill: { color: hot ? RED : "F4F4F4" }, line: { color: hot ? RED : "F4F4F4", width: 1 } });
    T(s, wd, { x, y, w: r * 1.15, h: r * 0.75 }, { fontSize: 15, bold: true, color: hot ? "FFFFFF" : "333333" }); });
  if (d.cap) H1(s, d.cap, { x: 1, y: 6.05, w: W - 2, h: 0.55 }, { fontSize: 22 });
};
K.shelf = (s, d) => {
  head(s, d.t, 0.75);
  const cols = 34, rows = 5, x0 = 1.0, y0 = 1.85, bw = (W - 2.0) / cols, bh = 0.72, hotIdx = d.hot ?? 87;
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) { const i = r * cols + c, hh = bh * (0.75 + ((i * 37) % 10) / 40);
      s.addShape(pres.shapes.RECTANGLE, { x: x0 + c * bw + 0.02, y: y0 + r * (bh + 0.14) + (bh - hh), w: bw - 0.04, h: hh, fill: { color: i === hotIdx ? HOT : ["EAEAEA", "DDDDDD", "EFEFEF", "C4C4C4"][(i * 7) % 4] }, line: { color: i === hotIdx ? HOT : "FFFFFF", width: 0.5 } }); }
    s.addShape(pres.shapes.RECTANGLE, { x: x0, y: y0 + r * (bh + 0.14) + bh, w: W - 2.0, h: 0.03, fill: { color: "A3A3A3" }, line: { color: "A3A3A3" } });
  }
  if (d.cap) T(s, d.cap, { x: 1, y: 6.15, w: W - 2, h: 0.45 }, { fontSize: 18, bold: true, color: MUTE });
};
K.coaster = (s, d) => {
  head(s, d.t, 0.7, 28);
  s.addChart(pres.charts.LINE, [{ name: "인생 그래프", labels: d.pts.map(p => p[0]), values: d.pts.map(p => p[1]) }], {
    x: 0.8, y: 1.6, w: W - 1.6, h: 5.0, lineSize: 4, lineDataSymbol: "circle", lineDataSymbolSize: 12, chartColors: [HOT], lineDataSymbolLineColor: HOT,
    catAxisLabelFontSize: 14, catAxisLabelColor: "333333", catAxisLabelFontFace: FONT, catAxisLineColor: "D9D9D9", valAxisHidden: true, valGridLine: { style: "none" }, catGridLine: { style: "none" },
    showLegend: false, valAxisMinVal: 0, valAxisMaxVal: 10, showValue: false, plotArea: { fill: { color: "FFFFFF", transparency: 100 } } });
};
K.donut = (s, d) => {
  head(s, d.t); if (d.sub) subT(s, d.sub);
  s.addChart(pres.charts.DOUGHNUT, [{ name: d.t, labels: d.labels, values: d.values }], { x: 1.2, y: 2.05, w: 5.0, h: 4.5, holeSize: 66, chartColors: [HOT, "EAEAEA"], showLegend: false, showPercent: false, showValue: false, dataBorder: { pt: 0, color: "FFFFFF" } });
  H1(s, d.center, { x: 1.2, y: 2.05, w: 5.0, h: 4.5 }, { fontSize: 34, color: HOT });
  hline(s, 7.2, 2.6, 0.7, RED, 3);
  H1(s, d.side, { x: 7.2, y: 2.8, w: 5.4, h: 3.4, align: "left", valign: "top" }, { fontSize: 26 });
};

// ── 실제 이미지 / 데이터 시각화 ──
const IMETA = require("./img/meta.json");
function picFit(s, key, x, y, w, h, frame = true) {
  const [iw, ih] = IMETA[key]; const r = Math.min(w / iw, h / ih), pw = iw * r, ph = ih * r, px = x + (w - pw) / 2, py = y + (h - ph) / 2;
  if (frame) s.addShape(pres.shapes.RECTANGLE, { x: px - 0.04, y: py - 0.04, w: pw + 0.08, h: ph + 0.08, fill: { color: "FFFFFF" }, line: { color: "E5E7EB", width: 1 }, shadow: { type: "outer", blur: 10, offset: 3, angle: 90, color: "000000", opacity: 0.12 } });
  s.addImage({ path: `img/${key}.jpg`, x: px, y: py, w: pw, h: ph });
}
K.pic = (s, d) => { head(s, d.t); if (d.sub) subT(s, d.sub); const y = top(d), h = H - y - (d.cap ? 1.35 : 0.95); picFit(s, d.pic, 1.0, y, W - 2.0, h); if (d.cap) T(s, d.cap, { x: 1, y: H - 1.25, w: W - 2, h: 0.4 }, { fontSize: 14, color: MUTE }); };
K.pics = (s, d) => {
  head(s, d.t); if (d.sub) subT(s, d.sub);
  const n = d.pics.length, gap = 0.4, w = (W - 1.8 - gap * (n - 1)) / n, y = top(d) + 0.45, h = H - y - 1.0;
  d.pics.forEach((p, i) => { const x = 0.9 + i * (w + gap); T(s, p[0], { x, y: y - 0.45, w, h: 0.38 }, { fontSize: 15, bold: true, color: i === d.hl ? HOT : MUTE, charSpacing: 2 }); if (p[1].startsWith("[")) placeholder(s, p[1], x, y, w, h); else picFit(s, p[1], x, y, w, h); });
};
// KPI 카드: kpis [[라벨, 숫자, 설명]]
K.kpi = (s, d) => {
  head(s, d.t); if (d.sub) subT(s, d.sub);
  const n = d.kpis.length, gap = 0.35, w = (W - 1.8 - gap * (n - 1)) / n, y = top(d) + 0.3, h = 2.6;
  d.kpis.forEach((k, i) => { const x = 0.9 + i * (w + gap), hot = (d.hl || []).includes(i);
    box(s, x, y, w, h, hot ? RED : CARD, hot ? RED : CARDL, 0.08);
    T(s, k[0], { x: x + 0.3, y: y + 0.3, w: w - 0.6, h: 0.4, align: "left" }, { fontSize: 14, bold: true, color: hot ? "F9D9D9" : MUTE });
    H1(s, k[1], { x: x + 0.3, y: y + 0.8, w: w - 0.6, h: 1.0, align: "left" }, { fontSize: Math.min(d.fs || 38, Math.floor((w - 0.7) * 72 / (String(k[1]).length * 0.66))), color: hot ? "FFFFFF" : TXT });
    if (k[2]) T(s, k[2], { x: x + 0.3, y: y + 1.85, w: w - 0.6, h: 0.5, align: "left" }, { fontSize: 13, color: hot ? "F9D9D9" : MUTE });
  });
  if (d.cap) T(s, d.cap, { x: 0.9, y: y + h + 0.35, w: W - 1.8, h: 0.5, align: "left" }, { fontSize: 14, color: MUTE });
};
// 막대 차트: labels, values, unit
K.chart = (s, d) => {
  head(s, d.t); if (d.sub) subT(s, d.sub);
  s.addChart(pres.charts.BAR, [{ name: d.series || "매출", labels: d.labels, values: d.values }], { x: 1.0, y: top(d), w: W - 2.0, h: H - top(d) - (d.cap ? 1.3 : 0.9), barDir: "col", chartColors: [HOT], barGapWidthPct: 60,
    catAxisLabelFontSize: 13, catAxisLabelColor: "333333", catAxisLabelFontFace: FONT, valAxisHidden: true, valGridLine: { style: "none" }, catAxisLineShow: false,
    showValue: true, dataLabelFontSize: 13, dataLabelColor: TXT, dataLabelFontFace: FONT, dataLabelFormatCode: d.fmt || '#,##0"만원"', showLegend: false });
  if (d.cap) T(s, d.cap, { x: 1, y: H - 1.25, w: W - 2, h: 0.4 }, { fontSize: 14, color: MUTE });
};
// 메일함: rows [[보낸이, 제목, 시간]]
K.inbox = (s, d) => {
  head(s, d.t); if (d.sub) subT(s, d.sub);
  const x = 1.4, w = W - 2.8, y0 = top(d) + 0.1, rh = Math.min(0.56, (H - y0 - 1.1) / (d.rows.length + 1));
  box(s, x, y0, w, rh * (d.rows.length + 1), "FFFFFF", "E5E7EB", 0.06);
  T(s, d.box || "받은편지함", { x: x + 0.3, y: y0, w: 4, h: rh, align: "left" }, { fontSize: 13, bold: true, color: MUTE });
  d.rows.forEach((r, i) => { const y = y0 + rh * (i + 1);
    s.addShape(pres.shapes.LINE, { x, y, w, h: 0, line: { color: "EEF0F3", width: 1 } });
    T(s, r[0], { x: x + 0.3, y, w: 2.0, h: rh, align: "left" }, { fontSize: 13, bold: true, color: TXT });
    T(s, r[1], { x: x + 2.4, y, w: w - 4.0, h: rh, align: "left" }, { fontSize: 13, color: "333333" });
    T(s, r[2], { x: x + w - 1.5, y, w: 1.2, h: rh, align: "right" }, { fontSize: 12, bold: true, color: MUTE });
  });
  if (d.cap) T(s, d.cap, { x: 1, y: H - 1.15, w: W - 2, h: 0.4 }, { fontSize: 13, color: MUTE });
};
// 인용(후기)
K.quote = (s, d) => {
  head(s, d.t); 
  box(s, 1.6, 2.2, W - 3.2, 3.6, "FFFFFF", "E5E7EB", 0.1);
  s.addShape(pres.shapes.RECTANGLE, { x: 1.6, y: 2.2, w: 0.09, h: 3.6, fill: { color: RED }, line: { color: RED } });
  T(s, "“", { x: 1.9, y: 2.2, w: 1, h: 1 }, { fontSize: 60, fontFace: HFONT, color: HOT });
  H1(s, d.q, { x: 2.4, y: 2.6, w: W - 4.8, h: 2.4, align: "left" }, { fontSize: 24 });
  if (d.by) T(s, d.by, { x: 2.4, y: 5.05, w: W - 4.8, h: 0.5, align: "left" }, { fontSize: 14, color: MUTE });
};

S.forEach(d => {
  if (d.sec) {
    curSec = d.sec; num++;
    [secNo, ...secName] = d.sec.split(". "); secName = secName.join(". ");
    pres.addSection({ title: d.sec });
    const s = pres.addSlide({ sectionTitle: d.sec });
    s.background = { color: "FFFFFF" };
    s.addShape(pres.shapes.RECTANGLE, { x: 0, y: 0, w: 0.22, h: H, fill: { color: RED }, line: { color: RED } });
    H1(s, String(secNo).padStart(2, "0"), { x: 0.9, y: 1.5, w: 4, h: 1.6, align: "left" }, { fontSize: 110, color: RED });
    H1(s, secName, { x: 0.9, y: 3.2, w: 11, h: 1.2, align: "left" }, { fontSize: 48 });
    if (d.goal) T(s, d.goal, { x: 0.9, y: 4.5, w: 11, h: 0.6, align: "left" }, { fontSize: 20, color: MUTE });
    addFoot(s);
    s.addNotes(`[구간 표지] ${d.sec}${d.goal ? "\n시청자 마음: " + d.goal : ""}${d.n ? "\n" + d.n : ""}`);
    return;
  }
  num++;
  const s = pres.addSlide({ sectionTitle: curSec });
  const k = d.k || "line";
  s.background = { color: "FFFFFF" };
  label(s, `${String(secNo).padStart(2, "0")}  ${secName}`);
  (K[k] || K.line)(s, d, k);
  addFoot(s);
  const notes = [];
  if (d.see) notes.push("🖼 화면: " + d.see);
  if (d.say) notes.push("🎤 말로: " + d.say);
  if (d.n) notes.push(d.n);
  s.addNotes(notes.join("\n\n"));
});
pres.writeFile({ fileName: process.argv[2] || "deck4.pptx" }).then(f => console.log("wrote", f, num));
