# 크몽 상세페이지(크몽용 이미지 만들기) 기능 · AI 지시문과 규칙 전체

- 기준: 전자책 생성기 **버전 2026.11.23m** (라이브 링크 https://claude.ai/artifact/FAqAox5isaZSMtRTHRGroy 지금 버전에서 그대로 뽑음)
- 화면 위치: **10 크몽 상세페이지** 탭
- 이 기능이 AI에게 보내는 지시문은 **2개**예요. ① 처음 생성 ② 규칙 위반 고치기(최대 2번). 이미지는 AI가 그리는 게 아니라 생성기가 AI가 준 JSON을 정해진 HTML·CSS 틀에 넣어 그려요(html2canvas).
- 빠짐없이 넘기려고 지시문뿐 아니라 ▲자동 규칙 점검 ▲입력 재료를 모으는 방식 ▲이미지 틀(CSS·HTML) ▲화면 문구·규칙 점검표 ▲ZIP 구성까지 원본 코드 그대로 넣었어요. 맨 아래 부록 A는 이 기능에 해당하는 원본 코드 전체예요.

---

## 1. 흐름 한눈에

1. `spInputs()`로 책 재료를 모아요 (제목·부제·작가·주제·독자·리서치·목차·장 제목·원고·표지·쪽수·저자 이야기·실제 후기). 09 상세페이지를 이미 만들었으면 그 문장(`spData`)도 같이 넣어요.
2. 팔레트(색)를 골라요 → `spPickPalette()` (AI 안 씀. 09에서 고른 색 → 디자인 템플릿 짝 → 주제 단어 → 표지 강조색 순서)
3. 책 목업 이미지를 준비해요 → `maBookImage()` (확정 표지로 만든 3D 목업, 600px로 줄임)
4. **AI 지시문 ① 생성** → `sample.json(kmPrompt(I, ""), { modelTier: "default", cache: false })` → JSON 하나를 받음
5. `kmCheck()`로 크몽 규칙 자동 점검 → 걸리면 **AI 지시문 ② 고치기**를 최대 2번
6. 이미지 그리기: 대표 이미지 1장(1304×976으로 그린 뒤 652×488로 줄임) → 상세 10장(가로 860px) → 미리보기 5장(860×1216, 목차 1 + 본문 4)
7. 등록 문구 6칸(제목·다른 안·서비스 설명·FAQ·전체 목차·검색 키워드)을 화면과 ZIP에 넣음

---

## 2. AI 지시문 ① 생성 (`kmPrompt`) · 원본 그대로

`${...}` 자리는 생성기가 채우는 값이에요(3장에서 설명). JSON만 받도록 `sample.json`으로 호출해요.

```js
  function kmPrompt(I, extra) {
    const sp = spData ? JSON.stringify({ hero: spData.hero, story: spData.story, selfcheck: spData.selfcheck, reason: spData.reason, reality: spData.reality, diff: spData.diff, toc: spData.toc, honest: spData.honest, faq: spData.faq, price: { choice: spData.price?.choice, body: spData.price?.body } }).slice(0, 12000) : "";
    return `너는 크몽(kmong.com) 전자책 상세페이지를 만드는 카피라이터다. 아래 책 재료로 크몽 등록용 JSON 하나만 출력한다. 설명이나 코드블록 없이 JSON만.

[책]
제목: ${I.title || "(원고에서 찾기)"}
부제: ${I.subtitle || ""}
작가: ${I.author || ""}
주제·대상: ${I.topic || ""}
독자: ${I.reader || ""}
저자 이야기(사용자가 직접 쓴 것): ${I.story || "(없음)"}
실제 후기: ${I.reviews.length ? I.reviews.map((r, i) => `[${i}] "${r.quote}" - ${r.who}`).join(" / ") : "(없음)"}
목차:
${String(I.outline || I.chapters.join("\n")).slice(0, 4000)}
${sp ? `\n[09 상세페이지에서 만든 문장 · 1순위로 그대로 가져다 쓴다]\n${sp}\n` : ""}
[리서치 속 독자의 말]
${String(I.research || "").slice(0, 3000)}

[원고 발췌]
${spExcerpt(I.text || "", 9000)}

[구성 · 크몽 판매 상위 전자책 8개의 순서를 따른다]
thumb: l1, l2, l3 (대표 이미지 큰 글씨 3줄, 각 9자 이내, 독자가 겪는 문제나 깨달음. 강조할 단어 하나만 {g}단어{/g}로 감싼다), sub (핵심 키워드 + 형태, 16자 이내, 예: "현실창조 전자책")
p1 첫 장면: label (책 이름과 형태), h1 (장면 한 컷 2~3줄, 줄바꿈은 \\n, 각 줄 12자 이내), story (3~4문장, 마지막 문장이 책의 핵심 깨달음. 강조는 {g}{/g})
p2 이런 분께: h2 (2줄), checks (3~4개, 독자의 행동 묘사. 리서치 속 독자의 말을 다듬어서), result (2줄), notFor (권하지 않는 사람 2개)
p3 ${I.reviews.length ? "후기: h2 (2줄), picks (실제 후기 번호 배열, 최대 4개)" : "책 속 한 대목: h2 (2줄, 예: '이런 문장이\\n담겨 있습니다'), quote (원고 발췌에서 그대로 옮긴 가장 강한 대목 2~4문장. 한 글자도 바꾸지 않는다), why (이 대목이 독자에게 주는 것 한 줄)"}
p4 진짜 이유: h2 (3줄, 가운데 줄을 {g}{/g}), body (2~3문장), oldVoice (독자의 낡은 혼잣말 2개), verdict (2줄)
p5 비교표: h2 (2줄), rows (3개 {common: 흔한 조언, ours: 이 책의 방법}), faster (1~2줄)
p6 저자: h2 (2줄), timeline (3~4개 {label: 나이·기간·사건 같은 사실 단어, text}), wins (0~3개, 저자 이야기에 있는 것만). 저자 이야기가 없으면 1인칭 경험을 지어내지 말고 '왜 이 주제를 파게 됐나, 무엇을 모았나, 무엇을 확인했나' 3단으로 쓴다
p7 받는 것: h2 (2줄), items (3개 {big: 짧은 단어나 숫자, small: 설명}. 분량 칸은 생성기가 따로 넣으니 쓰지 않는다)
p8 핵심 목차: h2 (2줄), toc (6개 {part: 'PART 1' 같은 이름, title: 목차 제목 그대로})
p9 약속: hype (과장 문구 2개, 따옴표 포함), h2 (2줄), honest (한 줄), body (한 줄)
p10 마무리: choice1, choice2 (선택 질문 두 줄), body (2문장. 압박하지 말고 목차와 미리보기를 먼저 보라고 권한다)
title: 크몽 서비스 제목 10~30자. [핵심 키워드] + [누가 / 어떤 결과]. 특수문자는 : + - # / . ( ) 만
titleAlt: 제목 다른 안 하나
desc: 서비스 설명 300~500자, 핵심 키워드를 3번 이상
faq: 5개 {q, a}. 초보도 되나 / 해봤는데 안 됐다 / 분량과 소장 / 받는 방법 / 환불(크몽 환불 규정을 따르고, 파일을 받은 뒤에는 단순 변심 환불이 어렵다)
keywords: 검색 키워드 7개 배열

[크몽 규칙 · 반드시 지킨다]
- 금액, 무료·할인·저렴·가성비·이벤트, 보장·무조건·누구나·100%, 1위·베스트·최초·유일·최고·최대·제일·무제한 같은 말은 쓰지 않는다
- 연락처, 링크, 오픈채팅·DM 문의, 다른 판매처 이름은 쓰지 않는다
- 숫자·성과·후기는 재료에 있는 것만 쓴다. 지어내지 않는다
- 줄표(—)와 화살표(→)는 쓰지 않는다
- 말투는 09 상세페이지 문장이 있으면 그 말투, 없으면 '~합니다' 체
${extra || ""}`;
  }
```

### 2-1. 지시문 안 변수가 무엇으로 채워지나

| 자리 | 채우는 값 |
|---|---|
| `I.title` / `I.subtitle` / `I.author` | 표지 단계에서 확정한 제목·부제·작가 (없으면 확정 표지 → 원고에서 추측) |
| `I.topic` | 01 팔리는 주제의 나와의 접점·대상·내 경험 + 02 확정 주제를 줄바꿈으로 묶음 |
| `I.reader` | 대상 좁히기 + 타깃 독자 칸 |
| `I.story` | 09 상세페이지의 '저자 이야기' 칸, 없으면 04 원고 집필의 '내 이야기' 칸 |
| `I.reviews` | 09의 '실제 후기' 칸 (한 줄에 하나, "후기 \| 누구") |
| `I.outline` / `I.chapters` | 03 목차 설계 결과 / 원고의 장 제목 |
| `sp` | 09에서 만든 상세페이지 JSON 중 hero·story·selfcheck·reason·reality·diff·toc·honest·faq·price(choice·body)만, 1만2천 자까지 |
| `I.research` | 02 리서치 보고서 앞 3천 자 |
| `spExcerpt(I.text, 9000)` | 원고를 장마다 앞부분을 고르게 잘라 9천 자 안으로 (`【장 제목】` 머리표를 붙임) |
| `extra` | 처음엔 빈칸, 고칠 때는 ② 지시문이 들어감 |

---

## 3. AI 지시문 ② 고치기 · 원본 그대로

①의 결과가 `kmCheck()`에 걸리면 같은 ① 지시문 끝(`extra` 자리)에 아래를 붙여 다시 보내요. 최대 2번.

```js
      const ask = async (extra) => { const d = await sample.json(kmPrompt(I, extra), { signal: kmCtl.signal, modelTier: "default", cache: false }); if (!d || typeof d !== "object" || Array.isArray(d)) throw { code: "empty_completion" }; return d; };
      let d = await ask(""), probs = kmCheck(d);
      for (let r = 0; probs.length && r < 2; r++) {
        kmUi(true, "크몽 규칙에 맞게 문구를 다듬는 중이에요.");
        d = await ask(`\n[이번 작업 · 고치기]\n아래 문제만 고친 전체 JSON을 다시 준다.\n${probs.map(p => "- " + p).join("\n")}\n지금 JSON:\n${JSON.stringify(d).slice(0, 30000)}\n`);
        probs = kmCheck(d);
      }
```

실제로 붙는 글 모양:

```
[이번 작업 · 고치기]
아래 문제만 고친 전체 JSON을 다시 준다.
- (kmCheck가 찾은 문제 한 줄씩)
지금 JSON:
(직전 JSON, 3만 자까지)
```

---

## 4. 자동 규칙 점검 (`kmCheck`) · 원본 그대로

AI 결과 JSON의 모든 글자를 모아서 아래를 검사해요. 걸린 문장이 그대로 ② 지시문의 문제 목록이 돼요.

```js
  const KM_BAN = [/최저가/, /무료/, /할인/, /저렴/, /가성비/, /부담\s?없는/, /이벤트/, /보장/, /무조건/, /누구나/, /100\s?%/, /5점\s?만점/, /1위/, /베스트/, /no\.?\s?1/i, /최초/, /유일/, /무한/, /무제한/, /최고/, /최대(?!한)/, /제일/, /오픈\s?채팅/, /DM/, /크레킷|crekit/i, /https?:|www\./];
  const kmState = noteFn("kmState");
  let kmData = null, kmBusy = false, kmCtl = null, kmPal = null, kmBook = "", kmImgs = {}, kmI = null;
  const kmStrings = (o, out = []) => { if (typeof o === "string") out.push(o); else if (Array.isArray(o)) o.forEach(x => kmStrings(x, out)); else if (o && typeof o === "object") Object.values(o).forEach(x => kmStrings(x, out)); return out; };
  function kmCheck(d) {
    const p = [], all = kmStrings(d).join("\n");
    KM_BAN.forEach(re => { const m = all.match(re); if (m) p.push(`크몽 금지 표현 '${m[0]}'이 들어 있다. 뜻은 살리고 다른 말로 바꾼다`); });
    if (/\d[\d,]*\s*원(?![가-힣])/.test(all)) p.push("금액(○○원)을 쓰지 않는다");
    if (/01[016789][-\s]?\d{3,4}[-\s]?\d{4}|@/.test(all)) p.push("연락처·아이디를 쓰지 않는다");
    const t = String(d.title || ""), n = [...t].length;
    if (n < 10 || n > 30) p.push(`title 은 10~30자 (지금 ${n}자)`);
    if (/[^가-힣ㄱ-ㅎa-zA-Z0-9\s:+\-#\/.()]/.test(t)) p.push("title 특수문자는 : + - # / . ( ) 만 쓴다");
    ["thumb", "p1", "p2", "p3", "p4", "p5", "p6", "p7", "p8", "p9", "p10"].forEach(k => { if (!d[k] || typeof d[k] !== "object") p.push(`${k} 칸이 비었다`); });
    if (!Array.isArray(d.faq) || d.faq.length < 4) p.push("faq 는 5개");
    return p;
  }
```

| 검사 | 걸렸을 때 AI에게 주는 문장 |
|---|---|
| 금지 표현 26개(위 `KM_BAN`) | `크몽 금지 표현 'OO'이 들어 있다. 뜻은 살리고 다른 말로 바꾼다` |
| 금액(○○원) | `금액(○○원)을 쓰지 않는다` |
| 전화번호·@ | `연락처·아이디를 쓰지 않는다` |
| 제목 10~30자 | `title 은 10~30자 (지금 N자)` |
| 제목 특수문자 | `title 특수문자는 : + - # / . ( ) 만 쓴다` |
| 칸 누락 | `thumb/p1~p10 칸이 비었다` |
| FAQ 4개 미만 | `faq 는 5개` |

---

## 5. 입력 재료 모으기 · 원본 그대로

### 5-1. `spInputs()` (09 상세페이지와 같이 씀)

```js
  function spInputs() {
    const g = guessTitle(), useGen = !spSrc, parts = useGen ? bookParts() : [];
    const title = (useGen && ((bookMeta.confirmed && bookMeta.title) || chosenCover?.title || g.title)) || "";
    const body = useGen ? (finalBook?.spec || bodySpecs[0] || null) : null;
    return {
      title, subtitle: useGen ? ((bookMeta.confirmed && bookMeta.subtitle) || chosenCover?.subtitle || g.subtitle || "") : "",
      author: useGen && bookMeta.confirmed ? bookMeta.author : "",
      topic: useGen ? [$("t_link")?.value, $("t_who")?.value, $("t_me")?.value, $("r_topic")?.value].map(x => (x || "").trim()).filter(Boolean).join("\n") : "",
      reader: useGen ? [$("t_who")?.value, $("reader")?.value].map(x => (x || "").trim()).filter(Boolean).join(" / ") : "",
      research: useGen ? (lastResearch || $("researchText")?.textContent || "").trim() : "",
      outline: useGen ? ($("tocText")?.textContent || "").trim() : "",
      chapters: parts.map(p => stripExtra(splitPart(p.title).title)),
      text: useGen ? currentBookText() : spSrc.text,
      images: useGen ? (coverBlob ? [coverBlob] : []) : spSrc.images,
      pages: useGen ? finalBook?.pages || 0 : 0,
      bodyTemplate: body?.template || "", coverTemplate: useGen ? chosenCover?.template || "" : "",
      story: $("spStory").value.trim() || (useGen ? ($("myStory")?.value || "").trim() : ""),
      price: $("spPrice").value.replace(/[^\d]/g, ""), was: $("spWas").value.replace(/[^\d]/g, ""),
      buyUrl: $("spBuy").value.trim(), reviews: $("spReviews").value.split("\n").map(l => l.trim()).filter(Boolean).map(l => { const [q, w] = l.split("|").map(x => x.trim()); return { quote: q, who: w || "" }; }),
      extra: $("spExtra").value.trim(), from: useGen ? "생성기에서 만든 책" : `올린 파일 · ${spSrc.name}`,
    };
  }
```

### 5-2. `spExcerpt()` · 긴 원고 줄이기

```js
  const SP_LIM = { text: 12000, research: 5000, outline: 3000 }, SP_LIM_SMALL = { text: 6000, research: 2500, outline: 1500, noEx: true };
  function spExcerpt(text, n) {
    if (text.length <= n) return text;
    let parts = []; try { parts = splitBookText(text); } catch (e) {}
    if (parts.length < 2) return text.slice(0, n);
    const each = Math.max(300, Math.floor(n / parts.length) - 40);
    return parts.map(p => `【${p.title}】\n${String(p.text || "").slice(0, each)}`).join("\n\n").slice(0, n);
  }
```

### 5-3. `spPickPalette()` · 색 고르기 (AI 안 씀)

```js
  async function spPickPalette(info) {
    const P = SP.palettes, ids = Object.keys(P).filter(k => k !== "_note");
    const user = $("spPalette").value;
    if (user && P[user]) return [user, "직접 고른 색"];
    const tpls = [info.bodyTemplate, info.coverTemplate].filter(Boolean);
    for (const t of tpls) { const eb = (String(t).match(/EB\d\d/) || [])[0]; if (eb && SP.ebMap[eb]) return [SP.ebMap[eb], `전자책 프리셋 ${eb}의 짝 (design.md 2-2)`]; }
    for (const t of tpls) { const n = (String(t).match(/^\s*(\d\d)\b/) || [])[1]; if (n && SP.tplMap[n]) return [SP.tplMap[n], `${t} 템플릿의 짝 (design.md 2-3)`]; }
    const pal = await coverPalette().catch(() => null), dark = pal ? lum(pal.bg || "#ffffff") < 0.35 : true;
    const text = [info.title, info.topic, info.reader].join(" ");
    const pool = ids.filter(k => !!P[k].light === !dark);
    const hit = pool.map(k => [k, (P[k].topics || []).filter(w => text.includes(w.replace(/\(.*\)/, ""))).length]).sort((a, b) => b[1] - a[1])[0];
    if (hit && hit[1] > 0) return [hit[0], `주제가 '${P[hit[0]].topics.join(", ")}' 쪽이라서 (design.md 2-1)`];
    if (pal?.accent) {
      const A = hsl(pal.accent), dh = (x, y) => { const d = Math.abs(x - y) % 360; return Math.min(d, 360 - d); };
      const near = pool.map(k => [k, dh(hsl(P[k].accent).h, A.h)]).sort((a, b) => a[1] - b[1])[0];
      return [near[0], `표지 강조색과 가장 가까운 ${dark ? "어두운" : "밝은"} 팔레트`];
    }
    return [dark ? "midnight-gold" : "ivory-red", "기본 팔레트"];
  }

```

### 5-4. `maBookImage()` · 책 목업 이미지

```js
  async function maBookImage() {
    const src = finalCoverSource();
    let blob = null;
    try { blob = src ? (src.kind === "spec" ? await mockPng(src.sp) : await canvasBlob(await uploadedMock(src.blob))) : (spSrc?.images?.[0] || null); } catch (e) { blob = src?.blob || null; }
    if (!blob) return "";
    try { return await blobToUrl(await shrink(blob, 600)); } catch (e) { return ""; }
  }
```

팔레트 색값 전체는 같은 폴더의 `팔레트_색값.json`에 따로 뽑아 뒀어요 (18종).

---

## 6. 이미지 틀 · 원본 그대로

### 6-1. 공통 CSS (`kmCss`) · 팔레트 값 P가 들어감

```js
  const kmG = (s) => hesc(s || "").replace(/\{g\}(.*?)\{\/g\}/g, '<span class="g">$1</span>').replace(/\{\/?g\}/g, "").replace(/\\n|\n/g, "<br>");
  const kmA = (x) => Array.isArray(x) ? x : [];
  function kmCss(P) {
    const A = P.accentHi || P.accent;
    return `*{box-sizing:border-box}html,body{margin:0}body{font-family:"Noto Sans KR",sans-serif;word-break:keep-all;color:${P.text};background:${P.bg}}
.p{width:860px;padding:84px 64px;background:${P.bg}}.p.deep{background:${P.bg2 || P.bg}}.g{color:${A}}
h1{margin:0;font-size:58px;font-weight:900;line-height:1.28;letter-spacing:-2px}h2{margin:0;font-size:44px;font-weight:900;line-height:1.34;letter-spacing:-1.5px}
.lbl{display:block;margin-bottom:22px;color:${A};font-size:18px;font-weight:700}
.tx{margin:28px 0 0;color:${P.text2};font-size:21px;line-height:1.9}
.bk{display:block;margin:44px auto 0;width:50%}
.ck{display:flex;gap:16px;align-items:center;margin-top:12px;padding:22px 24px;background:${P.accentSoft};border:1px solid ${P.accent};font-size:21px;font-weight:700;line-height:1.5}
.ck i{flex:0 0 26px;height:26px;background:${P.accent};position:relative}.ck i:after{content:"";position:absolute;left:9px;top:4px;width:6px;height:12px;border:solid ${P.accentInk || "#111"};border-width:0 3px 3px 0;transform:rotate(45deg)}
.res{margin:26px 0 0;font-size:22px;font-weight:700;line-height:1.7}
.no{margin-top:46px;padding-top:32px;border-top:1px solid ${P.line2}}.no h3{margin:0 0 12px;font-size:24px}.no div{color:${P.text2};font-size:20px;line-height:1.85}
.q{margin-top:40px;padding:32px;border-left:5px solid ${P.accent};background:${P.bg3 || P.bg2};font-size:23px;line-height:1.85;font-weight:500}
.rv{margin-top:14px;padding:26px 28px;background:${P.bg3 || P.bg2};border:1px solid ${P.line}}.rv b{color:${A};letter-spacing:3px}.rv p{margin:10px 0 6px;font-size:20px;line-height:1.8}.rv small{color:${P.text3};font-size:16px}
.ov{margin:26px 0;display:grid;gap:10px}.ov div{padding:13px 20px;border-left:3px solid ${P.line2};color:${P.text3};font-size:21px;font-weight:700}
.vd{margin:0;font-size:29px;font-weight:900;line-height:1.55}
table{width:100%;border-collapse:collapse;margin-top:40px}th{padding:16px;text-align:left;font-size:18px;color:${P.text3};border-bottom:1px solid ${P.line2}}th.us{background:${P.accent};color:${P.accentInk || "#111"}}
td{padding:22px 16px;border-bottom:1px solid ${P.line};font-size:20px;line-height:1.55;vertical-align:top}td.c{color:${P.text3};width:44%}td.us{font-weight:900;background:${P.accentSoft}}
.fs{margin:40px 0 0;font-size:24px;font-weight:700;line-height:1.7}
.tl{margin-top:38px;border-left:1px solid ${P.line2}}.tl>div{position:relative;padding:0 0 30px 34px}.tl>div:before{content:"";position:absolute;left:-8px;top:8px;width:15px;height:15px;background:${P.accent}}
.tl b{display:block;color:${A};font-size:17px;margin-bottom:4px}.tl span{color:${P.text2};font-size:20px;line-height:1.8}
.wn{margin-top:6px}.wn div{padding:10px 0;border-bottom:1px solid ${P.line};font-size:19px;font-weight:700}
.gt{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-top:38px}.gt div{padding:26px 24px;background:${P.bg3 || P.bg2};border:1px solid ${P.line}}.gt b{display:block;color:${A};font-size:32px;font-weight:900}.gt span{color:${P.text2};font-size:18px}
.toc{margin-top:38px;border-top:1px solid ${P.line2}}.toc div{display:flex;gap:20px;padding:20px 0;border-bottom:1px solid ${P.line};font-size:21px;font-weight:700;line-height:1.5}.toc small{flex:0 0 100px;color:${A};font-size:16px;padding-top:4px}
.ct{text-align:center}.hy span{display:inline-block;margin:0 5px 10px;padding:11px 18px;border:1px dashed ${P.line2};color:${P.text3};font-size:19px;text-decoration:line-through}
.hn{margin:28px auto 0;max-width:20em;font-size:28px;font-weight:900;line-height:1.55}
.chq{margin:0;font-size:40px;font-weight:900;line-height:1.4;letter-spacing:-1.5px}.chq span{display:block;color:${P.text3}}
.th{position:relative;width:1304px;height:976px;overflow:hidden}.th .sf{position:absolute;inset:100px;display:flex;gap:60px;align-items:center}
.th .tt{flex:1.2;font-size:84px;font-weight:900;line-height:1.24;letter-spacing:-3px}.th .su{margin-top:34px;font-size:36px;font-weight:700;opacity:.85}
.th .bx{flex:.8;position:relative}.th .bx img{width:100%}.th .bd{position:absolute;right:-10px;top:-10px;width:150px;height:150px;border-radius:50%;display:flex;align-items:center;justify-content:center;text-align:center;font-weight:900;font-size:30px;line-height:1.15}
.pg{width:860px;height:1216px;background:#fffdf8;color:#1d1d1f;padding:96px 88px;overflow:hidden}.pg h3{margin:0 0 30px;font-size:34px;font-weight:900;padding-bottom:16px;border-bottom:3px solid ${P.accent}}
.pg p{margin:0 0 16px;font-size:21px;line-height:1.9}.pg .tc div{padding:12px 0;border-bottom:1px solid #e6e1d6;font-size:21px}`;
  }
```

### 6-2. 분량 칸 · 상세 10장 · 대표 이미지 · 미리보기 (`kmPages`, `kmPanels`, `kmThumb`, `kmPreviewPages`)

```js
  function kmPages(I) {
    const pages = I.pages || 0, est = Math.max(1, Math.round(String(I.text || "").replace(/\s+/g, "").length / 900));
    return pages ? { big: `${pages}쪽`, small: "PDF 전자책" } : { big: `${est}쪽`, small: "PDF 전자책 (A4 기준)" };
  }
  function kmPanels(d, I) {
    const B = kmBook ? `<img class="bk" src="${kmBook}">` : "", o = (k) => d[k] || {};
    const p1 = o("p1"), p2 = o("p2"), p3 = o("p3"), p4 = o("p4"), p5 = o("p5"), p6 = o("p6"), p7 = o("p7"), p8 = o("p8"), p9 = o("p9"), p10 = o("p10");
    let rv = [];
    if (I.reviews.length) { rv = kmA(p3.picks).map(i => I.reviews[Number(i)]).filter(Boolean); if (!rv.length) rv = I.reviews; rv = rv.slice(0, 4); }
    const pg = kmPages(I);
    return [
      ["", `<span class="lbl">${hesc(p1.label || I.title)}</span><h1>${kmG(p1.h1)}</h1><p class="tx">${kmG(p1.story)}</p>${B}`],
      ["deep", `<h2>${kmG(p2.h2 || "혹시,\n당신 이야기인가요?")}</h2>${kmA(p2.checks).map(c => `<div class="ck"><i></i>${kmG(c)}</div>`).join("")}<p class="res">${kmG(p2.result)}</p>${kmA(p2.notFor).length ? `<div class="no"><h3>이런 분께는 권하지 않습니다</h3>${kmA(p2.notFor).map(x => `<div>· ${kmG(x)}</div>`).join("")}</div>` : ""}`],
      ["", `<h2>${kmG(p3.h2 || (rv.length ? "먼저 읽은 분들의\n이야기" : "이런 문장이\n담겨 있습니다"))}</h2>${rv.length ? rv.map(r => `<div class="rv"><b>★★★★★</b><p>"${hesc(r.quote)}"</p><small>${hesc(r.who)}</small></div>`).join("") : `<div class="q">${kmG(p3.quote)}</div>${p3.why ? `<p class="tx">${kmG(p3.why)}</p>` : ""}`}`],
      ["deep", `<h2>${kmG(p4.h2)}</h2><p class="tx">${kmG(p4.body)}</p><div class="ov">${kmA(p4.oldVoice).map(v => `<div>${kmG(v)}</div>`).join("")}</div><p class="vd">${kmG(p4.verdict)}</p>`],
      ["", `<h2>${kmG(p5.h2)}</h2><table><tr><th>흔한 조언</th><th class="us">${hesc(I.title || "이 책")}</th></tr>${kmA(p5.rows).map(r => `<tr><td class="c">${kmG(r.common)}</td><td class="us">${kmG(r.ours)}</td></tr>`).join("")}</table>${p5.faster ? `<p class="fs">${kmG(p5.faster)}</p>` : ""}`],
      ["deep", `<h2>${kmG(p6.h2)}</h2><div class="tl">${kmA(p6.timeline).map(t => `<div><b>${hesc(t.label)}</b><span>${kmG(t.text)}</span></div>`).join("")}</div>${kmA(p6.wins).length ? `<div class="wn">${kmA(p6.wins).map(w => `<div>${kmG(w)}</div>`).join("")}</div>` : ""}`],
      ["", `<h2>${kmG(p7.h2 || "구매하면 바로\n이것을 받습니다")}</h2><div class="gt"><div><b>${hesc(pg.big)}</b><span>${hesc(pg.small)}</span></div>${kmA(p7.items).slice(0, 3).map(t => `<div><b>${hesc(t.big)}</b><span>${kmG(t.small)}</span></div>`).join("")}</div>${B}`],
      ["deep", `<h2>${kmG(p8.h2 || "핵심\n목차")}</h2><div class="toc">${kmA(p8.toc).slice(0, 7).map(t => `<div><small>${hesc(t.part)}</small>${kmG(t.title)}</div>`).join("")}</div>`],
      ["ct", `<div class="hy">${kmA(p9.hype).map(h => `<span>${hesc(h)}</span>`).join("")}</div><h2>${kmG(p9.h2 || "이런 말로\n현혹하지 않겠습니다.")}</h2><p class="hn">${kmG(p9.honest)}</p><p class="tx">${kmG(p9.body)}</p>`],
      ["deep", `<p class="chq">${kmG(p10.choice1)}<span>${kmG(p10.choice2)}</span></p><p class="tx">${kmG(p10.body)}</p>${B}`],
    ];
  }
  function kmThumb(d, I, P) {
    const t = d.thumb || {}, dark = !P.light, bg = dark ? (P.bg3 || P.bg2 || P.bg) : P.text, fg = dark ? P.text : P.bg, pg = kmPages(I);
    return `<div class="th" style="background:${bg};color:${fg}"><div class="sf"><div class="tt">${[t.l1, t.l2, t.l3].filter(Boolean).map(kmG).join("<br>")}<div class="su">${kmG(t.sub)}</div></div>${kmBook ? `<div class="bx"><img src="${kmBook}"><div class="bd" style="background:${P.accent};color:${P.accentInk || "#111"}">${hesc(pg.big)}<br>PDF</div></div>` : ""}</div></div>`;
  }
  function kmPreviewPages(I) {
    const toc = String(I.outline || I.chapters.join("\n")).split("\n").map(s => s.trim()).filter(Boolean).slice(0, 22);
    const paras = String(I.text || "").split(/\n+/).map(s => s.trim()).filter(s => s.length > 1);
    const out = [`<div class="pg"><h3>목차</h3><div class="tc">${toc.map(t => `<div>${hesc(t)}</div>`).join("")}</div></div>`];
    let i = 0;
    for (let n = 0; n < 4 && i < paras.length; n++) {
      let body = "", len = 0;
      while (i < paras.length && len < 1380) {
        const s = paras[i], head = s.length < 40 && !/[.?!다요]$/.test(s), room = 1450 - len;
        if (head) { if (room < 260) break; body += `<h3>${hesc(s)}</h3>`; len += 120; i++; continue; }
        if (s.length <= room) { body += `<p>${hesc(s)}</p>`; len += s.length; i++; continue; }
        const cut = s.lastIndexOf(" ", room) > room * 0.6 ? s.lastIndexOf(" ", room) : room;
        body += `<p>${hesc(s.slice(0, cut))}</p>`; paras[i] = s.slice(cut).trim(); len = 1450;
      }
      out.push(`<div class="pg">${body}</div>`);
    }
    return out;
  }
```

### 6-3. 그리기·크기 (`kmRender`, `kmShrinkTo`, `kmRenderAll`)

```js
  async function kmRender(inner, P, W, H) {
    await loadScript(CDN.h2c); maFontLink();
    const html = `<!doctype html><html><head><meta charset="utf-8"><link rel="stylesheet" href="${MA_FONT}"><style>${kmCss(P)}</style></head><body>${inner}</body></html>`;
    const fr = mk("iframe", `position:fixed;left:-20000px;top:0;width:${W}px;height:${H || 3200}px;border:0;`);
    document.body.appendChild(fr);
    try {
      await new Promise(r => { fr.onload = r; fr.srcdoc = html; });
      const doc = fr.contentDocument, el = doc.body.firstElementChild, txt = [...new Set(doc.body.textContent)].join("") || "가";
      await Promise.all(["400", "500", "700", "900"].flatMap(w => [doc, document].map(x => x.fonts?.load(`${w} 40px "Noto Sans KR"`, txt).catch(() => {}))));
      await doc.fonts?.ready; await Promise.all([...doc.images].map(im => im.complete ? 0 : new Promise(r => { im.onload = im.onerror = r; })));
      await new Promise(r => setTimeout(r, 250));
      const h = H || Math.ceil(el.getBoundingClientRect().height);
      fr.style.height = h + "px";
      const c = await window.html2canvas(el, { scale: 1, width: W, height: h, windowWidth: W, windowHeight: h, backgroundColor: null, logging: false, useCORS: true });
      return await canvasBlob(c, "image/jpeg", 0.9);
    } finally { fr.remove(); }
  }
  async function kmShrinkTo(blob, W, H) {
    const img = await createImageBitmap(blob), c = document.createElement("canvas"); c.width = W; c.height = H;
    c.getContext("2d").drawImage(img, 0, 0, W, H); return canvasBlob(c, "image/jpeg", 0.92);
  }
  async function kmRenderAll(I) {
    const P = kmPal;
    kmImgs.thumb = await kmShrinkTo(await kmRender(kmThumb(kmData, I, P), P, 1304, 976), 652, 488); kmDraw(I);
    const panels = kmPanels(kmData, I);
    for (let i = 0; i < panels.length; i++) {
      if (kmCtl?.signal.aborted) return;
      kmUi(true, `상세 이미지를 그리는 중이에요 (${i + 1}/10)`);
      const [cls, body] = panels[i];
      kmImgs["p" + (i + 1)] = await kmRender(`<section class="p ${cls === "ct" ? "ct" : cls}">${body}</section>`, P, 860, 0); kmDraw(I);
    }
    const pv = kmPreviewPages(I);
    for (let i = 0; i < pv.length; i++) {
      if (kmCtl?.signal.aborted) return;
      kmUi(true, `미리보기 이미지를 그리는 중이에요 (${i + 1}/${pv.length})`);
      kmImgs["v" + (i + 1)] = await kmRender(pv[i], P, 860, 1216); kmDraw(I);
    }
  }
```

| 이미지 | 그리는 크기 | 저장 크기 | 파일 이름 |
|---|---|---|---|
| 대표 이미지 | 1304×976 | 652×488 (4:3) JPG | `00_대표이미지_652x488.jpg` |
| 상세 10장 | 가로 860, 세로는 내용만큼 | 그대로 JPG(품질 0.9) | `상세_01_첫 장면.jpg` … `상세_10_마무리.jpg` |
| 미리보기 | 860×1216 (목차 1 + 본문 4) | 그대로 JPG | `미리보기_1.jpg` … `미리보기_5.jpg` |

---

## 7. 등록 문구 · 화면 · ZIP · 실행 · 원본 그대로

```js
  const kmUrls = {};
  const kmUrl = (k) => { const b = kmImgs[k]; if (!b) return ""; if (kmUrls[k]?.b !== b) { if (kmUrls[k]) URL.revokeObjectURL(kmUrls[k].u); kmUrls[k] = { b, u: URL.createObjectURL(b) }; } return kmUrls[k].u; };
  const KM_NAMES = ["첫 장면", "이런 분께", "증거", "진짜 이유", "비교표", "저자", "받는 것", "핵심 목차", "약속", "마무리"];
  function kmTextBlocks(d, I) {
    const faq = kmA(d.faq).map(f => `Q. ${f.q}\nA. ${f.a}`).join("\n\n");
    const toc = String(I.outline || I.chapters.join("\n")).trim();
    return [["제목", `${d.title || ""}`], ["제목 다른 안", d.titleAlt || ""], ["서비스 설명", d.desc || ""], ["자주 묻는 질문", faq], ["전체 목차 (목차 칸)", toc], ["검색 키워드", kmA(d.keywords).join(", ")]].filter(x => x[1]);
  }
  function kmDraw(I) {
    $("kmOut").hidden = !kmData;
    if (!kmData) return;
    $("kmThumb").innerHTML = kmImgs.thumb ? `<img src="${kmUrl("thumb")}" alt="대표 이미지" style="width:100%;max-width:652px;border-radius:8px;display:block">` : `<div class="ma-ph" style="aspect-ratio:4/3;max-width:652px">그리는 중…</div>`;
    $("kmGrid").innerHTML = KM_NAMES.map((n, i) => `<div class="ma-card">${kmImgs["p" + (i + 1)] ? `<img src="${kmUrl("p" + (i + 1))}" alt="${n}" style="aspect-ratio:auto;object-fit:contain">` : `<div class="ma-ph">그리는 중…</div>`}<div class="ma-tag">${String(i + 1).padStart(2, "0")} ${n}</div></div>`).join("");
    $("kmPrev").innerHTML = [1, 2, 3, 4, 5].filter(i => kmImgs["v" + i] || kmBusy).map(i => `<div class="ma-card">${kmImgs["v" + i] ? `<img src="${kmUrl("v" + i)}" alt="미리보기 ${i}" style="aspect-ratio:auto;object-fit:contain">` : `<div class="ma-ph">그리는 중…</div>`}<div class="ma-tag">미리보기 ${i}${i === 1 ? " · 목차" : ""}</div></div>`).join("");
    $("kmTexts").innerHTML = kmTextBlocks(kmData, I || kmI).map(([k, v], i) => `<div class="mp-box"><div class="mp-head"><strong>${hesc(k)}</strong><button class="btn ghost" type="button" data-kmcopy="${i}">복사</button></div><pre class="result">${hesc(v)}</pre></div>`).join("");
  }
  $("kmTexts").addEventListener("click", async (ev) => {
    const b = ev.target.closest("[data-kmcopy]"); if (!b || !kmData) return;
    const v = kmTextBlocks(kmData, kmI)[Number(b.dataset.kmcopy)]?.[1] || "";
    try { await navigator.clipboard.writeText(v); b.textContent = "복사됨"; } catch (e) { const pre = b.closest(".mp-box").querySelector("pre"); const r = document.createRange(); r.selectNodeContents(pre); const s = getSelection(); s.removeAllRanges(); s.addRange(r); b.textContent = "선택됨 · Ctrl+C"; }
    setTimeout(() => { b.textContent = "복사"; }, 1600);
  });
  function kmUi(busy, msg) { $("goKmong").disabled = busy; $("stopKmong").hidden = !busy; $("kmWait").hidden = !busy; if (msg) $("kmWaitText").textContent = msg; if ($("kmZip")) $("kmZip").disabled = busy; }
  async function kmRun() {
    if (kmBusy) return;
    const I = spInputs(); kmI = I;
    if (!I.text && !I.images.length) { kmState("아직 책이 없어요. 앞 단계에서 원고를 만들거나, 09 상세페이지 탭에서 원고 파일을 올려 주세요.", "err"); return; }
    const sample = await samplePromise;
    if (!sample) { kmState("이 화면에서는 AI 생성을 쓸 수 없어요. 맨 위 안내대로 다른 브라우저에서 열어주세요.", "err"); return; }
    kmBusy = true; kmCtl = new AbortController(); kmState("");
    kmUi(true, "책을 읽고 크몽용 문구를 쓰고 있어요. 2~3분쯤 걸려요. 이 화면을 닫지 말고 기다려 주세요.");
    try {
      const palId = spPal && SP?.palettes?.[spPal] ? spPal : (await spPickPalette(I))[0];
      kmPal = SP.palettes[palId] || SP.palettes["midnight-gold"];
      kmBook = await maBookImage();
      const ask = async (extra) => { const d = await sample.json(kmPrompt(I, extra), { signal: kmCtl.signal, modelTier: "default", cache: false }); if (!d || typeof d !== "object" || Array.isArray(d)) throw { code: "empty_completion" }; return d; };
      let d = await ask(""), probs = kmCheck(d);
      for (let r = 0; probs.length && r < 2; r++) {
        kmUi(true, "크몽 규칙에 맞게 문구를 다듬는 중이에요.");
        d = await ask(`\n[이번 작업 · 고치기]\n아래 문제만 고친 전체 JSON을 다시 준다.\n${probs.map(p => "- " + p).join("\n")}\n지금 JSON:\n${JSON.stringify(d).slice(0, 30000)}\n`);
        probs = kmCheck(d);
      }
      kmData = d; kmImgs = {}; kmDraw(I);
      await kmRenderAll(I);
      kmDraw(I);
      if (!kmCtl.signal.aborted) kmState("크몽 상세페이지가 완성됐어요. '전체 받기'로 받아서 크몽 등록 화면에 순서대로 올리세요.", "ok");
    } catch (e) {
      kmState(e?.name === "AbortError" ? "멈췄어요." : e?.code === "invalid_json" || e?.code === "empty_completion" ? "결과가 깨졌어요. 한 번만 다시 눌러 주세요." : (ERR[e?.code] || "만들지 못했어요. 잠시 뒤 다시 눌러 주세요."), e?.name === "AbortError" ? "" : "err");
    } finally { kmBusy = false; kmUi(false); kmDraw(I); }
  }
  async function kmZipBlob() {
    await loadScript(CDN.jszip);
    const I = kmI, zip = new window.JSZip(), root = zip.folder(`크몽_${spSlug(I?.title || kmData?.title)}`);
    if (kmImgs.thumb) root.file("00_대표이미지_652x488.jpg", kmImgs.thumb);
    for (let i = 1; i <= 10; i++) if (kmImgs["p" + i]) root.file(`상세_${String(i).padStart(2, "0")}_${KM_NAMES[i - 1]}.jpg`, kmImgs["p" + i]);
    for (let i = 1; i <= 5; i++) if (kmImgs["v" + i]) root.file(`미리보기_${i}.jpg`, kmImgs["v" + i]);
    root.file("크몽_등록문구.txt", kmTextBlocks(kmData, I).map(([k, v]) => `[${k}]\n${v}`).join("\n\n"));
    return zip.generateAsync({ type: "blob" });
  }
  $("kmZip").addEventListener("click", async () => {
    if (!kmData) return; kmState("파일을 묶는 중…");
    try { await saveTo(`${spSlug(kmI?.title || kmData.title)}_10_크몽상세페이지.zip`, await kmZipBlob(), kmState); } catch (e) { kmState("파일을 만들지 못했어요. 다시 눌러 주세요.", "err"); }
  });
  $("goKmong").addEventListener("click", () => kmRun());
  $("stopKmong").addEventListener("click", () => kmCtl?.abort());
```

---

## 8. 화면 문구 · 크몽 규칙 점검표 · '제목·문구 점검' 버튼 · 원본 그대로

'제목·문구 점검'은 AI를 쓰지 않고 금지어 목록(`BAN`, 34개)으로만 검사해요.

```html
    <div id="kmongPane" class="pane" hidden>
      <div class="final-head">
        <div class="eyebrow" style="margin:0">크몽 상세페이지</div>
        <div class="final-title">크몽에 올릴 판매 페이지를 만들어요</div>
        <div class="final-sub">09에서 만든 상세페이지는 크레킷용 코드예요. 크몽은 코드를 못 넣고 이미지와 글만 올릴 수 있어서, 같은 책을 크몽 규칙에 맞는 이미지 세트와 등록 문구로 다시 만들어요. 아래 '크몽 상세페이지 만들기'를 누르면 대표 이미지, 상세 이미지 10장, 미리보기 5장, 등록 문구까지 한 번에 나와요.</div>
      </div>

      <div class="sl-info">
        <b>만들어질 것</b><br>
        · 대표 이미지 1장 (652×488, 4:3) · 크몽 목록에 보이는 첫 얼굴<br>
        · 상세 이미지 10장 (첫 장면 · 이런 분께 · 증거 · 진짜 이유 · 비교표 · 저자 · 받는 것 · 핵심 목차 · 약속 · 마무리)<br>
        · 미리보기 이미지 5장 이상 (목차 1장 + 본문 4장, 가림 없이)<br>
        · 등록 문구: 제목(10~30자) · 서비스 설명 · 패키지 · 자주 묻는 질문 · 전체 목차 · 검색 키워드<br>· 수강생이 고칠 칸 없이 완성본으로 나와요. 규칙에 걸리는 문장은 생성할 때 알아서 바꿔 써요
      </div>

      <div class="sp-gate">
        <div class="sp-gate-title">크몽 규칙 점검표 (2026-11-23 확인)</div>
        <div class="sp-row"><b>제목</b><span>10~30자. 특수문자는 : + - # / . ( ) 만. 외부 연락처, 무료·할인·가성비 같은 가격 표현, 1위·베스트·최초·유일 같은 검증 안 되는 표현 금지</span></div>
        <div class="sp-row"><b>대표 이미지</b><span>652×488(4:3), JPG·PNG, 흰 배경 말고 색 배경, 글자는 가장자리에서 50px 안쪽. 무료·할인·최고·1위·100% 금지, 다른 상품과 같은 이미지 금지</span></div>
        <div class="sp-row"><b>상세 이미지</b><span>공식 규격 숫자가 없어요. 가로 860px로 만들고 바꿀 수 있게 둬요. 연락처·외부 링크·QR 금지, 캡처 속 개인정보는 가려서 넣어요</span></div>
        <div class="sp-row"><b>미리보기</b><span>5장 이상, 한 장씩 따로. 모자이크·블러 금지. 목차·미리보기가 실제 책과 다르면 환불·판매 중지 사유</span></div>
        <div class="sp-row"><b>책 파일</b><span>표지·목차 빼고 A4 세로 20쪽 이상, 12pt·줄간격 1.5, 이미지·여백 30% 미만. 워터마크와 저작권 문구, 수정 제한. PDF·DOCX·HWP·PPT, 파일당 200MB</span></div>
        <div class="sp-row"><b>후기</b><span>임시 후기·지어낸 후기 금지 (거짓 후기 = 운영정책 위반). 크몽 후기는 크몽 안에서만 쌓여요</span></div>
        <div class="sp-row"><b>할인 표시</b><span>할인을 보여 주려면 기준가·기간·실제 할인율까지 함께</span></div>
        <div class="sp-row"><b>AI 인물</b><span>AI로 만든 사람 사진을 후기·추천에 쓰면 이미지에 [가상인물], 제목에 [가상인물 포함] (2026.6.1부터)</span></div>
        <div class="sp-row"><b>가격·심사</b><span>전자책 최소 10,000원, 패키지 최대 3개(1만 원 이상 차이). 심사 영업일 7일 이내</span></div>
      </div>

      <div class="field">
        <label class="lbl" for="kmCheckText">제목·문구 점검 <small>크몽에 넣을 제목이나 문구를 붙여넣으면 걸리는 표현을 찾아줘요</small></label>
        <textarea id="kmCheckText" style="min-height:90px" placeholder="예: 무의식 습관을 바꾸는 현실창조 전자책"></textarea>
        <button class="btn secondary" id="kmCheckGo" type="button">규칙 점검하기</button>
        <div class="sl-info" id="kmCheckOut" hidden></div>
      </div>

      <div class="sl-wait" id="kmWait" hidden><span class="sl-dot"></span><span id="kmWaitText">크몽 상세페이지를 만들고 있어요.</span></div>
      <p class="note" id="kmState" hidden></p>
      <div id="kmOut" hidden>
        <button class="btn sl-copy" id="kmZip" type="button">전체 받기 (이미지 + 등록 문구 ZIP)</button>
        <div class="eyebrow" style="margin:14px 0 0">대표 이미지 (652×488)</div>
        <div id="kmThumb" style="margin:10px 0"></div>
        <div class="eyebrow" style="margin:14px 0 0">상세 이미지 10장 · 순서대로 올리세요</div>
        <div class="ma-grid" id="kmGrid"></div>
        <div class="eyebrow" style="margin:14px 0 0">미리보기 이미지 5장 · 한 장씩 따로 올리세요</div>
        <div class="ma-grid" id="kmPrev"></div>
        <div class="eyebrow" style="margin:18px 0 6px">크몽 등록 칸에 넣을 글</div>
        <div id="kmTexts" style="display:flex;flex-direction:column;gap:12px"></div>
      </div>
      <div class="draft-actions single" style="margin:6px 0;">
        <button class="btn" id="goKmong" type="button">크몽 상세페이지 만들기</button>
        <button class="btn ghost" id="stopKmong" type="button" hidden>멈추기</button>
      </div>
      <p class="attach-note">출처: 크몽 서비스 등록 화면(제목 규칙), 전문가센터 메인이미지 가이드·전자책 제작 가이드·등록 가이드, 운영정책. 상세 이미지 크기와 검색 태그 개수는 공식 숫자를 못 찾아서 등록할 때 화면에서 한 번 더 확인해요.</p>
    </div>
<script>
(function(){
  const BAN = [
    ["최저가","가격 표현"],["무료","가격 표현"],["할인","가격 표현"],["저렴","가격 표현"],["가성비","가격 표현"],["부담 없는","가격 표현"],["이벤트","과장 표현"],
    ["매출 보장","과장 표현"],["수익 보장","과장 표현"],["환불 보장","과장 표현"],["보장","과장 표현"],["무조건","과장 표현"],["누구나","과장 표현"],["확정 수익","과장 표현"],
    ["100%","과장 표현"],["5점 만점","과장 표현"],["만족도","과장 표현"],["1위","검증 안 되는 표현"],["베스트","검증 안 되는 표현"],["no.1","검증 안 되는 표현"],
    ["최초","검증 안 되는 표현"],["유일","검증 안 되는 표현"],["무한","검증 안 되는 표현"],["무제한","검증 안 되는 표현"],["최고","검증 안 되는 표현"],["최대","검증 안 되는 표현"],["제일","검증 안 되는 표현"],
    ["오픈채팅","외부 연락처"],["카톡","외부 연락처"],["카카오톡","외부 연락처"],["dm","외부 연락처"],["인스타","외부 연락처"],["crekit","외부 링크"],["크레킷","외부 링크"]
  ];
  const $k = id => document.getElementById(id);
  const esc = s => s.replace(/[&<>]/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;"}[c]));
  $k("kmCheckGo").addEventListener("click", () => {
    const t = $k("kmCheckText").value.trim(), out = $k("kmCheckOut");
    out.hidden = false;
    if (!t) { out.textContent = "점검할 글을 넣어 주세요."; return; }
    const low = t.toLowerCase(), hits = [];
    BAN.forEach(([w, why]) => { if (low.includes(w)) hits.push(`'${w}' · ${why}`); });
    if (/https?:\/\/|www\.|\.com|\.kr|\.io/.test(low)) hits.push("주소(URL) · 외부 링크 금지");
    if (/01[016789][-\s]?\d{3,4}[-\s]?\d{4}/.test(t)) hits.push("전화번호 · 외부 연락처 금지");
    if (/@/.test(t)) hits.push("@ (이메일·SNS 아이디) · 외부 연락처 금지");
    if (/\d{1,3}(,\d{3})+원|\d+원/.test(t)) hits.push("금액 · 제목과 대표 이미지에는 가격을 쓰지 않아요");
    if (/가상인물|ai 모델|ai 인물/.test(low) && !/\[가상인물/.test(t)) hits.push("AI 인물 · [가상인물] 표시 필요");
    const lines = t.split(/\n/).filter(Boolean), one = lines.length === 1;
    let head = "";
    if (one) {
      const n = [...t].length, bad = t.replace(/[가-힣ㄱ-ㅎa-zA-Z0-9\s:+\-#\/.()]/g, "");
      head = `<b>제목으로 보면</b> ${n}자 ` + (n < 10 ? "· 10자 이상이어야 해요" : n > 30 ? "· 30자를 넘어요" : "· 길이 통과") +
        (bad ? `<br>쓸 수 없는 특수문자: ${esc([...new Set(bad)].join(" "))}` : "") + "<br>";
    }
    out.innerHTML = head + (hits.length ? `<b>걸리는 표현 ${hits.length}개</b><br>` + hits.map(h => "· " + esc(h)).join("<br>")
      : "<b>걸리는 표현 없음</b>");
  });
})();
</script>
```

---

## 9. 같이 알아 둘 것

- 이 기능은 **09 상세페이지**를 먼저 만들었으면 그 문장을 1순위로 가져다 써요(`spData`). 09의 지시문(`spPrompt`, ebook-salespage 스킬 문서 전체를 넣는 긴 지시문)은 09 기능 것이라 이 문서에는 넣지 않았어요. 필요하면 따로 뽑아 드릴게요.
- 후기는 사용자가 넣은 실제 후기만 써요. 없으면 후기 칸 대신 '책 속 한 대목'(원고 그대로 인용) 페이지로 바뀌어요.
- 저자 이야기가 없으면 1인칭 경험을 지어내지 않고 '왜 이 주제를 파게 됐나 → 무엇을 모았나 → 무엇을 확인했나' 3단으로 쓰게 돼 있어요.
- 화면 안내 문구에는 등록 문구에 '패키지'가 있다고 적혀 있지만, 실제 지시문과 결과(`kmTextBlocks`)에는 패키지 칸이 없어요. 화면 문구와 기능이 서로 다르니 회사 쪽에서 맞출 때 참고하세요.

---

## 부록 A. 이 기능 원본 코드 전체 (연속 구간 그대로)

### A-1. 화면(HTML) + 제목·문구 점검 스크립트 · 671~758행

```html
    <div id="kmongPane" class="pane" hidden>
      <div class="final-head">
        <div class="eyebrow" style="margin:0">크몽 상세페이지</div>
        <div class="final-title">크몽에 올릴 판매 페이지를 만들어요</div>
        <div class="final-sub">09에서 만든 상세페이지는 크레킷용 코드예요. 크몽은 코드를 못 넣고 이미지와 글만 올릴 수 있어서, 같은 책을 크몽 규칙에 맞는 이미지 세트와 등록 문구로 다시 만들어요. 아래 '크몽 상세페이지 만들기'를 누르면 대표 이미지, 상세 이미지 10장, 미리보기 5장, 등록 문구까지 한 번에 나와요.</div>
      </div>

      <div class="sl-info">
        <b>만들어질 것</b><br>
        · 대표 이미지 1장 (652×488, 4:3) · 크몽 목록에 보이는 첫 얼굴<br>
        · 상세 이미지 10장 (첫 장면 · 이런 분께 · 증거 · 진짜 이유 · 비교표 · 저자 · 받는 것 · 핵심 목차 · 약속 · 마무리)<br>
        · 미리보기 이미지 5장 이상 (목차 1장 + 본문 4장, 가림 없이)<br>
        · 등록 문구: 제목(10~30자) · 서비스 설명 · 패키지 · 자주 묻는 질문 · 전체 목차 · 검색 키워드<br>· 수강생이 고칠 칸 없이 완성본으로 나와요. 규칙에 걸리는 문장은 생성할 때 알아서 바꿔 써요
      </div>

      <div class="sp-gate">
        <div class="sp-gate-title">크몽 규칙 점검표 (2026-11-23 확인)</div>
        <div class="sp-row"><b>제목</b><span>10~30자. 특수문자는 : + - # / . ( ) 만. 외부 연락처, 무료·할인·가성비 같은 가격 표현, 1위·베스트·최초·유일 같은 검증 안 되는 표현 금지</span></div>
        <div class="sp-row"><b>대표 이미지</b><span>652×488(4:3), JPG·PNG, 흰 배경 말고 색 배경, 글자는 가장자리에서 50px 안쪽. 무료·할인·최고·1위·100% 금지, 다른 상품과 같은 이미지 금지</span></div>
        <div class="sp-row"><b>상세 이미지</b><span>공식 규격 숫자가 없어요. 가로 860px로 만들고 바꿀 수 있게 둬요. 연락처·외부 링크·QR 금지, 캡처 속 개인정보는 가려서 넣어요</span></div>
        <div class="sp-row"><b>미리보기</b><span>5장 이상, 한 장씩 따로. 모자이크·블러 금지. 목차·미리보기가 실제 책과 다르면 환불·판매 중지 사유</span></div>
        <div class="sp-row"><b>책 파일</b><span>표지·목차 빼고 A4 세로 20쪽 이상, 12pt·줄간격 1.5, 이미지·여백 30% 미만. 워터마크와 저작권 문구, 수정 제한. PDF·DOCX·HWP·PPT, 파일당 200MB</span></div>
        <div class="sp-row"><b>후기</b><span>임시 후기·지어낸 후기 금지 (거짓 후기 = 운영정책 위반). 크몽 후기는 크몽 안에서만 쌓여요</span></div>
        <div class="sp-row"><b>할인 표시</b><span>할인을 보여 주려면 기준가·기간·실제 할인율까지 함께</span></div>
        <div class="sp-row"><b>AI 인물</b><span>AI로 만든 사람 사진을 후기·추천에 쓰면 이미지에 [가상인물], 제목에 [가상인물 포함] (2026.6.1부터)</span></div>
        <div class="sp-row"><b>가격·심사</b><span>전자책 최소 10,000원, 패키지 최대 3개(1만 원 이상 차이). 심사 영업일 7일 이내</span></div>
      </div>

      <div class="field">
        <label class="lbl" for="kmCheckText">제목·문구 점검 <small>크몽에 넣을 제목이나 문구를 붙여넣으면 걸리는 표현을 찾아줘요</small></label>
        <textarea id="kmCheckText" style="min-height:90px" placeholder="예: 무의식 습관을 바꾸는 현실창조 전자책"></textarea>
        <button class="btn secondary" id="kmCheckGo" type="button">규칙 점검하기</button>
        <div class="sl-info" id="kmCheckOut" hidden></div>
      </div>

      <div class="sl-wait" id="kmWait" hidden><span class="sl-dot"></span><span id="kmWaitText">크몽 상세페이지를 만들고 있어요.</span></div>
      <p class="note" id="kmState" hidden></p>
      <div id="kmOut" hidden>
        <button class="btn sl-copy" id="kmZip" type="button">전체 받기 (이미지 + 등록 문구 ZIP)</button>
        <div class="eyebrow" style="margin:14px 0 0">대표 이미지 (652×488)</div>
        <div id="kmThumb" style="margin:10px 0"></div>
        <div class="eyebrow" style="margin:14px 0 0">상세 이미지 10장 · 순서대로 올리세요</div>
        <div class="ma-grid" id="kmGrid"></div>
        <div class="eyebrow" style="margin:14px 0 0">미리보기 이미지 5장 · 한 장씩 따로 올리세요</div>
        <div class="ma-grid" id="kmPrev"></div>
        <div class="eyebrow" style="margin:18px 0 6px">크몽 등록 칸에 넣을 글</div>
        <div id="kmTexts" style="display:flex;flex-direction:column;gap:12px"></div>
      </div>
      <div class="draft-actions single" style="margin:6px 0;">
        <button class="btn" id="goKmong" type="button">크몽 상세페이지 만들기</button>
        <button class="btn ghost" id="stopKmong" type="button" hidden>멈추기</button>
      </div>
      <p class="attach-note">출처: 크몽 서비스 등록 화면(제목 규칙), 전문가센터 메인이미지 가이드·전자책 제작 가이드·등록 가이드, 운영정책. 상세 이미지 크기와 검색 태그 개수는 공식 숫자를 못 찾아서 등록할 때 화면에서 한 번 더 확인해요.</p>
    </div>
<script>
(function(){
  const BAN = [
    ["최저가","가격 표현"],["무료","가격 표현"],["할인","가격 표현"],["저렴","가격 표현"],["가성비","가격 표현"],["부담 없는","가격 표현"],["이벤트","과장 표현"],
    ["매출 보장","과장 표현"],["수익 보장","과장 표현"],["환불 보장","과장 표현"],["보장","과장 표현"],["무조건","과장 표현"],["누구나","과장 표현"],["확정 수익","과장 표현"],
    ["100%","과장 표현"],["5점 만점","과장 표현"],["만족도","과장 표현"],["1위","검증 안 되는 표현"],["베스트","검증 안 되는 표현"],["no.1","검증 안 되는 표현"],
    ["최초","검증 안 되는 표현"],["유일","검증 안 되는 표현"],["무한","검증 안 되는 표현"],["무제한","검증 안 되는 표현"],["최고","검증 안 되는 표현"],["최대","검증 안 되는 표현"],["제일","검증 안 되는 표현"],
    ["오픈채팅","외부 연락처"],["카톡","외부 연락처"],["카카오톡","외부 연락처"],["dm","외부 연락처"],["인스타","외부 연락처"],["crekit","외부 링크"],["크레킷","외부 링크"]
  ];
  const $k = id => document.getElementById(id);
  const esc = s => s.replace(/[&<>]/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;"}[c]));
  $k("kmCheckGo").addEventListener("click", () => {
    const t = $k("kmCheckText").value.trim(), out = $k("kmCheckOut");
    out.hidden = false;
    if (!t) { out.textContent = "점검할 글을 넣어 주세요."; return; }
    const low = t.toLowerCase(), hits = [];
    BAN.forEach(([w, why]) => { if (low.includes(w)) hits.push(`'${w}' · ${why}`); });
    if (/https?:\/\/|www\.|\.com|\.kr|\.io/.test(low)) hits.push("주소(URL) · 외부 링크 금지");
    if (/01[016789][-\s]?\d{3,4}[-\s]?\d{4}/.test(t)) hits.push("전화번호 · 외부 연락처 금지");
    if (/@/.test(t)) hits.push("@ (이메일·SNS 아이디) · 외부 연락처 금지");
    if (/\d{1,3}(,\d{3})+원|\d+원/.test(t)) hits.push("금액 · 제목과 대표 이미지에는 가격을 쓰지 않아요");
    if (/가상인물|ai 모델|ai 인물/.test(low) && !/\[가상인물/.test(t)) hits.push("AI 인물 · [가상인물] 표시 필요");
    const lines = t.split(/\n/).filter(Boolean), one = lines.length === 1;
    let head = "";
    if (one) {
      const n = [...t].length, bad = t.replace(/[가-힣ㄱ-ㅎa-zA-Z0-9\s:+\-#\/.()]/g, "");
      head = `<b>제목으로 보면</b> ${n}자 ` + (n < 10 ? "· 10자 이상이어야 해요" : n > 30 ? "· 30자를 넘어요" : "· 길이 통과") +
        (bad ? `<br>쓸 수 없는 특수문자: ${esc([...new Set(bad)].join(" "))}` : "") + "<br>";
    }
    out.innerHTML = head + (hits.length ? `<b>걸리는 표현 ${hits.length}개</b><br>` + hits.map(h => "· " + esc(h)).join("<br>")
      : "<b>걸리는 표현 없음</b>");
  });
})();
</script>
```

### A-2. 기능 코드(JS) · 7727~7975행

```js
  // ── 10 크몽 상세페이지 ──
  // 09에서 승인한 문장(있으면)과 책 재료로 크몽 등록용 문구 JSON을 받고, 대표 이미지 1 + 상세 10 + 미리보기 5를 그린다.
  // 결과물에는 확인 표시·빈 자리를 넣지 않는다. 규칙에 걸리는 문장은 생성 단계에서 다시 쓰게 한다.
  const KM_BAN = [/최저가/, /무료/, /할인/, /저렴/, /가성비/, /부담\s?없는/, /이벤트/, /보장/, /무조건/, /누구나/, /100\s?%/, /5점\s?만점/, /1위/, /베스트/, /no\.?\s?1/i, /최초/, /유일/, /무한/, /무제한/, /최고/, /최대(?!한)/, /제일/, /오픈\s?채팅/, /DM/, /크레킷|crekit/i, /https?:|www\./];
  const kmState = noteFn("kmState");
  let kmData = null, kmBusy = false, kmCtl = null, kmPal = null, kmBook = "", kmImgs = {}, kmI = null;
  const kmStrings = (o, out = []) => { if (typeof o === "string") out.push(o); else if (Array.isArray(o)) o.forEach(x => kmStrings(x, out)); else if (o && typeof o === "object") Object.values(o).forEach(x => kmStrings(x, out)); return out; };
  function kmCheck(d) {
    const p = [], all = kmStrings(d).join("\n");
    KM_BAN.forEach(re => { const m = all.match(re); if (m) p.push(`크몽 금지 표현 '${m[0]}'이 들어 있다. 뜻은 살리고 다른 말로 바꾼다`); });
    if (/\d[\d,]*\s*원(?![가-힣])/.test(all)) p.push("금액(○○원)을 쓰지 않는다");
    if (/01[016789][-\s]?\d{3,4}[-\s]?\d{4}|@/.test(all)) p.push("연락처·아이디를 쓰지 않는다");
    const t = String(d.title || ""), n = [...t].length;
    if (n < 10 || n > 30) p.push(`title 은 10~30자 (지금 ${n}자)`);
    if (/[^가-힣ㄱ-ㅎa-zA-Z0-9\s:+\-#\/.()]/.test(t)) p.push("title 특수문자는 : + - # / . ( ) 만 쓴다");
    ["thumb", "p1", "p2", "p3", "p4", "p5", "p6", "p7", "p8", "p9", "p10"].forEach(k => { if (!d[k] || typeof d[k] !== "object") p.push(`${k} 칸이 비었다`); });
    if (!Array.isArray(d.faq) || d.faq.length < 4) p.push("faq 는 5개");
    return p;
  }
  function kmPrompt(I, extra) {
    const sp = spData ? JSON.stringify({ hero: spData.hero, story: spData.story, selfcheck: spData.selfcheck, reason: spData.reason, reality: spData.reality, diff: spData.diff, toc: spData.toc, honest: spData.honest, faq: spData.faq, price: { choice: spData.price?.choice, body: spData.price?.body } }).slice(0, 12000) : "";
    return `너는 크몽(kmong.com) 전자책 상세페이지를 만드는 카피라이터다. 아래 책 재료로 크몽 등록용 JSON 하나만 출력한다. 설명이나 코드블록 없이 JSON만.

[책]
제목: ${I.title || "(원고에서 찾기)"}
부제: ${I.subtitle || ""}
작가: ${I.author || ""}
주제·대상: ${I.topic || ""}
독자: ${I.reader || ""}
저자 이야기(사용자가 직접 쓴 것): ${I.story || "(없음)"}
실제 후기: ${I.reviews.length ? I.reviews.map((r, i) => `[${i}] "${r.quote}" - ${r.who}`).join(" / ") : "(없음)"}
목차:
${String(I.outline || I.chapters.join("\n")).slice(0, 4000)}
${sp ? `\n[09 상세페이지에서 만든 문장 · 1순위로 그대로 가져다 쓴다]\n${sp}\n` : ""}
[리서치 속 독자의 말]
${String(I.research || "").slice(0, 3000)}

[원고 발췌]
${spExcerpt(I.text || "", 9000)}

[구성 · 크몽 판매 상위 전자책 8개의 순서를 따른다]
thumb: l1, l2, l3 (대표 이미지 큰 글씨 3줄, 각 9자 이내, 독자가 겪는 문제나 깨달음. 강조할 단어 하나만 {g}단어{/g}로 감싼다), sub (핵심 키워드 + 형태, 16자 이내, 예: "현실창조 전자책")
p1 첫 장면: label (책 이름과 형태), h1 (장면 한 컷 2~3줄, 줄바꿈은 \\n, 각 줄 12자 이내), story (3~4문장, 마지막 문장이 책의 핵심 깨달음. 강조는 {g}{/g})
p2 이런 분께: h2 (2줄), checks (3~4개, 독자의 행동 묘사. 리서치 속 독자의 말을 다듬어서), result (2줄), notFor (권하지 않는 사람 2개)
p3 ${I.reviews.length ? "후기: h2 (2줄), picks (실제 후기 번호 배열, 최대 4개)" : "책 속 한 대목: h2 (2줄, 예: '이런 문장이\\n담겨 있습니다'), quote (원고 발췌에서 그대로 옮긴 가장 강한 대목 2~4문장. 한 글자도 바꾸지 않는다), why (이 대목이 독자에게 주는 것 한 줄)"}
p4 진짜 이유: h2 (3줄, 가운데 줄을 {g}{/g}), body (2~3문장), oldVoice (독자의 낡은 혼잣말 2개), verdict (2줄)
p5 비교표: h2 (2줄), rows (3개 {common: 흔한 조언, ours: 이 책의 방법}), faster (1~2줄)
p6 저자: h2 (2줄), timeline (3~4개 {label: 나이·기간·사건 같은 사실 단어, text}), wins (0~3개, 저자 이야기에 있는 것만). 저자 이야기가 없으면 1인칭 경험을 지어내지 말고 '왜 이 주제를 파게 됐나, 무엇을 모았나, 무엇을 확인했나' 3단으로 쓴다
p7 받는 것: h2 (2줄), items (3개 {big: 짧은 단어나 숫자, small: 설명}. 분량 칸은 생성기가 따로 넣으니 쓰지 않는다)
p8 핵심 목차: h2 (2줄), toc (6개 {part: 'PART 1' 같은 이름, title: 목차 제목 그대로})
p9 약속: hype (과장 문구 2개, 따옴표 포함), h2 (2줄), honest (한 줄), body (한 줄)
p10 마무리: choice1, choice2 (선택 질문 두 줄), body (2문장. 압박하지 말고 목차와 미리보기를 먼저 보라고 권한다)
title: 크몽 서비스 제목 10~30자. [핵심 키워드] + [누가 / 어떤 결과]. 특수문자는 : + - # / . ( ) 만
titleAlt: 제목 다른 안 하나
desc: 서비스 설명 300~500자, 핵심 키워드를 3번 이상
faq: 5개 {q, a}. 초보도 되나 / 해봤는데 안 됐다 / 분량과 소장 / 받는 방법 / 환불(크몽 환불 규정을 따르고, 파일을 받은 뒤에는 단순 변심 환불이 어렵다)
keywords: 검색 키워드 7개 배열

[크몽 규칙 · 반드시 지킨다]
- 금액, 무료·할인·저렴·가성비·이벤트, 보장·무조건·누구나·100%, 1위·베스트·최초·유일·최고·최대·제일·무제한 같은 말은 쓰지 않는다
- 연락처, 링크, 오픈채팅·DM 문의, 다른 판매처 이름은 쓰지 않는다
- 숫자·성과·후기는 재료에 있는 것만 쓴다. 지어내지 않는다
- 줄표(—)와 화살표(→)는 쓰지 않는다
- 말투는 09 상세페이지 문장이 있으면 그 말투, 없으면 '~합니다' 체
${extra || ""}`;
  }
  const kmG = (s) => hesc(s || "").replace(/\{g\}(.*?)\{\/g\}/g, '<span class="g">$1</span>').replace(/\{\/?g\}/g, "").replace(/\\n|\n/g, "<br>");
  const kmA = (x) => Array.isArray(x) ? x : [];
  function kmCss(P) {
    const A = P.accentHi || P.accent;
    return `*{box-sizing:border-box}html,body{margin:0}body{font-family:"Noto Sans KR",sans-serif;word-break:keep-all;color:${P.text};background:${P.bg}}
.p{width:860px;padding:84px 64px;background:${P.bg}}.p.deep{background:${P.bg2 || P.bg}}.g{color:${A}}
h1{margin:0;font-size:58px;font-weight:900;line-height:1.28;letter-spacing:-2px}h2{margin:0;font-size:44px;font-weight:900;line-height:1.34;letter-spacing:-1.5px}
.lbl{display:block;margin-bottom:22px;color:${A};font-size:18px;font-weight:700}
.tx{margin:28px 0 0;color:${P.text2};font-size:21px;line-height:1.9}
.bk{display:block;margin:44px auto 0;width:50%}
.ck{display:flex;gap:16px;align-items:center;margin-top:12px;padding:22px 24px;background:${P.accentSoft};border:1px solid ${P.accent};font-size:21px;font-weight:700;line-height:1.5}
.ck i{flex:0 0 26px;height:26px;background:${P.accent};position:relative}.ck i:after{content:"";position:absolute;left:9px;top:4px;width:6px;height:12px;border:solid ${P.accentInk || "#111"};border-width:0 3px 3px 0;transform:rotate(45deg)}
.res{margin:26px 0 0;font-size:22px;font-weight:700;line-height:1.7}
.no{margin-top:46px;padding-top:32px;border-top:1px solid ${P.line2}}.no h3{margin:0 0 12px;font-size:24px}.no div{color:${P.text2};font-size:20px;line-height:1.85}
.q{margin-top:40px;padding:32px;border-left:5px solid ${P.accent};background:${P.bg3 || P.bg2};font-size:23px;line-height:1.85;font-weight:500}
.rv{margin-top:14px;padding:26px 28px;background:${P.bg3 || P.bg2};border:1px solid ${P.line}}.rv b{color:${A};letter-spacing:3px}.rv p{margin:10px 0 6px;font-size:20px;line-height:1.8}.rv small{color:${P.text3};font-size:16px}
.ov{margin:26px 0;display:grid;gap:10px}.ov div{padding:13px 20px;border-left:3px solid ${P.line2};color:${P.text3};font-size:21px;font-weight:700}
.vd{margin:0;font-size:29px;font-weight:900;line-height:1.55}
table{width:100%;border-collapse:collapse;margin-top:40px}th{padding:16px;text-align:left;font-size:18px;color:${P.text3};border-bottom:1px solid ${P.line2}}th.us{background:${P.accent};color:${P.accentInk || "#111"}}
td{padding:22px 16px;border-bottom:1px solid ${P.line};font-size:20px;line-height:1.55;vertical-align:top}td.c{color:${P.text3};width:44%}td.us{font-weight:900;background:${P.accentSoft}}
.fs{margin:40px 0 0;font-size:24px;font-weight:700;line-height:1.7}
.tl{margin-top:38px;border-left:1px solid ${P.line2}}.tl>div{position:relative;padding:0 0 30px 34px}.tl>div:before{content:"";position:absolute;left:-8px;top:8px;width:15px;height:15px;background:${P.accent}}
.tl b{display:block;color:${A};font-size:17px;margin-bottom:4px}.tl span{color:${P.text2};font-size:20px;line-height:1.8}
.wn{margin-top:6px}.wn div{padding:10px 0;border-bottom:1px solid ${P.line};font-size:19px;font-weight:700}
.gt{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-top:38px}.gt div{padding:26px 24px;background:${P.bg3 || P.bg2};border:1px solid ${P.line}}.gt b{display:block;color:${A};font-size:32px;font-weight:900}.gt span{color:${P.text2};font-size:18px}
.toc{margin-top:38px;border-top:1px solid ${P.line2}}.toc div{display:flex;gap:20px;padding:20px 0;border-bottom:1px solid ${P.line};font-size:21px;font-weight:700;line-height:1.5}.toc small{flex:0 0 100px;color:${A};font-size:16px;padding-top:4px}
.ct{text-align:center}.hy span{display:inline-block;margin:0 5px 10px;padding:11px 18px;border:1px dashed ${P.line2};color:${P.text3};font-size:19px;text-decoration:line-through}
.hn{margin:28px auto 0;max-width:20em;font-size:28px;font-weight:900;line-height:1.55}
.chq{margin:0;font-size:40px;font-weight:900;line-height:1.4;letter-spacing:-1.5px}.chq span{display:block;color:${P.text3}}
.th{position:relative;width:1304px;height:976px;overflow:hidden}.th .sf{position:absolute;inset:100px;display:flex;gap:60px;align-items:center}
.th .tt{flex:1.2;font-size:84px;font-weight:900;line-height:1.24;letter-spacing:-3px}.th .su{margin-top:34px;font-size:36px;font-weight:700;opacity:.85}
.th .bx{flex:.8;position:relative}.th .bx img{width:100%}.th .bd{position:absolute;right:-10px;top:-10px;width:150px;height:150px;border-radius:50%;display:flex;align-items:center;justify-content:center;text-align:center;font-weight:900;font-size:30px;line-height:1.15}
.pg{width:860px;height:1216px;background:#fffdf8;color:#1d1d1f;padding:96px 88px;overflow:hidden}.pg h3{margin:0 0 30px;font-size:34px;font-weight:900;padding-bottom:16px;border-bottom:3px solid ${P.accent}}
.pg p{margin:0 0 16px;font-size:21px;line-height:1.9}.pg .tc div{padding:12px 0;border-bottom:1px solid #e6e1d6;font-size:21px}`;
  }
  function kmPages(I) {
    const pages = I.pages || 0, est = Math.max(1, Math.round(String(I.text || "").replace(/\s+/g, "").length / 900));
    return pages ? { big: `${pages}쪽`, small: "PDF 전자책" } : { big: `${est}쪽`, small: "PDF 전자책 (A4 기준)" };
  }
  function kmPanels(d, I) {
    const B = kmBook ? `<img class="bk" src="${kmBook}">` : "", o = (k) => d[k] || {};
    const p1 = o("p1"), p2 = o("p2"), p3 = o("p3"), p4 = o("p4"), p5 = o("p5"), p6 = o("p6"), p7 = o("p7"), p8 = o("p8"), p9 = o("p9"), p10 = o("p10");
    let rv = [];
    if (I.reviews.length) { rv = kmA(p3.picks).map(i => I.reviews[Number(i)]).filter(Boolean); if (!rv.length) rv = I.reviews; rv = rv.slice(0, 4); }
    const pg = kmPages(I);
    return [
      ["", `<span class="lbl">${hesc(p1.label || I.title)}</span><h1>${kmG(p1.h1)}</h1><p class="tx">${kmG(p1.story)}</p>${B}`],
      ["deep", `<h2>${kmG(p2.h2 || "혹시,\n당신 이야기인가요?")}</h2>${kmA(p2.checks).map(c => `<div class="ck"><i></i>${kmG(c)}</div>`).join("")}<p class="res">${kmG(p2.result)}</p>${kmA(p2.notFor).length ? `<div class="no"><h3>이런 분께는 권하지 않습니다</h3>${kmA(p2.notFor).map(x => `<div>· ${kmG(x)}</div>`).join("")}</div>` : ""}`],
      ["", `<h2>${kmG(p3.h2 || (rv.length ? "먼저 읽은 분들의\n이야기" : "이런 문장이\n담겨 있습니다"))}</h2>${rv.length ? rv.map(r => `<div class="rv"><b>★★★★★</b><p>"${hesc(r.quote)}"</p><small>${hesc(r.who)}</small></div>`).join("") : `<div class="q">${kmG(p3.quote)}</div>${p3.why ? `<p class="tx">${kmG(p3.why)}</p>` : ""}`}`],
      ["deep", `<h2>${kmG(p4.h2)}</h2><p class="tx">${kmG(p4.body)}</p><div class="ov">${kmA(p4.oldVoice).map(v => `<div>${kmG(v)}</div>`).join("")}</div><p class="vd">${kmG(p4.verdict)}</p>`],
      ["", `<h2>${kmG(p5.h2)}</h2><table><tr><th>흔한 조언</th><th class="us">${hesc(I.title || "이 책")}</th></tr>${kmA(p5.rows).map(r => `<tr><td class="c">${kmG(r.common)}</td><td class="us">${kmG(r.ours)}</td></tr>`).join("")}</table>${p5.faster ? `<p class="fs">${kmG(p5.faster)}</p>` : ""}`],
      ["deep", `<h2>${kmG(p6.h2)}</h2><div class="tl">${kmA(p6.timeline).map(t => `<div><b>${hesc(t.label)}</b><span>${kmG(t.text)}</span></div>`).join("")}</div>${kmA(p6.wins).length ? `<div class="wn">${kmA(p6.wins).map(w => `<div>${kmG(w)}</div>`).join("")}</div>` : ""}`],
      ["", `<h2>${kmG(p7.h2 || "구매하면 바로\n이것을 받습니다")}</h2><div class="gt"><div><b>${hesc(pg.big)}</b><span>${hesc(pg.small)}</span></div>${kmA(p7.items).slice(0, 3).map(t => `<div><b>${hesc(t.big)}</b><span>${kmG(t.small)}</span></div>`).join("")}</div>${B}`],
      ["deep", `<h2>${kmG(p8.h2 || "핵심\n목차")}</h2><div class="toc">${kmA(p8.toc).slice(0, 7).map(t => `<div><small>${hesc(t.part)}</small>${kmG(t.title)}</div>`).join("")}</div>`],
      ["ct", `<div class="hy">${kmA(p9.hype).map(h => `<span>${hesc(h)}</span>`).join("")}</div><h2>${kmG(p9.h2 || "이런 말로\n현혹하지 않겠습니다.")}</h2><p class="hn">${kmG(p9.honest)}</p><p class="tx">${kmG(p9.body)}</p>`],
      ["deep", `<p class="chq">${kmG(p10.choice1)}<span>${kmG(p10.choice2)}</span></p><p class="tx">${kmG(p10.body)}</p>${B}`],
    ];
  }
  function kmThumb(d, I, P) {
    const t = d.thumb || {}, dark = !P.light, bg = dark ? (P.bg3 || P.bg2 || P.bg) : P.text, fg = dark ? P.text : P.bg, pg = kmPages(I);
    return `<div class="th" style="background:${bg};color:${fg}"><div class="sf"><div class="tt">${[t.l1, t.l2, t.l3].filter(Boolean).map(kmG).join("<br>")}<div class="su">${kmG(t.sub)}</div></div>${kmBook ? `<div class="bx"><img src="${kmBook}"><div class="bd" style="background:${P.accent};color:${P.accentInk || "#111"}">${hesc(pg.big)}<br>PDF</div></div>` : ""}</div></div>`;
  }
  function kmPreviewPages(I) {
    const toc = String(I.outline || I.chapters.join("\n")).split("\n").map(s => s.trim()).filter(Boolean).slice(0, 22);
    const paras = String(I.text || "").split(/\n+/).map(s => s.trim()).filter(s => s.length > 1);
    const out = [`<div class="pg"><h3>목차</h3><div class="tc">${toc.map(t => `<div>${hesc(t)}</div>`).join("")}</div></div>`];
    let i = 0;
    for (let n = 0; n < 4 && i < paras.length; n++) {
      let body = "", len = 0;
      while (i < paras.length && len < 1380) {
        const s = paras[i], head = s.length < 40 && !/[.?!다요]$/.test(s), room = 1450 - len;
        if (head) { if (room < 260) break; body += `<h3>${hesc(s)}</h3>`; len += 120; i++; continue; }
        if (s.length <= room) { body += `<p>${hesc(s)}</p>`; len += s.length; i++; continue; }
        const cut = s.lastIndexOf(" ", room) > room * 0.6 ? s.lastIndexOf(" ", room) : room;
        body += `<p>${hesc(s.slice(0, cut))}</p>`; paras[i] = s.slice(cut).trim(); len = 1450;
      }
      out.push(`<div class="pg">${body}</div>`);
    }
    return out;
  }
  async function kmRender(inner, P, W, H) {
    await loadScript(CDN.h2c); maFontLink();
    const html = `<!doctype html><html><head><meta charset="utf-8"><link rel="stylesheet" href="${MA_FONT}"><style>${kmCss(P)}</style></head><body>${inner}</body></html>`;
    const fr = mk("iframe", `position:fixed;left:-20000px;top:0;width:${W}px;height:${H || 3200}px;border:0;`);
    document.body.appendChild(fr);
    try {
      await new Promise(r => { fr.onload = r; fr.srcdoc = html; });
      const doc = fr.contentDocument, el = doc.body.firstElementChild, txt = [...new Set(doc.body.textContent)].join("") || "가";
      await Promise.all(["400", "500", "700", "900"].flatMap(w => [doc, document].map(x => x.fonts?.load(`${w} 40px "Noto Sans KR"`, txt).catch(() => {}))));
      await doc.fonts?.ready; await Promise.all([...doc.images].map(im => im.complete ? 0 : new Promise(r => { im.onload = im.onerror = r; })));
      await new Promise(r => setTimeout(r, 250));
      const h = H || Math.ceil(el.getBoundingClientRect().height);
      fr.style.height = h + "px";
      const c = await window.html2canvas(el, { scale: 1, width: W, height: h, windowWidth: W, windowHeight: h, backgroundColor: null, logging: false, useCORS: true });
      return await canvasBlob(c, "image/jpeg", 0.9);
    } finally { fr.remove(); }
  }
  async function kmShrinkTo(blob, W, H) {
    const img = await createImageBitmap(blob), c = document.createElement("canvas"); c.width = W; c.height = H;
    c.getContext("2d").drawImage(img, 0, 0, W, H); return canvasBlob(c, "image/jpeg", 0.92);
  }
  async function kmRenderAll(I) {
    const P = kmPal;
    kmImgs.thumb = await kmShrinkTo(await kmRender(kmThumb(kmData, I, P), P, 1304, 976), 652, 488); kmDraw(I);
    const panels = kmPanels(kmData, I);
    for (let i = 0; i < panels.length; i++) {
      if (kmCtl?.signal.aborted) return;
      kmUi(true, `상세 이미지를 그리는 중이에요 (${i + 1}/10)`);
      const [cls, body] = panels[i];
      kmImgs["p" + (i + 1)] = await kmRender(`<section class="p ${cls === "ct" ? "ct" : cls}">${body}</section>`, P, 860, 0); kmDraw(I);
    }
    const pv = kmPreviewPages(I);
    for (let i = 0; i < pv.length; i++) {
      if (kmCtl?.signal.aborted) return;
      kmUi(true, `미리보기 이미지를 그리는 중이에요 (${i + 1}/${pv.length})`);
      kmImgs["v" + (i + 1)] = await kmRender(pv[i], P, 860, 1216); kmDraw(I);
    }
  }
  const kmUrls = {};
  const kmUrl = (k) => { const b = kmImgs[k]; if (!b) return ""; if (kmUrls[k]?.b !== b) { if (kmUrls[k]) URL.revokeObjectURL(kmUrls[k].u); kmUrls[k] = { b, u: URL.createObjectURL(b) }; } return kmUrls[k].u; };
  const KM_NAMES = ["첫 장면", "이런 분께", "증거", "진짜 이유", "비교표", "저자", "받는 것", "핵심 목차", "약속", "마무리"];
  function kmTextBlocks(d, I) {
    const faq = kmA(d.faq).map(f => `Q. ${f.q}\nA. ${f.a}`).join("\n\n");
    const toc = String(I.outline || I.chapters.join("\n")).trim();
    return [["제목", `${d.title || ""}`], ["제목 다른 안", d.titleAlt || ""], ["서비스 설명", d.desc || ""], ["자주 묻는 질문", faq], ["전체 목차 (목차 칸)", toc], ["검색 키워드", kmA(d.keywords).join(", ")]].filter(x => x[1]);
  }
  function kmDraw(I) {
    $("kmOut").hidden = !kmData;
    if (!kmData) return;
    $("kmThumb").innerHTML = kmImgs.thumb ? `<img src="${kmUrl("thumb")}" alt="대표 이미지" style="width:100%;max-width:652px;border-radius:8px;display:block">` : `<div class="ma-ph" style="aspect-ratio:4/3;max-width:652px">그리는 중…</div>`;
    $("kmGrid").innerHTML = KM_NAMES.map((n, i) => `<div class="ma-card">${kmImgs["p" + (i + 1)] ? `<img src="${kmUrl("p" + (i + 1))}" alt="${n}" style="aspect-ratio:auto;object-fit:contain">` : `<div class="ma-ph">그리는 중…</div>`}<div class="ma-tag">${String(i + 1).padStart(2, "0")} ${n}</div></div>`).join("");
    $("kmPrev").innerHTML = [1, 2, 3, 4, 5].filter(i => kmImgs["v" + i] || kmBusy).map(i => `<div class="ma-card">${kmImgs["v" + i] ? `<img src="${kmUrl("v" + i)}" alt="미리보기 ${i}" style="aspect-ratio:auto;object-fit:contain">` : `<div class="ma-ph">그리는 중…</div>`}<div class="ma-tag">미리보기 ${i}${i === 1 ? " · 목차" : ""}</div></div>`).join("");
    $("kmTexts").innerHTML = kmTextBlocks(kmData, I || kmI).map(([k, v], i) => `<div class="mp-box"><div class="mp-head"><strong>${hesc(k)}</strong><button class="btn ghost" type="button" data-kmcopy="${i}">복사</button></div><pre class="result">${hesc(v)}</pre></div>`).join("");
  }
  $("kmTexts").addEventListener("click", async (ev) => {
    const b = ev.target.closest("[data-kmcopy]"); if (!b || !kmData) return;
    const v = kmTextBlocks(kmData, kmI)[Number(b.dataset.kmcopy)]?.[1] || "";
    try { await navigator.clipboard.writeText(v); b.textContent = "복사됨"; } catch (e) { const pre = b.closest(".mp-box").querySelector("pre"); const r = document.createRange(); r.selectNodeContents(pre); const s = getSelection(); s.removeAllRanges(); s.addRange(r); b.textContent = "선택됨 · Ctrl+C"; }
    setTimeout(() => { b.textContent = "복사"; }, 1600);
  });
  function kmUi(busy, msg) { $("goKmong").disabled = busy; $("stopKmong").hidden = !busy; $("kmWait").hidden = !busy; if (msg) $("kmWaitText").textContent = msg; if ($("kmZip")) $("kmZip").disabled = busy; }
  async function kmRun() {
    if (kmBusy) return;
    const I = spInputs(); kmI = I;
    if (!I.text && !I.images.length) { kmState("아직 책이 없어요. 앞 단계에서 원고를 만들거나, 09 상세페이지 탭에서 원고 파일을 올려 주세요.", "err"); return; }
    const sample = await samplePromise;
    if (!sample) { kmState("이 화면에서는 AI 생성을 쓸 수 없어요. 맨 위 안내대로 다른 브라우저에서 열어주세요.", "err"); return; }
    kmBusy = true; kmCtl = new AbortController(); kmState("");
    kmUi(true, "책을 읽고 크몽용 문구를 쓰고 있어요. 2~3분쯤 걸려요. 이 화면을 닫지 말고 기다려 주세요.");
    try {
      const palId = spPal && SP?.palettes?.[spPal] ? spPal : (await spPickPalette(I))[0];
      kmPal = SP.palettes[palId] || SP.palettes["midnight-gold"];
      kmBook = await maBookImage();
      const ask = async (extra) => { const d = await sample.json(kmPrompt(I, extra), { signal: kmCtl.signal, modelTier: "default", cache: false }); if (!d || typeof d !== "object" || Array.isArray(d)) throw { code: "empty_completion" }; return d; };
      let d = await ask(""), probs = kmCheck(d);
      for (let r = 0; probs.length && r < 2; r++) {
        kmUi(true, "크몽 규칙에 맞게 문구를 다듬는 중이에요.");
        d = await ask(`\n[이번 작업 · 고치기]\n아래 문제만 고친 전체 JSON을 다시 준다.\n${probs.map(p => "- " + p).join("\n")}\n지금 JSON:\n${JSON.stringify(d).slice(0, 30000)}\n`);
        probs = kmCheck(d);
      }
      kmData = d; kmImgs = {}; kmDraw(I);
      await kmRenderAll(I);
      kmDraw(I);
      if (!kmCtl.signal.aborted) kmState("크몽 상세페이지가 완성됐어요. '전체 받기'로 받아서 크몽 등록 화면에 순서대로 올리세요.", "ok");
    } catch (e) {
      kmState(e?.name === "AbortError" ? "멈췄어요." : e?.code === "invalid_json" || e?.code === "empty_completion" ? "결과가 깨졌어요. 한 번만 다시 눌러 주세요." : (ERR[e?.code] || "만들지 못했어요. 잠시 뒤 다시 눌러 주세요."), e?.name === "AbortError" ? "" : "err");
    } finally { kmBusy = false; kmUi(false); kmDraw(I); }
  }
  async function kmZipBlob() {
    await loadScript(CDN.jszip);
    const I = kmI, zip = new window.JSZip(), root = zip.folder(`크몽_${spSlug(I?.title || kmData?.title)}`);
    if (kmImgs.thumb) root.file("00_대표이미지_652x488.jpg", kmImgs.thumb);
    for (let i = 1; i <= 10; i++) if (kmImgs["p" + i]) root.file(`상세_${String(i).padStart(2, "0")}_${KM_NAMES[i - 1]}.jpg`, kmImgs["p" + i]);
    for (let i = 1; i <= 5; i++) if (kmImgs["v" + i]) root.file(`미리보기_${i}.jpg`, kmImgs["v" + i]);
    root.file("크몽_등록문구.txt", kmTextBlocks(kmData, I).map(([k, v]) => `[${k}]\n${v}`).join("\n\n"));
    return zip.generateAsync({ type: "blob" });
  }
  $("kmZip").addEventListener("click", async () => {
    if (!kmData) return; kmState("파일을 묶는 중…");
    try { await saveTo(`${spSlug(kmI?.title || kmData.title)}_10_크몽상세페이지.zip`, await kmZipBlob(), kmState); } catch (e) { kmState("파일을 만들지 못했어요. 다시 눌러 주세요.", "err"); }
  });
  $("goKmong").addEventListener("click", () => kmRun());
  $("stopKmong").addEventListener("click", () => kmCtl?.abort());
```
