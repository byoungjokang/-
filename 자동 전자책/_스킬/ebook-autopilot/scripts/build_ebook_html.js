#!/usr/bin/env node
/**
 * 전자책 생성기 — HTML → PDF 빌더 (EBOOK DESIGN MASTER GUIDE 프리셋)
 *
 *   node build_ebook_html.js <book.json> <출력.pdf> --preset EB01 [--html-only]
 *
 * 경로: book.json → A5 HTML(프리셋 CSS 인라인) → Chrome headless print-to-pdf → PyMuPDF 로 러닝헤드·쪽번호 스탬프 + 차례 쪽수 채움
 * 왜 HTML 인가: docx/LibreOffice 경로는 그라데이션·둥근 모서리·그림자·드롭캡·겹치기가 안 된다. 크롬은 다 된다.
 * 이미지: book.images.cover / parts 가 있으면 넣고, 없으면 프리셋의 표지 레이아웃(C0x)에 맞는 벡터 모티프로 대신한다.
 */
const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

const args = process.argv.slice(2);
const src = args[0];
if (!src) { console.error('사용법: node build_ebook_html.js <book.json> <출력.pdf> --preset EB01'); process.exit(1); }
const out = args[1] && !args[1].startsWith('--') ? args[1] : 'ebook.pdf';
const pIdx = args.indexOf('--preset');
const book = JSON.parse(fs.readFileSync(src, 'utf8'));
const bookDir = path.dirname(path.resolve(src));
const presetId = pIdx >= 0 ? args[pIdx + 1] : (book.preset || 'EB01');
const PRESETS = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'references', 'design', 'presets.json'), 'utf8'));
const T0 = PRESETS[presetId];
if (!T0) { console.error(`프리셋 ${presetId} 없음`); process.exit(1); }
const sIdx = args.indexOf('--sub');
const subId = sIdx >= 0 ? args[sIdx + 1] : (book.presetSub || null);
const S = subId && PRESETS[subId] ? PRESETS[subId] : null;
const T = S ? { ...T0, cards: S.cards, radius: S.radius } : T0; // 보조 프리셋은 컴포넌트 문법(카드·단계·모서리)만 가져온다
const COVER_BG = T.coverBg || null, COVER_FG = T.coverText || T.text;
const htmlOnly = args.includes('--html-only');

const esc = (s) => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const lines = (t) => String(t ?? '').split('\n');
const nl2br = (t) => lines(t).map(esc).join('<br>');
const dataUri = (p) => {
  if (!p) return null; const f = path.resolve(bookDir, p); if (!fs.existsSync(f)) return null;
  const ext = path.extname(f).slice(1).toLowerCase(); const mime = ext === 'jpg' ? 'jpeg' : ext;
  return `data:image/${mime};base64,${fs.readFileSync(f).toString('base64')}`;
};
const IMG = args.includes('--no-images') ? {} : (book.images || {});
const coverImg = dataUri(IMG.cover);
const title = book.title || '', titleLines = lines(title);
const series = (book.series || 'EBOOK').toUpperCase();
const author = book.author || '';
const MK = (k) => `<span class="mk">@@${k}@@</span>`; // PyMuPDF 가 읽는 보이지 않는 마커

