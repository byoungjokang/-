---
name: ebook-autopilot
description: 전자책 생성기 — 주제(또는 원씽 문장)·저자·경험 원료를 입력 폼 하나로 받아 1-2 주제 쪼개기 → 1-3 리서치 → 1-4 목차 → 1-5 집필·검수 → 1-6 디자인·PDF 출력(30 프리셋, HTML→PDF)을 거쳐 메타 광고 소재까지(09, ebook-meta-ads) 단계마다 승인을 받으며 자동으로 진행한다. 기존 ebook-topic-split / ebook-topic-research / ebook-outline / ebookmake / bj-essay-voice 스킬을 순서대로 호출하고, 단계별 산출물을 books/<slug>/ 폴더에 파일로 남겨 중단·재개가 가능하다. 사용자가 "전자책 생성기 돌려줘", "전자책 자동으로 만들어줘", "이 주제로 책 한 권 뽑아줘", "ebook autopilot", "전자책 파이프라인 시작", "책 이어서 만들자", "생성기 상태 확인" 같은 요청을 하거나, 주제 하나를 주면서 완성된 전자책 파일까지 원할 때 이 스킬을 쓴다. 주제를 아직 못 정한 사용자에게는 17개 카테고리 체크박스 메뉴에서 관련 전자책 주제를 추천하는 단계("주제 메뉴", "주제 추천해줘", "카테고리에서 골라줘")도 이 스킬이 맡는다. 단계 하나만 따로 하고 싶으면(목차만, 리서치만) 개별 스킬을 쓴다. 저자·브랜드·CTA 는 매번 입력 폼에서 채운다 — 특정 브랜드를 기본값으로 두지 않는다.
---

# 전자책 생성기 (ebook-autopilot)

주제 하나 → 완성된 전자책 파일. 6단계를 순서대로 돌리고, **단계마다 파일을 남기고 승인을 받는다.**
개별 스킬은 이미 있다. 이 스킬은 그것들을 **순서대로 부르고, 산출물을 다음 단계에 넘기고, 중단된 곳에서 재개하는 조립 라인**이다.

```
00 입력 폼 ─▶ 01 주제 쪼개기 ─▶ 02 리서치 ─▶ 03 목차 ─▶ 04 집필·검수 ─▶ 05 디자인·출력 ─▶ 09 메타 광고 소재
 intake.md     topic-split      topic-research  outline     ebookmake+문체     pick_preset → build_ebook_html → check_design   ebook-meta-ads
 (주제 미정이면 00-A 주제 메뉴 → 그래도 안 되면 topic-select)                     → pdf (30 프리셋)                              후킹 30 → 소재 15 → 업로드 계획
```

정본 문서: `references/pipeline.md` (단계별 입출력·승인 규칙). 헷갈리면 그 문서를 연다. 감으로 순서를 바꾸지 않는다.

## 0. 시작 — 상태부터 본다

1. 책 폴더 루트를 정한다. 기본값은 이 스킬과 같은 프로젝트의 `books/` (`<스킬경로>/../../books`). 사용자가 다른 폴더를 말하면 그곳.
2. 사용자가 slug(영문 소문자·하이픈, 예: `core-dokjongam`)를 말하지 않았으면 주제에서 만들어 제안한다.
3. 이미 있는 책이면:
   ```bash
   node <스킬경로>/scripts/status.js books/<slug>
   ```
   approved 가 아닌 첫 단계에서 이어간다. 이전 단계 파일을 다시 만들지 않는다.
4. 새 책이면:
   ```bash
   cd <스킬경로>/scripts && (npm ls docx >/dev/null 2>&1 || npm i --no-audit --no-fund)
   node init_book.js books <slug> --title "가제"
   ```
   → `books/<slug>/00_intake.md` 가 생긴다.

## 1. 단계 실행 규칙 (모든 단계 공통)

