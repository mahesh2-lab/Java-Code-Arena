import os
import sys
import platform
import subprocess
import json
import tempfile
import shutil
from pathlib import Path
from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS

# Create Flask app with proper static folder configuration
app = Flask(__name__, static_folder='dist', static_url_path='')
CORS(app)

# Detect OS
SYSTEM = platform.system()
IS_WINDOWS = SYSTEM == "Windows"
IS_LINUX = SYSTEM == "Linux"
IS_MAC = SYSTEM == "Darwin"

# Global Java paths
JAVA_PATH = None
JAVAC_PATH = None
JAVA_AVAILABLE = False  # Cache the result

print(f"Java Compiler Server - Detected OS: {SYSTEM}")


def find_java():
    """Find java and javac executables"""
    global JAVA_PATH, JAVAC_PATH

    if IS_WINDOWS:
        # First try shutil.which (standard PATH)
        javac = shutil.which("javac")
        java = shutil.which("java")

        if javac and java:
            JAVA_PATH = java
            JAVAC_PATH = javac
            return True

        # Search Program Files for JDK installations
        search_dirs = [
            "C:\\Program Files\\Java",
            "C:\\Program Files (x86)\\Java",
            "C:\\Program Files\\OpenLogic",
        ]

        for search_dir in search_dirs:
            try:
                if os.path.exists(search_dir):
                    for jdk_dir in os.listdir(search_dir):
                        bin_path = os.path.join(search_dir, jdk_dir, "bin")
                        javac_exe = os.path.join(bin_path, "javac.exe")
                        java_exe = os.path.join(bin_path, "java.exe")

                        if os.path.exists(javac_exe) and os.path.exists(java_exe):
                            JAVA_PATH = java_exe
                            JAVAC_PATH = javac_exe
                            print(f"[OK] Found Java at: {JAVA_PATH}")
                            return True
            except Exception as e:
                print(f"  Error searching {search_dir}: {e}")
                continue

        return False
    else:  # Linux/Mac
        javac = shutil.which("javac")
        java = shutil.which("java")

        if javac and java:
            JAVA_PATH = java
            JAVAC_PATH = javac
            return True

        # Try common Linux/Mac paths
        for bin_path in ["/usr/bin", "/usr/local/bin", "/opt/java/bin"]:
            javac_path = os.path.join(bin_path, "javac")
            java_path = os.path.join(bin_path, "java")
            if os.path.exists(javac_path) and os.path.exists(java_path):
                JAVA_PATH = java_path
                JAVAC_PATH = javac_path
                return True

        return False


def compile_java(source_code):
    """Compile Java source code"""
    if not find_java():
        return {"success": False, "error": "Java compiler (javac) not found on this system"}

    try:
        # Create temporary directory
        temp_dir = tempfile.mkdtemp()
        source_file = Path(temp_dir) / "Main.java"

        # Write source code to file
        source_file.write_text(source_code)

        # Compile using detected Java path
        compile_cmd = [JAVAC_PATH, str(source_file)]
        result = subprocess.run(
            compile_cmd,
            capture_output=True,
            text=True,
            cwd=temp_dir
        )

        if result.returncode != 0:
            return {
                "success": False,
                "error": result.stderr or "Compilation failed"
            }

        # Run the compiled class using detected Java path
        run_cmd = [JAVA_PATH, "-cp", temp_dir, "Main"]
        result = subprocess.run(
            run_cmd,
            capture_output=True,
            text=True,
            timeout=10,
            cwd=temp_dir
        )

        output = result.stdout
        error = result.stderr

        # Cleanup
        shutil.rmtree(temp_dir)

        return {
            "success": True,
            "output": output,
            "error": error,
            "os": SYSTEM
        }

    except subprocess.TimeoutExpired:
        return {"success": False, "error": "Execution timeout (10s limit)"}
    except Exception as e:
        return {"success": False, "error": str(e)}

# API Routes


@app.route("/api/health", methods=["GET"])
def health():
    """Health check endpoint"""
    return jsonify({
        "status": "ok",
        "os": SYSTEM,
        "java_available": JAVA_AVAILABLE,
        "is_windows": IS_WINDOWS,
        "is_linux": IS_LINUX,
    })


@app.route("/api/compile", methods=["POST"])
def compile_endpoint():
    """Compile Java source code"""
    try:
        data = request.get_json()
        source_code = data.get("code", "")

        if not source_code:
            return jsonify({"success": False, "error": "No code provided"}), 400

        result = compile_java(source_code)
        return jsonify(result)

    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500


@app.route("/api/info", methods=["GET"])
def info():
    """Get server information"""
    return jsonify({
        "name": "Java Compiler Server",
        "os": SYSTEM,
        "is_windows": IS_WINDOWS,
        "is_linux": IS_LINUX,
        "is_mac": IS_MAC,
        "java_available": JAVA_AVAILABLE,
        "python_version": f"{sys.version_info.major}.{sys.version_info.minor}"
    })

# Serve React static files


@app.route("/", defaults={"path": ""})
@app.route("/<path:path>")
def serve(path):
    """Serve React static files or index.html for SPA routing"""
    if path != "" and os.path.exists(os.path.join(app.static_folder, path)):  # type: ignore
        # pyright: ignore[reportArgumentType]
        return send_from_directory(app.static_folder, path)
    else:
        # Return index.html for SPA routing
        index_path = os.path.join(
            app.static_folder, "index.html")  # type: ignore
        if os.path.exists(index_path):
            # type: ignore
            return send_from_directory(app.static_folder, "index.html")
        else:
            return jsonify({
                "error": "Frontend not built yet",
                "message": "Run 'npm run build' to build the React frontend first"
            }), 404


if __name__ == "__main__":
    # Check if dist folder exists
    if not os.path.exists("dist"):
        print("\nFrontend not built yet!")
        print("Run this first: npm run build")
        print("Then start the server again with: python server.py\n")
        sys.exit(1)

    # Find and cache Java availability
    JAVA_AVAILABLE = find_java()
    if not JAVA_AVAILABLE:
        print("WARNING: Java compiler (javac) not found!")
        print("Please install Java Development Kit (JDK)")
    else:
        print("[OK] Java compiler found and ready")

    print("Starting unified server on http://localhost:5000")
    print("Serving React frontend + Java Compiler API\n")
    app.run(debug=False, host="0.0.0.0", port=5000)
