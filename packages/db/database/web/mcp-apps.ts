import { apps, appCategories, appTags, categories, tags } from "@repo/db/schema";
import type { TagsCacheItem } from "@repo/db/schema";
import { and, count, eq, gte, like, SQL, inArray } from "drizzle-orm";
import { db } from "../../index";
import { AppType } from "../../types";

function tagsCacheToTags(cache: TagsCacheItem[] | null | undefined): { id: string; name: string; slug: string }[] {
  if (!cache || !Array.isArray(cache)) return [];
  return cache.map((t) => ({ id: t.id, name: t.name, slug: t.slug }));
}

export const mcpAppsDataAccess = {
  getByTypeCategoryAndTag: async (params: { type: AppType; category?: string; tag?: string }) => {
    const { type, category, tag } = params;

    // 先查出符合条件的 app id
    let appIdConditions: SQL[] = [eq(apps.type, type)];

    if (category) {
      appIdConditions.push(eq(categories.slug, category));
    }
    if (tag) {
      appIdConditions.push(eq(tags.slug, tag));
    }

    // 只查 id
    const appIdRows = await db
      .selectDistinct({ id: apps.id })
      .from(apps)
      .leftJoin(categories, eq(apps.categoryId, categories.id))
      .leftJoin(appTags, eq(apps.id, appTags.appId))
      .leftJoin(tags, eq(appTags.tagId, tags.id))
      .where(and(...appIdConditions));

    const appIds = appIdRows.map(row => row.id);
    if (appIds.length === 0) return [];

    // 再查详情
    const appsData = await db
      .selectDistinct({
        id: apps.id,
        slug: apps.slug,
        name: apps.name,
        description: apps.description,
        descriptionZh: apps.descriptionZh,
        type: apps.type,
        icon: apps.icon,
        website: apps.website,
        github: apps.github,
        stars: apps.stars,
        verified: apps.verified,
        banner: apps.banner,
        createdAt: apps.createdAt,
        primaryLanguage: apps.primaryLanguage,
        languages: apps.languages,
        source: apps.source,
        deployable: apps.deployable,
        publishStatus: apps.publishStatus,
        featured: apps.featured,
        watchers: apps.watchers,
        forks: apps.forks,
        license: apps.license,
        version: apps.version,
      })
      .from(apps)
      .where(inArray(apps.id, appIds));

    return appsData;
  },

  /**
   * 根据appId、分类、标签、查询条件查询应用。这里主要是用于搜索应用
   * @param params 
   * @returns 
   */
  getAppsBySearch: async (params: { appId?: string; limit?: number; category?: string; tag?: string; query?: string }) => {
    const { appId, limit, category, tag, query } = params;

    let conditions: SQL[] = [];

    if (appId) {
      conditions.push(eq(apps.id, appId));
    }

    if (category) {
      conditions.push(eq(categories.slug, category));
    }

    if (tag) {
      conditions.push(eq(tags.slug, tag));
    }

    if (query) {
      conditions.push(like(apps.name, `%${query}%`));
    }

    // 首先查询应用基本信息（含 tags_cache，展示用优先读缓存）
    const appsData = await db
      .selectDistinct({
        id: apps.id,
        slug: apps.slug,
        name: apps.name,
        description: apps.description,
        type: apps.type,
        icon: apps.icon,
        website: apps.website,
        github: apps.github,
        stars: apps.stars,
        verified: apps.verified,
        tagsCache: apps.tagsCache,
      })
      .from(apps)
      .leftJoin(appCategories, eq(apps.id, appCategories.appId))
      .leftJoin(categories, eq(appCategories.categoryId, categories.id))
      .leftJoin(appTags, eq(apps.id, appTags.appId))
      .leftJoin(tags, eq(appTags.tagId, tags.id))
      .where(and(...conditions));

    if (!appsData || appsData.length === 0) {
      return [];
    }

    const appIdsWithoutCache = appsData.filter((a) => a.tagsCache == null).map((a) => a.id);
    let tagsByAppId: Record<string, typeof tags.$inferSelect[]> = {};
    if (appIdsWithoutCache.length > 0) {
      const appTagsData = await db
        .select({ appId: appTags.appId, tag: tags })
        .from(appTags)
        .leftJoin(tags, eq(appTags.tagId, tags.id))
        .where(inArray(appTags.appId, appIdsWithoutCache));
      tagsByAppId = appTagsData.reduce((acc, { appId, tag }) => {
        if (!acc[appId]) acc[appId] = [];
        if (tag) acc[appId].push(tag);
        return acc;
      }, {} as Record<string, typeof tags.$inferSelect[]>);
    }

    return appsData.map((app) => ({
      ...app,
      tags:
        app.tagsCache != null
          ? tagsCacheToTags(app.tagsCache)
          : (tagsByAppId[app.id] || []),
    }));
  },

  /**
   * 根据slug查询应用
   * @param slug 应用slug
   * @returns 应用信息
   */
  getBySlug: async (slug: string) => {
    const appData = await db.select().from(apps).where(eq(apps.slug, slug)).limit(1);

    if (!appData || appData.length === 0) {
      return null;
    }

    const app = appData[0]!;

    const appCategoriesData = await db
      .select({ category: categories })
      .from(appCategories)
      .leftJoin(categories, eq(appCategories.categoryId, categories.id))
      .where(eq(appCategories.appId, app.id));

    const tagsDisplay =
      app.tagsCache != null
        ? tagsCacheToTags(app.tagsCache)
        : (
            await db
              .select({ tag: tags })
              .from(appTags)
              .leftJoin(tags, eq(appTags.tagId, tags.id))
              .where(eq(appTags.appId, app.id))
          ).map((item) => item.tag).filter(Boolean);

    return {
      ...app,
      categories: appCategoriesData.map((item) => item.category),
      tags: tagsDisplay,
    };
  },

  getAppsByTagId: async (tagId: string, limit?: number) => {
    const query = db
      .select({
        id: apps.id,
        slug: apps.slug,
        name: apps.name,
        description: apps.description,
        descriptionZh: apps.descriptionZh,
        type: apps.type,
        icon: apps.icon,
        website: apps.website,
        github: apps.github,
        stars: apps.stars,
        verified: apps.verified,
      })
      .from(apps)
      .innerJoin(appTags, eq(apps.id, appTags.appId))
      .where(eq(appTags.tagId, tagId));

    return limit ? query.limit(limit) : query;
  },

  getCount: async () => {
    try {
      const totalCount = await db
        .select({ count: count() })
        .from(apps)
        .where(
          and(
            eq(apps.status, "approved"),
            eq(apps.publishStatus, "online"),
            eq(apps.deleted, false)
          )
        );
      return totalCount[0]?.count ?? 0;
    } catch (error) {
      console.error("getCount error", error);
      return 0;
    }
  },

  getNewCount: async () => {
    try {
      const newCount = await db
        .select({ count: count() })
        .from(apps)
        .where(
          and(
            eq(apps.status, "approved"),
            eq(apps.publishStatus, "online"),
            eq(apps.deleted, false),
            gte(apps.createdAt, subDays(new Date(), 7))
          )
        );
      return newCount[0]?.count ?? 0;
    } catch (error) {
      console.error("getNewCount error", error);
      return 0;
    }
  },
};

function subDays(arg0: Date, arg1: number) {
  return new Date(arg0.getTime() - arg1 * 24 * 60 * 60 * 1000);
}
