import { z } from "zod";
import { zSearchSchema } from "./common";

export const zCreateSubscriptionSchema = z.object({
  email: z.string().email(),
  name: z.string().optional(),
  referringSite: z.string().optional(),
  utmSource: z.string().optional(),
  utmMedium: z.string().optional(),
  utmCampaign: z.string().optional(),
  preferences: z.record(z.any()).optional(),
});

export const zUpdateSubscriptionSchema = z.object({
  email: z.string().email().optional(),
  name: z.string().optional(),
  preferences: z.record(z.any()).optional(),
  isVerified: z.boolean().optional(),
});

export const zSearchSubscriptionsSchema = zSearchSchema.extend({
  email: z.string().optional(),
  isVerified: z.boolean().optional(),
});

export type CreateSubscriptionInput = z.infer<typeof zCreateSubscriptionSchema>;
export type UpdateSubscriptionInput = z.infer<typeof zUpdateSubscriptionSchema>;
export type SearchSubscriptionsInput = z.infer<typeof zSearchSubscriptionsSchema>;