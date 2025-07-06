import { appSubmissionData } from "@repo/db/database/admin";
import { db } from "@repo/db";
import { zCreateAppSubmissionSchema, zSearchAppSubmissionsSchema, zUpdateAppSubmissionSchema } from "@repo/db/types";
import { z } from "zod";
import { adminProcedure, router } from "../../trpc";
import { TRPCError } from "@trpc/server";
import { slugifyText } from "@repo/db";

// Create a schema for approve input
const approveInputSchema = z.object({
  id: z.string(),
  slug: z.string(),
  type: z.enum(["client", "server", "application"]),
  categoryId: z.string()
});

export const appSubmissionsRouter = router({
  // 创建应用提交
  create: adminProcedure
    .input(zCreateAppSubmissionSchema)
    .mutation(async ({ input }) => {
      return appSubmissionData.create(input);
    }),

  // 更新应用提交
  update: adminProcedure
    .input(zUpdateAppSubmissionSchema)
    .mutation(async ({ input }) => {
      return appSubmissionData.update(input);
    }),

  // 获取应用提交
  getById: adminProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input }) => {
      return appSubmissionData.getById(input.id);
    }),

  getByIdWithUser: adminProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input }) => {
      return appSubmissionData.getByIdWithUser(input.id);
    }),
  // 搜索应用提交
  search: adminProcedure
    .input(zSearchAppSubmissionsSchema)
    .query(async ({ input }) => {
      return appSubmissionData.search(input);
    }),

  // 删除应用提交
  delete: adminProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input }) => {
      return appSubmissionData.delete(input.id);
    }),

  // 批准应用提交
  approve: adminProcedure
    .input(approveInputSchema)
    .mutation(async ({ input, ctx }) => {
      // First check if an app with the same slug, website, or github exists
      const submission = await appSubmissionData.getById(input.id);
      if (!submission) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: '找不到该提交'
        });
      }
      console.info("submission", submission);
      // Check for existing apps with same identifiers
      const existingApp = await db.query.apps.findFirst({
        where: (apps, { or, eq }) => or(
          eq(apps.slug, input.slug),
          submission.website ? eq(apps.website, submission.website) : undefined,
          submission.github ? eq(apps.github, submission.github) : undefined
        )
      });

      if (existingApp) {
        throw new TRPCError({
          code: 'CONFLICT',
          message: '已存在相同标识的应用（slug、网站或 GitHub 地址）'
        });
      }

      // If validation passes, create the app
      return await appSubmissionData.approve({
        id: input.id,
        slug: input.slug,
        type: input.type,
        categoryId: input.categoryId,
        approvedBy: ctx.user.id
      });
    }),

  // 拒绝应用提交
  reject: adminProcedure
    .input(z.object({ id: z.string(), reason: z.string() }))
    .mutation(async ({ input }) => {
      return appSubmissionData.reject(input.id, input.reason);
    }),

  getListByUserId: adminProcedure
    .input(z.object({
      userId: z.string(),
    })).query(async ({ input }) => {
      return appSubmissionData.getSubmissionsByUserId(input.userId);
    }),

  // 生成slug
  generateSlug: adminProcedure
    .input(z.object({ name: z.string() }))
    .query(async ({ input }) => {
      return slugifyText(input.name);
    }),
});