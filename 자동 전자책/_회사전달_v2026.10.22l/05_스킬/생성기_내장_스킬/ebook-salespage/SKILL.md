---
name: ebook-salespage
description: 전자책 상세페이지 생성기 — 리치코드 상세페이지(https://lifeschool.crekit.io/new-page)의 12섹션 구조·디자인 토큰·폰트 위계를 템플릿화해, 어떤 주제의 전자책이든 같은 구조의 크레킷용 세일즈 페이지 HTML을 만든다. ebook-autopilot 의 산출물(00_intake·01_onething·02_market·03_outline·04_book·05 표지)을 입력으로 받아 06_salespage.json → HTML 을 뽑는 06 단계용. 사용자가 "상세페이지 만들어줘", "세일즈 페이지", "리치코드 구조로 상페", "이 전자책 판매 페이지", "생성기 06 단계", "상페 템플릿으로" 라고 하거나, 완성된 전자책의 판매 페이지를 원할 때 쓴다. 주제별 팔레트(어두운 바탕 12종 + 밝은 바탕 6종, 액센트 1색)를 전자책 프리셋(EB01~30)과 연동해 고른다. 비라스 전용 랜딩(viras-landing-page)이나 범용 detail-page-agent 와 다르다 — 이 스킬은 전자책 한 권의 판매 페이지를 리치코드 구조 그대로 찍어내는 조립 라인이다.
---

# 전자책 상세페이지 생성기 (ebook-salespage)

리치코드 상세페이지가 정본이다. **구조 12섹션 + 선택 모듈 3개**, **바탕 3단 + 액센트 1색(어두운 12종 · 밝은 6종)**, **Pretendard 위계 + 세리프는 히어로 제목 한 곳**.
주제가 바뀌어도 이 세 가지는 바뀌지 않는다. 바뀌는 건 **내용(JSON)** 과 **팔레트(주제)** 뿐이다.

```
입력: books/<slug>/ (intake·onething·market·outline·book·표지)
  ↓ 1. 팔레트 고르기 (references/design.md 2장 → palettes.json)
  ↓ 2. 06_salespage.json 채우기 (references/structure.md + copy-rules.md, 스키마 salespage-schema.json)
  ↓ 3. python scripts/build_salespage.py 06_salespage.json 06_salespage.html --palette <id>
  ↓ 4. 셀프 검수 (빌더 --check 결과 + 눈 검수 체크리스트)
출력: books/<slug>/06_salespage.html (크레킷 HTML 블록에 그대로 붙여넣기) + 06_salespage_preview.jpg
```

정본 문서 네 개. 헷갈리면 문서를 연다. 감으로 바꾸지 않는다.
- `references/structure.md` — 섹션 12 + 모듈 3, 섹션마다 목적·슬롯·길이·금지
- `references/design.md` — 토큰 체계, 주제→팔레트 선택표, 컴포넌트 규칙, 금지 요소
- `references/typography.md` — 폰트 위계표 (데스크톱/모바일 clamp), 섹션별 적용
- `references/copy-rules.md` — 카피 채우는 규칙, 자리표시자 【 】, 숫자·후기 원칙

## 1. 입력 매핑 (생성기 파일 → 상세페이지 슬롯)

| 상세페이지 슬롯 | 어디서 가져오나 |
|---|---|
| 히어로 h1 / 서사 3줄 | `04_book.json` 프롤로그 첫 장면 또는 광고 첫 문장(메타 광고를 돌리면 **광고 첫 줄 = 히어로 첫 줄**) |
| 저자 타임라인 5단계 | `00_intake.md` C(경험 원료) + 프롤로그. 원료 경로가 `경험 없음`이면 모듈 A(탐구형 서사)로 교체 |
| 셀프체크 3~5문장 | `02_market.md` 고객 언어 원문(👍 많은 순). **지어내지 않는다** |
| 진짜 이유 (원리 1개) | `01_onething.md` 방법의 핵심 원리 한 줄 + `02_research.md` 근거 |
| 리얼리티 체크 (통념 3개) | `02_market.md` 통념 / `03_outline.json` 정반합의 "정" |
| 3가지 차이 | `03_outline.json` 방법 트랙 3개 (가장 구체적인 것 셋) |
| 목차 | `03_outline.json` 파트·챕터 제목 그대로 (고치지 않는다) |
| 실제 성과 이미지 | intake 에 있는 증빙 캡처만. 없으면 섹션 통째로 생략 |
| 후기 | 실제 후기가 있으면 그대로. 없으면 **임시 후기 6개**를 써서 넣되 `sample:true` 로 표시한다(빌더가 개수를 알려 준다). 발행 전 실제 후기로 교체 |
| 정직 선언 과장 문구 2~3개 | 그 시장에서 흔한 과장 문구 (02_market 광고 문구에서) |
| FAQ 5 | 02_market 의 망설임 TOP + 분량·기한·확인 방법 3개 고정 |
| 가격·사다리·마감 | intake 가격 + 사용자 확인. 숫자는 사용자가 준 것만 |

없는 재료는 **【 】 자리표시자**로 남기고 빌더 `--check` 가 세어 준다. 자리표시자를 채운 척 지어내지 않는다.

## 2. 실행 순서

1. **팔레트 결정**: 전자책이 EB 프리셋으로 만들어졌으면 `design.md` 2-2 표에서 그 프리셋의 상세페이지 팔레트를 쓴다. 프리셋이 없으면 2-1 주제 카테고리 표로 고른다. 한 줄로 이유를 말하고 진행한다 (묻지 않는다). 사용자가 색을 지정하면 그대로.
2. **JSON 작성**: `references/salespage-schema.json` 형식. `references/richcode-example.json` 을 옆에 두고 섹션별 길이·톤을 맞춘다. 광고 첫 문장이 있으면 `hero.h1` 에 그대로.
3. **빌드**:
   ```bash
   python <스킬경로>/scripts/build_salespage.py books/<slug>/06_salespage.json books/<slug>/06_salespage.html --palette midnight-gold --check
   ```
   `--check` 는 자리표시자 수, 금지 문자(— –), 영문 대문자 라벨, 섹션 누락, 버튼 문구 중복을 출력한다. 0 이 아니면 보여주지 않고 고친다.
4. **미리보기**: 빌더가 `06_salespage_preview.jpg`(모바일 400px 전체) 를 같이 뽑는다. 눈 검수 체크리스트(`design.md` 5장)를 돈다.
5. **전달**: HTML 파일 + 미리보기 + 사용자가 채울 것 목록(이미지 URL, 결제 링크, 가격 확정). 크레킷 HTML 블록은 `<style>`·`<script>` 허용, `position:fixed` 는 iframe 안이라 화면 하단에 안 붙는다 — 스티키 바는 크레킷의 고정 CTA 기능을 쓰라고 안내한다.

## 3. 바꾸지 않는 것

- 섹션 순서. 빼는 건 되지만(재료 없음) 순서를 섞지 않는다. 가격은 항상 FAQ 뒤, 정직 선언은 항상 가격 앞.
- 액센트는 1색. 두 번째 색을 넣지 않는다. 액센트는 글자·얇은 선·버튼·배지에만.
- 히어로 h1 만 세리프(Hahmlet). 나머지 전부 Pretendard.
- 형광펜 강조, 영문 대문자 eyebrow, 글로우·그라데이션 카드, 번호 동그라미, 버튼 안 →, 가운뎃점 나열, 이모지, em-dash 금지 (CLAUDE.md 디자인 규칙과 같다).
- 숫자·성과·사례·연구는 만들지 않는다. 후기만 예외: 실제 후기가 없으면 임시 후기 6개(`sample:true`)로 채우고 발행 전에 교체한다.
- 브랜드: 저자가 병조쌤이 아니면 비라스·비제이라이프스쿨·리치코드 언급 금지. 대화설계처럼 익명 브랜드면 저자 실명을 쓰지 않는다.

## 4. 파일 지도

```
SKILL.md                         이 문서
references/structure.md          12섹션 + 3모듈 명세 (정본)
references/design.md             토큰·팔레트 선택·컴포넌트·금지·검수
references/typography.md         폰트 위계표
references/copy-rules.md         카피 규칙·자리표시자·숫자/후기 원칙
references/palettes.json         팔레트 12종 (빌더가 읽음)
references/salespage-schema.json 06_salespage.json 형식
references/richcode-example.json 리치코드 실제 내용으로 채운 예시
templates/salespage.css          토큰 기반 스타일시트 (빌더가 인라인)
scripts/build_salespage.py       JSON + 팔레트 → HTML (+ --check, 미리보기)
```
