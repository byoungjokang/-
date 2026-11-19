#!/usr/bin/env node
/**
 * 파이프라인 진행 상황
 *   node status.js <책폴더>                 — 표 출력
 *   node status.js <책폴더> --set 03_outline done|approved|pending [--note "..."]
 *   node status.js <책폴더> --next-chapter 5   — 집필 재개 지점 기록
 */
const fs = require('fs');
const path = require('path');

const args = process.argv.slice(2);
const dir = args[0];
if (!dir) { console.error('사용법: node status.js <책폴더> [--set 단계 상태] [--next-chapter N]'); process.exit(1); }
const pf = path.join(dir, 'pipeline.json');
if (!fs.existsSync(pf)) { console.error(`pipeline.json 없음: ${dir} — init_book.js 로 먼저 만들 것`); process.exit(1); }
const p = JSON.parse(fs.readFileSync(pf, 'utf8'));
// 나중에 생긴 단계: 이전에 만든 책의 pipeline.json 에 없으면 채워 넣는다 (--set 할 때 저장된다)
const LATER_STEPS = {
  '09_ads': { file: '09_ads.json', status: 'pending', approvedAt: null, note: '09 메타 광고 소재 (ebook-meta-ads, 승인 3개)' },
};
for (const [k, v] of Object.entries(LATER_STEPS)) if (!p.steps[k]) p.steps[k] = { ...v };

const setIdx = args.indexOf('--set');
if (setIdx >= 0) {
  const [step, status] = [args[setIdx + 1], args[setIdx + 2]];
  if (!p.steps[step]) { console.error(`단계 없음: ${step} (${Object.keys(p.steps).join(', ')})`); process.exit(1); }
  if (!['pending', 'done', 'approved'].includes(status)) { console.error('상태는 pending | done | approved'); process.exit(1); }
  p.steps[step].status = status;
  if (status === 'approved') p.steps[step].approvedAt = new Date().toISOString();
  const nIdx = args.indexOf('--note');
  if (nIdx >= 0) p.steps[step].note = args[nIdx + 1];
}
const ncIdx = args.indexOf('--next-chapter');
if (ncIdx >= 0) p.writing.nextChapter = parseInt(args[ncIdx + 1], 10) || 0;
if (setIdx >= 0 || ncIdx >= 0) { p.updatedAt = new Date().toISOString(); fs.writeFileSync(pf, JSON.stringify(p, null, 2)); }

// 파일 존재 여부로 실제 상태 보정 (파일이 없으면 done/approved 라도 경고)
const mark = { pending: '○', done: '◐', approved: '●' };
console.log(`책: ${p.title || p.slug}  (${p.slug})  모드: ${p.mode}`);
console.log('─'.repeat(64));
let nextStep = null;
for (const [k, v] of Object.entries(p.steps)) {
  const exists = fs.existsSync(path.join(dir, v.file));
  const flag = !exists && v.status !== 'pending' ? '  ⚠ 파일 없음' : '';
  console.log(`${mark[v.status] || '?'} ${k.padEnd(12)} ${v.status.padEnd(9)} ${v.file.padEnd(16)} ${v.note || ''}${flag}`);
  if (!nextStep && v.status !== 'approved') nextStep = k;
}
console.log('─'.repeat(64));
if (p.steps['04_book'].status !== 'approved') console.log(`집필 재개 지점: 챕터 인덱스 ${p.writing.nextChapter} (checkpoint: 앞 ${p.writing.checkpointAfter}챕터 후 문체 확인)`);
console.log(nextStep ? `다음 할 일: ${nextStep}` : '모든 단계 승인 완료 ✓');
