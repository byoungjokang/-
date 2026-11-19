# -*- coding: utf-8 -*-
"""09_ads.json + 팔레트 -> 광고 소재 PNG (1080x1350) + 시트.

사용:
  python build_ads.py books/<slug>/09_ads.json [--palette black-red] [--only 01 05] [--no-sheet]

09_ads.json 형식은 references/ads-schema.json. 경로(image, book)는 json 파일 위치 기준 상대경로.
출력: <json 폴더>/ads/out/NN.html, NN.png, <json 폴더>/09_ads_sheet.png
크롬(또는 엣지) 헤드리스로 렌더한다. Pillow 필요(pip install pillow).
"""
import os, sys, json, glob, html, shutil, subprocess, argparse

HERE = os.path.dirname(os.path.abspath(__file__))
PALETTES = [os.path.join(HERE, "..", "..", "ebook-salespage", "references", "palettes.json")]
DEFAULT_ACCENT = {"accent": "#ffcf5a", "bg": "#07070a"}

BROWSERS = [r"C:\Program Files\Google\Chrome\Application\chrome.exe",
            r"C:\Program Files (x86)\Google\Chrome\Application\chrome.exe",
            os.path.expandvars(r"%LOCALAPPDATA%\Google\Chrome\Application\chrome.exe"),
            r"C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe",
            "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"]

def browser():
    for b in BROWSERS:
        if os.path.exists(b):
            return b
    for n in ("google-chrome", "chrome", "chromium", "msedge"):
        p = shutil.which(n)
        if p:
            return p
    sys.exit("크롬/엣지를 찾지 못했습니다.")

def esc(s):
    return html.escape(str(s or ""), quote=False)

def em(text, accent_word):
    """문장 안 accent_word 를 <em> 으로. 없으면 그대로."""
    t = esc(text)
    if accent_word:
        a = esc(accent_word)
        t = t.replace(a, f"<em>{a}</em>", 1)
    return t

def lines(arr, accent_word=None):
    return "<br>".join(em(x, accent_word) for x in arr)

BASE_CSS = """*{margin:0;padding:0;box-sizing:border-box}
html,body{width:%(W)dpx;height:%(H)dpx;overflow:hidden;background:%(bg)s;font-family:'Noto Sans KR',sans-serif;word-break:keep-all;-webkit-font-smoothing:antialiased}
em{font-style:normal;color:%(accent)s}
.cta{position:absolute;left:44px;right:44px;bottom:40px;height:106px;border-radius:54px;background:%(accent)s;color:#111;display:flex;align-items:center;justify-content:center;font-size:44px;font-weight:900;letter-spacing:-1px;box-shadow:0 0 34px %(accent)s66}
.book{position:absolute;left:36px;bottom:150px;width:300px;transform:rotate(-6deg);filter:drop-shadow(0 26px 36px rgba(0,0,0,.85))}
"""
HEAD = """<!doctype html><html lang="ko"><head><meta charset="utf-8">
<link href="https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@400;500;700;900&family=Nanum+Pen+Script&display=swap" rel="stylesheet">
<style>%s%s</style></head><body>%s</body></html>"""

# ---------------- 형식별 템플릿 ----------------

def t_poster(c, g):
    pos = c.get("bgPos", "center 30%/cover")
    bright = c.get("brightness", 1.35)
    side = c.get("side", "right")  # 인물 위치. 텍스트는 항상 위·왼쪽
    css = f""".bg{{position:absolute;inset:0;background:url({c['_img']}) {pos} no-repeat;filter:brightness({bright}) contrast(1.05)}}
.sh{{position:absolute;inset:0;background:linear-gradient(180deg,rgba(5,5,8,.92) 0%,rgba(5,5,8,.55) 28%,rgba(5,5,8,0) 46%),linear-gradient(90deg,rgba(5,5,8,.6) 0%,rgba(5,5,8,0) 45%),linear-gradient(0deg,rgba(5,5,8,.9) 0%,rgba(5,5,8,0) 22%)}}
.top{{position:absolute;left:64px;top:62px;display:flex;align-items:center;gap:20px;color:rgba(255,255,255,.82);font-size:30px;font-weight:500}}
.top i{{display:block;width:110px;height:2px;background:rgba(255,255,255,.5)}}
h1{{position:absolute;left:60px;right:60px;top:118px;color:#fff;font-size:{c.get('size',90)}px;font-weight:900;letter-spacing:-4px;line-height:1.16;text-shadow:0 6px 24px rgba(0,0,0,.7)}}"""
    body = f"""<div class="bg"></div><div class="sh"></div>
<div class="top">{esc(c.get('kicker', g.get('kicker','')))}<i></i></div>
<h1>{lines(c['headline'], c.get('accent'))}</h1>
{g['_book']}<div class="cta">{esc(c.get('cta', g.get('cta','지금 확인하기 ›')))}</div>"""
    return css, body

