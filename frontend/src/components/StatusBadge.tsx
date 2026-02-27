import React from "react";
import { TerminalStatus } from "../types";

export function StatusBadge({ status }: { status: TerminalStatus }) {
    const CONFIG: Record<
        TerminalStatus,
        { label: string; color: string; bg: string; border: string; dot?: string }
    > = {
        idle: {
            label: "Ready",
            color: "#6b7280",
            bg: "rgba(107,114,128,0.1)",
            border: "rgba(107,114,128,0.2)",
        },
        connecting: {
            label: "Connecting…",
            color: "#f59e0b",
            bg: "rgba(245,158,11,0.1)",
            border: "rgba(245,158,11,0.3)",
            dot: "#f59e0b",
        },
        compiling: {
            label: "Compiling…",
            color: "#60a5fa",
            bg: "rgba(96,165,250,0.1)",
            border: "rgba(96,165,250,0.3)",
            dot: "#60a5fa",
        },
        running: {
            label: "Running",
            color: "#34d399",
            bg: "rgba(52,211,153,0.1)",
            border: "rgba(52,211,153,0.3)",
            dot: "#34d399",
        },
        exited: {
            label: "Exited",
            color: "#a78bfa",
            bg: "rgba(167,139,250,0.1)",
            border: "rgba(167,139,250,0.2)",
        },
        error: {
            label: "Error",
            color: "#f87171",
            bg: "rgba(248,113,113,0.1)",
            border: "rgba(248,113,113,0.3)",
        },
    };

    const c = CONFIG[status];

    return (
        <span
            style={{
                fontSize: 10,
                fontWeight: 600,
                padding: "1px 6px",
                borderRadius: 9999,
                background: c.bg,
                color: c.color,
                border: `1px solid ${c.border}`,
                fontFamily: "'JetBrains Mono', monospace",
                display: "inline-flex",
                alignItems: "center",
                gap: 4,
                lineHeight: 1.6,
            }}
        >
            {c.dot && (
                <span
                    style={{
                        width: 5,
                        height: 5,
                        borderRadius: "50%",
                        background: c.dot,
                        flexShrink: 0,
                        animation:
                            status === "running" || status === "compiling"
                                ? "pulse 1.5s ease-in-out infinite"
                                : "none",
                    }}
                />
            )}
            {c.label}
        </span>
    );
}
