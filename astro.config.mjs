import { defineConfig } from "astro/config";
import sitemap from "@astrojs/sitemap";

export default defineConfig({
  site: "https://operate-iq.com",
  trailingSlash: "never",
  compressHTML: true,
  integrations: [sitemap()],
});
