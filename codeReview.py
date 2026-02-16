"""
codeReview.py — Java Error Explainer
Provides detailed, beginner-friendly explanations for common Java
compilation and runtime errors.

Uses the OpenRouter AI API (openai/gpt-oss-20b:free) for deep analysis,
with local pattern-matching as a fast fallback.
"""

import re
import os
import json
import requests
from dotenv import load_dotenv

load_dotenv()  # Load environment variables from .env file

# ── OpenRouter API configuration ──
OPENROUTER_API_URL = "https://openrouter.ai/api/v1/chat/completions"
OPENROUTER_API_KEY = os.environ.get("OPENROUTER_API_KEY", "")
OPENROUTER_MODEL = "openai/gpt-oss-20b:free"


# ── Common Java compilation error patterns ──
COMPILE_ERROR_PATTERNS = [
    {
        "pattern": r"cannot find symbol",
        "title": "Cannot Find Symbol",
        "explain": (
            "The compiler cannot find a variable, method, or class that you referenced. "
            "This usually means:\n"
            "  • You misspelled a variable or method name.\n"
            "  • You forgot to declare a variable before using it.\n"
            "  • You forgot to import a class (e.g. `import java.util.Scanner;`).\n"
            "  • The variable is out of scope (declared inside a different block)."
        ),
    },
    {
        "pattern": r"';' expected",
        "title": "Missing Semicolon",
        "explain": (
            "Java requires a semicolon (;) at the end of every statement. "
            "Check the indicated line and the line above it — the missing semicolon "
            "is often on the previous line."
        ),
    },
    {
        "pattern": r"unclosed string literal",
        "title": "Unclosed String Literal",
        "explain": (
            "You opened a string with a double-quote (\") but never closed it. "
            "Make sure every string has a matching closing quote on the same line. "
            "If you need a multi-line string, use string concatenation or a text block (Java 15+)."
        ),
    },
    {
        "pattern": r"illegal start of expression",
        "title": "Illegal Start of Expression",
        "explain": (
            "The compiler found something unexpected where an expression should begin. "
            "Common causes:\n"
            "  • A misplaced or extra brace { } or parenthesis ( ).\n"
            "  • An access modifier (public/private) inside a method.\n"
            "  • A missing operator between two values."
        ),
    },
    {
        "pattern": r"class .+ is public, should be declared in a file named",
        "title": "Class Name / File Name Mismatch",
        "explain": (
            "In this playground the file is always named Main.java, so your public class "
            "must be named `Main`. Rename your class to `public class Main` to fix this."
        ),
    },
    {
        "pattern": r"reached end of file while parsing",
        "title": "Reached End of File While Parsing",
        "explain": (
            "The compiler hit the end of the file but was still expecting more code. "
            "You are most likely missing one or more closing braces `}`. "
            "Count your opening and closing braces — they must match."
        ),
    },
    {
        "pattern": r"incompatible types",
        "title": "Incompatible Types",
        "explain": (
            "You tried to assign or return a value of one type where a different type "
            "is expected. For example, assigning a String to an int variable. "
            "Use type casting or conversion methods (e.g. Integer.parseInt()) to fix this."
        ),
    },
    {
        "pattern": r"method .+ in class .+ cannot be applied to given types",
        "title": "Wrong Method Arguments",
        "explain": (
            "You called a method with the wrong number or types of arguments. "
            "Check the method signature and make sure you are passing the correct "
            "parameters in the right order."
        ),
    },
    {
        "pattern": r"non-static method .+ cannot be referenced from a static context",
        "title": "Non-static Method from Static Context",
        "explain": (
            "You are calling an instance method from a static method (like `main`). "
            "To fix this, either:\n"
            "  • Make the method `static`.\n"
            "  • Create an instance of the class and call the method on that object."
        ),
    },
    {
        "pattern": r"non-static variable .+ cannot be referenced from a static context",
        "title": "Non-static Variable from Static Context",
        "explain": (
            "You are accessing an instance variable from a static method (like `main`). "
            "To fix this, either:\n"
            "  • Make the variable `static`.\n"
            "  • Create an instance of the class and access the variable through it."
        ),
    },
    {
        "pattern": r"variable .+ might not have been initialized",
        "title": "Variable Not Initialized",
        "explain": (
            "You declared a local variable but used it before assigning a value. "
            "Local variables in Java must be explicitly initialized before use. "
            "Assign a default value when you declare it (e.g. `int x = 0;`)."
        ),
    },
    {
        "pattern": r"missing return statement",
        "title": "Missing Return Statement",
        "explain": (
            "A method that declares a return type must return a value on every possible "
            "code path. Make sure all if/else branches and loops end with a `return` "
            "statement, or add one at the end of the method."
        ),
    },
    {
        "pattern": r"unreachable statement",
        "title": "Unreachable Statement",
        "explain": (
            "There is code after a `return`, `break`, `continue`, or `throw` statement "
            "that can never be executed. Remove the unreachable code or restructure your logic."
        ),
    },
    {
        "pattern": r"array required but .+ found",
        "title": "Not an Array",
        "explain": (
            "You used array indexing (e.g. `x[0]`) on something that is not an array. "
            "Check that the variable is actually declared as an array type."
        ),
    },
    {
        "pattern": r"bad operand type",
        "title": "Bad Operand Type",
        "explain": (
            "You used an operator with a type it doesn't support. For example, using "
            "`>` or `<` with Strings instead of `.compareTo()`, or using `==` to compare "
            "String contents instead of `.equals()`."
        ),
    },
    {
        "pattern": r"possible loss of precision|lossy conversion",
        "title": "Possible Loss of Precision",
        "explain": (
            "You are trying to store a larger numeric type in a smaller one (e.g. double → int). "
            "Use an explicit cast like `(int) myDouble` if you are okay with losing the decimal part."
        ),
    },
    {
        "pattern": r"exception .+ must be caught or declared to be thrown",
        "title": "Unhandled Exception",
        "explain": (
            "Java's checked exceptions must be handled. Either:\n"
            "  • Wrap the code in a try-catch block.\n"
            "  • Add `throws ExceptionType` to your method signature."
        ),
    },
    {
        "pattern": r"illegal start of type",
        "title": "Illegal Start of Type",
        "explain": (
            "The compiler expected a type declaration but found something else. "
            "This often means you have a stray statement outside of a method, "
            "or a misplaced closing brace that ended a class/method too early."
        ),
    },
]

