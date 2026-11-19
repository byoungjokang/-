#!/usr/bin/env node
/**
 * 전자책 디자인 템플릿 10선 — A5 docx 빌더
 * 사용법: node build_ebook.js book.json 출력.docx --template 02
 *
 * book.json 스키마:
 * { title, subtitle, series, author, template?, closing?:{text,author},
 *   chapters:[{ no, title, part?:{no,title}, blocks:[ {type:'p'|'lead'|'sub'|'thesis'|'box'|'quote'|'list'|'check', ...} ] }] }
 */
const {
  Document, Packer, Paragraph, TextRun, AlignmentType, BorderStyle, WidthType, ShadingType,
  Footer, PageNumber, Table, TableRow, TableCell, VerticalAlign,
  PageReference, TabStopType, LeaderType, BookmarkStart, BookmarkEnd,
} = require('docx');
const fs = require('fs');
const path = require('path');

// ── 인자 ──
const args = process.argv.slice(2);
const src = args[0];
const out = args[1] && !args[1].startsWith('--') ? args[1] : 'ebook.docx';
const tIdx = args.indexOf('--template');
const book = JSON.parse(fs.readFileSync(src, 'utf8'));
const templateId = String(tIdx >= 0 ? args[tIdx + 1] : (book.template || '02')).padStart(2, '0');
const TEMPLATES = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'references', 'templates.json'), 'utf8'));
const T = TEMPLATES[templateId];
if (!T) { console.error(`템플릿 ${templateId} 없음 (01~10)`); process.exit(1); }

// ── A5 판형 (dxa) ──
const PAGE = { w: 8391, h: 11906 };
const M = { top: 1020, bottom: 1134, left: 1020, right: 907 }; // 18/20/18/16mm
const TEXT_W = PAGE.w - M.left - M.right;

// 밝은 배경이면 잉크로 계층, 어두운 배경이면 밝은 잉크로 계층
const isDark = hex => { const n = parseInt(hex, 16); const r = n >> 16, g = (n >> 8) & 255, b = n & 255; return (0.299 * r + 0.587 * g + 0.114 * b) < 128; };
const mix = (a, b, t) => { const A = parseInt(a, 16), B = parseInt(b, 16); const ch = s => Math.round(((A >> s) & 255) * (1 - t) + ((B >> s) & 255) * t); return [16, 8, 0].map(s => ch(s).toString(16).padStart(2, '0')).join('').toUpperCase(); };

const COVER = { bg: T.coverBg, ink: T.inkCover, sub: mix(T.coverBg, T.inkCover, 0.62), label: mix(T.coverBg, T.inkCover, 0.42) };
const PART = { bg: T.partBg, ink: T.partInk, sub: mix(T.partBg, T.partInk, 0.6) };
const BODY = { bg: T.paper, ink: T.inkBody, lead: mix(T.paper, T.inkBody, 0.6), footer: mix(T.paper, T.inkBody, 0.5), box: mix(T.paper, T.accent, 0.12), rule: mix(T.paper, T.inkBody, 0.25) };
const ACC = T.accent;

// 폰트 (사용자 PC에 설치돼 있으면 그대로, 없으면 뷰어가 대체)
const F_TITLE = T.titleFont, F_BODY = T.bodyFont, F_QUOTE = T.quoteFont;

// 타이포 위계 (half-point) — 명세서 0-4 기준
const SZ = {
  coverKicker: 20, coverTitle: 58, coverSubtitle: 26, coverAuthor: 22,
  tocTitle: 44, tocLabel: 18, tocEntry: 21,
  partNum: 36, partTitle: 60,
  chNum: 28, chTitle: 50, chIntro: 22,
  lead: 27, sub: 29, thesis: 24, body: 22, quote: 30, list: 22,
  footer: 16, page: 18,
};
const LINE = 374; // 170%