// ── CSS ──
const css = `
@page { size: 148mm 210mm; margin: 0; }
@page body { margin: 20mm 17mm 18mm 17mm; }
@page bleed { margin: 0; }
html, body { margin: 0; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
body { font-family: '${T.fonts.body}', 'Noto Serif KR', serif; color: ${T.text}; background: ${T.bg}; font-size: ${T.bodyPt}pt; line-height: ${T.leading}; font-weight: 400; }
.sans { font-family: '${T.fonts.sans}', 'Pretendard Variable', sans-serif; }
.tf { font-family: '${T.fonts.title}', 'Noto Serif KR', serif; }
.mk { font-size: 1pt; color: ${T.bg}; position: absolute; left: 0; top: 0; }
.page { page: bleed; box-sizing: border-box; width: 148mm; height: 210mm; position: relative; overflow: hidden; break-after: page; background: ${T.bg}; }
.flow { page: body; }
.chapter { break-before: page; position: relative; isolation: isolate; }
.chapter:first-child { break-before: auto; }
p { margin: 0 0 3.6mm; text-align: justify; orphans: 2; widows: 2; }
/* cover */
.cover .cat { position: absolute; top: 15mm; left: 0; right: 0; text-align: center; font-size: 7.5pt; letter-spacing: .3em; color: ${T.sub}; font-weight: 500; }
.cover .t { position: absolute; left: 0; right: 0; text-align: center; font-weight: 700; line-height: 1.25; letter-spacing: -.01em; }
.cover .t .l2 { color: ${T.primary}; }
.cover .sub { position: absolute; left: 14mm; right: 14mm; text-align: center; font-size: 8.5pt; color: ${T.sub}; font-weight: 300; }
.cover .au { position: absolute; bottom: 12mm; left: 0; right: 0; text-align: center; font-size: 9.5pt; letter-spacing: .15em; }
.cover .rule { position: absolute; height: .4mm; background: ${T.line}; }
/* toc */
.toc { padding: 24mm 18mm; }
.toc .lab { font-size: 7pt; letter-spacing: .3em; color: ${T.primary}; font-weight: 500; }
.toc h1 { font-size: 20pt; margin: 1mm 0 4mm; font-weight: 700; }
.toc .r { height: .4mm; background: ${T.primary}; width: 100%; margin-bottom: 6mm; }
.toc .part { margin: 5mm 0 2mm; font-size: 8pt; letter-spacing: .2em; color: ${T.primary}; font-weight: 600; }
.toc .part b { font-size: 9.5pt; letter-spacing: 0; color: ${T.text}; margin-left: 3mm; font-weight: 600; }
.toc .e { display: flex; align-items: baseline; gap: 2.5mm; font-size: 9.5pt; margin: 0 0 1.8mm; }
.toc .e .n { color: ${T.primary}; font-weight: 700; min-width: 7mm; }
.toc .e .d { flex: 1; border-bottom: .3pt dotted ${T.sub}; margin: 0 1mm; transform: translateY(-1.2mm); opacity: .6; }
.toc .e .pg { color: ${T.sub}; font-size: 8.5pt; min-width: 6mm; text-align: right; }
/* part */
.part .lab { position: absolute; top: 30mm; left: 18mm; font-size: 7.5pt; letter-spacing: .34em; color: ${T.sub}; }
.part .num { position: absolute; top: 40mm; left: 17mm; font-size: 64pt; font-weight: 700; line-height: 1; color: ${T.primary}; }
.part .tt { position: absolute; top: 76mm; left: 18mm; right: 18mm; font-size: 18pt; font-weight: 700; line-height: 1.3; }
.part .in { position: absolute; top: 96mm; left: 18mm; right: 18mm; font-size: 9.5pt; color: ${T.sub}; line-height: 1.7; }
.part .r { position: absolute; top: 114mm; left: 18mm; width: 20mm; height: .4mm; background: ${T.secondary}; }
/* chapter opener */
.ch-head { padding-top: 26mm; margin-bottom: 8mm; position: relative; break-inside: avoid; break-after: avoid; }
.ch-head .k { font-size: 7pt; letter-spacing: .28em; color: ${T.primary}; font-weight: 500; margin-bottom: 2mm; }
.ch-head h1 { font-size: 18.5pt; font-weight: 700; line-height: 1.3; margin: 0 0 4mm; letter-spacing: -.01em; }
.ch-head .r { width: 14mm; height: .5mm; background: ${T.primary}; }
.ch-head .ghost { position: absolute; right: -2mm; top: 14mm; font-size: 58pt; font-weight: 900; line-height: 1; color: ${T.section}; z-index: -1; }
/* components */
.lead { font-size: ${T.bodyPt + 1.2}pt; font-weight: 600; line-height: 1.6; color: ${T.text}; margin: 0 0 6mm; }
.sub-h { font-size: ${T.bodyPt + 3}pt; font-weight: 700; color: ${T.primary}; margin: 7mm 0 3mm; break-after: avoid; }
.key { background: ${T.section}; border-left: 1.2mm solid ${T.primary}; padding: 4.5mm 6mm; font-weight: 600; font-size: ${T.bodyPt + 1}pt; line-height: 1.6; margin: 5mm 0 6mm; border-radius: 0 ${T.radius} ${T.radius} 0; break-inside: avoid; }
.quote { margin: 6mm 0; padding: 0 0 0 6mm; border-left: .5mm solid ${T.secondary}; font-size: ${T.bodyPt + 2}pt; line-height: 1.7; break-inside: avoid; }
.quote .src { display: block; font-size: 7.5pt; color: ${T.sub}; margin-top: 2mm; font-weight: 400; }
.case { background: ${T.section}; padding: 4.5mm 5.5mm; margin: 4mm 0 6mm; border-radius: ${T.radius}; break-inside: avoid; }
.case .ct { font-size: 7pt; letter-spacing: .2em; color: ${T.primary}; font-weight: 600; margin-bottom: 1.5mm; }
.case p { font-size: ${T.bodyPt - 0.5}pt; margin: 0 0 1.5mm; }
.hook { margin: 6mm 0 0; padding: 4mm 5.5mm; background: ${T.section}; border-radius: ${T.radius}; font-size: ${T.bodyPt}pt; color: ${T.text}; }
.hook b { color: ${T.primary}; margin-right: 1.5mm; font-weight: 700; }
.div { text-align: center; color: ${T.secondary}; font-size: 8pt; letter-spacing: .5em; margin: 5mm 0; }
.check { margin: 3mm 0 6mm; break-inside: avoid; }
.check .lab { font-size: 7pt; letter-spacing: .2em; color: ${T.primary}; font-weight: 600; margin-bottom: 1.5mm; }
.check div { display: flex; gap: 2.5mm; font-size: ${T.bodyPt - 0.5}pt; line-height: 1.55; margin-bottom: 1.4mm; }
.check div i { color: ${T.primary}; font-style: normal; font-weight: 700; }
.steps { margin: 2mm 0 6mm; }
.step { display: flex; gap: 3mm; margin-bottom: 3mm; break-inside: avoid; }
.step .n { flex: 0 0 9mm; }
.step .n { font-weight: 800; color: ${T.primary}; font-size: ${T.bodyPt + 6}pt; line-height: 1.1; }
.step .b { font-size: ${T.bodyPt - 0.3}pt; line-height: 1.65; }
.cards { margin: 2mm 0 5mm; }
.card { display: flex; gap: 2.5mm; margin-bottom: 2.5mm; break-inside: avoid; }
.card > .n { flex: 0 0 10mm; }
.card > div:last-child { flex: 1; min-width: 0; }
.card .n { font-weight: 700; color: ${T.primary}; font-size: ${T.bodyPt + 3}pt; line-height: 1.2; }
.card .q { font-weight: 600; font-size: ${T.bodyPt}pt; line-height: 1.55; margin-bottom: 1mm; }
.card .e { font-size: ${T.bodyPt - 1.5}pt; color: ${T.sub}; line-height: 1.55; }
/* card variants */
.cards.v-card .card { background: ${T.section}; border-radius: ${T.radius}; padding: 3.5mm 4mm; }
.cards.v-hairline .card { padding: 0 0 2.5mm; border-bottom: .3pt solid ${T.line}; }
.cards.v-plain .card { padding: 0 0 2mm; }
.cards.v-workbook .card .n { font-size: ${T.bodyPt + 8}pt; }
.steps.v-card .step { background: ${T.section}; border-radius: ${T.radius}; padding: 3.5mm 4mm; }
.steps.v-hairline .step { border-bottom: .3pt solid ${T.line}; padding-bottom: 2.5mm; }
/* closing */
.closing .r { position: absolute; top: 88mm; left: 18mm; right: 18mm; height: .4mm; background: ${T.secondary}; }
.closing .t { position: absolute; top: 96mm; left: 18mm; right: 18mm; text-align: center; font-size: 15pt; font-weight: 700; line-height: 1.5; }
.closing .s { position: absolute; top: 118mm; left: 18mm; right: 18mm; text-align: center; font-size: 10pt; color: ${T.primary}; }
.closing .f { position: absolute; bottom: 16mm; left: 0; right: 0; text-align: center; font-size: 7pt; letter-spacing: .25em; color: ${T.sub}; }
`;

