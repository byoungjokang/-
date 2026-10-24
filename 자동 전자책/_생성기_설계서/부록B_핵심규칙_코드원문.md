# 부록 B. 핵심 규칙 코드 원문
생성기 코드에서 규칙이 들어 있는 부분만 그대로 뽑았어요. 다시 만들 때 Claude에게 이 부분은 "그대로 써라"고 주면 똑같이 동작해요.

## 탭 정의와 탭별 작업 지시(TABS)

```js
const TABS = [
    { key: "topic", label: "팔리는 주제", custom: true },
    { key: "research", label: "주제 리서치", custom: true },
    {
      key: "toc", label: "목차 설계",
      srcLabel: "확정 주제 + 리서치",
      ph: "주제와 리서치 보고서를 붙여넣으세요. 주제 리서치 탭에서 '이 리서치로 목차·초안 뽑기'를 누르면 자동으로 채워져요.",
      btn: "목차 프롬프트 생성",
      task: `원고/메모(와 [주제 리서치 보고서]가 있으면 그것)를 읽고 전자책 목차와 초안을 설계한다.
- [주제 리서치 보고서]가 있으면 그 안의 【사람들이 실제로 막히는 지점】【목차 재료】【걸러야 할 통념】을 근거로 챕터를 짜고, 각 챕터 옆에 (근거: …)를 짧게 단다.
- [확정 주제·제목]이 있으면 그 제목과 원씽을 그대로 쓰고 바꾸지 않는다. 없을 때만 원씽 한 문장을 새로 만든다: "(누가)(어떤 상황에서)(뭐가 안 돼서)(어떤 결과를 얻는)(무슨 방법)".
- 챕터 7~10개. PART(부)로 묶지 않는다. 장 제목은 "번호 + 제목" 하나로 끝내고, (Day 1~3)·(1~2주차) 같은 괄호 보충이나 "Day 1." 같은 머리말을 붙이지 않는다. 흐름은 "문제 인식 → 원인 해체 → 해결 방법 → 실전 적용". 각 챕터 제목은 궁금증이 생기게, 한 줄 요약을 붙인다.
- 각 챕터마다 초안 3~4줄: 도입 장면 1줄, 핵심 주장 1줄, 쓸 근거·사례 1~2줄.
- 그다음 "이 목차로 챕터를 쓰게 하는 프롬프트"를 한 덩어리로 작성한다. 사용자가 그대로 복사해 ChatGPT/Claude에 붙여넣을 수 있게, 역할·독자·문체·챕터 구조(도입 사례 → 핵심 주장 → 근거 → 방법 → 실천 과제)·분량을 모두 담는다.`
    },
    {
      key: "chapter", label: "원고 집필",
      srcLabel: "설계된 목차",
      ph: "목차 설계 결과를 붙여넣으세요. 목차 설계 탭에서 '이 목차로 원고 뽑기'를 누르면 자동으로 채워져요. 넣고 싶은 내 경험도 같이 적으면 원고에 들어가요.",
      btn: "집필 프롬프트 생성",
      task: `붙여넣은 목차와 메모를 보고, 이 챕터 하나를 쓰게 만드는 프롬프트를 만든다.
- 먼저 이 챕터의 핵심 주장 1문장, 독자가 챕터를 읽고 얻을 변화 1문장.
- 그다음 복사용 프롬프트 한 덩어리: 역할, 독자, 문체 규칙(문장 길이·말투·금지 표현), 구조(훅이 되는 장면 → 통념 제시 → 뒤집기 → 방법 3단계 → 오늘 할 실천 1개), 반드시 넣을 저자 경험, 분량(A4 4~6장), 마지막 문장 처리 방식.
- 원고에 저자 경험이 있으면 그 표현을 살리고 지어내지 말라고 명시한다.`
    },
    {
      key: "cover", label: "표지 디자인", custom: true,
      srcLabel: "원고 전체 또는 제목·목차",
      ph: "표지 이미지를 만들기 위해 제목, 부제, 목차나 원고 전체를 붙여넣으세요.",
      btn: "표지 이미지 프롬프트 생성",
      task: `이 전자책의 표지 이미지를 만들 이미지 생성 AI(미드저니, 달리, 나노바나나 등)용 프롬프트를 만든다.
- 책의 정서를 한 줄로 요약 (예: "혼자 버티던 사람이 숨을 고르는 순간").
- 표지 콘셉트 3안. 각 안마다: 콘셉트 이름, 한국어 설명 2줄, 영어 이미지 프롬프트(구도·피사체·조명·색감·질감·스타일, 세로 3:4 전자책 표지 비율, 상단/하단에 제목 넣을 여백, 이미지 안에 글자 넣지 말 것 "no text").
- 마지막에 어울리는 제목 폰트 느낌과 컬러 팔레트(HEX 3개).`
    },
    {
      key: "body", label: "본문 디자인 하기", custom: true,
      srcLabel: "챕터 본문 일부",
      ph: "이미지를 넣을 챕터나 단락을 붙여넣으세요. 앞뒤 흐름이 보이면 더 정확해요.",
      btn: "본문 이미지 프롬프트 생성",
      task: `붙여넣은 본문에서 이미지를 넣으면 좋은 지점을 3~5곳 고르고, 각각의 삽화/인포그래픽 프롬프트를 만든다.
- 각 지점마다: 넣을 위치(해당 문장 앞부분 인용), 이미지 유형(장면컷/설명 인포그래픽/비교표/체크리스트), 한국어 설명 1줄, 영어 이미지 프롬프트(가로 16:9 또는 1:1 명시, 일관된 일러스트 스타일).
- 모든 이미지에 공통으로 붙일 "스타일 고정 문구"를 영어로 맨 위에 먼저 제시해 책 전체 톤이 흔들리지 않게 한다.`
    },
    { key: "final", label: "최종 결과물", custom: true },
    { key: "sales", label: "상세페이지", custom: true }
  ];
```

## 팔리는 주제: 관심 분야 17개와 쪼개기 힌트(CATS)

```js
const CATS = [
    ["스타일링 & 뷰티", "체형·나이·상황(소개팅/면접/결혼식)·예산. '예뻐지는 법'이 아니라 '어떤 콤플렉스를 어떤 자리에서 가리느냐'로 쪼갠다.", ["옷 잘 입는 법", "메이크업", "노화·주름 관리", "피부 좋아지는 법", "이성에게 매력적인 스타일링"]],
    ["육아 & 가족", "아이 나이(영아/4~7세/초등/사춘기)·부모 상황(맞벌이/외벌이/한부모)·구체적 문제 행동. '좋은 부모'는 결핍이 아니다. '소리 안 지르고 싶다'가 결핍이다.", ["좋은 부모 되기", "초보 부모 육아", "자녀를 똑똑하게 키우는 법", "아동 예절"]],
    ["인생의 목적 찾기", "가장 추상적이라 쪼개기가 제일 중요하다. 인생 단계(대학생/30대 직장인/육아 끝난 40대/은퇴) × 지금 막힌 상태(퇴사 고민/번아웃/공허함).", ["인생 목표 설정", "삶의 이유 돌아보기", "마음 돌보기"]],
    ["돈 버는 법", "가장 경쟁이 심하다. 직업(보험/학원/병원/프리랜서) × 채널(카톡/인스타/전화/대면) × 단계(0→1, 첫 매출)로 쪼개야 살아남는다.", ["세일즈", "마케팅", "퍼스널 브랜딩", "카피라이팅", "SNS 수익화", "취직", "사업 시작", "사업 자동화", "온라인 교육 코스"]],
    ["기업가 교육", "회사 규모(5인 미만/30인)·리더 상태(처음 팀장/내향형)·직원 유형(MZ/연상 부하/알바). 대기업 리더십 책과 소상공인 사장의 결핍은 다르다.", ["리더십", "직원 관리", "재무", "운영", "세무"]],
    ["사랑 & 인간관계", "성별 × 나이 × 상태(모솔/이별 직후/결혼 앞둔/재혼) × 채널(앱/소개팅/모임/회사). 결핍이 가장 뜨거워 쪼갤수록 팔린다.", ["더 많은 이성을 만나는 법", "이상형의 배우자를 얻는 법", "관계 갈등·재결합", "연애 커뮤니케이션", "이별 후 멘탈"]],
    ["시간관리 & 생산성", "시간이 없는 이유가 원씽이다. 야근·아이·미루기·유튜브 중 무엇 때문인지 · 원인 × 직업 상태로 쪼갠다.", ["시간관리", "생산성"]],
    ["부동산", "자본 규모(5천/1억 이하) × 단계(권리분석/임장/명도) × 독자 상태(직장인 주말/주부). 숫자를 제목에 넣을수록 원씽이 선명해진다.", ["부동산 경매", "소액 부동산", "저평가 지역", "공인중개사"]],
    ["돈 관리", "소득 상태(사회초년생/월급 250/프리랜서 불규칙) × 문제(카드값/충동구매/물린 주식) × 목표 숫자(1천만 원). 숫자와 상황을 제목에 박아야 한다.", ["목돈 만들기", "투자·재테크", "주식", "가계부", "돈 마인드셋"]],
    ["전문가 스킬", "장면(결혼식 사회/축사/면접/카메라 앞) × 결핍 유형(떨림/논리/목소리) × 대상(신입/경력/공무원). '어디서 쓰는 스킬이냐'로 쪼갠다.", ["스피치", "인터뷰", "자기소개서", "정부지원금·투자", "코딩", "세일즈 피치", "책 쓰기", "디자인", "영상 편집"]],
    ["개인 성장", "비라스의 본거지. 자존감·감정은 '어떤 장면에서 무너지느냐'로 쪼갠다. 남 눈치, 비교, 거절 못 함, 외모, 실패 후 · 장면 하나가 책 하나다.", ["자존감", "감정", "행복", "라이프스타일", "명상", "외국어", "뇌 기능"]],
    ["종교·신념·영성", "신앙 단계(초신자/오래된 신자) × 형태(혼자/자녀와/매일 아침) × 종교 유무. '종교 없이'라는 조건이 큰 시장이다.", ["성경", "신념 강화", "개인적 신념"]],
    ["집 꾸미기", "집 형태(원룸/전세/신혼집) × 제약(못 안 박고/50만 원/혼자) × 부위(조명/침실/베란다). 제약 조건이 원씽이다.", ["셀프 인테리어", "홈가드닝", "집수리", "풍수", "DIY"]],
    ["생존·캠핑", "경험 수준(첫 캠핑/혼캠) × 동반자(아이/반려견/혼자) × 형태(차박/백패킹). 응급처치는 '누구를 위한'이 원씽이다.", ["캠핑", "야생 생존", "응급처치", "자급자족", "낚시"]],
    ["반려동물", "문제 행동(짖음/분리불안/배변/줄당김) × 시기(입양 첫 달/노령) × 견종·묘종. '훈련'이 아니라 '문제 행동 하나'가 책이다.", ["강아지", "고양이", "교감"]],
    ["교육", "학년(고1/고3/재수) × 전형(내신/정시/학종) × 성적대(중위권→상위권) × 과목. '공부 잘하는 법'은 없고 '중위권 수학 포기자'는 있다.", ["대학 입시", "공부 방법", "성적 향상", "영어 회화"]],
    ["취미·스포츠", "수준(입문/100타/슬라이스) × 대상(여자 초보/자취생/아이 엄마) × 상황(캠핑/도시락/소개팅). 취미는 '첫 성과 한 장면'이 원씽이다.", ["골프", "테니스", "요리", "그림", "춤", "와인·위스키", "가죽공예", "뜨개질"]],
  ];
```

## 글꼴 목록(FONTS)

```js
const FONTS = {
    "블랙한산스": '"Black Han Sans"', "도현": '"Do Hyeon"', "주아": '"Jua"', "노토산스": '"Noto Sans KR"',
    "노토세리프": '"Noto Serif KR"', "고운바탕": '"Gowun Batang"', "나눔명조": '"Nanum Myeongjo"', "송명": '"Song Myung"', "IBM플렉스": '"IBM Plex Sans KR"',
    "페이퍼로지": '"Paperlogy"', "나눔고딕": '"Nanum Gothic"', "고운돋움": '"Gowun Dodum"', "고딕A1": '"Gothic A1"', "함렛": '"Hahmlet"', "베이글팻원": '"Bagel Fat One"', "나눔펜": '"Nanum Pen Script"',
  };
```

## 표지 디자인 템플릿 10선(TEMPLATES)

```js
const TEMPLATES = [
    ["01 아이보리 라인", "경제·재테크/미니멀", "F3EFE7", "FBF8F2", "2B2621", "B5493B", "노토세리프", "모래시계 하나, 중앙 하단, 여백 강조, 레드는 선·글자에만", "화려한 3D, 비주얼 과밀", "hourglass"],
    ["02 미드나잇 골드", "자기계발/다크·골드", "12141C", "F7F5EE", "F3EDE0", "C9A227", "노토세리프", "금빛 태양·동심원·궤도선·점형 별빛, 다크+웅장+절제", "SF 포스터 같은 과장, 복잡한 우주 그래픽", "orbit"],
    ["03 차콜 모노", "마인드·철학/흑백 미니멀", "FFFFFF", "FFFFFF", "161616", "6B6B68", "노토산스", "검은 돌 3~4개, 극도로 단순한 정적 오브젝트, 넓은 여백", "알록달록한 포인트, 감성 과잉", "stones"],
    ["04 테라코타 웜", "라이프스타일·에세이/따뜻함", "F7EFE3", "FBF5EA", "3A2A20", "C1512F", "고운바탕", "아치형 창문, 화병과 가지, 따뜻한 햇살", "차가운 사진, 네온 컬러", "arch"],
    ["05 세이지 그린", "건강·습관·힐링", "ECEFE4", "F8F9F2", "28331F", "4C6B44", "노토세리프", "창가, 작은 식물, 오전 햇살", "병원 브로셔 느낌, 형광 그린", "leaf"],
    ["06 파우더 블루", "커리어·직장·비즈니스", "EAF1F6", "F8FAFC", "1B2A3A", "2C5C8A", "노토산스", "열린 길·보행로, 걸어가는 실루엣, 시야가 열리는 구조", "딱딱한 기업 브로셔, 사이버 네온", "path"],
    ["07 블러시 소프트", "연애·관계·감정", "F8EEEC", "FDF7F6", "3E2A26", "B8695C", "고운바탕", "꽃 한두 송이 드로잉, 넓은 여백, 성숙한 감정선", "과하게 귀여운 장식, 십대 로맨틱", "flower"],
    ["08 라인 화이트", "소통·관계·대화법", "FFFFFF", "FFFFFF", "1A1A1A", "E23E31", "노토산스", "빨간 선 하나가 흘러 하트나 연결을 만듦, 극미니멀", "많은 사진, 다색 구성", "redline"],
    ["09 볼드 타입", "동기부여·도전·강한 메시지", "171717", "F6F3EC", "F5F1EA", "E4402F", "블랙한산스", "작은 인물 실루엣, 빨간 삼각 스포트라이트, 강한 대비", "톤다운 파스텔, 약한 인상", "spotlight"],
    ["10 페이퍼 아카데믹", "공부·지식·교양", "F4EFE3", "FAF6EC", "2E2116", "8B5E34", "노토세리프", "아치형 서재, 높은 책장, 따뜻한 조명", "현대 광고 느낌, 네온·메탈릭", "arch"],
  ];
```

## 디자인 명세서 공통 규칙(SPEC_RULES)

```js
const SPEC_RULES = `[디자인 명세서 공통 규칙 · A5 전자책]
- 표지 구조: 상단 키커 → 얇은 액센트 라인 → 메인 제목 → 부제 → 핵심 비주얼 하나 → 하단 룰 → 저자명. 제목은 축소 썸네일에서도 읽혀야 한다.
- 타이포 위계: 키커 9~11pt · 부제 11~14pt · 본문 10.8~11.2pt · 소제목 13~16pt · 챕터 번호 14~18pt · 챕터 제목 22~32pt · 표지 제목 28~46pt.
- 본문 줄간격 165~175%, 문단 간격 6~10pt, 너무 촘촘한 편집 금지. 인용문은 본문보다 130~160% 크게. 체크리스트는 ✓ 또는 □.
- 액센트 컬러는 선·번호·강조에만 절제해서 쓴다. 비주얼은 하나만.`;
```

## 내지 디자인 가이드라인(BODY_GUIDE)

```js
const BODY_GUIDE = `[내지 디자인 가이드라인 · 엔진이 그대로 지키는 규칙]
- 두 가지 면: 밝은 본문 면(paper, 순백이 아닌 아주 옅은 회색·미색) + 어두운 면(dark: 장 시작 밴드·차례·마무리 페이지). 강조색(accent)은 한 가지만, 선·번호·라벨·막대에만 쓴다.
- 글꼴 두 벌: 제목·라벨·번호·카드 제목은 고딕(headFont) 굵게, 오래 읽는 본문은 명조(bodyFont). 본문을 고딕으로 하려면 표지가 아주 현대적일 때만.
- 위계(본문 16 기준 비율): 장 제목 32 · 실습 페이지 제목 27 · 소제목 20 · 핵심 문장 19 · 대사 17.5 · 카드 제목 17 · 본문 16(줄간격 1.94) · 메모 14.5 · 번호 13 · 라벨 12.5(자간 넓게) · 쪽번호 12 · 머리글 10.5.
- 장 시작: 페이지 위 39%를 dark 밴드로 채우고 아래에 accent 띠. 밴드 안 가운데 정렬로 라벨(CHAPTER 01) → 장 제목 → 부제 → 장식(${"◆ ◇ ◆"}). 본문은 같은 페이지 아래에서 바로 시작한다.
- 소제목: 왼쪽 accent 막대(굵기 5) + 굵은 고딕. 앞 내용과는 가는 회색 구분선으로 나눈다.
- 핵심 문장: 위아래 accent 가로선 사이 가운데 정렬 굵은 고딕. 메모: 왼쪽 옅은 회색 막대 + 작은 회색 글씨.
- 실습·정리 페이지: 새 페이지에서 가운데 큰 제목 + 흰 카드(왼쪽 accent 막대, 카드 제목은 진한 accent).
- 모든 본문 페이지 아래: 가는 선 + 왼쪽 머리글(책 제목 · 장) + 오른쪽 세 자리 쪽번호(accent).
- 차례: dark 전체 페이지, 위쪽에 accent 빛 번짐, 가운데 큰 '차례' + 짧은 accent 막대, 번호(accent)·제목(흰색)·부제(회색) 줄마다 가는 구분선.`;
```

## 원고 파일 읽기: DOCX·PDF·TXT

```js
async function readManuscriptFile(file) {
    const name = file.name.toLowerCase();
    if (name.endsWith(".txt") || name.endsWith(".md")) return await file.text();
    if (name.endsWith(".docx")) {
      await loadScript(CDN.jszip);
      const zip = await window.JSZip.loadAsync(file);
      const xml = await zip.file("word/document.xml").async("string");
      const sf = zip.file("word/styles.xml");
      return docxToMarked(xml, sf ? await sf.async("string") : "");
    }
    if (name.endsWith(".pdf")) return await pdfToMarked(file);
    throw new Error("type");
  }
```

## 워드 원고 → 제목 표시

```js
function docxToMarked(xml, sxml) {
    const W = "http://schemas.openxmlformats.org/wordprocessingml/2006/main", P = new DOMParser();
    const at = (el, n) => el ? (el.getAttributeNS(W, n) ?? el.getAttribute("w:" + n)) : null;
    const kid = (el, n) => el ? [...el.childNodes].find(c => c.localName === n) || null : null;
    const styleLv = {};
    if (sxml) [...P.parseFromString(sxml, "application/xml").getElementsByTagNameNS(W, "style")].forEach(s => {
      const id = at(s, "styleId"), nm = String(at(kid(s, "name"), "val") || "").toLowerCase().trim();
      const ol = at(kid(kid(s, "pPr"), "outlineLvl"), "val"), m = nm.match(/^(heading|제목)\s*(\d)$/);
      if (m) styleLv[id] = +m[2]; else if (ol != null && +ol < 6) styleLv[id] = +ol + 1; else if (nm === "title" || nm === "제목") styleLv[id] = 0;
    });
    const paras = [...P.parseFromString(xml, "application/xml").getElementsByTagNameNS(W, "p")].map(p => {
      const pPr = kid(p, "pPr"), sid = at(kid(pPr, "pStyle"), "val"), ol = at(kid(pPr, "outlineLvl"), "val");
      let text = "", boldN = 0, sizeSum = 0, n = 0; const segs = [];
      [...p.getElementsByTagNameNS(W, "r")].forEach(r => {
        const rPr = kid(r, "rPr"), b = kid(rPr, "b"), bold = !!b && !/^(0|false)$/.test(at(b, "val") || "");
        const sz = +(at(kid(rPr, "sz"), "val") || 0);
        let t = ""; [...r.childNodes].forEach(c => { if (c.localName === "t") t += c.textContent; else if (c.localName === "tab" || c.localName === "br") t += " "; });
        const len = t.replace(/\s/g, "").length; text += t; if (bold) boldN += len; if (sz) { sizeSum += sz * len; n += len; }
        if (t) { const last = segs[segs.length - 1]; if (last && last.bold === bold) last.t += t; else segs.push({ t, bold }); }
      });
      text = text.replace(/\s+/g, " ").trim();
      // 문단 일부만 굵으면 **굵게** 표시를 남긴다 (본문 안 강조)
      const rich = segs.some(x => x.bold && x.t.trim()) && segs.some(x => !x.bold && x.t.trim())
        ? segs.map(x => x.bold && x.t.trim() ? x.t.replace(/^(\s*)(.*?)(\s*)$/, "$1**$2**$3") : x.t).join("").replace(/\s+/g, " ").trim() : text;
      const len = text.replace(/\s/g, "").length;
      const lv = ol != null && +ol < 6 ? +ol + 1 : sid && sid in styleLv ? styleLv[sid] : null;
      return { text, rich, lv, bold: len > 0 && boldN >= len * 0.9, size: n ? sizeSum / n : 0, list: !!kid(pPr, "numPr") };
    });
    const styled = paras.some(p => p.lv >= 1 && p.text);
    const cnt = {}; paras.forEach(p => { if (p.size && p.text.length > 40) cnt[p.size] = (cnt[p.size] || 0) + p.text.length; });
    const body = +Object.keys(cnt).sort((a, b) => cnt[b] - cnt[a])[0] || 0;
    let titled = false;
    return paras.map(p => {
      if (!p.text) return "";
      if (p.lv === 0) { if (titled) return p.text; titled = true; return "책 제목: " + p.text; }
      if (p.lv) return "#".repeat(Math.min(p.lv, 6)) + " " + p.text;
      if (p.text.length < 70) {
        if (!styled && body && p.size >= body * 1.4) return "# " + p.text;
        if (p.bold) return "■ " + p.text;
      }
      return (p.list && !/^([-•·✓□]|\d{1,2}[.)])/.test(p.text) ? "- " : "") + p.rich;
    }).join("\n").replace(/\n{3,}/g, "\n\n").trim();
```

## PDF 원고 → 제목 표시

