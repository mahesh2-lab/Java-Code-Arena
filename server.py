import os
import sys
import platform
import subprocess
import json
import tempfile
import shutil
import time
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


def compile_java(source_code, stdin_input=""):
    """Compile and run Java source code with optional stdin input"""
    if not find_java():
        print("[ERROR] Java compiler (javac) not found")
        return {"success": False, "error": "Java compiler (javac) not found on this system"}

    try:
        # Create temporary directory
        temp_dir = tempfile.mkdtemp()
        source_file = Path(temp_dir) / "Main.java"
        print(f"[LOG] Created temp dir: {temp_dir}")

        # Write source code to file
        source_file.write_text(source_code)
        print(f"[LOG] Source code written ({len(source_code)} chars)")

        # Compile using detected Java path
        compile_cmd = [JAVAC_PATH, str(source_file)]
        print(f"[LOG] Compiling: {' '.join(compile_cmd)}")
        result = subprocess.run(
            compile_cmd,
            capture_output=True,
            text=True,
            cwd=temp_dir
        )

        if result.returncode != 0:
            print(f"[ERROR] Compilation failed:\n{result.stderr}")
            return {
                "success": False,
                "error": result.stderr or "Compilation failed"
            }

        print("[LOG] Compilation successful")

        # Run the compiled class using detected Java path
        run_cmd = [JAVA_PATH, "-cp", temp_dir, "Main"]
        has_stdin = bool(stdin_input)
        print(f"[LOG] Running: {' '.join(run_cmd)}")
        if has_stdin:
            print(f"[LOG] Stdin input provided ({len(stdin_input)} chars): {repr(stdin_input[:100])}")
        else:
            print("[LOG] No stdin input provided")

        result = subprocess.run(
            run_cmd,
            input=stdin_input if stdin_input else None,
            capture_output=True,
            text=True,
            timeout=10,
            cwd=temp_dir
        )

        output = result.stdout
        error = result.stderr

        print(f"[LOG] Execution finished (exit code: {result.returncode})")
        if output:
            print(f"[LOG] Stdout: {repr(output[:200])}")
        if error:
            print(f"[LOG] Stderr: {repr(error[:200])}")

        # Cleanup
        shutil.rmtree(temp_dir)
        print("[LOG] Temp dir cleaned up")

        return {
            "success": True,
            "output": output,
            "error": error,
            "os": SYSTEM
        }

    except subprocess.TimeoutExpired:
        # Cleanup temp dir on timeout
        try:
            shutil.rmtree(temp_dir)
        except:
            pass

        # Check if the code needs stdin input but none was provided
        needs_input = any(keyword in source_code for keyword in [
            "Scanner", "System.in", "BufferedReader", "InputStreamReader",
            "nextInt", "nextLine", "nextDouble", "nextFloat", "readLine"
        ])

        if needs_input and not stdin_input:
            print("[ERROR] Timeout - code requires stdin input but none was provided")
            return {
                "success": False,
                "error": "This program requires user input (Scanner/System.in detected). Please provide input in the 'Stdin Input' panel below the console before running.",
                "needs_input": True
            }
        else:
            print("[ERROR] Execution timed out (10s limit)")
            return {"success": False, "error": "Execution timeout (10s limit)"}
    except Exception as e:
        print(f"[ERROR] Exception: {str(e)}")
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
    """Compile and run Java source code"""
    try:
        data = request.get_json()
        source_code = data.get("code", "")
        stdin_input = data.get("stdin", "")

        print(f"\n{'='*50}")
        print(f"[API] /api/compile received")
        print(f"[API] Code length: {len(source_code)} chars")
        print(f"[API] Stdin received: {repr(stdin_input) if stdin_input else '(empty)'}")
        print(f"[API] Request keys: {list(data.keys())}")
        print(f"{'='*50}")

        if not source_code:
            print("[API] ERROR: No code provided")
            return jsonify({"success": False, "error": "No code provided"}), 400

        result = compile_java(source_code, stdin_input)

        print(f"[API] Response: success={result.get('success')}")
        if result.get('output'):
            print(f"[API] Output: {repr(result['output'][:200])}")
        if result.get('error'):
            print(f"[API] Error: {repr(result['error'][:200])}")
        print(f"{'='*50}\n")

        return jsonify(result)

    except Exception as e:
        print(f"[API] EXCEPTION: {str(e)}")
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


