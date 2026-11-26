#!/usr/bin/env node
/**
 * 전자책 생성기 — A5 일러스트 빌더 (템플릿 12 '블러시 일러스트')
 *
 * 사용법:
 *   node build_ebook_a5.js <book.json> <출력.docx> [--template 12] [--no-page-numbers]
 *
 * A4 빌더(build_ebook.js)와 다른 점:
 *   - 판형 A5 148×210mm, 여백 위 22 / 아래 20 / 좌우 17mm, 본문 9.5pt 명조, 줄간격 약 165%
 *   - 표지: 장식 PNG(뒤에 깔림) + 삽화 + 제목 두 줄(둘째 줄 강조색) + 태그라인
 *   - 파트 표지 페이지: 큰 번호 + 제목 + 삽화
 *   - list 블록: 「"문장" — 설명」 꼴이면 번호 배지가 달린 문장 카드(표)로, 번호는 책 전체에서 이어짐
 *   - steps: 강조색 배지 + 연한 바탕 카드
 *   - point / hook / quote: 연한 블러시 바탕 박스
 *
 * book.json 추가 필드:
 *   images: { cover, parts: {"1": path, "2": path, ...}, coverBg }  — book.json 위치 기준 상대 경로
 *   tagline: 표지 아래 짧은 두 줄 (없으면 closing.text)
 */
const {
  Document, Packer, Paragraph, TextRun, ImageRun, AlignmentType, BorderStyle, ShadingType, LineRuleType,
  Header, Footer, PageNumber, PageReference, TabStopType, LeaderType, Bookmark,
  Table, TableRow, TableCell, WidthType, VerticalAlign, HeightRule,
  HorizontalPositionRelativeFrom, VerticalPositionRelativeFrom, TextWrappingType,
} = require('docx');
const fs = require('fs');
const path = require('path');

const args = process.argv.slice(2);
const src = args[0];
if (!src) { console.error('사용법: node build_ebook_a5.js <book.json> <출력.docx> [--template 12]'); process.exit(1); }
const out = args[1] && !args[1].startsWith('--') ? args[1] : 'ebook.docx';
const flag = (n) => args.includes(n);
const tIdx = args.indexOf('--template');
const book = JSON.parse(fs.readFileSync(src, 'utf8'));
const bookDir = path.dirname(path.resolve(src));
const templateId = String(tIdx >= 0 ? args[tIdx + 1] : (book.template || '12')).padStart(2, '0');
const TEMPLATES = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'references', 'templates.json'), 'utf8'));
const T = TEMPLATES[templateId];
if (!T) { console.error(`템플릿 ${templateId} 없음`); process.exit(1); }
const pageNumbers = !flag('--no-page-numbers') && book.pageNumbers !== false;

// ── A5 판형 ──
const mm = (v) => Math.round(v * 56.69);
const PAGE = { w: mm(148), h: mm(210) };
const M = { top: mm(22), bottom: mm(20), left: mm(17), right: mm(17), header: mm(9), footer: mm(9) };
const TEXT_W = PAGE.w - M.left - M.right;
const EMU = (v) => Math.round(v * 36000); // mm → EMU

// ── 색 ──
const mix = (a, b, t) => {
  const A = parseInt(a, 16), B = parseInt(b, 16);
  const ch = (s) => Math.round(((A >> s) & 255) * (1 - t) + ((B >> s) & 255) * t);
  return [16, 8, 0].map((s) => ch(s).toString(16).padStart(2, '0')).join('').toUpperCase();
};
const PAPER = T.paper, INK = T.inkBody, ACC = T.accent;
const C = {
  lead: mix(PAPER, INK, 0.7), muted: mix(PAPER, INK, 0.45), rule: mix(PAPER, ACC, 0.35),
  fill: T.fill || mix(PAPER, ACC, 0.10),        // 연한 블러시 바탕
  fill2: T.fill2 || mix(PAPER, ACC, 0.22),      // 조금 진한 블러시 (배지·라벨)
  badgeInk: T.badgeInk || 'FFFFFF',
};
const F_TITLE = T.titleFont, F_BODY = T.bodyFont, F_SANS = T.sansFont || 'Pretendard Variable';

