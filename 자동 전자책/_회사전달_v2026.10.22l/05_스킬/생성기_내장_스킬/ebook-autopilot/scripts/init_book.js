#!/usr/bin/env node
/**
 * 책 프로젝트 초기화
 *   node init_book.js <books루트> <slug> [--title "책 가제"]
 * 생성물: <books루트>/<slug>/pipeline.json, 00_intake.md (입력 폼 템플릿)
 */
const fs = require('fs');
const path = require('path');

const args = process.argv.slice(2);
const root = args[0], slug = args[1];
if (!root || !slug) { console.error('사용법: node init_book.js <books루트> <slug> [--title "가제"]'); process.exit(1); }
if (!/^[a-z0-9-]+$/.test(slug)) { console.error('slug 는 영문 소문자·숫자·하이픈만 (파일명 깨짐 방지). 예: core-dokjongam'); process.exit(1); }
const tIdx = args.indexOf('--title');
const title = tIdx >= 0 ? args[tIdx + 1] : '';

const dir = path.join(root, slug);
if (fs.existsSync(path.join(dir, 'pipeline.json'))) { console.error(`이미 존재: ${dir} — status.js 로 상태를 확인하고 이어서 진행`); process.exit(2); }
fs.mkdirSync(dir, { recursive: true });

const now = new Date().toISOString();
const pipeline = {
  slug, title, createdAt: now, updatedAt: now,
  mode: 'step-confirm',            // step-confirm: 단계마다 승인 | auto: 승인 없이 끝까지
  steps: {
    '00_intake':   { file: '00_intake.md',   status: 'pending', approvedAt: null, note: '입력 폼 — 주제·저자·원료·문체·템플릿' },
    '01_onething': { file: '01_onething.md', status: 'pending', approvedAt: null, note: '1-2 주제 쪼개기 → 원씽 한 문장' },
    '02_research': { file: '02_research.md', status: 'pending', approvedAt: null, note: '1-3 심화 리서치 보고서' },
    '03_outline':  { file: '03_outline.json', status: 'pending', approvedAt: null, note: '1-4 목차 (챕터·트랙·주장·결론)' },
    '04_book':     { file: '04_book.json',   status: 'pending', approvedAt: null, note: '1-5 집필 원고 (빌더 스키마)' },
    '05_output':   { file: '05_ebook.pdf',  status: 'pending', approvedAt: null, note: '1-6 디자인·출력 (HTML→PDF, 프리셋)' },
    '09_ads':      { file: '09_ads.json',    status: 'pending', approvedAt: null, note: '09 메타 광고 소재 (ebook-meta-ads, 승인 3개)' },
  },
  writing: { checkpointAfter: 2, nextChapter: 0 },   // 집필: 앞 2챕터 쓰고 문체 확인, 이후 나머지
};
fs.writeFileSync(path.join(dir, 'pipeline.json'), JSON.stringify(pipeline, null, 2));

const intakeTpl = path.join(__dirname, '..', 'references', 'intake.md');
const intake = fs.existsSync(intakeTpl) ? fs.readFileSync(intakeTpl, 'utf8') : '# 00 입력 폼\n';
fs.writeFileSync(path.join(dir, '00_intake.md'), intake.replace('{{TITLE}}', title || '(가제 미정)').replace('{{DATE}}', now.slice(0, 10)));

console.log(`생성: ${dir}`);
console.log(`  pipeline.json, 00_intake.md — 입력 폼을 채우면 01 단계부터 시작`);
