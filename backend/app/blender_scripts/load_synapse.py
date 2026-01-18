import bpy
import sys
import os
from pathlib import Path

# --- Parse CLI arguments ---
argv = sys.argv
argv = argv[argv.index("--") + 1:] if "--" in argv else []

if len(argv) != 2:
    print("Usage: blender --background --python load_synapse.py -- <scale> <output_path>")
    sys.exit(1)

scale = float(argv[0])
output_path = Path(argv[1])

print(f"🧩 Loading synapse with scale {scale}")
print(f"💾 Saving to: {output_path}")

# --- Clear scene ---
bpy.ops.object.select_all(action='SELECT')
bpy.ops.object.delete(use_global=False)

# --- Path to the .blend asset and internal object ---
blend_path = Path(r"C:\Users\PC\Desktop\DopaFairy\blender\synapse.blend")
object_names = ["Presynapse", "Postsynapse", "Transporter"]

# --- Append object correctly ---
directory = str(blend_path) + r"\Object\\"

for object_name in object_names:
    if not object_name:
        print(f"❌ Not found after append: {object_name}")
        continue

    bpy.ops.wm.append(
        directory=directory,
        filename=object_name,
    )

'''
# --- Append fairy as a COLLECTION ---
collection_name = "MaoFairy"  # ← the collection name, not the armature name
directory = str(blend_path) + r"\Collection\\"

bpy.ops.wm.append(
    directory=directory,
    filename=collection_name,
)
'''


# --- Export as GLB ---
bpy.ops.export_scene.gltf(
    filepath=str(output_path),
    export_format='GLB'
)

print(f"✅ Synapse exported successfully: {output_path}")
