import { appSubmissionData } from "@repo/db/database/admin";
import { protectedProcedure, publicProcedure, router } from "../../trpc";
import { zWebCreateAppSubmissionSchema, zWebUpdateAppSubmissionSchema } from "@repo/db/types";
import { z } from "zod";

export const mcpAppSubmissionsRouter = router({

  // 创建应用提交
  create: protectedProcedure.input(zWebCreateAppSubmissionSchema).mutation(async ({ ctx, input }) => {

    const submission = await appSubmissionData.create({
      ...input, userId: ctx.user.id, status: "pending"
    });

    // 提供了github的网址，即开始进行抓取
    // if (input.github && submission?.id) {
    //   // 触发 Inngest 事件
    //   await inngest.send({
    //     name: "apps-submission-scraper/start",
    //     data: {
    //       jobId: submission.id,
    //       userId: ctx.user.id,
    //       github: input.github,
    //       status: "pending"
    //     },
    //   });
    // }

    return submission;
  }),

  // 更新应用提交
  update: protectedProcedure.input(zWebUpdateAppSubmissionSchema).mutation(async ({ input }) => {
    return appSubmissionData.update(input);
  }),

  // 获取应用提交
  getById: publicProcedure.input(z.object({ id: z.string() })).query(async ({ input }) => {
    return appSubmissionData.getById(input.id);
  }),


  // 删除应用提交
  delete: protectedProcedure.input(z.object({ id: z.string() })).mutation(async ({ input }) => {
    return appSubmissionData.delete(input.id);
  }),
}); 