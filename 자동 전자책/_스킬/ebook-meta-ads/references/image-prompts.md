# 인물·장면 이미지 만들기

Claude 는 이미지를 그리지 못한다. 사진은 생성 도구로 만들고, 문구·레이아웃은 빌더(HTML→PNG)로 얹는다.
도구 우선순위: ① 크롬의 chatgpt.com (사용자 구독, 추가 비용 없음, 세로 2:3 지원) ② ElevenLabs creative (무료 한도 하루 몇 장, 16:9만) ③ OpenAI API(`OPENAI_API_KEY` 있을 때).

## 1. 프롬프트 공식

```
이미지 생성해줘. 세로 2:3 비율(1024x1536).            ← poster(A1·A2)
이미지 생성해줘. 가로 3:2 비율(1536x1024).            ← film·doc(A3·A4)
{스타일 헤더} {장면 1~2문장} {표정} {조명·색} {구도: 인물 위치 + 텍스트용 빈 공간} {품질} {안전 꼬리}
```

| 형식 | 스타일 헤더 | 구도 | 조명·색 |
|---|---|---|---|
| A1 결핍 포스터 | Vertical cinematic photograph, Korean drama still. | person in the lower two-thirds; top third dark and uncluttered for text | cold dark blue tones with a single warm practical light on the face |
| A2 매력 포스터 | Vertical cinematic photograph for a Korean drama poster. | woman in the right half, face in the upper-middle third, looking straight into the camera; top quarter and left side dark | deep crimson and black, red neon glow, bright soft key light on her face |
| A3 영화 자막 | Cinematic Korean drama film still, wide shot, anamorphic look. | 인물 중앙~오른쪽, 하단 1/5 자막 자리 비움 | natural moody light, slightly desaturated teal and warm tones |
| A4 휴먼다큐 | Korean TV human documentary interview still frame. | seated, medium close-up, looking slightly off-camera to the left toward an unseen interviewer | soft natural window light, warm realistic documentary color, 4K broadcast camera look |

- 표정 어휘: deeply worried / anxious / despairing / ashamed / tired eyes / eyes a little wet / forcing a smile / blank devastated look
- 매력 인물 어휘: glamorous, confident, around 30 (clearly an adult, not a student look), hourglass figure, fitted {white scoop-neck tee / black satin dress / red knit dress}, teasing or captivated smile
- **안전 꼬리(항상 붙임)**: `Photorealistic, 35mm film grain, no text, no subtitles, no logos, no readable numbers.` 매력 인물엔 `classy, fully clothed adult woman` 추가.

## 2. 장면 은행 (결핍별)
- 돈: 새벽 침대에서 은행 앱 / 식탁 위 고지서 더미와 계산기 / ATM 앞에서 입 막음 / 막차 지하철 / 빈 사무실 급여명세서 / 차 안에서 엄마와 통화하며 울음 참기 / 밤길에서 먼 아파트 단지 올려다보기 / 공원 벤치 삼각김밥(40대) / 화장실 거울 앞 / 술자리에서 혼자 잔만 보기 / 편의점 카드 거절 / 마트 정육 코너 / 옥탑 계단 통화 / 결혼식 축의금 봉투 / 카페에서 결혼 얘기에 눈 피하기 / 어두운 방에서 친구 SNS
- 연애·대화: 소개팅 카페 맞은편 여자가 휴대폰 봄 / 혼자 밤길 귀가 / 카톡 읽씹 화면 보며 침대 / 붉은 바에서 웃는 여자(A2)
- 인물 다양성: 20대 취준생, 27세 사회초년생, 29세 프리랜서, 30대 직장인 남녀, 35세 아빠, 38세 주부, 40세 직장인. 한 묶음에서 같은 성별·연령대 3개 연속 금지.

## 3. ChatGPT 원격 생성 절차 (Claude in Chrome)
1. 탭 3개를 만들고 각각 `https://chatgpt.com/` 로 이동(로그인은 사용자 크롬 세션).
2. 각 탭에서 헬퍼를 심는다(javascript_tool):
   ```js
   window.__B = s => '이미지 생성해줘. 세로 2:3 비율(1024x1536). ' + HEADER + s + TAIL;
   window.__dl = n => { const im=[...document.querySelectorAll('img')].filter(i=>i.alt.startsWith('생성된 이미지')&&i.naturalWidth>500).pop();
     const a=document.createElement('a'); a.href=im.src; a.download='ad_p'+n+'.png'; document.body.appendChild(a); a.click(); a.remove(); };
   window.__send = async s => { const el=document.querySelector('.ProseMirror'); el.focus(); document.execCommand('selectAll');
     document.execCommand('insertText', false, __B(s)); await new Promise(r=>setTimeout(r,800));
     document.querySelector('button[aria-label="보내기"]').click(); };
   ```
   - 입력창은 `#prompt-textarea` 가 아니라 `.ProseMirror`. 보내기 버튼은 `aria-label="보내기"`.
   - **배경 탭에서는 computer type 이 글자를 잃는다** → 반드시 `execCommand('insertText')` 로 넣는다.
3. 한 장 생성 ≈ 50~70초. 탭마다 "이미지 개수 확인 → 늘었으면 `__dl(번호)` → 다음 `__send`" 를 한 번에 돌린다.
   - 대화가 길어지면 오래된 이미지가 DOM 에서 빠진다(개수가 안 늘어 보임). 마지막 이미지를 받아 **이전 파일과 md5 비교**로 새 이미지인지 판단.
   - "Something went wrong" 이 나오면 같은 장면을 문장만 바꿔 재요청(오류 탭은 닫고 다른 탭으로).
4. 다운로드는 `~/Downloads/ad_pNN.png` → `books/<slug>/ads/people/pNN.png` 로 옮긴다. 끝나면 만든 탭은 닫는다.
5. 전부 받은 뒤 `md5sum people/*.png | sort | uniq -w32 -D` 로 중복 0 확인.

## 4. 심의 안전선
- 미성년으로 보이는 인물 금지(교복·앳된 얼굴). 30세 전후 명시.
- 노출: 클리비지 클로즈업, 속옷, 수영복, 침대 위 유혹 포즈 금지. 사용자가 더 세게 원해도 "메타 성적 암시 거절 → 계정 제한" 위험을 설명하고 이 선에서 멈춘다.
- 실존 인물·연예인 닮은꼴 요청 금지. 브랜드 로고·읽히는 숫자 금지(금액은 빌더에서 HTML 로).
- 생성 이미지는 AI 이미지다. 메타 업로드 시 AI 표시 여부는 사용자가 정한다(한국 노출은 필수 아님).
