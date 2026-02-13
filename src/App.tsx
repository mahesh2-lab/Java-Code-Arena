import React, { useState, useCallback, useEffect } from "react";
import { Navbar } from "./components/NavBar";
import { Editor } from "./components/Editor";
import { Console, LogEntry } from "./components/Console";
import { useCheerpJ } from "./hooks/useCheerpJ";

const DEFAULT_CODE = `public class Main {
    public static void main(String[] args) {
        System.out.println("Hello from Java!");
    }
}`;

export type Theme = "dark" | "light";

export default function App() {
  const [code, setCode] = useState<string>(
    () => localStorage.getItem("java_code") || DEFAULT_CODE,
  );
  const [output, setOutput] = useState<LogEntry[]>([]);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [execTime, setExecTime] = useState<number | null>(null);
  const [serverReady, setServerReady] = useState<boolean>(false);
  const [theme, setTheme] = useState<Theme>(
    () => (localStorage.getItem("app_theme") as Theme) || "dark",
  );
  const [showConsole, setShowConsole] = useState<boolean>(true);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [editorWidth, setEditorWidth] = useState<number>(
    () => Number(localStorage.getItem("editor_width")) || 55,
  );
  const [isDragging, setIsDragging] = useState<boolean>(false);

  const { isReady } = useCheerpJ();

  const handleThemeChange = (newTheme: Theme) => {
    setTheme(newTheme);
    localStorage.setItem("app_theme", newTheme);
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch((err) => {
        console.error(`Error attempting to enable fullscreen: ${err.message}`);
      });
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
    };
  }, []);

  // Handle divider dragging
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      const mainElement = document.querySelector("main");
      if (!mainElement) return;

      const rect = mainElement.getBoundingClientRect();
      const offsetX = e.clientX - rect.left;
      const percentage = (offsetX / rect.width) * 100;

      // Clamp between 20% and 80%
      const clampedPercentage = Math.max(20, Math.min(80, percentage));
      setEditorWidth(clampedPercentage);
      localStorage.setItem("editor_width", clampedPercentage.toString());
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
      document.body.style.cursor = "col-resize";
      document.body.style.userSelect = "none";
    } else {
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
    }

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDragging]);

  const log = useCallback(
    (text: string, type: "info" | "success" | "error" = "info") => {
      setOutput((prev) => [...prev, { text, type, timestamp: Date.now() }]);
    },
    [],
  );

  // Check if compiler server is available
  useEffect(() => {
    const checkServer = async () => {
      try {
        const response = await fetch(`/api/health`);
        if (response.ok) {
          const data = await response.json();
          setServerReady(data.java_available);
        }
      } catch (err) {
        console.warn("Java compiler server not available");
        setServerReady(false);
      }
    };

    checkServer();
    const interval = setInterval(checkServer, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleRun = useCallback(async () => {
    if (!isReady || isRunning) return;

    setIsRunning(true);
    setExecTime(null);
    setOutput([]);
    const start = performance.now();

    const originalLog = console.log;
    const originalErr = console.error;

    console.log = (...args: unknown[]) => {
      const msg = args.join(" ");
      if (!msg.startsWith("[CheerpJ]")) log(msg, "success");
    };

    console.error = (...args: unknown[]) => {
      const msg = args.join(" ");
      if (!msg.startsWith("[CheerpJ]")) log(msg, "error");
    };

    try {
      if (!serverReady) {
        throw new Error(
          "Java Compiler Server not available. Make sure Python server is running.",
        );
      }

      const response = await fetch(`/api/compile`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
      });

      const result = await response.json();

      if (!result.success) {
        log(`Error: ${result.error}`, "error");
      } else {
        if (result.output) {
          const lines = result.output.trim().split("\n");
          lines.forEach((line: string) => {
            if (line.trim()) log(line, "success");
          });
        }

        if (result.error && result.error.trim()) {
          log(result.error, "error");
        }
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      log(`Error: ${msg}`, "error");
    } finally {
      console.log = originalLog;
      console.error = originalErr;

      const end = performance.now();
      setExecTime(Math.round(end - start));
      setIsRunning(false);
    }
  }, [isReady, isRunning, code, log, serverReady]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
        e.preventDefault();
        handleRun();
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [handleRun]);

  const handleCodeChange = (val: string | undefined) => {
    if (val !== undefined) {
      setCode(val);
      localStorage.setItem("java_code", val);
    }
  };

  return (
    <div
      data-theme={theme}
      className="flex flex-col h-screen w-screen overflow-hidden"
      style={{
        background: "var(--bg-root)",
        color: "var(--text-primary)",
        fontFamily: "'Outfit', 'Inter', -apple-system, sans-serif",
      }}
    >
      {/* Top Navigation Bar */}
      <Navbar
        theme={theme}
        onThemeChange={handleThemeChange}
        onRun={handleRun}
        isRunning={isRunning}
        isReady={isReady}
        showConsole={showConsole}
        onToggleConsole={() => setShowConsole(!showConsole)}
        isFullscreen={isFullscreen}
        onToggleFullscreen={toggleFullscreen}
      />

      {/* Main Content: Editor (Left) | Divider | Console (Right) */}
      <main className="flex flex-1 overflow-hidden responsive-main">
        {/* Left: Code Editor Panel */}
        <div
          className="flex flex-col min-h-0 responsive-editor"
          style={{
            width: showConsole ? `${editorWidth}%` : "100%",
            flexShrink: 0,
          }}
        >
          <Editor code={code} onChange={handleCodeChange} theme={theme} />
        </div>

        {showConsole && (
          <>
            {/* Resizable Divider */}
            <div
              className="theme-divider shrink-0 responsive-divider group"
              style={{
                width: "5px",
                cursor: "col-resize",
                position: "relative",
                background: isDragging ? "var(--divider-color)" : "transparent",
              }}
              onMouseDown={() => setIsDragging(true)}
            >
              <div
                className="absolute inset-y-0 left-1/2 -translate-x-1/2"
                style={{
                  width: "1px",
                  background: "var(--divider-color)",
                }}
              />
              <div
                className="absolute inset-y-0 left-0 right-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                style={{
                  background: "var(--divider-color)",
                }}
              />
            </div>

            {/* Right: Console Output Panel */}
            <div
              className="flex flex-col min-h-0 responsive-console"
              style={{
                width: `${100 - editorWidth}%`,
                flexShrink: 0,
              }}
            >
              <Console
                output={output}
                executionTime={execTime}
                onClear={() => setOutput([])}
                theme={theme}
              />
            </div>
          </>
        )}
      </main>
    </div>
  );
}