def _boot_step(label, value, delay=0.15):
    """Print a single boot step with animation."""
    # ANSI colors
    GREEN = "\033[92m"
    CYAN = "\033[96m"
    DIM = "\033[2m"
    RESET = "\033[0m"
    BOLD = "\033[1m"

    padded_label = label.ljust(40, " ")
    sys.stdout.write(f"  {DIM}[    ]{RESET} {padded_label}")
    sys.stdout.flush()
    time.sleep(delay)
    sys.stdout.write(f"\r  {GREEN}[ ✓  ]{RESET} {padded_label} {CYAN}{BOLD}{value}{RESET}\n")
    sys.stdout.flush()


def _boot_step_fail(label, value, delay=0.15):
    """Print a failing boot step."""
    RED = "\033[91m"
    DIM = "\033[2m"
    RESET = "\033[0m"
    BOLD = "\033[1m"

    padded_label = label.ljust(40, " ")
    sys.stdout.write(f"  {DIM}[    ]{RESET} {padded_label}")
    sys.stdout.flush()
    time.sleep(delay)
    sys.stdout.write(f"\r  {RED}[ ✗  ]{RESET} {padded_label} {RED}{BOLD}{value}{RESET}\n")
    sys.stdout.flush()


def _get_java_version():
    """Try to get JVM version string."""
    try:
        result = subprocess.run(
            [JAVA_PATH, "-version"],
            capture_output=True, text=True, timeout=5
        )
        # java -version prints to stderr
        ver = result.stderr.strip().split("\n")[0] if result.stderr else "Unknown"
        return ver
    except Exception:
        return "Not found"


def _get_react_version():
    """Read React version from package.json."""
    try:
        pkg_path = os.path.join(os.path.dirname(__file__), "package.json")
        with open(pkg_path, "r") as f:
            pkg = json.load(f)
        return pkg.get("dependencies", {}).get("react", "Unknown")
    except Exception:
        return "Unknown"


def _get_vite_version():
    """Read Vite version from package.json."""
    try:
        pkg_path = os.path.join(os.path.dirname(__file__), "package.json")
        with open(pkg_path, "r") as f:
            pkg = json.load(f)
        return pkg.get("devDependencies", {}).get("vite", "Unknown")
    except Exception:
        return "Unknown"


