import os
import shutil
import tempfile
import subprocess
from pathlib import Path
from core.config import IS_WINDOWS, SYSTEM

# Global state for Java availability
JAVA_PATH = None
JAVAC_PATH = None
JAVA_AVAILABLE = False

def find_java():
    """Find java and javac executables"""
    global JAVA_PATH, JAVAC_PATH, JAVA_AVAILABLE
    
    if JAVA_AVAILABLE and JAVA_PATH and JAVAC_PATH:
        return True

    if IS_WINDOWS:
        javac = shutil.which("javac")
        java = shutil.which("java")

        if javac and java:
            JAVA_PATH = java
            JAVAC_PATH = javac
            JAVA_AVAILABLE = True
            return True

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
                            JAVA_AVAILABLE = True
                            print(f"[OK] Found Java at: {JAVA_PATH}")
                            return True
            except Exception as e:
                print(f"  Error searching {search_dir}: {e}")
                continue

        return False
    else:
        javac = shutil.which("javac")
        java = shutil.which("java")

        if javac and java:
            JAVA_PATH = java
            JAVAC_PATH = javac
            JAVA_AVAILABLE = True
            return True

        for bin_path in ["/usr/bin", "/usr/local/bin", "/opt/java/bin"]:
            javac_path = os.path.join(bin_path, "javac")
            java_path = os.path.join(bin_path, "java")
            if os.path.exists(javac_path) and os.path.exists(java_path):
                JAVA_PATH = java_path
                JAVAC_PATH = javac_path
                JAVA_AVAILABLE = True
                return True

        return False

def compile_java(source_code, stdin_input=""):
    """Compile and run Java source code with optional stdin input"""
    if not find_java():
        return {"success": False, "error": "Java compiler (javac) not found on this system"}

    try:
        temp_dir = tempfile.mkdtemp()
        source_file = Path(temp_dir) / "Main.java"
        source_file.write_text(source_code, encoding='utf-8')

        compile_cmd = [JAVAC_PATH, "-encoding", "UTF-8", str(source_file)]
        result = subprocess.run(
            compile_cmd,
            capture_output=True,
            text=True,
            encoding='utf-8',
            cwd=temp_dir
        )

        if result.returncode != 0:
            return {
                "success": False,
                "error": result.stderr or "Compilation failed"
            }

        run_cmd = [JAVA_PATH, "-Dfile.encoding=UTF-8", "-Dsun.stdout.encoding=UTF-8", "-Dsun.stderr.encoding=UTF-8", "-cp", temp_dir, "Main"]
        
        result = subprocess.run(
            run_cmd,
            input=stdin_input if stdin_input else None,
            capture_output=True,
            text=True,
            encoding='utf-8',
            timeout=10,
            cwd=temp_dir
        )

        output = result.stdout
        error = result.stderr

        shutil.rmtree(temp_dir)

        return {
            "success": True,
            "output": output,
            "error": error,
            "os": SYSTEM
        }

    except subprocess.TimeoutExpired:
        try:
            shutil.rmtree(temp_dir)
        except Exception:
            pass

        needs_input = any(keyword in source_code for keyword in [
            "Scanner", "System.in", "BufferedReader", "InputStreamReader",
            "nextInt", "nextLine", "nextDouble", "nextFloat", "readLine"
        ])

        if needs_input and not stdin_input:
            return {
                "success": False,
                "error": "This program requires user input (Scanner/System.in detected). Please provide input in the 'Stdin Input' panel below the console before running.",
                "needs_input": True
            }
        else:
            return {"success": False, "error": "Execution timeout (10s limit)"}
    except Exception as e:
        return {"success": False, "error": str(e)}

def run_interactive_java(temp_dir):
    """Start an interactive Java process in the given temp directory"""
    if not find_java():
        raise RuntimeError("Java not available")
        
    cmd = [JAVA_PATH, "-Dfile.encoding=UTF-8", "-Dsun.stdout.encoding=UTF-8", "-Dsun.stderr.encoding=UTF-8", "-cp", temp_dir, "Main"]
    
    # On Windows, running through cmd /c can sometimes improve pipe responsiveness
    if IS_WINDOWS:
        cmd = ["cmd", "/c"] + cmd

    return subprocess.Popen(
        cmd,
        stdin=subprocess.PIPE,
        stdout=subprocess.PIPE,
        stderr=subprocess.STDOUT,
        bufsize=0, # Completely unbuffered
        cwd=temp_dir,
    )

def prepare_interactive_java(code):
    """
    Prepare for interactive Java execution:
    1. Create temp dir
    2. Write code
    3. Compile
    Returns (temp_dir, compile_result)
    """
    if not find_java():
        raise RuntimeError("Java not available")

    temp_dir = tempfile.mkdtemp()
    source_file = Path(temp_dir) / "Main.java"
    source_file.write_text(code, encoding='utf-8')

    result = subprocess.run(
        [JAVAC_PATH, "-encoding", "UTF-8", str(source_file)],
        capture_output=True,
        text=True,
        encoding='utf-8',
        cwd=temp_dir
    )
    
    return temp_dir, result

def start_interactive_session(code):
    """
    High-level function to compile and start an interactive Java process.
    Returns (proc, temp_dir, compile_result)
    """
    temp_dir, compile_result = prepare_interactive_java(code)
    
    if compile_result.returncode != 0:
        return None, temp_dir, compile_result
        
    proc = run_interactive_java(temp_dir)
    return proc, temp_dir, compile_result
