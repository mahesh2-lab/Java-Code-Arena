import React from "react";
import { TerminalIcon, GitGraph } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Console } from "./Console";
import type { XTermTerminalRef } from "./XTermTerminal";
import { Timeline } from "./Timeline/Timeline";

const XTermTerminal = React.lazy(() => import("./XTermTerminal").then(m => ({ default: m.XTermTerminal })));
const MemoryGraph = React.lazy(() => import("./Graph/MemoryGraph").then(m => ({ default: m.MemoryGraph })));
import { Theme, LogEntry, ErrorReview, TerminalStatus } from "../types";
import { useIsMobile } from "../hooks/use-mobile";

export interface TerminalPanelProps {
    theme: Theme;
    xtermRef: React.MutableRefObject<XTermTerminalRef | null>;
    interactiveMode: boolean;
    terminalStatus: TerminalStatus;
    output: LogEntry[];
    execTime: number | null;
    stdinInput: string;
    errorReview: ErrorReview | null;
    aiReview: string | null;
    onToggleMode: () => void;
    onStop: () => void;
    onClear: () => void;
    onClearStatic: () => void;
    onStdinChange: (v: string) => void;
    onStatusChange: (s: TerminalStatus) => void;
    // Visualization props
    activeTab: string;
    onTabChange: (v: string) => void;
    visualizeSteps: any[];
    currentStep: number;
    onStepChange: (s: number) => void;
    isVisualizing: boolean;
    onVisualize: () => void;
    showGraphTab: boolean;
    onToggleGraphTab: () => void;
}


