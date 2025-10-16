import tailwindcss from "@tailwindcss/vite";
// @ts-check
import { defineConfig } from "astro/config";

import react from "@astrojs/react";

import mdx from "@astrojs/mdx";

import sitemap from "@astrojs/sitemap";

import partytown from "@astrojs/partytown";

import cloudflare from "@astrojs/cloudflare";

const SITE_URL = process.env.SITE_URL || "http://localhost:4321";

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
    partytown({
      config: {
        debug: false,
        logCalls: false,
        logGetters: false,
        logSetters: false,
        logImageRequests: false,
        logScriptExecution: false,
        logStackTraces: false,
        forward: [["dataLayer.push"]],
        resolveUrl: (url) => {
          const siteUrl = `${SITE_URL}/`;
          const proxyUrl = new URL(siteUrl);
          if (
            url.hostname === "googleads.g.doubleclick.net" ||
            url.hostname === "www.googleadservices.com" ||
            url.hostname === "googletagmanager.com" ||
            url.hostname === "www.googletagmanager.com" ||
            url.hostname === "region1.google-analytics.com" ||
            url.hostname === "google.com"
          ) {
            proxyUrl.searchParams.append("apiurl", url.href);
            return proxyUrl;
          }
          return url;
        },
      },
    }),
  ],

  adapter: cloudflare(),
});
