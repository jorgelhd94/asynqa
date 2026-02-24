import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import wails from "@wailsio/runtime/plugins/vite";
import tailwindcss from "@tailwindcss/vite";
import { tanstackRouter } from "@tanstack/router-plugin/vite";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    tanstackRouter({
      target: "react",
      autoCodeSplitting: true,
    }),
    react(),
    wails("./bindings"),
    tailwindcss(),
  ],
  server: {
    port: 9245,
    strictPort: true,
    host: "127.0.0.1",
  },
});
