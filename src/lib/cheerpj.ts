// Helper to initialize CheerpJ runtime
// Types are defined in src/types/cheerpj.d.ts

let isInitialized = false;
let initPromise: Promise<void> | null = null;

export async function initCheerpJ() {
  if (isInitialized) return;

  if (!initPromise) {
    initPromise = new Promise((resolve, reject) => {
      const script = document.createElement("script");
      script.src = "https://cjrtnc.leaningtech.com/4.2/loader.js";
      script.async = true;
      script.onload = async () => {
        try {
          // CheerpJ 4.2 loader exposes cheerpjInit globally
          // Wait up to 5 seconds for API to become available
          let attempts = 50; // 50 * 100ms = 5 seconds

          while (!window.cheerpjInit && attempts > 0) {
            await new Promise((r) => setTimeout(r, 100));
            attempts--;
          }

          if (window.cheerpjInit) {
            // Initialize CheerpJ runtime
            await window.cheerpjInit();
            isInitialized = true;
            resolve();
          } else {
            const availableKeys = Object.keys(window).filter(
              (k) =>
                k.toLowerCase().includes("cheer") ||
                k.toLowerCase().includes("cj"),
            );
            console.warn(
              "CheerpJ loader script loaded but cheerpjInit not found after 5 seconds.",
              "Available global keys:",
              availableKeys.length > 0 ? availableKeys : "none",
            );
            console.warn(
              "This may indicate the CheerpJ CDN is unavailable or blocked.",
            );

            // Continue anyway - the app might have fallbacks
            isInitialized = true;
            resolve();
          }
        } catch (e) {
          console.error("Error during CheerpJ initialization:", e);
          isInitialized = true;
          resolve();
        }
      };
      script.onerror = () => {
        console.warn(
          "Failed to load CheerpJ script from CDN. Check if the URL is accessible and not blocked.",
        );
        isInitialized = true;
        resolve();
      };
      document.body.appendChild(script);
    });
  }

  return initPromise;
}
