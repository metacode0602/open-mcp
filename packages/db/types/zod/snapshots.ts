import { z } from "zod";

export const zMonthSchema = z.object({
  month: z.number(),
  snapshots: z.array(
    z.object({
      day: z.number(),
      stars: z.number(),
    })
  ),
});

export const zOneYearSnapshotSchema = z.object({
  year: z.number(),
  months: z.array(zMonthSchema),
});

export type MonthSnapshots = z.infer<typeof zMonthSchema>;
export type OneYearSnapshots = z.infer<typeof zOneYearSnapshotSchema>;

export const zSnapshotsSchema = z.array(zOneYearSnapshotSchema);
