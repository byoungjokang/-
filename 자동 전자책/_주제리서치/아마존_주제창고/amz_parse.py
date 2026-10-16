import sys, re, json
from html.parser import HTMLParser
src = open(sys.argv[1], encoding='utf-8').read()
# 섹션 단위로 자르기
secs = re.findall(r'<section class="sec" id="(s\d+)"><h2>(.*?)</h2>(.*?)</section>', src, re.S)
def text(h):
    h = re.sub(r'<span class="s2">.*?</span></span>', '★★', h, flags=re.S)
    h = re.sub(r'<span class="s1">★</span>', '★', h)
    h = re.sub(r'<code>(.*?)</code>', r'\1', h)
    h = re.sub(r'<[^>]+>', '', h)
    return re.sub(r'\s+', ' ', h.replace('&amp;', '&').replace('&gt;', '>').replace('&lt;', '<')).strip()
out = []
for sid, title, body in secs:
    blocks = re.split(r'<h3>(.*?)</h3>', body)
    d = {"id": sid, "name": text(title), "parts": {}}
    for i in range(1, len(blocks), 2):
        h = text(blocks[i]); b = blocks[i+1]
        items = [text(x) for x in re.findall(r'<li class="f">(.*?)</li>', b, re.S)]
        rows = [[text(c) for c in re.findall(r'<td>(.*?)</td>', r, re.S)] for r in re.findall(r'<tr class="f">(.*?)</tr>', b, re.S)]
        paras = [text(x) for x in re.findall(r'<p class="f">(.*?)</p>', b, re.S)]
        d["parts"][h] = {"items": items, "rows": rows, "paras": paras}
    out.append(d)
for d in out:
    print(d["id"], d["name"], {k: (len(v["items"]), len(v["rows"])) for k, v in d["parts"].items()})
json.dump(out, open(sys.argv[2], 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
