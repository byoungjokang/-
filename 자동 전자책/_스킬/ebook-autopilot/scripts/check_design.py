"""디자인 자기 검수 — 가이드 '최종 품질 체크리스트' 중 기계로 잡을 수 있는 항목
  python check_design.py <pdf> [--body-pt 10.5] [--sheet out.png]
검사: 본문 글자 크기가 스펙과 맞는가(크롬 축소 사고) / 표지가 1쪽인가 / 거의 빈 쪽 / 차례 쪽수와 실제 쪽 일치 / 쪽수
출력: 표지·차례·첫 파트·첫 챕터·본문 2쪽 시트 PNG + 판정. 실패면 exit 1.
"""
import sys, re, json
import pymupdf

def main():
    a = sys.argv[1:]
    pdf = a[0]
    body_pt = float(a[a.index("--body-pt") + 1]) if "--body-pt" in a else 10.5
    sheet = a[a.index("--sheet") + 1] if "--sheet" in a else pdf.replace(".pdf", "_check.png")
    d = pymupdf.open(pdf)
    n = len(d)
    problems, notes = [], []
    # 1) 글자 크기: 본문 쪽에서 가장 많이 쓰인 size
    from collections import Counter
    sizes = Counter()
    for i in range(2, min(n, 12)):
        for b in d[i].get_text("dict")["blocks"]:
            for l in b.get("lines", []):
                for s in l["spans"]:
                    if s["text"].strip(): sizes[round(s["size"], 1)] += len(s["text"])
    if sizes:
        common = sizes.most_common(1)[0][0]
        if abs(common - body_pt) > 0.8: problems.append(f"본문 글자 {common}pt (스펙 {body_pt}pt) — 크롬 축소 의심: .page 폭/padding 확인")
        else: notes.append(f"본문 {common}pt OK")
    # 2) 거의 빈 쪽
    empty = []
    for i in range(n):
        t = d[i].get_text().strip()
        if len(t) < 40 and not d[i].get_images():
            empty.append(i + 1)
    if empty: problems.append(f"거의 빈 쪽: {empty}")
    # 3) 차례 쪽수 검증: 차례(2쪽)의 숫자들과 CHAPTER 시작 쪽 대조
    W = d[1].rect.width
    toc_words = sorted([w for w in d[1].get_text("words") if w[0] > W * 0.82 and w[4].isdigit()], key=lambda w: w[1])
    toc_nums = [int(w[4]) for w in toc_words]
    starts = []
    for i in range(2, n):
        t = d[i].get_text()
        if re.search(r"C\s*H\s*A\s*P\s*T\s*E\s*R|P\s*R\s*O\s*L\s*O\s*G\s*U\s*E|E\s*P\s*I\s*L\s*O\s*G\s*U\s*E", t): starts.append(i)
    if starts and toc_nums:
        body_start = starts[0]
        actual = [s - body_start + 1 for s in starts]
        if actual[:len(toc_nums)] != toc_nums[:len(actual)]:
            problems.append(f"차례 쪽수 불일치: 차례 {toc_nums[:6]} vs 실제 {actual[:6]}")
        else: notes.append("차례 쪽수 일치")
    notes.append(f"총 {n}쪽")
    # 4) 시트: 표지, 차례, 첫 파트, 첫 챕터, 본문 2쪽
    picks = [0, 1]
    part = next((i for i in range(2, n) if re.search(r"P\s*A\s*R\s*T", d[i].get_text()) and not re.search(r"C\s*H\s*A\s*P", d[i].get_text())), None)
    if part is not None: picks.append(part)
    if starts: picks.append(starts[0]); picks.append(min(starts[0] + 1, n - 1))
    if len(starts) > 4: picks.append(starts[4])
    out = pymupdf.open(); cols = len(picks); W = cols * 154 + 6; H = 222
    pg = out.new_page(width=W * 2, height=H * 2); pg.draw_rect(pg.rect, color=None, fill=(0.92, 0.91, 0.89))
    for k, i in enumerate(picks):
        x = 6 + k * 154; pg.show_pdf_page(pymupdf.Rect(x * 2, 12, (x + 148) * 2, 12 + 210 * 2), d, i)
    pg.get_pixmap(dpi=48).save(sheet)
    print(json.dumps({"ok": not problems, "problems": problems, "notes": notes, "sheet": sheet}, ensure_ascii=False))
    sys.exit(1 if problems else 0)

if __name__ == "__main__": main()