def _band_footer(c, g):
    return f"""<div class="ft"><img src="{g['_bookSrc']}"><div class="t"><b>{esc(c.get('footTitle', g.get('footTitle','')))}</b>{esc(c.get('footSub', g.get('footSub','')))}</div><div class="btn">{esc(c.get('ctaShort', g.get('ctaShort','확인하기 ›')))}</div></div>"""

BAND_CSS = """.ft{position:absolute;left:0;right:0;bottom:0;height:%(fh)dpx;display:flex;align-items:center;gap:30px;padding:0 50px}
.ft img{width:150px;transform:rotate(-4deg)}
.ft .t{flex:1;color:#ddd;font-size:30px;line-height:1.5}.ft .t b{display:block;color:#fff;font-size:36px}
.ft .btn{flex:none;padding:26px 34px;border-radius:44px;background:%(accent)s;color:#111;font-size:34px;font-weight:900}"""

def t_film(c, g):
    css = f""".hd{{position:absolute;left:0;right:0;top:0;height:300px;padding:70px 64px 0}}
.hd small{{display:block;color:rgba(255,255,255,.6);font-size:28px;font-weight:500;margin-bottom:14px}}
.hd h1{{color:#fff;font-size:72px;font-weight:900;letter-spacing:-3px;line-height:1.18}}
.st{{position:absolute;left:0;right:0;top:330px;height:720px;background:url({c['_img']}) {c.get('bgPos','center/cover')} no-repeat;filter:brightness({c.get('brightness',1.08)})}}
.sub{{position:absolute;left:40px;right:40px;top:960px;text-align:center;color:#fff;font-size:44px;font-weight:700;text-shadow:0 0 6px #000,0 2px 4px #000,0 0 18px rgba(0,0,0,.9)}}
""" + BAND_CSS % {"fh": 270, "accent": g["accent"]}
    body = f"""<div class="hd"><small>{esc(c.get('kicker', g.get('kicker','')))}</small><h1>{lines(c['headline'], c.get('accent'))}</h1></div>
<div class="st"></div><div class="sub">{esc(c['subtitle'])}</div>{_band_footer(c, g)}"""
    return css, body

def t_doc(c, g):
    s1, s2 = (c["subtitle"] + [""])[:2] if isinstance(c["subtitle"], list) else (c["subtitle"], "")
    css = f""".hd{{position:absolute;left:0;right:0;top:0;height:280px;padding:66px 64px 0}}
.hd small{{display:inline-block;padding:8px 18px;border:2px solid {g['accent']};color:{g['accent']};font-size:26px;font-weight:700;border-radius:8px}}
.hd h1{{margin-top:22px;color:#fff;font-size:62px;font-weight:900;letter-spacing:-2px;line-height:1.2}}
.st{{position:absolute;left:0;right:0;top:290px;height:760px;background:url({c['_img']}) {c.get('bgPos','center/cover')} no-repeat}}
.lt{{position:absolute;left:40px;top:830px;display:flex}}
.lt b{{background:{g['accent']};color:#111;font-size:28px;font-weight:900;padding:10px 18px}}
.lt span{{background:rgba(255,255,255,.92);color:#111;font-size:28px;font-weight:700;padding:10px 20px}}
.sub{{position:absolute;left:30px;right:30px;top:900px;text-align:center;font-size:50px;font-weight:900;line-height:1.35;color:#fff;text-shadow:0 0 6px #000,0 2px 4px #000,0 0 20px rgba(0,0,0,.95)}}
""" + BAND_CSS % {"fh": 290, "accent": g["accent"]}
    body = f"""<div class="hd"><small>{esc(c.get('label','돈 때문에 잠 못 드는 사람들'))}</small><h1>{esc(c.get('title','누구에게도 못 했던 속마음'))}</h1></div>
<div class="st"></div><div class="lt"><b>{esc(c.get('tag','속마음'))}</b><span>{esc(c['who'])}</span></div>
<div class="sub">"{esc(s1)}<br><em>{esc(s2)}</em>"</div>{_band_footer(c, g)}"""
    return css, body