- **실행 전**: 그 단계의 개별 스킬을 로드한다 (01 `ebook-topic-split`, 02 `references/market-validation.md` → `ebook-topic-research`, 03 `ebook-outline`, 04 `ebookmake` + 문체 스킬, 09 `ebook-meta-ads`). 이 스킬은 절차를 복제하지 않는다 — 개별 스킬의 절차를 그대로 따르고, **입력은 이전 단계 파일에서, 출력은 `pipeline.md` 의 파일 형식으로**.
- **실행 후**: ① 파일 저장 → ② 짧은 요약 + 사용자가 판단할 지점 → ③ **승인 / 수정 / 다시** 를 기다린다. 후보를 제안하는 단계(주제 10개·제목 10개·목차 3안)에서는 추천을 찍은 뒤 반드시 **"마음에 드는 게 있습니까? → 있으면 다음 단계 / 없으면 다른 N개를 새로 뽑을까요?"** 두 갈래로 묻는다. 새로 뽑을 때는 표현만 바꾸지 않고 독자·상황·결과·방법 중 하나 이상이 다른 후보로 만든다. 승인이면 `status.js --set <단계> approved`. 승인 없이 다음 단계로 가지 않는다.
- 사용자가 "끝까지 알아서" 라고 하면 `pipeline.json` 의 `mode` 를 `auto` 로 바꾸고 게이트를 건너뛴다. 단 04 집필 checkpoint(프롤로그+1장 문체 확인)는 auto 에서도 한 번 멈춘다 — 여기서 잡은 방향이 나머지 열 개 장에 다 적용되기 때문이다. 09 의 승인 ③(메타 업로드·예산·광고 켜기)도 돈이 나가므로 auto 에서 건너뛰지 않는다.
- 웹서치가 필요한 단계(01 시장·경쟁 테스트, 02 리서치)는 사용자에게 "찾아보세요"로 떠넘기지 않고 직접 한다.

## 2. 단계별 요점

### 00 입력 폼 — 묻는 순서가 정해져 있다
`00_intake.md` 를 사용자와 같이 채운다. 한 번에 다 던지지 않는다. A(저자) → B(주제) → C(원료) → D·E·F(문체·분량·리서치, 기본값 제안 후 확인) 순서.

**B. 주제 — 이 순서 그대로**
1. "어떤 주제로 책을 쓰고 싶으세요?" + **카테고리 체크박스** (아래 00-A 위젯). 주제가 이미 있어도 보여준다.
2. 체크가 오면 "이미 주제를 정하셨나요?" — 정했다 / 확실하지 않다 / 아직 못 정했다.
3. 정했다 → 주제 한 줄을 받고 → "관련된 주제로 추천을 더 받아볼까요, 아니면 이 주제로 바로 전자책을 만들까요?"
   - 바로 생성 → B3 확정, C 로.
   - 추천 → 00-A 추천 절차 → 하나 선택 → C 로.
4. 확실하지 않다 · 못 정했다 → "주제 쪼개기(팔리는 전자책 주제)로 책 주제를 추천해드릴까요?" → 예 → 00-A 추천 절차 → 하나 선택 → C 로.

**C. 경험 원료 — 확정 주제를 넣어 5문항** (`intake.md` C 항목 문구 그대로, {주제} 치환)
- 1번에 `경험 없음` → 2~5 건너뛰고 **경험 없음 경로**: 체크한 카테고리로 리서치 + 주제 쪼개기 → 후보 추천 → 선택 → 2·5번만 다시 묻고 → 연구·사례 기반 톤으로 집필 (intake.md 참고).
- 문체 (a) `bj-essay-voice` 는 저자가 병조쌤 본인일 때만. 수강생 책은 (b) 샘플 글 추출 또는 (c) `references/voice-default.md`.

