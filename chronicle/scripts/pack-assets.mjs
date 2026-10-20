// Packs selected CC0 Quaternius models into small .glb files for the web.
// usage: node scripts/pack-assets.mjs <packsDir>
//   packsDir = folder holding the extracted itch.io zips (see CLAUDE.md "Assets"). Raw packs are not committed.
// Output: ../public/chronicle/assets/<pack>.glb. Each model becomes one top-level node named by its key.
// Textures: 512px WebP; normal/ORM maps dropped (the scene uses flat Lambert shading).
import fs from 'node:fs';
import path from 'node:path';
import { NodeIO } from '@gltf-transform/core';
import { ALL_EXTENSIONS } from '@gltf-transform/extensions';
import { mergeDocuments, dedup, prune, textureCompress, weld, quantize, resample } from '@gltf-transform/functions';
import sharp from 'sharp';

const SRC = process.argv[2];
if (!SRC) { console.error('usage: node scripts/pack-assets.mjs <packsDir>'); process.exit(1); }
const OUT = '../public/chronicle/assets';
const NATURE = 'Stylized Nature MegaKit/glTF';
const PROPS = 'Fantasy Props MegaKit/Exports/glTF';
const VILLAGE = 'Medieval Village MegaKit/Medieval Village MegaKit[Standard]/glTF';

const PACKS = {
  nature: {
    size: 512,
    models: [
      ...['Pine_1', 'Pine_2', 'Pine_3', 'DeadTree_1', 'DeadTree_2', 'DeadTree_3', 'TwistedTree_1', 'TwistedTree_2', 'CommonTree_1', 'CommonTree_2',
        'Rock_Medium_1', 'Rock_Medium_2', 'Rock_Medium_3', 'Fern_1', 'Bush_Common', 'Grass_Common_Tall', 'Grass_Wispy_Tall', 'Mushroom_Common',
        'Pebble_Round_1', 'Pebble_Square_1'].map((k) => [k, `${NATURE}/${k}.gltf`])
    ]
  },
  village: {
    size: 512,
    models: ['Wall_Plaster_Straight', 'Wall_Plaster_Window_Wide_Round', 'Wall_Plaster_Door_Round', 'Wall_Plaster_WoodGrid', 'Wall_UnevenBrick_Straight',
      'Wall_UnevenBrick_Window_Wide_Round', 'Wall_UnevenBrick_Door_Round', 'Corner_Exterior_Wood', 'Corner_Exterior_Brick',
      'Roof_RoundTiles_4x4', 'Roof_RoundTiles_4x6', 'Roof_RoundTiles_6x4', 'Roof_RoundTiles_6x6', 'Roof_Front_Brick4', 'Roof_Front_Brick6',
      'Window_Wide_Round1', 'WindowShutters_Wide_Round_Open', 'Door_1_Round', 'Prop_Chimney'].map((k) => [k, `${VILLAGE}/${k}.gltf`])
  },
  props: {
    size: 512,
    models: [
      ...['Table_Large', 'Stool', 'Chair_1', 'Bench', 'Barrel', 'Barrel_Holder', 'Mug', 'Chalice', 'CandleStick', 'CandleStick_Triple', 'Candle_1',
        'Chandelier', 'Lantern_Wall', 'Bookcase_2', 'BookGroup_Medium_1', 'Book_Stack_1', 'Shelf_Small_Bottles', 'SmallBottles_1', 'Bottle_1',
        'Crate_Wooden', 'Chest_Wood', 'Banner_1', 'Banner_2', 'Chain_Coil', 'Cauldron', 'Torch_Metal', 'Stall_Empty', 'Stall_Cart_Empty',
        'Shield_Wooden', 'Sword_Bronze', 'WeaponStand', 'BookStand', 'Scroll_1', 'Coin_Pile', 'Potion_1', 'Vase_2', 'Bucket_Wooden_1', 'Pot_1'].map((k) => [k, `${PROPS}/${k}.gltf`]),
      ...['Prop_Wagon', 'Prop_WoodenFence_Single', 'Prop_WoodenFence_Extension1', 'Prop_Crate'].map((k) => [k, `${VILLAGE}/${k}.gltf`])
    ]
  }
};

