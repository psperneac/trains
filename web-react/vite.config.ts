import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  plugins: [tailwindcss(), tsconfigPaths()],
  server: {
    port: 3000
  },
  build: {
    rollupOptions: {
      input: {
        main: './app/entry.client.tsx'
      }
    }
  }
});