// ── 타이포 (half-point) ──
const SZ = {
  coverKicker: 14, coverTitle: 44, coverSubtitle: 17, coverTag: 19, coverAuthor: 20, coverFoot: 12,
  tocTitle: 36, tocLabel: 13, tocEntry: 18, tocPart: 15,
  partNum: 76, partTitle: 40, partIntro: 18, partGhost: 120,
  chKicker: 14, chTitle: 32,
  lead: 20, sub: 23, point: 20, body: 18, quote: 18, quoteSrc: 15, card: 18, cardExp: 15, badge: 20, box: 17, boxTitle: 18, check: 17, hook: 18, divider: 16,
  closing: 30, closingSub: 19, footer: 14, head: 13,
};
const LINE = { body: 380, tight: 300, title: 320 };
const sp = (o) => ({ ...o, line: o.line || LINE.body, lineRule: LineRuleType.AUTO });
const NOB = { style: BorderStyle.NONE, size: 0, color: 'auto' };
const NOBORDERS = { top: NOB, bottom: NOB, left: NOB, right: NOB, insideHorizontal: NOB, insideVertical: NOB };
const shade = (fill) => ({ type: ShadingType.CLEAR, color: 'auto', fill });
const run = (text, o = {}) => new TextRun({
  text, font: o.font || F_BODY, size: o.size || SZ.body, color: o.color || INK,
  bold: !!o.bold, italics: !!o.italics, characterSpacing: o.sp || 0,
});
const P = (children, o = {}) => new Paragraph({
  children, alignment: o.align || AlignmentType.LEFT,
  spacing: sp({ before: o.before || 0, after: o.after ?? 160, line: o.line }),
  indent: o.indent, border: o.border, shading: o.fill ? shade(o.fill) : undefined,
  keepNext: o.keepNext, keepLines: o.keepLines, pageBreakBefore: o.pageBreakBefore,
});
const gap = (after = 160, extra = {}) => new Paragraph({ children: [new TextRun({ text: '', size: 2 })], spacing: { after, line: 240, lineRule: LineRuleType.AUTO }, ...extra });
const spacer = (mmh) => new Paragraph({ children: [new TextRun({ text: '', size: 2 })], spacing: { before: 0, after: 0, line: mmh * 56.69, lineRule: LineRuleType.EXACT } });
const rule = (color = C.rule, before = 0, after = 200, short = false) => new Paragraph({
  children: [new TextRun({ text: '', size: 2 })],
  spacing: { before, after, line: 240, lineRule: LineRuleType.AUTO },
  indent: short ? { right: TEXT_W - mm(14) } : undefined,
  border: { bottom: { style: BorderStyle.SINGLE, size: 8, color, space: 1 } },
});
const cleanLines = (t) => String(t ?? '').split('\n');

// 연한 바탕 박스 (문단 shading + 같은 색 border 로 안쪽 여백)
const BOX_PAD = 10;
const shaded = (fill, children, o = {}) => {
  const b = { style: BorderStyle.SINGLE, size: 4, color: fill, space: o.pad ?? BOX_PAD };
  return new Paragraph({
    children, shading: shade(fill), alignment: o.align || AlignmentType.LEFT,
    border: { top: b, bottom: b, left: b, right: b },
    spacing: sp({ before: o.before || 0, after: o.after ?? 100, line: o.line || 360 }),
    keepNext: o.keepNext !== false, keepLines: true,
  });
};
const shadedPad = (fill, after = 120) => shaded(fill, [new TextRun({ text: '', size: 2 })], { after, line: 240 });
const block = (fill, paras, pad = 0) => (pad > 0 ? [shadedPad(fill, pad), ...paras, shadedPad(fill, pad)] : paras);