// Character parts: one glb each (bone names must stay identical across files so one clip drives every part).
const UBC = 'Universal Base Characters/Universal Base Characters[Standard]';
const OUTF = 'Modular Character Outfits - Fantasy/Modular Character Outfits - Fantasy[Standard]/Exports/glTF (Godot-Unreal)/Outfits';
const HAIR = `${UBC}/Hairstyles/Rigged to Head Bone/glTF (Godot -Unreal)`;
const CHARS = {
  body_m: `${UBC}/Base Characters/Godot - UE/Superhero_Male_FullBody.gltf`,
  ranger_m: `${OUTF}/Male_Ranger.gltf`, peasant_m: `${OUTF}/Male_Peasant.gltf`,
  hair_long: `${HAIR}/Hair_Long.gltf`, hair_beard: `${HAIR}/Hair_Beard.gltf`,
  body_f: `${UBC}/Base Characters/Godot - UE/Superhero_Female_FullBody.gltf`,
  ranger_f: `${OUTF}/Female_Ranger.gltf`, peasant_f: `${OUTF}/Female_Peasant.gltf`,
  hair_buns: `${HAIR}/Hair_Buns.gltf`, hair_parted: `${HAIR}/Hair_SimpleParted.gltf`, hair_buzzed: `${HAIR}/Hair_Buzzed.gltf`, hair_buzzed_f: `${HAIR}/Hair_BuzzedFemale.gltf`
};
const ANIMS = { file: 'Universal Animation Library/Universal Animation Library[Standard]/Unreal-Godot/UAL1_Standard.glb',
  keep: ['Idle_Loop', 'Walk_Loop', 'Sitting_Idle_Loop', 'Crouch_Idle_Loop', 'Dance_Loop',
    'Spell_Simple_Idle_Loop', 'Sword_Idle', 'Idle_Talking_Loop', 'Walk_Formal_Loop', 'Idle_Torch_Loop', 'Fixing_Kneeling', 'Jog_Fwd_Loop', 'Sprint_Loop'] };

const io = new NodeIO().registerExtensions(ALL_EXTENSIONS);
fs.mkdirSync(OUT, { recursive: true });
const only = process.argv[3];

for (const [name, pack] of Object.entries(PACKS)) {
  if (only && only !== name) continue;
  const doc = await io.read(path.join(SRC, pack.models[0][1]));
  const root = doc.getRoot();
  let scenes = [[pack.models[0][0], root.listScenes()[0]]];
  for (const [key, file] of pack.models.slice(1)) {
    const before = new Set(root.listScenes());
    mergeDocuments(doc, await io.read(path.join(SRC, file)));
    scenes.push([key, root.listScenes().find((s) => !before.has(s))]);
  }
  // one scene, one named group per model
  const main = scenes[0][1];
  const kids0 = main.listChildren();
  const g0 = doc.createNode(scenes[0][0]); kids0.forEach((n) => { main.removeChild(n); g0.addChild(n); }); main.addChild(g0);
  for (const [key, sc] of scenes.slice(1)) {
    const g = doc.createNode(key); sc.listChildren().forEach((n) => { sc.removeChild(n); g.addChild(n); }); main.addChild(g); sc.dispose();
  }
  root.setDefaultScene(main);
  // single buffer, no normal/ORM maps
  const buf = root.listBuffers()[0];
  root.listAccessors().forEach((a) => a.setBuffer(buf));
  root.listBuffers().slice(1).forEach((b) => b.dispose());
  root.listMaterials().forEach((m) => {
    m.setNormalTexture(null); m.setOcclusionTexture(null); m.setMetallicRoughnessTexture(null); m.setEmissiveTexture(null);
    m.setMetallicFactor(0); m.setRoughnessFactor(1);
  });
  await doc.transform(prune(), dedup(), weld(), quantize(), textureCompress({ encoder: sharp, targetFormat: 'webp', resize: [pack.size, pack.size], quality: 80 }));
  const file = path.join(OUT, `${name}.glb`);
  await io.write(file, doc);
  console.log(name, (fs.statSync(file).size / 1024).toFixed(0) + ' KB', pack.models.length + ' models');
}

