import { and, asc, desc, eq, like, or, sql } from "drizzle-orm";
import { db } from "../../index";
import { appRss } from "../../schema";
import { zCreateAppRssSchema, zUpdateAppRssSchema, zSearchAppRssSchema } from "../../types";

export const appRssData = {
  // 创建应用RSS
  create: async (data: typeof zCreateAppRssSchema._type) => {
    return await db.insert(appRss).values(data).returning();
  },

  // 更新应用RSS
  update: async (id: string, data: typeof zUpdateAppRssSchema._type) => {
    return await db
      .update(appRss)
      .set(data)
      .where(eq(appRss.id, id))
      .returning();
  },

  // 获取应用RSS
  getById: async (id: string) => {
    return db.query.appRss.findFirst({
      where: eq(appRss.id, id),
      with: {
        app: true,
      },
    });
  },

  // 搜索应用RSS
  search: async (params: typeof zSearchAppRssSchema._type) => {
    const { query, page = 1, limit = 10, field, order, appId, isActive } = params;
    const offset = (page - 1) * limit;

    // 构建查询条件
    const conditions = [];

    if (query) {
      conditions.push(
        or(
          like(appRss.id, `%${query}%`),
          like(appRss.title, `%${query}%`),
          like(appRss.description, `%${query}%`),
          like(appRss.feedUrl, `%${query}%`)
        )
      );
    }

    if (appId) {
      conditions.push(eq(appRss.appId, appId));
    }

    if (isActive !== undefined) {
      conditions.push(eq(appRss.isActive, isActive));
    }

    // 构建排序条件
    const orderBy = [];
    if (field) {
      const orderDirection = order === "desc" ? desc : asc;
      if (field === "title") orderBy.push(orderDirection(appRss.title));
      if (field === "description") orderBy.push(orderDirection(appRss.description));
      if (field === "feedUrl") orderBy.push(orderDirection(appRss.feedUrl));
      if (field === "lastFetched") orderBy.push(orderDirection(appRss.lastFetched));
      if (field === "lastUpdated") orderBy.push(orderDirection(appRss.lastUpdated));
      if (field === "isActive") orderBy.push(orderDirection(appRss.isActive));
      if (field === "createdAt") orderBy.push(orderDirection(appRss.createdAt));
      if (field === "updatedAt") orderBy.push(orderDirection(appRss.updatedAt));
    } else {
      // 默认按创建时间倒序
      orderBy.push(desc(appRss.createdAt));
    }

    // 执行查询
    const results = await db.query.appRss.findMany({
      where: conditions.length > 0 ? and(...conditions) : undefined,
      orderBy: orderBy.length > 0 ? orderBy : undefined,
      limit,
      offset,
      with: {
        app: true,
      },
    });

    // 获取总数
    const countResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(appRss)
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

  // 删除应用RSS
  delete: async (id: string) => {
    return await db
      .delete(appRss)
      .where(eq(appRss.id, id))
      .returning();
  },
}; 