def _bottom_block(c, top_px):
    return f"""<div class="bb" style="top:{top_px}px"><h1>{lines(c['headline'], c.get('accent'))}</h1>{('<p>'+esc(c['sub'])+'</p>') if c.get('sub') else ''}</div>"""

BB_CSS = """.bb{position:absolute;left:0;right:0;bottom:0;background:#0c0c0e;padding:56px 64px 0}
.bb h1{color:#fff;font-size:96px;font-weight:900;letter-spacing:-4px;line-height:1.12}
.bb p{margin-top:24px;color:#b9b9c2;font-size:38px;font-weight:500;line-height:1.45}"""

def t_kakao(c, g):
    rows = []
    for m in c["messages"]:
        if "day" in m:
            rows.append(f'<div class="day">{esc(m["day"])}</div>')
        elif m.get("me"):
            rows.append(f'<div class="me"><i>{esc(m.get("time",""))}</i><div class="b">{esc(m["text"])}</div></div>')
        else:
            rows.append(f'<div class="you"><div class="av"></div><div><div class="nm">{esc(m.get("name",c.get("chatName","")))}</div><div class="b w">{esc(m["text"])}</div></div></div>')
    css = """body{background:#b2c7d9}
.top{height:110px;background:#a9bfd1;display:flex;align-items:center;padding:0 48px;font-size:38px;font-weight:700;color:#222}
.chat{padding:20px 48px}
.me{display:flex;justify-content:flex-end;align-items:flex-end;gap:14px;margin-bottom:20px}
.me i{font-style:normal;font-size:24px;color:#556}
.b{background:#fee500;color:#111;font-size:38px;line-height:1.45;padding:22px 30px;border-radius:26px 6px 26px 26px;max-width:700px}
.b.w{background:#fff;border-radius:6px 26px 26px 26px}
.you{display:flex;gap:16px;margin-bottom:20px}.av{width:76px;height:76px;border-radius:26px;background:#8fa4b8;flex:none}.nm{font-size:26px;color:#445;margin-bottom:6px}
.day{margin:26px auto 24px;width:max-content;background:rgba(0,0,0,.18);color:#fff;font-size:28px;padding:10px 28px;border-radius:30px}
""" + BB_CSS
    body = f"""<div class="top">{esc(c.get('chatName','소개팅 그분'))}</div><div class="chat">{''.join(rows)}</div>{_bottom_block(c, c.get('blockTop', 850))}"""
    return css, body

def t_lock(c, g):
    ns = "".join(f'<div class="n"><div class="h"><i style="background:{esc(n.get("color","#fee500"))}"></i>{esc(n["app"])}<span>{esc(n.get("time","지금"))}</span></div>{("<b>"+esc(n["title"])+"</b>") if n.get("title") else ""}<p>{esc(n["text"])}</p></div>' for n in c["notifications"])
    css = """body{background:radial-gradient(120%% 80%% at 50%% 0%%,#3a3550 0%%,#14121c 60%%,#0a090e 100%%);color:#fff}
.dt{text-align:center;padding-top:100px;font-size:40px;opacity:.85}.tm{text-align:center;font-size:220px;font-weight:700;letter-spacing:-6px;line-height:1}
.n{margin:22px 44px 0;background:rgba(255,255,255,.16);border-radius:36px;padding:28px 36px}
.n .h{display:flex;gap:14px;align-items:center;font-size:28px;opacity:.75}.n .h i{width:46px;height:46px;border-radius:12px}.n .h span{margin-left:auto}
.n b{display:block;margin-top:14px;font-size:36px}.n p{margin-top:8px;font-size:38px;line-height:1.4}
.big{position:absolute;left:64px;right:64px;top:%dpx}.big h1{font-size:96px;font-weight:900;letter-spacing:-4px;line-height:1.12}.big p{margin-top:24px;opacity:.75;font-size:38px}""" % c.get("textTop", 800)
    body = f"""<div class="dt">{esc(c.get('date','10월 11일 토요일'))}</div><div class="tm">{esc(c.get('clock','23:42'))}</div><div style="height:40px"></div>{ns}
<div class="big"><h1>{lines(c['headline'], c.get('accent'))}</h1>{('<p>'+esc(c['sub'])+'</p>') if c.get('sub') else ''}</div>"""
    return css, body