if (!only || only === 'chars') {
  fs.mkdirSync(`${OUT}/chars`, { recursive: true });
  for (const [key, file] of Object.entries(CHARS)) {
    const doc = await io.read(path.join(SRC, file)), root = doc.getRoot();
    root.listMaterials().forEach((m) => { m.setNormalTexture(null); m.setOcclusionTexture(null); m.setMetallicRoughnessTexture(null); m.setMetallicFactor(0); m.setRoughnessFactor(1); });
    root.listAnimations().forEach((a) => a.dispose());
    await doc.transform(prune(), dedup(), textureCompress({ encoder: sharp, targetFormat: 'webp', resize: [512, 512], quality: 80 }));
    const f = `${OUT}/chars/${key}.glb`; await io.write(f, doc); console.log(key, (fs.statSync(f).size / 1024).toFixed(0) + ' KB');
  }
  // animations only: drop the mannequin mesh, keep the bone nodes the clips target
  const doc = await io.read(path.join(SRC, ANIMS.file)), root = doc.getRoot();
  root.listAnimations().forEach((a) => { if (!ANIMS.keep.includes(a.getName())) a.dispose(); });
  root.listNodes().forEach((n) => { n.setMesh(null); n.setSkin(null); });
  root.listMeshes().forEach((m) => m.dispose()); root.listSkins().forEach((s) => s.dispose());
  // finger tracks are invisible at ride distance; drop them, then thin out linear keys
  root.listAnimations().forEach((a) => a.listChannels().forEach((c) => {
    const n = c.getTargetNode(); if (n && /^(index|middle|pinky|ring|thumb)_/.test(n.getName())) { const smp = c.getSampler(); c.dispose(); if (smp) smp.dispose(); }
  }));
  await doc.transform(resample({ tolerance: 5e-3 }), prune({ keepLeaves: true }), dedup());
  // prune leaves the old clips' accessors behind here; drop every accessor no remaining sampler uses
  const used = new Set(); root.listAnimations().forEach((a) => a.listSamplers().forEach((smp) => { used.add(smp.getInput()); used.add(smp.getOutput()); }));
  root.listAccessors().forEach((acc) => { if (!used.has(acc)) acc.dispose(); });
  const f = `${OUT}/chars/anims.glb`; await io.write(f, doc); console.log('anims', (fs.statSync(f).size / 1024).toFixed(0) + ' KB', root.listAnimations().length + ' clips');
}

// Creatures and single props from other CC0 sources (Poly Pizza Quaternius glbs; FBX packs converted with three's
// FBXLoader -> GLTFExporter, see LEVELS.md). One glb each; clip names lose their "Armature|" prefix, duplicates dropped.
const CREATURES = { wolf: 'pp/wolf_a.glb', dragon: 'pp/dragon.glb', bat: 'pp/bat.glb', lute: 'pp/lute.glb', demon: 'pp/demon.glb' };
if (!only || only === 'creatures') {
  fs.mkdirSync(`${OUT}/creatures`, { recursive: true });
  for (const [key, file] of Object.entries(CREATURES)) {
    const doc = await io.read(path.join(SRC, '..', file)), root = doc.getRoot(), seen = new Set();
    root.listAnimations().forEach((a) => { const n = a.getName().split('|').pop(); if (seen.has(n)) a.dispose(); else { seen.add(n); a.setName(n); } });
    root.listMaterials().forEach((m) => { m.setNormalTexture(null); m.setOcclusionTexture(null); m.setMetallicRoughnessTexture(null); m.setMetallicFactor(0); m.setRoughnessFactor(1); });
    await doc.transform(resample({ tolerance: 2e-3 }), prune(), dedup(), textureCompress({ encoder: sharp, targetFormat: 'webp', resize: [512, 512], quality: 80 }));
    const used = new Set(); root.listAccessors().forEach((acc) => { if (acc.listParents().some((p) => p.propertyType !== 'Root')) used.add(acc); });
    root.listAccessors().forEach((acc) => { if (!used.has(acc)) acc.dispose(); });
    const f = `${OUT}/creatures/${key}.glb`; await io.write(f, doc);
    console.log(key, (fs.statSync(f).size / 1024).toFixed(0) + ' KB', [...seen].join(','));
  }
}
