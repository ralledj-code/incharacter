// usage: node fbx2glb.cjs <in.fbx> <out.glb>   (three r128 FBXLoader -> GLTFExporter in headless Chrome, keeps animations)
const fs = require('fs');
const { chromium } = require('playwright-core')  // devDependency of chronicle/;
const [inp, out] = process.argv.slice(2);
(async () => {
  const b = await chromium.launch({ channel: 'chrome', headless: true }); const p = await b.newPage();
  p.on('console', (m) => { if (m.type() === 'error') console.log('ERR', m.text()); });
  await p.setContent('<html><body></body></html>');
  for (const u of ['https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js', 'https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/libs/fflate.min.js',
    'https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/loaders/FBXLoader.js', 'https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/exporters/GLTFExporter.js']) await p.addScriptTag({ url: u });
  const b64 = fs.readFileSync(inp).toString('base64');
  const res = await p.evaluate(async (b64) => {
    const buf = Uint8Array.from(atob(b64), (c) => c.charCodeAt(0)).buffer;
    const obj = new THREE.FBXLoader().parse(buf, '');
    obj.traverse((o) => { if (o.material) [].concat(o.material).forEach((m) => { m.map = null; }); });  // FBX packs here use flat material colours
    const glb = await new Promise((r) => new THREE.GLTFExporter().parse(obj, r, { binary: true, animations: obj.animations, onlyVisible: false }));
    let s = ''; const u8 = new Uint8Array(glb); for (let i = 0; i < u8.length; i += 0x8000) s += String.fromCharCode.apply(null, u8.subarray(i, i + 0x8000));
    return { b64: btoa(s), anims: obj.animations.map((a) => a.name + ':' + a.duration.toFixed(1)), meshes: (() => { let n = 0; obj.traverse((o) => { if (o.isMesh) n++; }); return n; })() };
  }, b64);
  fs.writeFileSync(out, Buffer.from(res.b64, 'base64'));
  console.log(out.split(/[\\/]/).pop(), 'meshes', res.meshes, 'anims', res.anims.join(' '));
  await b.close();
})();
