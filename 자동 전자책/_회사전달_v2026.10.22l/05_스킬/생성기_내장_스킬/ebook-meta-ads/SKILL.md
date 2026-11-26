---
name: ebook-meta-ads
description: 전자책 메타(인스타·페이스북) 광고 소재 생성기 — 완성된 전자책과 상세페이지를 입력으로 받아 결핍을 찌르는 후킹 문구 → 광고 형식 선택(폰 화면·인물 포스터·영화 자막·휴먼다큐 속마음·퀴즈 등 12종) → 인물 사진 생성(ChatGPT 원격) → 1080x1350 소재 이미지 15장 → 광고 본문·헤드라인 → 메타 업로드 계획(광고세트 1개·소재 15개·어드밴티지+ 타겟·모든 기여·20% 증액 규칙)까지 만든다. ebook-autopilot 의 09 단계(08 상세페이지 다음). 사용자가 "메타 광고 소재 만들어줘", "광고 이미지 뽑아줘", "후킹 문구 20개", "인스타 광고 소재", "생성기 09 단계", "이 전자책 광고 돌리자", "소재 15개 채워줘" 라고 하거나, 전자책 판매용 광고 소재가 필요할 때 쓴다. 대화법·리치코드 전자책을 실제로 팔면서 검증된 형식과 규칙이 정본이다.
---

# 전자책 메타 광고 소재 생성기 (ebook-meta-ads)

정본은 **실제로 팔린 소재**다(대화법: 거절 카톡 C, 리치코드: 7년 전 이야기 게시글형). 감으로 바꾸지 않는다.
바뀌는 건 **내용(09_ads.json)** 과 **팔레트(상세페이지와 같은 것)** 뿐이고, 형식·규칙·운영 방식은 고정이다.

```
입력: books/<slug>/ (00_intake · 01_onething · 02_market · 03_outline · 04_book · 05 표지 · 08_salespage)
  ↓ 1. 후킹 뱅크 30개 (references/hooks.md)            → 09_hooks.md        [승인 ①: 사용자가 20개 고름]
  ↓ 2. 형식 배정 + 인물 장면 설계 (references/formats.md) → 09_ads.json
  ↓ 3. 인물 사진 생성 (references/image-prompts.md, ChatGPT 원격) → ads/people/*.png
  ↓ 4. python scripts/build_ads.py 09_ads.json --palette <id> → ads/out/NN.png + 09_ads_sheet.png
  ↓ 5. 셀프 검수 (references/checklist.md)                                    [승인 ②: 사용자가 15개 고름]
  ↓ 6. 본문·헤드라인 확정 + 업로드 계획 (references/meta-ops.md) → 09_upload_plan.md
  ↓ 7. (원격 허락 시) 메타 업로드 → 09_launch_log.md                          [승인 ③: 예산·켜기]
출력: ads/out/*.png, 09_ads_sheet.png, 09_ads.json, 09_upload_plan.md
```

정본 문서. 헷갈리면 연다.
- `references/hooks.md` — 후킹 공식 9종, 결핍 사다리, 금지 표현, 실제 팔린 문장
- `references/formats.md` — 형식 12종: 언제 쓰는지, 레이아웃 수치, 문구 슬롯, 실제 성과
- `references/image-prompts.md` — 인물·장면 프롬프트 공식, ChatGPT 원격 생성 절차, 심의 안전선
- `references/copy.md` — 광고 본문·헤드라인·버튼, 상세페이지 첫 줄과 맞추는 법
- `references/meta-ops.md` — 캠페인 구조, 업로드 절차(MCP / 크롬), 증액·끄기 규칙, 학습 기간
- `references/checklist.md` — 소재 검수표, 심의 위험 체크
- `references/results-log.md` — 실제 집행 결과(무엇이 팔렸고 무엇이 안 팔렸나). 새 결과가 나오면 여기에 추가한다

## 1. 입력 매핑 (생성기 파일 → 광고 슬롯)

| 광고 슬롯 | 어디서 가져오나 |
|---|---|
| 결핍 장면(후킹 원료) | `02_market.md` 고객 언어 원문, 결핍 클러스터 상위(👍 순). **지어내지 않는다** |
| 통념 뒤집기 | `02_market.md` 통념 / `03_outline.json` 정반합의 "정" |
| 저자 서사(7년 전 이야기형) | `04_book.json` 프롤로그 첫 장면 + `00_intake.md` C 원료. `원료 경로: 경험 없음`이면 저자 서사 형식 금지 |
| 원리 한 줄 | `01_onething.md` 방법의 핵심 원리 / 08 상세페이지 `진짜 이유` |
| 실제 후기 카드 | 실제 후기만. 08 의 임시 후기(`sample:true`)는 광고에 **절대** 쓰지 않는다 |
| 책 이미지 | `05` 표지 목업(투명 PNG). 없으면 표지 평면 이미지 |
| 링크·가격 | `08_salespage` 발행 URL, intake 가격 |
| 팔레트 | 08 에서 쓴 팔레트 id (`../ebook-salespage/references/palettes.json`) |
| 히어로 첫 줄 | **가장 많이 팔린 광고의 첫 문장 = 상세페이지 h1**. 광고가 이기면 08 h1 을 그 문장으로 바꾸자고 제안한다 |

## 2. 실행 순서

