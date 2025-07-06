import { and, asc, desc, eq, like, or, sql } from "drizzle-orm";
import { db } from "../../index";
import { suggestions } from "../../schema";
import { zCreateSuggestionSchema, zUpdateSuggestionSchema, zSearchSuggestionsSchema } from "../../types";

// 建议数据访问模块
export const suggestionsDataAccess = {
  // 创建建议
  create: async (data: typeof zCreateSuggestionSchema._type) => {
    return db.insert(suggestions).values({
      // @ts-expect-error
      appId: data.appId,
      appName: data.appName,
      appSlug: data.appSlug,
      appType: data.appType,
      userId: data.userId,
      userName: data.userName,
      userEmail: data.userEmail,
      title: data.title,
      description: data.description,
      type: data.type,
      status: data.status,
      upvotes: data.upvotes,
      priority: data.priority,
      reproducible: data.reproducible,
      stepsToReproduce: data.stepsToReproduce,
      expectedBehavior: data.expectedBehavior,
      actualBehavior: data.actualBehavior,
      attachmentUrl: data.attachmentUrl
    }).returning();
  },

  // 更新建议
  update: async (id: string, data: typeof zUpdateSuggestionSchema._type) => {
    return db
      .update(suggestions)
      .set({
        title: data.title,
        description: data.description,
        upvotes: data.upvotes,
        priority: data.priority,
        reproducible: data.reproducible,
        stepsToReproduce: data.stepsToReproduce,
        expectedBehavior: data.expectedBehavior,
        actualBehavior: data.actualBehavior,
        attachmentUrl: data.attachmentUrl
      })
      .where(eq(suggestions.id, id))
      .returning();
  },

  // 获取建议
  getById: async (id: string) => {
    return db.query.suggestions.findFirst({
      where: eq(suggestions.id, id),
      with: {
        submitter: true,
        app: true,
      },
    });
  },

  // 搜索建议
  search: async (params: typeof zSearchSuggestionsSchema._type) => {
    const { query, page = 1, limit = 10, field, order, status, userId, appId } = params;
    const offset = (page - 1) * limit;

    // 构建查询条件
    const conditions = [];

    if (query) {
      conditions.push(
        or(
          like(suggestions.title, `%${query}%`),
          like(suggestions.description, `%${query}%`)
        )
      );
    }

    if (status) {
      conditions.push(eq(suggestions.status, status as "pending" | "reviewing" | "accepted" | "implemented" | "rejected" | "duplicate"));
    }

    if (userId) {
      conditions.push(eq(suggestions.userId, userId));
    }

    if (appId) {
      conditions.push(eq(suggestions.appId, appId));
    }

    // 构建排序条件
    const orderBy = [];
    if (field) {
      const orderDirection = order === "desc" ? desc : asc;
      if (field === "title") orderBy.push(orderDirection(suggestions.title));
      if (field === "status") orderBy.push(orderDirection(suggestions.status));
      if (field === "createdAt") orderBy.push(orderDirection(suggestions.createdAt));
      if (field === "updatedAt") orderBy.push(orderDirection(suggestions.updatedAt));
    } else {
      // 默认按创建时间倒序
      orderBy.push(desc(suggestions.createdAt));
    }

    // 执行查询
    const results = await db.query.suggestions.findMany({
      where: conditions.length > 0 ? and(...conditions) : undefined,
      orderBy,
      limit,
      offset,
      with: {
        submitter: true,
        app: true,
      },
    });

    // 获取总数
    const countResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(suggestions)
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

  // 删除建议
  delete: async (id: string) => {
    return db.delete(suggestions).where(eq(suggestions.id, id)).returning();
  },

  /**
   * 获取用户提交的建议
   * @param userId 用户ID
   * @returns 用户提交的建议
   */
  getSuggestionsByUserId: async (userId: string) => {
    return await db.query.suggestions.findMany({
      where: eq(suggestions.userId, userId),
      with: {
        app: true,
      },
    });
  },

  /**
   * 获取用户提交的建议数量
   * @param userId 用户ID
   * @returns 用户提交的建议数量
   */
  getSuggestionsCountByUserId: async (userId: string) => {
    const value = await db.select({ count: sql<number>`count(*)` }).from(suggestions).where(eq(suggestions.userId, userId));
    return value[0]?.count || 0;
  },

  /**
   * 用户自己删除自己提交的建议
   * @param id 建议ID
   * @param userId 用户ID
   * @returns 删除的建议
   */
  deleteByUserId: async (id: string, userId: string) => {
    return await db.delete(suggestions).where(and(eq(suggestions.id, id), eq(suggestions.userId, userId))).returning();
  },
}; 