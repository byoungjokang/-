# 폰트 위계 가이드 — 리치코드 상세페이지

서체는 둘뿐이다. **Pretendard** (전부) + **Hahmlet** (히어로 h1 한 곳). 세리프를 다른 곳에 섞지 않는다.
모든 크기는 `clamp(최소, vw, 최대)` 로 모바일→데스크톱을 한 번에 잡는다. 아래 표의 값이 정본이다.

```css
--sans:'Pretendard','Apple SD Gothic Neo','Malgun Gothic',sans-serif;
--serif:'Hahmlet','Pretendard',serif;
body{font-family:var(--sans);font-weight:400;word-break:keep-all;overflow-wrap:break-word;-webkit-font-smoothing:antialiased}
```
폰트 CDN(크레킷 블록 `<style>` 맨 위):
```css
@import url('https://cdn.jsdelivr.net/gh/orioncactus/pretendard/dist/web/static/pretendard.css');
@import url('https://fonts.googleapis.com/css2?family=Hahmlet:wght@700;800&display=swap');
```

## 1. 위계표

| 단계 | 쓰는 곳 | 크기 | 굵기 | 행간 | 자간 | 색 |
|---|---|---|---|---|---|---|
| 표시 제목 (display) | 히어로 h1 | `clamp(42px,6vw,76px)` · 모바일 `clamp(36px,10vw,52px)` | 800 | 1.22 | -.04em | text, **Hahmlet** |
| 섹션 제목 h2 | 모든 섹션 제목 | `clamp(30px,4.4vw,52px)` | 800 | 1.3 | -.04em | text, 한 줄만 accent |
| 큰 h2 (reason) | 04 진짜 이유 | `clamp(30px,4.6vw,56px)` | 800 | 1.3 | -.04em | 〃 |
| 큰 숫자 | 가격 현재가 | `clamp(56px,7vw,72px)` | 900 | 1 | -.05em | accent-hi |
| 큰 문장 | 코드라인(섹션 마감 한 줄) | `clamp(24px,3.2vw,40px)` | 900 | 1.5 | -.045em | text + accent 단어 |
| 선택 질문 | 가격 choice | `clamp(28px,3.6vw,44px)` | 900 | 1.35 | -.05em | text / 둘째 줄 text-3 |
| 정직 h2 | 10 정직 선언 | `clamp(28px,3.8vw,44px)` | 800 | 1.3 | -.04em | text |
| 차이 첫 칸 h3 | 06 첫 카드 | `clamp(28px,3.4vw,40px)` | 800 | 1.35 | -.035em | text |
| h3 | 06 카드, 07 파트 제목 | `clamp(22px,2.4vw,28px)` / 목차 `clamp(20px,2.2vw,26px)` | 800 | 1.35~1.4 | -.035em | text |
| 판결문 (verdict) | 04 마지막 | `clamp(22px,2.4vw,28px)` | 800 | 1.55 | -.035em | text + accent 줄 |
| 박스 문장 (ignore) | 05 | `clamp(22px,2.4vw,28px)` | 800 | 1.5 | -.035em | text |
| 강조 문장 (forYou·faster) | 05·06 끝 | `clamp(20px,2.2vw,26px)` | 700~800 | 1.6~1.7 | -.03em | text |
| 전환 문장 (timeline turn/hit) | 02 4·5번째 | `clamp(19px,2vw,23px)` | 700 | 1.7 | -.03em | text |
| 리드 (lead) | h2 아래 설명 | `clamp(16.5px,1.7vw,19px)` | 400 | 1.9 | 0 | text-2 |
| 히어로 서사 | hero story | `clamp(17px,1.8vw,20px)` | 400 | 1.95 | 0 | text-2, strong=text, 마지막 strong=accent |
| 본문 (body) | 단락 | 17.5px | 400 | 2.0 | 0 | text-2, strong=text |
| 타임라인 본문 | 02 | 17.5px | 400 | 1.95 | 0 | text-2 |
| 체크 항목 | 03 버튼 | 18px (모바일 17px) | 600 | 1.55 | 0 | text |
| 후기 인용 | 09 blockquote | 16.5px | 400 | 1.95 | 0 | text |
| 카드 본문 | 06 p, 07 목차 li | 16.5px | 400 | 1.65~1.9 | 0 | text-2 |
| FAQ 질문 | summary | 18px | 700 | 1.55 | 0 | text |
| FAQ 답 | details p | 16.5px | 400 | 1.95 | 0 | text-2 |
| 버튼 | .btn | 17px (스티키 15px) | 800 | 1 | -.01em | 어두운 글자 on accent |
| 라벨 | 타임라인 b, 목차 PART b | 14px | 800 | 1 | 0 | accent-hi |
| 메타 | 목차 meta, 배지 tag | 15px / 13px | 700 / 900 | 1 | 0 | text / 어두운 글자 on accent |
| 캡션·주석 | figcaption, notes, fine, footer | 13~14px | 400~600 | 1.9 | 0 | text-3 |
| 사다리 | ladder li | 15px (현재 행 16px 800) | 400 | 1 | 0 | text-3 / 현재 text |
| 카운트다운 | .cd | 상단 15px · 타이머 `clamp(30px,4vw,40px)` | 900 | 1.1 | -.02em | tabular-nums |

## 2. 규칙

1. **한 섹션에 h2 하나.** h2 안에서 액센트는 한 줄(또는 한 단어)만. 두 줄을 칠하지 않는다.
2. **본문은 17.5px / 행간 2.0** 을 지킨다. 모바일에서 작게 줄이지 않는다. 글이 길면 문장을 줄인다.
3. **strong 은 색으로 올린다** (text-2 → text). 형광펜·밑줄·배경색 강조는 쓰지 않는다. 예외: 후기 카드 안의 핵심 문장 밑줄(액센트 2px, 오프셋 3px) 하나.
4. **자간은 제목만 음수.** 본문·캡션은 0. 한글 큰 제목은 -.04em 까지.
5. **대문자 영문 라벨(eyebrow) 금지.** "CONTENTS", "STEP 01" 같은 라벨을 섹션 위에 달지 않는다. 섹션 이름은 h2 가 한다. PART 라벨은 목차 안에서만.
6. **숫자는 tabular-nums.** 카운트다운·가격·비율에 `font-variant-numeric:tabular-nums`.
7. **줄바꿈은 `<br>` 로 직접 지정**한다. h2·코드라인·판결문·선택 질문은 모바일 자동 줄바꿈에 맡기면 어색하게 끊긴다.
8. **버튼 문구 ≤ 12자**, 한 줄. 같은 의도의 버튼 문구는 페이지에서 하나로 통일("리치코드 구매하기"). 히어로 버튼만 "확인하기"로 다르게 둘 수 있다.
9. **이모지·화살표(→)·가운뎃점(·) 나열 금지.** 구분은 줄바꿈·얇은 선·간격으로.
10. em-dash(—)·en-dash(–) 금지. 하이픈(-)만.

## 3. 모바일 (≤760px) 에서 바뀌는 것
- 섹션 패딩 120px → 84px, 히어로 52px 0 72px
- 히어로 h1 `clamp(36px,10vw,52px)`, 버튼 100% 폭, 표지 이미지 56%·최대 220px
- 모든 2열 그리드 → 1열 (hero·selfcheck·reason·reality·story·faq·price·reviews·toc 항목)
- 차이 카드 첫 칸 min-height 420 → 300
- 성과 이미지 columns 2 → 1
- ≤420px: 스티키 버튼의 긴 라벨 숨김, 상단 바 12px