# ── Common Java runtime error patterns ──
RUNTIME_ERROR_PATTERNS = [
    {
        "pattern": r"java\.lang\.NullPointerException",
        "title": "NullPointerException",
        "explain": (
            "You tried to use an object reference that is `null` — it doesn't point to "
            "any actual object. Common causes:\n"
            "  • Calling a method on a variable that was never assigned.\n"
            "  • Accessing an array element that hasn't been initialized.\n"
            "  • Returning null from a method and using the result without checking."
        ),
    },
    {
        "pattern": r"java\.lang\.ArrayIndexOutOfBoundsException",
        "title": "ArrayIndexOutOfBoundsException",
        "explain": (
            "You tried to access an array index that doesn't exist. "
            "Arrays in Java are 0-indexed, so an array of size N has valid indices 0 to N-1. "
            "Check your loop bounds and make sure you're not going past `array.length - 1`."
        ),
    },
    {
        "pattern": r"java\.lang\.StringIndexOutOfBoundsException",
        "title": "StringIndexOutOfBoundsException",
        "explain": (
            "You tried to access a character position in a String that doesn't exist. "
            "Use `.length()` to check the string size before accessing characters with "
            "`.charAt()` or `.substring()`."
        ),
    },
    {
        "pattern": r"java\.lang\.ArithmeticException.*/ by zero",
        "title": "ArithmeticException: Division by Zero",
        "explain": (
            "You divided an integer by zero. Before dividing, check that the divisor "
            "is not zero: `if (divisor != 0) { result = x / divisor; }`"
        ),
    },
    {
        "pattern": r"java\.lang\.NumberFormatException",
        "title": "NumberFormatException",
        "explain": (
            "You tried to convert a String to a number, but the String doesn't contain "
            "a valid number. For example, `Integer.parseInt(\"abc\")` will fail. "
            "Validate the input or wrap the conversion in a try-catch."
        ),
    },
    {
        "pattern": r"java\.lang\.ClassCastException",
        "title": "ClassCastException",
        "explain": (
            "You tried to cast an object to a type it doesn't belong to. "
            "Use `instanceof` to check the type before casting."
        ),
    },
    {
        "pattern": r"java\.lang\.StackOverflowError",
        "title": "StackOverflowError",
        "explain": (
            "Your program ran out of stack space, usually because of infinite recursion. "
            "Check your recursive method — it likely has a missing or incorrect base case "
            "that prevents it from ever stopping."
        ),
    },
    {
        "pattern": r"java\.lang\.OutOfMemoryError",
        "title": "OutOfMemoryError",
        "explain": (
            "The program ran out of memory. This can happen if you create an extremely large "
            "array or collection, or have an infinite loop that keeps allocating objects."
        ),
    },
    {
        "pattern": r"java\.util\.InputMismatchException",
        "title": "InputMismatchException",
        "explain": (
            "The Scanner received input that doesn't match the expected type. "
            "For example, calling `nextInt()` but the input contains letters. "
            "Make sure the stdin input matches what your Scanner calls expect."
        ),
    },
    {
        "pattern": r"java\.util\.NoSuchElementException",
        "title": "NoSuchElementException",
        "explain": (
            "The program tried to read more input than was available. "
            "Either provide enough lines in the stdin input panel, or use "
            "`scanner.hasNext()` / `scanner.hasNextLine()` before reading."
        ),
    },
    {
        "pattern": r"java\.lang\.UnsupportedOperationException",
        "title": "UnsupportedOperationException",
        "explain": (
            "You called a method that is not supported on this object. "
            "A common case is trying to modify an unmodifiable list returned by "
            "`Arrays.asList()` or `List.of()`. Use `new ArrayList<>(List.of(...))` instead."
        ),
    },
    {
        "pattern": r"java\.util\.ConcurrentModificationException",
        "title": "ConcurrentModificationException",
        "explain": (
            "You modified a collection (e.g. ArrayList) while iterating over it with a "
            "for-each loop. Use an `Iterator` with `iterator.remove()`, or collect items "
            "to remove and do it after the loop."
        ),
    },
    {
        "pattern": r"java\.lang\.IllegalArgumentException",
        "title": "IllegalArgumentException",
        "explain": (
            "A method received an argument that it considers invalid. "
            "Read the error message for details about which argument was wrong, "
            "and check the method's documentation for valid input ranges."
        ),
    },
    {
        "pattern": r"java\.io\.FileNotFoundException",
        "title": "FileNotFoundException",
        "explain": (
            "The program tried to open a file that doesn't exist or can't be accessed. "
            "In this online playground, file I/O is not supported. Use Scanner with "
            "System.in and provide input through the stdin panel instead."
        ),
    },
]