// ── 이미지 ──
const imgPath = (p) => (p ? path.resolve(bookDir, p) : null);
const imgSize = (file) => { // PNG/JPEG 크기 읽기
  const b = fs.readFileSync(file);
  if (b.toString('ascii', 1, 4) === 'PNG') return { w: b.readUInt32BE(16), h: b.readUInt32BE(20) };
  let i = 2; while (i < b.length) { if (b[i] !== 0xFF) { i++; continue; } const m = b[i + 1]; if (m >= 0xC0 && m <= 0xC3) return { h: b.readUInt16BE(i + 5), w: b.readUInt16BE(i + 7) }; i += 2 + b.readUInt16BE(i + 2); }
  return { w: 4, h: 3 };
};
const inlineImage = (file, widthMm, o = {}) => {
  if (!file || !fs.existsSync(file)) return null;
  const s = imgSize(file); const hMm = widthMm * s.h / s.w;
  return new Paragraph({
    children: [new ImageRun({ data: fs.readFileSync(file), transformation: { width: widthMm * 72 / 25.4, height: hMm * 72 / 25.4 } })],
    alignment: o.align || AlignmentType.CENTER, spacing: { before: o.before || 0, after: o.after ?? 200, line: 240, lineRule: LineRuleType.AUTO },
  });
};
const backgroundImage = (file) => { // 페이지 전체에 뒤로 깔리는 그림 (표지 장식)
  if (!file || !fs.existsSync(file)) return null;
  return new ImageRun({
    data: fs.readFileSync(file), transformation: { width: 148 * 72 / 25.4, height: 210 * 72 / 25.4 },
    floating: {
      horizontalPosition: { relative: HorizontalPositionRelativeFrom.PAGE, offset: 0 },
      verticalPosition: { relative: VerticalPositionRelativeFrom.PAGE, offset: 0 },
      behindDocument: true, wrap: { type: TextWrappingType.NONE },
    },
  });
};
const IMG = book.images || {};

// ── 카드(표) ──
const cell = (children, o = {}) => new TableCell({
  children, width: { size: o.w, type: WidthType.DXA }, shading: shade(o.fill || C.fill), verticalAlign: o.valign || VerticalAlign.TOP,
  margins: { top: o.pad ?? 110, bottom: o.pad ?? 110, left: o.padX ?? 140, right: o.padX ?? 140 }, borders: { top: NOB, bottom: NOB, left: NOB, right: NOB },
});
const cardTable = (badgeChildren, bodyParas, o = {}) => {
  const BW = mm(11);
  return new Table({
    width: { size: TEXT_W, type: WidthType.DXA }, columnWidths: [BW, TEXT_W - BW], borders: NOBORDERS,
    rows: [new TableRow({ cantSplit: true, children: [
      cell([new Paragraph({ children: badgeChildren, alignment: AlignmentType.CENTER, spacing: { before: 0, after: 0, line: 240, lineRule: LineRuleType.AUTO } })], { w: BW, fill: o.badgeFill || C.fill2, valign: VerticalAlign.TOP, padX: 40 }),
      cell(bodyParas, { w: TEXT_W - BW, fill: C.fill }),
    ] })],
  });
};
let sentenceNo = 0;
const SENT = /^(\([^)]*\)\s*)?["“](.+?)["”]\s*[—–-]\s*(.*)$/s;