const NOB = { top: { style: BorderStyle.NONE }, bottom: { style: BorderStyle.NONE }, left: { style: BorderStyle.NONE }, right: { style: BorderStyle.NONE }, insideHorizontal: { style: BorderStyle.NONE }, insideVertical: { style: BorderStyle.NONE } };
const run = (text, o = {}) => new TextRun({ text, font: o.font || F_BODY, size: o.size || SZ.body, color: o.color || BODY.ink, bold: !!o.bold, italics: !!o.italics, characterSpacing: o.sp || 0 });
const gap = (after = 200) => new Paragraph({ children: [new TextRun('')], spacing: { after } });
const EMPTY_FOOTER = () => new Footer({ children: [new Paragraph({ children: [] })] });
let bm = 1000;
const bookmarkRun = (name, r) => [new BookmarkStart(name, bm), r, new BookmarkEnd(bm++)];

function bleed(fill, kids, opt = {}) {
  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE }, borders: NOB,
    rows: [new TableRow({
      height: opt.exact ? { value: opt.exact, rule: 'exact' } : undefined,
      children: [new TableCell({
        shading: { type: ShadingType.CLEAR, color: 'auto', fill },
        verticalAlign: opt.valign || VerticalAlign.CENTER,
        margins: { top: 0, bottom: 0, left: opt.mx || M.left, right: opt.mx || M.right },
        children: kids,
      })],
    })],
  });
}
const fullPage = (fill, kids, opt = {}) => ({ properties: { page: { size: { width: PAGE.w, height: PAGE.h }, margin: { top: 0, bottom: 0, left: 0, right: 0 } } }, footers: { default: EMPTY_FOOTER() }, children: [bleed(fill, kids, { exact: PAGE.h - 500, ...opt })] });

// ── 블록 렌더러 ──
function renderBlock(b) {
  const o = [];
  switch (b.type) {
    case 'p': o.push(new Paragraph({ children: [run(b.text)], spacing: { after: 200, line: LINE } })); break;
    case 'lead': o.push(new Paragraph({ children: [run(b.text, { size: SZ.lead, color: BODY.lead, font: F_QUOTE })], spacing: { before: 80, after: 300, line: 400 } })); break;
    case 'sub': o.push(new Paragraph({ children: [run(b.text, { size: SZ.sub, bold: true, color: ACC, font: F_TITLE })], spacing: { before: 440, after: 200, line: 360 }, keepNext: true })); break;
    case 'thesis': o.push(new Paragraph({ children: [run(b.text, { size: SZ.thesis, bold: true, color: ACC })], spacing: { before: 280, after: 280, line: 360 }, indent: { left: 280 }, border: { left: { style: BorderStyle.SINGLE, size: 18, color: ACC, space: 12 } } })); break;
    case 'box':
      o.push(new Paragraph({ children: [run(b.title || '요약', { bold: true, color: ACC })], spacing: { before: 120, after: 100 }, shading: { type: ShadingType.CLEAR, color: 'auto', fill: BODY.box }, indent: { left: 200, right: 200 }, keepNext: true }));
      o.push(new Paragraph({ children: [run(b.text)], spacing: { after: 260, line: 360 }, shading: { type: ShadingType.CLEAR, color: 'auto', fill: BODY.box }, indent: { left: 200, right: 200 } }));
      break;
    case 'quote': {
      const ls = String(b.text).split('\n');
      ls.forEach((l, i) => o.push(new Paragraph({ children: [run(l, { size: SZ.quote, color: ACC, font: F_QUOTE })], spacing: { before: i === 0 ? 240 : 0, after: i === ls.length - 1 ? 200 : 60, line: 380 }, indent: { left: 320 }, border: { left: { style: BorderStyle.SINGLE, size: 12, color: ACC, space: 14 } } })));
      if (b.source) o.push(new Paragraph({ children: [run(b.source, { size: 18, color: BODY.lead })], spacing: { after: 240 }, indent: { left: 340 } }));
      break;
    }
    case 'list': (b.items || []).forEach(it => o.push(new Paragraph({ children: [run('· ', { color: ACC, bold: true }), run(it)], spacing: { after: 140, line: 360 }, indent: { left: 340, hanging: 180 } }))); o.push(gap(100)); break;
    case 'check': (b.items || []).forEach(it => o.push(new Paragraph({ children: [run('✓ ', { color: ACC, bold: true }), run(it)], spacing: { after: 140, line: 360 }, indent: { left: 340, hanging: 200 }, shading: { type: ShadingType.CLEAR, color: 'auto', fill: BODY.box } }))); o.push(gap(100)); break;
    default: o.push(new Paragraph({ children: [run(String(b.text || ''))] }));
  }
  return o;
}

