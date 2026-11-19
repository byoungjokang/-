#!/usr/bin/env node
/**
 * 전자책 생성기 — A4 docx 빌더 (확정 스펙 v2)
 *
 * 사용법:
 *   node build_ebook.js <book.json> <출력.docx> [--template 02] [--no-part-dividers] [--no-page-numbers]
 *
 * 확정 스펙 (CLAUDE.md "확정된 것" + "알려진 함정" 반영):
 *   - 판형 A4 210×297mm, 여백 위 30 / 아래 30 / 좌우 15mm
 *   - 폰트 위계: 표지 제목 48pt / 지은이 30pt / 목차·장 제목 24pt / 본문 16pt
 *   - 줄간격 170% = line 408 + lineRule AUTO (함정 2)
 *   - 챕터 오프너 페이지 없음 — 제목이 본문 페이지 맨 위 헤더로 붙는다 (함정 3)
 *   - 풀블리드 표 트릭 없음. 배경색은 Document.background 로 딱 한 번 (함정 1)
 *   - 색 블록은 여백 안에서 문단 shading 으로만 (함정 4)
 *   - 푸터는 본문 섹션에 가운데 쪽번호 하나만 (풀블리드가 없으므로 흰 띠 버그 없음)
 *
 * book.json 스키마: ../references/book-schema.json 참고
 */
const {
  Document, Packer, Paragraph, TextRun, AlignmentType, BorderStyle, ShadingType, LineRuleType,
  Footer, Header, PageNumber, PageReference, TabStopType, LeaderType, Bookmark,
  Table, TableRow, TableCell, WidthType, HeightRule, VerticalAlign,
} = require('docx');
const fs = require('fs');
const path = require('path');

// ── 인자 ──
const args = process.argv.slice(2);
const src = args[0];
if (!src) { console.error('사용법: node build_ebook.js <book.json> <출력.docx> [--template 02]'); process.exit(1); }
const out = args[1] && !args[1].startsWith('--') ? args[1] : 'ebook.docx';
const flag = (n) => args.includes(n);
const tIdx = args.indexOf('--template');
const book = JSON.parse(fs.readFileSync(src, 'utf8'));
const templateId = String(tIdx >= 0 ? args[tIdx + 1] : (book.template || '02')).padStart(2, '0');
const TEMPLATES = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'references', 'templates.json'), 'utf8'));
const T = TEMPLATES[templateId];
if (!T) { console.error(`템플릿 ${templateId} 없음 (01~11)`); process.exit(1); }
const OPT = {
  partDividers: !flag('--no-part-dividers') && book.partDividers !== false,
  pageNumbers: !flag('--no-page-numbers') && book.pageNumbers !== false,
};

// ── A4 판형 + 확정 여백 (dxa: 1mm = 56.69) ──
const PAGE = { w: 11906, h: 16838 };
const mm = (v) => Math.round(v * 56.69);
const M = { top: mm(30), bottom: mm(30), left: mm(15), right: mm(15) };
const TEXT_W = PAGE.w - M.left - M.right;

// ── 색 ──
const mix = (a, b, t) => {
  const A = parseInt(a, 16), B = parseInt(b, 16);
  const ch = (s) => Math.round(((A >> s) & 255) * (1 - t) + ((B >> s) & 255) * t);
  return [16, 8, 0].map((s) => ch(s).toString(16).padStart(2, '0')).join('').toUpperCase();
};
const PAPER = T.paper;
const INK = T.inkBody;
const ACC = T.accent;
const ACC_D = T.accentDark || ACC;        // 어두운 블록 위 강조색 (없으면 accent)
const STYLE = T.coverStyle || 'classic';  // 'classic' | 'block' — block: 표지·차례·마무리를 색 블록 중심으로
const BOLD = STYLE === 'block';
const C = {
  lead: mix(PAPER, INK, 0.62),
  muted: mix(PAPER, INK, 0.5),
  rule: mix(PAPER, INK, 0.25),
  box: mix(PAPER, ACC, 0.12),
  blockBg: T.coverBg,            // 표지·파트 블록 (여백 안 shading)
  blockInk: T.inkCover,
  blockSub: mix(T.coverBg, T.inkCover, 0.62),
  partBg: T.partBg,
  partInk: T.partInk,
  partSub: mix(T.partBg, T.partInk, 0.62),
};

