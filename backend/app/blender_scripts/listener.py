import bpy
from pathlib import Path

COMMAND_FILE = Path("backend/commands/command.txt")

PROJECT_ROOT = Path(__file__).resolve().parents[2]
BLEND_FILE = PROJECT_ROOT / "blender" / "cube.blend"
OBJ_NAME = "Cube"

BLEND_FRAMES = 15

print("LISTENER STARTED")
print("BLEND FILE PATH:", BLEND_FILE)
print("BLEND FILE EXISTS:", BLEND_FILE.exists())

def smooth_switch(target_strip):
    obj = bpy.data.objects.get(OBJ_NAME)
    if not obj or not obj.animation_data:
        return

    frame = bpy.context.scene.frame_current

    for track in obj.animation_data.nla_tracks:
        for strip in track.strips:
            if strip.name == target_strip:
                strip.influence = 0
                strip.keyframe_insert("influence", frame=frame)
                strip.influence = 1
                strip.keyframe_insert("influence", frame=frame + BLEND_FRAMES)
            else:
                strip.influence = 1
                strip.keyframe_insert("influence", frame=frame)
                strip.influence = 0
                strip.keyframe_insert("influence", frame=frame + BLEND_FRAMES)

def frame_handler(scene):
    if not COMMAND_FILE.exists():
        return

    command = COMMAND_FILE.read_text().strip()
    COMMAND_FILE.unlink()

    if command == "bounce":
        smooth_switch("Bounce")
    elif command == "slide":
        smooth_switch("Slide")

def register():
    bpy.app.handlers.frame_change_post.append(frame_handler)

register()