// ── 조립 ──
const sections = [];

// 표지 (타이포 표지 — 비주얼은 명세서 참고해 별도 삽입)
const cover = [gap(2200)];
if (book.series) cover.push(new Paragraph({ children: [run(book.series, { size: SZ.coverKicker, color: COVER.label, sp: 80 })], alignment: AlignmentType.CENTER, spacing: { after: 160 } }));
cover.push(new Paragraph({ children: [run('──', { size: 20, color: ACC })], alignment: AlignmentType.CENTER, spacing: { after: 320 } }));
String(book.title).split('\n').forEach(l => cover.push(new Paragraph({ children: [run(l, { size: SZ.coverTitle, bold: true, color: COVER.ink, font: F_TITLE })], alignment: AlignmentType.CENTER, spacing: { after: 160, line: 760 } })));
if (book.subtitle) { cover.push(gap(200)); cover.push(new Paragraph({ children: [run(book.subtitle, { size: SZ.coverSubtitle, color: COVER.sub })], alignment: AlignmentType.CENTER, spacing: { after: 160 } })); }
cover.push(gap(2000));
cover.push(new Paragraph({ children: [run('──', { size: 20, color: ACC })], alignment: AlignmentType.CENTER, spacing: { after: 200 } }));
cover.push(new Paragraph({ children: [run(book.author || '', { size: SZ.coverAuthor, color: COVER.ink })], alignment: AlignmentType.CENTER, spacing: { after: 0 } }));
sections.push(fullPage(COVER.bg, cover));

// 차례
const toc = [
  new Paragraph({ children: [run('CONTENTS', { size: SZ.tocLabel, color: ACC, sp: 60 })], spacing: { after: 60 } }),
  new Paragraph({ children: [run('차례', { size: SZ.tocTitle, bold: true, color: BODY.ink, font: F_TITLE })], spacing: { after: 480 } }),
];
book.chapters.forEach((ch, i) => {
  if (ch.part) toc.push(new Paragraph({ children: [run(`PART ${ch.part.no}  ${ch.part.title}`, { size: 18, color: ACC, sp: 40, bold: true })], spacing: { before: 240, after: 120 } }));
  toc.push(new Paragraph({
    tabStops: [{ type: TabStopType.RIGHT, position: TEXT_W - 40, leader: LeaderType.DOT }],
    children: [run(`${ch.no}   `, { size: SZ.tocEntry, bold: true, color: ACC }), run(ch.title, { size: SZ.tocEntry }), new TextRun({ text: '\t', font: F_BODY }), new PageReference(`ch_${i}`, { font: F_BODY, size: SZ.tocEntry - 2, color: BODY.lead })],
    spacing: { after: 180, line: 320 }, border: { bottom: { style: BorderStyle.SINGLE, size: 2, color: BODY.rule, space: 8 } },
  }));
});
sections.push({ properties: { page: { size: { width: PAGE.w, height: PAGE.h }, margin: { top: 0, bottom: 0, left: 0, right: 0 } } }, footers: { default: EMPTY_FOOTER() }, children: [bleed(BODY.bg, toc, { valign: VerticalAlign.TOP })] });

