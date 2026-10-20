// usage: node itch.cjs <slug> [uploadNameRegex outDir]
// Lists (or downloads) files of a free quaternius.itch.io page via itch's normal "no thanks, just download" flow.
const fs = require('fs');
const [slug, pick, outDir] = process.argv.slice(2);
const base = `https://quaternius.itch.io/${slug}`;
let cookie = '';
async function req(url, opt = {}) {
  const r = await fetch(url, { ...opt, redirect: 'manual', headers: { cookie, 'user-agent': 'Mozilla/5.0', ...(opt.headers || {}) } });
  const sc = r.headers.getSetCookie ? r.headers.getSetCookie() : [];
  sc.forEach((c) => { const kv = c.split(';')[0]; const k = kv.split('=')[0]; cookie = cookie.split('; ').filter((x) => x && !x.startsWith(k + '=')).concat(kv).join('; '); });
  return r;
}
(async () => {
  const page = await (await req(base)).text();
  const csrf = page.match(/name="csrf_token" value="([^"]+)"/)[1];
  const j = await (await req(base + '/download_url', { method: 'POST', body: new URLSearchParams({ csrf_token: csrf }) })).json();
  const dl = await (await req(j.url)).text();
  const key = j.url.split('/download/')[1];
  const csrf2 = (dl.match(/name="csrf_token" value="([^"]+)"/) || [])[1] || csrf;
  const ups = [...dl.matchAll(/data-upload_id="(\d+)"[\s\S]*?class="name"[^>]*>([\s\S]*?)<\/[\s\S]*?file_size"><span>([^<]+)/g)].map((m) => ({ id: m[1], name: (m[2].replace(/<[^>]*>/g, '').trim() || slug + '_' + m[1] + '.zip'), size: m[3] }));
  fs.writeFileSync(`dl_${slug}.html`, dl); if (!pick) { ups.forEach((u) => console.log(u.id, u.size, u.name)); if (!ups.length) fs.writeFileSync(`dl_${slug}.html`, dl); return; }
  const re = new RegExp(pick, 'i');
  for (const u of ups.filter((u) => re.test(u.name))) {
    const fr = await req(`${base}/file/${u.id}?key=${key}&source=game_download`, { method: 'POST', body: new URLSearchParams({ csrf_token: csrf2 }) }); const ft = await fr.text(); let f; try { f = JSON.parse(ft); } catch (e) { f = {}; } if (!f.url) { console.log('file resp', fr.status, ft.slice(0, 300)); continue; }
    const r = await fetch(f.url); const buf = Buffer.from(await r.arrayBuffer());
    fs.writeFileSync(`${outDir}/${u.name}`, buf); console.log('saved', u.name, (buf.length / 1e6).toFixed(1) + ' MB');
  }
})().catch((e) => { console.error('ERR', e.message); process.exit(1); });
