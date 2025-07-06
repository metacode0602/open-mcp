import { and, asc, desc, eq, like, or, sql } from "drizzle-orm";
import { db } from "../../index";
import { appAnalysisHistory, apps, appTags, tags } from "../../schema";
import { zCreateAppAnalysisHistorySchema, zUpdateAppAnalysisHistorySchema, zSearchAppAnalysisHistorySchema, AppAnalysisHistoryStatus, RepositoryDetail } from "../../types";

export const appAnalysisHistoryDataAccess = {
  // 创建应用分析历史
  create: async (data: typeof zCreateAppAnalysisHistorySchema._type) => {
    return await db.insert(appAnalysisHistory).values({
      type: data.type,
      appId: data.appId,
      url: data.url,
      version: data.version,
      analysisResult: data.analysisResult,
      features: data.features,
      tools: data.tools,
      tags: data.tags,
      categories: data.categories,
      readme: data.readme,
      status: data.status,
      error: data.error,
      startTime: data.startTime,
      endTime: data.endTime,
    }).returning();
  },

  // 更新应用分析历史
  update: async (id: string, data: typeof zUpdateAppAnalysisHistorySchema._type) => {
    return await db.update(appAnalysisHistory).set(data).where(eq(appAnalysisHistory.id, id)).returning();
  },

  // 获取应用分析历史
  getById: async (id: string) => {
    return db.query.appAnalysisHistory.findFirst({
      where: eq(appAnalysisHistory.id, id),
      with: {
        app: true,
      },
    });
  },

  // 搜索应用分析历史
  search: async (params: typeof zSearchAppAnalysisHistorySchema._type) => {
    const { query, page = 1, limit = 10, field, order, appId, status, url } = params;
    const offset = (page - 1) * limit;

    // 构建查询条件
    const conditions = [];

    if (query) {
      conditions.push(or(like(appAnalysisHistory.id, `%${query}%`), like(appAnalysisHistory.version, `%${query}%`)));
    }

    if (appId) {
      conditions.push(eq(appAnalysisHistory.appId, appId));
    }

    if (status) {
      conditions.push(eq(appAnalysisHistory.status, status));
    }

    if (url) {
      conditions.push(eq(appAnalysisHistory.url, url));
    }

    // 构建排序条件
    const orderBy = [];
    if (field) {
      const orderDirection = order === "desc" ? desc : asc;
      if (field === "version") orderBy.push(orderDirection(appAnalysisHistory.version));
      if (field === "status") orderBy.push(orderDirection(appAnalysisHistory.status));
      if (field === "startTime") orderBy.push(orderDirection(appAnalysisHistory.startTime));
      if (field === "endTime") orderBy.push(orderDirection(appAnalysisHistory.endTime));
      if (field === "createdAt") orderBy.push(orderDirection(appAnalysisHistory.createdAt));
    } else {
      // 默认按创建时间倒序
      orderBy.push(desc(appAnalysisHistory.createdAt));
    }

    // 执行查询
    const results = await db.query.appAnalysisHistory.findMany({
      where: conditions.length > 0 ? and(...conditions) : undefined,
      orderBy,
      limit,
      offset,
      with: {
        app: true,
      },
    });

    // 获取总数
    const countResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(appAnalysisHistory)
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

  // 删除应用分析历史
  delete: async (id: string) => {
    return await db.delete(appAnalysisHistory).where(eq(appAnalysisHistory.id, id)).returning();
  },

  getListByAppId: async (appId: string, limit?: number) => {
    return await db.query.appAnalysisHistory.findMany({
      where: eq(appAnalysisHistory.appId, appId),
      orderBy: desc(appAnalysisHistory.createdAt),
      limit: limit ?? 10,
    });
  },

  startAnalysis: async (appId: string, url: string, type: "website" | "github") => {
    const [data] = await db.insert(appAnalysisHistory).values({
      appId,
      url,
      type,
      status: "in_progress",
      startTime: new Date(),
      analysisResult: {},
    }).returning();
    return data;
  },

  /**
   * 更新应用分析历史状态
   * @param id 应用分析历史ID
   * @param data 更新数据
   * @returns 更新后的应用分析历史
   */
  updateStatus: async (id: string, data: { status: AppAnalysisHistoryStatus, startTime?: Date, id: string, endTime?: Date, error?: string, message?: string }) => {
    return await db.update(appAnalysisHistory).set(data).where(eq(appAnalysisHistory.id, id));
  },

  updateResult: async (id: string, data: {
    status: AppAnalysisHistoryStatus,
    analysisResult: Record<string, any>,
    endTime: Date,
    message: string,
    error: string,
    features: string[],
    tools: string[],
    tags: string[],
    categories: string[],
    readme: string,
  }) => {
    return await db.transaction(async (tx) => {
      const detail = JSON.parse(JSON.stringify(data.analysisResult)) as RepositoryDetail;
      // Update analysis history
      const [result] = await tx.update(appAnalysisHistory)
        .set({
          status: data.status,
          analysisResult: data.analysisResult,
          endTime: data.endTime,
          message: data.message,
          error: data.error,
          features: data.features,
          tools: data.tools,
          tags: data.tags,
          categories: data.categories,
          readme: data.readme,
        })
        .where(eq(appAnalysisHistory.id, id))
        .returning();
      if (result && result.appId) {

        // Update apps table
        await tx.update(apps).set({
          longDescription: detail.longDescription,
          features: detail.features,
          version: detail.version,
          license: detail.license,
          stars: detail.stars,
          forks: detail.forks,
          issues: detail.issues,
          pullRequests: detail.pullRequests,
          contributors: detail.contributors,
          lastCommit: new Date(detail.lastCommitDate),
          watchers: detail.watchers,
          banner: detail.openGraphImageUrl,
          readme: detail.readme,
          primaryLanguage: detail?.primaryLanguage,
          languages: detail?.languages ?? [],
          commits: detail?.commits ?? 0,
          releases: detail?.releases ?? 0,
          analysed: true,
          lastAnalyzedAt: new Date(),
        }).where(eq(apps.id, result.appId)).returning();

        // Handle topics/tags
        if (detail?.topics?.length > 0) {
          // Insert new tags
          const tagResult = await tx.insert(tags)
            .values(detail.topics.map((topic) => ({
              slug: topic,
              name: topic,
              source: 'user' as const
            })))
            .onConflictDoNothing()
            .returning();

          if (tagResult.length > 0) {
            // Create app-tag associations
            await tx.insert(appTags)
              .values(tagResult.map((tag) => ({
                appId: result.appId,
                tagId: tag.id,
              })))
              .onConflictDoNothing();
          }
        }

      }

      return result;
    });
  },

  /**
   * 更新应用分析历史状态。 这个方法主要是API模块调用，他们是不同的应用，使用不同的数据库。
   * @param id 应用分析历史ID
   * @param data 更新数据
   * @returns 更新后的应用分析历史
   */
  updateAPIStatus: async (id: string, data: {
    appId: string, status: AppAnalysisHistoryStatus, startTime?: Date,
    endTime?: Date, error?: string, type: "github" | "website", github: string
  }) => {
    const [result] = await db.insert(appAnalysisHistory)
      .values({
        id,
        type: data.type,
        appId: data.appId ?? '',
        url: data.github,  // Required field
        status: data.status,
        startTime: data.startTime,
        endTime: data.endTime,
        error: data.error,
        analysisResult: {},  // Required field
      }).onConflictDoUpdate({
        target: [appAnalysisHistory.id],
        set: {
          status: data.status,
          endTime: data.endTime,
          error: data.error,
          analysisResult: {},  // Required field
        },
      })
      .returning();
    return result;
  },
  /**
   * 更新应用分析历史结果 这个方法主要是API模块调用，他们是不同的应用，使用不同的数据库。
   * @param id 应用分析历史ID
   * @param data 更新数据
   * @returns 更新后的应用分析历史
   */
  updateAPIResult: async (id: string, data: {
    status: AppAnalysisHistoryStatus,
    analysisResult: Record<string, any>,
    endTime: Date,
    message: string,
    error: string,
    features: string[],
    tools: string[],
    tags: string[],
    categories: string[],
    readme: string,
  }) => {
    const [result] = await db.update(appAnalysisHistory).set({
      status: data.status,
      analysisResult: data.analysisResult,
      endTime: data.endTime,
      message: data.message,
      error: data.error,
      features: data.features,
      tools: data.tools,
      tags: data.tags,
      categories: data.categories,
      readme: data.readme,
    }).where(eq(appAnalysisHistory.id, id)).returning();
    return result;
  },
}