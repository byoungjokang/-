# -*- coding: utf-8 -*-
"""ebook-salespage 스킬 → 전자책 생성기(generator.html) 08 단계 동기화.

생성기는 브라우저에서 돌아서 스킬 폴더를 직접 읽을 수 없다. 그래서 스킬 파일을 '원본 그대로'
<script type="application/json" id="spSkill"> 한 덩어리로 생성기 안에 넣는다. 절차·규칙은 스킬이 정본이고
생성기는 이 덩어리를 읽어서 쓴다. 스킬을 고치면 이 스크립트만 다시 돌린다.

  python sync_salespage_skill.py <generator.html> [스킬 폴더 = ~/.claude/skills/ebook-salespage]
"""
import json, os, re, sys, hashlib

gen = sys.argv[1]
skill = os.path.expanduser(sys.argv[2] if len(sys.argv) > 2 else "~/.claude/skills/ebook-salespage")
rd = lambda p: open(os.path.join(skill, p), encoding="utf-8").read()

design = rd("references/design.md")
def table(section_title):
    """design.md 의 '### <제목>' 아래 첫 표를 [[칸...], ...] 로"""
    i = design.index(section_title); body = design[i:].split("\n### ", 1)[0]
    rows = [l for l in body.splitlines() if l.startswith("|")]
    return [[c.strip() for c in r.strip("|").split("|")] for r in rows[2:]]

# 2-2: EB 프리셋 → 팔레트
eb = {}
for r in table("2-2."):
    pal = r[-1].strip("` ")
    for code in re.findall(r"EB\d\d", " ".join(r[:-1])): eb[code] = pal
# 2-3: 밝은 팔레트 ↔ 전자책 내지 템플릿 번호 (예: "01 아이보리 라인", "10 페이퍼 아카데믹 · 04 테라코타")
tpl = {}
for r in table("2-3."):
    pal = r[0].strip("` ")
    for num in re.findall(r"\b(\d\d)\s", r[2] + " "): tpl[num] = pal

bundle = {
    "skill": "ebook-salespage",
    "css": rd("templates/salespage.css"), "js": rd("templates/salespage.js"),
    "palettes": json.loads(rd("references/palettes.json")),
    "schema": rd("references/salespage-schema.json"), "example": rd("references/richcode-example.json"),
    "docs": {"skill": rd("SKILL.md"), "structure": rd("references/structure.md"), "copy": rd("references/copy-rules.md"),
             "design": design, "typography": rd("references/typography.md")},
    "ebMap": eb, "tplMap": tpl,
}
raw = json.dumps(bundle, ensure_ascii=False, sort_keys=True)
bundle["hash"] = hashlib.sha1(raw.encode()).hexdigest()[:10]
blob = json.dumps(bundle, ensure_ascii=False).replace("</", "<\\/")
tag = f'<script type="application/json" id="spSkill">{blob}</script>'

s = open(gen, encoding="utf-8").read()
if 'id="spSkill"' in s:
    s = re.sub(r'<script type="application/json" id="spSkill">.*?</script>', lambda m: tag, s, count=1, flags=re.S)
else:
    i = s.index("<script>")
    s = s[:i] + "<!-- 08 상세페이지: ebook-salespage 스킬 원본 (sync_salespage_skill.py 로 동기화) -->\n" + tag + "\n" + s[i:]
open(gen, "w", encoding="utf-8").write(s)
print(f"synced ebook-salespage {bundle['hash']} · EB {len(eb)} · 템플릿 {tpl} · 팔레트 {len([k for k in bundle['palettes'] if k != '_note'])}")
