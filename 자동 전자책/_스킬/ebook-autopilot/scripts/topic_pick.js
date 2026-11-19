#!/usr/bin/env node
/**
 * 주제 메뉴 — 17개 카테고리·311개 주제 카탈로그에서 체크한 카테고리(또는 결핍)로 후보를 뽑는다.
 *
 *   node topic_pick.js --list                          카테고리 17개 (번호·이름·세부분야·주제 수·결핍)
 *   node topic_pick.js --cat 01,04,06                  체크한 카테고리의 세부분야 + 주제 전부
 *   node topic_pick.js --cat 돈,연애                    이름 일부로도 가능
 *   node topic_pick.js --deficit 관계,내면              결핍 지도 6종으로 카테고리 필터
 *   node topic_pick.js --sub "세일즈,대화"              세부분야 이름으로 필터 (카테고리 무관)
 *   node topic_pick.js --grep 소개팅                    주제 문장 검색
 *   node topic_pick.js --cat 06 --json                  JSON 출력 (스킬이 후보 추천에 쓰는 형식)
 *   node topic_pick.js --widget cats                    체크박스 위젯 HTML (카테고리 17개 + '이미 주제를 정하셨나요?' + 주제 입력란) → show_widget 에 그대로
 *     → 버튼 클릭 시 메시지: 주제 메뉴 선택 — 카테고리: 04, 06 / 주제: 정했다 "…"
 *   node topic_pick.js --widget subs --cat 01,04        체크박스 위젯 HTML (선택 카테고리의 세부분야)
 */
const fs = require('fs');
const path = require('path');

const CAT = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'references', 'topic-catalog.json'), 'utf8'));
const args = process.argv.slice(2);
const opt = (n) => { const i = args.indexOf(n); return i >= 0 ? args[i + 1] : null; };
const has = (n) => args.includes(n);
const split = (s) => (s ? String(s).split(/[,\s]+/).map((x) => x.trim()).filter(Boolean) : []);

const matchCat = (c, keys) => keys.some((k) => c.no === k.padStart(2, '0') || c.name.includes(k));
let cats = CAT.categories;
const catKeys = split(opt('--cat'));
const defKeys = split(opt('--deficit'));
const subKeys = split(opt('--sub'));
const grep = opt('--grep');
if (catKeys.length) cats = cats.filter((c) => matchCat(c, catKeys));
if (defKeys.length) cats = cats.filter((c) => c.deficits.some((d) => defKeys.includes(d)));

const pick = cats.map((c) => ({
  ...c,
  subs: c.subs
    .filter((s) => !subKeys.length || subKeys.some((k) => s.name.includes(k)))
    .map((s) => ({ ...s, topics: s.topics.filter((t) => !grep || t.includes(grep)) }))
    .filter((s) => s.topics.length),
})).filter((c) => c.subs.length);

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;');

