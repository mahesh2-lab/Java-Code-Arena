import { useState, useEffect, useCallback } from "react";

const CHEERPJ_URL = "https://cjrtnc.leaningtech.com/4.2/loader.js";

// Global flag to prevent multiple initialization attempts
let initInProgress = false;
let initComplete = false;

interface CheerpJState {
  isReady: boolean;
  error: string | null;
  runCommand: (
    className: string,
    method: string | null,
    ...args: string[]
  ) => Promise<void>;
}

export const useCheerpJ = (): CheerpJState => {
  const [isReady, setIsReady] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadRuntime = async () => {
      // Skip if already initialized or initialization in progress
      if (initComplete || initInProgress) {
        if (initComplete) {
          setIsReady(true);
        }
        return;
      }

      initInProgress = true;

      try {
        if (!document.querySelector(`script[src="${CHEERPJ_URL}"]`)) {
          const script = document.createElement("script");
          script.src = CHEERPJ_URL;
          script.async = true;
          document.head.appendChild(script);

          await new Promise<void>((resolve, reject) => {
            script.onload = () => resolve();
            script.onerror = () =>
              reject(new Error("Failed to load CheerpJ script"));
          });
        }

        // Wait for cheerpjInit to become available (up to 5 seconds)
        let attempts = 50;
        while (!window.cheerpjInit && attempts > 0) {
          await new Promise((r) => setTimeout(r, 100));
          attempts--;
        }

        if (!window.cheerpjInit) {
          throw new Error(
            "CheerpJ API not available after 5 seconds. The CDN may be blocked or unavailable.",
          );
        }

        // Initialize in hidden mode (no overlay)
        await window.cheerpjInit({ status: "hidden" });
        initComplete = true;
        initInProgress = false;
        setIsReady(true);
      } catch (err) {
        initInProgress = false;
        const message =
          err instanceof Error ? err.message : "Unknown CheerpJ Error";
        setError(message);
        console.error(message);
      }
    };

    loadRuntime();
  }, []);

  const runCommand = useCallback(
    async (className: string, method: string | null, ...args: string[]) => {
      if (!isReady) throw new Error("Runtime not ready");
      // Ensure we await the promise returned by the runtime
      if (window.cheerpjRunMain) {
        await window.cheerpjRunMain(className, method || "", ...args);
      }
    },
    [isReady],
  );

  return { isReady, error, runCommand };
};
