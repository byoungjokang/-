# 메타 광고 운영 — 구조·업로드·증액·끄기

## 1. 캠페인 구조 (사용자 확정, 2026-10-13)
- 목표: 판매(OUTCOME_SALES), 최적화 구매(PURCHASE 픽셀). 예산은 **캠페인 예산(CBO)**.
- **캠페인 1개 · 광고세트 1개 · 광고 15개.** 소재를 한 광고세트에 몰고 메타가 배분하게 둔다.
  - 메타 "한 광고에 이미지 여러 장(유연한 형식)"은 최대 10장이라 15개는 **광고 15개**로 넣는다.
- 타겟: **어드밴티지+ 타겟(추천 설정)**, 국가만 지정. 성별·관심사 제한 없음.
  - 예외 규칙: 3일 이상 클릭률은 높은데 구매 0이면 연령·성별 분포를 확인하고, 엉뚱한 층에 새면 성별만 다시 건다(대화법 10/13~14 사례).
- 기여 설정: **클릭 후 7일 + 조회 후 1일 + 참여한 조회 후 1일(모든 기여)**.
  - **기존 광고세트에서는 기여 설정을 바꿀 수 없다** → 새 광고세트를 만들어야 한다(학습 초기화 감수).
- 노출 위치: 자동.

## 2. 예산 규칙
- 시작: 사용자가 정한 금액(예: 하루 25,000~30,000원).
- 학습 기간: 새 광고세트·타겟 변경 후 **3일은 동결**. 끄기·예산 변경 금지.
- 증액: 전날 구매당 비용이 **목표 이하**일 때만 **하루 20%** (25,000 → 30,000 → 36,000 → 43,000 → 52,000). 목표 = 판매가의 약 50%(49,000원 책 → 25,000원, 39,000원 책 → 20,000원).
- 상한: 하루 60,000원까지 자동, 그 이상은 사용자 확인.
- 대화법 계정은 매일 9시 자동 점검 작업이 있다(scheduled task `daehwabeop-daily-budget`). 새 책도 MCP 계정이면 같은 작업을 만든다.

## 3. 끄기 규칙
- 노출 1,000회 또는 광고비 1만 원 이상 + 구매 0 + 클릭률 1%대 → 끄기 추천.
- 클릭률은 높은데(4%↑) 구매 0 → 바로 끄지 않는다. 상세페이지 첫 줄과 맞는지부터 본다.
- 끌 때는 사용자 확인 후. 이미 팔린 광고는 노출이 적어도 끄지 않는다(대화법 A: 노출 53회에 1건).

## 4. 업로드 — Meta Ads MCP 가 되는 계정
1. 이미지 공개 URL: `python scripts/upload_image.py ads/out/01.png ...` (catbox.moe, PNG→JPG).
2. `ads_create_creative`: page_id, instagram_user_id, image_url, link_url(상세페이지), message(본문), headline, call_to_action_type=LEARN_MORE.
3. `ads_create_ad`: ad_set_id, creative={"creative_id": "..."} → 일시정지 상태로 생성.
4. `ads_activate_entity`(ad). 내부 오류(INTERNAL)는 그 광고만 다시 시도.
5. 새 광고세트: `ads_create_ad_set` targeting `{"geo_locations":{"countries":["KR"],"location_types":["home","recent"]},"age_min":18,"age_max":65,"targeting_automation":{"advantage_audience":1}}`, attribution_spec 3종, promoted_object `{"pixel_id":..., "custom_event_type":"PURCHASE"}`.
6. **주의: `ads_update_entity` 로 캠페인 예산을 바꾸면 메타가 캠페인을 자동 일시정지한다 → 즉시 `ads_activate_entity` 로 다시 켜고 상태 확인.**
7. 광고 이름 규칙: `{브랜드} | {형식} | {핵심어}`.

## 5. 업로드 — MCP 가 안 되는 계정 (Claude in Chrome 으로 광고관리자 조작)
1. 광고관리자 광고 탭에서 판매가 나온 이미지 광고 1개만 체크 → 복제 → 1차 창: "릴스 음악 추가" 권장 **체크 해제**, 2차 창: 원본 캠페인, 사본 수 N (`form_input` 으로 숫자 입력).
2. 복제 후 뜨는 "광고 N개용 미디어" 화면에서 행마다 연필 → 이미지 선택.
3. 이미지 업로드: 파일 선택 창은 못 다루므로 먼저 가로챈다.
   ```js
   HTMLInputElement.prototype.click = function(){ if(this.type==='file'){ if(!this.isConnected){this.style.display='none';document.body.appendChild(this);} window.__fi=this; return;} return __orig.call(this); }
   ```
   '업로드' 버튼 클릭 → `window.__fi.multiple=true` → find 로 file input ref → `file_upload` 로 여러 장 한 번에(10MB 안).
4. 행별 이미지 지정 헬퍼: 이미지 타일은 `[role=dialog] [role=button]` 중 innerText 가 파일명으로 시작하는 것. 클릭 → '계속'.
5. 첫 행이 반영 안 되는 경우가 있다 → 끝나고 썸네일 파일명을 한 번 더 확인.
6. 편집기로 이동 → 본문에 '관련 미디어'·자동 음악이 붙지 않았는지 확인 → 동의하고 게시.
7. 일괄 이름 변경은 React 입력이라 JS 로 값 넣기가 반영 안 된다. 필요하면 광고별로 직접 입력(사용자가 원할 때만).
8. 복제 방식이면 본문·헤드라인은 원본 광고 문구 그대로 간다(검증된 문구라 기본값으로 OK). 문구를 바꿀 땐 '기본 문구' 섹션에서.

## 6. 보고 형식
- 어제 / 오늘: 광고비, 구매, 구매당 비용, ROAS(구매 × 판매가 ÷ 광고비).
- 많이 쓴 광고 Top 5: 광고비·노출·클릭률·구매.
- 판단 한 줄 + 오늘 할 일(대부분 "건드리지 않기").
