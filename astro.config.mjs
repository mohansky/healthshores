import tailwindcss from "@tailwindcss/vite";
// @ts-check
import { defineConfig } from "astro/config";
import { existsSync } from "node:fs";

import react from "@astrojs/react";

import mdx from "@astrojs/mdx";

import sitemap from "@astrojs/sitemap";


import cloudflare from "@astrojs/cloudflare";

// process.env does not include .env / .env.local values inside astro.config,
// so load them explicitly. Defaults to the production domain so a build
// without env files never ships localhost URLs in canonical/sitemap/robots.
for (const file of [".env.local", ".env"]) {
  if (!process.env.SITE_URL && existsSync(file)) process.loadEnvFile?.(file);
}
const SITE_URL = (process.env.SITE_URL || "https://www.healthshores.com").replace(/\/+$/, "");

// https://astro.build/config
export default defineConfig({
  site: SITE_URL,
  output: "static",
image: {
    service: {
      entrypoint: 'astro/assets/services/sharp',
      config: {
        limitInputPixels: false,
      }
    }
  },
  vite: {
    plugins: [tailwindcss()],
    assetsInclude: ["**/*.woff2"],
  },

  integrations: [
    react(),
    mdx(),
    sitemap({
      filter: (page) => !page.includes("/draft/"),
      changefreq: "weekly",
      priority: 0.7,
      lastmod: new Date(),
      serialize: (item) => {
        // Higher priority for homepage
        if (item.url === `${SITE_URL}/`) {
          item.priority = 1.0;
          item.changefreq = "daily";
        }
        // Medium priority for blog list page
        if (
          item.url === `${SITE_URL}/blog/` ||
          item.url === `${SITE_URL}/blog`
        ) {
          item.priority = 0.8;
          item.changefreq = "weekly";
        }
        // Lower priority for individual blog posts
        if (item.url.includes("/blog/") && item.url !== `${SITE_URL}/blog/`) {
          item.priority = 0.6;
          item.changefreq = "monthly";
        }
        return item;
      },
    }),
  ],

  adapter: cloudflare(),
});
