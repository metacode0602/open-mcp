import { and, asc, desc, eq, like, or, sql } from "drizzle-orm";

import { ads } from "../../schema";
import { db } from "../../index";
import { zCreateAdsSchema, zUpdateAdsSchema, zSearchAdsSchema, AdsStatus, Ads } from "../../types";

// 广告数据访问模块
export const adsDataAccess = {
  // 创建广告
  create: async (data: typeof zCreateAdsSchema._type, userId: string) => {
    console.warn("adsDataAccess.create", data, userId);
    const [result] = await db.insert(ads).values({
      ...data,
      url: data.url ?? `/apps/${data.appId}`,
      userId: userId ?? "admin",
    }).returning();
    return result;
  },

  // 更新广告
  update: async (id: string, data: Omit<typeof zUpdateAdsSchema._type, "id">, userId: string) => {
    return await db.update(ads).set(data).where(eq(ads.id, id)).returning();
  },

  // 获取广告
  getById: async (id: string) => {
    return await db.query.ads.findFirst({
      where: eq(ads.id, id),
      with: {
        user: true,
      },
    });
  },

  // 获取广告，前端页面展示
  getByIdWithApp: async (id: string) => {
    return await db.query.ads.findFirst({
      where: eq(ads.id, id),
      with: {
        app: {
          columns: {
            id: true,
            type: true,
            version: true,
            description: true,
            descriptionZh: true,
            slug: true,
            name: true,
            icon: true,
            website: true,
          },
        },
      },
    });
  },
  // 搜索广告
  search: async (params: typeof zSearchAdsSchema._type) => {
    const { query, page = 1, limit = 10, field, order, status, userId, appId } = params;
    const offset = (page - 1) * limit;

    // 构建查询条件
    const conditions = [];

    if (query) {
      conditions.push(or(like(ads.title, `%${query}%`), like(ads.description, `%${query}%`)));
    }

    if (status) {
      conditions.push(eq(ads.status, status));
    }

    if (userId) {
      conditions.push(eq(ads.userId, userId));
    }

    if (appId) {
      conditions.push(eq(ads.appId, appId));
    }

    // 构建排序条件
    const orderBy = [];
    if (field) {
      const orderDirection = order === "desc" ? desc : asc;
      if (field === "title") orderBy.push(orderDirection(ads.title));
      if (field === "status") orderBy.push(orderDirection(ads.status));
      if (field === "createdAt") orderBy.push(orderDirection(ads.createdAt));
      if (field === "updatedAt") orderBy.push(orderDirection(ads.updatedAt));
    } else {
      // 默认按创建时间倒序
      orderBy.push(desc(ads.createdAt));
    }

    // 执行查询
    const results = await db.query.ads.findMany({
      where: conditions.length > 0 ? and(...conditions) : undefined,
      orderBy,
      limit,
      offset,
      with: {
        user: true,
      },
    });

    // 获取总数
    const countResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(ads)
      .where(conditions.length > 0 ? and(...conditions) : undefined);

    const total = countResult[0]?.count ?? 0;

    return {
      data: results,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  },

  // 删除广告
  delete: async (id: string) => {
    return await db.delete(ads).where(eq(ads.id, id)).returning();
  },

  // 获取应用广告列表
  getListByAppId: async (appId: string) => {
    return await db.query.ads.findMany({
      where: eq(ads.appId, appId),
    });
  },

  updateStatus: async (id: string, status: AdsStatus) => {
    return await db.update(ads).set({ status }).where(eq(ads.id, id)).returning();
  },

  getAdsListByType: async (type: "banner" | "listing") => {
    const results = await db.query.ads.findMany({
      where: and(eq(ads.type, type), eq(ads.status, "active")),
      with: {
        app: {
          columns: {
            id: true,
            name: true,
            icon: true,
            website: true, // 作为 url 字段
            slug: true,
            description: true,
            descriptionZh: true,
            type: true,
            version: true,
          },
        },
      },
    });

    // 将 website 字段映射为 url 字段以匹配前端期望
    return results as unknown as Ads[];
  },

  getActiveAds: async (type?: "banner" | "listing", limit = 10) => {
    const query = await db.query.ads.findMany({
      where: (ads, { and, eq, gte, lte }) =>
        and(
          eq(ads.status, "active"),
          gte(ads.startDate, new Date()),
          lte(ads.endDate, new Date()),
          type ? eq(ads.type, type as "banner" | "listing") : undefined
        ),
      limit,
      orderBy: (ads, { desc }) => [desc(ads.createdAt)],
    })

    return query
  },

  incrementImpressions: async (id: string) => {
    const ad = await db.query.ads.findFirst({
      where: eq(ads.id, id),
    })

    if (!ad) {
      throw new Error("Ad not found")
    }

    await await db
      .update(ads)
      .set({ impressions: ad.impressions ?? 0 + 1 })
      .where(eq(ads.id, id))

    return { success: true }
  },

  incrementClicks: async (id: string) => {
    const ad = await db.query.ads.findFirst({
      where: eq(ads.id, id),
    })

    if (!ad) {
      throw new Error("Ad not found")
    }

    await await db
      .update(ads)
      .set({ clicks: ad.clicks ?? 0 + 1 })
      .where(eq(ads.id, id))

    return { success: true }
  },

  /**
   * 获取用户发布的广告
   * @param userId 用户ID
   * @returns 用户发布的广告
   */
  getAdsByUserId: async (userId: string) => {
    const results = await db.query.ads.findMany({
      where: eq(ads.userId, userId),
      with: {
        app: {
          columns: {
            id: true,
            name: true,
            icon: true,
            website: true, // 作为 url 字段
            type: true,
            version: true,
          },
        },
      },
    });

    // 将 website 字段映射为 url 字段以匹配前端期望
    return results.map(ad => ({
      ...ad,
      app: ad.app ? {
        ...ad.app,
        url: ad.app.website, // 将 website 映射为 url
      } : null,
    }));
  },

  getAdsCountByUserId: async (userId: string) => {
    const value = await db.select({ count: sql<number>`count(*)` }).from(ads).where(eq(ads.userId, userId));
    return value[0]?.count || 0;
  },
}; 