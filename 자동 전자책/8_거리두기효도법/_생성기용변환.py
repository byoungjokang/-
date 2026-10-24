import re, glob, sys
D = "/home/user/-/자동 전자책/8_거리두기효도법"
rd = lambda n: open(f"{D}/{n}", encoding="utf-8").read()
BAR = "━━━━━━━━━━━━━━━━"

def body(md, drop_h1=True):
    out = []
    for l in md.split("\n"):
        s = l.strip()
        if not s or re.fullmatch(r"-{3,}", s): out.append(""); continue
        if s.startswith("# "):
            if drop_h1: continue
            s = "## " + s[2:]
        m = re.match(r"#{2,6}\s+(.*)", s)
        if m: out.append("■ " + m.group(1).replace("**", "")); continue
        m = re.fullmatch(r"\*\*(.+)\*\*", s)
        if m and len(m.group(1)) < 80: out.append("■ " + m.group(1)); continue
        if s.startswith(">"):
            q = s.lstrip("> ").replace("**", "")
            out.append("“" + q + "”"); continue
        out.append(s.replace("**", ""))
    return re.sub(r"\n{3,}", "\n\n", "\n".join(out)).strip()

def sec(title, text): return f"{BAR}\n{title}\n{BAR}\n{text}\n"

parts = ["책 제목: 거리두기 효도법", "부제: 부모님과 자주 부딪히는 사람들을 위한", ""]
# 프롤로그 + 체크리스트 (체크리스트를 따로 두면 장 번호가 하나씩 밀려서 프롤로그 뒤에 붙인다)
pro = body(rd("00_여는편지.md"))
ck_md = rd("01_체크리스트.md")
ck_title = ck_md.split("\n")[0][2:].strip()
pro += "\n\n■ " + ck_title + "\n" + body(ck_md)
parts.append(sec("프롤로그 · 여는 편지", pro))
for f in sorted(glob.glob(D + "/0[2-8]_*.md")):
    md = open(f, encoding="utf-8").read()
    t = md.split("\n")[0][2:].strip()
    t = re.sub(r"^\d+장\.\s*", "", t)
    parts.append(sec(t, body(md)))
parts.append(sec("에필로그 · 닫는 편지", body(rd("09_닫는편지.md"))))
ap = rd("10_부록.md")
for chunk in re.split(r"\n(?=# )", ap):
    t = chunk.split("\n")[0][2:].strip().replace(" — ", " · ")
    parts.append(sec(t, body(chunk)))
txt = "\n".join(parts)
open(sys.argv[1], "w", encoding="utf-8").write(txt)
print(len(txt))