// ── 폰트 ──
const F_TITLE = T.titleFont, F_BODY = T.bodyFont, F_QUOTE = T.quoteFont;

// ── 타이포 위계 (half-point). 확정값: 48 / 30 / 24 / 16 ──
const SZ = {
  coverKicker: 22, coverTitle: 96, coverSubtitle: 36, coverAuthor: 60,
  tocTitle: 48, tocLabel: 20, tocEntry: 28, tocPart: 22,
  partNum: 56, partTitle: 60, partIntro: 30,
  chKicker: 22, chTitle: 48,
  lead: 36, sub: 40, point: 34, body: 32, quote: 36, quoteSrc: 24, list: 32, box: 30, hook: 32, divider: 24,
  closing: 40, closingAuthor: 30, footer: 22,
};
if (BOLD) Object.assign(SZ, { partNum: 176, tocPart: 22, chKicker: 22 });
const LINE = { body: 408, tight: 300, title: 320 }; // 170% / 125% / 133%  (240 = 100%)
const sp = (o) => ({ ...o, line: o.line || LINE.body, lineRule: LineRuleType.AUTO });

const NOB = { style: BorderStyle.NONE, size: 0, color: 'auto' };
const shade = (fill) => ({ type: ShadingType.CLEAR, color: 'auto', fill });
const run = (text, o = {}) => new TextRun({
  text, font: o.font || F_BODY, size: o.size || SZ.body, color: o.color || INK,
  bold: !!o.bold, italics: !!o.italics, characterSpacing: o.sp || 0,
});
const gap = (after = 200, extra = {}) => new Paragraph({ children: [new TextRun({ text: '', size: 2 })], spacing: { after, line: 240, lineRule: LineRuleType.AUTO }, ...extra });
const rule = (color = ACC, before = 0, after = 200) => new Paragraph({
  children: [new TextRun({ text: '', size: 2 })],
  spacing: { before, after, line: 240, lineRule: LineRuleType.AUTO },
  border: { bottom: { style: BorderStyle.SINGLE, size: 8, color, space: 1 } },
});

// 문단 shading 블록 (함정 4) — 같은 색 테두리(border)로 안쪽 여백을 만들면 연속 문단이 한 덩어리 박스로 합쳐진다.
// 표 트릭·풀블리드를 쓰지 않는다. 블록은 keepNext/keepLines 로 페이지에서 쪼개지지 않게 한다.
const BOX_PAD = 14; // pt
const shaded = (fill, children, o = {}) => {
  const b = { style: BorderStyle.SINGLE, size: 4, color: fill, space: o.pad ?? BOX_PAD };
  return new Paragraph({
    children, shading: shade(fill), alignment: o.align || AlignmentType.LEFT,
    indent: { left: o.ind ?? 0, right: o.ind ?? 0 },
    border: { top: b, bottom: b, left: b, right: b },
    spacing: sp({ before: o.before || 0, after: o.after ?? 120, line: o.line || LINE.tight }),
    keepNext: o.keepNext !== false, keepLines: true, pageBreakBefore: o.pageBreakBefore,
  });
};
// 블록 위아래 추가 패딩용 빈 shading 문단
const shadedPad = (fill, after = 200) => shaded(fill, [new TextRun({ text: '', size: 2 })], { after, line: 240 });
function block(fill, paras, pad = 0) {
  return pad > 0 ? [shadedPad(fill, pad), ...paras, shadedPad(fill, pad)] : paras;
}