def t_search(c, g):
    items = "".join(f'<div>{esc(c["query"])}<b>&nbsp;{esc(s)}</b></div>' for s in c["suggestions"])
    css = """body{background:#fff;color:#111}.w{padding:150px 64px 0}
.bar{display:flex;align-items:center;gap:20px;border:4px solid #03c75a;border-radius:60px;padding:30px 40px;font-size:44px;font-weight:500}.bar b{color:#03c75a;font-size:48px}
.list{margin-top:16px;border:1px solid #e3e3e3;border-radius:28px;padding:14px 0;box-shadow:0 10px 30px rgba(0,0,0,.08)}
.list div{padding:22px 44px;font-size:40px;color:#333;display:flex;gap:22px;align-items:center}.list div:before{content:"";width:30px;height:30px;border:4px solid #bbb;border-radius:50%;flex:none}.list b{font-weight:400;color:#888}
.big{position:absolute;left:64px;right:64px;bottom:120px}.big h1{font-size:84px;font-weight:900;letter-spacing:-4px;line-height:1.15}.big h1 em{color:#d01818}.big p{margin-top:22px;color:#666;font-size:38px}"""
    body = f"""<div class="w"><div class="bar"><b>N</b>{esc(c['query'])}</div><div class="list">{items}</div></div>
<div class="big"><h1>{lines(c['headline'], c.get('accent'))}</h1>{('<p>'+esc(c['sub'])+'</p>') if c.get('sub') else ''}</div>"""
    return css, body

def t_quiz(c, g):
    opts = "".join(f'<div class="{"a" if i==c["answer"] else ""}">{esc(o)}</div>' for i, o in enumerate(c["options"]))
    css = """body{background:#fffef8;color:#111}.w{padding:110px 72px 0}.n{font-size:34px;color:#888;font-weight:700}
.q{margin-top:20px;font-size:62px;font-weight:900;letter-spacing:-2px;line-height:1.3}.o{margin-top:46px;display:grid;gap:24px}
.o div{font-size:48px;font-weight:500;position:relative}.o .a{font-weight:900}
.o .a:before{content:"";position:absolute;left:-30px;top:-16px;width:calc(100% - 300px);min-width:420px;height:104px;border:7px solid #e0201b;border-radius:50%;transform:rotate(-2deg)}
.big{position:absolute;left:72px;right:340px;bottom:110px;font-size:50px;font-weight:700;line-height:1.4}.big em{color:#9a6b12}"""
    body = f"""<div class="w"><div class="n">{esc(c.get('num','문제 1.'))}</div><div class="q">{lines(c['question'])}</div><div class="o">{opts}</div></div>
<div class="big">{lines(c['headline'], c.get('accent'))}</div>{g['_bookCorner']}"""
    return css, body

def t_review(c, g):
    css = """.w{padding:150px 72px 0;color:#fff}.st{font-size:56px;letter-spacing:10px}.st{color:%s}
.q{margin-top:44px;font-size:72px;font-weight:900;letter-spacing:-3px;line-height:1.28}.who{margin-top:40px;color:#999;font-size:34px}""" % g["accent"]
    body = f"""<div class="w"><div class="st">★★★★★</div><div class="q">"{lines(c['quote'], c.get('accent'))}"</div><div class="who">{esc(c['who'])} (실제 구매 후기)</div></div>{g['_bookCorner']}"""
    return css, body