### 00-A 주제 추천 (체크박스 → 카탈로그 → 후보)
17개 카테고리·86개 세부분야·311개 주제 카탈로그(`references/topic-catalog.json`).
1. 체크박스: 데스크톱 앱(`show_widget` 가능)이면 `node topic_pick.js --widget cats` 의 HTML 을 그대로 위젯으로. 위젯에는 "이미 주제를 정하셨나요?" 선택과 주제 입력란이 같이 있어, 버튼을 누르면 `주제 메뉴 선택 — 카테고리: 04, 06 / 주제: 정했다 "…"` 형식의 메시지가 온다. 위젯을 못 쓰는 환경이면 `--list` 번호 목록으로 받는다.
2. 후보 뽑기: `node topic_pick.js --cat 04,06 --json` → 사용자가 정한 주제(있으면)·결핍 접점과 교차해 **5~8개**로 줄인다. 카탈로그 문장을 그대로 내지 말고 사용자 쪽으로 한 번 비튼다. 정한 주제가 있으면 그 주제의 이웃(같은 세부분야)과 한 칸 옆 각도를 섞는다.
3. 후보마다 한 줄 이유(결핍 × 접점 × 시장 근거). 시장 근거는 상위 2~3개만 웹서치로 확인. 추천 1개를 찍는다.
4. 사용자가 고르면 B3 확정. 좁히는 건 01 이 한다.

### 01 주제 쪼개기 → `01_onething.md`
5개의 칼로 10개+ → 한 문장 → 4테스트 → 추천 1개 찍기. 이미 좁혀진 원씽이면 4테스트만.

### 02 리서치 → `02_market.md` + `02_research.md`
**앞단(시장 검증)**: `references/market-validation.md` 절차로 유튜브·브런치·인스타·메타 광고·인프런·클래스101·탈잉(+크몽·지식iN/카페·데이터랩)에서 수요를 확인하고 댓글·카페 글의 **고객 언어를 원문+👍 그대로** 모은 뒤, **10주제 표(순위|주제명|해결하는 문제|핵심 약속|구매 근거 ★|예상 목차 스케치)**를 `02_market.md`에 쓰고 채팅에 표로 보여준다. 사용자가 순위를 고르면 원씽을 확정·갱신하고 심화로 넘어간다. 원씽이 아직 없고 넓은 주제만 있을 때도 이 표가 01 주제 쪼개기의 입력이 된다.
**제목·주제명은 수익화 공식으로**: 10주제 표의 주제명과 03 앞 제목 후보는 `ebook-title-monetize` 스킬([타깃·조건]+[제약]+[숫자 결과]+[결과 동사]+[방법 명사], 보장어 금지)로 만든다. 에세이형 훅은 부제나 광고 카피와 결합한다.
**심화**: intake F 깊이대로 `ebook-topic-research` 절차. "생략"이면 둘 다 approved 처리하고 넘어간다. **여기 없는 연구·수치는 집필에서 쓰지 않는다.**

### 03 목차 → `03_outline.json`
문제-해결 3단 표 → 뼈대 → 자극×문법 → 3안 → 추천안. 민감 주제면 도발 게이트. 챕터마다 `track`(서사/방법, 방법은 3~5개)과 `materials`(intake C 매핑)를 채운다. 형식은 `references/outline-schema.json`.

### 04 집필 → `04_book.json` + `04_review.md`
1. 골격 생성 (meta.authorIsBj / cta / ctaMode 를 intake 에서).
2. **checkpoint**: 프롤로그 + 1장 쓰고 멈춤 → 문체·수위·트랙 확인.
3. 나머지 챕터 순서대로. 챕터마다 저장 + `status.js --next-chapter N`. 문체 체크리스트 결과를 `04_review.md` 에.
4. `node validate_book.js books/<slug>/04_book.json` — 오류 0 까지. (서사 트랙 리스트 금지, 브랜드 금지어, 번호 접두어, 블록 수, hook)
형식은 `references/book-schema.json`. 블록 타입 11종: p / lead / sub / point / quote / box / list / steps / check / divider / hook.

