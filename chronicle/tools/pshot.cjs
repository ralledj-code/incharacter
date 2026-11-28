// Frames (and optionally an mp4 with the song) of a painted level, headless.
// usage: node tools/pshot.cjs <outDir> "<t,t,...>" [w h]          stills at song times
//        node tools/pshot.cjs <outDir> video <t0> <t1> [fps w h]   frames + <outDir>/video.mp4 (ffmpeg, song muxed in)
// Serve first: npx serve -l 5173 ../public/chronicle, or set NO_SERVER=1 (files answered from disk). Env LEVEL=<id> (default first-steps).
// The CDN scripts are answered from node_modules, so it runs without internet.
const fs = require('fs'), path = require('path'), { execFileSync } = require('child_process');
let pw; try { pw = require('playwright'); } catch (e) { pw = require('playwright-core'); }
const args = process.argv.slice(2), out = args[0], isVideo = args[1] === 'video';
const [t0, t1, fps = 24, w = 1280, h = 720] = isVideo ? args.slice(2).map(Number) : [0, 0, 0, +(args[2] || 1280), +(args[3] || 720)];
const level = process.env.LEVEL || 'first-steps';
const LOCAL = {
  'three.min.js': 'node_modules/three/build/three.min.js',
};
(async () => {
  fs.mkdirSync(out, { recursive: true });
  const b = await pw.chromium.launch({ headless: true, args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  const p = await b.newPage({ viewport: { width: w, height: h } });
  await p.route(/cdnjs\.cloudflare\.com|cdn\.jsdelivr\.net/, (r) => { const f = Object.keys(LOCAL).find((k) => r.request().url().endsWith(k)); return f ? r.fulfill({ path: LOCAL[f], contentType: 'text/javascript' }) : r.abort(); });
  await p.route(/fonts\.(googleapis|gstatic)\.com/, (r) => r.abort());
  const errs = []; p.on('console', (m) => { if (m.type() === 'error') errs.push(m.text()); }); p.on('pageerror', (e) => errs.push('PAGEERR ' + e.message));
  if (process.env.NO_SERVER) {  // answer http://localhost:5173 from ../public/chronicle directly (no `npx serve` needed)
    const root = path.resolve('../public/chronicle'), T = { '.html': 'text/html', '.js': 'text/javascript', '.json': 'application/json', '.webp': 'image/webp', '.png': 'image/png', '.jpg': 'image/jpeg', '.mp3': 'audio/mpeg', '.mp4': 'video/mp4', '.css': 'text/css' };
    await p.route(/^http:\/\/localhost:5173\//, (r) => { let u = decodeURIComponent(new URL(r.request().url()).pathname); if (u.endsWith('/')) u += 'index.html'; const f = path.join(root, u);
      if (!f.startsWith(root) || !fs.existsSync(f)) return r.fulfill({ status: 404, body: '' }); return r.fulfill({ status: 200, contentType: T[path.extname(f)] || 'application/octet-stream', body: fs.readFileSync(f) }); });
  }
  await p.goto('http://localhost:5173/?painted'); await p.waitForFunction(() => window.__alaron, null, { timeout: 120000 });
  const ok = await p.evaluate(async (id) => {
    const A = __alaron, st = __cw.stories.find((s) => s.id === id); if (!st || !st.painted) return false;
    await A.dev.painted.preload(st); A.dev.play(st); ['hud', 'player', 'start'].forEach((k) => { document.getElementById(k).style.display = 'none'; }); return true;
  }, level);
  if (!ok) { console.error('level', level, 'is not painted'); process.exit(1); }
  const shoot = async (t, file) => {
    await p.evaluate(async (t) => { const A = __alaron; await A.dev.painted.ensure(t); A.dev.hold = { mode: 'ride', t, time: t }; A.dev.shot(A.dev.hold); }, t);
    await p.screenshot({ path: file });
  };
  if (!isVideo) {
    for (const t of args[1].split(',').map(Number)) { await shoot(t, `${out}/${t.toFixed(1).padStart(6, '0')}.png`); process.stdout.write('.'); }
  } else {
    const n = Math.round((t1 - t0) * fps);
    if (process.env.PIPE) {  // stream the frames straight into the encoder (no PNGs on disk; a 1080p minute is ~6 GB of PNG)
      const { spawn } = require('child_process');
      const enc = spawn('ffmpeg', ['-y', '-loglevel', 'error', '-f', 'image2pipe', '-framerate', String(fps), '-c:v', 'png', '-i', '-',
        '-c:v', 'libx264', '-preset', 'slow', '-crf', process.env.CRF || '16', '-pix_fmt', 'yuv420p', `${out}/frames.mp4`], { stdio: ['pipe', 'inherit', 'inherit'] });
      for (let i = 0; i < n; i++) {
        const t = t0 + i / fps;
        await p.evaluate(async (t) => { const A = __alaron; await A.dev.painted.ensure(t); A.dev.hold = { mode: 'ride', t, time: t }; A.dev.shot(A.dev.hold); }, t);
        const buf = await p.screenshot({ type: 'png' });
        if (!enc.stdin.write(buf)) await new Promise((r) => enc.stdin.once('drain', r));
        if (i % 30 === 0) process.stdout.write(` ${t.toFixed(0)}s`);
      }
      enc.stdin.end(); await new Promise((r) => enc.on('close', r));
      console.log('\n' + out + '/frames.mp4 (silent)'); await b.close(); return;
    }
    for (let i = 0; i < n; i++) { await shoot(t0 + i / fps, `${out}/f${String(i).padStart(5, '0')}.png`); if (i % 24 === 0) process.stdout.write(` ${(t0 + i / fps).toFixed(0)}s`); }
    const song = await p.evaluate((id) => __cw.stories.find((s) => s.id === id).audio, level);
    execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-framerate', String(fps), '-i', `${out}/f%05d.png`, '-ss', String(t0), '-t', String(t1 - t0), '-i', path.join('../public/chronicle', song),
      '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-crf', process.env.CRF || '24', '-preset', 'medium', '-c:a', 'aac', '-b:a', '160k', '-shortest', `${out}/video.mp4`]);
    console.log('\n' + out + '/video.mp4', (fs.statSync(`${out}/video.mp4`).size / 1e6).toFixed(1), 'MB');
  }
  if (errs.length) console.log('\n' + errs.slice(0, 20).join('\n'));
  await b.close();
})();
