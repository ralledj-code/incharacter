// Packs selected CC0 Quaternius models into small .glb files for the web.
// usage: node scripts/pack-assets.mjs <packsDir>
//   packsDir = folder holding the extracted itch.io zips (see CLAUDE.md "Assets"). Raw packs are not committed.
// Output: ../public/chronicle/assets/<pack>.glb. Each model becomes one top-level node named by its key.
// Textures: 512px WebP; normal/ORM maps dropped (the scene uses flat Lambert shading).
import fs from 'node:fs';
import path from 'node:path';
import { NodeIO } from '@gltf-transform/core';
import { ALL_EXTENSIONS } from '@gltf-transform/extensions';
import { mergeDocuments, dedup, prune, textureCompress, weld, quantize } from '@gltf-transform/functions';
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