```js
async function pdfToMarked(file) {
    await loadScript(PDFJS);
    const lib = window.pdfjsLib; lib.GlobalWorkerOptions.workerSrc = PDFJS_WORKER;
    const pdf = await lib.getDocument({ data: new Uint8Array(await file.arrayBuffer()) }).promise;
    let L = [];
    for (let i = 1; i <= pdf.numPages; i++) {
      const c = await (await pdf.getPage(i)).getTextContent();
      let cur = null;
      c.items.forEach(it => {
        if (!("str" in it)) return;
        const size = Math.round((Math.hypot(it.transform[2], it.transform[3]) || it.height || 0) * 2) / 2, y = it.transform[5];
        if (!cur || Math.abs(y - cur.y) > Math.max(2, size * 0.5)) { cur = { page: i, y, size: 0, text: "" }; L.push(cur); }
        cur.text += it.str; if (it.str.trim()) cur.size = Math.max(cur.size, size);
        if (it.hasEOL) cur = null;
      });
    }
    L = L.map(l => ({ ...l, text: l.text.replace(/\s+/g, " ").trim() })).filter(l => l.text && !/^[-–·\s]*\d{1,4}[-–·\s]*$/.test(l.text));
    if (L.reduce((a, l) => a + l.text.length, 0) < 200) throw new Error("scan");
    // 쪽마다 반복되는 머리글·바닥글은 뺀다
    const rep = {}; L.forEach(l => { if (l.text.length < 40) (rep[l.text] = rep[l.text] || new Set()).add(l.page); });
    if (pdf.numPages >= 6) L = L.filter(l => !(rep[l.text] && rep[l.text].size >= Math.max(3, pdf.numPages * 0.3)));
    const cnt = {}; L.forEach(l => { cnt[l.size] = (cnt[l.size] || 0) + l.text.length; });
    const body = +Object.keys(cnt).sort((a, b) => cnt[b] - cnt[a])[0];
    const lines = {}; L.forEach(l => { if (l.size > body * 1.1) lines[l.size] = (lines[l.size] || 0) + 1; });
    const big = Object.keys(lines).map(Number).sort((a, b) => b - a);
    const chSize = big.find(s => lines[s] >= 2);
    const lvOf = (s) => s <= body * 1.1 || chSize == null ? 0 : s > chSize ? 3 : s === chSize ? 1 : 2;
    const gaps = {};
    for (let i = 1; i < L.length; i++) { const a = L[i - 1], b = L[i]; if (a.page === b.page && a.size === body && b.size === body) { const g = Math.round(a.y - b.y); if (g > 0) gaps[g] = (gaps[g] || 0) + 1; } }
    const lineGap = +Object.keys(gaps).sort((a, b) => gaps[b] - gaps[a])[0] || body * 1.7;
    const out = []; let titled = false;
    L.forEach(l => {
      const lv = lvOf(l.size), last = out[out.length - 1];
      let join = false;
      if (last && last.lv === lv && lv !== 3) {
        if (last.page === l.page) join = last.y - l.y <= (lv ? l.size * 1.9 : lineGap * 1.3);
        else join = !lv && !/([.?!…"”’』」)]|[다요죠까])$/.test(last.text);
      }
      if (join) { last.text += " " + l.text; last.y = l.y; last.page = l.page; }
      else out.push({ lv, text: l.text, y: l.y, page: l.page });
    });
    return out.map(o => o.lv === 1 ? "# " + o.text : o.lv === 2 ? "■ " + o.text : o.lv === 3 ? (titled ? o.text : (titled = true, "책 제목: " + o.text)) : o.text).join("\n");
  }
  function setBook(text, note) {
    bookState.text = text; bookMeta.confirmed = false; $("metaSummary").textContent = "";
    $("bookText").value = text;
    $("bookNote").textContent = note;
    updateBodyBookNote();
    if (text.trim()) setTimeout(() => showMetaBox(false), 0);
  }
  $("bookFile").addEventListener("change", async (ev) => {
    const f = ev.target.files?.[0]; if (!f) return;
    $("bookNote").textContent = "읽는 중…";
    try {
      const t = await readManuscriptFile(f);
      if (!t.trim()) throw new Error("empty");
      setBook(t, `${f.name} · ${t.length.toLocaleString()}자`);
      const found = bookParts();
      $("bookNote").textContent += ` · 섹션 ${found.length}개 인식 (${found.slice(0, 4).map(p => p.title).join(" / ")}${found.length > 4 ? " …" : ""})`;
    } catch (e) {
      $("bookNote").textContent = e.message === "type" ? "DOCX·PDF·TXT·MD 파일만 첨부할 수 있어요. 한글(HWP)은 워드로 저장해서 올려주세요." : e.message === "scan" ? "글자가 그림으로 들어간 PDF라서 읽을 수 없어요. (생성기에서 디자인한 PDF가 이래요) 원고 DOCX나 글자로 된 PDF를 넣어주세요." : e.message === "empty" ? "파일에 글자가 없어요. 원고를 붙여넣어주세요." : "파일을 읽지 못했어요. 원고를 직접 붙여넣어주세요.";
    }
    ev.target.value = "";
  });
  $("bookFromDraft").addEventListener("click", () => {
    const t = $("draftText").textContent.trim();
    if (!t) { $("bookNote").textContent = "원고 집필에서 뽑은 원고가 아직 없어요."; return; }
    setBook(t, `원고 집필에서 가져옴 · ${t.length.toLocaleString()}자`);
  });
  $("bookText").addEventListener("input", () => { bookState.text = $("bookText").value; updateBodyBookNote(); });
  function currentBookText() {
    return (bookState.text || $("bookText").value || $("draftText").textContent || "").trim();
  }
  function updateBodyBookNote() {
    const t = currentBookText();
    $("bodyBookNote").textContent = t ? `연결된 원고: ${t.length.toLocaleString()}자 (표지 디자인 탭의 원고 · 없으면 원고 집필 결과)` : "연결된 원고가 없어요. 표지 디자인 탭에서 원고를 첨부하면 책 전체 디자인까지 할 수 있어요.";
  }
  function guessTitle() {
    if (bookMeta.confirmed && bookMeta.title) return { title: bookMeta.title, subtitle: bookMeta.subtitle };
    return guessTitleRaw();
  }
  function guessTitleRaw() {
    const pool = [drafts.chapter, drafts.toc, currentBookText(), $("r_topic").value].filter(Boolean).join("\n");
    const t = (pool.match(/책 제목\s*[:：]\s*(.+)/) || pool.match(/\[확정 주제·제목\]\s*\n(.+)/) || [])[1];
    const s = (pool.match(/부제\s*[:：]\s*(.+)/) || [])[1];
    return { title: (t || "").trim(), subtitle: (s || "").trim() };
  }
  // ---- 표지 만들기 전 확인: 제목·부제·작가 ----
  const bookMeta = { title: "", subtitle: "", author: "", noAuthor: false, confirmed: false };
  // 원고 앞부분(첫 장 제목 전)에서 제목·부제·작가를 찾는다
  // 제목을 감싼 괄호·따옴표(<…>, 《…》, 「…」, 『…』, "…")는 뗀다
  function unwrapTitle(t, first = true, last = true) {
    let x = String(t || "").trim();
    if (first) x = x.replace(/^[<《〈「『\["“'‘(]+\s*/, "");
    if (last) x = x.replace(/\s*[>》〉」』\]"”'’)]+$/, "");
    return x.trim();
  }
  function detectBookMeta() {
    const g = guessTitleRaw(), t = currentBookText();
    const out = { title: g.title, subtitle: g.subtitle, author: "" };
    const lines = t.split("\n").slice(0, 80).map(l => l.trim()).filter(Boolean);
    const stop = lines.findIndex(l => /^#{1,6}\s/.test(l) || TOC_LINE.test(l) || CH_LINE.test(cleanHead(l)) || /━{4,}/.test(l));
    const head = (stop >= 0 ? lines.slice(0, stop) : lines.slice(0, 8)).map(l => cleanHead(l).replace(/^(책\s*제목|제목)\s*[:：]\s*/, "")).filter(Boolean);
    const am = t.slice(0, 3000).match(/^\s*(?:지은이|저자|작가|글쓴이|글)\s*[:：]\s*(.+)$/m) || t.slice(0, 3000).match(/^\s*(.{2,20}?)\s+(?:지음|씀|저)\s*$/m);
    if (am) out.author = am[1].trim();
    const cand = head.filter(l => l.length <= 40 && !/^(탈고|초고|원고|버전|v\d|ver|\d{4}[.\-/])/i.test(l) && !/^(지은이|저자|작가|부제)/.test(l) && l !== out.author);
    if (!out.title && cand.length) {
      // 부제 꼴('~위한', '~하는 법', '~에게')은 부제로, 남은 것 중 가장 짧은 줄을 제목으로
      const subLike = (l) => /(위한|위하여|에게|하는\s*법|하는\s*방법|이야기|안내서|가이드)$/.test(l) || l.length > 22;
      const titles = cand.filter(l => !subLike(l)), subs = cand.filter(subLike);
      out.title = (titles.sort((a, b) => a.length - b.length)[0] || cand[0]);
      if (!out.subtitle) out.subtitle = subs.find(l => l !== out.title) || "";
    }
    if (!out.subtitle) { const sm = t.slice(0, 3000).match(/^\s*부제\s*[:：]\s*(.+)$/m); if (sm) out.subtitle = sm[1].trim(); }
    out.title = unwrapTitle(out.title); out.subtitle = unwrapTitle(out.subtitle);
    return out;
  }
  function showMetaBox(scroll) {
    const m = detectBookMeta();
    $("mTitle").value = bookMeta.confirmed && bookMeta.title ? bookMeta.title : m.title || "";
    $("mSub").value = bookMeta.confirmed ? bookMeta.subtitle : m.subtitle || "";
    $("mAuthor").value = bookMeta.confirmed ? bookMeta.author : m.author || "";
    $("mNoAuthor").checked = bookMeta.confirmed ? bookMeta.noAuthor : !m.author;
    $("mAuthor").disabled = $("mNoAuthor").checked;
    $("metaNote").textContent = m.title ? "원고에서 이렇게 정리했어요. 틀린 곳은 고쳐주세요." : "원고에서 제목을 못 찾았어요. 직접 적어주세요.";
    $("metaBox").hidden = false; $("goCover").hidden = true;
    if (scroll) $("metaBox").scrollIntoView({ behavior: "smooth", block: "center" });
  }
  $("mNoAuthor").addEventListener("change", () => { $("mAuthor").disabled = $("mNoAuthor").checked; if ($("mNoAuthor").checked) $("mAuthor").value = ""; });
  $("mGo").addEventListener("click", () => {
    const title = unwrapTitle($("mTitle").value);
    if (!title) { $("metaNote").textContent = "제목을 적어주세요."; $("mTitle").focus(); return; }
    const noAuthor = $("mNoAuthor").checked, author = noAuthor ? "" : $("mAuthor").value.trim();
    if (!noAuthor && !author) { $("metaNote").textContent = "작가 이름을 적거나 '없음'을 눌러주세요."; $("mAuthor").focus(); return; }
    Object.assign(bookMeta, { title, subtitle: $("mSub").value.trim(), author, noAuthor, confirmed: true });
    $("metaSummary").textContent = `제목: ${title}${bookMeta.subtitle ? " · 부제: " + bookMeta.subtitle : ""} · 작가: ${author || "없음"}`;
    runCover();
  });

  // ---- 표지 그리기 ----
  // 전자책 디자인 템플릿 10선(ebook-design-templates 스킬)의 컬러·폰트·표지 비주얼·금지 요소
  const TEMPLATES = [
    ["01 아이보리 라인", "경제·재테크/미니멀", "F3EFE7", "FBF8F2", "2B2621", "B5493B", "노토세리프", "모래시계 하나, 중앙 하단, 여백 강조, 레드는 선·글자에만", "화려한 3D, 비주얼 과밀", "hourglass"],
    ["02 미드나잇 골드", "자기계발/다크·골드", "12141C", "F7F5EE", "F3EDE0", "C9A227", "노토세리프", "금빛 태양·동심원·궤도선·점형 별빛, 다크+웅장+절제", "SF 포스터 같은 과장, 복잡한 우주 그래픽", "orbit"],
    ["03 차콜 모노", "마인드·철학/흑백 미니멀", "FFFFFF", "FFFFFF", "161616", "6B6B68", "노토산스", "검은 돌 3~4개, 극도로 단순한 정적 오브젝트, 넓은 여백", "알록달록한 포인트, 감성 과잉", "stones"],
    ["04 테라코타 웜", "라이프스타일·에세이/따뜻함", "F7EFE3", "FBF5EA", "3A2A20", "C1512F", "고운바탕", "아치형 창문, 화병과 가지, 따뜻한 햇살", "차가운 사진, 네온 컬러", "arch"],
    ["05 세이지 그린", "건강·습관·힐링", "ECEFE4", "F8F9F2", "28331F", "4C6B44", "노토세리프", "창가, 작은 식물, 오전 햇살", "병원 브로셔 느낌, 형광 그린", "leaf"],
    ["06 파우더 블루", "커리어·직장·비즈니스", "EAF1F6", "F8FAFC", "1B2A3A", "2C5C8A", "노토산스", "열린 길·보행로, 걸어가는 실루엣, 시야가 열리는 구조", "딱딱한 기업 브로셔, 사이버 네온", "path"],
    ["07 블러시 소프트", "연애·관계·감정", "F8EEEC", "FDF7F6", "3E2A26", "B8695C", "고운바탕", "꽃 한두 송이 드로잉, 넓은 여백, 성숙한 감정선", "과하게 귀여운 장식, 십대 로맨틱", "flower"],
    ["08 라인 화이트", "소통·관계·대화법", "FFFFFF", "FFFFFF", "1A1A1A", "E23E31", "노토산스", "빨간 선 하나가 흘러 하트나 연결을 만듦, 극미니멀", "많은 사진, 다색 구성", "redline"],
    ["09 볼드 타입", "동기부여·도전·강한 메시지", "171717", "F6F3EC", "F5F1EA", "E4402F", "블랙한산스", "작은 인물 실루엣, 빨간 삼각 스포트라이트, 강한 대비", "톤다운 파스텔, 약한 인상", "spotlight"],
    ["10 페이퍼 아카데믹", "공부·지식·교양", "F4EFE3", "FAF6EC", "2E2116", "8B5E34", "노토세리프", "아치형 서재, 높은 책장, 따뜻한 조명", "현대 광고 느낌, 네온·메탈릭", "arch"],
  ];
  const TEMPLATE_TEXT = TEMPLATES.map(t => `${t[0]} (${t[1]}) · 표지배경 #${t[2]} · 내지 #${t[3]} · 잉크 #${t[4]} · 액센트 #${t[5]} · 제목글꼴 ${t[6]} · 비주얼: ${t[7]} · 추천 motif: ${t[9]} · 금지: ${t[8]}`).join("\n");
  const SPEC_RULES = `[디자인 명세서 공통 규칙 · A5 전자책]
- 표지 구조: 상단 키커 → 얇은 액센트 라인 → 메인 제목 → 부제 → 핵심 비주얼 하나 → 하단 룰 → 저자명. 제목은 축소 썸네일에서도 읽혀야 한다.
- 타이포 위계: 키커 9~11pt · 부제 11~14pt · 본문 10.8~11.2pt · 소제목 13~16pt · 챕터 번호 14~18pt · 챕터 제목 22~32pt · 표지 제목 28~46pt.
- 본문 줄간격 165~175%, 문단 간격 6~10pt, 너무 촘촘한 편집 금지. 인용문은 본문보다 130~160% 크게. 체크리스트는 ✓ 또는 □.
- 액센트 컬러는 선·번호·강조에만 절제해서 쓴다. 비주얼은 하나만.`;

  const TYPO_RULES = `[활자 표지 가이드라인 · 그림 없이 색면·괘선·사각·활자만]
- 도형·아이콘·일러스트·사진 느낌을 쓰지 않는다. 세로쓰기는 하지 않는다. 제목은 항상 가로.
- layout은 아래 6가지 중에서 3안이 서로 다르게 고른다. 이 책에 가장 맞는 것을 1안에 둔다.
  t-band 밴드형: 짙은 바탕 + 흰 큰 제목. 실용서 기본형, 무난하고 강하다.
  t-paper 종이형: 밝은 종이 바탕 + 짙은 큰 제목 + 위아래 굵은 괘선. 에세이·심리, 차분하고 세련됐다.
  t-block 블록형: 위 60% 짙은 색면에 제목 + 강조색 띠 + 아래 흰 바탕에 큰 강조어. 단기 성과·방법론, 숫자 약속이 눈에 박힌다.
  t-poster 포스터형: 강조색 전면 + 판 폭을 꽉 채운 거대 강조어(아래가 잘림) + 흰 제목. 광고 썸네일에서 눈에 걸려야 할 때. accentWord가 있을 때만 고른다.
  t-highlight 하이라이트형: 밝은 바탕 + 짙은 제목 + 강조어 아래를 강조색 띠로 형광펜처럼. 자기계발·실용, 친근하고 핵심이 바로 보인다.
  t-frame 프레임형: 짙은 바탕 + 가는 안쪽 테두리 + 모두 가운데 정렬 + 외곽선 강조어. 강의·클래스형, 단정하고 권위 있다.
- titleLines: 표지에 크게 쓸 제목 줄. 한 줄 8자 안팎으로 끊는다. 글자는 바꾸지 않는다.
- accentWord: 제목 맨 끝에 있는 숫자·기간 같은 말(예: 7일, 30일, 3단계)이면 그 말을 제목 아래 강조색으로 가장 크게 쓴다. titleLines에는 넣지 않는다. 제목 끝에 그런 말이 없으면 빈 문자열. 제목에 없는 말을 지어 넣지 않는다.
- 색은 bg=짙은색, ink=옅은색, accent=강조색(#hex) 셋. [디자인 템플릿 10선]의 컬러를 참고해 책의 정서에 맞게 고르고, 강조색은 바탕과 대비 2.5:1 이상.
- motif는 none.`;
  function motifSvg(m, a, W, H, ink) {
    const s = (inner) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 800" width="${W}" height="${H}" preserveAspectRatio="none" style="position:absolute;inset:0">${inner}</svg>`;
    const k = ink || a;
    switch (m) {
      case "circle": return s(`<circle cx="470" cy="180" r="175" fill="${a}" opacity="0.9"/>`);
      case "lines": return s(Array.from({ length: 14 }, (_, i) => `<line x1="0" y1="${60 + i * 22}" x2="600" y2="${60 + i * 22}" stroke="${a}" stroke-width="2" opacity="0.45"/>`).join(""));
      case "grid": return s(Array.from({ length: 11 }, (_, i) => `<line x1="${i * 60}" y1="0" x2="${i * 60}" y2="800" stroke="${a}" stroke-width="1" opacity="0.22"/>`).join("") + Array.from({ length: 14 }, (_, i) => `<line x1="0" y1="${i * 60}" x2="600" y2="${i * 60}" stroke="${a}" stroke-width="1" opacity="0.22"/>`).join(""));
      case "stripe": return s(`<polygon points="330,0 600,0 600,330" fill="${a}" opacity="0.95"/><polygon points="250,0 300,0 600,300 600,350" fill="${a}" opacity="0.5"/>`);
      case "arch": return s(`<path d="M190 690 L190 500 A110 110 0 0 1 410 500 L410 690 Z" fill="${a}" opacity="0.16"/><path d="M190 690 L190 500 A110 110 0 0 1 410 500 L410 690" fill="none" stroke="${a}" stroke-width="3"/><line x1="300" y1="392" x2="300" y2="690" stroke="${a}" stroke-width="1.5" opacity="0.6"/><line x1="190" y1="560" x2="410" y2="560" stroke="${a}" stroke-width="1.5" opacity="0.6"/>`);
      case "dots": return s(Array.from({ length: 8 }, (_, r) => Array.from({ length: 8 }, (_, c) => `<circle cx="${330 + c * 32}" cy="${60 + r * 32}" r="5" fill="${a}" opacity="0.6"/>`).join("")).join(""));
      case "hourglass": return s(`<path d="M250 500 L350 500 L306 590 L350 680 L250 680 L294 590 Z" fill="none" stroke="${k}" stroke-width="2.5" opacity="0.85"/><path d="M272 660 L328 660 L340 680 L260 680 Z" fill="${a}"/><line x1="240" y1="500" x2="360" y2="500" stroke="${k}" stroke-width="4"/><line x1="240" y1="680" x2="360" y2="680" stroke="${k}" stroke-width="4"/>`);
      case "orbit": return s(`<circle cx="300" cy="560" r="62" fill="${a}"/>` + [110, 160, 215].map((r, i) => `<circle cx="300" cy="560" r="${r}" fill="none" stroke="${a}" stroke-width="1.5" opacity="${0.7 - i * 0.18}"/>`).join("") + Array.from({ length: 22 }, (_, i) => `<circle cx="${(i * 97) % 580 + 10}" cy="${(i * 53) % 330 + 380}" r="${i % 3 ? 1.5 : 2.5}" fill="${a}" opacity="0.7"/>`).join(""));
      case "stones": return s(`<ellipse cx="300" cy="668" rx="95" ry="30" fill="${k}"/><ellipse cx="300" cy="616" rx="70" ry="25" fill="${k}" opacity="0.92"/><ellipse cx="300" cy="573" rx="48" ry="20" fill="${k}" opacity="0.85"/><ellipse cx="300" cy="540" rx="28" ry="14" fill="${a}"/>`);
      case "leaf": return s(`<path d="M300 690 C300 610 300 560 300 500" stroke="${a}" stroke-width="3" fill="none"/><path d="M300 590 C250 580 225 540 232 500 C272 508 298 540 300 590 Z" fill="${a}" opacity="0.85"/><path d="M300 555 C352 545 378 505 370 462 C330 472 302 505 300 555 Z" fill="${a}" opacity="0.6"/><path d="M262 690 L338 690 L330 730 L270 730 Z" fill="${k}" opacity="0.85"/>`);
      case "path": return s(`<polygon points="120,800 480,800 318,470 282,470" fill="${a}" opacity="0.18"/><line x1="300" y1="800" x2="300" y2="470" stroke="${a}" stroke-width="3" stroke-dasharray="18 14"/><line x1="0" y1="470" x2="600" y2="470" stroke="${a}" stroke-width="1.5" opacity="0.5"/><circle cx="300" cy="600" r="9" fill="${k}"/><rect x="293" y="610" width="14" height="34" rx="6" fill="${k}"/>`);
      case "flower": return s([0, 72, 144, 216, 288].map(r => `<ellipse cx="300" cy="530" rx="26" ry="52" transform="rotate(${r} 300 582)" fill="none" stroke="${a}" stroke-width="2.5"/>`).join("") + `<circle cx="300" cy="582" r="14" fill="${a}"/><path d="M300 596 C300 640 290 680 300 720" stroke="${a}" stroke-width="2.5" fill="none"/>`);
      case "redline": return s(`<path d="M-10 640 C120 640 170 560 230 520 C280 486 330 520 300 570 C270 520 220 486 190 520 C150 565 240 620 300 660 C360 620 450 565 410 520 C380 486 330 520 300 570" fill="none" stroke="${a}" stroke-width="4" stroke-linecap="round"/><path d="M300 660 C380 700 470 690 610 700" fill="none" stroke="${a}" stroke-width="4" stroke-linecap="round"/>`);
      case "spotlight": return s(`<polygon points="300,410 165,760 435,760" fill="${a}" opacity="0.9"/><circle cx="300" cy="640" r="11" fill="${readable("#111111", a)}"/><rect x="291" y="652" width="18" height="46" rx="8" fill="${readable("#111111", a)}"/>`);
      default: return "";
    }
  }
  // ---- 활자 표지 6종 (표지 가이드라인 · ebook-cover): 색면 · 괘선 · 사각 · 활자만 쓴다. 도형·아이콘·일러스트 없음 ----
  // 표지 글자는 제목 · 강조어(제목 끝의 숫자·기간) · 부제 · 작가뿐. 후킹 문구·PART 구성은 넣지 않는다.
  // 판형은 본문과 같은 A5 비율. 제목·강조어 크기는 fit()이 판면 폭에 맞춰 정한다.
  const TYPO = { "t-band": "밴드형", "t-paper": "종이형", "t-block": "블록형", "t-poster": "포스터형", "t-highlight": "하이라이트형", "t-frame": "프레임형" };
  const isTypo = (sp) => !!TYPO[sp?.layout];
  const COVER_W = 600, COVER_H = 851;                         // A5 비율 (본문 560×794와 같은 비율)
  const coverH = (sp) => isTypo(sp) ? COVER_H : 800;
  let plFonts = null, plOk = false;
  function paperlogyReady() {
    if (plOk) return Promise.resolve();
    if (!plFonts) plFonts = (async () => {
      const src = JSON.parse(document.getElementById("plFontData").textContent);
      for (const [w, b64] of Object.entries(src)) document.fonts.add(await new FontFace("Paperlogy", `url(data:font/woff2;base64,${b64})`, { weight: w }).load());
      plOk = true;
    })().catch(e => { plFonts = null; throw e; });
    return plFonts;
  }
  // 강조색이 바탕과 안 갈리면 대체색 (표지 강조어는 아주 큰 글자라 2.5:1이면 읽힌다)
  const tReadable = (fg, bg, alt) => contrast(fg, bg) >= 2.5 ? fg : alt;
  // 제목 줄과 강조어: 강조어는 제목 맨 끝에 있어야 쓴다 (원고에 없는 말은 넣지 않는다)
  function typoText(sp) {
    const flat = (s) => String(s || "").replace(/\s+/g, "");
    const title = noDash(unwrapTitle(sp.title || "제목"));
    let lines = (Array.isArray(sp.titleLines) && sp.titleLines.length ? sp.titleLines : [title]).map(l => noDash(String(l)).trim()).filter(Boolean).slice(0, 4);
    let acc = noDash(String(sp.accentWord || "")).trim();
    if (acc) {
      const L = lines.slice(), last = L[L.length - 1] || "";
      if (flat(last) === flat(acc)) L.pop(); else if (last.endsWith(acc)) L[L.length - 1] = last.slice(0, -acc.length).trim();
      if (L.length && flat(L.join("")) + flat(acc) === flat(title)) lines = L.filter(Boolean); else acc = "";
    }
    if (flat(lines.join("")) + flat(acc) !== flat(title)) { lines = [title]; acc = ""; }
    return { title: lines, accent: acc, subtitle: noDash(sp.subtitle || "").replace(/\n/g, " "), author: sp.author || "" };
  }
  function typoColors(sp) {
    const a = hex(sp.bg, "#232B45"), b = hex(sp.ink, "#FDF3EC");
    const deep = lum(a) <= lum(b) ? a : b, tint = lum(a) <= lum(b) ? b : a;
    return { deep: lum(deep) > 0.2 ? mixHex(deep, "#000000", 0.45) : deep, accent: hex(sp.accent, "#EE6C1F"), tint: lum(tint) < 0.75 ? mixHex(tint, "#ffffff", 0.6) : tint };
  }
  function drawTypo(x, sp, W, H) {
    const d = { ...typoText(sp), C: typoColors(sp) }, M = 120, TW = W - M * 2, ry = H / 1944;
    const F = { XB: "800", B: "700", R: "400" };
    // 제목 글꼴을 고르면 제목·강조어는 그 글꼴로. 장식 글꼴이 아니면 부제·작가도 같은 글꼴로 맞춘다
    const tf = FONTS[sp.titleFont] && sp.titleFont !== "페이퍼로지" ? sp.titleFont : "", deco = tf && DISPLAY_FONT.test(tf);
    const font = (size, face) => (!tf || (deco && face !== "XB")) ? `${F[face]} ${size}px Paperlogy, "Noto Sans KR", sans-serif`
      : `${deco ? "400" : face === "XB" ? "900" : face === "B" ? "700" : "400"} ${size}px ${fam(tf)}`;
    const ls = (v) => { try { x.letterSpacing = v + "px"; } catch (e) {} };
    const put = (t, px, py, size, face, color, l = 0) => { x.font = font(size, face); x.fillStyle = color; ls(l); x.fillText(t, px, py); };
    const fit = (texts, face, max, width = TW) => Math.min(max, ...texts.map(t => { x.font = font(max, face); ls(-max * 0.04); return Math.floor(max * width / Math.max(1, x.measureText(t).width)); }));
    // 부제는 어절로 나누고, 마지막 줄에 한두 글자만 남으면 폭을 줄여 다시 나눈다
    const wrap = (t, size, face, width) => {
      const one = (wd) => { x.font = font(size, face); ls(0); const out = [];
        for (const w of String(t).split(" ").filter(Boolean)) { const cur = out.length ? out[out.length - 1] + " " + w : w; if (out.length && x.measureText(cur).width <= wd) out[out.length - 1] = cur; else out.push(w); }
        return out; };
      let best = one(width);
      for (let k = 1; k <= 6 && best.length > 1 && best[best.length - 1].replace(/\s/g, "").length < 4; k++) { const n = one(width * (1 - k * 0.06)); if (n.length <= best.length + 1) best = n; }
      return best;
    };
    const rect = (c, px, py, w, h) => { x.fillStyle = c; x.fillRect(px, py, w, h); };
    x.textBaseline = "alphabetic"; x.textAlign = "left";
    const C = d.C, SUB = "#C9CEDC";
    ({
      // 1 밴드형: 짙은 바탕에 흰 큰 제목, 강조어는 강조색
      "t-band"() {
        const acc = tReadable(C.accent, C.deep, C.tint); rect(C.deep, 0, 0, W, H);
        let y = 380 * ry; const ts = fit(d.title, "XB", 170);
        for (const ln of d.title) { put(ln, M, y, ts, "XB", "#FFFFFF", -ts * 0.045); y += ts * 1.06; }
        if (d.accent) { const s = fit([d.accent], "XB", 300); y += s * 0.62; put(d.accent, M, y, s, "XB", acc, -s * 0.035); y += 120; } else y += 40;
        for (const ln of wrap(d.subtitle, 50, "R", TW)) { put(ln, M, y, 50, "R", SUB, -1); y += 70; }
        if (d.author) put(d.author, M, H - 70, 30, "B", SUB);
      },
      // 2 종이형: 밝은 종이 바탕, 짙은 큰 제목, 위아래 굵은 괘선
      "t-paper"() {
        const PAPER = "#F6F3EE", acc = tReadable(C.accent, PAPER, C.deep); rect(PAPER, 0, 0, W, H);
        rect(C.deep, M, 150, TW, 10);
        let y = 330 * ry; const ts = fit(d.title, "XB", 172);
        y = Math.max(y, 160 + ts * 0.9);
        for (const ln of d.title) { put(ln, M - 6, y, ts, "XB", C.deep, -ts * 0.05); y += ts * 1.04; }
        if (d.accent) { const s = fit([d.accent], "XB", 290); y += s * 0.6; put(d.accent, M - 8, y, s, "XB", acc, -s * 0.04); y += 110; } else y += 40;
        for (const ln of wrap(d.subtitle, 48, "R", TW)) { put(ln, M, y, 48, "R", "#5B5F6B", -1); y += 66; }
        rect(C.deep, M, H - 120, TW, 10);
        if (d.author) put(d.author, M, H - 150, 30, "B", C.deep);
      },
      // 3 블록형: 위 60% 짙은 색면에 제목, 경계에 강조색 띠, 아래 흰 바탕에 큰 강조어
      "t-block"() {
        const BY = Math.round(H * 0.592), acc = tReadable(C.accent, "#FFFFFF", C.deep);
        rect("#FFFFFF", 0, 0, W, H); rect(C.deep, 0, 0, W, BY); rect(C.accent, 0, BY, W, 22);
        const ts = fit(d.title, "XB", 165);
        let y = BY - 110 - (d.title.length - 1) * ts * 1.06;
        for (const ln of d.title) { put(ln, M, y, ts, "XB", "#FFFFFF", -ts * 0.045); y += ts * 1.06; }
        y = BY + 22;
        if (d.accent) { const s = fit([d.accent], "XB", 260, TW * 0.6); y += s * 0.86 + 70; put(d.accent, M - 6, y, s, "XB", acc, -s * 0.035); y += 90; } // 띠와 붙지 않게 70 띄운다
        else y += 120;
        for (const ln of wrap(d.subtitle, 46, "R", TW)) { put(ln, M, y, 46, "R", "#3C4150", -1); y += 64; }
        if (d.author) put(d.author, M, H - 50, 28, "B", C.deep);
      },
      // 4 포스터형: 강조색 전면, 판 폭을 꽉 채우는 거대 강조어(아래만 잘림), 흰 제목
      "t-poster"() {
        const BG = C.accent, INK = tReadable(C.deep, BG, "#FFFFFF"), TT = tReadable("#FFFFFF", BG, C.deep);
        rect(BG, 0, 0, W, H);
        if (d.accent) { let s = 1000; x.font = font(s, "XB"); ls(-s * 0.05); s = Math.floor(s * (W + 40) / x.measureText(d.accent).width); put(d.accent, -20, H + s * 0.1, s, "XB", C.deep, -s * 0.05); }
        let y = 200 * ry; const ts = fit(d.title, "XB", 150, TW * 0.9);
        y = Math.max(y, ts * 0.9 + 60);
        for (const ln of d.title) { put(ln, M, y, ts, "XB", TT, -ts * 0.045); y += ts * 1.06; }
        y += 30;
        for (const ln of wrap(d.subtitle, 44, "B", TW * 0.55)) { put(ln, M, y, 44, "B", INK, -1); y += 62; }
        if (d.author) put(d.author, M, H - 90, 30, "B", TT);
      },
      // 5 하이라이트형: 밝은 바탕, 강조어 아래쪽 절반을 강조색 띠로 형광펜처럼
      "t-highlight"() {
        const PAPER = "#FBFAF7"; rect(PAPER, 0, 0, W, H);
        let y = 330 * ry; const ts = fit(d.title, "XB", 160);
        y = Math.max(y, ts * 0.9 + 170);
        for (const ln of d.title) { put(ln, M, y, ts, "XB", C.deep, -ts * 0.045); y += ts * 1.06; }
        if (d.accent) {
          const s = fit([d.accent], "XB", 300, TW * 0.7); y += s * 0.66;
          x.font = font(s, "XB"); ls(-s * 0.035); const w = x.measureText(d.accent).width;
          rect(C.accent, M - 20, y - s * 0.34, w + 50, s * 0.4); put(d.accent, M, y, s, "XB", C.deep, -s * 0.035); y += 110;
        } else y += 40;
        for (const ln of wrap(d.subtitle, 46, "R", TW)) { put(ln, M, y, 46, "R", "#4A4E5A", -1); y += 64; }
        if (d.author) { x.textAlign = "right"; put(d.author, W - M, 120, 28, "B", C.deep); x.textAlign = "left"; }
      },
      // 6 프레임형: 짙은 바탕에 가는 안쪽 테두리, 모두 가운데 정렬, 강조어는 외곽선 글자
      "t-frame"() {
        const acc = tReadable(C.accent, C.deep, C.tint); rect(C.deep, 0, 0, W, H);
        x.strokeStyle = acc; x.lineWidth = 4; x.strokeRect(64, 64, W - 128, H - 128);
        const center = (t, py, size, face, color, l = 0) => { x.textAlign = "center"; put(t, W / 2, py, size, face, color, l); x.textAlign = "left"; };
        let y = 280 * ry; const ts = fit(d.title, "XB", 150, TW * 0.92);
        y = Math.max(y, ts * 0.9 + 130);
        for (const ln of d.title) { center(ln, y, ts, "XB", "#FFFFFF", -ts * 0.04); y += ts * 1.08; }
        if (d.accent) {
          const s = fit([d.accent], "XB", 380, TW * 0.8); y += s * 0.72;
          x.font = font(s, "XB"); ls(-s * 0.03); x.textAlign = "center"; x.lineWidth = 6; x.strokeStyle = acc; x.strokeText(d.accent, W / 2, y); x.textAlign = "left"; y += 110;
        } else y += 40;
        for (const ln of wrap(d.subtitle, 44, "R", TW * 0.9)) { center(ln, y, 44, "R", SUB, -1); y += 62; }
        if (d.author) center(d.author, H - 110, 28, "B", acc);
      },
    })[sp.layout]();
    ls(0);
  }
  // 활자 표지 캔버스 (해상도 W 1296 기준)
  function typoCanvas(sp, scale = 1) {
    const W = Math.round(1296 * scale), H = Math.round(W * COVER_H / COVER_W);
    const c = document.createElement("canvas"); c.width = W; c.height = H;
    const g = c.getContext("2d"); g.scale(scale, scale); drawTypo(g, sp, 1296, Math.round(1296 * COVER_H / COVER_W));
    return c;
  }
  async function coverFontsReady(sp) {
    await paperlogyReady().catch(() => {});
    const tf = sp?.titleFont;
    if (tf && FONTS[tf] && tf !== "페이퍼로지") {
      const t = [sp.title, ...(sp.titleLines || []), sp.accentWord, sp.subtitle, sp.author].filter(Boolean).join(" ") || "가";
      await Promise.all(["400", "700", "900"].map(w => document.fonts.load(`${w} 64px ${FONTS[tf]}`, t).catch(() => {})));
    }
  }
  function renderTypo(sp, W, H) {
    const root = mk("div", `position:relative;width:${W}px;height:${H}px;overflow:hidden;background:${typoColors(sp).deep};`);
    const c = document.createElement("canvas"); c.width = 1296; c.height = Math.round(1296 * H / W);
    c.style.cssText = `display:block;width:${W}px;height:${H}px;`;
    const draw = () => drawTypo(c.getContext("2d"), sp, c.width, c.height);
    draw(); coverFontsReady(sp).then(draw, () => {});
    root.appendChild(c); return root;
  }
  function renderCover(sp, W = 600, H = coverH(sp)) {
    if (isTypo(sp)) return renderTypo(sp, W, H);
    const k = W / 600;
    const bg = soften(hex(sp.bg, "#111111")), bg2 = soften(hex(sp.bg2, bg)), accent = desat(hex(sp.accent, "#e8c547"));
    let layout = sp.layout || "classic";
    const photo = /^photo/.test(layout) && artUrl;
    if (/^photo/.test(layout) && !artUrl) layout = "classic";
    const scrim = hex(sp.scrim, "#0c0c0b");
    const textBg = photo && layout === "photo-full" ? scrim : bg;
    const ink = readable(soften(hex(sp.ink, "#fbfaf7")), textBg), sub = readable(soften(hex(sp.sub, ink)), textBg);
    const root = mk("div", `position:relative;width:${W}px;height:${H}px;overflow:hidden;background:${bg === bg2 ? bg : `linear-gradient(170deg, ${bg}, ${bg2})`};font-family:${fam(sp.bodyFont)};`);
    const img = (css) => { const i = mk("img", `position:absolute;object-fit:cover;display:block;${css}`); i.src = artUrl; root.appendChild(i); return i; };
    if (photo) {
      if (layout === "photo-full") {
        img(`inset:0;width:100%;height:100%;`);
        const top = sp.titlePos === "top";
        root.appendChild(mk("div", `position:absolute;left:0;right:0;${top ? "top:0" : "bottom:0"};height:62%;background:linear-gradient(${top ? "180deg" : "0deg"}, ${scrim}f2 0%, ${scrim}c0 45%, ${scrim}00 100%);`));
      } else if (layout === "photo-top") {
        img(`left:0;top:0;width:100%;height:55%;`);
      } else {
        img(`left:${58 * k}px;right:${58 * k}px;top:${392 * k}px;width:${W - 116 * k}px;height:${300 * k}px;`);
      }
    }
    if (layout === "split") root.appendChild(mk("div", `position:absolute;left:0;right:0;bottom:0;height:42%;background:${accent};`));
    if (layout === "frame") root.appendChild(mk("div", `position:absolute;inset:${26 * k}px;border:${2 * k}px solid ${accent};`));
    const m = photo ? "" : motifSvg(sp.motif, accent, W, H, ink);
    if (m) {
      root.insertAdjacentHTML("beforeend", m);
      if (contrast(ink, accent) < 3 && /circle|stripe|dots|lines|grid/.test(sp.motif)) root.lastElementChild.style.opacity = "0.28";
    }
    const lines = (Array.isArray(sp.titleLines) && sp.titleLines.length ? sp.titleLines : [sp.title || "제목"]).slice(0, 4).map(noDash);
    const longest = Math.max(...lines.map(l => l.length), 1);
    // 명세서 표지 제목 28~46pt → 600px 폭 기준 약 42~70px (썸네일 가독성을 위해 위쪽 끝까지 허용)
    const tsize = Math.max(38, Math.min(/photo-top|photo-window/.test(layout) ? 54 : 70, Math.round(440 / longest))) * k;
    const centered = /center|frame/.test(layout);
    const pos = {
      "classic": `left:${58 * k}px;right:${58 * k}px;top:${72 * k}px;`,
      "center": `left:${56 * k}px;right:${56 * k}px;top:${120 * k}px;align-items:center;text-align:center;`,
      "top-left": `left:${58 * k}px;right:${58 * k}px;top:${72 * k}px;`,
      "bottom-left": `left:${58 * k}px;right:${58 * k}px;bottom:${110 * k}px;`,
      "split": `left:${50 * k}px;right:${50 * k}px;top:${110 * k}px;`,
      "frame": `left:${70 * k}px;right:${70 * k}px;top:${120 * k}px;align-items:center;text-align:center;`,
      "bignumber": `left:${58 * k}px;right:${58 * k}px;bottom:${110 * k}px;`,
      "photo-full": sp.titlePos === "top" ? `left:${58 * k}px;right:${58 * k}px;top:${72 * k}px;` : `left:${58 * k}px;right:${58 * k}px;bottom:${110 * k}px;`,
      "photo-top": `left:${58 * k}px;right:${58 * k}px;top:${480 * k}px;`,
      "photo-window": `left:${58 * k}px;right:${58 * k}px;top:${72 * k}px;`,
    }[layout] || `left:${58 * k}px;right:${58 * k}px;top:${72 * k}px;`;
    if (layout === "bignumber") {
      const num = (String(sp.badge || "").match(/\d+/) || ["1"])[0];
      root.appendChild(mk("div", `position:absolute;right:${-10 * k}px;top:${10 * k}px;font-family:${fam(sp.titleFont, "블랙한산스")};font-size:${360 * k}px;line-height:1;color:${accent};opacity:0.9;`, num));
    }
    const box = mk("div", `position:absolute;display:flex;flex-direction:column;${pos}`);
    // 1) 상단 키커 2) 얇은 액센트 라인
    // 표지 글자는 제목·부제·작가만: 키커·배지는 그리지 않는다
    box.appendChild(mk("div", `width:${46 * k}px;height:${3 * k}px;background:${accent};margin-bottom:${20 * k}px;`));
    // 3) 메인 제목
    // 블랙한산스·도현·주아·송명은 한 굵기뿐인 제목용 글꼴, 나머지는 가장 굵게
    const display = DISPLAY_FONT.test(sp.titleFont || "블랙한산스");
    const t = mk("div", `font-family:${fam(sp.titleFont, "블랙한산스")};font-size:${tsize}px;line-height:1.12;color:${ink};font-weight:${display ? 400 : 900};letter-spacing:-0.025em;`);
    lines.forEach((l, i) => { if (i) t.appendChild(document.createElement("br")); t.appendChild(document.createTextNode(l)); });
    box.appendChild(t);
    // 4) 부제
    if (sp.subtitle) box.appendChild(mk("div", `margin-top:${18 * k}px;font-size:${18 * k}px;line-height:1.55;color:${sub};max-width:${430 * k}px;`, noDash(sp.subtitle)));
    root.appendChild(box);
    // 6) 하단 룰 7) 저자명
    const footOn = layout === "split" ? accent : (photo && layout === "photo-full" && sp.titlePos !== "top") ? scrim : bg2;
    const footInk = readable(sub, footOn);
    // 표지 아래는 작가 이름만 (없으면 선도 안 그린다)
    if (sp.author) {
      root.appendChild(mk("div", `position:absolute;left:${58 * k}px;right:${58 * k}px;bottom:${70 * k}px;height:${1 * k}px;background:${footInk};opacity:0.5;`));
      root.appendChild(mk("div", `position:absolute;left:${58 * k}px;right:${58 * k}px;bottom:${36 * k}px;font-size:${14 * k}px;letter-spacing:0.1em;color:${footInk};text-align:${centered ? "center" : "left"};`, sp.author));
    }
    root.appendChild(grainLayer(photo ? 0.04 : 0.06));
    return root;
  }

  // ---- 본문 페이지 그리기 (A5 = 560 × 794) ----
  const PW = 560, PH = 794;
  // ================= 편집 디자인 엔진 (내지 디자인 가이드라인 v1) =================
  // 기준: 레퍼런스 전자책 34쪽을 픽셀 단위로 잰 규칙. A4(794px) 기준값을 A5(560px)로 비율 환산한다.
  // 위치·여백은 ED.K(판형 비율), 글자 크기는 th.S(본문 크기 ÷ 16)로 곱해서 위계 비율을 그대로 지킨다.
  const ED = (() => {
    const K = PW / 794, r = (v) => Math.round(v * K);
    return { K, mx: r(91), top: r(88), bottom: r(1000), band: r(434), stripe: Math.max(3, r(5)), bodyTop: r(491), footY: r(1038), footText: r(1050) };
  })();
  ED.cap = ED.bottom - ED.top; ED.firstCap = ED.bottom - ED.bodyTop;
  function mixHex(a, b, t) {
    const p = (h) => [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16));
    const x = p(a), y = p(b);
    return "#" + x.map((v, i) => Math.round(v + (y[i] - v) * t).toString(16).padStart(2, "0")).join("");
  }
  const DISPLAY_FONT = /블랙한산스|도현|주아|송명|베이글팻원|나눔펜/;
  // ---- 표지에서 색 뽑기: 내지 색은 언제나 확정한 표지에서 나온다 ----
  // ---- 색 라이브러리 186종: 캔바 색 조합 150개(Canva 'color palettes', ggthemes canva_palettes 원본 hex) + 2026 트렌드 컬러 조합 36개(팬톤 2026 Cloud Dancer·NYFW·LFW 시즌 컬러) ----
  // 원본 3~4색에서 장 시작 밴드(가장 어두운 색, 더 어둡게) · 본문 종이(가장 밝은 색을 아주 옅게) · 강조(채도 높은 색, 종이와 대비 2.4:1 이상)를 뽑아 둔 값
  const PAL_LIB = [["c","Fresh and bright","#eff5e8","#701d06","#db785a","f98866ff420e80bd9e89da59"],["c","Subdued and proffesional","#eef3f6","#2a3132","#763626","90afc5336b872a3132763626"],["c","Dark and earthy","#f8eeeb","#46211a","#a43820","46211a693d3dba5536a43820"],["c","Crisp and dramatic","#f3f4e7","#3d3e49","#598234","50516068829eaebd38598234"],["c","Cool blues","#e7f2f5","#003b46","#07575b","003b4607575b66a5adc4dfe6"],["c","Outdoorsy and Natural","#f3f4e6","#2e4600","#486b00","2e4600486b00a2c5237d4427"],["c","Watery blue-greens","#e9f4ee","#021c1e","#004445","021c1e0044452c78736fb98f"],["c","Primary colors with a vibrant twist","#f7f4ea","#2b4713","#fb6542","375e97fb6542ffbb003f681c"],["c","Refreshing and pretty","#f6f5ea","#573339","#a1961d","98dbc65bc8ace6d72af18d9e"],["c","Playful greens and blues","#eef3e5","#2e424b","#34675c","32485186ac4134675c7da3a1"],["c","Fresh and energetic","#f1f1f0","#23463f","#939e00","4cb5f5b7b8b634675cb3c100"],["c","Surf and turf","#f8f4ea","#0e413d","#de7a22","f4cc70de7a2220948b6ab187"],["c","Autumn in vermont","#f6f3e8","#1e434c","#9b4f0f","8d230f1e434c9b4f0fc99e10"],["c","Icy blues and grays","#f1f1f2","#0b424c","#7aa3ac","f1f1f2bcbabea1d6e21995ad"],["c","Birds and berries","#f5f5e8","#473f47","#9c9e47","9a9eab5d535eec96a4dfe166"],["c","Day and night","#f6f5e8","#011a27","#063852","011a27063852f0810fe6df44"],["c","Stylish and retro","#eaf3ef","#36443b","#b2943d","75b1a9d9b44a4f6457acd0c0"],["c","Shades of citrus","#f7f5ea","#2d462b","#ae9a19","eb8a44f9dc244b74478eba43"],["c","Sunset to dusk","#f8efec","#363237","#2d4262","3632372d426273605bd09683"],["c","Bright and tropical","#f7f4eb","#7f1326","#fa6775","f52549fa6775ffd64d9bc01c"],["c","Warm naturals","#f7f3e9","#2e2300","#c05805","2e23006e6702c05805db9501"],["c","Bold berries","#f5f5e7","#50312f","#cb0000","50312fcb0000e4ea8c3f6c45"],["c","Summer sunflower","#f6f5ea","#1b4749","#cb6318","34888c7caa2df5e356cb6318"],["c","Modern and crisp","#ffffff","#0f1b07","#5c821a","0f1b07ffffff5c821ac6d166"],["c","Timeless and nautical","#f4f4e6","#00293c","#f62a00","00293c1e656df1f3cef62a00"],["c","Neutral and versatile","#f0f0ec","#3b4144","#b38867","626d71cdcdc0ddbc95b38867"],["c","Cheerful brights","#f7f4ea","#7c2114","#258039","258039f5be4131a9b8cf3721"],["c","Garden fresh","#fcfdfe","#692e1c","#739f3d","ee693ff69454fcfdfe739f3d"],["c","Summer barbeque","#f8f3eb","#752a07","#eb5e30","b9d9c3752a07fbcb7beb5e30"],["c","Berry blues","#ecf1f9","#1e1f26","#4d648d","1e1f262836554d648dd0e1f9"],["c","Lemonade stand","#f7f2e9","#800013","#f25c00","f70025f7efe2f25c00f9a603"],["c","Serene and spa like","#f4f3e6","#682624","#9e9c71","a1be95e2dfa292aac7ed5752"],["c","Fun and tropical","#f7f4eb","#20425f","#b29940","4897d8ffdb5cfa6e59f8a055"],["c","Spicy neutrals","#f6f2e8","#662e1c","#af4425","af4425662e1cebdcb2c9a66b"],["c","Pastels","#f7f4ea","#473930","#b19452","c1e1dcffccacffeb94fdd475"],["c","Bold and cultured","#f8f4ea","#463a4d","#d13525","4c3f54d13525f2c057486824"],["c","Sunny citrus","#f9f4eb","#6e1c16","#cd9007","faaf08fa812ffa4032fef3e2"],["c","Crisp complementary colors","#f6f5e9","#7a1809","#e73f0b","f4ec6abbcf4ae73f0ba11f0c"],["c","Warm and rustic","#f9f4ec","#870000","#805a3b","fef2e4fd974fc60000805a3b"],["c","Neon night","#f4f5e8","#231b12","#f56c57","f77604b8d20bf56c57231b12"],["c","Jewel tones","#f7f4ea","#7f152e","#e94f08","7f152ed61800edae01e94f08"],["c","Polished and inviting","#f3efe8","#463d35","#b8970b","eae2d6d5c3aa867666e1b80d"],["c","Fresh greens","#fdffff","#1d4600","#68a225","265c0068a225b3de81fdffff"],["c","Wintery reds","#f0efea","#870112","#d72c16","a10115d72c16f0efeac0b2b5"],["c","Summer fiesta","#f5f5e8","#2c3c01","#bb9500","c7db007aa802f78b2de4b600"],["c","Chocolaty browns","#f5f0e7","#301b28","#b6452c","301b28523634b6452cddc5a2"],["c","Naturally elegant","#f6f5ea","#4f391d","#7e7b15","ebdf007e7b15563e20b38540"],["c","Cozy and warm","#f7f3e9","#662225","#b51d0a","662225b51d0aead39c7d5e3c"],["c","Violet sunset","#fbf2ed","#453e3f","#556dac","4b4345556dacf79b77755248"],["c","Strawberries and cream","#fcfdfe","#702218","#fe7a47","d8412ffe7a47fcfdfef5ca99"],["c","Grecian holiday","#f6f0e8","#2b4365","#2988bc","2988bc2f496ef4eadeed8c72"],["c","Bold and basic","#f8f5f2","#000b29","#d70026","000b29d70026f8f5f2edb83d"],["c","Vineyard neutrals","#f8f0ed","#1e0000","#9d331f","1e00005008059d331fbc6d4f"],["c","Modern and urban","#f7f2e9","#2f3131","#426e86","f9ba32426e86f8f1e52f3131"],["c","Misty greens","#eff1ee","#04202c","#304040","04202c3040405b7065c9d1c8"],["c","Sunkissed village","#f9f2eb","#523d30","#d24136","d24136eb8a3eebb582785a46"],["c","Sun and sky","#f8f3ea","#211f30","#217ca3","217ca3e2993032384d211f30"],["c","Aqua blues","#eef0f2","#004741","#128277","004d4712827752958bb9c4c9"],["c","Urban oasis","#f5f0e7","#2a2922","#506d2f","506d2f2a2922f3ebdd7d5642"],["c","Candy coated brights","#f6f5ec","#75192f","#008dcb","f47d4ae1315bffec5c008dcb"],["c","Muted and antique","#e8f2ee","#6b2b25","#c09352","a4cabceab364b2473eacbd78"],["c","Classy and timeless","#f7f4ea","#16253d","#cd7213","16253d002c54efb509cd7213"],["c","Cosmopolitan","#faf1ed","#443b3b","#8593ae","8593ae5a4e4d7e675edda288"],["c","Cheerful and friendly","#ffffff","#1d424a","#eb855c","2b616db2dbd5fffffffa8d62"],["c","Nightlife","#f7f4ea","#020509","#ff0038","00cffaff0038ffce38020509"],["c","Coastal","#f8f1ea","#3d3916","#ca8a51","a5c3cff3d3b8e59d5ca99f3c"],["c","Maritime brights","#ffffff","#133f45","#ff4447","2579855ea8a7ffffffff4447"],["c","Vintage charm","#f8f0ea","#52322a","#b08c52","fcc875baa896e6ccb5e38b75"],["c","Understated and versatile","#ecf0f2","#2d3033","#aa4b41","335252d4dde1aa4b412d3033"],["c","Artic sunrise","#ecf0ed","#00414f","#b28f83","ffccbb6eb5c0006c84e2e8e4"],["c","Mediterranean afternoon","#f7f2e9","#810004","#c8000a","8c0004c8000ae8a735e2c499"],["c","Hazy grays","#f6f1e8","#28444b","#537072","2c4a525370728e9b97f4ebdb"],["c","City sights","#f0f0eb","#113743","#c5001a","c5001ae4e3db113743c5beba"],["c","Retro and relaxing","#f3eeea","#5d2818","#b49170","d35c37bf9a77d6c6b997b8c2"],["c","Green fields","#f9f7eb","#453e31","#919636","919636524a3afffae15a5f37"],["c","Distintive and unexpected","#f2f0e4","#782518","#52908b","52908be5e2caddbc95e7472e"],["c","Sleek and modern","#ffffff","#2f2e33","#3a5199","2f2e33d5d6d2ffffff3a5199"],["c","Orange accent","#f0f0ed","#353c3f","#756867","756867dad9d3353c3fff8d3f"],["c","Beyond black and white","#f0eff0","#2f2f28","#af1c1c","31a2acaf1c1cf0eff02f2f28"],["c","Shabby chic neutrals","#f6f0ec","#423e3a","#6c5f5b","6c5f5bcdab81dac3b34f4a45"],["c","Warm and cool","#f7f2ea","#39404d","#ce5a57","444c5cce5a5778a5a3e1b16a"],["c","Industrial and in control","#f4f4ef","#20232a","#a01d26","20232aacbebef4f4efa01d26"],["c","Autumn oranges and complemtentary neutrals","#f9f9ff","#473937","#d55448","d55448ffa577f9f9ff896e69"],["c","Pool party","#f8f3eb","#283b6d","#e7552c","344d905cc5efffb745e7552c"],["c","Classic metallics","#efefef","#080706","#594d46","080706efefefd1b280594d46"],["c","Subtle and versatile","#e9f3ee","#632727","#5f968e","5f968ebfdccfe05858d5c9b1"],["c","Professional and traditional","#ffffff","#1e1e20","#962715","962715ffffff1e1e20bbc3c6"],["c","Light and natural","#f7f4ea","#2e3d3d","#a57c65","688b8aa0b084faefd4a57c65"],["c","Shadowy and dramatic","#f8f1ea","#262f34","#f34a4a","262f34f34a4af1d3bc615049"],["c","Golden afternoon","#f3efe9","#323030","#882426","882426cdbea7323030c29545"],["c","Dark and handsome","#f7f0e9","#42313a","#9f4636","42313a6c2d2c9f4636f1dcc9"],["c","Technology meets nature","#f7f4ea","#282623","#b09034","fbcd4ba3a59928262388a550"],["c","Cheerful blues and pink","#fcfcfa","#1a405f","#337bae","ffbebdfcfcfa337bae1a405f"],["c","Exotic and high impact","#fcefee","#0f1f38","#f55449","0f1f388e7970f554491b4b5a"],["c","Back to school","#f8f3ea","#433b31","#e4535e","81715efaae3de38533e4535e"],["c","Bright and painterly","#f8f3eb","#061283","#fd3c3c","061283fd3c3cffb74c138d90"],["c","Urban living","#f0f0f0","#232122","#879d4b","dddede232122a5c05b7ba4a8"],["c","1950s kitchen","#fdf6f6","#840000","#5ba4b2","b3dbc0fe0000fdf6f667baca"],["c","Smoky purples","#f7efe9","#3b3a3e","#cd8577","a49592727077eed8c9e99787"],["c","Trendy and metropolitan","#faefed","#203d43","#b48f48","488a99dbae58fbe9e7b4b4b4"],["c","Fun and professional","#f1eff2","#6f210b","#bc8b27","4abdacfc4a1af7b733dfdce3"],["c","Art history inspired","#f7f4eb","#262228","#0375b4","ffce000375b4007849262228"],["c","Muted tones","#f4f4f4","#373737","#a99d73","c0b283dcd0c0f4f4f4373737"],["c","Modern and clean","#f9f2eb","#044751","#e37222","e3722207889b66b9bfeeaa7b"],["c","Neon tones and sharp contrast","#f3efee","#0e0b16","#4717f6","0e0b16a239ca4717f6e7dfdd"],["c","Muted and minimal","#f0f0f0","#393f4c","#9099a2","96858f6d79939099a2d5d5d5"],["c","Warm and bold","#fbf4f2","#000000","#b82601","000000062f4f813772b82601"],["c","Clean and highlighted","#efefef","#701a1c","#81969b","caebf2a9a9a9ff3b3fefefef"],["c","Warm tones","#f3f0ee","#632a35","#565656","d7cec756565676323fc09f80"],["c","Sharp and modern","#f7f2e9","#1e392a","#828081","3cc47c1e392ae9c893828081"],["c","Cool vs warm","#f7f3e9","#18121e","#984b43","18121e233237984b43eac67a"],["c","Pretty pastels","#faf1ec","#623321","#b4922f","bfd8d2fedcd2df744adcb239"],["c","Bold and punchy","#f7f4ea","#004a4d","#e24e42","e24e42e9b000eb6e80008f95"],["c","Tints and tones","#f8f0ea","#49274a","#94618e","94618e49274af4decbf8eee7"],["c","Splash of color","#f0f0f0","#1e3a5b","#ae9100","4484ced9d9d9f9cf00f19f4d"],["c","Elegant and sophisticated","#f6f4e8","#1d2731","#0b83c5","0b83c5328cc1d9b3101d2731"],["c","Summer inspired","#f7f2ed","#184165","#cd5360","286da8cd5360b37d4e438496"],["c","Professional and modern","#f7f4ea","#0a1612","#1a2930","c5c1c00a16121a2930f7ce3e"],["c","Bold blacks and vibrand highlights","#f6f5ea","#000000","#ec576b","000000ec576b4ec5c1e5e338"],["c","Clean gradient and fresh blues","#e7f4f5","#014b43","#62a5ae","77c9d457bc90015249a5a5af"],["c","Cheerful and sleek","#f7f4ea","#383f4a","#e8802c","6b7a8ff7882ff7c331dcc7aa"],["c","Luxurious and modern","#f5f5f5","#0f1626","#ff533d","0f1626ab987aff533df5f5f5"],["c","Unique and striking","#eef3f5","#031424","#cf6766","cf676630415d0314248eaebd"],["c","Unexpected color combinations","#f2f5e7","#1a0315","#6e3667","6e366788d3171a0315535353"],["c","Retro inspired","#f7f5eb","#000000","#b29a2b","fedc3d00000001abaafea680"],["c","Antique and clean","#f2eef2","#5e332d","#7e9986","b56357b4dbc0eae3eaa7b3a5"],["c","Striking and energetic","#f3f0e5","#810e45","#ac901c","f81b84f5ce2843c0f6f2eee2"],["c","Fresh and lively","#e8f6f5","#6f156e","#ff5992","4cdef5a4d555ff5992841983"],["c","Clean and crisp","#f0f0f0","#31434d","#74a0a9","99d3df88bbd6cdcdcde9e9e9"],["c","Colorful without clashing","#f7f5ea","#253e32","#eb7589","fa7c926ec4d8fff7c066ab8c"],["c","Cool and calm","#f8f4ea","#413c53","#ce8400","6bbaa7fba1006c648bb6a19e"],["c","Modern and muted","#f7f1e9","#3d4245","#8b978b","a9b7c0c7d8c6efd9c1cccbc6"],["c","Earthy and fresh","#f4efef","#3c3c3c","#af473c","945d60626e60af473c3c3c3c"],["c","High saturation and high energy","#e8f6f1","#5b2442","#b19903","fe65b7e9c9048fc33a62edd6"],["c","Warm and wonderful","#e8f5f3","#7f1a21","#bd9002","7cd8d5f53240f9be0202c8a7"],["c","Vintage charm 2","#f1efe7","#373f27","#636b46","cda34fe9e7da636b46373f27"],["c","Cool jewel tones","#e9f3f7","#5f0f4e","#e52a6f","67aeca6756825f0f4ee52a6f"],["c","Stormy hues","#f5f3f4","#192231","#985e6d","494e6b98878f985e6d192231"],["c","Clean and collegiate","#e6f3f4","#393c3d","#41a697","4abdac99ced4eeb6b76e7376"],["c","Simple and fresh","#ebf2ea","#414141","#056571","414141ccdfcbff6a5c056571"],["c","Tropical tones","#f7f4ea","#104a1f","#f24c4e","1fb58feab126f24c4e1b7b34"],["c","Bold feature colors","#f2f0ec","#22252c","#e14658","e1465822252c3f3250c0b3a0"],["c","Antique tones","#f2efe5","#4d2c3d","#155765","15576557652aab93534d2c3d"],["c","Neon and bold","#f1f5e8","#08302f","#0e8044","d48cf80e8044b5e58208302f"],["c","Simple but bold","#f6f5ec","#303f5f","#9e9944","f7ef6a93c178465c8bdfdce3"],["c","Corporate and sleek","#f7f5e9","#333a56","#52658f","f7f5e6333a5652658fe8e8e8"],["c","Modern and minimal","#f7f1e9","#000000","#c06014","c06014eddbc0000000cdcdcd"],["c","Fun and cheerful","#f7f4e9","#5c3443","#c98474","a7d2cbf2d388c98474874c62"],["c","Sunny and calm","#e4f2ed","#00303f","#7a9d96","cae4dbdcae1d00303f7a9d96"],["c","Pop art","#f5f5e8","#02416a","#e42d9f","d7dd35575da9e42d9f02558b"],["t","Poseidon × Mandarin Orange","#f1efea","#133955","#ec6a37","133955ec6a37f0eee9"],["t","Poseidon × Acacia","#f5f0e7","#133955","#a69c4d","133955dacd65f3ece0"],["t","Poseidon × Tea Rose","#f1efea","#133955","#dc7178","133955dc7178f0eee9"],["t","Coffee Bean × Caramel","#f5f0e7","#40312f","#c37c54","40312fc37c54f3ece0"],["t","Coffee Bean × Teaberry","#f4efe7","#40312f","#dc3855","40312fdc3855dfd1bb"],["t","Coffee Bean × Neptune Green","#f1efea","#40312f","#70a58b","40312f7fbb9ef0eee9"],["t","Rhodonite × Musk Melon","#f1efea","#3e3b59","#d08153","3e3b59ec935ef0eee9"],["t","Rhodonite × Amethyst Orchid","#efefeb","#3e3b59","#926aa6","3e3b59926aa6d7d6ce"],["t","Rhodonite × Acacia","#f5f0e7","#3e3b59","#a69c4d","3e3b59dacd65f3ece0"],["t","Sycamore × Burnt Sienna","#f5f0e7","#35463d","#c65d52","35463dc65d52f3ece0"],["t","Sycamore × Palm","#f4efe7","#35463d","#9a9a53","35463dafaf5edfd1bb"],["t","Sycamore × Tea Rose","#f1efea","#35463d","#dc7178","35463ddc7178f0eee9"],["t","Red Mahogany × Muted Clay","#f5f0e7","#60373d","#c58a78","60373dd29380f3ece0"],["t","Red Mahogany × Dutch Canal","#f1efea","#60373d","#7b99b8","60373d96bae0f0eee9"],["t","Chocolate Truffle × Tickled Pink","#f1efea","#612e35","#bc8d93","612e35f7b9c2f0eee9"],["t","Chocolate Truffle × Acacia","#f4efe7","#612e35","#a69c4d","612e35dacd65dfd1bb"],["t","Amaranth × Musk Melon","#f5f0e7","#62304c","#d08153","6b3453ec935ef3ece0"],["t","Amaranth × Foxglove","#f1efea","#62304c","#b98391","6b3453b98391f0eee9"],["t","Toffee × Neptune Green","#f5f0e7","#503727","#70a58b","7551397fbb9ef3ece0"],["t","Toffee × Marina","#f1efea","#503727","#5085c3","7551395085c3f0eee9"],["t","Alexandrite × Mandarin Orange","#f1efea","#004549","#ec6a37","00666cec6a37f0eee9"],["t","Alexandrite × Tickled Pink","#f5f0e7","#004549","#bc8d93","00666cf7b9c2f3ece0"],["t","Alexandrite × Acacia","#efefeb","#004549","#a69c4d","00666cdacd65d7d6ce"],["t","Burnt Olive × Burnt Sienna","#f4efe7","#444132","#c65d52","646049c65d52dfd1bb"],["t","Burnt Olive × Dusky Rose","#f5f0e7","#444132","#ba797d","646049ba797df3ece0"],["t","Poseidon × Festival Fuchsia","#efefeb","#133955","#9e2c6a","1339559e2c6ad7d6ce"],["t","Rhodonite × Teaberry","#f1efea","#3e3b59","#dc3855","3e3b59dc3855f0eee9"],["t","Sycamore × Caramel","#f1efea","#35463d","#c37c54","35463dc37c54f0eee9"],["t","Coffee Bean × Lava Falls","#f4efe7","#40312f","#9a2b2e","40312f9a2b2edfd1bb"],["t","Red Mahogany × Green Envy","#f5f0e7","#60373d","#a19436","60373da19436f3ece0"],["t","Amaranth × All Aboard","#f1efea","#62304c","#5c97cb","6b34535c97cbf0eee9"],["t","Chocolate Truffle × Shale Green","#f5f0e7","#612e35","#739072","612e35739072f3ece0"],["t","Toffee × Burnished Lilac","#f1efea","#503727","#a28f91","755139c5aeb1f0eee9"],["t","Poseidon × Arabian Spice","#f4efe7","#133955","#884332","133955884332dfd1bb"],["t","Alexandrite × Muted Clay","#f5f0e7","#004549","#c58a78","00666cd29380f3ece0"],["t","Burnt Olive × Amethyst Orchid","#f1efea","#444132","#926aa6","646049926aa6f0eee9"]].map(([s, n, p, d, a, c]) => ({ src: s === "c" ? "캔바" : "2026 트렌드", n, p, d, a, c: c.match(/.{6}/g).map(x => "#" + x) }));
  // 표지와 어울리는 순서: 강조색이 표지 강조색과 같은 계열이거나 정반대(보색)일수록, 밴드가 표지 어두운색 계열일수록 앞
  function libRanked(base) {
    const A = hsl(hex(base.accent, "#888888")), Dk = hsl(hex(base.dark, "#111111")), gray = A.s < 0.12;
    const dh = (x, y) => { const d = Math.abs(x - y) % 360; return Math.min(d, 360 - d); };
    return PAL_LIB.map(e => {
      const a = hsl(e.a), d = hsl(e.d);
      const ha = gray ? (a.s < 0.2 ? 0 : 30) : Math.min(dh(a.h, A.h), dh(a.h, A.h + 180) + 12);
      const hd = d.s < 0.12 || Dk.s < 0.12 ? 25 : dh(d.h, Dk.h);
      return { e, sc: ha + hd * 0.5 };
    }).sort((x, y) => x.sc - y.sc).map(x => x.e);
  }
  const libNote = (e) => e.src === "캔바" ? "캔바 배색 조합에서" : "2026 트렌드 컬러에서";
  // 색 이론 조합과 라이브러리를 섞는다: 한 번 볼 때 3개 중 2개는 라이브러리
  function withLib(theory, lib) {
    const out = []; let t = 0, l = 0;
    while (t < theory.length || l < lib.length) { if (l < lib.length) out.push(lib[l++]); if (l < lib.length) out.push(lib[l++]); if (t < theory.length) out.push(theory[t++]); }
    return out;
  }
  const hsl = (h) => {
    const [r, g, b] = [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16) / 255);
    const mx = Math.max(r, g, b), mn = Math.min(r, g, b), l = (mx + mn) / 2, d = mx - mn;
    const s = d === 0 ? 0 : d / (1 - Math.abs(2 * l - 1));
    let hh = 0; if (d) hh = mx === r ? ((g - b) / d) % 6 : mx === g ? (b - r) / d + 2 : (r - g) / d + 4;
    return { h: (hh * 60 + 360) % 360, s, l };
  };
  const toHex = (rgb) => "#" + rgb.map(v => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, "0")).join("");
  async function paletteFromImage(blob) {
    const img = await createImageBitmap(blob);
    const W = 90, H = Math.max(1, Math.round(90 * img.height / img.width));
    const c = document.createElement("canvas"); c.width = W; c.height = H;
    const g = c.getContext("2d"); g.drawImage(img, 0, 0, W, H);
    const d = g.getImageData(0, 0, W, H).data, bins = new Map(); let n = 0;
    for (let i = 0; i < d.length; i += 4) {
      if (d[i + 3] < 200) continue;
      const k = (d[i] >> 4) << 8 | (d[i + 1] >> 4) << 4 | (d[i + 2] >> 4);
      const b = bins.get(k) || { n: 0, r: 0, g: 0, b: 0 }; b.n++; b.r += d[i]; b.g += d[i + 1]; b.b += d[i + 2]; bins.set(k, b); n++;
    }
    const list = [...bins.values()].map(b => { const hx = toHex([b.r / b.n, b.g / b.n, b.b / b.n]); return { hex: hx, share: b.n / n, L: lum(hx), ...hsl(hx) }; }).sort((a, b) => b.share - a.share);
    const bg = list[0].hex;                                   // 가장 넓은 면 = 바탕색
    const lights = list.filter(x => x.L > 0.55 && x.share > 0.01);
    const darks = list.filter(x => x.share > 0.002 && x.L < 0.12).sort((a, b) => a.L - b.L);
    // 강조색: 채도가 높고 너무 어둡거나 밝지 않은 색 중 면적과 채도를 같이 본다 (글자·선처럼 작아도 잡히게)
    const acc = list.filter(x => x.share > 0.0012 && x.s > 0.18 && x.l > 0.18 && x.l < 0.8 && x.hex !== list[0].hex).sort((a, b) => b.s * Math.sqrt(b.share) - a.s * Math.sqrt(a.share))[0];
    return { bg, light: (lights[0] || list.slice().sort((a, b) => b.L - a.L)[0]).hex, dark: (darks[0] || list.slice().sort((a, b) => a.L - b.L)[0]).hex, accent: acc ? acc.hex : null };
  }
  let palCache = { key: null, pal: null };
  async function coverPalette() {
    const key = [coverBlob && coverBlob.size, chosenCover && JSON.stringify(chosenCover)].join("|");
    if (palCache.key === key) return palCache.pal;
    let pal = null;
    if (coverBlob) { try { pal = await paletteFromImage(coverBlob); } catch (e) { pal = null; } }
    if (chosenCover) {   // 생성기에서 만든 표지면 설계값이 정답
      const c = chosenCover, cs = [c.bg, c.bg2, c.ink, c.sub, c.accent].map(x => hex(x, "")).filter(Boolean);
      const byL = cs.slice().sort((a, b) => lum(a) - lum(b));
      pal = { ...(pal || {}), bg: hex(c.bg, pal?.bg || byL[byL.length - 1]), light: byL[byL.length - 1], dark: byL[0], accent: hex(c.accent, pal?.accent || "") || pal?.accent || null };
    }
    palCache = { key, pal }; return pal;
  }
  // 표지 팔레트 → 내지 색 3가지 방향 (faithful: 표지 그대로 / calm: 차분하게 / bold: 강조를 진하게)
  function palToColors(pal, variant) {
    const v = /calm/.test(variant) ? "calm" : /bold/.test(variant) ? "bold" : "faithful";
    const darkCover = lum(pal.bg) < 0.25;
    let accent = pal.accent || mixHex(pal.dark, "#808080", 0.25);
    let dark = lum(pal.dark) > 0.05 ? mixHex(pal.dark, "#000000", 0.45) : pal.dark;
    if (darkCover) dark = mixHex(pal.bg, "#000000", lum(pal.bg) > 0.05 ? 0.35 : 0);
    // 본문 종이: 표지 바탕의 색감을 아주 옅게 (어두운 표지면 강조색 기운만)
    let paper = darkCover ? mixHex("#f2f2f1", accent, 0.035) : mixHex(pal.light || pal.bg, "#f4f4f4", 0.55);
    if (lum(paper) < 0.82) paper = mixHex(paper, "#ffffff", 0.5);
    if (v === "calm") { accent = mixHex(accent, mixHex(pal.dark, "#9a9a9a", 0.5), 0.3); paper = mixHex(paper, "#ffffff", 0.35); dark = mixHex(dark, "#202022", 0.4); }
    if (v === "bold") { accent = mixHex(accent, "#000000", 0.08); dark = pal.accent ? mixHex(accent, "#000000", 0.8) : dark; paper = mixHex(paper, pal.light || paper, 0.25); }
    const ink = mixHex(dark, "#000000", 0.25);
    return { paper, dark, accent, ink: lum(mixHex(ink, "#1d1d1f", 0.6)) < 0.04 ? mixHex(ink, "#1d1d1f", 0.6) : "#1d1d1f", variant: v };
  }
  // 색은 표지 팔레트가 있으면 거기서만 (AI가 준 색은 표지를 못 읽었을 때만 쓴다)
  function edTheme(sp, pal) {
    sp = sp || {};
    const pc = sp.colors ? { ...sp.colors, ink: sp.colors.ink || mixHex(sp.colors.dark, "#1d1d1f", 0.7) } : pal ? palToColors(pal, sp.variant || "") : null;
    const paper = hex(pc?.paper || sp.paper, "#f1f1f2"), dark = hex(pc?.dark || sp.dark, "#0a0a0c");
    let ink = hex(pc?.ink || sp.ink, "#1d1d1f"); if (contrast(ink, paper) < 7) ink = lum(paper) > 0.4 ? "#1d1d1f" : "#f1f1f2";
    let accent = hex(pc?.accent || sp.accent, "#e83e6b");
    if (contrast(accent, paper) < 2.2) accent = mixHex(accent, ink, 0.35);
    let deep = mixHex(accent, "#000000", 0.14); for (let i = 0; i < 4 && contrast(deep, paper) < 4.5; i++) deep = mixHex(deep, ink, 0.3);
    let accD = accent; for (let i = 0; i < 4 && contrast(accD, dark) < 3; i++) accD = mixHex(accD, "#ffffff", 0.3);
    const M = (t) => mixHex(ink, paper, t), D = (t) => mixHex(dark, "#ffffff", t);
    const size = Math.max(13.5, Math.min(15.5, Number(sp.bodySize) || 14.5));
    const headKey = sp.headFont || "노토산스";
    return {
      sp, paper, dark, accent, deep, accD, ink,
      card: mixHex(paper, "#ffffff", 0.85), strong: mixHex(ink, "#000000", 0.4),
      body2: M(0.21), muted: M(0.37), meta: M(0.5), foot: M(0.5), hair: M(0.9), bar: M(0.85), chip: M(0.93),
      dText: readable("#ffffff", dark), dSub: D(0.68), dMeta: D(0.41), dLine: D(0.086), dFaint: D(0.45), dTocSub: D(0.59),
      display: fam(headKey, "노토산스"), head: DISPLAY_FONT.test(headKey) ? fam("노토산스") : fam(headKey, "노토산스"), body: fam(sp.bodyFont, "노토세리프"),
      ornament: String(sp.ornament || "◆ ◇ ◆").slice(0, 12), S: size / 16, size,
    };
  }
  const rgbaOf = (h, a) => `rgba(${parseInt(h.slice(1, 3), 16)},${parseInt(h.slice(3, 5), 16)},${parseInt(h.slice(5, 7), 16)},${a})`;
  const edf = (th, v) => Math.round(v * th.S * 10) / 10 + "px";
  // 섹션 라벨: 번호 있는 장은 CHAPTER 01, 나머지는 성격에 맞는 영문 라벨
  function edMeta(pt) {
    const sp = splitPart(pt.title); let t = sp.title, label = "";
    const pad = (n) => String(n).padStart(2, "0");
    const ap = t.match(/^부록\s*(\d+)?\s*(?:[—–·:.\-]\s*)?(.*)$/);
    if (pt.num) { label = "CHAPTER " + pad(pt.num); t = chTitle(t); }
    else if (ap) { label = "APPENDIX" + (ap[1] ? " " + pad(ap[1]) : ""); t = ap[2] || t; }
    else {
      label = /^(프롤로그|여는)/.test(t) ? "PROLOGUE" : /^(에필로그|닫는|맺음|나가며|마치며)/.test(t) ? "EPILOGUE" : /^체크리스트/.test(t) ? "CHECKLIST"
        : /^(들어가며|머리말|서문|시작하며)/.test(t) ? "INTRO" : /^(작가|저자|감사)/.test(t) ? "NOTE" : "";
      t = t.replace(/^(프롤로그|에필로그|체크리스트)\s*[·:—–\-]\s*/, "");
    }
    // 머리글용 짧은 라벨: "PART 1 · CHAPTER 01" (파트 이름은 빼고 번호만)
    const pn = sp.part ? (sp.part.match(/^(PART\s*\d+|제?\s*\d+\s*부)/i) || [sp.part])[0].replace(/\s+/g, " ").toUpperCase() : "";
    // PART(부) 이름은 어디에도 쓰지 않는다: 띠·차례·머리글 모두 CHAPTER 번호와 제목만
    void pn; const short = label, base = label, part = "";
    return { label, title: noDash(stripExtra(t)), short, base, part };
  }
  // 원고 블록 → 편집 컴포넌트 (본문/소제목/정리 박스/메모/대화/카드/실습 페이지)
  const SUM_HEAD = /^(거리\s*연습|실천|연습|오늘의\s*(연습|과제)|실천\s*과제|미션|워크시트|핵심\s*정리|정리하기|한눈에\s*정리|요약|체크\s*포인트|쓰실\s*때)/;
  const NOT_SPEAKER = /^(예|예시|주의|참고|정리|결론|요약|포인트|핵심|팁|tip|질문|답|단계|방법|이유|결과|목표|원칙|규칙|공식|출처|기간|비용|장소|시간|날짜|대상|준비물|문제|해결|원인|효과|장점|단점|특징|기준|조건|상황)$/i;
  function edBlocks(text) {
    const out = []; let inSum = false;
    richBlocks(text).forEach(b => {
      if (b.type === "h") {
        const sum = b.text.length < 60 && SUM_HEAD.test(b.text);
        inSum = sum;
        if (sum) { const m = b.text.split(/\s+[—–]\s+|\s*[:：]\s+/); out.push({ type: "sum", kind: "brk", label: m.length > 1 ? m[0] : "", text: m.length > 1 ? m.slice(1).join(" · ") : b.text }); return; }
        const m = b.text.match(/^(\d{1,2})[.)]\s+(.+)$/);
        out.push({ type: "h", kind: "h", num: m ? m[1].padStart(2, "0") : "", text: noDash(m ? m[2] : b.text) });
        return;
      }
      if (b.type === "li" && inSum) { out.push({ type: "card", kind: "card", text: b.text.replace(/\*\*/g, "") }); return; }
      if (b.type === "q") { out.push({ type: "q", kind: "q", text: b.text.replace(/\*\*/g, "") }); return; }
      if (b.type === "li") { out.push({ ...b, kind: "li" }); return; }
      const l = b.text;
      const f = l.replace(/\*\*/g, "").match(/^(정리하면|요약하면|결론은|한\s*줄로\s*말하면|다시\s*말해)[\s.…,]*=>\s*(.+)$/);
      if (f) { out.push({ type: "q", kind: "q", label: f[1], text: f[2] }); return; }
      // 단계 줄("<1단계> …", "STEP 1. …", "1단계: …")은 카드로
      const st = l.replace(/\*\*/g, "").match(/^(?:<\s*(\d{1,2})\s*단계\s*>|\[\s*(\d{1,2})\s*단계\s*\]|(\d{1,2})\s*단계\s*[.:：)]|STEP\s*(\d{1,2})\s*[.:：)]?)\s*(.+)$/i);
      if (st) { const n = st[1] || st[2] || st[3] || st[4]; out.push({ type: "card", kind: "card", head: `${n}단계`, text: st[5] }); return; }
      if (/^(→|※|참고\s*[:：]|tip\s*[:：]|주의\s*[:：])/i.test(l)) { out.push({ type: "note", kind: "p", text: l.replace(/^(→|※)\s*/, "") }); return; }
      const t = l.match(/^(✗\s*나쁜\s*예|○\s*좋은\s*예|[가-힣A-Za-z]{1,6})\s*[:：]\s*(.+)$/);
      if (t && !NOT_SPEAKER.test(t[1]) && t[2].length < 200 && !/(^|[\s.?!…])[가-힣A-Za-z]{1,6}\s*[:：]\s/.test(t[2])) {
        const who = t[1].replace(/^[✗○]\s*/, "");
        out.push({ type: "talk", kind: "talk", who, me: /^(나|내|저|좋은)/.test(who), bad: /^나쁜/.test(who), text: t[2] });
        return;
      }
      out.push({ type: "p", kind: "p", text: l });
    });
