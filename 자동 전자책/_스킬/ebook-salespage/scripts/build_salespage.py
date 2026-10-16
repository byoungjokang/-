# -*- coding: utf-8 -*-
"""06_salespage.json + 팔레트 → 크레킷용 상세페이지 HTML.
사용법:
  python build_salespage.py 06_salespage.json 06_salespage.html --palette midnight-gold [--check] [--preview]
--check   자리표시자·금지문자·섹션 누락·버튼 중복을 세어 출력 (0 이 아니면 종료코드 1)
--preview Playwright 로 모바일 400px 전체 미리보기 jpg 저장 (playwright 설치 시)
"""
import json, re, sys, os, html

HERE = os.path.dirname(os.path.abspath(__file__))
REF = os.path.join(HERE, "..", "references")
TPL = os.path.join(HERE, "..", "templates")

def esc(s):  # 문자열 → HTML (줄바꿈·인라인 마크업 지원)
    if s is None: return ""
    s = html.escape(str(s), quote=False)
    s = s.replace("{accent}", "<span class='accent'>").replace("{/accent}", "</span>")
    s = s.replace("{b}", "<strong>").replace("{/b}", "</strong>")
    s = s.replace("{muted}", "<span class='muted'>").replace("{/muted}", "</span>")
    s = s.replace("{u}", "<u>").replace("{/u}", "</u>")
    return s.replace("\n", "<br>")

def para(s):  # \n\n 는 단락, \n 은 <br>
    return "".join(f"<p class='body'>{esc(p)}</p>" for p in str(s).split("\n\n"))

def section(kind, inner, extra_cls="", sid=""):
    return f"<section class='sec {kind}{(' '+extra_cls) if extra_cls else ''}'{(' id='+chr(34)+sid+chr(34)) if sid else ''}>{inner}</section>"

