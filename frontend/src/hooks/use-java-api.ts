import { useQuery, useMutation } from "@tanstack/react-query";
import { fetchApi } from "../lib/api-client";

export interface CompileResult {
    success: boolean;
    output?: string;
    error?: string;
    error_review?: any;
    ai_review?: string;
}

export interface VisualizeResult {
    success: boolean;
    steps: any[];
    error?: string;
}

export interface HealthResult {
    status: string;
    java_available: boolean;
}

/**
 * Hook for periodic server health checking
 */
export function useHealthCheck() {
    return useQuery({
        queryKey: ["health"],
        queryFn: () => fetchApi<HealthResult>("/api/health"),
        refetchInterval: 5000,
        retry: true,
    });
}

/**
 * Hook for compiling and running Java code (REST mode)
 */
export function useCompile() {
    return useMutation({
        mutationFn: (data: { code: string; stdin?: string }) =>
            fetchApi<CompileResult>("/api/compile", {
                method: "POST",
                body: JSON.stringify(data),
            }),
    });
}

/**
 * Hook for generating visualization steps
 */
export function useVisualize() {
    return useMutation({
        mutationFn: (data: { code: string }) =>
            fetchApi<VisualizeResult>("/api/visualize", {
                method: "POST",
                body: JSON.stringify(data),
            }),
    });
}
