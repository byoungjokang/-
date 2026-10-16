# -*- coding: utf-8 -*-
"""ebook-meta-ads 스킬 → 전자책 생성기(generator.html) 09 단계 동기화.

생성기는 브라우저에서 돌아서 스킬 폴더를 직접 읽을 수 없다. 그래서 스킬 문서를 '원본 그대로'
<script type="application/json" id="maSkill"> 한 덩어리로 생성기 안에 넣는다. 후킹·형식·카피·검수 규칙은
스킬이 정본이고 생성기는 이 덩어리를 읽어서 AI 에게 준다. 스킬을 고치면 이 스크립트만 다시 돌린다.
(빌더 build_ads.py 의 형식 8종은 생성기 maBuild 로 옮겨져 있다. 템플릿을 고치면 maBuild 도 같이 고친다.)

  python sync_metaads_skill.py <generator.html> [스킬 폴더 = ~/.claude/skills/ebook-meta-ads]
"""
import json, os, re, sys, hashlib

gen = sys.argv[1]
skill = os.path.expanduser(sys.argv[2] if len(sys.argv) > 2 else "~/.claude/skills/ebook-meta-ads")
rd = lambda p: open(os.path.join(skill, p), encoding="utf-8").read()

bundle = {
    "skill": "ebook-meta-ads",
    "docs": {"skill": rd("SKILL.md"), "hooks": rd("references/hooks.md"), "formats": rd("references/formats.md"),
             "prompts": rd("references/image-prompts.md"), "copy": rd("references/copy.md"),
             "checklist": rd("references/checklist.md"), "results": rd("references/results-log.md")},
    "schema": rd("references/ads-schema.json"), "example": rd("references/example-richcode.json"),
}
raw = json.dumps(bundle, ensure_ascii=False, sort_keys=True)
bundle["hash"] = hashlib.sha1(raw.encode()).hexdigest()[:10]
blob = json.dumps(bundle, ensure_ascii=False).replace("</", "<\\/")
tag = f'<script type="application/json" id="maSkill">{blob}</script>'

s = open(gen, encoding="utf-8").read()
if 'id="maSkill"' in s:
    s = re.sub(r'<script type="application/json" id="maSkill">.*?</script>', lambda m: tag, s, count=1, flags=re.S)
else:
    i = s.index('<script type="application/json" id="spSkill">')
    s = s[:i] + "<!-- 09 광고 소재: ebook-meta-ads 스킬 원본 (sync_metaads_skill.py 로 동기화) -->\n" + tag + "\n" + s[i:]
open(gen, "w", encoding="utf-8").write(s)
print(f"synced ebook-meta-ads {bundle['hash']} · 문서 {len(bundle['docs'])}개")