def build(d, pal, p_id):
    M = d["meta"]; buy = M.get("buyUrl", "【결제 링크】"); book = M.get("book", "")
    parts = []; order = []  # order: 섹션 키(deep/base 번갈아 칠하기용)

    def add(key, inner, extra="", sid=""):
        order.append((key, inner, extra, sid))

    # 01 히어로
    h = d.get("hero", {})
    cover = h.get("cover")
    cover_html = f"<figure class='cover'><img src='{esc(cover)}' alt='{esc(book)} 표지'><figcaption>{esc(h.get('coverCaption',''))}</figcaption></figure>" if cover else ""
    hero = f"""<section class='hero'><div class='wrap hero-grid{'' if cover else ' nocover'}'><div>
<p class='brand'><b>{esc(book)}</b> {esc(M.get('format',''))}</p>
<h1>{esc(h.get('h1',''))}</h1>
<p class='hero-story'>{esc(h.get('story',''))}</p>
<div class='hero-actions'><a class='btn' href='{esc(buy)}'>{esc(h.get('btn', M.get('ctaLabel','')))}</a>{("<a class='text-link' href='#story'>"+esc(h.get('link'))+"</a>") if h.get('link') and d.get('story') else ''}</div>
</div>{cover_html}</div></section>"""

    # 02 저자 이야기
    s = d.get("story")
    if s:
        if s.get("inquiry"):
            tl = "<ul class='inquiry rv'>" + "".join(f"<li><b>{esc(i['label'])}</b><p>{esc(i['text'])}</p></li>" for i in s["inquiry"]) + "</ul>"
        else:
            li = []
            for t in s.get("timeline", []):
                cls = " ".join(c for c in ["rv", "turn" if t.get("turn") else "", "hit" if t.get("hit") else ""] if c)
                wins = ("<ul class='wins'>" + "".join(f"<li>{esc(w)}</li>" for w in t["wins"]) + "</ul>") if t.get("wins") else ""
                li.append(f"<li class='{cls}'><b>{esc(t['label'])}</b><p>{esc(t['text'])}</p>{wins}</li>")
            tl = "<ol class='timeline'>" + "".join(li) + "</ol>"
        photo = f"<figure><img src='{esc(s['photo'])}' alt=''><figcaption>{esc(s.get('photoCaption',''))}</figcaption></figure>" if s.get("photo") else ""
        code = f"<div class='wrap'><p class='code-line rv'>{esc(s['codeLine'])}</p></div>" if s.get("codeLine") else ""
        add("story", f"<div class='wrap story-grid'><div class='story-head rv'><h2 class='h2'>{esc(s['h2'])}</h2>{photo}</div>{tl}</div>{code}", "", "story")

    # 03 셀프체크
    c = d.get("selfcheck")
    if c:
        items = "".join(f"<button class='check' type='button' aria-pressed='false'><span class='box'></span>{esc(i)}</button>" for i in c.get("items", []))
        add("selfcheck", f"<div class='wrap selfcheck'><div class='rv'><h2 class='h2'>{esc(c['h2'])}</h2><p class='lead'>{esc(c.get('lead',''))}</p></div><div><div class='checks rv' id='checks'>{items}</div><p class='check-result rv'>{esc(c.get('result',''))}</p></div></div>")

    # 04 진짜 이유
    r = d.get("reason")
    if r:
        ratio = ""
        if r.get("ratio"):
            q = r["ratio"]
            ratio = f"<div class='ratio rv'><div class='ratio-bar'><div class='c'><b>{esc(q['small']['value'])}</b><span>{esc(q['small']['label'])}</span></div><div class='u'><b>{esc(q['big']['value'])}</b><span>{esc(q['big']['label'])}</span></div></div><p class='ratio-cap'>{esc(q.get('caption',''))}</p></div>"
        img = f"<figure class='rv'><img src='{esc(r['image'])}' alt=''></figure>" if r.get("image") else ""
        body = "".join(f"<p class='body'>{esc(b)}</p>" for b in r.get("body", []))
        old = ("<ul class='old-voice'>" + "".join(f"<li>{esc(o)}</li>" for o in r["oldVoice"]) + "</ul>") if r.get("oldVoice") else ""
        verdict = f"<p class='verdict'>{esc(r['verdict'])}</p>" if r.get("verdict") else ""
        add("reason", f"<div class='wrap'><div class='reason-head rv'><h2 class='h2'>{esc(r['h2'])}</h2></div>{ratio}<div class='reason-grid{'' if img else ' noimg'}'>{img}<div class='weights rv'>{body}{old}{verdict}</div></div></div>")

    # 모듈 D 파고들다
    g = d.get("dig")
    if g:
        notes = "<ul class='dig-notes rv'>" + "".join(f"<li><b>{esc(n['label'])}</b>{esc(n['text'])}</li>" for n in g.get("notes", [])) + "</ul>"
        img = f"<figure class='rv'><img src='{esc(g['image'])}' alt=''></figure>" if g.get("image") else ""
        add("dig", f"<div class='wrap'><h2 class='h2 rv'>{esc(g['h2'])}</h2>{('<p class=lead>'+esc(g['lead'])+'</p>') if g.get('lead') else ''}<div class='dig-grid'>{img}{notes}</div></div>")

    # 05 리얼리티 체크
    y = d.get("reality")
    if y:
        adv = "<ul class='advice'>" + "".join(f"<li>{esc(a)}</li>" for a in y.get("advice", [])) + "</ul>"
        add("reality", f"<div class='wrap reality'><div class='rv'><h2 class='h2'>{esc(y['h2'])}</h2>{adv}</div><div class='rv'><p class='body'>{esc(y.get('body',''))}</p><div class='ignore'><p>{esc(y.get('ignore',''))}</p></div><p class='for-you'>{esc(y.get('forYou',''))}</p></div></div>")

    # 06 3가지 차이
    f = d.get("diff")
    if f:
        cards = "".join(f"<article class='rv'><h3>{esc(i['title'])}</h3><p>{esc(i['text'])}</p></article>" for i in f.get("items", [])[:3])
        add("diff", f"<div class='wrap'><h2 class='h2 rv'>{esc(f['h2'])}</h2><div class='diff'>{cards}</div>{('<p class='+chr(34)+'faster rv'+chr(34)+'>'+esc(f['faster'])+'</p>') if f.get('faster') else ''}</div>")

    # 07 목차
    t = d.get("toc")
    if t:
        meta = "".join(f"<span>{esc(m)}</span>" for m in t.get("meta", []))
        pts = "".join(f"<div class='toc-part rv'><div><b>{esc(p['label'])}</b><h3>{esc(p['title'])}</h3></div><ul>{''.join('<li>'+esc(i)+'</li>' for i in p.get('items',[]))}</ul></div>" for p in t.get("parts", []))
        add("toc", f"<div class='wrap'><div class='toc-head rv'><h2 class='h2'>{esc(t['h2'])}</h2><div class='toc-meta'>{meta}</div></div><div class='toc'>{pts}</div></div>", "", "contents")

    # 08 실제 성과
    e = d.get("results")
    if e and e.get("images"):
        imgs = "".join(f"<a class='rv' href='{esc(u)}' target='_blank' rel='noopener'><img src='{esc(u)}' alt='' loading='lazy'></a>" for u in e["images"])
        notes = ("<p class='notes'>" + "<br>".join(esc(n) for n in e["notes"]) + "</p>") if e.get("notes") else ""
        add("results", f"<div class='wrap'><h2 class='h2 results-head rv'>{esc(e['h2'])}</h2><p class='lead rv'>{esc(e.get('lead',''))}</p><div class='results'>{imgs}</div>{notes}</div>")

    # 09 후기
    v = d.get("reviews")
    if v and (v.get("items") or v.get("captures")):
        cards = "".join(f"<figure class='review rv'{' data-sample=1' if i.get('sample') else ''}><div><div class='stars'>★★★★★</div><blockquote>{esc(i['quote'])}</blockquote></div><figcaption>{esc(i.get('who',''))}</figcaption></figure>" for i in v.get("items", []))
        proof = ""
        if v.get("captures"):
            imgs = "".join(f"<img src='{esc(u)}' alt='후기 캡처' loading='lazy'>" for u in v["captures"])
            proof = f"<div class='proof rv'><h3>{esc(v.get('capturesTitle','먼저 들은 분들이 직접 올린 글입니다'))}</h3><p>{esc(v.get('capturesNote','원문 그대로, 소속만 가렸습니다. 누르면 크게 보입니다.'))}</p><div class='marquee' id='marquee'><div class='track'>{imgs}</div></div></div>"
            if v.get("guarantee"):
                proof += f"<div class='money rv'><p>{esc(v['guarantee'])}</p>{('<small>'+esc(v['guaranteeNote'])+'</small>') if v.get('guaranteeNote') else ''}</div>"
        mid = f"<div class='mid-cta rv'><a class='btn' href='{esc(buy)}'>{esc(v['midCta'])}</a></div>" if v.get("midCta") else ""
        add("reviews", f"<div class='wrap'><h2 class='h2 rv'>{esc(v['h2'])}</h2><div class='reviews'>{cards}</div>{proof}{mid}</div>")

    # 10 정직 선언
    o = d.get("honest")
    if o:
        hype = ("<ul class='hype rv'>" + "".join(f"<li>{esc(x)}</li>" for x in o["hype"]) + "</ul>") if o.get("hype") else ""
        add("honest", f"<div class='narrow'>{hype}<h2 class='h2 rv'>{esc(o['h2'])}</h2><p class='body rv'>{esc(o.get('body',''))}</p></div>", "honest")

    # 11 FAQ
    q = d.get("faq")
    if q:
        items = "".join(f"<details><summary>{esc(i['q'])}</summary><p>{esc(i['a'])}</p></details>" for i in q.get("items", []))
        add("faq", f"<div class='wrap faq'><h2 class='h2 rv'>{esc(q['h2'])}</h2><div class='faq-list rv'>{items}</div></div>")

    # 12 가격
    p = d.get("price")
    if p:
        ladder = ""
        if M.get("ladder") and p.get("ladder"):
            rows = []
            for L in p["ladder"]:
                st = L.get("state", "")
                cls = "cur" if st == "현재" else ("next" if st == "예정" else "")
                price = f"<s>{esc(L['price'])}</s>" if st == "종료" else esc(L["price"])
                rows.append(f"<li class='{cls}'><b>{esc(L['step'])}</b><span>{price}</span><em>{esc(st)}</em></li>")
            ladder = "<ul class='ladder'>" + "".join(rows) + "</ul>"
        timer = f"<div class='timer'><small>{esc(p.get('timerText',''))}</small><span class='cd' data-cd='long'></span></div>" if M.get("ladder") and p.get("timerText") else ""
        card = f"""<div class='price-card rv'><span class='tag'>{esc(p.get('tag',''))}</span>
{('<p class=was><s>'+esc(p['was'])+'</s></p>') if p.get('was') else ''}
<p class='now'>{esc(p.get('now',''))}<span>원</span></p>{ladder}{timer}
<a class='btn block' href='{esc(buy)}'>{esc(p.get('btn', M.get('ctaLabel','')))}</a>
{('<p class=fine>'+esc(p['fine'])+'</p>') if p.get('fine') else ''}</div>"""
        add("price", f"<div class='wrap price-grid'><div class='rv'><p class='choice'>{esc(p.get('choice',''))}</p>{para(p.get('body',''))}</div>{card}</div>", "price", "price")

    # deep/base 번갈아 (히어로가 base 이므로 첫 섹션은 deep)
    secs = []
    for i, (key, inner, extra, sid) in enumerate(order):
        kind = "deep" if i % 2 == 0 else ""
        secs.append(section(kind, inner, extra, sid))

    topbar = ""
    if M.get("ladder") and d.get("topbar"):
        topbar = f"<div class='topbar'>{esc(d['topbar'].get('text',''))}<span class='cd' data-cd='short'></span></div>"
    footer = f"<footer class='footer'>© {esc(M.get('brand', book))}. ALL RIGHTS RESERVED</footer>"
    sticky = ""
    if M.get("stickyBar"):
        was = f"<s>{esc(p.get('was','').replace('정가 ',''))}</s>" if p and p.get("was") else ""
        sticky = f"<div class='sticky'><div class='sticky-inner'><div class='sticky-price'>{was}<b>{esc(p.get('now',''))}원</b>{('<small>오늘 마감까지 <span class=cd data-cd=short></span></small>') if M.get('ladder') else ''}</div><a class='btn' href='{esc(buy)}'><span class='lbl-long'>{esc(book)} </span>구매하기</a></div></div>"

    css = open(os.path.join(TPL, "salespage.css"), encoding="utf-8").read()
    root = f""":root{{--bg:{pal['bg']};--bg-2:{pal['bg2']};--bg-3:{pal['bg3']};--deep:{pal['deep']};--line:{pal['line']};--line-2:{pal['line2']};--text:{pal['text']};--text-2:{pal['text2']};--text-3:{pal['text3']};--accent:{pal['accent']};--accent-hi:{pal['accentHi']};--accent-soft:{pal['accentSoft']};--accent-ink:{pal['accentInk']};--glow:{pal['glow']};--topbar:{pal['topbar']};--ease:cubic-bezier(.16,1,.3,1);--sans:'Pretendard','Apple SD Gothic Neo','Malgun Gothic',sans-serif;--serif:'Hahmlet','Pretendard',serif;--wrap:1080px}}"""
    js = open(os.path.join(TPL, "salespage.js"), encoding="utf-8").read()
    return f"""<!doctype html><html lang='ko'><head><meta charset='utf-8'><meta name='viewport' content='width=device-width,initial-scale=1'><title>{esc(book)}</title>
<style>{root}
{css}</style></head><body class='{'dots' if pal.get('dots') else ''}{' light' if pal.get('light') else ''}'>
<!-- ebook-salespage · 팔레트 {p_id} · 구조: 리치코드 12섹션 -->
<main class='page{'' if M.get('stickyBar') else ' nosticky'}'>{topbar}{hero}{''.join(secs)}{footer}</main>{sticky}
<script>{js}</script></body></html>"""