export function TerminalPanel({
    theme,
    xtermRef,
    interactiveMode,
    terminalStatus,
    output,
    execTime,
    stdinInput,
    errorReview,
    aiReview,
    onToggleMode,
    onStop,
    onClear,
    onClearStatic,
    onStdinChange,
    onStatusChange,
    activeTab,
    onTabChange,
    visualizeSteps,
    currentStep,
    onStepChange,
    isVisualizing,
    onVisualize,
    showGraphTab,
    onToggleGraphTab,
}: TerminalPanelProps) {
    const isMobile = useIsMobile();
    const isProcessActive =
        terminalStatus === "running" || terminalStatus === "compiling";

    const currentSnapshot = visualizeSteps[currentStep] || null;

    return (
        <div
            style={{
                display: "flex",
                flexDirection: "column",
                height: "100%",
                overflow: "hidden",
                background: "var(--bg-console)",
            }}
        >
            <Tabs
                value={activeTab}
                onValueChange={onTabChange}
                className="flex flex-col h-full"
            >
                {/* ── Header bar ── */}
                <div
                    className="terminal-panel-header px-2 sm:px-4"
                    style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        height: 34,
                        minHeight: 34,
                        background: "var(--bg-panel-header)",
                        borderBottom: "1px solid var(--border-subtle)",
                        flexShrink: 0,
                        gap: 8,
                    }}
                >
                    <TabsList
                        className="bg-transparent border-none gap-1 h-8 p-0"
                        style={{ background: "transparent" }}
                    >
                        <TabsTrigger
                            value="console"
                            className="px-3 h-7 text-[10px] font-bold uppercase tracking-wider rounded-md transition-all
              data-[state=active]:bg-zinc-800 data-[state=active]:text-zinc-100
              data-[state=inactive]:text-slate-500 data-[state=inactive]:hover:text-slate-300"
                        >
                            <TerminalIcon className="w-3 h-3 mr-1.5" />
                            Console
                        </TabsTrigger>
                        {showGraphTab && !isMobile && (
                            <TabsTrigger
                                value="graph"
                                onClick={() => {
                                    if (visualizeSteps.length === 0 && !isVisualizing) {
                                        onVisualize();
                                    }
                                }}
                                className="px-3 h-7 text-[10px] font-bold uppercase tracking-wider rounded-md transition-all
                data-[state=active]:bg-zinc-800 data-[state=active]:text-zinc-100
                data-[state=inactive]:text-slate-500 data-[state=inactive]:hover:text-slate-300"
                            >
                                <GitGraph className="w-3 h-3 mr-1.5" />
                                Memory Graph
                            </TabsTrigger>
                        )}
                    </TabsList>


                    {/* Right — control buttons */}
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        {!isMobile && (
                            <button
                                id="toggle-graph-tab-button"
                                className="hdr-btn"
                                onClick={onToggleGraphTab}
                                title={showGraphTab ? "Hide Memory Graph" : "Show Memory Graph"}
                                style={{
                                    padding: "2px 6px",
                                    height: 22,
                                    borderRadius: 4,
                                    background: showGraphTab ? "rgba(16,185,129,0.1)" : "var(--bg-surface)",
                                    color: showGraphTab ? "#10b981" : "var(--text-muted)",
                                    border: "1px solid var(--border-subtle)",
                                    cursor: "pointer",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    transition: "all 0.2s ease",
                                }}
                            >
                                <GitGraph className={`w-3 h-3 ${showGraphTab ? 'opacity-100' : 'opacity-40'}`} />
                            </button>
                        )}

                        {activeTab === "console" && (
                            <>
                                {interactiveMode && isProcessActive && (
                                    <button
                                        id="stop-process-button"
                                        className="hdr-btn"
                                        onClick={onStop}
                                        title="Kill running process"
                                        style={{
                                            fontSize: 10,
                                            fontWeight: 700,
                                            padding: "2px 8px",
                                            height: 22,
                                            borderRadius: 4,
                                            background: "rgba(239,68,68,0.14)",
                                            color: "#f87171",
                                            border: "1px solid rgba(239,68,68,0.35)",
                                            cursor: "pointer",
                                            fontFamily: "'Outfit', sans-serif",
                                            whiteSpace: "nowrap",
                                        }}
                                    >
                                        ■ Stop
                                    </button>
                                )}
                                <button
                                    id="clear-terminal-button"
                                    className="hdr-btn"
                                    onClick={interactiveMode ? onClear : onClearStatic}
                                    title="Clear terminal"
                                    style={{
                                        padding: "2px 6px",
                                        height: 22,
                                        borderRadius: 4,
                                        background: "var(--bg-surface)",
                                        color: "var(--text-muted)",
                                        border: "1px solid var(--border-subtle)",
                                        cursor: "pointer",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                    }}
                                >
                                    <svg
                                        width="11"
                                        height="11"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="2.2"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                    >
                                        <polyline points="3 6 5 6 21 6" />
                                        <path d="M19 6l-1 14H6L5 6" />
                                        <path d="M10 11v6M14 11v6" />
                                        <path d="M9 6V4h6v2" />
                                    </svg>
                                </button>
                            </>
                        )}

                        {activeTab === "graph" && visualizeSteps.length > 0 && (
                            <div
                                className="flex items-center gap-2 px-2 py-0.5 rounded-full border"
                                style={{
                                    background: "var(--bg-surface)",
                                    borderColor: "var(--border-subtle)",
                                }}
                            >
                                <span
                                    className="text-[9px] font-bold"
                                    style={{ color: "var(--text-muted)" }}
                                >
                                    STEP {currentStep + 1}/{visualizeSteps.length}
                                </span>
                            </div>
                        )}
                    </div>

                </div>

                {/* ── Content area ── */}
                <div style={{ flex: 1, minHeight: 0, position: "relative" }}>
                    {/* Console Tab Content — Manually persisted by conditional display */}
                    <div
                        style={{
                            display: activeTab === 'console' ? 'block' : 'none',
                            position: "absolute",
                            inset: 0,
                            overflow: "hidden",
                            height: "100%"
                        }}
                    >
                        <div style={{ position: "absolute", inset: 0, overflow: "hidden" }}>
                            <div
                                style={{
                                    position: "absolute",
                                    inset: 0,
                                    visibility: interactiveMode ? "visible" : "hidden",
                                    pointerEvents: interactiveMode ? "auto" : "none",
                                }}
                            >
                                <React.Suspense fallback={<div className="font-mono text-[10px] text-slate-500 p-4 absolute inset-0">Loading Terminal...</div>}>
                                    <XTermTerminal
                                        ref={xtermRef as React.RefObject<XTermTerminalRef>}
                                        theme={theme}
                                        onStatusChange={onStatusChange}
                                    />
                                </React.Suspense>
                            </div>

                            {!interactiveMode && (
                                <div
                                    style={{
                                        position: "absolute",
                                        inset: 0,
                                        overflow: "hidden",
                                    }}
                                >
                                    <Console
                                        output={output}
                                        executionTime={execTime}
                                        onClear={onClearStatic}
                                        theme={theme}
                                        stdinInput={stdinInput}
                                        onStdinChange={onStdinChange}
                                        errorReview={errorReview}
                                        aiReview={aiReview}
                                        hideHeader={true}
                                    />
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Graph Tab Content */}
                    <div
                        style={{
                            display: activeTab === 'graph' ? 'block' : 'none',
                            position: "absolute",
                            inset: 0,
                            overflow: "hidden",
                            height: "100%"
                        }}
                    >
                        {isVisualizing ? (
                            <div className="flex flex-col items-center justify-center h-full gap-4 bg-slate-900/40 backdrop-blur-sm">
                                <div className="relative">
                                    <div className="w-16 h-16 rounded-full border-t-2 border-r-2 border-emerald-500 animate-spin" />
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <GitGraph className="w-6 h-6 text-emerald-500 animate-pulse" />
                                    </div>
                                </div>
                                <div className="flex flex-col items-center gap-1">
                                    <p className="text-zinc-200 font-bold text-xs tracking-[0.2em] uppercase">Simulating Runtime</p>
                                    <p className="text-zinc-500 text-[10px] font-mono">Mapping stack & heap snapshots...</p>
                                </div>
                            </div>
                        ) : visualizeSteps.length > 0 ? (
                            <div className="flex flex-col h-full bg-slate-950">
                                <div className="flex-1 min-h-0 relative">
                                    <React.Suspense fallback={<div className="flex h-full items-center justify-center text-slate-500 text-[10px] uppercase tracking-widest">Loading Graph...</div>}>
                                        <MemoryGraph
                                            nodes={currentSnapshot?.graph.nodes || []}
                                            edges={currentSnapshot?.graph.edges || []}
                                        />
                                    </React.Suspense>
                                </div>
                                <Timeline
                                    currentStep={currentStep}
                                    totalSteps={visualizeSteps.length}
                                    onStepChange={onStepChange}
                                    description={currentSnapshot?.description || "Initial state"}
                                />
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center h-full gap-3 bg-slate-900/20 text-center px-6">
                                <div className="w-12 h-12 rounded-xl bg-slate-800/50 flex items-center justify-center border border-slate-700/50 mb-2">
                                    <GitGraph className="w-6 h-6 text-slate-500" />
                                </div>
                                <h3 className="text-zinc-300 font-bold uppercase tracking-wider text-[11px]">No Active Session</h3>
                                <p className="text-slate-500 text-[10px] max-w-[200px] leading-relaxed">
                                    Your program's memory will appear here once analysis is complete.
                                </p>
                                <button
                                    onClick={onVisualize}
                                    className="mt-2 px-4 py-1.5 rounded-md bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[10px] font-bold uppercase tracking-widest hover:bg-emerald-500/20 transition-all"
                                >
                                    Analyze Now
                                </button>
                            </div>
                        )}
                    </div>
                </div>

            </Tabs>
        </div>
    );
}