1. **후킹 뱅크 30개** (`hooks.md`): 공식 9종을 골고루, 결핍 사다리 1~4단 모두. 표로 보여주고 사용자가 20개 고른다. "마음에 드는 게 없으면 다른 축(독자·상황·결과)으로 10개 더" 두 갈래로 묻는다.
2. **형식 배정** (`formats.md`): 20개 후킹을 형식에 배정한다. 한 묶음 안에 **인물형 ≥ 50%**, 폰 화면형 ≥ 20%, 나머지 혼합. 같은 형식은 최대 6개. 남녀·연령을 섞는다(메타 자동 타겟이 반응층을 찾게).
3. **인물 사진** (`image-prompts.md`): 크롬의 chatgpt.com 탭 3개로 병렬 생성 → 다운로드 → `ads/people/`. 같은 인물 반복 금지(파일 해시 중복 검사). 생성 실패 탭은 문구를 바꿔 재시도.
4. **빌드**: `python <스킬경로>/scripts/build_ads.py books/<slug>/09_ads.json --palette <id> [--only 01 05]` → `ads/out/NN.png` + `09_ads_sheet.png`. 빌더는 크롬 헤드리스로 렌더하고, 깨진 이미지·누락 슬롯을 경고한다.
5. **검수** (`checklist.md`): 시트를 직접 보고 겹침·가독성·심의 위험을 고친 뒤 시트를 보여준다. 사용자가 15개를 고른다(이미 돌고 있는 광고가 있으면 15 - 기존 개수).
6. **본문·헤드라인** (`copy.md`): 소재마다 본문 2~3줄 + 헤드라인 1줄. `09_upload_plan.md` 에 표로.
7. **업로드** (`meta-ops.md`): 사용자가 "원격 ㄱㄱ" 하면 올린다. 예산 변경·광고 켜기는 금액을 한 줄로 말하고 확인받은 뒤. 올린 결과를 `09_launch_log.md` 에 ID 와 함께 남긴다.

## 3. 바꾸지 않는 것

- **결핍을 찌르되 단정하지 않는다.** "당신 모솔이죠?"(X) → "착한데 남자로 안 느껴진대요"(장면). 2인칭으로 개인 특성(연애·재정·외모·건강)을 단정하면 메타 개인 특성 정책 위반.
- **수익·성과 약속 금지.** "월 500", "30억", "예상치 못한 수입" 같은 결과 약속은 광고에 넣지 않는다(상세페이지 저자 소개에 있는 사실도 광고에는 안 씀).
- **가짜 후기 금지.** AI 인물이 책 효과를 말하게 하지 않는다. 인물은 **결핍의 속마음만** 말한다. 실제 후기 카드는 실제 후기 원문만.
- **성적 암시 금지.** 노출·신체 부위 클로즈업·키스 장면 금지. "글래머러스·자신감"까지. 가슴골이 크게 보이는 사진은 첫 업로드에서 빼고 예비로 둔다.
- **사실이 아닌 저자 수식 금지**(예: 대화법 저자 '27년 모솔' 금지, '찐따 출신'만). intake 의 사실만.
- **책 표지가 주인공인 소재는 만들지 않는다**(책목업 4종 테스트: 6만 원, 구매 0). 표지는 구석에 작게.
- 한 이미지 = 한 메시지. 큰 문구 3줄 이내, 강조색 한 군데.
- 디자인 금지: 형광펜, 영문 대문자 라벨, 버튼 →(소재 CTA 의 › 는 허용), 가운뎃점 나열, em-dash. 한글은 keep-all.

## 4. 파일 지도

```
SKILL.md                     이 문서
references/hooks.md          후킹 공식·결핍 사다리·금지어·검증 문장
references/formats.md        형식 12종 명세 (레이아웃 수치 포함)
references/image-prompts.md  인물 프롬프트 공식 + ChatGPT 원격 생성 절차
references/copy.md           본문·헤드라인·버튼 규칙
references/meta-ops.md       캠페인 구조·업로드·증액·끄기·학습기간
references/checklist.md      검수표
references/results-log.md    실제 집행 결과 로그
references/ads-schema.json   09_ads.json 형식
references/example-richcode.json 리치코드 실제 예시(8개 형식 전부, 빌더 테스트 통과)
scripts/build_ads.py         09_ads.json + 팔레트 → PNG 소재 + 시트
scripts/upload_image.py      PNG → 공개 URL (메타 MCP image_url 용)
```

## 5. 생성기(ebook-autopilot)에 붙이는 법

`references/pipeline.md` 의 08 다음에 아래를 추가한다.

```
### 09 메타 광고 소재 (ebook-meta-ads)
- 입력: 02_market.md(고객 언어·통념) + 04_book.json(프롤로그) + 05 표지 + 08_salespage(링크·팔레트)
- 절차: ebook-meta-ads SKILL.md 2장 그대로. 승인 게이트 3개(후킹 20 선택 / 소재 15 선택 / 업로드·예산).
- 출력: 09_hooks.md, 09_ads.json, ads/people/, ads/out/, 09_ads_sheet.png, 09_upload_plan.md, (업로드 시) 09_launch_log.md
- auto 모드에서도 승인 ③(돈이 나가는 업로드·예산)은 건너뛰지 않는다.
```
`status.js` 단계 목록에 `09_ads` 를 추가한다.
