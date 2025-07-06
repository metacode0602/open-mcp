import { and, asc, desc, eq, like, not, or, sql } from "drizzle-orm";
import { db } from "../../index";
import { tags } from "../../schema";
import { zCreateTagSchema, zSearchTagsSchema, zUpdateTagSchema } from "../../types";

// 标签数据访问模块
export const tagsDataAccess = {
  // 创建标签
  create: async (data: typeof zCreateTagSchema._type) => {
    // 检查 name 或 slug 是否已存在
    if (data.name || data.slug) {
      const existingTag = await db.query.tags.findFirst({
        where: and(or(data.name ? eq(tags.name, data.name) : undefined, data.slug ? eq(tags.slug, data.slug) : undefined)),
      });

      if (existingTag) {
        throw new Error(existingTag.name === data.name ? `标签名称 "${data.name}" 已存在` : `标签别名 "${data.slug}" 已存在`);
      }
    }
    return db
      .insert(tags)
      .values({
        name: data.name,
        slug: data.slug,
        description: data.description,
        source: data.source ? data.source : "admin",
        deleted: false,
        createdBy: data.createdBy,
      })
      .returning();
  },

  // 更新标签
  update: async (id: string, data: typeof zUpdateTagSchema._type) => {
    try {
      // 检查 name 或 slug 是否已存在
      if (data.name || data.slug) {
        const existingTag = await db.query.tags.findFirst({
          where: and(
            or(data.name ? eq(tags.name, data.name) : undefined, data.slug ? eq(tags.slug, data.slug) : undefined),
            // 排除当前标签
            not(eq(tags.id, id))
          ),
        });

        if (existingTag) {
          throw new Error(existingTag.name === data.name ? `标签名称 "${data.name}" 已存在` : `标签别名 "${data.slug}" 已存在`);
        }
      }

      // 构建更新数据
      const updateData: Record<string, any> = {};
      if (data.name) updateData.name = data.name;
      if (data.slug) updateData.slug = data.slug;
      if (data.description !== undefined) updateData.description = data.description;
      if (data.source) updateData.source = data.source;

      return db.update(tags).set(updateData).where(eq(tags.id, id)).returning();
    } catch (error) {
      // 如果是我们抛出的错误，直接重新抛出
      if (error instanceof Error && error.message.includes("已存在")) {
        throw error;
      }
      // 其他错误可能是数据库唯一约束错误，转换为更友好的错误消息
      throw new Error("更新标签失败：名称或别名已存在");
    }
  },

  updateDeleted: async (id: string, deleted: boolean) => {
    return db.update(tags).set({ deleted }).where(eq(tags.id, id)).returning();
  },

  // 获取标签
  getById: async (id: string) => {
    return db.query.tags.findFirst({
      where: eq(tags.id, id),
    });
  },

  // 搜索标签
  search: async (params: typeof zSearchTagsSchema._type) => {
    const { query, page = 1, limit = 10, field, order } = params;
    const offset = (page - 1) * limit;

    // 构建查询条件
    const conditions = [];

    if (query) {
      conditions.push(or(like(tags.name, `%${query}%`), like(tags.slug, `%${query}%`)));
    }

    // 构建排序条件
    const orderBy = [];
    if (field) {
      const orderDirection = order === "desc" ? desc : asc;
      if (field === "name") orderBy.push(orderDirection(tags.name));
      if (field === "slug") orderBy.push(orderDirection(tags.slug));
      if (field === "createdAt") orderBy.push(orderDirection(tags.createdAt));
      if (field === "updatedAt") orderBy.push(orderDirection(tags.updatedAt));
    } else {
      // 默认按创建时间倒序
      orderBy.push(desc(tags.createdAt));
    }

    // 执行查询
    const results = await db.query.tags.findMany({
      where: conditions.length > 0 ? and(...conditions) : undefined,
      orderBy,
      limit,
      offset,
    });

    // 获取总数
    const countResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(tags)
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

  list: async (params: typeof zSearchTagsSchema._type) => {
    const { query, page = 1, limit = 10, field, order } = params;
    const offset = (page - 1) * limit;

    // 构建查询条件
    const conditions = [];

    if (query) {
      conditions.push(or(like(tags.name, `%${query}%`), like(tags.slug, `%${query}%`)));
    }

    // 构建排序条件
    const orderBy = [];
    if (field) {
      const orderDirection = order === "desc" ? desc : asc;
      if (field === "name") orderBy.push(orderDirection(tags.name));
      if (field === "slug") orderBy.push(orderDirection(tags.slug));
      if (field === "createdAt") orderBy.push(orderDirection(tags.createdAt));
      if (field === "updatedAt") orderBy.push(orderDirection(tags.updatedAt));
    } else {
      // 默认按创建时间倒序
      orderBy.push(desc(tags.createdAt));
    }

    // 执行查询
    const results = await db.query.tags.findMany({
      where: conditions.length > 0 ? and(...conditions) : undefined,
      orderBy,
      limit,
      offset,
    });

    return {
      data: results,
      pagination: {
        page,
        limit,
      },
    };
  },
  // 删除标签
  delete: async (id: string, deletedBy: string) => {
    return db.update(tags).set({ deleted: true, deletedBy: deletedBy }).where(eq(tags.id, id)).returning();
  },

  getByName: async (name: string) => {
    const tag = await db.query.tags.findFirst({
      where: eq(tags.name, name),
    });
    return tag
  }
}; 