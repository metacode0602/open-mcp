import { and, desc, eq, SQL, sql } from "drizzle-orm";
import { db } from "../../index";
import { ClaimStatus, zCreateClaimSchema, zSearchClaimsSchema, zUpdateClaimSchema } from "../../types";
import { claims } from "../../schema";

// 声明数据访问模块
export const claimsDataAccess = {
  // 创建所有权申请
  create: async (data: typeof zCreateClaimSchema._type) => {
    return await db.insert(claims).values({
      appId: data.appId ?? "",
      userId: data.userId ?? "",
      userName: data.userName ?? "",
      title: data.title ?? "",
      userEmail: data.userEmail ?? "",
      appName: data.appName ?? "",
      appSlug: data.appSlug ?? "",
      appType: data.appType ?? "",
      appIcon: data.appIcon ?? "",
      proofUrl: data.proofUrl ?? "",
      proofType: data.proofType ?? "",
      additionalInfo: data.additionalInfo ?? "",
    }).returning();
  },

  // 更新所有权申请
  update: async (id: string, data: Omit<typeof zUpdateClaimSchema._type, "id"> & {
    verificationCode?: string | null;
    verificationExpires?: Date | null;
  }) => {
    const claim = await db.query.claims.findFirst({
      where: eq(claims.id, id),
    });

    if (!claim) {
      throw new Error("申请不存在");
    }

    // 如果更新状态，需要验证权限
    if (data.status && data.status !== claim.status) {
      // TODO: 添加权限验证逻辑
    }

    return db
      .update(claims)
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where(eq(claims.id, id))
      .returning();
  },

  // 获取所有权申请
  getById: async (id: string) => {
    return db.query.claims.findFirst({
      where: eq(claims.id, id),
      with: {
        user: true,
        app: true,
      },
    });
  },

  // 搜索所有权申请
  search: async (params: typeof zSearchClaimsSchema._type & { pageSize: number }) => {
    const { page = 1, pageSize = 10, appId, userId, status } = params;
    const offset = (page - 1) * pageSize;

    let conditions: SQL[] = [];

    if (appId) {
      conditions.push(eq(claims.appId, appId));
    }

    if (userId) {
      conditions.push(eq(claims.userId, userId));
    }

    if (status) {
      conditions.push(eq(claims.status, status));
    }

    const [countResult] = await db
      .select({ count: sql<number>`count(*)` })
      .from(claims)
      .where(and(...conditions));

    const total = countResult?.count ?? 0;

    const query = db
      .select()
      .from(claims)
      .where(and(...conditions))
      .orderBy(desc(claims.createdAt))
      .limit(pageSize)
      .offset(offset);

    const results = await query;

    return {
      data: results,
      pagination: {
        total,
        page,
        limit: pageSize,
        totalPages: Math.ceil(total / pageSize),
      },
    };
  },

  // 删除所有权申请
  delete: async (id: string) => {
    const claim = await db.query.claims.findFirst({
      where: eq(claims.id, id),
    });

    if (!claim) {
      throw new Error("申请不存在");
    }

    // 只有待处理状态的申请可以删除
    if (claim.status !== "pending") {
      throw new Error("只能删除待处理状态的申请");
    }

    return db.delete(claims).where(eq(claims.id, id)).returning();
  },

  // 获取用户所有权申请
  getClaimsByUserId: async (userId: string) => {
    return await db.query.claims.findMany({
      where: eq(claims.userId, userId),
      with: {
        app: true,
      },
    });
  },

  // 获取用户所有权申请数量
  getClaimsCountByUserId: async (userId: string) => {
    const value = await db.select({ count: sql<number>`count(*)` }).from(claims).where(eq(claims.userId, userId));
    return value[0]?.count || 0;
  },

  updateStatus: async (id: string, status: ClaimStatus, userId: string) => {
    const claim = await db.query.claims.findFirst({
      where: eq(claims.id, id),
    });

    if (!claim) {
      throw new Error("申请不存在");
    }

    // 只有待处理状态的申请可以更新状态
    if (claim.status !== "pending") {
      throw new Error("只能更新待处理状态的申请");
    }

    return db
      .update(claims)
      .set({
        status,
        updatedAt: new Date(),
        updatedBy: userId,
      })
      .where(eq(claims.id, id))
      .returning();
  }
}; 