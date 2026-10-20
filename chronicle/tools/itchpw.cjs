// usage: node itchpw.cjs <outDir> <slug>...   free "no thanks, just take me to the downloads" flow in headless Chrome
const { chromium } = require('playwright-core')  // devDependency of chronicle/;
const [out, ...slugs] = process.argv.slice(2);
(async () => {
  const b = await chromium.launch({ channel: 'chrome', headless: true });
  const ctx = await b.newContext({ acceptDownloads: true });
  for (const slug of slugs) {
    const p = await ctx.newPage();
    try {
      await p.goto(`https://quaternius.itch.io/${slug}`);
      const url = await p.evaluate(async () => {
        const csrf = document.querySelector('meta[name="csrf_token"]')?.content || document.querySelector('input[name="csrf_token"]')?.value;
        const r = await fetch(location.pathname + '/download_url', { method: 'POST', body: new URLSearchParams({ csrf_token: csrf }) });
        return (await r.json()).url;
      });
      await p.goto(url);
      const btn = p.locator('.upload .download_btn').first();
      const [dl] = await Promise.all([p.waitForEvent('download', { timeout: 600000 }), btn.click()]);
      const name = dl.suggestedFilename();
      await dl.saveAs(`${out}/${name}`);
      console.log('saved', slug, name);
    } catch (e) { console.log('FAIL', slug, e.message.split('\n')[0]); }
    await p.close();
  }
  await b.close();
})();
