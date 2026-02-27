import sqlite3
import sys
from datetime import datetime, timedelta
from flask import request, jsonify, send_from_directory
from core.config import DB_PATH, SHARE_IMAGES_DIR, SYSTEM, IS_WINDOWS, IS_LINUX, IS_MAC
from services.java_compiler import compile_java, JAVA_AVAILABLE
from services.share_service import check_rate_limit, generate_share_id, sanitize_code
from services.codeReview import explain_error, ai_review_error
from api.sockets import interactive_processes

def register_routes(app):
    @app.route("/api/share", methods=["POST"])
    def create_share():
        try:
            if not check_rate_limit():
                return jsonify({
                    "success": False,
                    "error": "Rate limit exceeded. Please try again later."
                }), 429

            data = request.get_json()
            code = data.get("code", "")
            output = data.get("output", "")

            if not code or not code.strip():
                return jsonify({"success": False, "error": "Code cannot be empty"}), 400

            if len(code) > 50000:
                return jsonify({"success": False, "error": "Code too large (max 50KB)"}), 400

            code = sanitize_code(code)
            output = sanitize_code(output) if output else ""

            share_id = generate_share_id()
            expires_at = datetime.now() + timedelta(days=30)

            conn = sqlite3.connect(DB_PATH)
            cursor = conn.cursor()
            cursor.execute("""
                INSERT INTO shares (id, code, output, expires_at)
                VALUES (?, ?, ?, ?)
            """, (share_id, code, output, expires_at.isoformat()))
            conn.commit()
            conn.close()

            return jsonify({
                "success": True,
                "id": share_id,
                "expires_at": expires_at.isoformat()
            })
        except Exception as e:
            return jsonify({"success": False, "error": str(e)}), 500

    @app.route("/api/share/<share_id>", methods=["GET"])
    def get_share(share_id):
        try:
            conn = sqlite3.connect(DB_PATH)
            cursor = conn.cursor()
            cursor.execute("""
                SELECT code, output, views, created_at, expires_at
                FROM shares WHERE id = ?
            """, (share_id,))
            result = cursor.fetchone()

            if not result:
                conn.close()
                return jsonify({"success": False, "error": "Share not found"}), 404

            code, output, views, created_at, expires_at = result
            if datetime.fromisoformat(expires_at) < datetime.now():
                conn.close()
                return jsonify({"success": False, "error": "Share has expired"}), 410

            cursor.execute("UPDATE shares SET views = views + 1 WHERE id = ?", (share_id,))
            conn.commit()
            conn.close()

            return jsonify({
                "success": True,
                "code": code,
                "output": output,
                "views": views + 1,
                "created_at": created_at,
                "expires_at": expires_at
            })
        except Exception as e:
            return jsonify({"success": False, "error": str(e)}), 500

    @app.route("/share-images/<filename>")
    def serve_share_image(filename):
        try:
            return send_from_directory(SHARE_IMAGES_DIR, filename)
        except Exception:
            return jsonify({"error": "Image not found"}), 404

    @app.route("/api/health", methods=["GET"])
    def health():
        from services.java_compiler import JAVA_AVAILABLE
        return jsonify({
            "status": "ok",
            "os": SYSTEM,
            "java_available": JAVA_AVAILABLE,
            "is_windows": IS_WINDOWS,
            "is_linux": IS_LINUX,
            "interactive_sessions": len(interactive_processes),
        })

    @app.route("/api/compile", methods=["POST"])
    def compile_endpoint():
        try:
            data = request.get_json()
            source_code = data.get("code", "")
            stdin_input = data.get("stdin", "")

            if not source_code:
                return jsonify({"success": False, "error": "No code provided"}), 400

            result = compile_java(source_code, stdin_input)

            error_text = result.get('error', '')
            if error_text and error_text.strip():
                is_compilation = not result.get('success') and (
                    'Compilation failed' in error_text or 'error:' in error_text
                )

                ai_explanation = ai_review_error(
                    error_text=error_text,
                    source_code=source_code,
                    is_compilation_error=is_compilation,
                )
                if ai_explanation:
                    result['ai_review'] = ai_explanation
                else:
                    review = explain_error(
                        error_text=error_text,
                        source_code=source_code,
                        is_compilation_error=is_compilation,
                    )
                    if review:
                        result['error_review'] = review

            return jsonify(result)
        except Exception as e:
            return jsonify({"success": False, "error": str(e)}), 500

    @app.route("/api/visualize", methods=["POST"])
    def visualize_endpoint():
        try:
            data = request.get_json()
            code = data.get("code", "")
            if not code:
                return jsonify({"success": False, "error": "No code provided"}), 400

            from services.visualizer import visualize_code
            result = visualize_code(code)
            return jsonify(result)
        except Exception as e:
            return jsonify({"success": False, "error": str(e)}), 500

    @app.route("/api/info", methods=["GET"])
    def info():
        from services.java_compiler import JAVA_AVAILABLE
        return jsonify({
            "name": "Java Compiler Server",
            "os": SYSTEM,
            "is_windows": IS_WINDOWS,
            "is_linux": IS_LINUX,
            "is_mac": IS_MAC,
            "java_available": JAVA_AVAILABLE,
            "python_version": f"{sys.version_info.major}.{sys.version_info.minor}"
        })
