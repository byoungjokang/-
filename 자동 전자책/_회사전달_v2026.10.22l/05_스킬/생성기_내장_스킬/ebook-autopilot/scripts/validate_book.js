#!/usr/bin/env node
/**
 * 04_book.json 검증기 — 빌드 전에 반드시 통과시킨다.
 *
 * 사용법: node validate_book.js <book.json> [--json]
 * 종료 코드: 0 = 통과(경고는 있을 수 있음), 1 = 오류
 *
 * 검사 항목
 *  [구조]   필수 키, 챕터 수, 블록 타입, items 배열
 *  [분량]   챕터당 블록 수 10~16 (경고), point 1~2 / quote 1 / hook 필수 (경고)
 *  [트랙]   서사 트랙에 list/steps/check/box 금지 (오류) — bj-essay-voice 규칙
 *  [함정5]  list/steps items 나 문단 앞의 "1) 2)" "1. " 같은 번호 접두어 (경고)
 *  [브랜드] 저자가 병조쌤이 아니면 병조쌤/비라스/비제이라이프스쿨/리치코드 금지 (오류)
 *           저자가 병조쌤 본인이어도 비라스/비제이라이프스쿨 은 금지 (오류)
 *  [CTA]    "병조쌤이 직접 운영하는 단톡방" 문구는 병조쌤 본인 책에서만 (오류)
 *  [표지]   제목 한 줄 14자 초과 / 3줄 이상 (경고 — 48pt 기준)
 */
const fs = require('fs');

const args = process.argv.slice(2);
const src = args[0];
if (!src) { console.error('사용법: node validate_book.js <book.json> [--json]'); process.exit(1); }
const asJson = args.includes('--json');
const book = JSON.parse(fs.readFileSync(src, 'utf8'));

const errors = [], warns = [];
const err = (m) => errors.push(m);
const warn = (m) => warns.push(m);

const BLOCK_TYPES = new Set(['p', 'lead', 'sub', 'point', 'thesis', 'quote', 'box', 'list', 'steps', 'check', 'divider', 'hook']);
const ITEM_TYPES = new Set(['list', 'steps', 'check']);
const NARRATIVE_FORBIDDEN = new Set(['list', 'steps', 'check', 'box']);
const NUM_PREFIX = /^\s*(\d+[)\]]|\d+\.(?=\s)|[①-⑳]|\(\d+\))\s*/; // "1) " "1] " "1. " — 소수(0.5초)는 제외

// ── 구조 ──
if (!book.title) err('title 없음');
if (!book.author) err('author 없음');
if (!Array.isArray(book.chapters) || book.chapters.length === 0) err('chapters 없음');
const meta = book.meta || {};
const isBj = meta.authorIsBj === true;

// ── 표지 ──
if (book.title) {
  const lines = String(book.title).split('\n');
  if (lines.length > 2) warn(`표지 제목이 ${lines.length}줄 — 48pt 기준 2줄까지 권장`);
  lines.forEach((l) => { if (l.length > 14) warn(`표지 제목 한 줄이 ${l.length}자 ("${l}") — 14자 안쪽 권장`); });
}

