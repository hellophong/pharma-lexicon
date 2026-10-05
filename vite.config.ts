import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
export default defineConfig({
  plugins: [react()],
  // Keep the local preview at /; GitHub Pages builds set the repository prefix.
  base: process.env.VITE_BASE_PATH || "/",
});
