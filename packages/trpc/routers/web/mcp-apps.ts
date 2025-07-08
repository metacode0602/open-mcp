import { z } from "zod";
import { publicProcedure, router } from "../../trpc";
import { Ads, McpApp } from "@repo/db/types";
import { mcpAppsDataAccess } from "@repo/db/database/web";
import { adsDataAccess, tagsDataAccess, reposDataAccess } from "@repo/db/database/admin";

export const mcpappRouter = router({
  getAppById: publicProcedure
    .input(
      z.object({
        id: z.string(),
      })
    )
    .query(async ({ input }) => {
      const { id } = input;
      // Mock data for demonstration
      const app = { id, name: `App ${id}` };
      return app;
    }),
  getBySlug: publicProcedure
    .input(z.object({
      slug: z.string(),
    }))
    .query(async ({ input }) => {
      const { slug } = input;
      return mcpAppsDataAccess.getBySlug(slug);
    }),

  getByTag: publicProcedure
    .input(
      z.object({
        tagName: z.string(),
        limit: z.number().optional(),
        appSlug: z.string().optional(),
      })
    )
    .query(async ({ input }) => {
      const { tagName } = input;
      const tag = await tagsDataAccess.getByName(decodeURIComponent(tagName));
      if (tag && tag.id) {
        const apps = await mcpAppsDataAccess.getAppsByTagId(tag.id, input.limit);
        console.warn("[] [] appSlug: ", input.appSlug)
        return apps.filter(item => item.slug != input.appSlug) as McpApp[];
      }
      return [] as McpApp[];
    }),

  getBySubcategory: publicProcedure
    .input(
      z.object({
        category: z.string(),
      })
    )
    .query(async ({ input }) => {
      const { category } = input;

      return [] as McpApp[];
    }),

  getByTypeCategoryAndTag: publicProcedure
    .input(
      z.object({
        type: z.enum(["client", "server", "application"]),
        category: z.string().optional(),
        tag: z.string().optional(),
      })
    )
    .query(async ({ input }) => {
      const { type, category, tag } = input;
      const apps = await mcpAppsDataAccess.getByTypeCategoryAndTag({
        type,
        category,
        tag,
      });
      return apps;
    }),

  getByCategory: publicProcedure
    .input(
      z.object({
        category: z.string(),
      })
    )
    .query(async ({ input }) => {
      const { category } = input;

      return [] as McpApp[];
    }),

  getCountBadge: publicProcedure.query(async () => {
    const count = await mcpAppsDataAccess.getCount();
    const newCount = await mcpAppsDataAccess.getNewCount();
    return { count, newCount };
  }),

  getAdsListByType: publicProcedure
    .input(z.object({
      adType: z.enum(["banner", "listing"]),
    }))
    .query(async ({ input }) => {
      const { adType } = input;
      const ads = await adsDataAccess.getAdsListByType(adType);
      return ads as Ads[];
    }),

  // 获取应用的最新发布信息
  getLatestRelease: publicProcedure
    .input(
      z.object({
        repoId: z.string(),
      })
    )
    .query(async ({ input }) => {
      const { repoId } = input;
      const repo = await reposDataAccess.getById(repoId);

      if (!repo) {
        return null;
      }

      // 检查是否有最新发布信息
      if (!repo.latest_release_tag_name || !repo.latest_release_published_at) {
        return null;
      }

      return {
        releaseName: repo.latest_release_name || repo.latest_release_tag_name,
        releaseTagName: repo.latest_release_tag_name,
        releasePublishedAt: repo.latest_release_published_at,
        releaseUrl: repo.latest_release_url || `https://github.com/${repo.fullName}/releases/tag/${repo.latest_release_tag_name}`,
        releaseDescription: repo.latest_release_description || "",
        releaseDescriptionZh: repo.latest_release_description_zh || "",
        fullName: repo.fullName,
      };
    }),
});
