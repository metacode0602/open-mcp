import { and, asc, desc, eq, like, or, sql } from "drizzle-orm";
import { db } from "../../index";
import { invoices } from "../../schema";
import { zCreateInvoiceSchema, zUpdateInvoiceSchema, zSearchInvoicesSchema } from "../../types";

export const invoiceData = {
  // 创建发票
  create: async (data: typeof zCreateInvoiceSchema._type) => {
    return await db.insert(invoices).values(data).returning();
  },

  // 更新发票
  update: async (id: string, data: typeof zUpdateInvoiceSchema._type) => {
    return await db
      .update(invoices)
      .set({
        userId: data.userId,
        paymentId: data.paymentId,
        type: data.type,
        title: data.title,
        taxNumber: data.taxNumber,
        address: data.address,
        email: data.email,
        status: data.status
      })
      .where(eq(invoices.id, id))
      .returning();
  },

  // 获取发票
  getById: async (id: string) => {
    return db.query.invoices.findFirst({
      where: eq(invoices.id, id),
      with: {
        user: true,
        payment: true,
      },
    });
  },

  // 搜索发票
  search: async (params: typeof zSearchInvoicesSchema._type) => {
    const { query, page = 1, limit = 10, field, order, status, userId, paymentId, type } = params;
    const offset = (page - 1) * limit;

    // 构建查询条件
    const conditions = [];

    if (query) {
      conditions.push(
        or(
          like(invoices.title, `%${query}%`),
          like(invoices.taxNumber, `%${query}%`)
        )
      );
    }

    if (status) {
      conditions.push(eq(invoices.status, status));
    }

    if (userId) {
      conditions.push(eq(invoices.userId, userId));
    }

    if (paymentId) {
      conditions.push(eq(invoices.paymentId, paymentId));
    }

    if (type) {
      conditions.push(eq(invoices.type, type));
    }

    // 构建排序条件
    const orderBy = [];
    if (field) {
      const orderDirection = order === "desc" ? desc : asc;
      if (field === "title") orderBy.push(orderDirection(invoices.title));
      if (field === "status") orderBy.push(orderDirection(invoices.status));
      if (field === "createdAt") orderBy.push(orderDirection(invoices.createdAt));
      if (field === "updatedAt") orderBy.push(orderDirection(invoices.updatedAt));
    } else {
      // 默认按创建时间倒序
      orderBy.push(desc(invoices.createdAt));
    }

    // 执行查询
    const results = await db.query.invoices.findMany({
      where: conditions.length > 0 ? and(...conditions) : undefined,
      orderBy,
      limit,
      offset,
      with: {
        user: true,
        payment: true,
      },
    });

    // 获取总数
    const countResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(invoices)
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

  // 删除发票
  delete: async (id: string) => {
    return await db
      .delete(invoices)
      .where(eq(invoices.id, id))
      .returning();
  },
}; 