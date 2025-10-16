import { glob } from "astro/loaders";
import { defineCollection, z } from "astro:content";

const globalData = defineCollection({
  type: "data",
  schema: z.object({
    site: z.object({
      name: z.string(),
      title: z.string(),
      description: z.string(),
      email: z.string().email(),
      phone: z.string(),
      address: z.string().optional(),
    }),
    navigation: z.array(
      z.object({
        label: z.string(),
        href: z.string(),
      })
    ),
    social: z
      .object({
        facebook: z.string().url().optional(),
        twitter: z.string().url().optional(),
        instagram: z.string().url().optional(),
        linkedin: z.string().url().optional(),
      })
      .optional(),
  }),
});

const sections = defineCollection({
  type: "data",
  // loader: file("src/content/site/index.yml"),
  schema: ({ image }) =>
    z.object({
      hero: z
        .object({
          title: z.string(),
          subtitle: z.string(),
          primaryCta: z.object({
            text: z.string(),
            href: z.string(),
          }),
          secondaryCta: z.object({
            text: z.string(),
            href: z.string(),
          }),
          stats: z.array(
            z.object({
              value: z.string(),
              label: z.string(),
            })
          ),
          backgroundImage: image().optional(),
        })
        .optional(),
      about: z
        .object({
          badge: z.string(),
          title: z.string(),
          description: z.array(z.string()),
          image: image().optional(),
          features: z.array(
            z.object({
              title: z.string(),
              description: z.string(),
            })
          ),
        })
        .optional(),
      services: z
        .object({
          badge: z.string(),
          title: z.string(),
          introText: z.string(),
          whyChooseUs: z.string(),
          commitment: z.string(),
          items: z.array(
            z.object({
              title: z.string(),
              description: z.string(),
              icon: z.string(),
              features: z.array(z.string()),
              image: image().optional(),
            })
          ),
        })
        .optional(),
      process: z
        .object({
          badge: z.string(),
          title: z.string(),
          description: z.string(),
          steps: z.array(
            z.object({
              title: z.string(),
              icon: z.string().optional(),
              description: z.string(),
              tags: z.array(z.string()),
              image: image().optional(),
            })
          ),
          cta: z.object({
            text: z.string(),
            description: z.string(),
          }),
        })
        .optional(),
      testimonials: z
        .object({
          badge: z.string(),
          title: z.string(),
          description: z.string(),
          items: z.array(
            z.object({
              name: z.string(),
              initials: z.string(),
              treatment: z.string(),
              location: z.string(),
              rating: z.number(),
              quote: z.string(),
              image: image().optional(),
            })
          ),
          stats: z.array(
            z.object({
              value: z.string(),
              label: z.string(),
            })
          ),
        })
        .optional(),
    }),
});

const blog = defineCollection({
  loader: glob({ pattern: "**/*.{md,mdx}", base: "./src/content/blog" }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      description: z.string(),
      pubDate: z.date(),
      author: z.string().default("HealthShores Team"),
      image: image().optional(),
      tags: z.array(z.string()).default([]),
      draft: z.boolean().default(false),
    }),
});

export const collections = {
  global: globalData,
  sections: sections,
  blog: blog,
};
