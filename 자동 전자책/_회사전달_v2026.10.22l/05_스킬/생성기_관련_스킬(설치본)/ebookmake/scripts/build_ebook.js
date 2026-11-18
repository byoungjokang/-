#!/usr/bin/env node
/**
 * 리치코드 전자책 빌더
 * 사용법 :  node build_ebook.js book.json 출력.docx
 *
 * book.json 구조는 ../references/book-schema.json 참고
 */
const {
  Document, Packer, Paragraph, TextRun, PageBreak,
  AlignmentType, BorderStyle, WidthType, ShadingType,
  Footer, PageNumber, Table, TableRow, TableCell, VerticalAlign
} = require('docx');
const fs = require('fs');

// ══════════ 브랜드 팔레트 ══════════
const C = {
  darkBg : '0D0D1A',   // 표지 배경
  gold   : 'C8960A',   // 골드 포인트
  goldL  : 'F0C030',   // 밝은 골드
  deep   : '1A1235',   // 진한 남색
  part   : '1E2D5A',   // 파트 헤더 배경
  text   : '1A1A2E',   // 본문
  mid    : '4A4A6A',   // 서브 텍스트
  quote  : 'F0EDE8',   // 인용 배경
  line   : 'D8D3CA',   // 얇은 선
};
const FONT = 'Malgun Gothic';

// ══════════ 헬퍼 ══════════
const gap = (before = 0, after = 120) =>
  new Paragraph({ children: [new TextRun('')], spacing: { before, after } });

const run = (text, o = {}) => new TextRun({
  text, font: FONT,
  size: o.size || 22, color: o.color || C.text,
  bold: !!o.bold, italics: !!o.italics,
  characterSpacing: o.spacing || 0,
});

const para = (text, o = {}) => new Paragraph({
  children: Array.isArray(text) ? text : [run(text, o)],
  alignment: o.align || AlignmentType.LEFT,
  spacing: { before: o.before || 0, after: o.after || 160, line: o.line || 340 },
  indent: o.indent || undefined,
  shading: o.shading || undefined,
  border: o.border || undefined,
});

// 표지 한 줄
const coverLine = (text, size, color, o = {}) => new Paragraph({
  children: [run(text, { size, color, bold: o.bold !== false, spacing: o.spacing })],
  alignment: AlignmentType.CENTER,
  spacing: { before: o.before || 0, after: o.after || 200 },
});

// ══════════ 블록 렌더러 ══════════
function renderBlock(b) {
  const out = [];
  const t = typeof b === 'string' ? { type: 'p', text: b } : b;

  switch (t.type || 'p') {
    case 'p':                       // 본문
      out.push(para(t.text, { size: 22, line: 360, after: 180 }));
      break;

    case 'lead':                    // 도입 강조 문장
      out.push(para(t.text, { size: 25, bold: true, color: C.deep, line: 380, before: 120, after: 240 }));
      break;

    case 'quote':                   // 인용 박스
      out.push(new Paragraph({
        children: [run(t.text, { size: 22, italics: true, color: C.deep })],
        alignment: AlignmentType.CENTER,
        spacing: { before: 260, after: 260, line: 360 },
        shading: { type: ShadingType.CLEAR, color: 'auto', fill: C.quote },
        indent: { left: 500, right: 500 },
        border: {
          top:    { style: BorderStyle.SINGLE, size: 2, color: C.gold },
          bottom: { style: BorderStyle.SINGLE, size: 2, color: C.gold },
        },
      }));
      break;

    case 'point':                   // 핵심 한 줄 (골드 좌측선)
      out.push(new Paragraph({
        children: [run(t.text, { size: 23, bold: true, color: C.deep })],
        spacing: { before: 200, after: 200, line: 340 },
        indent: { left: 300 },
        border: { left: { style: BorderStyle.SINGLE, size: 18, color: C.gold, space: 12 } },
      }));
      break;

    case 'list':                    // 나열
      (t.items || []).forEach(it =>
        out.push(new Paragraph({
          children: [run('· ', { color: C.gold, bold: true, size: 22 }), run(it, { size: 22 })],
          spacing: { after: 110, line: 330 },
          indent: { left: 340, hanging: 180 },
        })));
      out.push(gap(0, 120));
      break;

    case 'sub':                     // 소제목
      out.push(new Paragraph({
        children: [run(t.text, { size: 26, bold: true, color: C.deep })],
        spacing: { before: 420, after: 200 },
      }));
      break;

    case 'divider':
      out.push(new Paragraph({
        children: [run('◆ ◆ ◆', { color: C.gold, size: 20 })],
        alignment: AlignmentType.CENTER,
        spacing: { before: 320, after: 320 },
      }));
      break;

    case 'hook':                    // 장 끝 다음 장 예고
      out.push(new Paragraph({
        children: [run('→  ', { color: C.gold, bold: true, size: 23 }), run(t.text, { size: 23, bold: true, color: C.deep, italics: true })],
        spacing: { before: 400, after: 200, line: 340 },
      }));
      break;

    default:
      out.push(para(String(t.text || ''), { size: 22 }));
  }
  return out;
}

