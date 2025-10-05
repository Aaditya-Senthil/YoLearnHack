import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

export default defineConfig(({ mode }) => ({
  server: {
    host: "localhost",
    port: 8080,
  },
  plugins: [
    react(),
    // Removed: componentTagger()
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  define: {
    global: "window",
    "process.env": {}, // polyfill for process.env
  },
  optimizeDeps: {
    include: ["aws-sdk"], // pre-bundle AWS SDK
  },
}));
