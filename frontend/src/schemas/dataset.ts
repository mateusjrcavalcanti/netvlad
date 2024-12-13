import { z } from "zod";

export const datasetSchema = z.object({
  name: z.string(),
  created_at: z.string().optional(),
});

export const imageSchema = z.object({
  name: z.string(),
  description: z.string().optional(),
  url: z.string(),
});

export const updateImageSchema = z.object({
  descriptor: z.string(),
});

export type DatasetType = z.infer<typeof datasetSchema>;