const sectionProps = (extra = {}) => ({
  page: { size: { width: PAGE.w, height: PAGE.h }, margin: { top: M.top, bottom: M.bottom, left: M.left, right: M.right }, ...extra },
});
const emptyFooter = () => new Footer({ children: [new Paragraph({ children: [] })] });
const runningHead = () => new Header({
  children: [new Paragraph({
    tabStops: [{ type: TabStopType.RIGHT, position: TEXT_W }],
    children: [
      run(String(book.title || '').replace(/\n/g, ' '), { size: 18, color: C.muted, sp: 60 }),
      new TextRun({ text: '\t', size: 18 }),
      run(book.author || '', { size: 18, color: C.muted, sp: 60 }),
    ],
    spacing: { after: 0, line: 240, lineRule: LineRuleType.AUTO },
    border: { bottom: { style: BorderStyle.SINGLE, size: 4, color: C.rule, space: 4 } },
  })],
});
const pageFooter = () => new Footer({
  children: [new Paragraph({
    alignment: AlignmentType.CENTER,
    children: [new TextRun({ children: [PageNumber.CURRENT], font: F_BODY, size: SZ.footer, color: C.muted })],
  })],
});

const cleanLines = (t) => String(t ?? '').split('\n');

// ── 블록 렌더러 ──
function renderBlock(b) {
  const o = [];
  const type = b.type === 'thesis' ? 'point' : (b.type || 'p');
  switch (type) {
    case 'p':
      cleanLines(b.text).forEach((l) => o.push(new Paragraph({ children: [run(l)], spacing: sp({ after: 200 }) })));
      break;
    case 'lead':
      o.push(new Paragraph({ children: [run(b.text, { size: SZ.lead, color: C.lead, font: F_QUOTE })], spacing: sp({ before: 80, after: 320, line: 400 }) }));
      break;
    case 'sub':
      o.push(new Paragraph({ children: [run(b.text, { size: SZ.sub, bold: true, color: ACC, font: F_TITLE })], spacing: sp({ before: 480, after: 200, line: LINE.title }), keepNext: true }));
      break;
    case 'point':
      o.push(new Paragraph({
        children: [run(b.text, { size: SZ.point, bold: true, color: ACC })],
        spacing: sp({ before: 320, after: 320, line: 340 }), indent: { left: 360 },
        border: { left: { style: BorderStyle.SINGLE, size: 24, color: ACC, space: 14 } },
      }));
      break;
    case 'quote': {
      const ls = cleanLines(b.text);
      ls.forEach((l, i) => o.push(new Paragraph({
        children: [run(l, { size: SZ.quote, color: INK, font: F_QUOTE, italics: false })],
        spacing: sp({ before: i === 0 ? 280 : 0, after: i === ls.length - 1 ? (b.source ? 80 : 280) : 60, line: 380 }),
        indent: { left: 420, right: 420 },
        border: { left: { style: BorderStyle.SINGLE, size: 12, color: ACC, space: 16 } },
      })));
      if (b.source) o.push(new Paragraph({ children: [run(`— ${b.source}`, { size: SZ.quoteSrc, color: C.muted })], spacing: sp({ after: 280 }), indent: { left: 440 } }));
      break;
    }
    case 'box':
      o.push(...block(C.box, [
        shaded(C.box, [run(b.title || '요약', { bold: true, color: ACC, size: SZ.box })], { after: 80, pad: 10 }),
        ...cleanLines(b.text).map((l) => shaded(C.box, [run(l, { size: SZ.box })], { after: 100, line: 360, pad: 10 })),
      ]));
      o.push(gap(200));
      break;
    case 'list':
      (b.items || []).forEach((it) => o.push(new Paragraph({
        children: [run('·  ', { color: ACC, bold: true }), run(it)],
        spacing: sp({ after: 100, line: 360 }), indent: { left: 480, hanging: 260 },
      })));
      o.push(gap(120));
      break;
    case 'steps':
      (b.items || []).forEach((it, i) => o.push(new Paragraph({
        children: [run(`${i + 1}  `, { color: ACC, bold: true, font: F_TITLE }), run(it)],
        spacing: sp({ after: 140, line: 380 }), indent: { left: 520, hanging: 300 },
      })));
      o.push(gap(120));
      break;
    case 'check':
      (b.items || []).forEach((it) => o.push(shaded(C.box, [run('✓  ', { color: ACC, bold: true }), run(it, { size: SZ.list })], { after: 40, line: 360, pad: 8 })));
      o.push(gap(200));
      break;
    case 'divider':
      o.push(new Paragraph({ children: [run('◆   ◆   ◆', { size: SZ.divider, color: ACC })], alignment: AlignmentType.CENTER, spacing: sp({ before: 240, after: 320, line: 240 }) }));
      break;
    case 'hook':
      o.push(new Paragraph({
        children: [run('→  ', { color: ACC, bold: true }), run(b.text, { size: SZ.hook, color: C.lead })],
        spacing: sp({ before: 360, after: 200, line: 380 }), indent: { left: 200 },
      }));
      break;
    default:
      o.push(new Paragraph({ children: [run(String(b.text || ''))], spacing: sp({ after: 200 }) }));
  }
  return o;
}

