// src/types/cheerpj.d.ts
export {};

declare global {
  interface Window {
    cheerpjInit(options?: {
      status?: "default" | "splash" | "hidden";
      // Add other init options if needed
    }): Promise<void>;
    
    cheerpjRunMain(
      className: string, 
      method: string | null, 
      ...args: string[]
    ): Promise<void>;
    
    // For file operations if using CheerpJ IO
    cheerpjCreateDisplay(width: number, height: number): void;
  }
}