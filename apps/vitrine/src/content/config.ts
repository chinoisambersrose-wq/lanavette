import { defineCollection, z } from 'astro:content';

const blog = defineCollection({
  schema: z.object({
    title: z.string(),
    description: z.string(),
    publishDate: z.date(),
    author: z.string().default('NAVETTE'),
    category: z.string().default('Permis accéléré'),
  }),
});

export const collections = { blog };