// 챕터
let lastPart = null;
book.chapters.forEach((ch, i) => {
  // PART 오프너
  if (ch.part && ch.part.no !== lastPart) {
    lastPart = ch.part.no;
    sections.push(fullPage(PART.bg, [
      gap(1800),
      new Paragraph({ children: [run(`PART ${ch.part.no}`, { size: SZ.partNum, bold: true, color: ACC })], spacing: { after: 200 } }),
      new Paragraph({ children: [run('────', { size: 20, color: ACC })], spacing: { after: 260 } }),
      new Paragraph({ children: [run(ch.part.title, { size: SZ.partTitle, bold: true, color: PART.ink, font: F_TITLE })], spacing: { after: 200, line: 640 } }),
      ch.part.intro ? new Paragraph({ children: [run(ch.part.intro, { size: SZ.chIntro, color: PART.sub })], spacing: { line: 360 } }) : gap(0),
    ]));
  }
  // CHAPTER 오프너 (배지 = 액센트 원 대신 액센트 숫자)
  const isNum = /^\d+$/.test(String(ch.no));
  const opener = [
    gap(1400),
    new Paragraph({ children: [run(isNum ? `CHAPTER ${ch.no}` : String(ch.no).toUpperCase(), { size: SZ.chNum, bold: true, color: ACC, sp: 40 })], spacing: { after: 200 } }),
    new Paragraph({ children: [run('────', { size: 20, color: ACC })], spacing: { after: 260 } }),
    new Paragraph({ children: bookmarkRun(`ch_${i}`, run(ch.title, { size: SZ.chTitle, bold: true, color: BODY.ink, font: F_TITLE })), spacing: { after: 240, line: 560 } }),
  ];
  const teaser = (ch.blocks || []).find(b => ['lead', 'p', 'quote'].includes(b.type));
  if (ch.intro || teaser) { let t = ch.intro || String(teaser.text).split('\n')[0]; if (t.length > 70) t = t.slice(0, 68) + '…'; opener.push(new Paragraph({ children: [run(t, { size: SZ.chIntro, color: BODY.lead })], spacing: { line: 360 } })); }
  sections.push(fullPage(BODY.bg, opener));

  // 본문
  const bodyKids = []; (ch.blocks || []).forEach(b => renderBlock(b).forEach(p => bodyKids.push(p)));
  sections.push({
    properties: { page: { size: { width: PAGE.w, height: PAGE.h }, margin: { top: 0, bottom: 0, left: 0, right: 0 } } },
    footers: { default: new Footer({ children: [new Paragraph({ tabStops: [{ type: TabStopType.RIGHT, position: PAGE.w - M.right }], indent: { left: M.left, right: M.right }, children: [run(ch.title.length > 22 ? ch.title.slice(0, 20) + '…' : ch.title, { size: SZ.footer, color: BODY.footer }), new TextRun({ text: '\t', font: F_BODY }), new TextRun({ children: [PageNumber.CURRENT], font: F_BODY, size: SZ.page, color: ACC })] })] }) },
    children: [bleed(BODY.bg, bodyKids, { valign: VerticalAlign.TOP })],
  });
});

// 마무리
const closing = book.closing || { text: '감사합니다.', author: book.author };
const close = [gap(2200)];
String(closing.text).split('\n').forEach(l => close.push(new Paragraph({ children: [run(l, { size: 28, color: COVER.ink, font: F_QUOTE })], alignment: AlignmentType.CENTER, spacing: { after: 120, line: 420 } })));
close.push(gap(160));
close.push(new Paragraph({ children: [run(closing.author || book.author || '', { size: 20, color: COVER.sub })], alignment: AlignmentType.CENTER }));
sections.push(fullPage(COVER.bg, close));

const doc = new Document({ creator: book.author || '', title: String(book.title).replace(/\n/g, ' '), styles: { default: { document: { run: { font: F_BODY, size: SZ.body, color: BODY.ink } } } }, sections });
Packer.toBuffer(doc).then(buf => { fs.writeFileSync(out, buf); console.log(`[${templateId} ${T.name}] 생성: ${out} (${Math.round(fs.statSync(out).size / 1024)}KB)`); });