// ── 조립 ──
const sections = [];

// 1) 표지
const cover = [];
let coverSection;
if (STYLE === 'block') {
  // 블록 표지 — 종이 프레임(8mm) 안을 한 색으로 채운 표 두 칸(위: 제목, 아래: 지은이). 여백 안에만 있으므로 풀블리드 트릭이 아니다.
  const BG = C.blockBg, FG = C.blockInk, SUB = mix(C.blockBg, C.blockInk, 0.55);
  // docx-js 가 섹션 끝에 기본 크기(16pt) 문단을 하나 더 붙이므로 그 높이(≈7mm)와 LibreOffice 표 오버헤드(≈4mm)만큼 표를 줄이고, 아래 여백은 3mm 로 좁힌다
  const CM = mm(8), CB = mm(3), W = PAGE.w - CM * 2, H = PAGE.h - CM - CB - mm(11);
  const hookM = book.coverHook ? [String(book.coverHook)] : ((book.subtitle || '').match(/\d+\s*[분초일주년장개]/) || [null]);
  const hook = hookM[0]; // 표지 큰 숫자 (예: "30분", "45문장")
  const num = hook ? hook.replace(/[^\d]/g, '') : null;
  const unit = hook ? hook.replace(/[\d\s]/g, '') : '';
  const P = (children, o = {}) => new Paragraph({ children, alignment: o.align || AlignmentType.LEFT, spacing: { before: o.before || 0, after: o.after || 0, line: o.line || 240, lineRule: o.exact ? LineRuleType.EXACT : LineRuleType.AUTO } });
  const top = [
    P([run((book.series || 'EBOOK').toUpperCase(), { size: SZ.coverKicker, color: ACC_D, sp: 160, bold: true })], { after: 40 }),
    P([run('────────', { size: 20, color: ACC_D })], { after: num ? 700 : 1600 }),
  ];
  if (num) top.push(P([
    run(num, { size: num.length >= 2 ? 340 : 400, bold: true, color: ACC_D, font: F_TITLE }),
    run(unit ? `  ${unit}` : '', { size: 88, bold: true, color: FG, font: F_TITLE }),
  ], { line: 190 * 20, exact: true, after: 520 }));
  cleanLines(book.title).forEach((l) => top.push(P([run(l, { size: SZ.coverTitle, bold: true, color: FG, font: F_TITLE })], { line: 280 })));
  if (book.subtitle) top.push(P([run(book.subtitle, { size: SZ.coverSubtitle, color: SUB })], { before: 360, line: 340 }));
  const bottom = [
    P([run('지은이', { size: SZ.coverKicker, color: SUB, sp: 120 })], { after: 80 }),
    P([run(book.author || '', { size: SZ.coverAuthor, bold: true, color: FG, font: F_TITLE })], { line: 300 }),
  ];
  const NOBORDERS = { top: NOB, bottom: NOB, left: NOB, right: NOB, insideHorizontal: NOB, insideVertical: NOB };
  // LibreOffice 는 exact 행 높이를 내용이 넘치면 늘려 버리므로, 한 행에 위 내용 → 고정 간격(spacer) → 지은이 순으로 쌓는다
  const spacer = new Paragraph({ children: [new TextRun({ text: '', size: 2 })], spacing: { before: 0, after: 0, line: (book.coverSpacerMm ?? 38) * 56.69, lineRule: LineRuleType.EXACT } });
  cover.push(new Table({
    width: { size: W, type: WidthType.DXA }, columnWidths: [W], borders: NOBORDERS,
    rows: [new TableRow({ height: { value: H, rule: HeightRule.EXACT }, children: [new TableCell({
      children: [...top, spacer, ...bottom], width: { size: W, type: WidthType.DXA }, shading: shade(BG), verticalAlign: VerticalAlign.TOP,
      margins: { top: mm(16), bottom: mm(14), left: mm(14), right: mm(14) }, borders: NOBORDERS,
    })] })],
  }));
  coverSection = { properties: sectionProps({ margin: { top: CM, bottom: CB, left: CM, right: CM, header: 0, footer: 0 } }), footers: { default: emptyFooter() }, children: cover };
} else {
cover.push(gap(1500));
if (book.series) cover.push(new Paragraph({ children: [run(book.series, { size: SZ.coverKicker, color: C.muted, sp: 100 })], alignment: AlignmentType.CENTER, spacing: sp({ after: 200, line: 240 }) }));
cover.push(new Paragraph({ children: [run('──', { size: 24, color: ACC })], alignment: AlignmentType.CENTER, spacing: sp({ after: 480, line: 240 }) }));
cleanLines(book.title).forEach((l) => cover.push(new Paragraph({
  children: [run(l, { size: SZ.coverTitle, bold: true, color: INK, font: F_TITLE })],
  alignment: AlignmentType.CENTER, spacing: sp({ after: 120, line: 280 }),
})));
if (book.subtitle) { cover.push(gap(240)); cover.push(new Paragraph({ children: [run(book.subtitle, { size: SZ.coverSubtitle, color: C.lead })], alignment: AlignmentType.CENTER, spacing: sp({ after: 200, line: 340 }) })); }
cover.push(gap(1500));
cover.push(...block(C.blockBg, [
  shaded(C.blockBg, [run('지은이', { size: SZ.coverKicker, color: C.blockSub, sp: 80 })], { align: AlignmentType.CENTER, after: 120 }),
  shaded(C.blockBg, [run(book.author || '', { size: SZ.coverAuthor, bold: true, color: C.blockInk, font: F_TITLE })], { align: AlignmentType.CENTER, after: 0, line: 300 }),
], 240));
coverSection = { properties: sectionProps(), footers: { default: emptyFooter() }, children: cover };
}
sections.push(coverSection);

