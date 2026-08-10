import { defineConfig } from "vite";

// Relative base ("./") means the built site works when served from a domain
// root (custom domain, Netlify, Vercel) AND from a GitHub Pages project path
// like https://<user>.github.io/<repo>/ without any extra configuration.
export default defineConfig({
  base: "./",
  build: {
    outDir: "dist",
    assetsDir: "assets",
  },
});
