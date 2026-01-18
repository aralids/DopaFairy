import bpy
import sys
import os
from pathlib import Path

# --- Parse CLI arguments ---
argv = sys.argv
argv = argv[argv.index("--") + 1:] if "--" in argv else []

if len(argv) != 2:
    print("Usage: blender --background --python load_cube.py -- <scale> <output_path>")
    sys.exit(1)

scale = float(argv[0])
output_path = Path(argv[1])

print(f"🧩 Loading cube with scale {scale}")
print(f"💾 Saving to: {output_path}")

# --- Clear scene ---
bpy.ops.object.select_all(action='SELECT')
bpy.ops.object.delete(use_global=False)

# --- Path to the .blend asset and internal object ---
blend_path = Path(r"C:\Users\PC\Desktop\DopaFairy\blender\cube.blend")
object_name = "Cube"

# --- Append object correctly ---
bpy.ops.wm.append(
    filepath=str(blend_path / "Object" / object_name),
    directory=str(blend_path / "Object") + os.sep,
    filename=object_name,
)

# --- Access and ensure object is in scene ---
obj = bpy.data.objects.get(object_name)
if not obj:
    raise RuntimeError(f"❌ Object '{object_name}' not found in {blend_path}")

if obj.name not in bpy.context.collection.objects:
    bpy.context.collection.objects.link(obj)

# --- Transform ---
bpy.context.view_layer.objects.active = obj
obj.select_set(True)

obj.scale = (scale, scale, scale)
obj.location = (0, 0, 0)
bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)

# --- Export as GLB ---
bpy.ops.export_scene.gltf(
    filepath=str(output_path),
    export_format='GLB'
)

print(f"✅ Cube exported successfully: {output_path}")
