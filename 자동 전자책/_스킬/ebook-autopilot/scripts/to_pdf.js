#!/usr/bin/env node
/**
 * docx → pdf (LibreOffice headless) + 페이지 미리보기 PNG (PyMuPDF 있을 때)
 *   node to_pdf.js <입력.docx> [--outdir <폴더>] [--preview]
 * 출력: 같은 이름의 .pdf, --preview 시 <이름>_sheet.png (전체 페이지 축소판)
 */
const fs = require('fs');
const path = require('path');
const { execFileSync, spawnSync } = require('child_process');

const args = process.argv.slice(2);
const src = args[0];
if (!src || !fs.existsSync(src)) { console.error('사용법: node to_pdf.js <입력.docx> [--outdir 폴더] [--preview]'); process.exit(1); }
const oIdx = args.indexOf('--outdir');
const outdir = oIdx >= 0 ? args[oIdx + 1] : path.dirname(path.resolve(src));
const preview = args.includes('--preview');

const candidates = [
  process.env.SOFFICE,
  'C:/Program Files/LibreOffice/program/soffice.exe',
  'C:/Program Files (x86)/LibreOffice/program/soffice.exe',
  '/Applications/LibreOffice.app/Contents/MacOS/soffice',
  '/usr/bin/soffice', '/usr/bin/libreoffice', 'soffice',
].filter(Boolean);
let soffice = null;
for (const c of candidates) {
  if (c.includes('/') || c.includes('\\')) { if (fs.existsSync(c)) { soffice = c; break; } }
  else { const r = spawnSync(c, ['--version'], { stdio: 'ignore' }); if (r.status === 0) { soffice = c; break; } }
}
if (!soffice) { console.error('LibreOffice(soffice) 를 찾지 못했습니다. 설치 후 SOFFICE 환경변수로 경로 지정 가능. (Word 에서 "PDF로 저장"으로 대체 가능)'); process.exit(2); }

fs.mkdirSync(outdir, { recursive: true });
execFileSync(soffice, ['--headless', '--convert-to', 'pdf', '--outdir', outdir, path.resolve(src)], { stdio: 'ignore', timeout: 180000 });
const pdf = path.join(outdir, path.basename(src).replace(/\.docx$/i, '.pdf'));
if (!fs.existsSync(pdf)) { console.error('PDF 변환 실패'); process.exit(3); }
console.log(`PDF: ${pdf}`);

if (preview) {
  const py = `
import sys, math
try:
    import pymupdf
except ImportError:
    print('pymupdf 없음 — pip install pymupdf'); sys.exit(0)
pdf, out = sys.argv[1], sys.argv[2]
doc = pymupdf.open(pdf); n = len(doc); cols = 4; rows = math.ceil(n / cols)
w, h = int(595 * 0.28), int(842 * 0.28)
sheet = pymupdf.open(); page = sheet.new_page(width=cols * w + (cols + 1) * 8, height=rows * h + (rows + 1) * 8)
for i in range(n):
    pix = doc[i].get_pixmap(matrix=pymupdf.Matrix(1.2, 1.2)); r, c = divmod(i, cols)
    page.insert_image(pymupdf.Rect(8 + c * (w + 8), 8 + r * (h + 8), 8 + c * (w + 8) + w, 8 + r * (h + 8) + h), pixmap=pix)
page.get_pixmap(matrix=pymupdf.Matrix(1.6, 1.6)).save(out)
print(f'미리보기: {out} ({n}p)')
`;
  const sheet = pdf.replace(/\.pdf$/i, '_sheet.png');
  const r = spawnSync('python', ['-c', py, pdf, sheet], { encoding: 'utf8', env: { ...process.env, PYTHONIOENCODING: 'utf-8' } });
  process.stdout.write(r.stdout || ''); if (r.stderr && r.status !== 0) process.stderr.write(r.stderr);
}