### 05 디자인·출력 → `05_ebook.pdf` (+ 검수 시트) — **HTML → PDF 경로가 기본**
디자인 규격은 `references/design/ebook-design-guide-30-presets.md` (사용자가 확정한 30 프리셋 가이드). 프리셋은 색이 아니라 **편집 문법**이다.
```bash
node pick_preset.js books/<slug>/04_book.json                 # 메인 1 + 보조 1 (70/30) 추천 → 사용자에게 확인
node build_ebook_html.js books/<slug>/04_book.json books/<slug>/05_ebook.pdf --preset EB01 [--sub EB03] [--no-images]
python check_design.py books/<slug>/05_ebook.pdf --body-pt 10.5  # 자기 검수: 글자 축소·빈 쪽·차례 쪽수 + 5쪽 시트
```
1. **프리셋 확인 게이트**: 추천 메인·보조와 표지 레이아웃(C0x)·이미지 스타일(I0x)을 한 줄로 보여주고 확인받는다. 확실치 않으면 후보 2개를 표지+본문 한 쪽씩 뽑아 고르게 한다.
2. **이미지**: `book.images { cover, parts:{"1":..}, coverBg }` 가 있으면 넣고, 없으면 레이아웃에 맞는 벡터 모티프로 대신한다(C04 는 C02 로). 삽화가 필요한 프리셋(I01·I02·I03·I05)은 이미지 API 또는 사용자 제공 그림이 있을 때만 그림 표지가 된다 — 없다고 멈추지 말고 벡터 표지로 뽑은 뒤 안내한다.
3. **검수**: `check_design.py` 가 실패하면 보여주지 않고 고친다. 시트(`_check.png`)를 열어 가이드의 최종 품질 체크리스트(썸네일 가독성 / PART·CHAPTER 위계 / 빽빽함 / 2~3쪽마다 리듬 / 강조 2~3종 이하 / 포인트 컬러 1개)를 눈으로 본다. 문장은 고치지 않는다 (문장 문제 → 04로).
4. 최종본은 `books/<slug>/final/<slug>.pdf` 로 복사. 수정용 docx 가 필요하면 구 빌더(`build_ebook.js` A4 / `build_ebook_a5.js` A5)로 따로 뽑는다 — 디자인은 PDF 가 정본.

### 09 메타 광고 소재 → `09_hooks.md` · `09_ads.json` · `ads/out/` · `09_ads_sheet.png` · `09_upload_plan.md`
`ebook-meta-ads` 스킬을 로드해서 그 SKILL.md 2장 순서를 그대로 따른다(절차를 여기 복제하지 않는다). 입력은 `02_market.md`(고객 언어·통념) + `04_book.json`(프롤로그) + 05 표지 + `08_salespage`(링크·팔레트, 없으면 링크는 사용자에게 받음).
승인 게이트 3개: ① 후킹 30개 중 20개 선택 → ② 빌드한 소재 시트에서 15개 선택 → ③ 업로드·예산(금액 한 줄 확인, **auto 에서도 멈춤**). intake G(광고 계정)가 비면 업로드 없이 `09_upload_plan.md` 까지만.
`python <ebook-meta-ads>/scripts/build_ads.py books/<slug>/09_ads.json --palette <id>` 로 빌드. 셋 다 통과하면 `status.js --set 09_ads approved`.

## 3. 디자인 체계 (2026-09-10 확정, GPT 산출물과 비교 검증)

- 판형 A5 148×210, 여백 위 20 / 아래 18 / 좌우 17mm, 본문 10.5pt 행간 165~185%, 한 줄 45~60자 (가이드 공통 시스템)
- 위계 `BOOK TITLE → PART → CHAPTER → SECTION → BODY → CAPTION`. 한 쪽에 강한 시각 요소 1개. 챕터 첫 쪽은 위 3분의 1 싱크 + 연한 고스트 번호
- 컴포넌트 15종 중 빌더가 그리는 것: KEY MESSAGE(point) / QUOTE / CASE·TIP(box) / CHECKLIST(check) / STEP(steps) / SCRIPT·문장 카드(list) / 훅(hook). 프리셋의 `cards` 문법(card·hairline·workbook·plain)이 모양을 정한다
- 배색: 가이드 hex 그대로. 포인트는 배지·번호·선에만(10%), 순검정·순백 대신 차콜·아이보리, 표지 색면은 오려 붙이지 않고 톤·선·오브젝트로
- 출력은 크롬 headless print-to-pdf. **docx/LibreOffice 경로는 그라데이션·둥근 모서리·그림자·드롭캡이 안 돼 디자인 정본으로 쓰지 않는다**
- 함정: `.page` 에 padding 을 주면 148mm 를 넘어 크롬이 문서 전체를 80% 축소(box-sizing 필수) / grid + break-inside 는 한 항목이 한 쪽 차지(flex) / mix-blend-mode 그레인 금지 / 러닝헤드·쪽번호는 PyMuPDF 스탬프

