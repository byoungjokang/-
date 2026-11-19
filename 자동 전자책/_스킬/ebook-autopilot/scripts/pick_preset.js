#!/usr/bin/env node
/**
 * 프리셋 자동 선택 — EBOOK DESIGN MASTER GUIDE 의 "주제별 빠른 선택표" + "자동 선택 기준"
 *
 *   node pick_preset.js --topic "육아 감정대화" [--category 02] [--keywords "실천,체크리스트"] [--json]
 *   node pick_preset.js <book.json>            # meta.category / title / subtitle / 챕터 제목에서 추론
 *
 * 출력: 메인 프리셋 1 + 보조 프리셋 1 (기본 혼합 70/30) + 이유. 최종 결정은 사용자 확인.
 */
const fs = require('fs');
const path = require('path');
const PRESETS = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'references', 'design', 'presets.json'), 'utf8'));

// 가이드 "주제별 빠른 선택표" (1순위, 2순위) + 키워드
const TABLE = [
  { k: ['육아 감정', '감정대화', '화낸', '소리 지른', '훈육 후', '관계 회복', '아이 마음', '부모 감정'], m: 'EB01', s: 'EB03' },
  { k: ['부모교육 실전', '훈육', '생활 습관', '공부 습관', '부모 코칭', '실천법'], m: 'EB04', s: 'EB10' },
  { k: ['심리', '상담', '애착', '자존감', '감정조절'], m: 'EB03', s: 'EB06' },
  { k: ['감정치유', '마음치유', '이별', '자기연민', '위로', '불안', '번아웃', '트라우마'], m: 'EB02', s: 'EB06' },
  { k: ['에세이', '인문', '철학', '경험담', '브런치'], m: 'EB07', s: 'EB02' },
  { k: ['자기계발', '습관', '루틴', '워크북', '코칭', '21일', '30일'], m: 'EB10', s: 'EB30' },
  { k: ['비즈니스', '사업', '브랜딩', 'CEO', '고가', '컨설팅'], m: 'EB11', s: 'EB12' },
  { k: ['전략', '시장 분석', '기획', '조직'], m: 'EB12', s: 'EB11' },
  { k: ['마케팅', '카피', '광고', '세일즈', '상세페이지'], m: 'EB14', s: 'EB13' },
  { k: ['콘텐츠', 'SNS', '유튜브', '퍼스널브랜딩', '크리에이터', '인스타'], m: 'EB13', s: 'EB14' },
  { k: ['창업', '사이드잡', 'MVP', '운영', '스타트업'], m: 'EB15', s: 'EB12' },
  { k: ['금융', '투자', '경제', '자산', '부동산', '주식', '경매'], m: 'EB16', s: 'EB17' },
  { k: ['절약', '가계부', '재무', '재테크 입문', '월급'], m: 'EB17', s: 'EB16' },
  { k: ['법률', '세무', '세금', '노무', '계약', '행정'], m: 'EB18', s: 'EB12' },
  { k: ['건강', '운동', '수면', '영양', '다이어트'], m: 'EB19', s: 'EB09' },
  { k: ['뷰티', '피부', '스타일', '메이크업', '옷'], m: 'EB20', s: 'EB05' },
  { k: ['살림', '정리', '미니멀', '집', '인테리어'], m: 'EB21', s: 'EB10' },
  { k: ['요리', '베이킹', '식단', '레시피'], m: 'EB22', s: 'EB21' },
  { k: ['여행', '도시', '지역'], m: 'EB23', s: 'EB07' },
  { k: ['교육', '자녀교육', '학습'], m: 'EB24', s: 'EB10' },
  { k: ['공부법', '시험', '자격증', '암기'], m: 'EB25', s: 'EB10' },
  { k: ['AI', 'IT', '자동화', '프롬프트', 'GPT', '클로드'], m: 'EB26', s: 'EB12' },
  { k: ['디자인', '사진', '창작', '포트폴리오'], m: 'EB27', s: 'EB08' },
  { k: ['명상', '영성', '종교', '성경', '신념'], m: 'EB28', s: 'EB07' },
  { k: ['리더십', '성공', '프리미엄'], m: 'EB29', s: 'EB11' },
  { k: ['연애', '이성', '소개팅', '여성'], m: 'EB05', s: 'EB20' },
  { k: ['교양', '개념', '요약'], m: 'EB08', s: 'EB09' },
];
// 17 카테고리 → 기본값 (intake B 체크박스 번호)
const CAT = { '01': 'EB20', '02': 'EB01', '03': 'EB07', '04': 'EB14', '05': 'EB11', '06': 'EB05', '07': 'EB10', '08': 'EB16', '09': 'EB17', '10': 'EB12', '11': 'EB02', '12': 'EB28', '13': 'EB21', '14': 'EB19', '15': 'EB19', '16': 'EB24', '17': 'EB23' };

const args = process.argv.slice(2);
const opt = (n) => { const i = args.indexOf(n); return i >= 0 ? args[i + 1] : null; };
let text = '', category = opt('--category');
if (args[0] && !args[0].startsWith('--')) {
  const b = JSON.parse(fs.readFileSync(args[0], 'utf8'));
  text = [b.title, b.subtitle, b.series, (b.meta || {}).topic, ...(b.chapters || []).map((c) => c.title), ...(b.chapters || []).filter((c) => c.part).map((c) => c.part.title)].join(' ');
  category = category || (b.meta || {}).category;
} else {
  text = [opt('--topic') || '', opt('--keywords') || ''].join(' ');
}
const scores = {};
const why = {};
for (const row of TABLE) {
  let hit = 0; const hits = [];
  for (const k of row.k) if (text.toLowerCase().includes(k.toLowerCase())) { hit += 1; hits.push(k); }
  if (hit) { scores[row.m] = (scores[row.m] || 0) + hit * 2; scores[row.s] = (scores[row.s] || 0) + hit; (why[row.m] = why[row.m] || []).push(...hits); }
}
if (category && CAT[String(category).padStart(2, '0')]) { const p = CAT[String(category).padStart(2, '0')]; scores[p] = (scores[p] || 0) + 1.5; (why[p] = why[p] || []).push(`카테고리 ${category}`); }
const ranked = Object.entries(scores).sort((a, b) => b[1] - a[1]);
const main = ranked[0] ? ranked[0][0] : 'EB07';
let sub = ranked.find(([id]) => id !== main); sub = sub ? sub[0] : (TABLE.find((r) => r.m === main) || {}).s || 'EB10';
const result = { main, sub, mix: '70/30', reason: (why[main] || []).slice(0, 5), alternatives: ranked.slice(1, 4).map(([id, s]) => `${id} ${PRESETS[id].name} (${s})`), mainName: PRESETS[main].name, subName: PRESETS[sub].name };
if (args.includes('--json')) console.log(JSON.stringify(result));
else {
  console.log(`메인: ${main} ${PRESETS[main].name} — 근거: ${result.reason.join(', ') || '기본값'}`);
  console.log(`보조: ${sub} ${PRESETS[sub].name} (카드·컴포넌트 문법만 빌림, 30%)`);
  if (result.alternatives.length) console.log(`대안: ${result.alternatives.join(' / ')}`);
  console.log(`표지 ${PRESETS[main].cover} · 컴포넌트 ${PRESETS[main].cards} · 이미지 ${PRESETS[main].image}`);
}
