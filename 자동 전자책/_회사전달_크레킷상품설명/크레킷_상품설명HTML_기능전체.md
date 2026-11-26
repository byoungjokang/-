# 크레킷 딜·범프딜 상품설명 HTML 자동 만들기 · 전체 명세 + 원본 코드

- 기준: 전자책 생성기 **버전 2026.11.26c** (라이브 https://claude.ai/artifact/FAqAox5isaZSMtRTHRGroy 와 같은 코드)
- 위치: **09 상세페이지** 탭 맨 아래 "상품설명 HTML 자동 만들기"
- 목적: 크레킷에 딜(본책)이나 범프딜(부록)을 등록할 때 **상품설명 칸에 붙여 넣는 짧은 페이지**를 바로 만들어 줌. 구매 절차 3단계 + 유의사항 + 저작권 줄.
- **AI 지시문은 없어요.** 정해진 틀에 문구·색만 넣어 만드는 기능이라 AI를 부르지 않아요. 그래서 아래 **틀(HTML), 기본 문구, 색 계산식, 화면, 원본 코드**만 그대로 옮기면 똑같이 동작해요.
- 사용자가 바꿀 수 있는 것: **색과 문구뿐**(병조쌤 요청). 구조는 고정.

---

## 1. 화면 흐름 (위에서부터 이 순서)

1. **종류 고르기**: `본책 딜` / `범프딜 (부록)` (본책·범프딜 문구는 따로 저장)
2. **색 고르기**: 프리셋 버튼 + 배경·강조·글자 색 칸 3개
3. **상품설명 HTML 코드 복사** 버튼
4. **휴대폰 미리보기** (iframe, 높이 760px)
5. **문구 고치기** (열린 상태로 보임, 바꾸면 0.25초 뒤 미리보기 갱신)
6. **상품설명 HTML 코드 복사** 버튼 하나 더 (위 버튼과 같음)
7. **HTML 코드 보기** (접힌 상태, 읽기 전용 textarea)

- 복사 성공: "본책 딜(또는 범프딜) 상품설명 HTML을 복사했어요. 크레킷 딜 등록 화면의 상품설명 HTML 칸에 붙여 넣으세요."
- 복사가 막히면: 코드 보기를 펼치고 전체 선택 + "자동 복사가 막혀서 코드를 선택해 뒀어요. Ctrl+C(맥은 Cmd+C)를 누르세요."
- "이 종류 기본 문구로 되돌리기": 지금 종류의 문구만 기본값으로 (저작권 줄도 자동값으로 돌아감)
- 탭에 들어올 때마다 미리보기를 다시 그림 (저작권 줄 자동값이 최신 책 정보로 바뀌게)
- 설정(종류·프리셋·3색·두 종류 문구)은 작업 자동 저장에 `dealSet`으로 들어가 새로고침해도 남음

## 2. 고칠 수 있는 문구 (칸 이름 · 기본값)

| 칸 | 화면 이름 | 본책 딜 기본값 | 범프딜 기본값 |
|---|---|---|---|
| `lab1` | 위 작은 글씨 | HOW TO START | HOW TO START |
| `h1` | 제목 | 구매 후 이용 절차 | 구매 후 이용 절차 |
| `s1t` / `s1d` | 1단계 제목 / 설명 | 결제 완료 / 결제 시 정확한 이메일 주소를 입력해 주세요. | 결제 완료 / 본책 결제 화면에서 이 부록을 함께 선택하고, 정확한 이메일 주소를 입력해 주세요. |
| `s2t` / `s2d` | 2단계 | 다운로드 링크 발급 (결제 즉시) / 입력하신 이메일로 전자책 다운로드 링크가 바로 발송됩니다. | 다운로드 링크 발급 (결제 즉시) / 입력하신 이메일로 부록 PDF 다운로드 링크가 바로 발송됩니다. |
| `s3t` / `s3d` | 3단계 | 다운로드 후 바로 열람 / 별도 가입 절차 없이, 다운로드한 파일을 바로 읽으실 수 있습니다. | (본책과 같음) |
| `lab2` | 유의사항 위 작은 글씨 | NOTICE | NOTICE |
| `h2` | 유의사항 제목 | 구매 전 확인해 주세요 | 구매 전 확인해 주세요 |
| `notes` | 유의사항 (한 줄에 하나, `**굵게**`) | 아래 5줄 | 아래 5줄 |
| `foot` | 맨 아래 저작권 줄 | 자동: `© 브랜드 · ALL RIGHTS RESERVED` | 같음 |

유의사항 기본 5줄 (본책):
```
본 상품은 **PDF 전자책**이며, 별도의 실물 배송은 없습니다.
파일 다운로드 및 열람에는 **인터넷 연결**이 필요합니다.
전자책 및 수록 콘텐츠의 **무단 복제·배포·공유**는 저작권법에 의해 금지됩니다.
효과는 개인의 실천 정도에 따라 차이가 있을 수 있습니다.
디지털 콘텐츠 특성상 다운로드 후에는 환불이 제한될 수 있습니다.
```
범프딜은 1줄째가 `본 상품은 **PDF 부록(범프딜)**이며, 별도의 실물 배송은 없습니다.`, 3줄째가 `부록 및 수록 콘텐츠의 …`로 바뀌어요.

- **브랜드**(저작권 줄 자동값): 상세페이지 데이터의 `meta.brand` → 작가 이름 → 책 제목 → `BOOK` 순서로 처음 있는 값. 사용자가 저작권 줄을 직접 고치면 그 값을 저장해서 씀.
- 한 줄 칸은 줄바꿈을 빈칸으로 바꿔 저장. 모든 글은 HTML 이스케이프(`& < > "`) 후 넣음. 유의사항의 `**글자**`만 `<strong>`으로 바꿈.

## 3. 색

### 3-1. 프리셋 (배경 · 강조 · 글자)

| id | 이름 | 배경 | 강조 | 글자 |
|---|---|---|---|---|
| red | 블랙·레드 (기본) | #050505 | #c0392b | #f0f0f0 |
| gold | 블랙·골드 | #0b0b0b | #d4a017 | #f4ecd0 |
| navy | 네이비·하늘 | #0f1729 | #4fa3d1 | #eef2f8 |
| white | 화이트·레드 | #ffffff | #c0392b | #1d1d1f |
| ivory | 아이보리·브라운 | #faf6ee | #8a5a2b | #2b2118 |
| sp | 상세페이지 색 따라가기 | 상세페이지 팔레트의 bg | accent | text |

- `sp`는 상세페이지를 만든 뒤에만 보이고, 선택돼 있으면 그릴 때마다 지금 상세페이지 팔레트 색을 다시 가져와요.
- 색 칸 3개 중 하나를 직접 바꾸면 프리셋은 `custom`(아무 버튼도 눌리지 않은 상태)이 돼요.

### 3-2. 나머지 색은 3색에서 자동 계산

`mix(a, b, t)` = a와 b를 RGB로 t만큼 섞기 (t=0이면 a). `밝은 배경` = 배경 밝기(0.299R+0.587G+0.114B)/255 > 0.55.

| 쓰는 곳 | 계산 |
|---|---|
| 제목·단계 제목·굵은 글씨 (`head`) | 밝은 배경이면 글자색, 어두우면 mix(글자, #ffffff, 0.6) |
| 단계 설명 (`sub`) | mix(글자, 배경, 0.36) |
| 유의사항 글 (`note`) | mix(글자, 배경, 0.22) |
| 저작권 줄 (`foot`) | mix(글자, 배경, 0.59) |
| 작은 글씨 양옆 선 (`dim`) | mix(강조, 배경, 0.55) |
| STEP 01 라벨 (`stepLab`) | 밝은 배경이면 강조색, 어두우면 mix(강조, #ffffff, 0.3)을 투명도 0.8 |
| 유의사항 바탕 (`nbg`) | mix(배경, 강조, 밝은 배경 0.05 / 어두운 배경 0.06) |
| 유의사항 위아래 선 | 강조색 투명도 0.28 |
| 카드 테두리·바탕·저작권 위 선 | 어두운 배경: 흰색 0.08 / 0.02 / 0.04, 밝은 배경: 검정 같은 값 |

(기본 블랙·레드로 계산하면 병조쌤이 준 원본 양식의 #999, #bbb, #666, #5b0910, #120606에 거의 같게 나와요.)

## 4. 결과 HTML 틀 (예시 출력 · 원본 그대로)

### 4-1. 본책 딜 · 블랙·레드 (저작권 줄을 "© 브랜드명 · ALL RIGHTS RESERVED"로 넣은 예)

```html
<div style="background-color:#050505;color:#f0f0f0;font-family:'Pretendard','Apple SD Gothic Neo','Malgun Gothic',sans-serif;font-weight:300;line-height:1.8;margin:0;padding:0;overflow-x:hidden;word-break:keep-all;">
<!-- ═══════════ 구매 절차 ═══════════ -->
<div style="padding:70px 20px;max-width:720px;margin:0 auto;">
  <p style="text-align:center;margin:0 0 22px 0;font-size:11px;letter-spacing:5px;color:#c0392b;font-weight:600;">
    <span style="display:inline-block;width:22px;height:1px;background:#591c16;vertical-align:middle;margin-right:12px;"></span>HOW TO START<span style="display:inline-block;width:22px;height:1px;background:#591c16;vertical-align:middle;margin-left:12px;"></span>
  </p>
  <h2 style="text-align:center;font-size:24px;font-weight:900;line-height:1.4;margin:0 0 40px 0;color:#f9f9f9;">구매 후 이용 절차</h2>
  <div style="max-width:420px;margin:0 auto;">
    <div style="border-left:3px solid #c0392b;padding:4px 0 4px 20px;margin-bottom:24px;">
      <p style="font-size:11px;font-weight:800;color:rgba(211,116,107,0.8);margin:0 0 5px 0;letter-spacing:2px;">STEP 01</p>
      <p style="font-size:15.5px;color:#f9f9f9;margin:0 0 5px 0;font-weight:600;">결제 완료</p>
      <p style="font-size:13px;color:#9b9b9b;margin:0;line-height:1.9;">결제 시 정확한 이메일 주소를 입력해 주세요.</p>
    </div>
    <div style="border-left:3px solid #c0392b;padding:4px 0 4px 20px;margin-bottom:24px;">
      <p style="font-size:11px;font-weight:800;color:rgba(211,116,107,0.8);margin:0 0 5px 0;letter-spacing:2px;">STEP 02</p>
      <p style="font-size:15.5px;color:#f9f9f9;margin:0 0 5px 0;font-weight:600;">다운로드 링크 발급 (결제 즉시)</p>
      <p style="font-size:13px;color:#9b9b9b;margin:0;line-height:1.9;">입력하신 이메일로 전자책 다운로드 링크가 바로 발송됩니다.</p>
    </div>
    <div style="border-left:3px solid #c0392b;padding:4px 0 4px 20px;">
      <p style="font-size:11px;font-weight:800;color:rgba(211,116,107,0.8);margin:0 0 5px 0;letter-spacing:2px;">STEP 03</p>
      <p style="font-size:15.5px;color:#f9f9f9;margin:0 0 5px 0;font-weight:600;">다운로드 후 바로 열람</p>
      <p style="font-size:13px;color:#9b9b9b;margin:0;line-height:1.9;">별도 가입 절차 없이, 다운로드한 파일을 바로 읽으실 수 있습니다.</p>
    </div>
  </div>
</div>
<!-- ═══════════ 유의사항 ═══════════ -->
<div style="background:#100807;border-top:1px solid rgba(192,57,43,0.28);border-bottom:1px solid rgba(192,57,43,0.28);padding:70px 20px;max-width:720px;margin:0 auto;">
  <p style="text-align:center;margin:0 0 22px 0;font-size:11px;letter-spacing:5px;color:#c0392b;font-weight:600;">
    <span style="display:inline-block;width:22px;height:1px;background:#591c16;vertical-align:middle;margin-right:12px;"></span>NOTICE<span style="display:inline-block;width:22px;height:1px;background:#591c16;vertical-align:middle;margin-left:12px;"></span>
  </p>
  <h2 style="text-align:center;font-size:24px;font-weight:900;line-height:1.4;margin:0 0 40px 0;color:#f9f9f9;">구매 전 확인해 주세요</h2>
  <div style="max-width:460px;margin:0 auto;border:1px solid rgba(255,255,255,0.08);background:rgba(255,255,255,0.02);">
    <div style="height:2px;background:#c0392b;"></div>
    <div style="padding:24px 22px;">
      <p style="font-size:13.5px;color:#bcbcbc;line-height:2.3;margin:0;">
        <span style="color:#c0392b;margin-right:9px;">·</span>본 상품은 <strong style="color:#f9f9f9;">PDF 전자책</strong>이며, 별도의 실물 배송은 없습니다.<br>
        <span style="color:#c0392b;margin-right:9px;">·</span>파일 다운로드 및 열람에는 <strong style="color:#f9f9f9;">인터넷 연결</strong>이 필요합니다.<br>
        <span style="color:#c0392b;margin-right:9px;">·</span>전자책 및 수록 콘텐츠의 <strong style="color:#f9f9f9;">무단 복제·배포·공유</strong>는 저작권법에 의해 금지됩니다.<br>
        <span style="color:#c0392b;margin-right:9px;">·</span>효과는 개인의 실천 정도에 따라 차이가 있을 수 있습니다.<br>
        <span style="color:#c0392b;margin-right:9px;">·</span>디지털 콘텐츠 특성상 다운로드 후에는 환불이 제한될 수 있습니다.
      </p>
    </div>
  </div>
</div>
<!-- ═══════════ FOOTER ═══════════ -->
<div style="text-align:center;padding:36px 20px 80px;border-top:1px solid rgba(255,255,255,0.04);font-size:11px;color:#656565;letter-spacing:2px;">
  © 브랜드명 · ALL RIGHTS RESERVED
</div>

</div>
```

### 4-2. 범프딜 · 화이트·레드

```html
<div style="background-color:#ffffff;color:#1d1d1f;font-family:'Pretendard','Apple SD Gothic Neo','Malgun Gothic',sans-serif;font-weight:300;line-height:1.8;margin:0;padding:0;overflow-x:hidden;word-break:keep-all;">
<!-- ═══════════ 구매 절차 ═══════════ -->
<div style="padding:70px 20px;max-width:720px;margin:0 auto;">
  <p style="text-align:center;margin:0 0 22px 0;font-size:11px;letter-spacing:5px;color:#c0392b;font-weight:600;">
    <span style="display:inline-block;width:22px;height:1px;background:#e3a6a0;vertical-align:middle;margin-right:12px;"></span>HOW TO START<span style="display:inline-block;width:22px;height:1px;background:#e3a6a0;vertical-align:middle;margin-left:12px;"></span>
  </p>
  <h2 style="text-align:center;font-size:24px;font-weight:900;line-height:1.4;margin:0 0 40px 0;color:#1d1d1f;">구매 후 이용 절차</h2>
  <div style="max-width:420px;margin:0 auto;">
    <div style="border-left:3px solid #c0392b;padding:4px 0 4px 20px;margin-bottom:24px;">
      <p style="font-size:11px;font-weight:800;color:#c0392b;margin:0 0 5px 0;letter-spacing:2px;">STEP 01</p>
      <p style="font-size:15.5px;color:#1d1d1f;margin:0 0 5px 0;font-weight:600;">결제 완료</p>
      <p style="font-size:13px;color:#6e6e70;margin:0;line-height:1.9;">본책 결제 화면에서 이 부록을 함께 선택하고, 정확한 이메일 주소를 입력해 주세요.</p>
    </div>
    <div style="border-left:3px solid #c0392b;padding:4px 0 4px 20px;margin-bottom:24px;">
      <p style="font-size:11px;font-weight:800;color:#c0392b;margin:0 0 5px 0;letter-spacing:2px;">STEP 02</p>
      <p style="font-size:15.5px;color:#1d1d1f;margin:0 0 5px 0;font-weight:600;">다운로드 링크 발급 (결제 즉시)</p>
      <p style="font-size:13px;color:#6e6e70;margin:0;line-height:1.9;">입력하신 이메일로 부록 PDF 다운로드 링크가 바로 발송됩니다.</p>
    </div>
    <div style="border-left:3px solid #c0392b;padding:4px 0 4px 20px;">
      <p style="font-size:11px;font-weight:800;color:#c0392b;margin:0 0 5px 0;letter-spacing:2px;">STEP 03</p>
      <p style="font-size:15.5px;color:#1d1d1f;margin:0 0 5px 0;font-weight:600;">다운로드 후 바로 열람</p>
      <p style="font-size:13px;color:#6e6e70;margin:0;line-height:1.9;">별도 가입 절차 없이, 다운로드한 파일을 바로 읽으실 수 있습니다.</p>
    </div>
  </div>
</div>
<!-- ═══════════ 유의사항 ═══════════ -->
<div style="background:#fcf5f4;border-top:1px solid rgba(192,57,43,0.28);border-bottom:1px solid rgba(192,57,43,0.28);padding:70px 20px;max-width:720px;margin:0 auto;">
  <p style="text-align:center;margin:0 0 22px 0;font-size:11px;letter-spacing:5px;color:#c0392b;font-weight:600;">
    <span style="display:inline-block;width:22px;height:1px;background:#e3a6a0;vertical-align:middle;margin-right:12px;"></span>NOTICE<span style="display:inline-block;width:22px;height:1px;background:#e3a6a0;vertical-align:middle;margin-left:12px;"></span>
  </p>
  <h2 style="text-align:center;font-size:24px;font-weight:900;line-height:1.4;margin:0 0 40px 0;color:#1d1d1f;">구매 전 확인해 주세요</h2>
  <div style="max-width:460px;margin:0 auto;border:1px solid rgba(0,0,0,0.08);background:rgba(0,0,0,0.02);">
    <div style="height:2px;background:#c0392b;"></div>
    <div style="padding:24px 22px;">
      <p style="font-size:13.5px;color:#4f4f50;line-height:2.3;margin:0;">
        <span style="color:#c0392b;margin-right:9px;">·</span>본 상품은 <strong style="color:#1d1d1f;">PDF 부록(범프딜)</strong>이며, 별도의 실물 배송은 없습니다.<br>
        <span style="color:#c0392b;margin-right:9px;">·</span>파일 다운로드 및 열람에는 <strong style="color:#1d1d1f;">인터넷 연결</strong>이 필요합니다.<br>
        <span style="color:#c0392b;margin-right:9px;">·</span>부록 및 수록 콘텐츠의 <strong style="color:#1d1d1f;">무단 복제·배포·공유</strong>는 저작권법에 의해 금지됩니다.<br>
        <span style="color:#c0392b;margin-right:9px;">·</span>효과는 개인의 실천 정도에 따라 차이가 있을 수 있습니다.<br>
        <span style="color:#c0392b;margin-right:9px;">·</span>디지털 콘텐츠 특성상 다운로드 후에는 환불이 제한될 수 있습니다.
      </p>
    </div>
  </div>
</div>
<!-- ═══════════ FOOTER ═══════════ -->
<div style="text-align:center;padding:36px 20px 80px;border-top:1px solid rgba(0,0,0,0.04);font-size:11px;color:#a2a2a3;letter-spacing:2px;">
  © 브랜드명 · ALL RIGHTS RESERVED
</div>

</div>
```

- 병조쌤이 준 양식과 구조·인라인 스타일이 같고, 맨 바깥 div에 `word-break:keep-all;`만 더했어요(휴대폰에서 단어 중간 줄바꿈 방지).
- 미리보기 iframe은 위 HTML을 `<body style="margin:0">` 안에 넣고, Pretendard 글꼴 CSS(`https://cdn.jsdelivr.net/gh/orioncactus/pretendard/dist/web/static/pretendard.css`)를 머리에 붙여 보여 줘요. **복사되는 코드에는 이 글꼴 링크가 없어요**(원본 양식과 같게). 크레킷에 Pretendard가 없으면 Apple SD Gothic Neo·맑은 고딕으로 보여요.

---

## 5. 원본 코드 전체

### 5-1. CSS (생성기 화면 스타일)

```css
  .dl-box { border-top: 2px solid var(--accent); margin-top: 26px; padding-top: 22px; display: flex; flex-direction: column; gap: 16px; }
  .dl-presets { display: flex; flex-wrap: wrap; gap: 8px; }
  .dl-presets button { font: inherit; font-size: 14px; font-weight: 700; display: inline-flex; align-items: center; gap: 8px; padding: 9px 14px; border-radius: var(--r); border: 1px solid var(--line-strong); background: transparent; color: var(--ink-soft); cursor: pointer; }
  .dl-presets button[aria-pressed="true"] { border-color: var(--accent); color: var(--accent); background: var(--accent-wash); }
  .dl-presets i { display: inline-flex; width: 30px; height: 18px; border-radius: 4px; overflow: hidden; border: 1px solid #555; flex: none; }
  .dl-presets i b { flex: 1; }
  .dl-colors { display: flex; flex-wrap: wrap; gap: 16px; font-size: 15px; color: var(--ink-soft); margin-top: 6px; }
  .dl-colors label { display: inline-flex; align-items: center; gap: 8px; }
  .dl-colors input[type=color] { width: 44px; height: 34px; padding: 0; border: 1px solid var(--line-strong); border-radius: 6px; background: none; cursor: pointer; }
  .dl-step { border-left: 3px solid var(--accent); padding-left: 12px; display: flex; flex-direction: column; gap: 6px; }
```

### 5-2. HTML (화면)

```html
      <div class="dl-box" id="dealBox">
        <div class="final-head">
          <div class="eyebrow" style="margin:0">크레킷 딜 등록용</div>
          <div class="final-title" style="font-size:clamp(22px,5vw,30px)">상품설명 HTML 자동 만들기</div>
          <div class="final-sub">크레킷에서 딜(본책)이나 범프딜(부록)을 등록할 때 상품설명 칸에 붙여 넣는 짧은 페이지예요. 구매 절차 3단계, 유의사항, 맨 아래 저작권 줄로 되어 있어요. 색과 문구만 바꾸고 'HTML 코드 복사'를 누르면 돼요.</div>
        </div>
        <div class="seg" role="group" aria-label="상품 종류">
          <button type="button" class="seg-btn" id="dlMain" aria-pressed="true">본책 딜</button>
          <button type="button" class="seg-btn" id="dlBump" aria-pressed="false">범프딜 (부록)</button>
        </div>
        <div class="field">
          <div class="lbl">색 <small>눌러서 고르거나, 아래 칸을 눌러 직접 고르세요</small></div>
          <div class="dl-presets" id="dlPresets"></div>
          <div class="dl-colors"><label>배경 <input type="color" id="dlBg"></label><label>강조 <input type="color" id="dlAccent"></label><label>글자 <input type="color" id="dlText"></label></div>
        </div>
        <button class="btn sl-copy" id="dlCopy" type="button">상품설명 HTML 코드 복사</button>
        <p class="note" id="dlNote" hidden></p>
        <div class="sl-phone" style="height:760px"><iframe id="dlFrame" title="상품설명 휴대폰 미리보기"></iframe></div>
        <details class="sl-more" open><summary class="sl-sum">문구 고치기 <small style="font-weight:400;color:var(--ink-faint)">· 바꾸면 미리보기에 바로 반영돼요</small></summary>
          <div class="row2">
            <div class="field"><label class="lbl" for="dl_lab1">위 작은 글씨</label><input type="text" id="dl_lab1" data-dl="lab1"></div>
            <div class="field"><label class="lbl" for="dl_h1">제목</label><input type="text" id="dl_h1" data-dl="h1"></div>
          </div>
          <div class="dl-step"><div class="lbl">1단계</div><input type="text" data-dl="s1t" aria-label="1단계 제목"><input type="text" data-dl="s1d" aria-label="1단계 설명"></div>
          <div class="dl-step"><div class="lbl">2단계</div><input type="text" data-dl="s2t" aria-label="2단계 제목"><input type="text" data-dl="s2d" aria-label="2단계 설명"></div>
          <div class="dl-step"><div class="lbl">3단계</div><input type="text" data-dl="s3t" aria-label="3단계 제목"><input type="text" data-dl="s3d" aria-label="3단계 설명"></div>
          <div class="row2">
            <div class="field"><label class="lbl" for="dl_lab2">유의사항 위 작은 글씨</label><input type="text" id="dl_lab2" data-dl="lab2"></div>
            <div class="field"><label class="lbl" for="dl_h2">유의사항 제목</label><input type="text" id="dl_h2" data-dl="h2"></div>
          </div>
          <div class="field"><label class="lbl" for="dl_notes">유의사항 <small>한 줄에 하나 · **두 별표** 사이 글자는 굵게</small></label><textarea id="dl_notes" data-dl="notes" style="min-height:150px"></textarea></div>
          <div class="field"><label class="lbl" for="dl_foot">맨 아래 저작권 줄</label><input type="text" id="dl_foot" data-dl="foot"></div>
          <button class="btn ghost" id="dlReset" type="button">이 종류 기본 문구로 되돌리기</button>
        </details>
        <button class="btn sl-copy" id="dlCopy2" type="button">상품설명 HTML 코드 복사</button>
        <details><summary class="sl-sum">HTML 코드 보기</summary>
          <textarea id="dlCode" readonly style="min-height:200px;font-family:ui-monospace,Menlo,Consolas,monospace;font-size:12px;line-height:1.5;"></textarea>
        </details>
      </div>
```

### 5-3. 기능 JS 전체

```js
  // ── 크레킷 딜 등록용 상품설명 HTML (11.26b) ──
  // 본책 딜·범프딜 상품설명 칸에 붙일 짧은 페이지(구매 절차 3단계 + 유의사항 + 저작권 줄). AI 없이 틀에 문구·색만 넣는다.
  const DL_TXT = {
    main: { lab1: "HOW TO START", h1: "구매 후 이용 절차", s1t: "결제 완료", s1d: "결제 시 정확한 이메일 주소를 입력해 주세요.", s2t: "다운로드 링크 발급 (결제 즉시)", s2d: "입력하신 이메일로 전자책 다운로드 링크가 바로 발송됩니다.", s3t: "다운로드 후 바로 열람", s3d: "별도 가입 절차 없이, 다운로드한 파일을 바로 읽으실 수 있습니다.", lab2: "NOTICE", h2: "구매 전 확인해 주세요",
      notes: "본 상품은 **PDF 전자책**이며, 별도의 실물 배송은 없습니다.\n파일 다운로드 및 열람에는 **인터넷 연결**이 필요합니다.\n전자책 및 수록 콘텐츠의 **무단 복제·배포·공유**는 저작권법에 의해 금지됩니다.\n효과는 개인의 실천 정도에 따라 차이가 있을 수 있습니다.\n디지털 콘텐츠 특성상 다운로드 후에는 환불이 제한될 수 있습니다." },
    bump: { lab1: "HOW TO START", h1: "구매 후 이용 절차", s1t: "결제 완료", s1d: "본책 결제 화면에서 이 부록을 함께 선택하고, 정확한 이메일 주소를 입력해 주세요.", s2t: "다운로드 링크 발급 (결제 즉시)", s2d: "입력하신 이메일로 부록 PDF 다운로드 링크가 바로 발송됩니다.", s3t: "다운로드 후 바로 열람", s3d: "별도 가입 절차 없이, 다운로드한 파일을 바로 읽으실 수 있습니다.", lab2: "NOTICE", h2: "구매 전 확인해 주세요",
      notes: "본 상품은 **PDF 부록(범프딜)**이며, 별도의 실물 배송은 없습니다.\n파일 다운로드 및 열람에는 **인터넷 연결**이 필요합니다.\n부록 및 수록 콘텐츠의 **무단 복제·배포·공유**는 저작권법에 의해 금지됩니다.\n효과는 개인의 실천 정도에 따라 차이가 있을 수 있습니다.\n디지털 콘텐츠 특성상 다운로드 후에는 환불이 제한될 수 있습니다." },
  };
  const DL_PRESETS = [
    ["red", "블랙·레드", "#050505", "#c0392b", "#f0f0f0"], ["gold", "블랙·골드", "#0b0b0b", "#d4a017", "#f4ecd0"], ["navy", "네이비·하늘", "#0f1729", "#4fa3d1", "#eef2f8"],
    ["white", "화이트·레드", "#ffffff", "#c0392b", "#1d1d1f"], ["ivory", "아이보리·브라운", "#faf6ee", "#8a5a2b", "#2b2118"], ["sp", "상세페이지 색 따라가기", "", "", ""],
  ];
  let dl = { mode: "main", preset: "red", c: { bg: "#050505", accent: "#c0392b", text: "#f0f0f0" }, t: { main: { ...DL_TXT.main }, bump: { ...DL_TXT.bump } } };
  const dlRgb = (h) => { h = String(h || "#000").replace("#", ""); if (h.length === 3) h = h.split("").map(x => x + x).join(""); const n = parseInt(h.slice(0, 6), 16) || 0; return [n >> 16 & 255, n >> 8 & 255, n & 255]; };
  const dlMix = (a, b, t) => "#" + dlRgb(a).map((v, i) => Math.round(v * (1 - t) + dlRgb(b)[i] * t).toString(16).padStart(2, "0")).join("");
  const dlA = (h, a) => `rgba(${dlRgb(h).join(",")},${a})`;
  const dlLight = (h) => { const [r, g, b] = dlRgb(h); return (0.299 * r + 0.587 * g + 0.114 * b) / 255 > 0.55; };
  function dlBrand() { const I = spInputs(); return (spData?.meta?.brand || I.author || I.title || "BOOK").trim(); }
  const dlFoot = () => dl.t[dl.mode].foot ?? `© ${dlBrand()} · ALL RIGHTS RESERVED`;
  function dlHtml() {
    const T = dl.t[dl.mode], { bg, accent, text } = dl.c, L = dlLight(bg);
    const head = L ? text : dlMix(text, "#ffffff", 0.6), sub = dlMix(text, bg, 0.36), note = dlMix(text, bg, 0.22), foot = dlMix(text, bg, 0.59);
    const dim = dlMix(accent, bg, 0.55), stepLab = L ? accent : dlA(dlMix(accent, "#ffffff", 0.3), 0.8), nbg = dlMix(bg, accent, L ? 0.05 : 0.06);
    const w = L ? "0,0,0" : "255,255,255", e = (x) => hesc(String(x || "").trim());
    const lab = (x) => `  <p style="text-align:center;margin:0 0 22px 0;font-size:11px;letter-spacing:5px;color:${accent};font-weight:600;">
    <span style="display:inline-block;width:22px;height:1px;background:${dim};vertical-align:middle;margin-right:12px;"></span>${e(x)}<span style="display:inline-block;width:22px;height:1px;background:${dim};vertical-align:middle;margin-left:12px;"></span>
  </p>`;
    const step = (n, t, d, last) => `    <div style="border-left:3px solid ${accent};padding:4px 0 4px 20px;${last ? "" : "margin-bottom:24px;"}">
      <p style="font-size:11px;font-weight:800;color:${stepLab};margin:0 0 5px 0;letter-spacing:2px;">STEP 0${n}</p>
      <p style="font-size:15.5px;color:${head};margin:0 0 5px 0;font-weight:600;">${e(t)}</p>
      <p style="font-size:13px;color:${sub};margin:0;line-height:1.9;">${e(d)}</p>
    </div>`;
    const notes = String(T.notes || "").split("\n").map(x => x.trim()).filter(Boolean).map(x => `        <span style="color:${accent};margin-right:9px;">·</span>${e(x).replace(/\*\*(.+?)\*\*/g, `<strong style="color:${head};">$1</strong>`)}`).join("<br>\n");
    return `<div style="background-color:${bg};color:${text};font-family:'Pretendard','Apple SD Gothic Neo','Malgun Gothic',sans-serif;font-weight:300;line-height:1.8;margin:0;padding:0;overflow-x:hidden;word-break:keep-all;">
<!-- ═══════════ 구매 절차 ═══════════ -->
<div style="padding:70px 20px;max-width:720px;margin:0 auto;">
${lab(T.lab1)}
  <h2 style="text-align:center;font-size:24px;font-weight:900;line-height:1.4;margin:0 0 40px 0;color:${head};">${e(T.h1)}</h2>
  <div style="max-width:420px;margin:0 auto;">
${step(1, T.s1t, T.s1d)}
${step(2, T.s2t, T.s2d)}
${step(3, T.s3t, T.s3d, true)}
  </div>
</div>
<!-- ═══════════ 유의사항 ═══════════ -->
<div style="background:${nbg};border-top:1px solid ${dlA(accent, 0.28)};border-bottom:1px solid ${dlA(accent, 0.28)};padding:70px 20px;max-width:720px;margin:0 auto;">
${lab(T.lab2)}
  <h2 style="text-align:center;font-size:24px;font-weight:900;line-height:1.4;margin:0 0 40px 0;color:${head};">${e(T.h2)}</h2>
  <div style="max-width:460px;margin:0 auto;border:1px solid rgba(${w},0.08);background:rgba(${w},0.02);">
    <div style="height:2px;background:${accent};"></div>
    <div style="padding:24px 22px;">
      <p style="font-size:13.5px;color:${note};line-height:2.3;margin:0;">
${notes}
      </p>
    </div>
  </div>
</div>
<!-- ═══════════ FOOTER ═══════════ -->
<div style="text-align:center;padding:36px 20px 80px;border-top:1px solid rgba(${w},0.04);font-size:11px;color:${foot};letter-spacing:2px;">
  ${e(dlFoot())}
</div>

</div>`;
  }
  function dlSpColors() { const P = SP?.palettes?.[spPal]; return P ? { bg: P.bg, accent: P.accent, text: P.text } : null; }
  function dlFill() {
    const T = dl.t[dl.mode];
    document.querySelectorAll("[data-dl]").forEach(el => { const k = el.dataset.dl; el.value = k === "foot" ? dlFoot() : (T[k] ?? ""); });
    $("dlMain").setAttribute("aria-pressed", String(dl.mode === "main")); $("dlBump").setAttribute("aria-pressed", String(dl.mode === "bump"));
    $("dlBg").value = dl.c.bg; $("dlAccent").value = dl.c.accent; $("dlText").value = dl.c.text;
    $("dlPresets").innerHTML = DL_PRESETS.map(([id, name, b, a, t]) => {
      const sp = id === "sp" ? dlSpColors() : null; if (id === "sp" && !sp) return "";
      const [B, A, X] = sp ? [sp.bg, sp.accent, sp.text] : [b, a, t];
      return `<button type="button" data-dlp="${id}" aria-pressed="${dl.preset === id}"><i><b style="background:${B}"></b><b style="background:${A}"></b><b style="background:${X}"></b></i>${name}</button>`;
    }).join("");
  }
  let dlTimer = 0;
  function dlRender() {
    if (!$("dlFrame")) return;
    if (dl.preset === "sp") { const c = dlSpColors(); if (c) dl.c = c; }
    const html = dlHtml();
    $("dlCode").value = html;
    $("dlFrame").srcdoc = `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard/dist/web/static/pretendard.css"></head><body style="margin:0">${html}</body></html>`;
    if (!document.activeElement?.dataset?.dl) dlFill();
  }
  const dlSave = () => { clearTimeout(dlTimer); dlTimer = setTimeout(() => { dlRender(); autoSave().catch(() => {}); }, 250); };
  document.querySelectorAll("[data-dl]").forEach(el => el.addEventListener("input", () => {
    const k = el.dataset.dl; dl.t[dl.mode][k] = k === "notes" ? el.value : el.value.replace(/\n/g, " "); dlSave();
  }));
  $("dlPresets").addEventListener("click", (ev) => {
    const b = ev.target.closest("[data-dlp]"); if (!b) return;
    const id = b.dataset.dlp, p = DL_PRESETS.find(x => x[0] === id);
    dl.preset = id; dl.c = id === "sp" ? (dlSpColors() || dl.c) : { bg: p[2], accent: p[3], text: p[4] };
    dlFill(); dlRender(); autoSave().catch(() => {});
  });
  [["dlBg", "bg"], ["dlAccent", "accent"], ["dlText", "text"]].forEach(([id, k]) => $(id).addEventListener("input", () => { dl.c = { ...dl.c, [k]: $(id).value }; dl.preset = "custom"; $("dlPresets").querySelectorAll("[data-dlp]").forEach(x => x.setAttribute("aria-pressed", "false")); dlSave(); }));
  $("dlMain").addEventListener("click", () => { dl.mode = "main"; dlFill(); dlRender(); });
  $("dlBump").addEventListener("click", () => { dl.mode = "bump"; dlFill(); dlRender(); });
  $("dlReset").addEventListener("click", () => { dl.t[dl.mode] = { ...DL_TXT[dl.mode] }; dlFill(); dlRender(); autoSave().catch(() => {}); $("dlNote").hidden = true; });
  $("dlCopy2").addEventListener("click", () => $("dlCopy").click());
  $("dlCopy").addEventListener("click", async () => {
    const v = dlHtml(), n = $("dlNote");
    try { await navigator.clipboard.writeText(v); n.textContent = `${dl.mode === "bump" ? "범프딜" : "본책 딜"} 상품설명 HTML을 복사했어요. 크레킷 딜 등록 화면의 상품설명 HTML 칸에 붙여 넣으세요.`; n.className = "note ok"; }
    catch (e) { const ta = $("dlCode"); ta.closest("details").open = true; ta.focus(); ta.select(); n.textContent = "자동 복사가 막혀서 코드를 선택해 뒀어요. Ctrl+C(맥은 Cmd+C)를 누르세요."; n.className = "note err"; }
    n.hidden = false;
  });
  dlFill(); dlRender();
```

### 5-4. 기존 코드에 연결한 곳

① 상세페이지 탭에 들어올 때 다시 그리기

```js
  window.__renderSales = () => { dlRender(); if (spInfo() && !spBusy && spKey !== spKeyOf(spInputs()) && spFailKey !== spKeyOf(spInputs())) spRun(true); };
```

② 작업 자동 저장에 `dealSet` 추가

```js
      coverImage: withImage && coverBlob ? coverDataUrl.url : "", bodySpecs, spData, spUserImg, dealSet: dl, spKey, spPal, spPalWhy, spNotes, maData, maKey, maPal, maPalWhy, maNotes, stageStatus, bump,
```

③ 불러올 때 복원 (기본 문구 위에 저장된 값을 덮어씀)

```js
    if (st.dealSet?.t) { dl = { ...dl, ...st.dealSet, c: { ...dl.c, ...(st.dealSet.c || {}) }, t: { main: { ...DL_TXT.main, ...(st.dealSet.t.main || {}) }, bump: { ...DL_TXT.bump, ...(st.dealSet.t.bump || {}) } } }; dlFill(); dlRender(); }
```

### 5-5. 같이 쓰는 기존 함수

| 함수 | 하는 일 |
|---|---|
| `spInputs()` | 책 제목·작가 (저작권 줄 브랜드) |
| `spData.meta.brand` | 상세페이지 브랜드 (있으면 1순위) |
| `SP.palettes[spPal]` | 상세페이지 팔레트 (색 따라가기) |
| `hesc(x)` | HTML 이스케이프 (`& < > "`) |
| `autoSave()` | 작업 자동 저장 |
| `$(id)` | 요소 찾기 |

---

## 6. 회사 프로그램에 옮길 때 체크리스트

- [ ] 본책 딜 / 범프딜 문구를 따로 저장하는가
- [ ] 바꿀 수 있는 건 색 3개와 문구뿐이고 구조는 고정인가
- [ ] 나머지 색을 3장의 식대로 계산하는가 (밝은 배경 처리 포함)
- [ ] 문구를 HTML 이스케이프하고 `**굵게**`만 strong으로 바꾸는가
- [ ] 저작권 줄 자동값(브랜드 순서)과 직접 고친 값의 우선순위가 맞는가
- [ ] '기본 문구로 되돌리기'가 지금 종류만 되돌리는가
- [ ] 복사되는 코드가 4장 예시와 같은 모양인가 (글꼴 링크 없음, keep-all 있음)
- [ ] 범프딜 1단계 설명("본책 결제 화면에서 이 부록을 함께 선택")은 실제 크레킷 범프딜 결제 화면과 맞는지 확인 (생성기 쪽에서는 확인하지 못함)
