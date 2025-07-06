import { and, asc, desc, eq, like, or, sql } from "drizzle-orm";
import { db } from "../../index";
import { emailSubscriptions } from "../../schema";
import { zCreateEmailSubscriptionSchema, zUpdateEmailSubscriptionSchema, zSearchEmailSubscriptionsSchema } from "../../types";

export const emailSubscriptionData = {
  // 创建邮件订阅
  create: async (data: typeof zCreateEmailSubscriptionSchema._type) => {
    return await db.insert(emailSubscriptions).values(data).returning();
  },

  // 更新邮件订阅
  update: async (id: string, data: typeof zUpdateEmailSubscriptionSchema._type) => {
    return await db
      .update(emailSubscriptions)
      .set(data)
      .where(eq(emailSubscriptions.id, id))
      .returning();
  },

  // 获取邮件订阅
  getById: async (id: string) => {
    return db.query.emailSubscriptions.findFirst({
      where: eq(emailSubscriptions.id, id),
      with: {
        user: true,
      },
    });
  },

  // 搜索邮件订阅
  search: async (params: typeof zSearchEmailSubscriptionsSchema._type) => {
    const { query, page = 1, limit = 10, field, order, userId, email, isVerified } = params;
    const offset = (page - 1) * limit;

    // 构建查询条件
    const conditions = [];

    if (query) {
      conditions.push(
        or(
          like(emailSubscriptions.id, `%${query}%`),
          like(emailSubscriptions.email, `%${query}%`)
        )
      );
    }

    if (userId) {
      conditions.push(eq(emailSubscriptions.userId, userId));
    }

    if (email) {
      conditions.push(eq(emailSubscriptions.email, email));
    }

    if (isVerified !== undefined) {
      conditions.push(eq(emailSubscriptions.isVerified, isVerified));
    }

    // 构建排序条件
    const orderBy = [];
    if (field) {
      const orderDirection = order === "desc" ? desc : asc;
      if (field === "email") orderBy.push(orderDirection(emailSubscriptions.email));
      if (field === "isVerified") orderBy.push(orderDirection(emailSubscriptions.isVerified));
      if (field === "createdAt") orderBy.push(orderDirection(emailSubscriptions.createdAt));
      if (field === "updatedAt") orderBy.push(orderDirection(emailSubscriptions.updatedAt));
    } else {
      // 默认按创建时间倒序
      orderBy.push(desc(emailSubscriptions.createdAt));
    }

    // 执行查询
    const results = await db.query.emailSubscriptions.findMany({
      where: conditions.length > 0 ? and(...conditions) : undefined,
      orderBy: orderBy.length > 0 ? orderBy : undefined,
      limit,
      offset,
      with: {
        user: true,
      },
    });

    // 获取总数
    const countResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(emailSubscriptions)
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

  // 删除邮件订阅
  delete: async (id: string) => {
    return await db
      .delete(emailSubscriptions)
      .where(eq(emailSubscriptions.id, id))
      .returning();
  },
}; 