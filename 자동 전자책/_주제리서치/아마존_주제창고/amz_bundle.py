import sys, re, json
src = open(sys.argv[1], encoding='utf-8').read(); P = json.load(open(sys.argv[2], encoding='utf-8'))
def text(h):
    h = re.sub(r'<span class="s2">.*?</span></span>', '★★', h, flags=re.S); h = re.sub(r'<span class="s1">★</span>', '★', h)
    h = re.sub(r'<code>(.*?)</code>', r'\1', h); h = re.sub(r'<[^>]+>', '', h)
    return re.sub(r'\s+', ' ', h.replace('&amp;', '&').replace('&gt;', '>').replace('&lt;', '<')).strip()
def sec(sid): return re.search(r'<section class="sec" id="%s">(.*?)</section>' % sid, src, re.S).group(1)
# 메가 트렌드 20
s22 = sec('s22')
mega = [[text(c) for c in re.findall(r'<td>(.*?)</td>', r, re.S)] for r in re.findall(r'<tr[^>]*>(.*?)</tr>', s22, re.S)]
mega = [{"rank": int(r[0]), "trend": r[1], "where": r[2], "books": r[3], "kw": r[4]} for r in mega if len(r) >= 5 and r[0].isdigit()]
extra = text(re.search(r'덤으로 강하게 반복된 것.*?</p>', s22, re.S).group(0)) if re.search(r'덤으로 강하게 반복된 것', s22) else ""
# 한국형 바꾸기
s23 = sec('s23')
korea = [text(x) for x in re.findall(r'<li class="f">(.*?)</li>', s23, re.S) if '→' in text(x)]
# 시장 신호
sig = [text(x) for x in re.findall(r'<li class="f">(.*?)</li>', src.split('먼저 알아둘 시장 신호')[1].split('</ul>')[0], re.S)]
genres = []
for d in P:
    if d["id"] in ("s22", "s23"): continue
    pt = d["parts"]
    tk = next((k for k in pt if k.startswith("많이 팔린 주제")), None); fk = next((k for k in pt if k.startswith("반복되는 제목 공식")), None)
    bk = next((k for k in pt if k.startswith("대표 베스트셀러")), None); sk = next((k for k in pt if k.startswith("세부 분류별")), None)
    best = []
    for r in (pt[bk]["rows"] if bk else []):
        r = [c for c in r if c and not c.isdigit()]
        if len(r) >= 3: best.append(f"{r[0]} ({r[-1]})")
    genres.append({"id": d["id"], "name": re.sub(r'^\d+\.\s*', '', d["name"]), "topics": pt[tk]["items"] if tk else [], "formulas": pt[fk]["items"] if fk else [],
                   "best": best[:12], "subs": pt[sk]["items"] if sk else []})
B = {"source": "아마존 논픽션 베스트셀러 주제창고 (amazon.com 종이책·킨들 베스트셀러, 2026-10-16 직접 열람)", "date": "2026-10-16", "signals": sig, "mega": mega, "megaExtra": extra, "korea": korea, "genres": genres}
s = json.dumps(B, ensure_ascii=False)
open(sys.argv[3], 'w', encoding='utf-8').write(s)
print(len(s), "bytes · mega", len(mega), "· korea", len(korea), "· signals", len(sig), "· genres", len(genres), "· topics", sum(len(g["topics"]) for g in genres))
print(mega[0]); print(korea[0]); print(sig[0][:120]); print(genres[1]["topics"][0]); print(genres[1]["formulas"][0]); print(genres[1]["best"][:2])