// ── 블록 렌더러 ──
function renderBlock(b) {
  const o = [];
  const type = b.type === 'thesis' ? 'point' : (b.type || 'p');
  switch (type) {
    case 'p':
      cleanLines(b.text).forEach((l) => o.push(P([run(l)], { after: 150 })));
      break;
    case 'lead':
      o.push(P([run(b.text, { size: SZ.lead, bold: true, color: C.lead, font: F_TITLE })], { before: 40, after: 260, line: 380 }));
      break;
    case 'sub':
      o.push(P([run(b.text, { size: SZ.sub, bold: true, color: ACC, font: F_TITLE })], { before: 320, after: 140, line: LINE.title, keepNext: true }));
      break;
    case 'point':
      o.push(gap(60));
      o.push(...block(C.fill, [shaded(C.fill, [run(b.text, { size: SZ.point, bold: true, color: ACC, font: F_TITLE })], { align: AlignmentType.CENTER, after: 0, line: 360, pad: 14 })], 140));
      o.push(gap(160));
      break;
    case 'quote': {
      const ls = cleanLines(b.text);
      const paras = ls.map((l, i) => shaded(C.fill, [run(l, { size: SZ.quote, color: INK, font: F_TITLE })], { after: i === ls.length - 1 ? (b.source ? 60 : 0) : 40, line: 380, pad: 14, align: AlignmentType.CENTER }));
      if (b.source) paras.push(shaded(C.fill, [run(`— ${b.source}`, { size: SZ.quoteSrc, color: C.muted })], { after: 0, line: 300, pad: 14, align: AlignmentType.RIGHT }));
      o.push(gap(60)); o.push(...block(C.fill, paras, 120)); o.push(gap(160));
      break;
    }
    case 'box':
      o.push(gap(40));
      o.push(...block(C.fill, [
        shaded(C.fill, [run(b.title || '요약', { bold: true, color: ACC, size: SZ.boxTitle, font: F_TITLE })], { after: 60, pad: 12 }),
        ...cleanLines(b.text).map((l) => shaded(C.fill, [run(l, { size: SZ.box })], { after: 60, line: 340, pad: 12 })),
      ], 100));
      o.push(gap(160));
      break;
    case 'list':
      (b.items || []).forEach((it) => {
        const m = SENT.exec(it);
        if (m) {
          sentenceNo += 1;
          const prefix = (m[1] || '').trim();
          const body = [
            new Paragraph({ children: [
              ...(prefix ? [run(prefix + ' ', { size: SZ.cardExp, color: C.muted })] : []),
              run(`“${m[2]}”`, { size: SZ.card, bold: true, font: F_TITLE }),
            ], spacing: { before: 0, after: 60, line: 340, lineRule: LineRuleType.AUTO } }),
            new Paragraph({ children: [run(m[3], { size: SZ.cardExp, color: C.lead })], spacing: { before: 0, after: 0, line: 330, lineRule: LineRuleType.AUTO } }),
          ];
          o.push(cardTable([run(String(sentenceNo).padStart(2, '0'), { size: SZ.badge, bold: true, color: ACC, font: F_TITLE })], body));
        } else {
          const parts = it.split(/\s—\s/);
          const body = parts.length > 1
            ? [new Paragraph({ children: [run(parts[0], { size: SZ.card, bold: true, font: F_TITLE })], spacing: { before: 0, after: 60, line: 340, lineRule: LineRuleType.AUTO } }),
               new Paragraph({ children: [run(parts.slice(1).join(' — '), { size: SZ.cardExp, color: C.lead })], spacing: { before: 0, after: 0, line: 330, lineRule: LineRuleType.AUTO } })]
            : [new Paragraph({ children: [run(it, { size: SZ.card })], spacing: { before: 0, after: 0, line: 340, lineRule: LineRuleType.AUTO } })];
          o.push(cardTable([run('·', { size: SZ.badge, bold: true, color: ACC })], body));
        }
        o.push(gap(90));
      });
      o.push(gap(80));
      break;
    case 'steps':
      (b.items || []).forEach((it, i) => {
        o.push(cardTable([run(String(i + 1), { size: SZ.badge, bold: true, color: C.badgeInk, font: F_TITLE })],
          [new Paragraph({ children: [run(it, { size: SZ.body })], spacing: { before: 0, after: 0, line: 350, lineRule: LineRuleType.AUTO } })], { badgeFill: ACC }));
        o.push(gap(90));
      });
      o.push(gap(80));
      break;
    case 'check':
      o.push(gap(40));
      o.push(...block(C.fill, (b.items || []).map((it) => shaded(C.fill, [run('✓  ', { color: ACC, bold: true, size: SZ.check }), run(it, { size: SZ.check })], { after: 40, line: 330, pad: 12 })), 80));
      o.push(gap(160));
      break;
    case 'divider':
      o.push(P([run('◆  ◆  ◆', { size: SZ.divider, color: ACC })], { align: AlignmentType.CENTER, before: 160, after: 240, line: 240 }));
      break;
    case 'hook':
      o.push(gap(60));
      o.push(...block(C.fill, [shaded(C.fill, [run('→  ', { color: ACC, bold: true, size: SZ.hook }), run(b.text, { size: SZ.hook, color: C.lead })], { after: 0, line: 350, pad: 14 })], 100));
      break;
    default:
      o.push(P([run(String(b.text || ''))]));
  }
  return o;
}

// ── 섹션 공통 ──
const sectionProps = (extra = {}) => ({
  page: { size: { width: PAGE.w, height: PAGE.h }, margin: { top: M.top, bottom: M.bottom, left: M.left, right: M.right, header: M.header, footer: M.footer, ...(extra.margin || {}) }, ...(extra.page || {}) },
});
const emptyFooter = () => new Footer({ children: [new Paragraph({ children: [] })] });
const emptyHeader = () => new Header({ children: [new Paragraph({ children: [] })] });
const runningHead = () => new Header({ children: [new Paragraph({
  tabStops: [{ type: TabStopType.RIGHT, position: TEXT_W }],
  children: [run(String(book.title || '').replace(/\n/g, ' '), { size: SZ.head, color: C.muted, font: F_SANS }), new TextRun({ text: '\t', size: SZ.head }), run(book.author || '', { size: SZ.head, color: C.muted, font: F_SANS })],
  spacing: { after: 0, line: 240, lineRule: LineRuleType.AUTO },
  border: { bottom: { style: BorderStyle.SINGLE, size: 4, color: C.rule, space: 4 } },
})] });
const pageFooter = () => new Footer({ children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ children: [PageNumber.CURRENT], font: F_SANS, size: SZ.footer, color: C.muted })] })] });

