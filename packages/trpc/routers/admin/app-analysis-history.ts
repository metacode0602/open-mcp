import { appAnalysisHistoryDataAccess, appsDataAccess } from "@repo/db/database/admin";
import {
  zCreateAppAnalysisHistorySchema,
  zSearchAppAnalysisHistorySchema,
  zUpdateAppAnalysisHistorySchema,
} from "@repo/db/types";
import { z } from "zod";
import { adminProcedure, router } from "../../trpc";
import { inngest } from "../../lib/inngest/client";

export const appAnalysisHistoryRouter = router({
  // 创建应用分析历史
  create: adminProcedure
    .input(zCreateAppAnalysisHistorySchema)
    .mutation(async ({ input }) => {
      return await appAnalysisHistoryDataAccess.create(input);
    }),

  // 更新应用分析历史
  update: adminProcedure
    .input(zUpdateAppAnalysisHistorySchema)
    .mutation(async ({ input }) => {
      return await appAnalysisHistoryDataAccess.update(input.id, input);
    }),

  // 获取应用分析历史
  get: adminProcedure
    .input(z.object({
      id: z.string(),
    }))
    .query(async ({ input }) => {
      return await appAnalysisHistoryDataAccess.getById(input.id);
    }),

  // 搜索应用分析历史
  search: adminProcedure
    .input(zSearchAppAnalysisHistorySchema)
    .query(async ({ input }) => {
      return await appAnalysisHistoryDataAccess.search(input);
    }),

  // 删除应用分析历史
  delete: adminProcedure
    .input(z.object({
      id: z.string(),
    }))
    .mutation(async ({ input }) => {
      return await appAnalysisHistoryDataAccess.delete(input.id);
    }),

  // 获取应用分析历史列表
  getListByAppId: adminProcedure
    .input(z.object({
      appId: z.string(),
      limit: z.coerce.number().optional(),
    }))
    .query(async ({ input }) => {
      return await appAnalysisHistoryDataAccess.getListByAppId(input.appId, input.limit);
    }),

  // 开始应用分析
  startAnalysis: adminProcedure
    .input(z.object({
      appId: z.string()
    }))
    .mutation(async ({ ctx, input }) => {
      const app = await appsDataAccess.getById(input.appId);
      if (!app) {
        throw new Error("App not found");
      }

      const results = [];

      console.info("[app-analysis-history] [startAnalysis] app", app.github, app.website);
      // console.info("[app-analysis-history] [startAnalysis] app.website", app.website);
      // if (app.website) {
      //   const data = await appAnalysisHistoryDataAccess.startAnalysis(input.appId, app.website, "website");
      //   if (!data) {
      //     throw new Error("Failed to create website analysis history");
      //   }
      //   await inngest.send({
      //     name: "website-content/start",
      //     data: {
      //       appId: input.appId,
      //       website: app.website,
      //       jobId: data.id,
      //       userId: ctx.user.id,
      //       status: "in_progress",
      //     },
      //   });
      //   results.push({ ...data, status: "in_progress", type: "website" });
      // }

      console.info("[app-analysis-history] [startAnalysis] app.github", app.github);
      if (app.github) {
        const data = await appAnalysisHistoryDataAccess.startAnalysis(input.appId, app.github, "github");
        if (!data) {
          throw new Error("Failed to create github analysis history");
        }
        await inngest.send({
          name: "github-repo/start",
          data: {
            appId: input.appId,
            github: app.github,
            jobId: data.id,
            userId: ctx.user.id,
            status: "in_progress",
          },
        });
        results.push({ ...data, status: "in_progress", type: "github" });
      }

      if (results.length === 0) {
        throw new Error("No website or github URL found for app");
      }

      return results;
    }),

  startWebsiteAnalysis: adminProcedure
    .input(z.object({
      appId: z.string(),
    }))
    .mutation(async ({ ctx, input }) => {
      const app = await appsDataAccess.getById(input.appId);
      if (!app) {
        throw new Error("App not found");
      }

      if (!app.website) {
        throw new Error("No website URL found for app");
      }

      const data = await appAnalysisHistoryDataAccess.create({
        appId: input.appId,
        url: app.website,
        type: "website",
        analysisResult: {},
        status: "in_progress",
      });

      if (!data || !data[0]) {
        throw new Error("Failed to create analysis history");
      }

      await inngest.send({
        name: "website-content/start",
        data: {
          appId: input.appId,
          website: app.website,
          jobId: data[0].id,
          userId: ctx.user.id,
          status: "in_progress",
        },
      });
      return { ...data[0], status: "in_progress" };
    }),

  // 停止网站分析
  startGithubAnalysis: adminProcedure
    .input(z.object({
      id: z.string(),
      github: z.string(),
    }))
    .mutation(async ({ ctx, input }) => {
      const data = await appAnalysisHistoryDataAccess.create({
        appId: input.id,
        url: input.github,
        type: "github",
        analysisResult: {},
        status: "in_progress",
      });

      if (!data || !data[0]) {
        throw new Error("Failed to create analysis history");
      }

      await inngest.send({
        name: "github-repo/start",
        data: {
          appId: input.id,
          github: input.github,
          jobId: data[0].id,
          userId: ctx.user.id,
          status: "in_progress",
        },
      });
      return { ...data[0], status: "in_progress" };
    }),
});