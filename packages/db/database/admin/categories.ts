import { and, asc, desc, eq, like, ne, or, sql } from "drizzle-orm";
import { db } from "../../index";
import * as schema from "../../schema";
import { zCreateCategorySchema, zUpdateCategorySchema, zSearchCategoriesSchema } from "../../types";

// 分类数据访问模块
export const categoriesDataAccess = {
  // 创建分类
  create: async (data: typeof zCreateCategorySchema._type) => {
    // 检查name是否已存在
    const existingName = await db.query.categories.findFirst({
      where: eq(schema.categories.name, data.name),
    });

    if (existingName) {
      throw new Error("分类名称已存在");
    }

    // 检查slug是否已存在
    const existingSlug = await db.query.categories.findFirst({
      where: eq(schema.categories.slug, data.slug),
    });

    if (existingSlug) {
      throw new Error("分类标识已存在");
    }

    const [category] = await db.insert(schema.categories).values(data).returning();
    return category;
  },

  // 更新分类状态
  updateStatus: async (id: string, status: "offline" | "online") => {
    return db.update(schema.categories).set({ status }).where(eq(schema.categories.id, id)).returning();
  },

  // 更新分类
  update: async (id: string, data: typeof zUpdateCategorySchema._type) => {
    // 如果更新name，检查name是否已存在
    if (data.name) {
      const existingName = await db.query.categories.findFirst({
        where: and(
          eq(schema.categories.name, data.name),
          ne(schema.categories.id, id)
        ),
      });

      if (existingName) {
        throw new Error("分类名称已存在");
      }
    }

    // 如果更新slug，检查slug是否已存在
    if (data.slug) {
      const existingSlug = await db.query.categories.findFirst({
        where: and(
          eq(schema.categories.slug, data.slug),
          ne(schema.categories.id, id)
        ),
      });

      if (existingSlug) {
        throw new Error("分类标识已存在");
      }
    }

    const [updatedCategory] = await db
      .update(schema.categories)
      .set(data)
      .where(eq(schema.categories.id, id))
      .returning();

    return updatedCategory;
  },

  // 获取分类
  getById: async (id: string) => {
    return db.query.categories.findFirst({
      where: eq(schema.categories.id, id),
      with: {
        parent: true,
      },
    });
  },

  // 搜索分类
  search: async (params: typeof zSearchCategoriesSchema._type) => {
    const { query, page = 1, limit = 10, field, order, parentId } = params;
    const offset = (page - 1) * limit;

    // 构建查询条件
    const conditions = [];

    if (query) {
      conditions.push(
        or(
          like(schema.categories.name, `%${query}%`),
          like(schema.categories.slug, `%${query}%`)
        )
      );
    }

    if (parentId) {
      conditions.push(eq(schema.categories.parentId, parentId));
    }

    // 构建排序条件
    const orderBy = [];
    if (field) {
      const orderDirection = order === "desc" ? desc : asc;
      if (field === "name") orderBy.push(orderDirection(schema.categories.name));
      if (field === "slug") orderBy.push(orderDirection(schema.categories.slug));
      if (field === "createdAt") orderBy.push(orderDirection(schema.categories.createdAt));
      if (field === "updatedAt") orderBy.push(orderDirection(schema.categories.updatedAt));
    } else {
      // 默认按创建时间倒序
      orderBy.push(desc(schema.categories.createdAt));
    }

    // 执行查询
    const results = await db.query.categories.findMany({
      where: conditions.length > 0 ? and(...conditions) : undefined,
      orderBy,
      limit,
      offset,
      with: {
        parent: true,
      },
    });

    // 获取总数
    const countResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(schema.categories)
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

  // 删除分类
  delete: async (id: string) => {
    return db.delete(schema.categories).where(eq(schema.categories.id, id)).returning();
  },

  // 获取分类
  getCategoriesByType: async (type: "client" | "server" | "application") => {
    const parent = await db.query.categories.findFirst({
      where: eq(schema.categories.slug, type),
    });
    if (parent) {
      return db.query.categories.findMany({
        where: and(eq(schema.categories.parentId, parent.id), eq(schema.categories.status, "online")),
      });
    }
    return [];
  },

  // 获取分类
  getBySlug: async (slug: string) => {
    return db.query.categories.findFirst({
      where: eq(schema.categories.slug, slug),
    });
  },
}; 