// 2) 차례
const toc = [
  new Paragraph({ children: [run('CONTENTS', { size: SZ.tocLabel, color: ACC, sp: 80 })], spacing: sp({ after: 80, line: 240 }) }),
  new Paragraph({ children: [run('차례', { size: SZ.tocTitle, bold: true, color: INK, font: F_TITLE })], spacing: sp({ after: 200, line: LINE.title }) }),
  rule(ACC, 0, BOLD ? 300 : 480),
];
let tocPart = null;
book.chapters.forEach((ch, i) => {
  if (ch.part && ch.part.no !== tocPart) {
    tocPart = ch.part.no;
    if (BOLD) {
      toc.push(gap(40));
      toc.push(shaded(C.partBg, [
        run(`PART ${String(ch.part.no).padStart(2, '0')}`, { size: SZ.tocPart, color: ACC_D, sp: 120, bold: true }),
        run(`      ${ch.part.title || ''}`, { size: SZ.tocEntry, color: C.partInk, bold: true, font: F_TITLE }),
      ], { after: 100, line: 250, pad: 8 }));
    } else {
      toc.push(new Paragraph({ children: [run(`PART ${ch.part.no}   ${ch.part.title || ''}`, { size: SZ.tocPart, color: ACC, sp: 40, bold: true })], spacing: sp({ before: 240, after: 120, line: 240 }) }));
    }
  }
  toc.push(new Paragraph({
    tabStops: [{ type: TabStopType.RIGHT, position: TEXT_W - 40, leader: LeaderType.DOT }],
    children: [
      run(`${ch.no}    `, { size: SZ.tocEntry, bold: true, color: ACC, font: BOLD ? F_TITLE : F_BODY }),
      run(ch.title, { size: SZ.tocEntry, font: BOLD ? F_TITLE : F_BODY }),
      new TextRun({ text: '\t', font: F_BODY, size: SZ.tocEntry }),
      new PageReference(`ch_${i}`, { font: F_BODY, size: SZ.tocEntry - 2, color: C.muted }),
    ],
    spacing: sp({ after: BOLD ? 80 : 140, line: BOLD ? 300 : 340 }),
    border: { bottom: { style: BorderStyle.SINGLE, size: 2, color: C.rule, space: 6 } },
  }));
});
sections.push({ properties: sectionProps(), footers: { default: emptyFooter() }, children: toc });

