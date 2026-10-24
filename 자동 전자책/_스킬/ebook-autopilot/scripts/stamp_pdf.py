"""build_ebook_html.js 의 후처리.
  --scan  <pdf>                      : 마커(@@COVER@@, @@TOC@@, @@PART@@, @@CHn@@, @@CLOSING@@)로 쪽 유형을 읽어 JSON 출력
  --stamp <in.pdf> <out.pdf> --title --author --color hex --font name : 본문 쪽에 러닝헤드와 쪽번호를 찍고 마커 텍스트를 지운다
"""
import sys, json, re, os, glob
import pymupdf

def find_font(name):
    cands = []
    for d in [os.environ.get("WINDIR", "C:/Windows") + "/Fonts", os.path.expandvars(r"%LOCALAPPDATA%/Microsoft/Windows/Fonts")]:
        cands += glob.glob(d + "/*")
    key = name.lower().replace(" ", "")
    pref = ["pretendard-regular", "notosanskr", "notoserifkr", "malgun"]
    for c in cands:
        b = os.path.basename(c).lower()
        if key.startswith("pretendard") and b == "pretendard-regular.otf": return c
        if "notoserif" in key and b.startswith("notoserifkr"): return c
        if "notosans" in key and b.startswith("notosanskr"): return c
    for p in pref:
        for c in cands:
            if os.path.basename(c).lower().startswith(p): return c
    return None

def scan(pdf):
    d = pymupdf.open(pdf)
    info = {"pages": len(d), "types": {}, "chapters": {}, "bodyStart": None}
    for i in range(len(d)):
        t = d[i].get_text()
        m = re.findall(r"@@([A-Z]+\d*)@@", t)
        typ = m[0] if m else "BODY"
        info["types"][str(i)] = typ
        for k in m:
            if k.startswith("CH"):
                idx = k[2:]
                if idx not in info["chapters"]: info["chapters"][idx] = i
        if typ.startswith("CH") and info["bodyStart"] is None: info["bodyStart"] = i
    print(json.dumps(info))

def stamp(src, dst, title, author, color, fontname):
    d = pymupdf.open(src)
    ff = find_font(fontname)
    rgb = tuple(int(color[i:i+2], 16) / 255 for i in (0, 2, 4))
    types = {}
    body_start = None
    for i in range(len(d)):
        t = d[i].get_text()
        m = re.findall(r"@@([A-Z]+\d*)@@", t)
        typ = m[0] if m else "BODY"
        types[i] = typ
        if typ.startswith("CH") and body_start is None: body_start = i
        # 마커 지우기 (흰색 덮기 대신 redaction)
        for k in m:
            for r in d[i].search_for(f"@@{k}@@"):
                d[i].add_redact_annot(r, fill=False)
        if m: d[i].apply_redactions(images=pymupdf.PDF_REDACT_IMAGE_NONE)
    W, H = d[0].rect.width, d[0].rect.height
    font_obj = pymupdf.Font(fontfile=ff) if ff else pymupdf.Font("helv")
    tl = lambda text, size: font_obj.text_length(text, fontsize=size)
    mm = 72 / 25.4
    n = 0
    for i in range(len(d)):
        typ = types[i]
        if typ in ("COVER", "TOC", "PART", "CLOSING"):
            if typ == "CLOSING": pass
            continue
        n = i - body_start + 1
        p = d[i]
        kw = dict(fontsize=6.5, color=rgb)
        if ff: kw.update(fontname="hd", fontfile=ff)
        p.insert_text(pymupdf.Point(17 * mm, 11 * mm), title, **kw)
        tw = tl(author, 6.5)
        p.insert_text(pymupdf.Point(W - 17 * mm - tw, 11 * mm), author, **kw)
        p.draw_line(pymupdf.Point(17 * mm, 12.6 * mm), pymupdf.Point(W - 17 * mm, 12.6 * mm), color=rgb, width=0.3)
        num = str(n)
        nw = tl(num, 7)
        kw2 = dict(fontsize=7, color=rgb)
        if ff: kw2.update(fontname="hd", fontfile=ff)
        p.insert_text(pymupdf.Point((W - nw) / 2, H - 9 * mm), num, **kw2)
    d.save(dst, garbage=3, deflate=True)
    print(f"{len(d)}p (본문 {n}p)")

if __name__ == "__main__":
    a = sys.argv[1:]
    if a[0] == "--scan": scan(a[1])
    elif a[0] == "--stamp":
        opts = {a[i]: a[i + 1] for i in range(3, len(a) - 1, 2)}
        stamp(a[1], a[2], opts.get("--title", ""), opts.get("--author", ""), opts.get("--color", "888888"), opts.get("--font", "Pretendard Variable"))