구 스펙(A4 16pt docx, 템플릿 01~12)은 `build_ebook.js`·`build_ebook_a5.js`·`templates.json` 에 남아 있다. 수정용 docx 나 요청이 있을 때만 쓴다.

## 4. 브랜드 규칙 (반드시)

- 저자·브랜드·CTA 는 intake 에서. 기본값에 특정 브랜드 없음.
- 저자가 병조쌤이 아니면 병조쌤/비라스/비제이라이프스쿨/리치코드 및 병조쌤 CTA 문구 금지. 병조쌤 본인이어도 비라스/비제이라이프스쿨 금지. `validate_book.js` 가 잡는다 — `meta.authorIsBj` 로 우회하지 않는다.
- `bj-essay-voice` 는 병조쌤 본인 책 전용.

## 5. 하지 않는 것

- 승인 없이 다음 단계로 넘어가지 않는다 (auto 모드 제외).
- 이전 단계 파일을 다음 단계에서 고쳐 쓰지 않는다 — 고쳐야 하면 그 단계로 돌아가 다시 승인.
- 리서치에 없는 연구, intake 에 없는 숫자·사례를 만들지 않는다. 부족하면 `[원료 필요: C7]` 남기고 묻는다.
- 디자인 단계에서 문장을 고치지 않는다.
- 한글 파일명으로 최종본을 내보내지 않는다 (다운로드 깨짐 이력).
- 1-1 주제 선정을 자동으로 "찍어서" 끝내지 않는다 — 질문형 스킬의 순서를 지킨다.

## 파일 지도

```
scripts/topic_pick.js     주제 메뉴 — 카탈로그 목록·필터·JSON·체크박스 위젯 HTML
scripts/init_book.js      책 폴더 + pipeline.json + 00_intake.md 생성
scripts/status.js         진행 상태 표시·승인 기록·집필 재개 지점
scripts/validate_book.js  04_book.json 검증 (구조·분량·트랙·함정5·브랜드)
scripts/pick_preset.js    원고·카테고리에서 프리셋 메인/보조 추천 (가이드 빠른 선택표)
scripts/build_ebook_html.js  04_book.json → A5 HTML → 크롬 PDF (30 프리셋) — 디자인 정본
scripts/stamp_pdf.py      러닝헤드·쪽번호 스탬프 + 차례 쪽수 스캔 (build_ebook_html 이 호출)
scripts/check_design.py   디자인 자기 검수 (글자 축소·빈 쪽·차례 일치) + 5쪽 시트
scripts/build_ebook.js    04_book.json → A4 docx (구 템플릿 01~11, 수정용)
scripts/build_ebook_a5.js 04_book.json → A5 docx (구 템플릿 12, 수정용)
scripts/to_pdf.js         docx → pdf (LibreOffice) + 전체 페이지 축소판 png
references/design/ebook-design-guide-30-presets.md  디자인 규격 정본 (30 프리셋·컴포넌트 15·표지 8·리듬)
references/design/presets.json   30 프리셋의 빌더 값 (색·서체·표지·카드 문법)
references/design/presets-5-samples.html  대표 5종 시안
references/pipeline.md    단계별 입출력·승인 계약 (정본)
references/intake.md      00 입력 폼 템플릿
references/outline-schema.json / book-schema.json   03·04 파일 형식
references/voice-default.md / voice-extract.md      타 저자 문체
references/pitfalls.md    함정 5 + 브랜드 규칙 + 민감 주제 규칙
references/templates.json 구 docx 빌더 팔레트 (01~12)
references/topic-catalog.json  17 카테고리·86 세부·311 주제 + 결핍 매핑 (topics-311.md 변환본)
../ebook-meta-ads/        09 메타 광고 소재 스킬 (후킹·형식 12종·인물 프롬프트·빌더 build_ads.py·업로드 계획). 절차 정본은 그 SKILL.md
```