// 3) 본문 — 한 섹션. 파트 디바이더/챕터 헤더는 pageBreakBefore 로 새 페이지에서 시작
const body = [];
let lastPart = null;
book.chapters.forEach((ch, i) => {
  // 파트 디바이더 (넘버링 섹션 디바이더 — 여백 안 shading 블록). 챕터 오프너와 달리 책당 2~4장뿐이라 허용
  if (OPT.partDividers && ch.part && ch.part.no !== lastPart) {
    lastPart = ch.part.no;
    body.push(gap(2800, { pageBreakBefore: true }));
    body.push(...block(C.partBg, [
      shaded(C.partBg, [run(`PART`, { size: SZ.chKicker, color: C.partSub, sp: 120 })], { after: 60 }),
      shaded(C.partBg, [run(String(ch.part.no).padStart(2, '0'), { size: SZ.partNum, bold: true, color: ACC_D, font: F_TITLE })], { after: 240, line: BOLD ? 250 : 280 }),
      shaded(C.partBg, [run(ch.part.title || '', { size: SZ.partTitle, bold: true, color: C.partInk, font: F_TITLE })], { after: ch.part.intro ? 200 : 0, line: 300 }),
      ...(ch.part.intro ? [shaded(C.partBg, [run(ch.part.intro, { size: SZ.partIntro, color: C.partSub })], { after: 0, line: 360 })] : []),
    ], 500));
  } else if (ch.part && ch.part.no !== lastPart) {
    lastPart = ch.part.no;
  }

  // 챕터 헤더 — 본문 페이지 맨 위 (오프너 페이지 없음)
  const isNum = /^\d+$/.test(String(ch.no));
  const kicker = isNum ? `CHAPTER ${String(ch.no).padStart(2, '0')}` : String(ch.no);
  body.push(new Paragraph({ children: [run(kicker, { size: SZ.chKicker, bold: true, color: ACC, sp: 100 })], spacing: sp({ after: 160, line: 240 }), pageBreakBefore: true, keepNext: true }));
  body.push(new Paragraph({
    children: [new Bookmark({ id: `ch_${i}`, children: [run(ch.title, { size: SZ.chTitle, bold: true, color: INK, font: F_TITLE })] })],
    spacing: sp({ after: 240, line: 300 }), keepNext: true,
  }));
  body.push(BOLD
    ? new Paragraph({ children: [new TextRun({ text: '', size: 2 })], spacing: { before: 0, after: 420, line: 240, lineRule: LineRuleType.AUTO }, indent: { right: TEXT_W - 1700 }, border: { bottom: { style: BorderStyle.SINGLE, size: 18, color: ACC, space: 1 } } })
    : rule(ACC, 0, 420));

  (ch.blocks || []).forEach((b) => renderBlock(b).forEach((p) => body.push(p)));
});