def check(d, out_html):
    probs = []
    ph = re.findall(r"【[^】]*】", out_html)
    if ph: probs.append(f"자리표시자 {len(ph)}개: " + ", ".join(sorted(set(ph))))
    body_only = re.sub(r"<style.*?</style>|<script.*?</script>|<!--.*?-->", "", out_html, flags=re.S)
    for ch, name in (("—", "em-dash"), ("–", "en-dash"), ("→", "화살표"), (" · ", "가운뎃점 나열")):
        n = body_only.count(ch)
        if n: probs.append(f"{name} {n}개")
    caps = re.findall(r">\s*[A-Z][A-Z ]{3,}\s*<", body_only)
    caps = [c for c in caps if "ALL RIGHTS" not in c and "PART" not in c]
    if caps: probs.append(f"영문 대문자 라벨: {caps[:5]}")
    if re.search("[🌀-🫿]", body_only): probs.append("이모지 있음")
    need = ["hero", "selfcheck", "reason", "reality", "diff", "toc", "honest", "faq", "price"]
    missing = [k for k in need if not d.get(k)]
    if missing: probs.append(f"필수 섹션 누락: {missing}")
    smp = sum(1 for i in (d.get('reviews') or {}).get('items', []) if i.get('sample'))
    if smp: print(f'참고: 임시 후기 {smp}개 (sample:true), 실제 후기로 바꾼 뒤 발행')
    btns = re.findall(r"class='btn[^']*' href='[^']*'>(.*?)</a>", out_html)
    btns = [re.sub(r"<.*?>", "", b).strip() for b in btns]
    long_btn = [b for b in btns if len(b) > 16]
    if long_btn: probs.append(f"버튼 16자 초과: {long_btn}")
    for k in ("h1",):
        h1 = d.get("hero", {}).get("h1", "")
        lines = h1.split("\n")
        if len(lines) > 3 or any(len(l) > 10 for l in lines): probs.append(f"h1 줄/글자 초과: {lines}")
    return probs