// ── 챕터 ──
const allText = [];
(book.chapters || []).forEach((ch, i) => {
  const tag = `[${ch.no || i}] ${ch.title || '(제목 없음)'}`;
  if (!ch.title) err(`${tag}: title 없음`);
  if (ch.no === undefined) err(`${tag}: no 없음`);
  const blocks = ch.blocks || [];
  if (!Array.isArray(blocks) || blocks.length === 0) { err(`${tag}: blocks 없음`); return; }
  const track = ch.track || '서사';
  if (!['서사', '방법'].includes(track)) warn(`${tag}: track 값 "${track}" — 서사 | 방법 중 하나여야 함`);

  const count = {};
  blocks.forEach((b, j) => {
    const t = b.type || 'p';
    count[t] = (count[t] || 0) + 1;
    if (!BLOCK_TYPES.has(t)) err(`${tag} 블록 ${j}: 알 수 없는 type "${t}"`);
    if (ITEM_TYPES.has(t)) {
      if (!Array.isArray(b.items) || b.items.length === 0) err(`${tag} 블록 ${j}: ${t} 에 items 배열 필요`);
      else b.items.forEach((it) => { if (NUM_PREFIX.test(String(it))) warn(`${tag}: ${t} 항목에 번호 접두어 남음 — "${String(it).slice(0, 30)}…" (함정 5: 접두어 벗겨낼 것)`); });
    } else if (t !== 'divider' && !b.text) err(`${tag} 블록 ${j}: ${t} 에 text 없음`);
    if (t === 'p' && NUM_PREFIX.test(String(b.text || ''))) warn(`${tag}: 문단이 번호로 시작 — "${String(b.text).slice(0, 30)}…" (산문으로 풀 것)`);
    if (track === '서사' && NARRATIVE_FORBIDDEN.has(t)) err(`${tag}: 서사 트랙에 ${t} 블록 — 산문으로 풀거나 track 을 "방법"으로 바꿀 것`);
    if (b.text) allText.push(String(b.text));
    if (b.items) allText.push(...b.items.map(String));
    if (b.title) allText.push(String(b.title));
  });
  allText.push(String(ch.title || ''));
  if (ch.part) allText.push(String(ch.part.title || ''), String(ch.part.intro || ''));

  const n = blocks.length;
  if (n < 10) warn(`${tag}: 블록 ${n}개 — 10~16개 권장 (4p 미만이면 블로그 글)`);
  if (n > 20) warn(`${tag}: 블록 ${n}개 — 너무 길다. 20개 넘으면 장을 나눌 것`);
  const points = (count.point || 0) + (count.thesis || 0);
  if (points > 2) warn(`${tag}: point ${points}개 — 장당 1~2개`);
  if ((count.quote || 0) > 1) warn(`${tag}: quote ${count.quote}개 — 장당 1개`);
  if (!count.hook) warn(`${tag}: hook 없음 — 모든 장 끝에 다음 장을 여는 질문`);
  if (blocks[blocks.length - 1].type !== 'hook') warn(`${tag}: 마지막 블록이 hook 이 아님`);
  if (blocks[0].type !== 'lead') warn(`${tag}: 첫 블록이 lead 가 아님 — 정반합 오프닝(통념 인용)을 lead 로`);
});

// ── 브랜드 규칙 ──
const corpus = allText.concat([String(book.title || ''), String(book.subtitle || ''), String(book.series || ''), String(book.author || ''), JSON.stringify(book.closing || {})]).join('\n');
const hits = (re) => { const m = corpus.match(re); return m ? m.length : 0; };
const alwaysForbidden = /비라스|비제이라이프스쿨|BJ ?라이프스쿨/g;
if (hits(alwaysForbidden)) err(`"비라스/비제이라이프스쿨" ${hits(alwaysForbidden)}회 등장 — 어느 책에도 넣지 않는다 (브랜드 규칙)`);
if (!isBj) {
  const bjOnly = /병조쌤|병조|리치코드|코치 비제이/g;
  if (hits(bjOnly)) err(`저자가 병조쌤이 아닌데 "병조쌤/리치코드" ${hits(bjOnly)}회 등장 — 저자 본인 이름·브랜드로 교체`);
}
const bjCta = /병조쌤이 직접 운영하는 단톡방/g;
if (!isBj && hits(bjCta)) err(`병조쌤 개인 CTA 문구 등장 — 타 저자 책에는 [저자 커뮤니티 링크] 자리표시자로`);
if (hits(/\[저자 커뮤니티/g) && meta.cta && !/^\[/.test(meta.cta)) warn(`자리표시자 "[저자 커뮤니티…]"가 본문에 남아 있음 — meta.cta("${meta.cta}")로 치환할 것`);

// ── 결과 ──
const summary = {
  file: src, chapters: (book.chapters || []).length,
  blocks: (book.chapters || []).reduce((a, c) => a + (c.blocks || []).length, 0),
  chars: allText.join('').replace(/\s/g, '').length,
  estPages: Math.round(allText.join('').replace(/\s/g, '').length / 520), // 16pt A4 여백 30/30/15 기준 실측 약 500~550자/p
  errors, warns,
};
if (asJson) console.log(JSON.stringify(summary, null, 2));
else {
  console.log(`검증: ${src}`);
  console.log(`  챕터 ${summary.chapters}개 / 블록 ${summary.blocks}개 / 공백 제외 ${summary.chars.toLocaleString()}자 / 본문 약 ${summary.estPages}p`);
  if (errors.length) { console.log(`\n✗ 오류 ${errors.length}건`); errors.forEach((m) => console.log('  - ' + m)); }
  if (warns.length) { console.log(`\n! 경고 ${warns.length}건`); warns.forEach((m) => console.log('  - ' + m)); }
  if (!errors.length && !warns.length) console.log('\n✓ 통과 — 경고 없음');
  else if (!errors.length) console.log('\n✓ 통과 (경고는 검토 후 진행)');
}
process.exit(errors.length ? 1 : 0);