```

## 본문 블록 읽기(richBlocks)

```js
function richBlocks(text) {
    return text.split(/\n+/).map(l => l.trim()).filter(l => l && !/^(-{3,}|\*{3,}|_{3,})$/.test(l)).map(l => {
      const md = l.match(/^#{1,6}\s+(.+)$/);
      if (md) return { type: "h", text: md[1].replace(/\*\*/g, "") };
      if (l.startsWith("■")) return { type: "h", text: l.replace(/^■\s*/, "").replace(/\*\*/g, "") };
      const bold = l.match(/^\*\*([^*]+)\*\*$/);
      if (bold && bold[1].length < 70) return { type: "h", text: bold[1] };
      const plain = l.replace(/\*\*/g, "");
      const bq = plain.match(/^>\s?(.+)$/);
      if (bq) return { type: "q", text: bq[1] };
      // 둥근 따옴표로 감싼 한 줄만 강조 문장. 곧은 따옴표 "…"는 대사라서 본문으로 둔다
      if (/^[“「『][^“”「」『』]+[”」』]$/.test(plain)) return { type: "q", text: plain.slice(1, -1) };
      const li = l.match(/^([□☐✔✓☑·•\-]|\*(?=\s)|\d{1,2}[.)])\s*/);
      if (li && l.length < 120) return { type: "li", mark: /^\d/.test(li[1]) ? li[1].replace(")", ".") : "✓", text: l.slice(li[0].length) };
      return { type: "p", text: l };
    });
```

## 장 번호 규칙(numberParts)

```js
function numberParts(parts) {
    let n = 0;
    return parts.map(p => {
      const t = splitPart(p.title).title;
      if (UNNUM.test(t)) return { ...p, num: 0 };
      const m = t.match(/^(?:CHAPTER\s*|제\s*)?0?(\d{1,2})(?=\s*장|[.\s:]|$)/i);
      n = m ? +m[1] : n + 1;
      return { ...p, num: n };
    });
  }
```

## 원고 → 장 나누기(bookParts)

```js
function bookParts() {
    const t = currentBookText();
    if (draftParts.length && (!t || t === $("draftText").textContent.trim())) return numberParts(draftParts);
    if (!t) return [];
    if (/━{4,}/.test(t)) {
      const bits = t.split(/\n*━{4,}\n(.+)\n━{4,}\n*/);
      const parts = [];
      for (let i = 1; i < bits.length; i += 2) parts.push({ title: bits[i].trim(), text: (bits[i + 1] || "").trim() });
      if (parts.length) return numberParts(parts);
    }
    let lines = t.split("\n");
    const isHeadish = (l) => /^#{1,6}\s+\S/.test(l) || CH_LINE.test(cleanHead(l));
    // 1) 원고 속 차례 페이지는 걷어낸다: '차례' 뒤에 나온 제목이 다시 나오는 곳부터가 본문
    const ti = lines.findIndex(l => TOC_LINE.test(l.trim()));
    if (ti >= 0) {
      const seen = [];
      for (let i = ti + 1; i < Math.min(lines.length, ti + 250); i++) {
        const k = normHead(lines[i]); if (k.length < 2) continue;
        if (seen.length >= 2 && isHeadish(lines[i].trim()) && seen.some(s => s === k || (k.length >= 4 && s.startsWith(k)) || (s.length >= 4 && k.startsWith(s)))) { lines.splice(ti, i - ti); break; }
        seen.push(k);
      }
    }
    // 2) # 제목이 있으면 가장 바깥 단계(2번 이상 나오는 것)를 장 제목으로, 그 아래 단계는 소제목으로
    const md = lines.map(l => { const m = l.trim().match(/^(#{1,6})\s+\S/); return m ? m[1].length : 0; });
    const levels = [...new Set(md.filter(Boolean))].sort((a, b) => a - b);
    let chLv = 0;
    for (const lv of levels) { const n = md.filter(x => x === lv).length; if (n >= 2 && n <= 80) { chLv = lv; break; } if (n !== 1) break; }
    const parts = []; let cur = null;
    lines.forEach((line, i) => {
      const l = line.trim(), lv = md[i], head = cleanHead(l);
      let isCh = false;
      if (l && head) isCh = lv ? (chLv ? lv === chLv : CH_LINE.test(head)) : !chLv && l.length < 50 && !/[.]$/.test(l) && CH_LINE.test(head);
      if (isCh) { cur = { title: head, text: "" }; parts.push(cur); return; }
      if (lv && cur && !cur.text.trim() && !cur.sub && (!chLv || lv === chLv + 1)) { cur.sub = head; return; }
      const out = lv ? "■ " + head : line;
      if (cur) cur.text += out + "\n";
      else { cur = { title: "시작하며", text: out + "\n" }; parts.push(cur); }
    });
    // 첫 제목 앞의 짧은 머리말(책 제목·부제·분량 같은 정보)은 섹션으로 만들지 않는다
    if (parts[0]?.title === "시작하며" && parts.length > 1 && parts[0].text.replace(/^\s*(책 제목|부제|원씽|분량|뼈대)\s*[:：].*$/gm, "").trim().length < 300) parts.shift();
    // 3) 'PART 1' 같은 묶음 제목만 있는 줄은 다음 장 제목 앞에 붙인다
    for (let i = parts.length - 2; i >= 0; i--) {
      if (PART_LINE.test(parts[i].title) && !splitPart(parts[i].title).part && !parts[i].sub && parts[i].text.trim().length < 200 && !PART_LINE.test(parts[i + 1].title)) {
        parts[i + 1].title = `${parts[i].title} · ${parts[i + 1].title}`;
        parts.splice(i, 1);
      }
    }
    return numberParts(parts.filter(p => p.text.trim() || p.sub));
  }
```

## 페이지 나누기(paginate)

```js
function paginate(items, cap0, firstCap) {
    const isHead = (k) => items[k].kind === "title" || items[k].kind === "h" || items[k].kind === "brk";
    let cap = firstCap || cap0;
    const H = (idx) => idx.reduce((a, k) => a + items[k].h, 0);
    // 1) 묶음 만들기: 목록은 한 묶음, 제목은 뒤 묶음에 붙인다
    let units = [];
    for (let i = 0; i < items.length;) {
      if (items[i].kind === "li") { let j = i; while (j < items.length && items[j].kind === "li") j++; units.push({ idx: Array.from({ length: j - i }, (_, n) => i + n) }); i = j; }
      else { units.push({ idx: [i] }); i++; }
    }
    for (let u = units.length - 2; u >= 0; u--) {
      if (units[u].idx.every(isHead)) { units[u + 1] = { idx: units[u].idx.concat(units[u + 1].idx) }; units.splice(u, 1); }
    }
    // 2) 채우기
    const pages = [[]]; let used = 0;
    const put = (idx) => { pages[pages.length - 1].push(...idx); used += H(idx); };
    const newPg = () => { if (pages[pages.length - 1].length) { pages.push([]); used = 0; cap = cap0; } };
    for (const u of units) {
      if (items[u.idx[0]].kind === "brk") newPg(); // 실습·정리 페이지는 새 페이지에서
      let rest = u.idx.slice();
      while (rest.length) {
        if (used + H(rest) <= cap) { put(rest); rest = []; break; }
        const heads = rest.findIndex(k => !isHead(k)); const lis = rest.filter(k => items[k].kind === "li").length;
        // 들어가는 개수
        let n = 0, acc = 0; for (const k of rest) { if (used + acc + items[k].h > cap) break; acc += items[k].h; n++; }
        const empty = !pages[pages.length - 1].length;
        if (lis > 5 && heads >= 0) {
          // 긴 목록: 이 페이지 목록 2개 이상, 다음 페이지 2개 이상 남을 때만 나눈다
          let m = n; while (m > heads && (rest.length - m) < 2) m--;
          if (m - heads >= 2 && rest.length - m >= 2) { put(rest.slice(0, m)); rest = rest.slice(m); newPg(); continue; }
        }
        if (empty) { // 빈 쪽에도 안 들어가는 긴 묶음: 통째로 두면 실제로 그릴 때 안전장치가 문단을 나눠 다음 쪽으로 넘긴다
          if (lis > 5) { const m = Math.max(heads + 2, n); put(rest.slice(0, m)); rest = rest.slice(m); if (rest.length) newPg(); continue; }
          put(rest); rest = []; break;
        }
        // 묶음 끝이 나눌 수 있는 문단이고 이 쪽에 소제목 + 세 줄 정도 들어갈 자리가 있으면, 이 쪽에 두고 넘치는 부분은 실제로 그릴 때 다음 쪽으로 이어 쓴다
        const tail = rest[rest.length - 1];
        if (items[tail].split && used + H(rest.slice(0, -1)) + 96 <= cap) { put(rest); rest = []; break; }
        newPg();
      }
    }
    // 3) 마지막 페이지 균형 맞추기
    cap = cap0;
    for (let g = 0; g < 8 && pages.length > 1; g++) {
      const last = pages[pages.length - 1], prev = pages[pages.length - 2];
      if (H(last) >= cap * 0.25 || prev.length < 2) break;
      // prev 끝에서 옮길 덩어리: 끝 블록 하나(목록이면 그 목록 전체), 그 앞 제목까지
      let a = prev.length - 1;
      if (items[prev[a]].kind === "li") { while (a > 0 && items[prev[a - 1]].kind === "li") a--; }
      while (a > 0 && isHead(prev[a - 1])) a--;
      if (a === 0) a = prev.length; // 통째로는 못 옮김
      let chunk = prev.slice(a);
      if (a === prev.length || H(last) + H(chunk) > cap || H(prev) - H(chunk) < cap * 0.35) {
        // 긴 목록 꼬리 옮기기: 뒤에서 2개 이상, 앞에도 2개 이상 남게
        const e = prev.length; let s0 = e; while (s0 > 0 && items[prev[s0 - 1]].kind === "li") s0--;
        let done = false;
        for (let t = 2; e - s0 - t >= 2; t++) {
          const c = prev.slice(e - t);
          if (H(last) + H(c) > cap) break;
          if (H(last) + H(c) >= cap * 0.25) { chunk = c; a = e - t; done = true; break; }
        }
        if (!done) break;
      }
      pages[pages.length - 2] = prev.slice(0, a);
      pages[pages.length - 1] = chunk.concat(last);
    }
    return pages.filter(pg => pg.length);
  }
```

## 편집 엔진 판면 상수(ED)

```js
const ED = (() => {
    const K = PW / 794, r = (v) => Math.round(v * K);
    return { K, mx: r(91), top: r(88), bottom: r(1000), band: r(434), stripe: Math.max(3, r(5)), bodyTop: r(491), footY: r(1038), footText: r(1050) };
  })();
```

## 편집 엔진 색 단계(edTheme)

```js
function edTheme(sp, pal) {
    sp = sp || {};
    const pc = sp.colors ? { ...sp.colors, ink: sp.colors.ink || mixHex(sp.colors.dark, "#1d1d1f", 0.7) } : pal ? palToColors(pal, sp.variant || "") : null;
    const paper = hex(pc?.paper || sp.paper, "#f1f1f2"), dark = hex(pc?.dark || sp.dark, "#0a0a0c");
    let ink = hex(pc?.ink || sp.ink, "#1d1d1f"); if (contrast(ink, paper) < 7) ink = lum(paper) > 0.4 ? "#1d1d1f" : "#f1f1f2";
    let accent = hex(pc?.accent || sp.accent, "#e83e6b");
    if (contrast(accent, paper) < 2.2) accent = mixHex(accent, ink, 0.35);
    let deep = mixHex(accent, "#000000", 0.14); for (let i = 0; i < 4 && contrast(deep, paper) < 4.5; i++) deep = mixHex(deep, ink, 0.3);
    let accD = accent; for (let i = 0; i < 4 && contrast(accD, dark) < 3; i++) accD = mixHex(accD, "#ffffff", 0.3);
    const M = (t) => mixHex(ink, paper, t), D = (t) => mixHex(dark, "#ffffff", t);
    const size = Math.max(13.5, Math.min(15.5, Number(sp.bodySize) || 14.5));
    const headKey = sp.headFont || "노토산스";
    return {
      sp, paper, dark, accent, deep, accD, ink,
      card: mixHex(paper, "#ffffff", 0.85), strong: mixHex(ink, "#000000", 0.4),
      body2: M(0.21), muted: M(0.37), meta: M(0.5), foot: M(0.5), hair: M(0.9), bar: M(0.85), chip: M(0.93),
      dText: readable("#ffffff", dark), dSub: D(0.68), dMeta: D(0.41), dLine: D(0.086), dFaint: D(0.45), dTocSub: D(0.59),
      display: fam(headKey, "노토산스"), head: DISPLAY_FONT.test(headKey) ? fam("노토산스") : fam(headKey, "노토산스"), body: fam(sp.bodyFont, "노토세리프"),
      ornament: String(sp.ornament || "◆ ◇ ◆").slice(0, 12), S: size / 16, size,
    };
  }
```

## 섹션 라벨(edMeta)

```js
function edMeta(pt) {
    const sp = splitPart(pt.title); let t = sp.title, label = "";
    const pad = (n) => String(n).padStart(2, "0");
    const ap = t.match(/^부록\s*(\d+)?\s*(?:[—–·:.\-]\s*)?(.*)$/);
    if (pt.num) { label = "CHAPTER " + pad(pt.num); t = chTitle(t); }
    else if (ap) { label = "APPENDIX" + (ap[1] ? " " + pad(ap[1]) : ""); t = ap[2] || t; }
    else {
      label = /^(프롤로그|여는)/.test(t) ? "PROLOGUE" : /^(에필로그|닫는|맺음|나가며|마치며)/.test(t) ? "EPILOGUE" : /^체크리스트/.test(t) ? "CHECKLIST"
        : /^(들어가며|머리말|서문|시작하며)/.test(t) ? "INTRO" : /^(작가|저자|감사)/.test(t) ? "NOTE" : "";
      t = t.replace(/^(프롤로그|에필로그|체크리스트)\s*[·:—–\-]\s*/, "");
    }
    // 머리글용 짧은 라벨: "PART 1 · CHAPTER 01" (파트 이름은 빼고 번호만)
    const pn = sp.part ? (sp.part.match(/^(PART\s*\d+|제?\s*\d+\s*부)/i) || [sp.part])[0].replace(/\s+/g, " ").toUpperCase() : "";
    // PART(부) 이름은 어디에도 쓰지 않는다: 띠·차례·머리글 모두 CHAPTER 번호와 제목만
    void pn; const short = label, base = label, part = "";
    return { label, title: noDash(stripExtra(t)), short, base, part };
  }
```

## 원고 블록 → 편집 컴포넌트(edBlocks)

```js
function edBlocks(text) {
    const out = []; let inSum = false;
    richBlocks(text).forEach(b => {
      if (b.type === "h") {
        const sum = b.text.length < 60 && SUM_HEAD.test(b.text);
        inSum = sum;
        if (sum) { const m = b.text.split(/\s+[—–]\s+|\s*[:：]\s+/); out.push({ type: "sum", kind: "brk", label: m.length > 1 ? m[0] : "", text: m.length > 1 ? m.slice(1).join(" · ") : b.text }); return; }
        const m = b.text.match(/^(\d{1,2})[.)]\s+(.+)$/);
        out.push({ type: "h", kind: "h", num: m ? m[1].padStart(2, "0") : "", text: noDash(m ? m[2] : b.text) });
        return;
      }
      if (b.type === "li" && inSum) { out.push({ type: "card", kind: "card", text: b.text.replace(/\*\*/g, "") }); return; }
      if (b.type === "q") { out.push({ type: "q", kind: "q", text: b.text.replace(/\*\*/g, "") }); return; }
      if (b.type === "li") { out.push({ ...b, kind: "li" }); return; }
      const l = b.text;
      const f = l.replace(/\*\*/g, "").match(/^(정리하면|요약하면|결론은|한\s*줄로\s*말하면|다시\s*말해)[\s.…,]*=>\s*(.+)$/);
      if (f) { out.push({ type: "q", kind: "q", label: f[1], text: f[2] }); return; }
      // 단계 줄("<1단계> …", "STEP 1. …", "1단계: …")은 카드로
      const st = l.replace(/\*\*/g, "").match(/^(?:<\s*(\d{1,2})\s*단계\s*>|\[\s*(\d{1,2})\s*단계\s*\]|(\d{1,2})\s*단계\s*[.:：)]|STEP\s*(\d{1,2})\s*[.:：)]?)\s*(.+)$/i);
```

## 컴포넌트 그리기(edBlockEl)

```js
function edBlockEl(th, b) {
    const f = (v) => edf(th, v);
    if (b.type === "h") {
      const w = mk("div", `margin:0 0 ${f(22)};`);
      const dv = mk("div", `height:1px;background:${th.hair};margin:${f(10)} 0 ${f(38)};`); dv.dataset.div = "1"; w.appendChild(dv);
      if (b.num) w.appendChild(mk("div", `font-family:${th.head};font-size:${f(13)};font-weight:700;color:${th.accent};letter-spacing:0.04em;margin:0 0 ${f(9)};`, b.num));
      const row = mk("div", "display:flex;align-items:flex-start;");
      row.appendChild(mk("div", `flex:none;width:${f(5)};height:${f(30)};background:${th.accent};`));
      row.appendChild(mk("div", `margin-left:${f(14)};font-family:${th.head};font-size:${f(20)};line-height:${f(30)};font-weight:700;color:${th.strong};word-break:keep-all;overflow-wrap:anywhere;`, b.text));
      w.appendChild(row); return w;
    }
    if (b.type === "sum") {
      const w = mk("div", `padding-top:${Math.round(150 * ED.K)}px;margin:0 0 ${f(46)};text-align:center;`);
      if (b.label) w.appendChild(mk("div", `font-family:${th.head};font-size:${f(12.5)};font-weight:700;letter-spacing:0.3em;color:${th.accent};margin:0 0 ${f(14)};`, noDash(b.label)));
      w.appendChild(mk("div", `font-family:${th.head};font-size:${f(27)};line-height:1.45;font-weight:700;color:${th.strong};word-break:keep-all;overflow-wrap:anywhere;`, noDash(b.text)));
      if (b.sub) w.appendChild(mk("div", `font-family:${th.head};font-size:${f(13.5)};color:${th.meta};margin-top:${f(16)};`, b.sub));
      return w;
    }
    if (b.type === "card") {
      const m = b.head ? [null, b.head, b.text] : b.text.match(/^(.+?[.!?。])\s+(.+)$/);
      const w = mk("div", `background:${th.card};border-left:${f(5)} solid ${th.accent};padding:${f(24)} ${f(26)} ${f(24)} ${f(26)};margin:0 0 ${f(26)};`);
      w.appendChild(mk("div", `font-family:${th.head};font-size:${f(17)};line-height:1.55;font-weight:700;color:${th.deep};word-break:keep-all;overflow-wrap:anywhere;`, m ? m[1] : b.text));
      if (m) w.appendChild(mk("div", `font-size:${f(15.5)};line-height:2;color:${th.body2};margin-top:${f(8)};word-break:keep-all;overflow-wrap:anywhere;`, m[2]));
      return w;
    }
    if (b.type === "q") {
      const w = mk("div", `margin:${f(8)} 0 ${f(30)};padding:${f(24)} ${f(10)};border-top:${f(2)} solid ${th.accent};border-bottom:${f(2)} solid ${th.accent};text-align:center;`);
      if (b.label) w.appendChild(mk("div", `font-family:${th.head};font-size:${f(12.5)};color:${th.meta};margin:0 0 ${f(10)};letter-spacing:0.08em;`, b.label));
      w.appendChild(mk("div", `font-family:${th.head};font-size:${f(19)};line-height:1.65;font-weight:700;color:${th.strong};word-break:keep-all;overflow-wrap:anywhere;`, b.text));
      return w;
    }
    if (b.type === "note") return mk("div", `margin:${f(-4)} 0 ${f(22)};padding:${f(2)} 0 ${f(2)} ${f(15)};border-left:${f(2)} solid ${th.bar};font-size:${f(14.5)};line-height:1.85;color:${th.muted};word-break:keep-all;overflow-wrap:anywhere;`, b.text.replace(/\*\*/g, ""));
    if (b.type === "talk") {
      const w = mk("div", `margin:0 0 ${f(20)};`);
      const chipBg = b.me ? th.accent : b.bad ? th.chip : th.ink, chipInk = b.me ? readable("#ffffff", th.accent) : b.bad ? th.body2 : th.paper;
      w.appendChild(mk("span", `display:inline-block;font-family:${th.head};font-size:${f(11.5)};font-weight:700;line-height:${f(25)};height:${f(25)};padding:0 ${f(11)};border-radius:999px;background:${chipBg};color:${chipInk};`, b.who));
      const line = mk("div", `margin-top:${f(10)};padding-left:${f(14)};border-left:${f(3)} solid ${b.me ? th.accent : b.bad ? th.bar : th.ink};word-break:keep-all;overflow-wrap:anywhere;` +
        (b.me || b.bad ? `font-size:${f(16.5)};line-height:1.9;color:${b.bad ? th.muted : th.ink};` : `font-family:${th.head};font-size:${f(17.5)};line-height:1.6;font-weight:700;color:${th.strong};`));
      w.appendChild(edInline(th, line, b.text)); return w;
    }
    if (b.type === "li") {
      const w = mk("div", `display:flex;margin:0 0 ${f(10)};`);
      w.appendChild(mk("span", `flex:none;width:${f(26)};margin-right:${f(6)};text-align:right;font-family:${th.head};font-size:${f(15)};line-height:${f(30)};font-weight:700;color:${th.accent};`, b.mark || "✓"));
      w.appendChild(edInline(th, mk("span", `font-size:${f(16)};line-height:${f(30)};color:${th.ink};word-break:keep-all;overflow-wrap:anywhere;`), b.text));
      return w;
    }
    const para = edInline(th, mk("p", `font-size:${f(16)};line-height:${f(31)};margin:0 0 ${f(18)};color:${th.ink};word-break:keep-all;overflow-wrap:anywhere;`), b.text);
    para.dataset.src = b.text; return para;
  }
```

## 머리글·쪽번호(edFooter)

```js
function edFooter(th, p, n, run) {
    p.appendChild(mk("div", `position:absolute;left:${ED.mx}px;right:${ED.mx}px;top:${ED.footY}px;height:1px;background:${th.hair};`));
    const f = mk("div", `position:absolute;left:${ED.mx}px;right:${ED.mx}px;top:${ED.footText}px;display:flex;justify-content:space-between;align-items:center;gap:16px;font-family:${th.head};`);
    // 머리글은 줄이거나 자르지 않는다. 길면 두 줄로 내려간다
    f.appendChild(mk("span", `min-width:0;font-size:${edf(th, 10.5)};line-height:1.4;color:${th.foot};word-break:keep-all;overflow-wrap:anywhere;`, run));
    f.appendChild(mk("span", `flex:none;font-size:${edf(th, 12)};font-weight:700;color:${th.accent};letter-spacing:0.04em;`, String(n).padStart(3, "0")));
    p.appendChild(f);
  }
```

## 장 시작 다크 밴드(edBand)

```js
function edBand(th, pt, blocks) {
    const meta = edMeta(pt), f = (v) => edf(th, v);
    const band = mk("div", `position:absolute;left:0;top:0;right:0;height:${ED.band - ED.stripe}px;background:${th.dark};display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;padding:${f(18)} ${ED.mx}px;box-sizing:border-box;overflow:hidden;`);
    // PART 이름은 챕터 띠에 넣지 않는다 (CHAPTER 번호와 제목만)
    if (meta.base) band.appendChild(mk("div", `font-family:${th.head};font-size:${f(12.5)};font-weight:700;letter-spacing:0.32em;padding-left:0.32em;color:${th.accD};`, meta.base));
    const title = mk("div", `font-family:${th.display};font-size:${f(32)};line-height:1.35;font-weight:900;color:${th.dText};margin-top:${f(18)};word-break:keep-all;overflow-wrap:anywhere;`, meta.title);
    band.appendChild(title);
    let sub = null;
    if (pt.sub) { sub = mk("div", `font-family:${th.head};font-size:${f(15)};line-height:1.6;color:${th.dSub};margin-top:${f(14)};word-break:keep-all;overflow-wrap:anywhere;`, noDash(pt.sub)); band.appendChild(sub); }
    const orn = mk("div", `font-size:${f(13)};letter-spacing:0.5em;color:${th.accD};margin-top:${f(22)};padding-left:0.5em;`, th.ornament);
    band.appendChild(orn);
    const wrap = mk("div", "");
    wrap.append(band, mk("div", `position:absolute;left:0;right:0;top:${ED.band - ED.stripe}px;height:${ED.stripe}px;background:${th.accent};`));
    // 실제로 그려 본 뒤 밴드보다 길면 제목 글자를 줄이고, 그래도 길면 장식을 뺀다
    wrap._fit = () => {
      const steps = [32, 28, 25, 22, 20]; let i = 0;
      while (band.scrollHeight > band.clientHeight + 1 && i < steps.length - 1) { i++; title.style.fontSize = f(steps[i]); if (sub) sub.style.fontSize = f(Math.max(12.5, 15 - i * 0.6)); }
      if (band.scrollHeight > band.clientHeight + 1) orn.remove();
    };
    return wrap;
  }
```

## 장 → 페이지들(edChapter)

```js
function edChapter(th, pt, ctx) {
    const meta = edMeta(pt);
    // 머리글은 레퍼런스처럼 짧게: "책 제목 · CHAPTER 01" (장 제목은 넣지 않는다. 길면 잘려 보이니까)
    const run = [ctx.book, meta.short || meta.title].filter(Boolean).join(" · ");
    const blocks = edBlocks(pt.text);
    blocks.forEach(b => { if (b.type === "sum") b.sub = [meta.label, meta.title].filter(Boolean).join(" · "); });
    const els = blocks.map(b => { const e = edBlockEl(th, b); e.dataset.kind = b.kind; return e; });
    const hs = measureBlocks(ctx.probe, els);
    const pgs = blocks.length ? paginate(hs.map((h, i) => ({ h, kind: blocks[i].kind, split: els[i].tagName === "P" })), ED.cap, ED.firstCap) : [[]];
    // 1) 계산대로 쪽을 만든다
    const mkPage = (first) => {
      const p = edPage(th), top = first ? ED.bodyTop : ED.top, cap = first ? ED.firstCap : ED.cap;
      if (first) p.appendChild(edBand(th, pt, blocks));
      const box = mk("div", `position:absolute;left:${ED.mx}px;right:${ED.mx}px;top:${top}px;height:${cap}px;overflow:hidden;display:flex;flex-direction:column;`);
      p.appendChild(box); return { p, box };
    };
    const out = pgs.map((idx, i) => {
      const pg = mkPage(i === 0);
      idx.forEach(k => { const e = els[k]; e.style.flex = "none"; pg.box.appendChild(e); });
      return pg;
    });
    // 2) 안전장치: 실제로 그려 보고, 넘친 블록은 다음 쪽으로 보낸다. 긴 문단은 쪽 끝에서 단어 단위로 나눠 이어 쓴다
    const host = ctx.probe?.parentNode?.parentNode;
    const over = (box) => box.scrollHeight > box.clientHeight + 1;
    const splitPara = (box, el) => {
      // el(문단)이 이 쪽에 들어가는 만큼만 남기고 나머지를 새 문단으로 돌려준다. 두 줄도 안 들어가면 null
      const words = String(el.dataset.src || el.textContent).split(/(\s+)/);
      const fill = (n) => { el.textContent = ""; edInline(th, el, words.slice(0, n).join("").replace(/\*\*(?![^*]*\*\*)/g, "")); };
      let lo = 0, hi = words.length;
      while (lo < hi) { const mid = Math.ceil((lo + hi) / 2); fill(mid); if (over(box)) hi = mid - 1; else lo = mid; }
      const lineH = parseFloat(getComputedStyle(el).lineHeight) || 30;
      fill(lo);
      if (lo === 0 || el.getBoundingClientRect().height < lineH * 1.8) { fill(words.length); return null; }
      const rest = el.cloneNode(false); rest.textContent = "";
      const restSrc = words.slice(lo).join("").replace(/^\s+/, "");
      edInline(th, rest, restSrc); rest.dataset.src = restSrc;
      el.style.marginBottom = "0"; el.dataset.src = words.slice(0, lo).join("");
      return rest;
    };
    if (host) {
      for (let i = 0; i < out.length; i++) {
        const pg = out[i]; host.appendChild(pg.p);
        if (i === 0) pg.p.firstChild?._fit?.();
        const carry = [];
        while (over(pg.box) && pg.box.children.length) {
          const last = pg.box.lastElementChild;
          if (last.tagName === "P" && last.dataset.src) {
            pg.box.removeChild(last); pg.box.appendChild(last);
            const rest = splitPara(pg.box, last);
            if (rest) { carry.unshift(rest); break; }
          }
          if (pg.box.children.length === 1) break; // 한 블록이 한 쪽보다 크면 어쩔 수 없이 둔다
          carry.unshift(pg.box.removeChild(last));
        }
        // 쪽 끝이 소제목·실습 제목이면 다음 쪽으로 같이 넘긴다
        while (pg.box.children.length > 1 && /^(h|brk)$/.test(pg.box.lastElementChild.dataset.kind || "") && (carry.length || out[i + 1])) carry.unshift(pg.box.removeChild(pg.box.lastElementChild));
        host.removeChild(pg.p);
        if (carry.length) {
          let nx = out[i + 1];
          if (!nx) { nx = mkPage(false); out.push(nx); }
          nx.box.prepend(...carry);
        }
      }
      // 빈 쪽은 지운다
      for (let i = out.length - 1; i > 0; i--) if (!out[i].box.children.length) out.splice(i, 1);
    }
    // 3) 쪽 맨 위 구분선은 지우고, 쪽번호·머리글을 붙인다
    return out.map(pg => {
      pg.box.firstElementChild?.querySelector?.("[data-div]")?.remove();
      edFooter(th, pg.p, ++ctx.pageNo, run);
      return pg.p;
    });
  }
```

## 다크 차례(edToc)

```js
function edToc(th, parts, book, starts = []) {
    const K = ED.K, f = (v) => edf(th, v), top = Math.round(200 * K), avail = ED.footY - 24 - top;
    const host = mk("div", "position:fixed;left:-20000px;top:0;"); document.body.appendChild(host);
    const shell = (cont) => {
      const p = edPage(th, true);
      p.appendChild(mk("div", `position:absolute;left:50%;top:${-Math.round(160 * K)}px;width:${Math.round(760 * K)}px;height:${Math.round(460 * K)}px;transform:translateX(-50%);background:radial-gradient(ellipse at center, ${rgbaOf(th.accent, 0.22)} 0%, ${rgbaOf(th.accent, 0)} 68%);`));
      p.appendChild(mk("div", `position:absolute;left:0;right:0;top:${Math.round(66 * K)}px;text-align:center;font-family:${th.head};font-size:${f(32)};font-weight:700;letter-spacing:0.6em;padding-left:0.6em;color:${th.dText};`, "차례"));
      p.appendChild(mk("div", `position:absolute;left:50%;top:${Math.round(139 * K)}px;width:${Math.round(150 * K)}px;height:3px;margin-left:${-Math.round(75 * K)}px;background:${th.accent};`));
      if (cont) p.appendChild(mk("div", `position:absolute;left:0;right:0;top:${Math.round(152 * K)}px;text-align:center;font-family:${th.head};font-size:${f(12)};color:${th.dTocSub};`, "이어서"));
      p.appendChild(mk("div", `position:absolute;left:0;right:0;top:${ED.footText}px;text-align:center;font-family:${th.head};font-size:${f(11.5)};letter-spacing:0.4em;padding-left:0.4em;color:${th.dFaint};`, book));
      const box = mk("div", `position:absolute;left:${Math.round(128 * K)}px;right:${Math.round(128 * K)}px;top:${top}px;`);
      p.appendChild(box); return { p, box };
    };
    // 줄 목록: PART가 바뀌는 곳에 PART 이름 줄을 끼운다
    const items = []; let lastPart = "";
    parts.forEach((pt, i) => { const m = edMeta(pt); if (m.part && m.part !== lastPart) items.push({ part: m.part }); lastPart = m.part || lastPart; items.push({ pt, m, page: starts[i] }); });
    const rowEl = (it, k) => {
      if (it.part) return mk("div", `padding:${Math.round(16 * k)}px 0 ${Math.round(4 * k)}px;font-family:${th.head};font-size:${f(12 * k)};font-weight:700;letter-spacing:0.12em;color:${th.accD};word-break:keep-all;overflow-wrap:anywhere;`, it.part);
      const { pt, m } = it, pad = Math.round(14 * k);
      const r = mk("div", `display:flex;align-items:flex-start;gap:${f(10)};padding:${pad}px 0;border-bottom:1px solid ${th.dLine};`);
      r.appendChild(mk("div", `flex:none;width:${Math.round(52 * K)}px;font-family:${th.head};font-size:${f(16 * k)};line-height:1.45;font-weight:700;color:${th.accD};`, pt.num ? String(pt.num).padStart(2, "0") : ""));
      const col = mk("div", "min-width:0;flex:1;");
      col.appendChild(mk("div", `font-family:${th.head};font-size:${f(17 * k)};font-weight:700;line-height:1.45;color:${pt.num ? th.dText : th.dSub};word-break:keep-all;overflow-wrap:anywhere;`, m.title));
      const sub = pt.sub || (!pt.num && m.base ? m.base : "");
      if (sub) col.appendChild(mk("div", `font-family:${th.head};font-size:${f(13.5 * k)};line-height:1.45;color:${th.dTocSub};margin-top:${f(4)};word-break:keep-all;overflow-wrap:anywhere;`, noDash(sub)));
      r.appendChild(col);
      if (it.page) r.appendChild(mk("div", `flex:none;font-family:${th.head};font-size:${f(13 * k)};line-height:1.7;font-variant-numeric:tabular-nums;color:${th.dTocSub};`, String(it.page).padStart(3, "0")));
      return r;
    };
    const build = (list, k, cont) => { const sh = shell(cont); list.forEach(it => sh.box.appendChild(rowEl(it, k))); return sh; };
    const fits = (sh) => { host.appendChild(sh.p); const h = sh.box.getBoundingClientRect().height; host.removeChild(sh.p); return h <= avail; };
    try {
      // 1) 한 쪽에 다 들어가는 글자 크기를 찾는다
      for (const k of [1, 0.92, 0.85, 0.78]) { const sh = build(items, k, false); if (fits(sh)) return [sh.p]; }
      // 2) 넘치면 가장 작은 크기로 쪽 수를 정하고, 쪽마다 줄 수를 고르게 나눈다 (PART 이름 줄이 쪽 끝에 혼자 남지 않게)
      const k = 0.78;
      for (let n = 2; n <= 6; n++) {
        const per = Math.ceil(items.length / n), chunks = [];
        for (let i = 0; i < items.length;) { let j = Math.min(items.length, i + per); while (j < items.length && j > i + 1 && items[j - 1].part) j--; chunks.push(items.slice(i, j)); i = j; }
        const shs = chunks.map((c, i) => build(c, k, i > 0));
        if (shs.every(fits)) return shs.map(x => x.p);
      }
      return [build(items, k, false).p];
    } finally { host.remove(); }
  }
```

## 활자 표지 6종(drawTypo)

```js
function drawTypo(x, sp, W, H) {
    const d = { ...typoText(sp), C: typoColors(sp) }, M = 120, TW = W - M * 2, ry = H / 1944;
    const F = { XB: "800", B: "700", R: "400" };
    // 제목 글꼴을 고르면 제목·강조어는 그 글꼴로. 장식 글꼴이 아니면 부제·작가도 같은 글꼴로 맞춘다
    const tf = FONTS[sp.titleFont] && sp.titleFont !== "페이퍼로지" ? sp.titleFont : "", deco = tf && DISPLAY_FONT.test(tf);
    const font = (size, face) => (!tf || (deco && face !== "XB")) ? `${F[face]} ${size}px Paperlogy, "Noto Sans KR", sans-serif`
      : `${deco ? "400" : face === "XB" ? "900" : face === "B" ? "700" : "400"} ${size}px ${fam(tf)}`;
    const ls = (v) => { try { x.letterSpacing = v + "px"; } catch (e) {} };
    const put = (t, px, py, size, face, color, l = 0) => { x.font = font(size, face); x.fillStyle = color; ls(l); x.fillText(t, px, py); };
    const fit = (texts, face, max, width = TW) => Math.min(max, ...texts.map(t => { x.font = font(max, face); ls(-max * 0.04); return Math.floor(max * width / Math.max(1, x.measureText(t).width)); }));
    // 부제는 어절로 나누고, 마지막 줄에 한두 글자만 남으면 폭을 줄여 다시 나눈다
    const wrap = (t, size, face, width) => {
      const one = (wd) => { x.font = font(size, face); ls(0); const out = [];
        for (const w of String(t).split(" ").filter(Boolean)) { const cur = out.length ? out[out.length - 1] + " " + w : w; if (out.length && x.measureText(cur).width <= wd) out[out.length - 1] = cur; else out.push(w); }
        return out; };
      let best = one(width);
      for (let k = 1; k <= 6 && best.length > 1 && best[best.length - 1].replace(/\s/g, "").length < 4; k++) { const n = one(width * (1 - k * 0.06)); if (n.length <= best.length + 1) best = n; }
      return best;
    };
    const rect = (c, px, py, w, h) => { x.fillStyle = c; x.fillRect(px, py, w, h); };
    x.textBaseline = "alphabetic"; x.textAlign = "left";
    const C = d.C, SUB = "#C9CEDC";
    ({
      // 1 밴드형: 짙은 바탕에 흰 큰 제목, 강조어는 강조색
      "t-band"() {
        const acc = tReadable(C.accent, C.deep, C.tint); rect(C.deep, 0, 0, W, H);
        let y = 380 * ry; const ts = fit(d.title, "XB", 170);
        for (const ln of d.title) { put(ln, M, y, ts, "XB", "#FFFFFF", -ts * 0.045); y += ts * 1.06; }
        if (d.accent) { const s = fit([d.accent], "XB", 300); y += s * 0.62; put(d.accent, M, y, s, "XB", acc, -s * 0.035); y += 120; } else y += 40;
        for (const ln of wrap(d.subtitle, 50, "R", TW)) { put(ln, M, y, 50, "R", SUB, -1); y += 70; }
        if (d.author) put(d.author, M, H - 70, 30, "B", SUB);
      },
      // 2 종이형: 밝은 종이 바탕, 짙은 큰 제목, 위아래 굵은 괘선
      "t-paper"() {
        const PAPER = "#F6F3EE", acc = tReadable(C.accent, PAPER, C.deep); rect(PAPER, 0, 0, W, H);
        rect(C.deep, M, 150, TW, 10);
        let y = 330 * ry; const ts = fit(d.title, "XB", 172);
        y = Math.max(y, 160 + ts * 0.9);
        for (const ln of d.title) { put(ln, M - 6, y, ts, "XB", C.deep, -ts * 0.05); y += ts * 1.04; }
        if (d.accent) { const s = fit([d.accent], "XB", 290); y += s * 0.6; put(d.accent, M - 8, y, s, "XB", acc, -s * 0.04); y += 110; } else y += 40;
        for (const ln of wrap(d.subtitle, 48, "R", TW)) { put(ln, M, y, 48, "R", "#5B5F6B", -1); y += 66; }
        rect(C.deep, M, H - 120, TW, 10);
        if (d.author) put(d.author, M, H - 150, 30, "B", C.deep);
      },
      // 3 블록형: 위 60% 짙은 색면에 제목, 경계에 강조색 띠, 아래 흰 바탕에 큰 강조어
      "t-block"() {
        const BY = Math.round(H * 0.592), acc = tReadable(C.accent, "#FFFFFF", C.deep);
        rect("#FFFFFF", 0, 0, W, H); rect(C.deep, 0, 0, W, BY); rect(C.accent, 0, BY, W, 22);
        const ts = fit(d.title, "XB", 165);
        let y = BY - 110 - (d.title.length - 1) * ts * 1.06;
        for (const ln of d.title) { put(ln, M, y, ts, "XB", "#FFFFFF", -ts * 0.045); y += ts * 1.06; }
        y = BY + 22;
        if (d.accent) { const s = fit([d.accent], "XB", 260, TW * 0.6); y += s * 0.86 + 70; put(d.accent, M - 6, y, s, "XB", acc, -s * 0.035); y += 90; } // 띠와 붙지 않게 70 띄운다
        else y += 120;
        for (const ln of wrap(d.subtitle, 46, "R", TW)) { put(ln, M, y, 46, "R", "#3C4150", -1); y += 64; }
        if (d.author) put(d.author, M, H - 50, 28, "B", C.deep);
      },
      // 4 포스터형: 강조색 전면, 판 폭을 꽉 채우는 거대 강조어(아래만 잘림), 흰 제목
      "t-poster"() {
        const BG = C.accent, INK = tReadable(C.deep, BG, "#FFFFFF"), TT = tReadable("#FFFFFF", BG, C.deep);
        rect(BG, 0, 0, W, H);
        if (d.accent) { let s = 1000; x.font = font(s, "XB"); ls(-s * 0.05); s = Math.floor(s * (W + 40) / x.measureText(d.accent).width); put(d.accent, -20, H + s * 0.1, s, "XB", C.deep, -s * 0.05); }
        let y = 200 * ry; const ts = fit(d.title, "XB", 150, TW * 0.9);
        y = Math.max(y, ts * 0.9 + 60);
        for (const ln of d.title) { put(ln, M, y, ts, "XB", TT, -ts * 0.045); y += ts * 1.06; }
        y += 30;
        for (const ln of wrap(d.subtitle, 44, "B", TW * 0.55)) { put(ln, M, y, 44, "B", INK, -1); y += 62; }
        if (d.author) put(d.author, M, H - 90, 30, "B", TT);
      },
      // 5 하이라이트형: 밝은 바탕, 강조어 아래쪽 절반을 강조색 띠로 형광펜처럼
      "t-highlight"() {
        const PAPER = "#FBFAF7"; rect(PAPER, 0, 0, W, H);
        let y = 330 * ry; const ts = fit(d.title, "XB", 160);
        y = Math.max(y, ts * 0.9 + 170);
        for (const ln of d.title) { put(ln, M, y, ts, "XB", C.deep, -ts * 0.045); y += ts * 1.06; }
        if (d.accent) {
          const s = fit([d.accent], "XB", 300, TW * 0.7); y += s * 0.66;
          x.font = font(s, "XB"); ls(-s * 0.035); const w = x.measureText(d.accent).width;
          rect(C.accent, M - 20, y - s * 0.34, w + 50, s * 0.4); put(d.accent, M, y, s, "XB", C.deep, -s * 0.035); y += 110;
        } else y += 40;
        for (const ln of wrap(d.subtitle, 46, "R", TW)) { put(ln, M, y, 46, "R", "#4A4E5A", -1); y += 64; }
        if (d.author) { x.textAlign = "right"; put(d.author, W - M, 120, 28, "B", C.deep); x.textAlign = "left"; }
      },
      // 6 프레임형: 짙은 바탕에 가는 안쪽 테두리, 모두 가운데 정렬, 강조어는 외곽선 글자
      "t-frame"() {
        const acc = tReadable(C.accent, C.deep, C.tint); rect(C.deep, 0, 0, W, H);
        x.strokeStyle = acc; x.lineWidth = 4; x.strokeRect(64, 64, W - 128, H - 128);
        const center = (t, py, size, face, color, l = 0) => { x.textAlign = "center"; put(t, W / 2, py, size, face, color, l); x.textAlign = "left"; };
        let y = 280 * ry; const ts = fit(d.title, "XB", 150, TW * 0.92);
        y = Math.max(y, ts * 0.9 + 130);
        for (const ln of d.title) { center(ln, y, ts, "XB", "#FFFFFF", -ts * 0.04); y += ts * 1.08; }
        if (d.accent) {
          const s = fit([d.accent], "XB", 380, TW * 0.8); y += s * 0.72;
          x.font = font(s, "XB"); ls(-s * 0.03); x.textAlign = "center"; x.lineWidth = 6; x.strokeStyle = acc; x.strokeText(d.accent, W / 2, y); x.textAlign = "left"; y += 110;
        } else y += 40;
        for (const ln of wrap(d.subtitle, 44, "R", TW * 0.9)) { center(ln, y, 44, "R", SUB, -1); y += 62; }
        if (d.author) center(d.author, H - 110, 28, "B", acc);
      },
    })[sp.layout]();
    ls(0);
  }
```

## 활자 표지 강조어 규칙(typoText)

```js
function typoText(sp) {
    const flat = (s) => String(s || "").replace(/\s+/g, "");
    const title = noDash(unwrapTitle(sp.title || "제목"));
    let lines = (Array.isArray(sp.titleLines) && sp.titleLines.length ? sp.titleLines : [title]).map(l => noDash(String(l)).trim()).filter(Boolean).slice(0, 4);
    let acc = noDash(String(sp.accentWord || "")).trim();
    if (acc) {
      const L = lines.slice(), last = L[L.length - 1] || "";
      if (flat(last) === flat(acc)) L.pop(); else if (last.endsWith(acc)) L[L.length - 1] = last.slice(0, -acc.length).trim();
      if (L.length && flat(L.join("")) + flat(acc) === flat(title)) lines = L.filter(Boolean); else acc = "";
    }
    if (flat(lines.join("")) + flat(acc) !== flat(title)) { lines = [title]; acc = ""; }
    return { title: lines, accent: acc, subtitle: noDash(sp.subtitle || "").replace(/\n/g, " "), author: sp.author || "" };
  }
```

## 색 라이브러리 순위(libRanked)

```js
function libRanked(base) {
    const A = hsl(hex(base.accent, "#888888")), Dk = hsl(hex(base.dark, "#111111")), gray = A.s < 0.12;
    const dh = (x, y) => { const d = Math.abs(x - y) % 360; return Math.min(d, 360 - d); };
    return PAL_LIB.map(e => {
      const a = hsl(e.a), d = hsl(e.d);
      const ha = gray ? (a.s < 0.2 ? 0 : 30) : Math.min(dh(a.h, A.h), dh(a.h, A.h + 180) + 12);
      const hd = d.s < 0.12 || Dk.s < 0.12 ? 25 : dh(d.h, Dk.h);
      return { e, sc: ha + hd * 0.5 };
    }).sort((x, y) => x.sc - y.sc).map(x => x.e);
  }
```

## 색 섞기(withLib)

```js
function withLib(theory, lib) {
    const out = []; let t = 0, l = 0;
    while (t < theory.length || l < lib.length) { if (l < lib.length) out.push(lib[l++]); if (l < lib.length) out.push(lib[l++]); if (t < theory.length) out.push(theory[t++]); }
    return out;
  }
```

## 08 빌더(spBuild = build_salespage.py)

```js
function spBuild(d, pal, pId) {
    const M = d.meta || {}, buy = M.buyUrl || "【결제 링크】", book = M.book || "", order = [];
    const add = (key, inner, extra = "", sid = "") => order.push([key, inner, extra, sid]);
    const h = d.hero || {}, cover = h.cover;
    const coverHtml = cover ? `<figure class='cover'><img src='${spEsc(cover)}' alt='${spEsc(book)} 표지'><figcaption>${spEsc(h.coverCaption || "")}</figcaption></figure>` : "";
    const hero = `<section class='hero'><div class='wrap hero-grid${cover ? "" : " nocover"}'><div>
<p class='brand'><b>${spEsc(book)}</b> ${spEsc(M.format || "")}</p>
<h1>${spEsc(h.h1 || "")}</h1>
<p class='hero-story'>${spEsc(h.story || "")}</p>
<div class='hero-actions'><a class='btn' href='${spEsc(buy)}'>${spEsc(h.btn || M.ctaLabel || "")}</a>${h.link && d.story ? "<a class='text-link' href='#story'>" + spEsc(h.link) + "</a>" : ""}</div>
</div>${coverHtml}</div></section>`;
    const s = d.story;
    if (s) {
      let tl;
      if (s.inquiry) tl = "<ul class='inquiry rv'>" + s.inquiry.map(i => `<li><b>${spEsc(i.label)}</b><p>${spEsc(i.text)}</p></li>`).join("") + "</ul>";
      else tl = "<ol class='timeline'>" + (s.timeline || []).map(t => {
        const cls = ["rv", t.turn ? "turn" : "", t.hit ? "hit" : ""].filter(Boolean).join(" ");
        const wins = t.wins ? "<ul class='wins'>" + t.wins.map(w => `<li>${spEsc(w)}</li>`).join("") + "</ul>" : "";
        return `<li class='${cls}'><b>${spEsc(t.label)}</b><p>${spEsc(t.text)}</p>${wins}</li>`;
      }).join("") + "</ol>";
      const photo = s.photo ? `<figure><img src='${spEsc(s.photo)}' alt=''><figcaption>${spEsc(s.photoCaption || "")}</figcaption></figure>` : "";
      const code = s.codeLine ? `<div class='wrap'><p class='code-line rv'>${spEsc(s.codeLine)}</p></div>` : "";
      add("story", `<div class='wrap story-grid'><div class='story-head rv'><h2 class='h2'>${spEsc(s.h2)}</h2>${photo}</div>${tl}</div>${code}`, "", "story");
    }
    const c = d.selfcheck;
    if (c) {
      const items = (c.items || []).map(i => `<button class='check' type='button' aria-pressed='false'><span class='box'></span>${spEsc(i)}</button>`).join("");
      add("selfcheck", `<div class='wrap selfcheck'><div class='rv'><h2 class='h2'>${spEsc(c.h2)}</h2><p class='lead'>${spEsc(c.lead || "")}</p></div><div><div class='checks rv' id='checks'>${items}</div><p class='check-result rv'>${spEsc(c.result || "")}</p></div></div>`);
    }
    const r = d.reason;
    if (r) {
      let ratio = "";
      if (r.ratio) { const q = r.ratio; ratio = `<div class='ratio rv'><div class='ratio-bar'><div class='c'><b>${spEsc(q.small.value)}</b><span>${spEsc(q.small.label)}</span></div><div class='u'><b>${spEsc(q.big.value)}</b><span>${spEsc(q.big.label)}</span></div></div><p class='ratio-cap'>${spEsc(q.caption || "")}</p></div>`; }
      const img = r.image ? `<figure class='rv'><img src='${spEsc(r.image)}' alt=''></figure>` : "";
      const body = (r.body || []).map(b => `<p class='body'>${spEsc(b)}</p>`).join("");
      const old = r.oldVoice ? "<ul class='old-voice'>" + r.oldVoice.map(o => `<li>${spEsc(o)}</li>`).join("") + "</ul>" : "";
      const verdict = r.verdict ? `<p class='verdict'>${spEsc(r.verdict)}</p>` : "";
      add("reason", `<div class='wrap'><div class='reason-head rv'><h2 class='h2'>${spEsc(r.h2)}</h2></div>${ratio}<div class='reason-grid${img ? "" : " noimg"}'>${img}<div class='weights rv'>${body}${old}${verdict}</div></div></div>`);
    }
    const g = d.dig;
    if (g) {
      const notes = "<ul class='dig-notes rv'>" + (g.notes || []).map(n => `<li><b>${spEsc(n.label)}</b>${spEsc(n.text)}</li>`).join("") + "</ul>";
      const img = g.image ? `<figure class='rv'><img src='${spEsc(g.image)}' alt=''></figure>` : "";
      add("dig", `<div class='wrap'><h2 class='h2 rv'>${spEsc(g.h2)}</h2>${g.lead ? "<p class=lead>" + spEsc(g.lead) + "</p>" : ""}<div class='dig-grid'>${img}${notes}</div></div>`);
    }
    const y = d.reality;
    if (y) {
      const adv = "<ul class='advice'>" + (y.advice || []).map(a => `<li>${spEsc(a)}</li>`).join("") + "</ul>";
      add("reality", `<div class='wrap reality'><div class='rv'><h2 class='h2'>${spEsc(y.h2)}</h2>${adv}</div><div class='rv'><p class='body'>${spEsc(y.body || "")}</p><div class='ignore'><p>${spEsc(y.ignore || "")}</p></div><p class='for-you'>${spEsc(y.forYou || "")}</p></div></div>`);
    }
    const f = d.diff;
    if (f) {
      const cards = (f.items || []).slice(0, 3).map(i => `<article class='rv'><h3>${spEsc(i.title)}</h3><p>${spEsc(i.text)}</p></article>`).join("");
      add("diff", `<div class='wrap'><h2 class='h2 rv'>${spEsc(f.h2)}</h2><div class='diff'>${cards}</div>${f.faster ? '<p class="faster rv">' + spEsc(f.faster) + "</p>" : ""}</div>`);
    }
    const t = d.toc;
    if (t) {
      const meta = (t.meta || []).map(m => `<span>${spEsc(m)}</span>`).join("");
      const pts = (t.parts || []).map(p => `<div class='toc-part rv'><div><b>${spEsc(p.label)}</b><h3>${spEsc(p.title)}</h3></div><ul>${(p.items || []).map(i => "<li>" + spEsc(i) + "</li>").join("")}</ul></div>`).join("");
      add("toc", `<div class='wrap'><div class='toc-head rv'><h2 class='h2'>${spEsc(t.h2)}</h2><div class='toc-meta'>${meta}</div></div><div class='toc'>${pts}</div></div>`, "", "contents");
    }
    const e = d.results;
    if (e && e.images && e.images.length) {
      const imgs = e.images.map(u => `<a class='rv' href='${spEsc(u)}' target='_blank' rel='noopener'><img src='${spEsc(u)}' alt='' loading='lazy'></a>`).join("");
      const notes = e.notes ? "<p class='notes'>" + e.notes.map(spEsc).join("<br>") + "</p>" : "";
      add("results", `<div class='wrap'><h2 class='h2 results-head rv'>${spEsc(e.h2)}</h2><p class='lead rv'>${spEsc(e.lead || "")}</p><div class='results'>${imgs}</div>${notes}</div>`);
    }
    const v = d.reviews;
    if (v && ((v.items && v.items.length) || (v.captures && v.captures.length))) {
      const cards = (v.items || []).map(i => `<figure class='review rv'${i.sample ? " data-sample=1" : ""}><div><div class='stars'>★★★★★</div><blockquote>${spEsc(i.quote)}</blockquote></div><figcaption>${spEsc(i.who || "")}</figcaption></figure>`).join("");
      let proof = "";
      if (v.captures && v.captures.length) {
        const imgs = v.captures.map(u => `<img src='${spEsc(u)}' alt='후기 캡처' loading='lazy'>`).join("");
        proof = `<div class='proof rv'><h3>${spEsc(v.capturesTitle || "먼저 들은 분들이 직접 올린 글입니다")}</h3><p>${spEsc(v.capturesNote || "원문 그대로, 소속만 가렸습니다. 누르면 크게 보입니다.")}</p><div class='marquee' id='marquee'><div class='track'>${imgs}</div></div></div>`;
        if (v.guarantee) proof += `<div class='money rv'><p>${spEsc(v.guarantee)}</p>${v.guaranteeNote ? "<small>" + spEsc(v.guaranteeNote) + "</small>" : ""}</div>`;
      }
      const mid = v.midCta ? `<div class='mid-cta rv'><a class='btn' href='${spEsc(buy)}'>${spEsc(v.midCta)}</a></div>` : "";
      add("reviews", `<div class='wrap'><h2 class='h2 rv'>${spEsc(v.h2)}</h2><div class='reviews'>${cards}</div>${proof}${mid}</div>`);
    }
    const o = d.honest;
    if (o) {
      const hype = o.hype ? "<ul class='hype rv'>" + o.hype.map(x => `<li>${spEsc(x)}</li>`).join("") + "</ul>" : "";
      add("honest", `<div class='narrow'>${hype}<h2 class='h2 rv'>${spEsc(o.h2)}</h2><p class='body rv'>${spEsc(o.body || "")}</p></div>`, "honest");
    }
    const q = d.faq;
    if (q) add("faq", `<div class='wrap faq'><h2 class='h2 rv'>${spEsc(q.h2)}</h2><div class='faq-list rv'>${(q.items || []).map(i => `<details><summary>${spEsc(i.q)}</summary><p>${spEsc(i.a)}</p></details>`).join("")}</div></div>`);
    const p = d.price;
    if (p) {
      let ladder = "";
      if (M.ladder && p.ladder) ladder = "<ul class='ladder'>" + p.ladder.map(L => { const st = L.state || "", cls = st === "현재" ? "cur" : st === "예정" ? "next" : ""; const pr = st === "종료" ? `<s>${spEsc(L.price)}</s>` : spEsc(L.price); return `<li class='${cls}'><b>${spEsc(L.step)}</b><span>${pr}</span><em>${spEsc(st)}</em></li>`; }).join("") + "</ul>";
      const timer = M.ladder && p.timerText ? `<div class='timer'><small>${spEsc(p.timerText)}</small><span class='cd' data-cd='long'></span></div>` : "";
      const card = `<div class='price-card rv'><span class='tag'>${spEsc(p.tag || "")}</span>
${p.was ? "<p class=was><s>" + spEsc(p.was) + "</s></p>" : ""}
<p class='now'>${spEsc(p.now || "")}<span>원</span></p>${ladder}${timer}
<a class='btn block' href='${spEsc(buy)}'>${spEsc(p.btn || M.ctaLabel || "")}</a>
${p.fine ? "<p class=fine>" + spEsc(p.fine) + "</p>" : ""}</div>`;
      add("price", `<div class='wrap price-grid'><div class='rv'><p class='choice'>${spEsc(p.choice || "")}</p>${spPara(p.body || "")}</div>${card}</div>`, "price", "price");
    }
    const secs = order.map(([key, inner, extra, sid], i) => spSection(i % 2 === 0 ? "deep" : "", inner, extra, sid));
    const topbar = M.ladder && d.topbar ? `<div class='topbar'>${spEsc(d.topbar.text || "")}<span class='cd' data-cd='short'></span></div>` : "";
    const footer = `<footer class='footer'>© ${spEsc(M.brand || book)}. ALL RIGHTS RESERVED</footer>`;
    let sticky = "";
    if (M.stickyBar) {
      const was = p && p.was ? `<s>${spEsc(String(p.was).replace("정가 ", ""))}</s>` : "";
      sticky = `<div class='sticky'><div class='sticky-inner'><div class='sticky-price'>${was}<b>${spEsc((p || {}).now || "")}원</b>${M.ladder ? "<small>오늘 마감까지 <span class=cd data-cd=short></span></small>" : ""}</div><a class='btn' href='${spEsc(buy)}'><span class='lbl-long'>${spEsc(book)} </span>구매하기</a></div></div>`;
    }
    const root = `:root{--bg:${pal.bg};--bg-2:${pal.bg2};--bg-3:${pal.bg3};--deep:${pal.deep};--line:${pal.line};--line-2:${pal.line2};--text:${pal.text};--text-2:${pal.text2};--text-3:${pal.text3};--accent:${pal.accent};--accent-hi:${pal.accentHi};--accent-soft:${pal.accentSoft};--accent-ink:${pal.accentInk};--glow:${pal.glow};--topbar:${pal.topbar};--ease:cubic-bezier(.16,1,.3,1);--sans:'Pretendard','Apple SD Gothic Neo','Malgun Gothic',sans-serif;--serif:'Hahmlet','Pretendard',serif;--wrap:1080px}`;
    return `<!doctype html><html lang='ko'><head><meta charset='utf-8'><meta name='viewport' content='width=device-width,initial-scale=1'><title>${spEsc(book)}</title>
<style>${root}
${SP.css}</style></head><body class='${pal.dots ? "dots" : ""}${pal.light ? " light" : ""}'>
<!-- ebook-salespage · 팔레트 ${pId} · 구조: 리치코드 12섹션 -->
<main class='page${M.stickyBar ? "" : " nosticky"}'>${topbar}${hero}${secs.join("")}${footer}</main>${sticky}
<script>${SP.js}<\/script></body></html>`;
  }
```

## 08 검사(spCheck = --check)

```js
function spCheck(d, out) {
    const probs = [], ph = out.match(/【[^】]*】/g) || [];
    if (ph.length) probs.push(`자리표시자 ${ph.length}개: ` + [...new Set(ph)].sort().join(", "));
    const body = out.replace(/<style[\s\S]*?<\/style>|<script[\s\S]*?<\/script>|<!--[\s\S]*?-->/g, "");
    [["—", "em-dash"], ["–", "en-dash"], ["→", "화살표"], [" · ", "가운뎃점 나열"]].forEach(([ch, name]) => { const n = body.split(ch).length - 1; if (n) probs.push(`${name} ${n}개`); });
    const caps = (body.match(/>\s*[A-Z][A-Z ]{3,}\s*</g) || []).filter(c => !c.includes("ALL RIGHTS") && !c.includes("PART"));
    if (caps.length) probs.push(`영문 대문자 라벨: ${caps.slice(0, 5).join(", ")}`);
    if (/[\u{1F300}-\u{1FAFF}]/u.test(body)) probs.push("이모지 있음");
    const missing = ["hero", "selfcheck", "reason", "reality", "diff", "toc", "honest", "faq", "price"].filter(k => !d[k]);
    if (missing.length) probs.push(`필수 섹션 누락: ${missing.join(", ")}`);
    const btns = [...out.matchAll(/class='btn[^']*' href='[^']*'>(.*?)<\/a>/g)].map(m => m[1].replace(/<.*?>/g, "").trim()).filter(b => b.length > 16);
    if (btns.length) probs.push(`버튼 16자 초과: ${btns.join(", ")}`);
    const lines = String(d.hero?.h1 || "").split("\n");
    if (lines.length > 3 || lines.some(l => l.length > 10)) probs.push(`h1 줄/글자 초과: ${lines.join(" / ")}`);
    const samples = (d.reviews?.items || []).filter(i => i.sample).length;
    return { probs, samples };
  }
```

## 08 팔레트(spPickPalette)

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

## 08 사실 칸(spFixFacts)

```js
function spFixFacts(d, I, coverUrl) {
    d.meta = { ...(d.meta || {}) };
    const book = I.title || d.meta.book || "";
    Object.assign(d.meta, { book, palette: spPal, stickyBar: false, ladder: false, buyUrl: I.buyUrl || "#price" });
    if (!d.meta.brand) d.meta.brand = I.author || book;
    if (I.pages) d.meta.pages = I.pages;
    d.hero = d.hero || {};
    if (coverUrl) { d.hero.cover = coverUrl; if (!d.hero.coverCaption && I.pages) d.hero.coverCaption = `${I.pages}페이지 PDF, 평생 소장`; } else delete d.hero.cover;
    if (d.story) { delete d.story.photo; }
    if (d.reason) delete d.reason.image;
    d.results = null; if (d.dig) delete d.dig.image;
    d.topbar = null;
    if (I.reviews.length) { d.reviews = { ...(d.reviews || {}), items: I.reviews.map(r => ({ quote: r.quote, who: r.who })) }; }
    if (d.reviews) { d.reviews.captures = null; d.reviews.guarantee = null; }
    if (d.price) {
      delete d.price.ladder; delete d.price.timerText;
      if (I.price) d.price.now = Number(I.price).toLocaleString("ko-KR");
      if (I.was) d.price.was = `정가 ${Number(I.was).toLocaleString("ko-KR")}원`;
    }
    // 금지 문자 기계 정리 (copy-rules 6장): 줄표·화살표·가운뎃점 나열
    const clean = (x) => typeof x === "string" ? x.replace(/\s*[—–]\s*/g, ", ").replace(/\s*→\s*/g, " ").replace(/ · /g, ", ") : Array.isArray(x) ? x.map(clean) : x && typeof x === "object" ? Object.fromEntries(Object.entries(x).map(([k, v]) => [k, k === "cover" || k === "buyUrl" ? v : clean(v)])) : x;
    return clean(d);
  }
```

## 마무리 페이지(edClosing)

```js
function edClosing(th, book, subtitle) {
    const p = edPage(th, true), f = (v) => edf(th, v);
    const c = mk("div", `position:absolute;left:${ED.mx}px;right:${ED.mx}px;top:44%;text-align:center;font-family:${th.head};`);
    c.appendChild(mk("div", `font-size:${f(15)};line-height:2.6;color:${th.dSub};`, book));
    if (subtitle) c.appendChild(mk("div", `font-size:${f(15)};line-height:2.6;color:${th.dSub};`, subtitle));
    c.appendChild(mk("div", `font-size:${f(13)};letter-spacing:0.5em;color:${th.accD};margin-top:${f(30)};padding-left:0.5em;`, th.ornament));
    p.appendChild(c); return p;
  }
```

## 표지 이미지에서 색 뽑기(paletteFromImage)

```js
async function paletteFromImage(blob) {
    const img = await createImageBitmap(blob);
    const W = 90, H = Math.max(1, Math.round(90 * img.height / img.width));
    const c = document.createElement("canvas"); c.width = W; c.height = H;
    const g = c.getContext("2d"); g.drawImage(img, 0, 0, W, H);
    const d = g.getImageData(0, 0, W, H).data, bins = new Map(); let n = 0;
    for (let i = 0; i < d.length; i += 4) {
      if (d[i + 3] < 200) continue;
      const k = (d[i] >> 4) << 8 | (d[i + 1] >> 4) << 4 | (d[i + 2] >> 4);
      const b = bins.get(k) || { n: 0, r: 0, g: 0, b: 0 }; b.n++; b.r += d[i]; b.g += d[i + 1]; b.b += d[i + 2]; bins.set(k, b); n++;
    }
    const list = [...bins.values()].map(b => { const hx = toHex([b.r / b.n, b.g / b.n, b.b / b.n]); return { hex: hx, share: b.n / n, L: lum(hx), ...hsl(hx) }; }).sort((a, b) => b.share - a.share);
    const bg = list[0].hex;                                   // 가장 넓은 면 = 바탕색
    const lights = list.filter(x => x.L > 0.55 && x.share > 0.01);
    const darks = list.filter(x => x.share > 0.002 && x.L < 0.12).sort((a, b) => a.L - b.L);
    // 강조색: 채도가 높고 너무 어둡거나 밝지 않은 색 중 면적과 채도를 같이 본다 (글자·선처럼 작아도 잡히게)
    const acc = list.filter(x => x.share > 0.0012 && x.s > 0.18 && x.l > 0.18 && x.l < 0.8 && x.hex !== list[0].hex).sort((a, b) => b.s * Math.sqrt(b.share) - a.s * Math.sqrt(a.share))[0];
    return { bg, light: (lights[0] || list.slice().sort((a, b) => b.L - a.L)[0]).hex, dark: (darks[0] || list.slice().sort((a, b) => a.L - b.L)[0]).hex, accent: acc ? acc.hex : null };
  }
```

## 표지 팔레트 → 내지 3방향(palToColors)

```js
function palToColors(pal, variant) {
    const v = /calm/.test(variant) ? "calm" : /bold/.test(variant) ? "bold" : "faithful";
    const darkCover = lum(pal.bg) < 0.25;
    let accent = pal.accent || mixHex(pal.dark, "#808080", 0.25);
    let dark = lum(pal.dark) > 0.05 ? mixHex(pal.dark, "#000000", 0.45) : pal.dark;
    if (darkCover) dark = mixHex(pal.bg, "#000000", lum(pal.bg) > 0.05 ? 0.35 : 0);
    // 본문 종이: 표지 바탕의 색감을 아주 옅게 (어두운 표지면 강조색 기운만)
    let paper = darkCover ? mixHex("#f2f2f1", accent, 0.035) : mixHex(pal.light || pal.bg, "#f4f4f4", 0.55);
    if (lum(paper) < 0.82) paper = mixHex(paper, "#ffffff", 0.5);
    if (v === "calm") { accent = mixHex(accent, mixHex(pal.dark, "#9a9a9a", 0.5), 0.3); paper = mixHex(paper, "#ffffff", 0.35); dark = mixHex(dark, "#202022", 0.4); }
    if (v === "bold") { accent = mixHex(accent, "#000000", 0.08); dark = pal.accent ? mixHex(accent, "#000000", 0.8) : dark; paper = mixHex(paper, pal.light || paper, 0.25); }
    const ink = mixHex(dark, "#000000", 0.25);
    return { paper, dark, accent, ink: lum(mixHex(ink, "#1d1d1f", 0.6)) < 0.04 ? mixHex(ink, "#1d1d1f", 0.6) : "#1d1d1f", variant: v };
  }
```

## 보색 조합 9가지(colorSchemes)

```js
function colorSchemes(base) {
    const a = hsl(base.accent), gray = a.s < 0.12;
    const H = gray ? 215 : a.h, S = gray ? 0.55 : Math.max(0.45, Math.min(0.85, a.s)), L = gray ? 0.45 : Math.max(0.38, Math.min(0.55, a.l));
    const acc = (h, s = S, l = L) => fromHsl(h, s, l), band = (h, s = 0.32, l = 0.11) => fromHsl(h, s, l), paper = (h, s = 0.18, l = 0.965) => fromHsl(h, s, l);
    return [
      { name: "보색 밴드", note: "강조는 표지 그대로, 밴드를 반대색으로", c: { accent: base.accent, dark: band(H + 180), paper: paper(H + 180, 0.12) } },
      { name: "보색 강조", note: "밴드는 표지 그대로, 강조를 반대색으로", c: { accent: acc(H + 180), dark: base.dark, paper: paper(H, 0.1) } },
      { name: "분할 보색", note: "반대색 양옆 두 색으로 강조·밴드", c: { accent: acc(H + 150), dark: band(H + 210, 0.38), paper: paper(H + 30, 0.12) } },
      { name: "톤온톤", note: "표지 강조색 한 계열로 진하게·옅게", c: { accent: acc(H, S, Math.max(0.36, L - 0.06)), dark: band(H, 0.5, 0.12), paper: paper(H, 0.3, 0.962) } },
      { name: "유사색", note: "표지 강조색 옆 색으로 부드럽게", c: { accent: acc(H + 28), dark: band(H - 20, 0.36), paper: paper(H + 40, 0.22) } },
      { name: "삼각 배색", note: "120도씩 떨어진 색으로 또렷하게", c: { accent: acc(H), dark: band(H + 120, 0.4), paper: paper(H + 240, 0.12) } },
      { name: "무채 + 포인트", note: "먹색·회색 바탕에 표지 강조색 하나만", c: { accent: base.accent, dark: "#141416", paper: "#f3f3f3" } },
      { name: "웜 뉴트럴", note: "미색 종이에 갈색 기운 밴드", c: { accent: base.accent, dark: fromHsl(28, 0.22, 0.11), paper: fromHsl(40, 0.35, 0.955) } },
      { name: "쿨 뉴트럴", note: "청회색 종이에 남색 기운 밴드", c: { accent: base.accent, dark: fromHsl(222, 0.3, 0.12), paper: fromHsl(215, 0.2, 0.965) } },
    ];
  }
```

## 표지 색 조합(coverSchemes)

```js
function coverSchemes(sp) {
    const bg = hex(sp.bg, "#f1efe9"), ink = hex(sp.ink, "#1a1a1a"), acc = hex(sp.accent, ink);
    const dark = lum(bg) < lum(ink) ? bg : ink, light = lum(bg) < lum(ink) ? ink : bg, isDark = lum(bg) < 0.3;
    const list = colorSchemes({ accent: acc, dark, paper: light }).map(sc => {
      const c = sc.c, B = isDark ? c.dark : mixHex(c.paper, c.dark, 0.05), I = isDark ? mixHex(c.paper, "#ffffff", 0.4) : mixHex(c.dark, "#000000", 0.2);
      return { name: sc.name, note: sc.note, c: { bg: B, bg2: mixHex(B, I, 0.07), ink: I, sub: mixHex(I, B, 0.35), accent: c.accent } };
    });
    // 명암 반전: 밝은 표지는 어둡게, 어두운 표지는 밝게
    const B = isDark ? mixHex(light, "#ffffff", 0.5) : mixHex(dark, "#000000", 0.2), I = isDark ? mixHex(dark, "#000000", 0.2) : mixHex(light, "#ffffff", 0.5);
    const libList = libRanked({ accent: acc, dark }).map(e => {
      const B = isDark ? e.d : e.p, I = isDark ? mixHex(e.p, "#ffffff", 0.4) : mixHex(e.d, "#000000", 0.2);
      return { name: `${e.src} · ${e.n}`, note: libNote(e), c: { bg: B, bg2: mixHex(B, I, 0.07), ink: I, sub: mixHex(I, B, 0.35), accent: e.a } };
    });
    list.splice(1, 0, { name: "명암 반전", note: isDark ? "어두운 표지를 밝은 바탕으로" : "밝은 표지를 어두운 바탕으로", c: { bg: B, bg2: mixHex(B, I, 0.07), ink: I, sub: mixHex(I, B, 0.35), accent: acc } });
    return withLib(list, libList);
  }
```

## 제목·부제·작가 찾기(detectBookMeta)

```js
function detectBookMeta() {
    const g = guessTitleRaw(), t = currentBookText();
    const out = { title: g.title, subtitle: g.subtitle, author: "" };
    const lines = t.split("\n").slice(0, 80).map(l => l.trim()).filter(Boolean);
    const stop = lines.findIndex(l => /^#{1,6}\s/.test(l) || TOC_LINE.test(l) || CH_LINE.test(cleanHead(l)) || /━{4,}/.test(l));
    const head = (stop >= 0 ? lines.slice(0, stop) : lines.slice(0, 8)).map(l => cleanHead(l).replace(/^(책\s*제목|제목)\s*[:：]\s*/, "")).filter(Boolean);
    const am = t.slice(0, 3000).match(/^\s*(?:지은이|저자|작가|글쓴이|글)\s*[:：]\s*(.+)$/m) || t.slice(0, 3000).match(/^\s*(.{2,20}?)\s+(?:지음|씀|저)\s*$/m);
    if (am) out.author = am[1].trim();
    const cand = head.filter(l => l.length <= 40 && !/^(탈고|초고|원고|버전|v\d|ver|\d{4}[.\-/])/i.test(l) && !/^(지은이|저자|작가|부제)/.test(l) && l !== out.author);
    if (!out.title && cand.length) {
      // 부제 꼴('~위한', '~하는 법', '~에게')은 부제로, 남은 것 중 가장 짧은 줄을 제목으로
      const subLike = (l) => /(위한|위하여|에게|하는\s*법|하는\s*방법|이야기|안내서|가이드)$/.test(l) || l.length > 22;
      const titles = cand.filter(l => !subLike(l)), subs = cand.filter(subLike);
      out.title = (titles.sort((a, b) => a.length - b.length)[0] || cand[0]);
      if (!out.subtitle) out.subtitle = subs.find(l => l !== out.title) || "";
    }
    if (!out.subtitle) { const sm = t.slice(0, 3000).match(/^\s*부제\s*[:：]\s*(.+)$/m); if (sm) out.subtitle = sm[1].trim(); }
    out.title = unwrapTitle(out.title); out.subtitle = unwrapTitle(out.subtitle);
    return out;
  }
```

## 최종 결과물 목록(finalItems)

```js
function finalItems() {
    const g = guessTitle();
    const title = chosenCover?.title || g.title || bookInfo().title || "전자책";
    const base = safeName(title), src = finalCoverSource(), items = [];
    const done = !!finalBook;
    items.push({ group: "완성본", folder: "1_완성본", label: "완성본 PDF", meta: done ? `${finalBook.pages}쪽 · 확정한 표지·차례·본문이 들어간 판매용 파일 (${finalBook.spec?.name || "본문 디자인"}${finalBook.spec?.colorName ? " · " + finalBook.spec.colorName : ""})` : "본문 디자인 하기에서 '이대로 책 전체 디자인 하기'를 누르면 생겨요",
      filename: `${base}_완성본.pdf`, ready: done, make: async () => finalBook.blob });
    items.push({ group: "완성본", folder: "1_완성본", label: "전체 디자인 한눈에 보기 PNG", meta: done ? `완성본 ${finalBook.pages}쪽을 한 장에 · 판매 페이지·확인용` : "완성본 PDF를 만들면 같이 생겨요",
      filename: `${base}_전체디자인.png`, ready: done && !!finalBook.thumbs?.length, make: () => cached(finalBook, "overview", () => overviewPng(finalBook)) });
    items.push({ group: "확정 표지", folder: "2_표지와 목업", label: "표지 PNG", meta: src ? (src.kind === "spec" ? `확정한 표지${chosenCover.name ? " · " + chosenCover.name : ""}${chosenCover.colorName ? " · " + chosenCover.colorName : ""}` : "본문 디자인 탭에 넣은 표지 이미지") : "표지 디자인에서 '이 표지로 확정'을 누르면 생겨요",
      filename: `${base}_표지.png`, ready: !!src, make: () => src.kind === "spec" ? coverPng(src.sp) : Promise.resolve(src.blob) });
    items.push({ group: "확정 표지", folder: "2_표지와 목업", label: "3D 목업 PNG", meta: src ? "확정한 표지로 만든 책 목업 · 판매 페이지·홍보용" : "표지를 확정하면 생겨요",
      filename: `${base}_3D목업.png`, ready: !!src, make: async () => src.kind === "spec" ? mockPng(src.sp) : canvasBlob(await uploadedMock(src.blob)) });
    const parts = bookParts();
    items.push({ group: "수정용 원고", folder: "3_수정용 원고", label: "원고 DOCX (워드)", meta: parts.length ? `장 ${parts.length}개 · 제목 스타일이 들어가 있어서 고친 뒤 생성기에 다시 넣으면 그대로 디자인돼요` : "원고를 연결하면 생겨요",
      filename: `${base}_원고.docx`, ready: parts.length > 0, make: () => makeDocx(parts) });
    { const ok = !!spHtml && !!stageStatus["08"]?.approved, f = spHtml ? spFiles() : null, slug = f ? f.slug : spSlug(title);
      const meta = ok ? "08 상세페이지에서 승인한 판매 페이지" : spHtml ? "08 상세페이지에서 '승인'을 누르면 들어가요" : spBusy ? "지금 자동으로 만드는 중이에요 (08 상세페이지)" : "08 상세페이지 탭에 들어가면 자동으로 만들어져요";
      [["08_salespage.html", "상세페이지 HTML (크레킷 HTML 블록에 붙여넣기)"], ["08_salespage.json", "상세페이지 내용 JSON"], ["08_salespage_preview.jpg", "상세페이지 미리보기 JPG (모바일 400px 전체)"]].forEach(([fn, label]) =>
        items.push({ group: "08 상세페이지", folder: `books/${slug}`, label, meta, filename: fn, ready: ok, make: () => f.list.find(x => x.name === fn).make() })); }
    return { title, base, items };
  }
```

## 수정용 DOCX(makeDocx)

```js
async function makeDocx(parts = draftParts) {
    await loadScript(CDN.jszip);
    const info = bookInfo(), g = guessTitle();
    const title = (bookMeta.confirmed && bookMeta.title) || chosenCover?.title || g.title || info.title;
    const subtitle = bookMeta.confirmed ? bookMeta.subtitle : (chosenCover?.subtitle || g.subtitle || info.subtitle);
    const author = bookMeta.confirmed ? bookMeta.author : "";
    const lvl = (x, n) => x.replace("<w:pPr>", `<w:pPr><w:outlineLvl w:val="${n}"/>`);
    let body = wPara(title, { size: 44, bold: true, align: "center", before: 3000, after: 300 });
    if (subtitle) body += wPara(subtitle, { size: 24, color: "6B5B00", align: "center" });
    if (author) body += wPara(author, { size: 22, color: "555555", align: "center", before: 600 });
    parts.forEach(part => {
      body += lvl(wPara(stripExtra(splitPart(part.title).title), { size: 32, bold: true, color: "6B5B00", pageBreak: true, after: part.sub ? 120 : 400 }), 0);
      if (part.sub) body += lvl(wPara(part.sub, { size: 24, color: "555555", after: 400 }), 1);
      richBlocks(part.text).forEach(b => {
        const t = String(b.text).replace(/\*\*/g, "");
        if (b.type === "h") body += lvl(wPara(t, { size: 26, bold: true, before: 240, after: 120 }), 1);
        else if (b.type === "q") body += wPara("“" + t + "”", { bold: true, align: "center", before: 120, after: 200 });
        else if (b.type === "li") body += wPara(`${b.mark && /\d/.test(b.mark) ? b.mark : "-"} ${t}`);
        else body += wPara(t);
      });
    });
    const doc = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:body>${body}<w:sectPr><w:pgSz w:w="8391" w:h="11906"/><w:pgMar w:top="1134" w:right="1021" w:bottom="1134" w:left="1021" w:header="567" w:footer="567" w:gutter="0"/></w:sectPr></w:body></w:document>`;
    const zip = new window.JSZip();
    zip.file("[Content_Types].xml", `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/></Types>`);
    zip.file("_rels/.rels", `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/></Relationships>`);
    zip.file("word/document.xml", doc);
    return zip.generateAsync({ type: "blob" });
  }
```

## 원고 인식 규칙 (정규식)

```js
const UNNUM = /^(프롤로그|에필로그|들어가며|나가며|시작하며|마치며|머리말|맺음말|서문|여는\s*(글|편지|말)|닫는\s*(글|편지|말)|(작가|저자)의\s*(말|글)|감사의\s*(글|말)|부록|체크리스트|참고\s*(문헌|자료)|출처|차례|목차)/i;
```

```js
const CH_LINE = /^(프롤로그|에필로그|들어가며|나가며|시작하며|마치며|머리말|맺음말|서문|여는\s*(글|편지|말)|닫는\s*(글|편지|말)|(작가|저자)의\s*(말|글)|감사의\s*(글|말)|부록(\s*\d+)?(\s|$|[.:·—-])|PART\s*\d+|CHAPTER\s*\d+|제\s*\d+\s*[장부](\s|$|[.:·—-])|\d{1,2}\s*[장부](\s|$|[.:·—-])|0\d(\s+|\.\s*)\S)/i;
```

```js
const TOC_LINE = /^(#{1,6}\s+)?(\*\*)?\s*(차례|목차|contents|table of contents)\s*(\*\*)?$/i;
```

```js
const PART_LINE = /^(PART\s*\d+|제?\s*\d+\s*부)(\s|$|[.:·—-])/i;
```

```js
const SUM_HEAD = /^(거리\s*연습|실천|연습|오늘의\s*(연습|과제)|실천\s*과제|미션|워크시트|핵심\s*정리|정리하기|한눈에\s*정리|요약|체크\s*포인트|쓰실\s*때)/;
```

```js
const NOT_SPEAKER = /^(예|예시|주의|참고|정리|결론|요약|포인트|핵심|팁|tip|질문|답|단계|방법|이유|결과|목표|원칙|규칙|공식|출처|기간|비용|장소|시간|날짜|대상|준비물|문제|해결|원인|효과|장점|단점|특징|기준|조건|상황)$/i;
```