const sections = [];

// 1) 표지
{
  const cm = mm(16);
  const cover = [];
  const bg = backgroundImage(imgPath(IMG.coverBg));
  cover.push(new Paragraph({ children: bg ? [bg, run((book.series || 'EBOOK').toUpperCase(), { size: SZ.coverKicker, color: ACC, sp: 120, bold: true, font: F_SANS })] : [run((book.series || 'EBOOK').toUpperCase(), { size: SZ.coverKicker, color: ACC, sp: 120, bold: true, font: F_SANS })], spacing: { before: 0, after: 0, line: 240, lineRule: LineRuleType.AUTO } }));
  cover.push(spacer(12));
  const tl = cleanLines(book.title);
  tl.forEach((l, i) => cover.push(P([run(l, { size: SZ.coverTitle, bold: true, color: i === tl.length - 1 && tl.length > 1 ? ACC : INK, font: F_TITLE })], { after: 0, line: 270 })));
  if (book.subtitle) cover.push(P([run(book.subtitle, { size: SZ.coverSubtitle, color: C.muted })], { before: 140, after: 0, line: 300 }));
  cover.push(spacer(8));
  const ci = inlineImage(imgPath(IMG.cover), 104, { align: AlignmentType.LEFT, after: 0 });
  if (ci) cover.push(ci);
  cover.push(spacer(7));
  const tag = cleanLines(book.tagline || (book.closing && book.closing.text) || '');
  tag.forEach((l, i) => cover.push(P([run(l, { size: SZ.coverTag, bold: i === 0, color: i === 0 ? INK : C.lead, font: F_TITLE })], { after: 20, line: 300 })));
  cover.push(spacer(6));
  cover.push(P([run(book.author || '', { size: SZ.coverAuthor, bold: true, color: INK, font: F_TITLE })], { after: 0, line: 300 }));
  cover.push(spacer(14));
  cover.push(P([run(book.coverFoot || 'COMPANION E-BOOK', { size: SZ.coverFoot, color: C.muted, sp: 80, font: F_SANS })], { align: AlignmentType.RIGHT, after: 0, line: 240 }));
  sections.push({ properties: sectionProps({ margin: { top: cm, bottom: mm(8), left: cm, right: cm, header: 0, footer: 0 } }), headers: { default: emptyHeader() }, footers: { default: emptyFooter() }, children: cover });
}

// 2) 차례
{
  const toc = [
    P([run('CONTENTS', { size: SZ.tocLabel, color: ACC, sp: 100, font: F_SANS })], { after: 40, line: 240 }),
    P([run('차례', { size: SZ.tocTitle, bold: true, color: INK, font: F_TITLE })], { after: 120, line: LINE.title }),
    rule(C.rule, 0, 300),
  ];
  let tocPart = null;
  book.chapters.forEach((ch, i) => {
    if (ch.part && ch.part.no !== tocPart) {
      tocPart = ch.part.no;
      toc.push(P([run(`PART ${String(ch.part.no).padStart(2, '0')}`, { size: SZ.tocPart, color: ACC, sp: 80, bold: true, font: F_SANS }), run(`   ${ch.part.title || ''}`, { size: SZ.tocEntry, bold: true, font: F_TITLE })], { before: 220, after: 80, line: 260 }));
    }
    toc.push(new Paragraph({
      tabStops: [{ type: TabStopType.RIGHT, position: TEXT_W - 20, leader: LeaderType.DOT }],
      children: [run(`${ch.no}   `, { size: SZ.tocEntry, bold: true, color: ACC, font: F_TITLE }), run(ch.title, { size: SZ.tocEntry, font: F_TITLE }), new TextRun({ text: '\t', size: SZ.tocEntry }), new PageReference(`ch_${i}`, { font: F_SANS, size: SZ.tocEntry - 2, color: C.muted })],
      spacing: sp({ after: 70, line: 300 }),
    }));
  });
  sections.push({ properties: sectionProps(), headers: { default: emptyHeader() }, footers: { default: emptyFooter() }, children: toc });
}

