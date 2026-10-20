// usage: node flow.cjs <outdir> [mobile]   real UI flow: start -> walk me there -> book -> begin -> ride
const { chromium } = require('playwright-core')  // devDependency of chronicle/;
const [out, mob] = process.argv.slice(2);
(async () => {
  const b = await chromium.launch({ channel: 'chrome', headless: true, args: ['--use-angle=d3d11', '--enable-gpu', '--ignore-gpu-blocklist', '--autoplay-policy=no-user-gesture-required'] });
  const ctx = await b.newContext(mob ? { viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true } : { viewport: { width: 1280, height: 720 } });
  const p = await ctx.newPage();
  const log = []; p.on('console', (m) => log.push(m.type() + ': ' + m.text())); p.on('pageerror', (e) => log.push('PAGEERR ' + e.message));
  const shot = (n) => p.screenshot({ path: `${out}/${n}.png` });
  const st = () => p.evaluate(() => ({ mode: __alaron.mode, t: +__alaron.audio.currentTime.toFixed(2), paused: __alaron.audio.paused, hint: document.getElementById('hint').innerText.slice(0, 80), lyric: document.getElementById('lyric').innerText, rowSit: !document.getElementById('rowSit').hidden, rowBook: !document.getElementById('rowBook').hidden }));
  const net = []; p.on('response', (r) => { if (/.(glb|mp3|jpg)$/.test(r.url())) net.push(r.url().split('/chronicle/').pop().split('5173/').pop()); });
  await p.goto('http://localhost:5173/'); await p.waitForFunction(() => window.__alaron, null, { timeout: 60000 }); await p.waitForTimeout(500); await shot('0-start'); console.log('at start loaded:', net.join(' '));
  await p.click('#go'); await p.waitForTimeout(1500); await shot('1-walk'); console.log('walk', await st(), 'coach:', await p.evaluate(() => document.getElementById('coach').classList.contains('on') ? document.getElementById('coach').innerText : '-'));
  // walk forward to the chair
  if (mob) { const bb = await p.locator('#walkpad').boundingBox(); await p.mouse.move(bb.x + bb.width / 2, bb.y + bb.height / 2); await p.mouse.down(); await p.waitForTimeout(2600); await p.mouse.up(); }
  else { await p.keyboard.down('KeyW'); await p.waitForTimeout(2600); await p.keyboard.up('KeyW'); }
  await p.waitForTimeout(400); await shot('2-near'); console.log('near', await st(), 'coach:', await p.evaluate(() => document.getElementById('coach').innerText));
  if (await p.locator('#bSit').isVisible()) await p.click('#bSit'); else await p.evaluate(() => __alaron.sit());
  await p.waitForTimeout(2500); await shot('3-book'); console.log('book', await st());
  if (await p.locator('#bNext').isEnabled()) { await p.click('#bNext'); await p.waitForTimeout(1500); await shot('3b-page2'); await p.click('#bPrev'); await p.waitForTimeout(1500); }
  console.log('before request:', net.length, 'files'); await p.click('#bBegin'); await p.waitForFunction(() => __alaron.mode === 'ride', null, { timeout: 60000 }); await p.waitForTimeout(6000); await shot('4-ride'); console.log('ride', await st());
  await p.evaluate(() => __alaron.seek(30)); await p.waitForTimeout(2500); await shot('5-ride30'); console.log('ride30', await st());
  await p.evaluate(() => __alaron.seek(355)); await p.waitForTimeout(5000); await shot('6-end'); console.log('end', await st());
  console.log(log.filter((l) => !l.includes('404')).slice(0, 20).join('\n'));
  await b.close();
})();