// ── 표지 (프리셋 레이아웃) ──
function coverHTML() {
  const L = T.cover;
  const t2 = titleLines.length > 1;
  const tHTML = titleLines.map((l, i) => `<div class="${i === titleLines.length - 1 && t2 ? 'l2' : ''}">${esc(l)}</div>`).join('');
  if (L === 'C03') { // Editorial Split: 왼쪽 텍스트 / 오른쪽 이미지(없으면 색면+도형)
    const right = coverImg
      ? `<div style="position:absolute;left:78mm;right:0;top:0;bottom:0;overflow:hidden"><img src="${coverImg}" style="width:100%;height:100%;object-fit:cover"></div>`
      : `<div style="position:absolute;left:78mm;right:0;top:0;bottom:0;background:${T.primary}"><div style="position:absolute;left:14mm;top:70mm;width:42mm;height:42mm;border-radius:50%;background:${T.secondary};opacity:.85"></div><div style="position:absolute;left:30mm;top:118mm;width:24mm;height:24mm;border-radius:50%;background:${T.bg};opacity:.35"></div></div>`;
    return `<div class="page cover tf">${MK('COVER')}${right}
      <div class="cat sans" style="text-align:left;left:14mm;width:60mm;letter-spacing:.2em">${esc(series)}</div>
      <div class="t" style="top:60mm;left:14mm;width:58mm;text-align:left;font-size:17pt;line-height:1.3">${tHTML}</div>
      <div class="rule" style="top:118mm;left:14mm;width:16mm;background:${T.primary}"></div>
      <div class="sub sans" style="top:124mm;left:14mm;width:58mm;text-align:left">${esc(book.subtitle || '')}</div>
      <div class="au" style="text-align:left;left:14mm;width:58mm">${esc(author)}</div></div>`;
  }
  if (L === 'C04' && coverImg) { // Full Image + 최소 텍스트 (이미지 없으면 아래 C02 로)
    return `<div class="page cover tf" style="color:#FFFFFF">${MK('COVER')}
      <img src="${coverImg}" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover">
      <div style="position:absolute;inset:0;background:linear-gradient(180deg,rgba(0,0,0,.05) 40%,rgba(0,0,0,.62) 100%)"></div>
      <div class="cat sans" style="color:rgba(255,255,255,.85)">${esc(series)}</div>
      <div class="t" style="top:150mm;left:14mm;right:14mm;text-align:left;font-size:21pt;color:#fff;text-shadow:0 1mm 3mm rgba(0,0,0,.35)">${titleLines.map((l) => `<div>${esc(l)}</div>`).join('')}</div>
      <div class="sub sans" style="top:178mm;left:14mm;right:14mm;text-align:left;color:rgba(255,255,255,.85)">${esc(book.subtitle || '')}</div>
      <div class="au" style="text-align:left;left:14mm;color:#fff">${esc(author)}</div></div>`;
  }
  if (L === 'C05') { // Frame: 얇은 테두리 안 제목과 오브젝트
    const obj = coverImg
      ? `<div style="position:absolute;left:40mm;top:96mm;width:68mm;height:56mm;overflow:hidden"><img src="${coverImg}" style="width:100%;height:100%;object-fit:cover"></div>`
      : `<svg style="position:absolute;left:52mm;top:100mm" width="44mm" height="44mm" viewBox="0 0 44 44"><circle cx="22" cy="22" r="20" fill="none" stroke="${T.primary}" stroke-width=".6"/><circle cx="22" cy="22" r="13" fill="none" stroke="${T.secondary}" stroke-width=".6"/><circle cx="22" cy="22" r="6" fill="${T.primary}"/></svg>`;
    return `<div class="page cover tf">${MK('COVER')}
      <div style="position:absolute;left:10mm;top:10mm;right:10mm;bottom:10mm;border:.35mm solid ${T.primary}"></div>
      <div style="position:absolute;left:12mm;top:12mm;right:12mm;bottom:12mm;border:.2mm solid ${T.line}"></div>
      <div class="cat sans" style="top:22mm">${esc(series)}</div>
      <div class="t" style="top:44mm;font-size:19pt">${tHTML}</div>
      <div class="rule" style="top:${t2 ? 76 : 64}mm;left:64mm;width:20mm;background:${T.secondary}"></div>
      <div class="sub sans" style="top:${t2 ? 81 : 69}mm">${esc(book.subtitle || '')}</div>
      ${obj}
      <div class="au" style="bottom:20mm">${esc(author)}</div></div>`;
  }
  if (L === 'C01') { // 상단 카테고리 / 중앙 제목 / 하단 이미지
    const imgBlock = coverImg
      ? `<div style="position:absolute;left:14mm;right:14mm;top:86mm;height:96mm;border-radius:${T.radius === '0' ? '0' : '3mm'};overflow:hidden;box-shadow:0 10mm 18mm -10mm rgba(0,0,0,.35)"><img src="${coverImg}" style="width:100%;height:100%;object-fit:cover"></div>`
      : `<div style="position:absolute;left:14mm;right:14mm;top:86mm;height:96mm;background:${T.section};border-radius:3mm"></div>`;
    return `<div class="page cover tf" style="background:linear-gradient(180deg,${T.bg} 0%,${T.section} 100%)">${MK('COVER')}
      <div class="cat sans">${esc(series)}</div>
      <div class="t" style="top:34mm;font-size:25pt">${tHTML}</div>
      <div class="rule" style="top:66mm;left:62mm;width:24mm"></div>
      <div class="sub sans" style="top:70mm">${esc(book.subtitle || '')}</div>
      ${imgBlock}
      <div class="au">${esc(author)}</div></div>`;
  }
  if (L === 'C08') { // 작은 회화 하나 + 한 줄 제목
    const motif = coverImg
      ? `<div style="position:absolute;left:54mm;top:56mm;width:40mm;height:48mm;overflow:hidden"><img src="${coverImg}" style="width:100%;height:100%;object-fit:cover;filter:saturate(.7) contrast(.95)"></div>`
      : `<svg style="position:absolute;left:56mm;top:58mm" width="36mm" height="44mm" viewBox="0 0 36 44"><rect width="36" height="44" fill="${T.primary}"/><rect x="2" y="2" width="14" height="18" fill="${T.secondary}" opacity=".9"/><rect x="20" y="2" width="14" height="18" fill="#3B3A36"/><rect x="2" y="24" width="14" height="18" fill="#3B3A36"/><rect x="20" y="24" width="14" height="18" fill="${T.secondary}" opacity=".45"/></svg>`;
    return `<div class="page cover tf">${MK('COVER')}${motif}
      <div class="t" style="top:118mm;font-size:15pt;font-weight:400;letter-spacing:.04em">${esc(title.replace(/\n/g, ' '))}</div>
      <div class="sub" style="top:131mm;font-size:8.5pt">${esc(book.subtitle || '')}</div>
      <div class="au" style="font-size:8.5pt;letter-spacing:.3em">${esc(author)}</div></div>`;
  }
  if (L === 'C02' || L === 'C04') { // Big Type: 제목이 60~70% (C04 에 이미지가 없으면 여기로)
    const num = (book.coverHook || '').replace(/[^\d]/g, '');
    const dark = !!COVER_BG;
    return `<div class="page cover tf" style="${dark ? `background:${COVER_BG};color:${COVER_FG}` : ''}">${MK('COVER')}
      <div class="cat sans" style="text-align:left;left:16mm">${esc(series)}</div>
      ${num ? `<div style="position:absolute;left:13mm;top:34mm;font-size:96pt;font-weight:900;line-height:1;letter-spacing:-.04em;color:${dark ? T.secondary : T.text}">${num}</div>` : ''}
      <div class="t" style="top:${num ? 84 : 44}mm;left:16mm;text-align:left;font-size:22pt;line-height:1.25;${dark ? `color:${COVER_FG}` : ''}">${dark ? titleLines.map((l, i) => `<div style="${i === titleLines.length - 1 && t2 ? `color:${T.secondary}` : ''}">${esc(l)}</div>`).join('') : tHTML}</div>
      <div class="rule" style="top:${num ? 126 : 86}mm;left:16mm;width:30mm;height:1mm;background:${T.secondary}"></div>
      <div class="sub sans" style="top:${num ? 132 : 92}mm;left:16mm;text-align:left;${dark ? `color:${T.sub}` : ''}">${esc(book.subtitle || '')}</div>
      <div class="au sans" style="text-align:left;left:16mm;letter-spacing:.05em;font-weight:500;${dark ? `color:${COVER_FG}` : ''}">${esc(author)}</div></div>`;
  }
  if (L === 'C07') { // Typographic Grid
    const parts = (book.chapters || []).filter((c) => c.part).map((c) => c.part);
    return `<div class="page cover tf">${MK('COVER')}
      <div style="position:absolute;left:16mm;right:16mm;top:40mm;height:.35mm;background:${T.text}"></div>
      <div style="position:absolute;left:16mm;right:16mm;top:118mm;height:.35mm;background:${T.text}"></div>
      <div style="position:absolute;left:16mm;right:16mm;top:170mm;height:.35mm;background:${T.text}"></div>
      <div style="position:absolute;left:74mm;top:118mm;height:52mm;width:.35mm;background:${T.text}"></div>
      <div class="cat sans" style="text-align:left;left:16mm;top:32mm;letter-spacing:.2em">${esc(series)}</div>
      <div class="cat sans" style="text-align:right;right:16mm;top:32mm;color:${T.secondary};letter-spacing:.2em">VOL. 01</div>
      <div class="t sans" style="top:50mm;left:16mm;text-align:left;font-size:19pt;font-weight:900;letter-spacing:-.02em">${titleLines.map((l) => `<div>${esc(l)}</div>`).join('')}</div>
      <div class="sub sans" style="top:104mm;left:16mm;text-align:left;color:${T.text}">${esc(book.subtitle || '')}</div>
      <div class="sans" style="position:absolute;left:16mm;top:126mm;font-size:6.5pt;letter-spacing:.2em;color:${T.sub}">PARTS</div>
      <div class="sans" style="position:absolute;left:16mm;top:132mm;font-size:11pt;font-weight:700">${parts.length}개 파트</div>
      <div class="sans" style="position:absolute;left:80mm;top:126mm;font-size:6.5pt;letter-spacing:.2em;color:${T.sub}">CHAPTERS</div>
      <div class="sans" style="position:absolute;left:80mm;top:132mm;font-size:11pt;font-weight:700">${(book.chapters || []).length}개 장</div>
      <div style="position:absolute;left:16mm;top:142mm;width:14mm;height:1mm;background:${T.secondary}"></div>
      <div class="au sans" style="text-align:left;left:16mm;bottom:22mm;letter-spacing:.05em;font-weight:500">${esc(author)}</div>
      <div class="sans" style="position:absolute;right:16mm;bottom:22mm;font-size:7pt;letter-spacing:.2em;color:${T.sub}">${new Date().getFullYear()}</div></div>`;
  }
  if (L === 'C06') { // Object Focus: 오브젝트 하나 중앙
    const motif = coverImg
      ? `<div style="position:absolute;left:34mm;top:52mm;width:80mm;height:80mm;overflow:hidden"><img src="${coverImg}" style="width:100%;height:100%;object-fit:cover"></div>`
      : `<svg style="position:absolute;left:44mm;top:56mm" width="60mm" height="78mm" viewBox="0 0 60 78"><g fill="${T.secondary}"><rect x="4" y="18" width="14" height="60" opacity=".9"/><rect x="20" y="0" width="18" height="78"/><rect x="40" y="32" width="12" height="46" opacity=".8"/></g><g fill="${T.primary}"><rect x="23" y="6" width="3" height="4"/><rect x="29" y="6" width="3" height="4"/><rect x="23" y="14" width="3" height="4"/><rect x="29" y="14" width="3" height="4"/><rect x="23" y="22" width="3" height="4"/><rect x="29" y="22" width="3" height="4"/><rect x="7" y="24" width="2.5" height="3.5"/><rect x="12" y="24" width="2.5" height="3.5"/><rect x="7" y="32" width="2.5" height="3.5"/><rect x="12" y="32" width="2.5" height="3.5"/></g></svg>`;
    return `<div class="page cover tf" style="background:${T.primary};color:${T.bg}">${MK('COVER')}${motif}
      <div class="cat sans" style="color:${T.secondary}">${esc(series)}</div>
      <div class="rule" style="top:140mm;left:40mm;width:68mm;background:${T.secondary}"></div>
      <div class="t" style="top:150mm;font-size:${t2 ? 14 : 17}pt;color:${T.bg}">${titleLines.map((l, i) => `<div style="${i === 0 && t2 ? `font-size:10pt;font-weight:400;color:${T.line};margin-bottom:2mm` : ''}">${esc(l)}</div>`).join('')}</div>
      <div class="sub sans" style="top:${t2 ? 176 : 166}mm;color:${T.line}">${esc(book.subtitle || '')}</div>
      <div class="au sans" style="color:${T.secondary};letter-spacing:.2em;font-size:8pt">${esc(author)}</div></div>`;
  }
  return coverHTML.call({ ...T, cover: 'C01' });
}

