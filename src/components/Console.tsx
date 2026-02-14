import React, { useRef, useEffect } from "react";
import { Trash2, Terminal, ChevronRight } from "lucide-react";
import { FlickeringGrid } from "./ui/flickering-grid";
import { Theme } from "../App";

export interface LogEntry {
  text: string;
  type: "info" | "success" | "error";
  timestamp: number;
}

interface ConsoleProps {
  output: LogEntry[];
  executionTime: number | null;
  onClear: () => void;
  theme: Theme;
}

export const Console: React.FC<ConsoleProps> = ({
  output,
  executionTime,
  onClear,
  theme,
}) => {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [output]);

  const flickerColor =
    theme === "light" ? "rgb(79, 70, 229)" : "rgb(99, 102, 241)";

  return (
    <div
      className="flex flex-col h-full"
      style={{ background: "var(--bg-console)" }}
    >
      {/* Console Header */}
      <div
        className="px-4 py-2.5 flex items-center justify-between shrink-0 responsive-status-bar"
        style={{
          background: "var(--bg-panel-header)",
          borderBottom: "1px solid var(--border-subtle)",
        }}
      >
        <div className="flex items-center gap-2 sm:gap-2.5">
          <Terminal
            className="w-4 h-4"
            style={{ color: "var(--accent-terminal)" }}
          />
          <span
            className="text-xs font-semibold uppercase tracking-[0.12em]"
            style={{
              color: "var(--text-muted)",
              fontFamily: "'Outfit', sans-serif",
            }}
          >
            <span className="hidden sm:inline">Console Output</span>
            <span className="sm:hidden">Output</span>
          </span>
          {executionTime !== null && (
            <span
              className="text-[10px] font-mono ml-1 sm:ml-2 px-2 py-0.5 rounded-full"
              style={{
                color: "var(--text-muted)",
                background: "var(--bg-surface)",
                border: "1px solid var(--border-subtle)",
              }}
            >
              {executionTime}ms
            </span>
          )}
        </div>

        {/* Clear */}
        <button
          id="clear-console-button"
          onClick={onClear}
          className="p-1.5 rounded-md transition-all duration-200"
          style={{
            background: "var(--bg-surface)",
            color: "var(--text-muted)",
          }}
          title="Clear console"
          onMouseEnter={(e) => {
            const el = e.currentTarget as HTMLButtonElement;
            el.style.background = "var(--bg-surface-hover)";
            el.style.color = "var(--text-secondary)";
          }}
          onMouseLeave={(e) => {
            const el = e.currentTarget as HTMLButtonElement;
            el.style.background = "var(--bg-surface)";
            el.style.color = "var(--text-muted)";
          }}
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Console Output Area with FlickeringGrid background */}
      <div
        className="flex-1 relative overflow-hidden"
        style={{ background: "var(--bg-console)" }}
      >
        {/* FlickeringGrid as background */}
        <div className="absolute inset-0 pointer-events-none">
          <FlickeringGrid
            squareSize={4}
            gridGap={6}
            flickerChance={0.3}
            color={flickerColor}
            maxOpacity={theme === "light" ? 0.12 : 0.15}
            className="w-full h-full"
          />
        </div>

        {/* Scrollable console content on top */}
        <div className="absolute inset-0 overflow-auto p-4 font-mono text-sm">
          {output.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-3 select-none">
              <Terminal
                className="w-10 h-10"
                style={{ color: "var(--text-muted)" }}
              />
              <p
                className="text-xs font-medium tracking-wider uppercase"
                style={{ color: "var(--text-secondary)" }}
              >
                No output yet
              </p>
              <p className="text-[10px]" style={{ color: "var(--text-muted)" }}>
                Press{" "}
                <kbd
                  className="px-1.5 py-0.5 rounded mx-0.5"
                  style={{
                    background: "var(--kbd-bg)",
                    border: "1px solid var(--kbd-border)",
                    color: "var(--kbd-text)",
                  }}
                >
                  Ctrl
                </kbd>{" "}
                +{" "}
                <kbd
                  className="px-1.5 py-0.5 rounded mx-0.5"
                  style={{
                    background: "var(--kbd-bg)",
                    border: "1px solid var(--kbd-border)",
                    color: "var(--kbd-text)",
                  }}
                >
                  Enter
                </kbd>{" "}
                to run
              </p>
            </div>
          ) : (
            <div className="space-y-0.5">
              {output.map((line, i) => (
                <div
                  key={`${line.timestamp}-${i}`}
                  className="flex items-start gap-2 py-1 px-2 rounded-md transition-colors duration-150 animate-fade-in"
                  style={{
                    fontFamily: "'JetBrains Mono', monospace",
                    fontSize: "13px",
                    lineHeight: "1.7",
                    animationDelay: `${i * 30}ms`,
                    color:
                      line.type === "error"
                        ? "var(--accent-error)"
                        : line.type === "success"
                          ? "var(--accent-success)"
                          : "var(--accent-info)",
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLDivElement).style.background =
                      "var(--bg-surface)";
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLDivElement).style.background =
                      "transparent";
                  }}
                >
                  <ChevronRight className="w-3 h-3 mt-[5px] shrink-0 opacity-30" />
                  {line.type === "error" && (
                    <span className="shrink-0 text-[10px] font-bold uppercase tracking-wider mt-[3px] opacity-50">
                      ERR
                    </span>
                  )}
                  <span className="break-all">{line.text}</span>
                </div>
              ))}
            </div>
          )}
          <div ref={bottomRef} />
        </div>
      </div>
    </div>
  );
};
