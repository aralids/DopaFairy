from pathlib import Path
import os
import tempfile

# Base directory of your backend package
BASE_DIR = Path(__file__).resolve().parent.parent.parent  # one level higher (to backend/)
# You can now build paths like BASE_DIR / "app" / "blender_scripts"

# System temp directory (override via env var if needed)
TEMP_DIR = Path(os.getenv("TEMP_DIR") or tempfile.gettempdir())

# Blender executable (allow custom path via env var)
BLENDER_EXEC = r"C:\Program Files\Blender Foundation\Blender 4.3\blender.exe"

# Optional: path to your Blender scripts
BLENDER_SCRIPTS_DIR = BASE_DIR / "app" / "blender_scripts"