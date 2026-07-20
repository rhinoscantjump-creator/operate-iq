import { defineCollection, z } from "astro:content";
import { glob } from "astro/loaders";

const playbooks = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/playbooks" }),
  schema: z.object({
    id: z.string(),
    title: z.string(),
    description: z.string(),
    topic: z.enum([
      "receipt-capture",
      "client-onboarding",
      "billing-ap",
      "payroll-data-entry",
      "client-communication",
      "security-guardrails",
    ]),
    tools: z.array(z.string()),
    symptom: z.string(),
    audience: z.string(),
    timeLeak: z.string(),
    guardrail: z.string(),
    draft: z.boolean().default(false),
  }),
});

const topics = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/topics" }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    searchJob: z.string(),
  }),
});

export const collections = { playbooks, topics };