def _extract_line_number(error_text):
    """Try to extract line number(s) from a Java error message."""
    matches = re.findall(r"Main\.java:(\d+)", error_text)
    if matches:
        return [int(m) for m in matches]
    return []


def _match_patterns(error_text, patterns):
    """Match error text against a list of patterns and return all matches."""
    matched = []
    for entry in patterns:
        if re.search(entry["pattern"], error_text, re.IGNORECASE):
            matched.append(entry)
    return matched


def explain_error(error_text, source_code="", is_compilation_error=False):
    """
    Analyse a Java error (compilation or runtime) and return a structured,
    beginner-friendly explanation.

    Parameters
    ----------
    error_text : str
        The raw stderr / error output from javac or java.
    source_code : str, optional
        The original Java source code (used to give contextual hints).
    is_compilation_error : bool
        True if the error came from the compilation step (javac),
        False if it came from runtime (java).

    Returns
    -------
    dict with keys:
        - error_type  : "compilation" | "runtime"
        - title       : Short human-readable title
        - raw_error   : The original error text (trimmed)
        - explanation  : Detailed friendly explanation
        - line_numbers : List[int] of affected line numbers (if detected)
        - suggestions  : List[str] of actionable fix suggestions
    """
    if not error_text or not error_text.strip():
        return None

    error_text = error_text.strip()
    error_type = "compilation" if is_compilation_error else "runtime"
    line_numbers = _extract_line_number(error_text)

    # Pick the right pattern bank
    patterns = COMPILE_ERROR_PATTERNS if is_compilation_error else RUNTIME_ERROR_PATTERNS
    matches = _match_patterns(error_text, patterns)

    # If no specific pattern matched, also try the other bank as fallback
    if not matches:
        fallback = RUNTIME_ERROR_PATTERNS if is_compilation_error else COMPILE_ERROR_PATTERNS
        matches = _match_patterns(error_text, fallback)

    if matches:
        # Use the first (most relevant) match
        best = matches[0]
        title = best["title"]
        explanation = best["explain"]
    else:
        # Generic explanation when no pattern matched
        title = "Compilation Error" if is_compilation_error else "Runtime Error"
        explanation = (
            "The Java compiler reported an error in your code. "
            "Read the error message carefully — it usually tells you the exact "
            "line number and what went wrong."
        ) if is_compilation_error else (
            "Your program threw an exception during execution. "
            "Read the stack trace from bottom to top to find the line in your code "
            "that caused the problem."
        )

    # Build actionable suggestions
    suggestions = _build_suggestions(
        error_text, source_code, is_compilation_error, matches)

    return {
        "error_type": error_type,
        "title": title,
        "raw_error": error_text,
        "explanation": explanation,
        "line_numbers": line_numbers,
        "suggestions": suggestions,
    }