def preview(html_path, jpg_path):
    try:
        import asyncio
        from playwright.async_api import async_playwright
    except Exception:
        print("preview: playwright 없음, 건너뜀"); return
    async def run():
        async with async_playwright() as p:
            b = await p.chromium.launch(); pg = await b.new_page(viewport={"width": 400, "height": 900})
            await pg.goto("file:///" + os.path.abspath(html_path).replace("\\", "/")); await pg.wait_for_timeout(1500)
            await pg.evaluate("document.querySelectorAll('.rv').forEach(e=>e.classList.add('in'));document.querySelectorAll('.ratio').forEach(e=>e.classList.add('in'));document.querySelectorAll('.track').forEach(t=>t.style.animationPlayState='paused')")
            await pg.wait_for_timeout(600)
            await pg.screenshot(path=jpg_path, full_page=True, type="jpeg", quality=80)
            await b.close()
    asyncio.run(run()); print("preview:", jpg_path)

if __name__ == "__main__":
    a = sys.argv[1:]
    src = a[0]; out = a[1] if len(a) > 1 and not a[1].startswith("--") else os.path.splitext(src)[0] + ".html"
    pals = json.load(open(os.path.join(REF, "palettes.json"), encoding="utf-8"))
    d = json.load(open(src, encoding="utf-8"))
    p_id = a[a.index("--palette") + 1] if "--palette" in a else d["meta"].get("palette", "midnight-gold")
    if p_id not in pals: print("팔레트 없음:", p_id, "가능:", [k for k in pals if k != "_note"]); sys.exit(1)
    html_out = build(d, pals[p_id], p_id)
    open(out, "w", encoding="utf-8").write(html_out)
    print(f"[{p_id} {pals[p_id]['name']}] 생성: {out} ({len(html_out)//1024}KB)")
    if "--preview" in a: preview(out, os.path.splitext(out)[0] + "_preview.jpg")
    if "--check" in a:
        probs = check(d, html_out)
        print("check:", "통과" if not probs else "\n - " + "\n - ".join(probs))
        sys.exit(1 if probs else 0)
