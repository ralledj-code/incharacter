import bpy, sys
argv = sys.argv[sys.argv.index('--') + 1:]
bpy.ops.wm.open_mainfile(filepath=argv[0])
print('OBJECTS', [(o.name, o.type) for o in bpy.data.objects])
print('ACTIONS', [(a.name, round(a.frame_range[1] - a.frame_range[0])) for a in bpy.data.actions])
# push every action into NLA so the exporter writes them all
for o in []:
    if o.type == 'ARMATURE':
        o.animation_data_create()
        for a in bpy.data.actions:
            tr = o.animation_data.nla_tracks.new(); tr.name = a.name; tr.strips.new(a.name, int(a.frame_range[0]), a)
bpy.ops.export_scene.gltf(filepath=argv[1], export_format='GLB', export_animations=True, export_animation_mode='ACTIONS', export_apply=True)
