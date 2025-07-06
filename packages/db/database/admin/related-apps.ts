import { and, asc, desc, eq, like, or, sql } from "drizzle-orm";
import { db } from "../../index";
import { relatedApps } from "../../schema";
import { zCreateRelatedAppSchema, zUpdateRelatedAppSchema, zSearchRelatedAppsSchema } from "../../types";

export const relatedAppDataAccess = {
  // 创建相关应用
  create: async (data: typeof zCreateRelatedAppSchema._type) => {
    return await db.insert(relatedApps).values(data).returning();
  },

  // 更新相关应用
  update: async (id: string, data: typeof zUpdateRelatedAppSchema._type) => {
    return await db.update(relatedApps).set(data).where(eq(relatedApps.id, id)).returning();
  },

  // 获取相关应用
  getById: async (id: string) => {
    return db.query.relatedApps.findFirst({
      where: eq(relatedApps.id, id),
      with: {
        app: true,
        relatedApp: true,
      },
    });
  },

  // 搜索相关应用
  search: async (params: typeof zSearchRelatedAppsSchema._type) => {
    const { query, page = 1, limit = 10, field, order, appId, relatedAppId } = params;
    const offset = (page - 1) * limit;

    // 构建查询条件
    const conditions = [];

    if (query) {
      conditions.push(or(like(relatedApps.id, `%${query}%`)));
    }

    if (appId) {
      conditions.push(eq(relatedApps.appId, appId));
    }

    if (relatedAppId) {
      conditions.push(eq(relatedApps.relatedAppId, relatedAppId));
    }

    // 构建排序条件
    const orderBy = [];
    if (field) {
      const orderDirection = order === "desc" ? desc : asc;
      if (field === "similarity") orderBy.push(orderDirection(relatedApps.similarity));
      if (field === "createdAt") orderBy.push(orderDirection(relatedApps.createdAt));
    } else {
      // 默认按创建时间倒序
      orderBy.push(desc(relatedApps.createdAt));
    }

    // 执行查询
    const results = await db.query.relatedApps.findMany({
      where: conditions.length > 0 ? and(...conditions) : undefined,
      orderBy,
      limit,
      offset,
      with: {
        app: true,
        relatedApp: true,
      },
    });

    // 获取总数
    const countResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(relatedApps)
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

  // 删除相关应用
  delete: async (id: string) => {
    return await db.delete(relatedApps).where(eq(relatedApps.id, id)).returning();
  },

  getRelatedApps: async (params: { type: string; appId: string }) => {
    const { appId } = params;
    const data = await db.query.relatedApps.findMany({
      where: and(eq(relatedApps.appId, appId)),
      with: {
        relatedApp: true,
      },
    });
    return data.map((item) => item.relatedApp);
  },

  getRecommendedApps: async (params: { type: string; appId: string }) => {
    const { appId } = params;
    const data = await db.query.relatedApps.findMany({
      where: and(eq(relatedApps.appId, appId)),
      with: {
        app: true,
      },
    });
    return data.map((item) => item.app);
  }
}; 