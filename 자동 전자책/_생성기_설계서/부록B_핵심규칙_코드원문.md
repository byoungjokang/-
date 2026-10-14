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
- PART 3~4개 + 챕터 7~10개. 흐름은 "문제 인식 → 원인 해체 → 해결 방법 → 실전 적용". 각 챕터 제목은 궁금증이 생기게, 한 줄 요약을 붙인다.
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
    { key: "final", label: "최종 결과물", custom: true }
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
  function renderCover(sp, W = 600, H = 800) {
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
    const display = /블랙한산스|도현|주아|송명/.test(sp.titleFont || "블랙한산스");
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
  const DISPLAY_FONT = /블랙한산스|도현|주아|송명/;
  // ---- 표지에서 색 뽑기: 내지 색은 언제나 확정한 표지에서 나온다 ----
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
    const short = [pn, label].filter(Boolean).join(" · "), base = label, part = sp.part ? noDash(sp.part) : "";
    if (sp.part) label = part + (label ? " · " + label : "");
    return { label, title: noDash(t), short, base, part };
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
    const short = [pn, label].filter(Boolean).join(" · "), base = label, part = sp.part ? noDash(sp.part) : "";
    if (sp.part) label = part + (label ? " · " + label : "");
    return { label, title: noDash(t), short, base, part };
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
    list.splice(1, 0, { name: "명암 반전", note: isDark ? "어두운 표지를 밝은 바탕으로" : "밝은 표지를 어두운 바탕으로", c: { bg: B, bg2: mixHex(B, I, 0.07), ink: I, sub: mixHex(I, B, 0.35), accent: acc } });
    return list;
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
      body += lvl(wPara(part.title, { size: 32, bold: true, color: "6B5B00", pageBreak: true, after: part.sub ? 120 : 400 }), 0);
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