def _build_suggestions(error_text, source_code, is_compilation, matches):
    """Generate actionable suggestions based on error context."""
    suggestions = []

    if is_compilation:
        # Line-number hint
        lines = _extract_line_number(error_text)
        if lines:
            suggestions.append(
                f"Look at line {', '.join(str(l) for l in lines)} in your code."
            )

        if re.search(r"cannot find symbol", error_text, re.IGNORECASE):
            # Check for common missing imports
            if source_code:
                if "Scanner" in source_code and "import java.util.Scanner" not in source_code:
                    suggestions.append(
                        "Add `import java.util.Scanner;` at the top of your file.")
                if "ArrayList" in source_code and "import java.util.ArrayList" not in source_code:
                    suggestions.append(
                        "Add `import java.util.ArrayList;` at the top of your file.")
                if "Arrays" in source_code and "import java.util.Arrays" not in source_code:
                    suggestions.append(
                        "Add `import java.util.Arrays;` at the top of your file.")
                if "HashMap" in source_code and "import java.util.HashMap" not in source_code:
                    suggestions.append(
                        "Add `import java.util.HashMap;` at the top of your file.")
                if "List" in source_code and "import java.util.List" not in source_code:
                    suggestions.append(
                        "Add `import java.util.List;` at the top of your file.")
                if "Map" in source_code and "import java.util.Map" not in source_code:
                    suggestions.append(
                        "Add `import java.util.Map;` at the top of your file.")
            suggestions.append(
                "Double-check your spelling of variable and method names.")

        if re.search(r"';' expected", error_text, re.IGNORECASE):
            suggestions.append(
                "Add a semicolon (;) at the end of the statement.")

        if re.search(r"class .+ is public, should be declared in a file named", error_text):
            suggestions.append("Rename your public class to `Main`.")

        if re.search(r"reached end of file while parsing", error_text):
            suggestions.append(
                "Count your opening { and closing } braces — you're likely missing a }.")

    else:
        # Runtime suggestions
        if re.search(r"NullPointerException", error_text):
            suggestions.append(
                "Check which variable is null and make sure it's initialized before use.")

        if re.search(r"ArrayIndexOutOfBoundsException", error_text):
            suggestions.append(
                "Print `array.length` to verify the array size and check your loop conditions.")

        if re.search(r"InputMismatchException|NoSuchElementException", error_text):
            suggestions.append(
                "Make sure the stdin input matches what your Scanner calls expect (type and count).")

        if re.search(r"StackOverflowError", error_text):
            suggestions.append(
                "Check your recursive function's base case — it may never be reached.")

        if re.search(r"NumberFormatException", error_text):
            suggestions.append(
                "Verify the string you're parsing actually contains a valid number.")

        # Generic stack trace hint
        if "at Main." in error_text:
            line_match = re.search(
                r"at Main\.\w+\(Main\.java:(\d+)\)", error_text)
            if line_match:
                suggestions.append(
                    f"The error originated at line {line_match.group(1)} in your code.")

    if not suggestions:
        suggestions.append(
            "Read the error message carefully and check the referenced line number.")

    return suggestions