// ── 위젯 HTML (show_widget 규칙: 조각 HTML, CSS 변수, 이모지·그라데이션 없음, sendPrompt 로 선택 전송) ──
function widget(kind) {
  const items = kind === 'cats'
    ? CAT.categories.map((c) => ({ id: c.no, label: `${c.no} ${c.name}`, sub: `${c.subs.map((s) => s.name).slice(0, 3).join(' · ')}${c.subs.length > 3 ? ' 외' : ''} — ${c.subs.reduce((a, s) => a + s.topics.length, 0)}개`, tags: c.deficits }))
    : pick.flatMap((c) => c.subs.map((s) => ({ id: `${c.no}/${s.name}`, label: s.name, sub: `${c.name} — ${s.topics.length}개${s.hint ? ' · ' + s.hint : ''}`, tags: [] })));
  const prefix = kind === 'cats' ? '주제 메뉴 선택 — 카테고리: ' : '주제 메뉴 선택 — 세부분야: ';
  const title = kind === 'cats' ? '전자책 주제 카테고리 17개 중 관심 있는 것을 체크하고 추천 받기' : '세부분야 중 관심 있는 것을 체크하고 후보 주제 추천 받기';
  const deficitChips = kind === 'cats' ? `
<div style="display:flex;flex-wrap:wrap;gap:8px;margin:0 0 1rem;align-items:center">
  <span style="font-size:13px;color:var(--text-secondary)">결핍으로 거르기</span>
  ${CAT.deficits.map((d) => `<button type="button" data-def="${esc(d)}" style="font-size:13px;padding:4px 12px">${esc(d)}</button>`).join('')}
  <button type="button" id="def-clear" style="font-size:13px;padding:4px 12px">전체</button>
</div>` : '';
  return `<h2 class="sr-only" style="position:absolute;left:-9999px">${esc(title)}</h2>
${deficitChips}
<div id="grid" style="display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:10px;margin:0 0 1rem">
${items.map((it) => `  <label data-tags="${esc(it.tags.join(','))}" style="display:flex;gap:10px;align-items:flex-start;padding:10px 12px;border:0.5px solid var(--border);border-radius:12px;background:var(--surface-2);cursor:pointer">
    <input type="checkbox" value="${esc(it.id)}" style="margin-top:3px">
    <span><span style="display:block;font-size:14px;font-weight:500">${esc(it.label)}</span><span style="display:block;font-size:12px;color:var(--text-secondary);line-height:1.4">${esc(it.sub)}</span></span>
  </label>`).join('\n')}
</div>
${kind === 'cats' ? `<div style="border-top:0.5px solid var(--border);padding-top:14px;margin:0 0 14px">
  <p style="font-size:14px;font-weight:500;margin:0 0 8px">이미 주제를 정하셨나요?</p>
  <div style="display:flex;flex-wrap:wrap;gap:14px;font-size:14px;margin-bottom:10px">
    <label style="display:flex;gap:6px;align-items:center"><input type="radio" name="decided" value="정했다"> 네, 정했어요</label>
    <label style="display:flex;gap:6px;align-items:center"><input type="radio" name="decided" value="확실하지 않다"> 대략 방향만 있어요</label>
    <label style="display:flex;gap:6px;align-items:center"><input type="radio" name="decided" value="미정" checked> 아직 못 정했어요</label>
  </div>
  <input id="topic" type="text" placeholder="정한 주제가 있으면 한 줄로 (예: 소개팅에서 어색하지 않은 대화법)" style="width:100%">
</div>` : ''}
<div style="display:flex;gap:12px;align-items:center">
  <button type="button" id="go">${kind === 'cats' ? '다음 ↗' : '체크한 것으로 추천 받기 ↗'}</button>
  <span id="count" style="font-size:13px;color:var(--text-secondary)">0개 선택</span>
  <span id="err" style="font-size:13px;color:var(--text-danger)"></span>
</div>
<script>
(function(){
  var boxes=[].slice.call(document.querySelectorAll('#grid input'));
  var count=document.getElementById('count'), err=document.getElementById('err');
  function upd(){ var n=boxes.filter(function(b){return b.checked}).length; count.textContent=n+'개 선택'; if(n) err.textContent=''; }
  boxes.forEach(function(b){ b.addEventListener('change',upd); });
  var chips=[].slice.call(document.querySelectorAll('button[data-def]'));
  chips.forEach(function(ch){ ch.addEventListener('click',function(){
    var d=ch.getAttribute('data-def');
    chips.forEach(function(c){ c.style.background=c===ch?'var(--bg-accent)':''; });
    [].slice.call(document.querySelectorAll('#grid label')).forEach(function(l){ l.style.opacity=(l.getAttribute('data-tags')||'').split(',').indexOf(d)>=0?'1':'0.35'; });
  });});
  var clr=document.getElementById('def-clear'); if(clr) clr.addEventListener('click',function(){ chips.forEach(function(c){c.style.background=''}); [].slice.call(document.querySelectorAll('#grid label')).forEach(function(l){ l.style.opacity='1'; }); });
  document.getElementById('go').addEventListener('click',function(){
    var sel=boxes.filter(function(b){return b.checked}).map(function(b){return b.value});
    if(!sel.length){ err.textContent='하나 이상 체크해 주세요'; return; }
    var dec=document.querySelector('input[name=decided]:checked'); var tp=document.getElementById('topic');
    var tail='';
    if(dec){ tail=' / 주제: '+dec.value; if(tp&&tp.value.trim()) tail+=' "'+tp.value.trim()+'"'; if(dec.value==='정했다'&&!(tp&&tp.value.trim())){ err.textContent='정한 주제를 한 줄 적어 주세요'; return; } }
    sendPrompt(${JSON.stringify(prefix)}+sel.join(', ')+tail);
  });
})();
</script>`;
}

// ── 출력 ──
if (has('--list')) {
  console.log('번호  카테고리              세부  주제  결핍');
  CAT.categories.forEach((c) => console.log(`${c.no}    ${c.name.padEnd(18, ' ')} ${String(c.subs.length).padStart(3)}  ${String(c.subs.reduce((a, s) => a + s.topics.length, 0)).padStart(4)}  ${c.deficits.join('·')}`));
  console.log(`\n합계 ${CAT.categories.length}개 카테고리 / ${CAT.categories.reduce((a, c) => a + c.subs.length, 0)} 세부분야 / ${CAT.categories.reduce((a, c) => a + c.subs.reduce((b, s) => b + s.topics.length, 0), 0)} 주제`);
} else if (opt('--widget')) {
  process.stdout.write(widget(opt('--widget') === 'subs' ? 'subs' : 'cats'));
} else if (has('--json')) {
  console.log(JSON.stringify(pick, null, 1));
} else {
  if (!pick.length) { console.log('일치하는 항목 없음. --list 로 카테고리를 확인'); process.exit(1); }
  pick.forEach((c) => {
    console.log(`\n## ${c.no} ${c.name}  [결핍: ${c.deficits.join('·')}]`);
    if (c.note) console.log(`   ※ ${c.note}`);
    c.subs.forEach((s) => {
      console.log(`\n### ${s.name} (${s.topics.length})${s.hint ? '  — ' + s.hint : ''}`);
      s.topics.forEach((t) => console.log(`  - ${t}`));
      if (s.note) console.log(`   ※ ${s.note}`);
    });
  });
  console.log(`\n총 ${pick.reduce((a, c) => a + c.subs.reduce((b, s) => b + s.topics.length, 0), 0)}개 주제`);
}