// ── 파트 ──
function partHTML(part) {
  const pn = String(part.no).padStart(2, '0');
  const S = T.partStyle;
  const pimg = dataUri(IMG.parts && IMG.parts[String(part.no)]);
  if (S === 'dark') return `<div class="page part tf" style="background:${T.primary};color:${T.bg}">${MK('PART')}
    <div class="lab sans" style="color:${T.secondary}">PART ${pn}</div>
    <div style="position:absolute;top:36mm;left:18mm;width:20mm;height:.5mm;background:${T.secondary}"></div>
    <div class="tt sans" style="top:80mm;font-size:22pt;font-weight:900;letter-spacing:-.02em;color:${T.bg}">${esc(part.title || '')}</div>
    <div class="in" style="top:${part.title && part.title.length > 12 ? 118 : 104}mm;color:${T.sub}">${esc(part.intro || '')}</div></div>`;
  if (S === 'band') return `<div class="page part tf">${MK('PART')}
    <div style="position:absolute;left:0;right:0;top:0;height:70mm;background:${T.primary}"></div>
    <div class="lab sans" style="top:28mm;color:${T.section}">PART</div>
    <div class="num sans" style="top:36mm;font-size:34pt;font-weight:900;color:${T.bg}">${pn}</div>
    <div class="tt" style="top:88mm;font-size:16pt">${esc(part.title || '')}</div>
    <div class="in" style="top:104mm">${esc(part.intro || '')}</div>
    <div class="sans" style="position:absolute;top:130mm;left:18mm;font-size:8pt;color:${T.sub}">이번 파트에서 얻고 싶은 것</div>
    <div style="position:absolute;top:140mm;left:18mm;right:18mm;height:.3mm;background:${T.line}"></div>
    <div style="position:absolute;top:152mm;left:18mm;right:18mm;height:.3mm;background:${T.line}"></div>
    <div style="position:absolute;top:164mm;left:18mm;right:18mm;height:.3mm;background:${T.line}"></div></div>`;
  if (S === 'quiet') return `<div class="page part tf">${MK('PART')}
    <div style="position:absolute;left:0;right:0;top:0;height:5mm;background:${T.primary}"></div>
    <div class="lab sans" style="top:44mm;color:${T.secondary}">PART ${pn}</div>
    <div class="num" style="top:54mm;font-size:44pt">${pn}</div>
    <div class="tt" style="top:98mm;font-size:16pt">${esc(part.title || '')}</div>
    <div class="in" style="top:114mm">${esc(part.intro || '')}</div>
    <div class="r" style="top:130mm"></div>
    ${pimg ? `<div style="position:absolute;left:18mm;right:18mm;top:140mm;height:52mm;overflow:hidden"><img src="${pimg}" style="width:100%;height:100%;object-fit:cover"></div>` : ''}</div>`;
  // section (EB01)
  return `<div class="page part tf" style="background:${T.section}">${MK('PART')}
    <div class="lab sans">PART</div>
    <div class="num">${pn}</div>
    <div class="tt">${esc(part.title || '')}</div>
    <div class="in">${esc(part.intro || '')}</div>
    <div class="r"></div>
    ${pimg ? `<div style="position:absolute;left:18mm;right:18mm;top:124mm;height:64mm;border-radius:${T.radius};overflow:hidden;box-shadow:0 8mm 14mm -10mm rgba(0,0,0,.3)"><img src="${pimg}" style="width:100%;height:100%;object-fit:cover"></div>`
      : `<div style="position:absolute;right:18mm;bottom:22mm;width:34mm;height:34mm;border-radius:50%;background:${T.line};opacity:.5"></div><div style="position:absolute;right:26mm;bottom:38mm;width:18mm;height:18mm;border-radius:50%;background:${T.primary};opacity:.22"></div>`}</div>`;
}