TYPES = {"poster": t_poster, "film": t_film, "doc": t_doc, "kakao": t_kakao, "lock": t_lock,
         "search": t_search, "quiz": t_quiz, "review": t_review}

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("json")
    ap.add_argument("--palette")
    ap.add_argument("--only", nargs="*")
    ap.add_argument("--no-sheet", action="store_true")
    a = ap.parse_args()

    root = os.path.dirname(os.path.abspath(a.json))
    spec = json.load(open(a.json, encoding="utf-8"))
    g = dict(spec.get("global", {}))
    pal = dict(DEFAULT_ACCENT)
    pid = a.palette or g.get("palette")
    if pid:
        for p in PALETTES:
            if os.path.exists(p):
                d = json.load(open(p, encoding="utf-8"))
                if pid in d:
                    pal.update({k: d[pid][k] for k in ("accent", "bg") if k in d[pid]})
    g.setdefault("accent", g.get("accentOverride") or pal["accent"])
    out = os.path.join(root, "ads", "out")
    os.makedirs(out, exist_ok=True)

    def rel(p):  # out/ 에서 본 상대 경로
        return os.path.relpath(os.path.join(root, p), out).replace("\\", "/")

    book = g.get("book")
    g["_bookSrc"] = rel(book) if book else ""
    g["_book"] = f'<img class="book" src="{g["_bookSrc"]}">' if book else ""
    g["_bookCorner"] = f'<img src="{g["_bookSrc"]}" style="position:absolute;right:40px;bottom:-30px;width:270px;transform:rotate(5deg);filter:drop-shadow(0 24px 40px rgba(0,0,0,.6))">' if book else ""

    warn, files = [], []
    for c in spec["creatives"]:
        cid = c["id"]
        if a.only and cid not in a.only:
            continue
        fn = TYPES.get(c["type"])
        if not fn:
            warn.append(f"{cid}: 모르는 type {c['type']}"); continue
        if c.get("image"):
            ip = os.path.join(root, c["image"])
            if not os.path.exists(ip):
                warn.append(f"{cid}: 이미지 없음 {c['image']} (건너뜀)"); continue
            c["_img"] = rel(c["image"])
        elif c["type"] in ("poster", "film", "doc"):
            warn.append(f"{cid}: {c['type']} 는 image 필요"); continue
        W, H = (1080, 1920) if c.get("story") else (1080, 1350)
        css, body = fn(c, g)
        base = BASE_CSS % {"W": W, "H": H, "bg": pal["bg"] if c["type"] in ("poster","film","doc","review") else "#0c0c0e", "accent": g["accent"]}
        p = os.path.join(out, f"{cid}.html")
        open(p, "w", encoding="utf-8").write(HEAD % (base, css, body))
        files.append((p, W, H))

    b = browser()
    for p, W, H in files:
        png = p[:-5] + ".png"
        subprocess.run([b, "--headless=new", "--disable-gpu", "--hide-scrollbars", "--force-device-scale-factor=1",
                        f"--window-size={W},{H}", "--virtual-time-budget=6000", f"--screenshot={png}",
                        "file:///" + p.replace("\\", "/")], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
        if not os.path.exists(png):
            warn.append(f"렌더 실패: {os.path.basename(p)}")

    if not a.no_sheet:
        try:
            from PIL import Image
            pngs = sorted(glob.glob(os.path.join(out, "*.png")))
            if pngs:
                w, h, cols = 270, 338, 5
                rows = (len(pngs) + cols - 1) // cols
                s = Image.new("RGB", (cols * (w + 8), rows * (h + 8)), "white")
                for i, f in enumerate(pngs):
                    s.paste(Image.open(f).convert("RGB").resize((w, h)), ((i % cols) * (w + 8), (i // cols) * (h + 8)))
                s.save(os.path.join(root, "09_ads_sheet.png"))
        except ImportError:
            warn.append("Pillow 없음: 시트 생략 (pip install pillow)")

    print(f"렌더 {len(files)}개 -> {out}")
    for w in warn:
        print("경고:", w)

if __name__ == "__main__":
    main()
