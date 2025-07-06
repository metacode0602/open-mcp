import { z } from "zod";
import { zTagSchema } from "./tags";
import { zAppSourceEnum, zAppStatusEnum, zAppTypeEnum } from "./apps";

export const zRankingRecordEntityTypeEnum = z.enum(["apps"]);

// Ranking record creation schema
export const zCreateRankingRecordSchema = z.object({
  rankingId: z.string().min(1, "Ranking ID cannot be empty"),
  entityId: z.string(),
  entityName: z.string().optional(),
  entityType: zRankingRecordEntityTypeEnum,
  score: z.coerce.number(),
  rank: z.coerce.number().int(),
});

// Ranking record schema
export const zRankingRecordSchema = z.object({
  id: z.string(),
  rankingId: z.string().min(1, "Ranking ID cannot be empty"),
  entityId: z.string(),
  entityName: z.string().optional(),
  entityType: zRankingRecordEntityTypeEnum,
  score: z.coerce.number(),
  rank: z.coerce.number().int(),
  createdAt: z.date(),
  updatedAt: z.date().optional(),
});

// Ranking record update schema
export const zUpdateRankingRecordSchema = z.object({
  id: z.string(),
  score: z.coerce.number(),
  rank: z.coerce.number().int(),
});

// Ranking app schema (for display)
export const zRankingAppSchema = z.object({
  id: z.string(),
  name: z.string(),
  slug: z.string(),
  description: z.string(),
  descriptionZh: z.string().optional(),
  icon: z.string(),
  stars: z.number().int(),
  watchers: z.number().int(),
  forks: z.number().int(),
  primaryLanguage: z.string(),
  languages: z.array(z.string()),
  license: z.string(),
  tags: z.array(zTagSchema),
  type: zAppTypeEnum,
  source: zAppSourceEnum,
  status: zAppStatusEnum,
  rank: z.number().int(),
  createdAt: z.date(),
});

// Type exports
export type CreateRankingRecord = z.infer<typeof zCreateRankingRecordSchema>;
export type RankingRecord = z.infer<typeof zRankingRecordSchema>;
export type UpdateRankingRecord = z.infer<typeof zUpdateRankingRecordSchema>;
export type RankingRecordEntityType = z.infer<typeof zRankingRecordEntityTypeEnum>;
export type RankingApp = z.infer<typeof zRankingAppSchema>;