// ── 블록 ──
const SENT = /^(\([^)]*\)\s*)?["“](.+?)["”]\s*[—–-]\s*(.*)$/s;
let sentenceNo = 0;
function blockHTML(b) {
  const type = b.type === 'thesis' ? 'point' : (b.type || 'p');
  switch (type) {
    case 'p': return lines(b.text).map((l) => `<p>${esc(l)}</p>`).join('');
    case 'lead': return `<div class="lead">${esc(b.text)}</div>`;
    case 'sub': return `<div class="sub-h tf">${esc(b.text)}</div>`;
    case 'point': return `<div class="key">${esc(b.text)}</div>`;
    case 'quote': return `<div class="quote tf">${nl2br(b.text)}${b.source ? `<span class="src sans">— ${esc(b.source)}</span>` : ''}</div>`;
    case 'box': return `<div class="case"><div class="ct sans">${esc(b.title || 'CASE')}</div>${lines(b.text).map((l) => `<p>${esc(l)}</p>`).join('')}</div>`;
    case 'hook': return `<div class="hook"><b>→</b>${esc(b.text)}</div>`;
    case 'divider': return `<div class="div">◆ ◆ ◆</div>`;
    case 'check': return `<div class="check"><div class="lab sans">CHECKLIST</div>${(b.items || []).map((it) => `<div><i>✓</i><span>${esc(it)}</span></div>`).join('')}</div>`;
    case 'steps': return `<div class="steps v-${T.cards === 'plain' ? 'hairline' : T.cards}">${(b.items || []).map((it, i) => `<div class="step"><div class="n tf">${i + 1}</div><div class="b">${esc(it)}</div></div>`).join('')}</div>`;
    case 'list': {
      const items = (b.items || []).map((it) => {
        const m = SENT.exec(it);
        if (m) { sentenceNo += 1; return `<div class="card"><div class="n tf">${String(sentenceNo).padStart(2, '0')}</div><div><div class="q tf">${m[1] ? `<span style="font-weight:400;color:${T.sub};font-size:.85em">${esc(m[1].trim())} </span>` : ''}“${esc(m[2])}”</div><div class="e">${esc(m[3])}</div></div></div>`; }
        const parts = it.split(/\s—\s/);
        return `<div class="card"><div class="n tf">·</div><div><div class="q tf">${esc(parts[0])}</div>${parts.length > 1 ? `<div class="e">${esc(parts.slice(1).join(' — '))}</div>` : ''}</div></div>`;
      }).join('');
      return `<div class="cards v-${T.cards}">${items}</div>`;
    }
    default: return `<p>${esc(b.text || '')}</p>`;
  }
}

