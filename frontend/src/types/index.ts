export type Theme = "dark" | "light";

export type TerminalStatus =
    | "idle"
    | "connecting"
    | "compiling"
    | "running"
    | "exited"
    | "error";

export interface LogEntry {
    text: string;
    type: "info" | "success" | "error";
    timestamp: number;
}

export interface ErrorReview {
    error_type: "compilation" | "runtime";
    title: string;
    raw_error: string;
    explanation: string;
    line_numbers: number[];
    suggestions: string[];
}