// ══════════ 문서 조립 ══════════
function build(book) {
  const kids = [];          // 본문 섹션
  const coverSection = [];  // 표지 섹션 (여백 0)

  // ── 표지 ──
  // 어두운 배경은 페이지 전체를 덮는 표 한 칸으로 만든다.
  // (docx 문서 배경색은 뷰어마다 다르게 렌더링되어 신뢰할 수 없다)
  const coverKids = [];
  coverKids.push(gap(0, 1700));
  if (book.series) coverKids.push(coverLine(book.series, 22, C.gold, { spacing: 60, after: 320 }));
  book.title.split('\n').forEach(l => coverKids.push(coverLine(l, 52, C.goldL, { after: 140 })));
  if (book.subtitle) {
    coverKids.push(gap(0, 260));
    coverKids.push(coverLine(book.subtitle, 24, 'E8E4DC', { bold: false, after: 160 }));
  }
  coverKids.push(gap(0, 1500));
  coverKids.push(coverLine(`지은이 · ${book.author || '리치코드'}`, 20, C.gold, { bold: false, after: 0 }));

  coverSection.push(new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    borders: {
      top:    { style: BorderStyle.NONE }, bottom: { style: BorderStyle.NONE },
      left:   { style: BorderStyle.NONE }, right:  { style: BorderStyle.NONE },
      insideHorizontal: { style: BorderStyle.NONE }, insideVertical: { style: BorderStyle.NONE },
    },
    rows: [new TableRow({
      height: { value: 16400, rule: "exact" },
      children: [new TableCell({
        shading: { type: ShadingType.CLEAR, color: 'auto', fill: C.darkBg },
        verticalAlign: VerticalAlign.CENTER,
        margins: { top: 0, bottom: 0, left: 200, right: 200 },
        children: coverKids,
      })],
    })],
  }));

  // ── 목차 ──
  kids.push(new Paragraph({
    children: [run('목  차', { size: 40, bold: true, color: C.deep, spacing: 120 })],
    alignment: AlignmentType.CENTER, spacing: { before: 600, after: 500 },
  }));
  book.chapters.forEach(ch => {
    if (ch.part) {
      kids.push(new Paragraph({
        children: [run(ch.part, { size: 22, bold: true, color: C.gold, spacing: 40 })],
        spacing: { before: 320, after: 140 },
      }));
    }
    kids.push(new Paragraph({
      children: [run(ch.no ? `${ch.no}  ` : '', { color: C.gold, bold: true, size: 22 }),
                 run(ch.title, { size: 22, color: C.text })],
      spacing: { after: 130, line: 300 }, indent: { left: 200 },
    }));
  });
  kids.push(new Paragraph({ children: [new PageBreak()] }));

  // ── 본문 ──
  book.chapters.forEach((ch, i) => {
    if (ch.part) {
      // 파트 표지
      kids.push(gap(0, 1800));
      kids.push(new Paragraph({
        children: [run(ch.part, { size: 26, bold: true, color: C.gold, spacing: 80 })],
        alignment: AlignmentType.CENTER, spacing: { after: 240 },
      }));
      kids.push(new Paragraph({ children: [new PageBreak()] }));
    }
    if (ch.no) {
      kids.push(new Paragraph({
        children: [run(ch.no, { size: 22, bold: true, color: C.gold, spacing: 60 })],
        spacing: { before: 400, after: 120 },
      }));
    }
    kids.push(new Paragraph({
      children: [run(ch.title, { size: 36, bold: true, color: C.deep })],
      spacing: { after: 140, line: 400 },
      border: { bottom: { style: BorderStyle.SINGLE, size: 8, color: C.gold, space: 14 } },
    }));
    kids.push(gap(0, 320));
    (ch.blocks || []).forEach(b => renderBlock(b).forEach(p => kids.push(p)));
    if (i < book.chapters.length - 1) kids.push(new Paragraph({ children: [new PageBreak()] }));
  });

  return new Document({
    creator: book.author || '리치코드',
    title: book.title.replace(/\n/g, ' '),
    styles: { default: { document: { run: { font: FONT, size: 22, color: C.text } } } },
    sections: [
      {   // ── 표지 : 여백 0으로 전면을 어둡게 ──
        properties: { page: { margin: { top: 0, bottom: 0, left: 0, right: 0 } } },
        children: coverSection,
      },
      {   // ── 본문 ──
        properties: {
          page: { margin: { top: 1400, bottom: 1400, left: 1300, right: 1300 } },
        },
        footers: {
          default: new Footer({
            children: [new Paragraph({
              children: [new TextRun({ children: [PageNumber.CURRENT], font: FONT, size: 18, color: C.mid })],
              alignment: AlignmentType.CENTER,
            })],
          }),
        },
        children: kids,
      },
    ],
  });
}

// ══════════ 실행 ══════════
const src = process.argv[2];
const out = process.argv[3] || '/mnt/user-data/outputs/ebook.docx';
if (!src) { console.error('사용법: node build_ebook.js book.json [출력.docx]'); process.exit(1); }

const book = JSON.parse(fs.readFileSync(src, 'utf8'));
Packer.toBuffer(build(book)).then(buf => {
  fs.writeFileSync(out, buf);
  const n = book.chapters.length;
  const blocks = book.chapters.reduce((a, c) => a + (c.blocks || []).length, 0);
  console.log(`생성 완료 : ${out}`);
  console.log(`  장 ${n}개 · 블록 ${blocks}개 · ${Math.round(fs.statSync(out).size / 1024)}KB`);
});
