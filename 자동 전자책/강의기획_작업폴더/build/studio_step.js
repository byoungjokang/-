// usage: node step.js <name> '<json actions>'   actions: [["goto",path],["click",text],["fill",selector,text],["wait",ms]]
const { chromium } = require('playwright-core');
const fs = require('fs');
(async () => {
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium', args: ['--no-sandbox'], proxy: { server: process.env.HTTPS_PROXY } });
  const ctx = await b.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1.5, locale: 'ko-KR', storageState: fs.existsSync('state.json') ? 'state.json' : undefined });
  const p = await ctx.newPage();
  const name = process.argv[2];
  let i = 0;
  for (const a of JSON.parse(process.argv[3])) {
    i++;
    try {
      if (a[0] === 'goto') await p.goto('https://ebook-studio.preview.webdot.co.kr' + a[1], { waitUntil: 'networkidle', timeout: 30000 });
      if (a[0] === 'click') await p.getByText(a[1], { exact: false }).first().click({ timeout: 15000 });
      if (a[0] === 'clickrole') await p.getByRole('button', { name: a[1] }).first().click({ timeout: 15000 });
      if (a[0] === 'fill') await p.locator(a[1]).first().fill(a[2]);
      if (a[0] === 'fillnth') await p.locator(a[1]).nth(a[2]).fill(a[3]);
      if (a[0] === 'wait') await p.waitForTimeout(a[1]);
      if (a[0] === 'waitfor') await p.getByText(a[1]).first().waitFor({ timeout: a[2] || 600000 });
      if (a[0] === 'shot') await p.screenshot({ path: `${name}_${a[1]}.png`, fullPage: !!a[2] });
    } catch (e) { console.log('ERR', JSON.stringify(a), e.message.slice(0, 150)); }
  }
  await p.waitForTimeout(1500);
  await p.screenshot({ path: name + '.png' });
  await p.screenshot({ path: name + '_full.png', fullPage: true });
  console.log('URL', p.url());
  console.log((await p.innerText('main').catch(() => p.innerText('body'))).slice(0, 2500));
  const ctrls = await p.$$eval('input:not([type=hidden]),textarea,select,button', es => es.map(e => `${e.tagName} ${e.type || ''} [${(e.placeholder || e.innerText || e.value || '').trim().replace(/\s+/g,' ').slice(0, 60)}]${e.disabled ? ' (disabled)' : ''}`));
  console.log(ctrls.join('\n'));
  await ctx.storageState({ path: 'state.json' });
  await b.close();
})();