// 4) 마무리 페이지
const closing = book.closing || { text: '끝까지 읽어주셔서 고맙습니다.', author: book.author };
if (BOLD) {
  body.push(gap(2600, { pageBreakBefore: true }));
  const FG = C.blockInk, SUB = mix(C.blockBg, C.blockInk, 0.55);
  body.push(...block(C.blockBg, [
    shaded(C.blockBg, [run('────────', { size: 20, color: ACC_D })], { after: 320, line: 240 }),
    ...cleanLines(closing.text).map((l) => shaded(C.blockBg, [run(l, { size: SZ.closing, color: FG, font: F_QUOTE })], { after: 100, line: 340 })),
    shaded(C.blockBg, [new TextRun({ text: '', size: 2 })], { after: 360, line: 240 }),
    shaded(C.blockBg, [run(closing.author || book.author || '', { size: SZ.closingAuthor, color: SUB })], { after: closing.cta ? 320 : 0, line: 300 }),
    ...(closing.cta ? [shaded(C.blockBg, [run(closing.cta, { size: SZ.box, color: ACC_D })], { after: 0, line: 340 })] : []),
  ], 700));
} else {
body.push(gap(3600, { pageBreakBefore: true }));
cleanLines(closing.text).forEach((l) => body.push(new Paragraph({ children: [run(l, { size: SZ.closing, color: INK, font: F_QUOTE })], alignment: AlignmentType.CENTER, spacing: sp({ after: 120, line: 340 }) })));
body.push(gap(400));
body.push(new Paragraph({ children: [run('──', { size: 24, color: ACC })], alignment: AlignmentType.CENTER, spacing: sp({ after: 240, line: 240 }) }));
body.push(new Paragraph({ children: [run(closing.author || book.author || '', { size: SZ.closingAuthor, color: C.lead })], alignment: AlignmentType.CENTER, spacing: sp({ after: 0, line: 300 }) }));
if (closing.cta) { body.push(gap(600)); body.push(...block(C.blockBg, [shaded(C.blockBg, [run(closing.cta, { size: SZ.box, color: C.blockInk })], { align: AlignmentType.CENTER, after: 0, line: 340 })], 200)); }
}

sections.push({
  properties: sectionProps({ pageNumbers: { start: 1 } }),
  headers: T.runningHead ? { default: runningHead() } : undefined,
  footers: { default: OPT.pageNumbers ? pageFooter() : emptyFooter() },
  children: body,
});

const doc = new Document({
  creator: book.author || '',
  title: String(book.title || '').replace(/\n/g, ' '),
  background: { color: PAPER },                       // 배경색은 문서 전체에 딱 한 번 (함정 1)
  styles: { default: { document: { run: { font: F_BODY, size: SZ.body, color: INK } } } },
  sections,
});

Packer.toBuffer(doc).then((buf) => {
  fs.mkdirSync(path.dirname(path.resolve(out)), { recursive: true });
  fs.writeFileSync(out, buf);
  const kb = Math.round(fs.statSync(out).size / 1024);
  console.log(`[${templateId} ${T.name}] 생성: ${out} (${kb}KB) — 챕터 ${book.chapters.length}개, 파트 디바이더 ${OPT.partDividers ? 'ON' : 'OFF'}, 쪽번호 ${OPT.pageNumbers ? 'ON' : 'OFF'}`);
});
