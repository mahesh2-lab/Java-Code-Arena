import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import tailwindcss from "@tailwindcss/vite";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";

const env = loadEnv(process.env.NODE_ENV || 'development', process.cwd(), '');
const backendPort = env.VITE_BACKEND_PORT || "5000";
const backendUrl = env.VITE_API_URL || `http://localhost:${backendPort}`;

export default defineConfig({
  plugins: [
    tailwindcss(),
    react(),
    runtimeErrorOverlay(),
    ...(process.env.NODE_ENV !== "production" &&
      process.env.REPL_ID !== undefined
      ? [
        await import("@replit/vite-plugin-cartographer").then((m) =>
          m.cartographer(),
        ),
        await import("@replit/vite-plugin-dev-banner").then((m) =>
          m.devBanner(),
        ),
      ]
      : []),
  ],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "src"),
      "@shared": path.resolve(import.meta.dirname, "shared"),
      "@assets": path.resolve(import.meta.dirname, "attached_assets"),
    },
  },
  build: {
    outDir: path.resolve(import.meta.dirname, "dist"),
    emptyOutDir: true,
    cssCodeSplit: true,
    minify: "terser",
    terserOptions: {
      compress: {
        drop_console: false,
        drop_debugger: true,
        passes: 2,
      },
      format: {
        comments: false,
      },
    },
    chunkSizeWarningLimit: 1000,
    target: "es2020",
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: {
          'ui-vendor': ['@radix-ui/react-popover', '@radix-ui/react-slot', 'lucide-react', 'vaul'],
          'query-vendor': ['@tanstack/react-query'],
          'socket-vendor': ['socket.io-client', 'engine.io-client'],
        },
      },
    },
  },

  server: {
    host: true,
    fs: {
      strict: true,
      deny: ["**/.*"],
    },
    proxy: {
      // REST API
      "/api": {
        target: backendUrl,
        changeOrigin: true,
      },
      // Share routes
      "/s/": {
        target: backendUrl,
        changeOrigin: true,
      },
      // Socket.IO — must use ws upgrade
      "/socket.io": {
        target: backendUrl,
        changeOrigin: true,
        ws: true,           // proxy WebSocket upgrade
      },
    },
  },
  preview: {
    host: true,
    port: 3000,
    proxy: {
      "/api": {
        target: backendUrl,
        changeOrigin: true,
      },
      "/s/": {
        target: backendUrl,
        changeOrigin: true,
      },
      "/socket.io": {
        target: backendUrl,
        changeOrigin: true,
        ws: true,
      },
    },
  },
});