// 3) 본문
const body = [];
let lastPart = null;
book.chapters.forEach((ch, i) => {
  if (ch.part && ch.part.no !== lastPart) {
    lastPart = ch.part.no;
    const pn = String(ch.part.no).padStart(2, '0');
    body.push(gap(mm(8), { pageBreakBefore: true }));
    body.push(P([run('PART', { size: SZ.chKicker, color: C.muted, sp: 140, font: F_SANS })], { after: 60, line: 240 }));
    body.push(P([run(pn, { size: SZ.partNum, bold: true, color: ACC, font: F_TITLE })], { after: 120, line: 250 }));
    body.push(P([run(ch.part.title || '', { size: SZ.partTitle, bold: true, color: INK, font: F_TITLE })], { after: 60, line: 300 }));
    if (ch.part.intro) body.push(P([run(ch.part.intro, { size: SZ.partIntro, color: C.muted })], { after: 240, line: 320 }));
    const pi = inlineImage(imgPath(IMG.parts && IMG.parts[String(ch.part.no)]), 100, { align: AlignmentType.CENTER, before: 120, after: 200 });
    if (pi) body.push(pi);
    body.push(P([run(pn, { size: SZ.partGhost, bold: true, color: C.fill2, font: F_TITLE })], { align: AlignmentType.RIGHT, after: 0, line: 240 }));
  }
  const isNum = /^\d+$/.test(String(ch.no));
  const kicker = isNum ? `CHAPTER ${String(ch.no).padStart(2, '0')}` : (String(ch.no) === '프롤로그' ? 'PROLOGUE' : String(ch.no) === '에필로그' ? 'EPILOGUE' : String(ch.no));
  body.push(P([run(kicker, { size: SZ.chKicker, bold: true, color: ACC, sp: 140, font: F_SANS })], { after: 100, line: 240, pageBreakBefore: true, keepNext: true }));
  body.push(new Paragraph({ children: [new Bookmark({ id: `ch_${i}`, children: [run(ch.title, { size: SZ.chTitle, bold: true, color: INK, font: F_TITLE })] })], spacing: sp({ after: 160, line: 300 }), keepNext: true }));
  body.push(rule(ACC, 0, 260, true));
  (ch.blocks || []).forEach((b) => renderBlock(b).forEach((p) => body.push(p)));
});

// 4) 마무리
{
  const closing = book.closing || { text: '끝까지 읽어주셔서 고맙습니다.', author: book.author };
  const ls = cleanLines(closing.text);
  body.push(gap(mm(55), { pageBreakBefore: true }));
  body.push(rule(ACC, 0, 300, false));
  ls.forEach((l, i) => body.push(P([run(l, { size: i === 0 ? SZ.closing : SZ.closingSub, bold: i === 0, color: i === 0 ? INK : ACC, font: F_TITLE })], { align: AlignmentType.CENTER, after: i === 0 ? 160 : 60, line: 320 })));
  body.push(spacer(40));
  body.push(P([run(`${closing.author || book.author || ''} · ${(book.series || '').toUpperCase()}`, { size: SZ.coverFoot, color: C.muted, sp: 60, font: F_SANS })], { align: AlignmentType.CENTER, after: 0, line: 240 }));
}
sections.push({ properties: sectionProps({ page: { pageNumbers: { start: 1 } } }), headers: { default: runningHead() }, footers: { default: pageNumbers ? pageFooter() : emptyFooter() }, children: body });

const doc = new Document({
  creator: book.author || '', title: String(book.title || '').replace(/\n/g, ' '),
  background: { color: PAPER },
  styles: { default: { document: { run: { font: F_BODY, size: SZ.body, color: INK } } } },
  sections,
});
Packer.toBuffer(doc).then((buf) => {
  fs.mkdirSync(path.dirname(path.resolve(out)), { recursive: true });
  fs.writeFileSync(out, buf);
  console.log(`[${templateId} ${T.name} · A5] 생성: ${out} (${Math.round(buf.length / 1024)}KB) — 챕터 ${book.chapters.length}개, 문장 카드 ${sentenceNo}개`);
});
