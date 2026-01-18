import subprocess
from pathlib import Path
from fastapi import HTTPException
from app.core.config import BLENDER_EXEC, BLENDER_SCRIPTS_DIR, TEMP_DIR

def load_cube_glb(scale: float) -> Path:
    """Run Blender headless to generate a GLB sphere."""

    # Path where the sphere will be written
    output_path = TEMP_DIR / "cube.glb"

    # Path to the Blender Python script
    script_path = BLENDER_SCRIPTS_DIR / "load_cube.py"

    # Safety checks
    if not script_path.exists():
        raise HTTPException(status_code=500, detail=f"Script not found: {script_path}")
    if not Path(BLENDER_EXEC).exists():
        raise HTTPException(status_code=500, detail=f"Blender not found: {BLENDER_EXEC}")

    print(f"Running Blender from: {BLENDER_EXEC}")
    print(f"Using script: {script_path}")
    print(f"Saving output to: {output_path}")

    if not script_path.exists():
        print("AAA output_path: ", script_path)
    else:
        print("BBB output_path: ", script_path)
    
    try:
        result = subprocess.run(
            [
                BLENDER_EXEC,
                "--background",
                "--factory-startup",
                "--python-exit-code", "1",
                "--python", 
                str(script_path),
                "--",
                str(scale),
                str(output_path),
            ],
            check=True,
            capture_output=True,
            text=True,
        )

        print("BLENDER STDOUT:")
        print(result.stdout)
        print("BLENDER STDERR:")
        print(result.stderr)

    except subprocess.CalledProcessError as e:
        print("⚠️ Blender STDERR:", e.stderr)
        print("⚠️ Blender STDOUT:", e.stdout)
        raise HTTPException(
            status_code=500,
            detail=f"Blender failed — check server logs for details.",
        )

    if not output_path.exists():
        print("output_path: ", output_path)
        raise HTTPException(
            status_code=500,
            detail=f"Expected output file not found: {output_path}",
        )
    
    

    return output_path

def load_synapse_glb(scale: float) -> Path:
    """Run Blender headless to generate a GLB sphere."""

    # Path where the sphere will be written
    output_path = TEMP_DIR / "synapse.glb"

    # Path to the Blender Python script
    script_path = BLENDER_SCRIPTS_DIR / "load_synapse.py"

    # Safety checks
    if not script_path.exists():
        raise HTTPException(status_code=500, detail=f"Script not found: {script_path}")
    if not Path(BLENDER_EXEC).exists():
        raise HTTPException(status_code=500, detail=f"Blender not found: {BLENDER_EXEC}")

    print(f"Running Blender from: {BLENDER_EXEC}")
    print(f"Using script: {script_path}")
    print(f"Saving output to: {output_path}")

    if not script_path.exists():
        print("AAA output_path: ", script_path)
    else:
        print("BBB output_path: ", script_path)
    
    try:
        result = subprocess.run(
            [
                BLENDER_EXEC,
                "--background",
                "--factory-startup",
                "--python-exit-code", "1",
                "--python", 
                str(script_path),
                "--",
                str(scale),
                str(output_path),
            ],
            check=True,
            capture_output=True,
            text=True,
        )

        print("BLENDER STDOUT:")
        print(result.stdout)
        print("BLENDER STDERR:")
        print(result.stderr)

    except subprocess.CalledProcessError as e:
        print("⚠️ Blender STDERR:", e.stderr)
        print("⚠️ Blender STDOUT:", e.stdout)
        raise HTTPException(
            status_code=500,
            detail=f"Blender failed — check server logs for details.",
        )

    if not output_path.exists():
        print("output_path: ", output_path)
        raise HTTPException(
            status_code=500,
            detail=f"Expected output file not found: {output_path}",
        )
    
    

    return output_path