// ── 조립 ──
function build(pageNums) {
  sentenceNo = 0;
  const chapters = book.chapters || [];
  const toc = [];
  let tp = null;
  chapters.forEach((ch, i) => {
    if (ch.part && ch.part.no !== tp) { tp = ch.part.no; toc.push(`<div class="part sans">PART ${String(ch.part.no).padStart(2, '0')}<b class="tf">${esc(ch.part.title || '')}</b></div>`); }
    toc.push(`<div class="e tf"><span class="n">${esc(ch.no)}</span><span>${esc(ch.title)}</span><span class="d"></span><span class="pg sans">${pageNums ? (pageNums[i] ?? '') : ''}</span></div>`);
  });
  let body = '';
  let lastPart = null;
  chapters.forEach((ch, i) => {
    if (ch.part && ch.part.no !== lastPart) { lastPart = ch.part.no; body += partHTML(ch.part); }
    const isNum = /^\d+$/.test(String(ch.no));
    const kicker = isNum ? `CHAPTER ${String(ch.no).padStart(2, '0')}` : (ch.no === '프롤로그' ? 'PROLOGUE' : ch.no === '에필로그' ? 'EPILOGUE' : ch.no);
    body += `<div class="flow"><div class="chapter">${MK('CH' + i)}<div class="ch-head">${isNum ? `<div class="ghost tf">${String(ch.no).padStart(2, '0')}</div>` : ''}<div class="k sans">${esc(kicker)}</div><h1 class="tf">${esc(ch.title)}</h1><div class="r"></div></div>${(ch.blocks || []).map(blockHTML).join('')}</div></div>`;
  });
  const closing = book.closing || { text: '끝까지 읽어주셔서 고맙습니다.' };
  const cl = lines(closing.text);
  const closingHTML = `<div class="page closing tf">${MK('CLOSING')}<div class="r"></div><div class="t">${esc(cl[0] || '')}</div><div class="s">${esc(cl.slice(1).join(' '))}</div><div class="f sans">${esc(author)} · ${esc(series)}</div></div>`;
  return `<!doctype html><html lang="ko"><head><meta charset="utf-8"><title>${esc(title.replace(/\n/g, ' '))}</title><style>${css}</style></head><body>
<div style="page:bleed">${coverHTML()}</div>
<div class="page toc tf">${MK('TOC')}<div class="lab sans">CONTENTS</div><h1>차례</h1><div class="r"></div>${toc.join('')}</div>
${body}
${closingHTML}
</body></html>`;
}