# ─────────────────────────────────────────────────────────
#  AI-powered error review via OpenRouter API
# ─────────────────────────────────────────────────────────

_SYSTEM_PROMPT = (
    "You are an expert Java programming tutor. A student is using an online Java playground "
    "(file is always Main.java). They hit an error. Your job is to:\n"
    "1. Identify the error clearly.\n"
    "2. Explain *why* it happened in simple, beginner-friendly language.\n"
    "3. Point to the exact line(s) if possible.\n"
    "4. Provide a concrete fix or code suggestion.\n"
    "Keep the answer concise (under 200 words). Use bullet points. "
    "Do NOT repeat the full error text back — the student already sees it."
)


def ai_review_error(error_text, source_code="", is_compilation_error=False):
    """
    Call the OpenRouter reasoning model to get a detailed, AI-generated
    explanation of a Java error.

    Returns a string with the AI explanation, or None if the call fails.
    """
    if not OPENROUTER_API_KEY:
        print("[REVIEW] OPENROUTER_API_KEY not set — skipping AI review")
        return None

    error_kind = "compilation" if is_compilation_error else "runtime"
    user_message = (
        f"Error type: {error_kind}\n\n"
        f"--- Java Source Code ---\n{source_code}\n\n"
        f"--- Error Output ---\n{error_text}"
    )

    try:
        response = requests.post(
            url=OPENROUTER_API_URL,
            headers={
                "Authorization": f"Bearer {OPENROUTER_API_KEY}",
                "Content-Type": "application/json",
            },
            data=json.dumps({
                "model": OPENROUTER_MODEL,
                "messages": [
                    {"role": "system", "content": _SYSTEM_PROMPT},
                    {"role": "user", "content": user_message},
                ],
                "temperature": 0,
                # "response_format": {"type": "text"},
                # "max_tokens": 200,

            }),
            timeout=15,
        )

        if response.status_code != 200:
            print(
                f"[REVIEW] OpenRouter API error: {response.status_code} {response.text[:200]}")
            return None

        data = response.json()
        ai_message = data.get("choices", [{}])[0].get("message", {})
        content = ai_message.get("content", "")

        if content and content.strip():
            print(f"[REVIEW] AI review received ({len(content)} chars)")
            return content.strip()

        print("[REVIEW] AI returned empty content")
        return None

    except requests.exceptions.Timeout:
        print("[REVIEW] OpenRouter API timed out")
        return None
    except Exception as e:
        print(f"[REVIEW] OpenRouter API exception: {e}")
        return None
