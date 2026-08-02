import { and, asc, desc, eq, inArray, like, or, sql } from "drizzle-orm";
import { db } from "../../index";
import { apps, recommendationApps, recommendations } from "../../schema";
import type { CreateRecommendation, SearchRecommendations, UpdateRecommendation } from "../../types";

export const recommendationDataAccess = {
  // 创建推荐
  create: async (data: CreateRecommendation) => {
    return await db.insert(recommendations).values(data).returning();
  },

  // 更新推荐
  update: async (id: string, data: UpdateRecommendation) => {
    return await db
      .update(recommendations)
      .set(data)
      .where(eq(recommendations.id, id))
      .returning();
  },

  // 获取推荐
  getById: async (id: string) => {
    return db.query.recommendations.findFirst({
      where: eq(recommendations.id, id)
    });
  },

  // 搜索推荐
  search: async (params: SearchRecommendations) => {
    const { query, page = 1, limit = 10, field, order, appId, type } = params;
    const offset = (page - 1) * limit;

    // 构建查询条件
    const conditions = [];

    if (query) {
      conditions.push(
        or(
          like(recommendations.title, `%${query}%`),
          like(recommendations.description, `%${query}%`)
        )
      );
    }

    if (type) {
      conditions.push(eq(recommendations.type, type));
    }

    // 构建排序条件
    const orderBy = [];
    if (field) {
      const orderDirection = order === "desc" ? desc : asc;
      if (field === "title") orderBy.push(orderDirection(recommendations.title));
      if (field === "type") orderBy.push(orderDirection(recommendations.type));
      if (field === "createdAt") orderBy.push(orderDirection(recommendations.createdAt));
      if (field === "updatedAt") orderBy.push(orderDirection(recommendations.updatedAt));
    } else {
      // 默认按创建时间倒序
      orderBy.push(desc(recommendations.createdAt));
    }

    // 执行查询
    const results = await db.query.recommendations.findMany({
      where: conditions.length > 0 ? and(...conditions) : undefined,
      orderBy,
      limit,
      offset,
    });

    // 获取总数
    const countResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(recommendations)
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

  // 删除推荐
  delete: async (id: string) => {
    return await db
      .delete(recommendations)
      .where(eq(recommendations.id, id))
      .returning();
  },

  getAppsByRecommendationId: async (id: string, limit: number) => {
    const rows = await db
      .select()
      .from(recommendationApps)
      .where(eq(recommendationApps.recommendationId, id))
      .orderBy(desc(recommendationApps.createdAt))
      .limit(limit);

    if (rows.length === 0) return [];

    const appIds = rows.map((r) => r.appId);
    const appsList = await db.query.apps.findMany({
      where: inArray(apps.id, appIds),
    });
    const appMap = new Map(appsList.map((a) => [a.id, a]));

    return rows.map((row) => ({
      ...row,
      app: appMap.get(row.appId) ?? null,
    }));
  },

  getApps: async (id: string) => {
    return await db.query.recommendationApps.findMany({
      where: and(eq(recommendationApps.recommendationId, id)),
      with: {
        app: true
      },
      orderBy: desc(recommendationApps.createdAt)
    })
  },
  // 根据被推荐的应用Id获取其推荐信息
  getRecommendationsByAppid: async (appId: string) => {
    return await db.query.recommendationApps.findMany({
      where: eq(recommendationApps.appId, appId),
      with: {
        recommendation: true
      }
    }).then((recommendationApps) => {
      return recommendationApps.map((recommendationApp) => recommendationApp.recommendation)
    })
  }
};