// ── Chrome print + PyMuPDF 후처리 ──
const chrome = ['C:/Program Files/Google/Chrome/Application/chrome.exe', 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe', '/usr/bin/google-chrome', '/usr/bin/chromium'].find((p) => fs.existsSync(p));
const outAbs = path.resolve(out);
const htmlPath = outAbs.replace(/\.pdf$/i, '') + `.${presetId}.html`;
function printPdf(html, pdf) {
  fs.writeFileSync(htmlPath, html);
  if (!chrome) { console.error('Chrome/Edge 를 찾지 못했습니다'); process.exit(2); }
  const r = spawnSync(chrome, ['--headless=new', '--disable-gpu', '--no-pdf-header-footer', `--print-to-pdf=${pdf}`, '--virtual-time-budget=10000', 'file:///' + htmlPath.replace(/\\/g, '/')], { stdio: 'ignore' });
  if (!fs.existsSync(pdf)) { console.error('PDF 생성 실패', r.status); process.exit(3); }
}
const post = path.join(__dirname, 'stamp_pdf.py');
if (htmlOnly) { fs.writeFileSync(htmlPath, build(null)); console.log('HTML:', htmlPath); process.exit(0); }
const tmp1 = outAbs + '.pass1.pdf';
printPdf(build(null), tmp1);
// pass1: 챕터 시작 쪽 찾기 (본문 쪽번호는 차례 다음부터 1)
const scan = spawnSync('python', [post, '--scan', tmp1], { encoding: 'utf8', env: { ...process.env, PYTHONIOENCODING: 'utf-8' } });
if (scan.status !== 0) { console.error(scan.stderr); process.exit(4); }
const info = JSON.parse(scan.stdout);
const pageNums = (book.chapters || []).map((_, i) => info.chapters[String(i)] != null ? info.chapters[String(i)] - info.bodyStart + 1 : '');
printPdf(build(pageNums), tmp1);
const stamp = spawnSync('python', [post, '--stamp', tmp1, outAbs, '--title', title.replace(/\n/g, ' '), '--author', author, '--color', T.sub.replace('#', ''), '--font', T.fonts.sans], { encoding: 'utf8', env: { ...process.env, PYTHONIOENCODING: 'utf-8' } });
if (stamp.status !== 0) { console.error(stamp.stderr); process.exit(5); }
try { fs.unlinkSync(tmp1); } catch (e) { /* ignore */ }
console.log(`[${presetId} ${T.name}${S ? ' + ' + subId + ' 30%' : ''}] ${stamp.stdout.trim()} → ${outAbs}`);
