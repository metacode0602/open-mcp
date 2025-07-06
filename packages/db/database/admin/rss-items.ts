import { and, asc, desc, eq, like, or, sql } from "drizzle-orm";
import { db } from "../../index";
import { rssItems } from "../../schema";
import { zCreateRssItemSchema, zUpdateRssItemSchema, zSearchRssItemsSchema } from "../../types";

export const rssItemData = {
  // 创建RSS条目
  create: async (data: typeof zCreateRssItemSchema._type) => {
    return await db.insert(rssItems).values(data).returning();
  },

  // 更新RSS条目
  update: async (id: string, data: Omit<typeof zUpdateRssItemSchema._type, "id">) => {
    return await db
      .update(rssItems)
      .set(data)
      .where(eq(rssItems.id, id))
      .returning();
  },

  // 获取RSS条目
  getById: async (id: string) => {
    return await db
      .select()
      .from(rssItems)
      .where(eq(rssItems.id, id))
      .limit(1);
  },

  // 搜索RSS条目
  search: async (params: typeof zSearchRssItemsSchema._type) => {
    const { query, page = 1, limit = 10, field, order, rssId } = params;
    const offset = (page - 1) * limit;

    // 构建查询条件
    const conditions = [];

    if (query) {
      conditions.push(
        or(
          like(rssItems.id, `%${query}%`),
          like(rssItems.title, `%${query}%`),
          like(rssItems.description, `%${query}%`),
          like(rssItems.content, `%${query}%`),
          like(rssItems.link, `%${query}%`),
          like(rssItems.guid, `%${query}%`)
        )
      );
    }

    if (rssId) {
      conditions.push(eq(rssItems.rssId, rssId));
    }

    // 执行查询
    const results = await db
      .select()
      .from(rssItems)
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(
        field === "title" ? (order === "desc" ? desc(rssItems.title) : asc(rssItems.title)) :
          field === "description" ? (order === "desc" ? desc(rssItems.description) : asc(rssItems.description)) :
            field === "content" ? (order === "desc" ? desc(rssItems.content) : asc(rssItems.content)) :
              field === "link" ? (order === "desc" ? desc(rssItems.link) : asc(rssItems.link)) :
                field === "guid" ? (order === "desc" ? desc(rssItems.guid) : asc(rssItems.guid)) :
                  field === "pubDate" ? (order === "desc" ? desc(rssItems.pubDate) : asc(rssItems.pubDate)) :
                    field === "createdAt" ? (order === "desc" ? desc(rssItems.createdAt) : asc(rssItems.createdAt)) :
                      desc(rssItems.createdAt)
      )
      .limit(limit)
      .offset(offset);

    // 获取总数
    const countResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(rssItems)
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

  // 删除RSS条目
  delete: async (id: string) => {
    return await db
      .delete(rssItems)
      .where(eq(rssItems.id, id))
      .returning();
  },
}; 