if __name__ == "__main__":
    # ── ANSI color codes ──
    CYAN = "\033[96m"
    GREEN = "\033[92m"
    YELLOW = "\033[93m"
    DIM = "\033[2m"
    BOLD = "\033[1m"
    RESET = "\033[0m"
    MAGENTA = "\033[95m"

    # ── ASCII art banner ──
    print()
    print(f"{CYAN}╔══════════════════════════════════════════════════════════════════════╗{RESET}")
    print(f"{CYAN}║                                                                      ║{RESET}")
    print(f"{CYAN}║{RESET}  {GREEN}{BOLD}██╗ █████╗ ██╗   ██╗ █████╗ ██████╗ ███████╗███╗   ██╗ █████╗      {RESET} {CYAN}║{RESET}")
    print(f"{CYAN}║{RESET}  {GREEN}{BOLD}██║██╔══██╗██║   ██║██╔══██╗██╔══██╗██╔════╝████╗  ██║██╔══██╗     {RESET} {CYAN}║{RESET}")
    print(f"{CYAN}║{RESET}  {GREEN}{BOLD}██║███████║██║   ██║███████║██████╔╝█████╗  ██╔██╗ ██║███████║     {RESET} {CYAN}║{RESET}")
    print(f"{CYAN}║{RESET}  {GREEN}{BOLD}██║██╔══██║╚██╗ ██╔╝██╔══██║██╔══██╗██╔══╝  ██║╚██╗██║██╔══██║     {RESET}{CYAN} ║{RESET}")
    print(f"{CYAN}║{RESET}  {GREEN}{BOLD}██║██║  ██║ ╚████╔╝ ██║  ██║██║  ██║███████╗██║ ╚████║██║  ██║     {RESET}{CYAN} ║{RESET}")
    print(f"{CYAN}║{RESET}  {GREEN}{BOLD}╚═╝╚═╝  ╚═╝  ╚═══╝  ╚═╝  ╚═╝╚═╝  ╚═╝╚══════╝╚═╝  ╚═══╝╚═╝  ╚═╝     {RESET}{CYAN} ║{RESET}")
    print(f"{CYAN}║                                                                      ║{RESET}")
    print(f"{CYAN}╚══════════════════════════════════════════════════════════════════════╝{RESET}")
    print()

    # ── Boot header ──
    print(f"  {YELLOW}{BOLD}[BOOT]{RESET} {DIM}JavaRena v1.0 — Summoning Protocol Initiated{RESET}")
    print()

    # ── Pre-flight: check dist folder ──
    if not os.path.exists("dist"):
        _boot_step_fail("Locating built frontend", "dist/ not found")
        print(f"\n  {YELLOW}Frontend not built yet!{RESET}")
        print(f"  Run this first: {BOLD}npm run build{RESET}")
        print(f"  Then start the server again with: {BOLD}python server.py{RESET}\n")
        sys.exit(1)

    # ── Step 1: Detect OS ──
    os_label = f"{SYSTEM}"
    if IS_WINDOWS:
        os_label = f"Windows ({platform.release()})"
    elif IS_LINUX:
        os_label = "Linux"
    elif IS_MAC:
        os_label = "macOS"
    _boot_step("Detecting host OS", os_label)

    # ── Step 2: Find javac ──
    JAVA_AVAILABLE = find_java()
    if JAVA_AVAILABLE:
        _boot_step("Locating javac binary", JAVAC_PATH)
    else:
        _boot_step_fail("Locating javac binary", "NOT FOUND")

    # ── Step 3: JVM version ──
    if JAVA_AVAILABLE:
        jvm_ver = _get_java_version()
        _boot_step("Verifying JVM heartbeat", jvm_ver)
    else:
        _boot_step_fail("Verifying JVM heartbeat", "Skipped (no Java)")

    # ── Step 4: Flask server ──
    _boot_step("Raising Flask server from the void", "Port 5000")

    # ── Step 5: Monaco + React ──
    react_ver = _get_react_version()
    _boot_step("Mounting Monaco Editor grimoire", f"React {react_ver}")

    # ── Step 6: Vite proxy ──
    vite_ver = _get_vite_version()
    _boot_step("Binding frontend to backend", f"Vite {vite_ver} proxy locked")

    # ── Step 7: Classloader warmth ──
    _boot_step("Warming the classloader", "Ready")

    # ── Final status ──
    print()
    print(f"  {GREEN}{BOLD}[SYSTEM]{RESET} {BOLD}The Arena is open.{RESET}")
    print(f"  {DIM}[SYSTEM] May your semicolons be plentiful, and your NullPointers few.{RESET}")
    print()

    if not JAVA_AVAILABLE:
        print(f"  {YELLOW}{BOLD}⚠  WARNING:{RESET}{YELLOW} Java compiler (javac) not found!{RESET}")
        print(f"  {YELLOW}   Please install Java Development Kit (JDK){RESET}")
        print()

    print(f"  {MAGENTA}{BOLD}>>> Listening on http://localhost:5000{RESET}")
    print()

    from waitress import serve
    serve(app, host="0.0.0.0", port=5000)
