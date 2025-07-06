import { and, asc, desc, eq, like, not, or, sql } from "drizzle-orm";
import { db } from "../../index";
import { apps, rankingRecords, rankings } from "../../schema";
import {
  CreateAppSubmission, CreateRankingRecord, formatPeriodKey, RankingApp,
  RankingType, UpdateRankingRecord, zCreateRankingSchema, zSearchRankingsSchema,
  zUpdateRankingSchema
} from "../../types";
import { slugifyText } from "../../utils/generate-string";

// Rankings data access module
export const rankingsDataAccess = {
  // Create ranking
  create: async (data: typeof zCreateRankingSchema._type) => {
    // Check if name already exists
    if (data.name) {
      const existingRanking = await db.query.rankings.findFirst({
        where: eq(rankings.name, data.name),
      });

      if (existingRanking) {
        throw new Error(`Ranking name "${data.name}" already exists`);
      }
    }

    return db
      .insert(rankings)
      .values({
        name: data.name,
        type: data.type,
        source: data.source,
        description: data.description,
        periodKey: data.periodKey,
        status: true,
      })
      .returning();
  },

  // Update ranking
  update: async (id: string, data: typeof zUpdateRankingSchema._type) => {
    try {
      // Check if name already exists
      if (data.name) {
        const existingRanking = await db.query.rankings.findFirst({
          where: and(
            eq(rankings.name, data.name),
            not(eq(rankings.id, id))
          ),
        });

        if (existingRanking) {
          throw new Error(`Ranking name "${data.name}" already exists`);
        }
      }

      // Build update data
      const updateData: Record<string, any> = {};
      if (data.name) updateData.name = data.name;
      if (data.description !== undefined) updateData.description = data.description;

      return db.update(rankings).set(updateData).where(eq(rankings.id, id)).returning();
    } catch (error) {
      if (error instanceof Error && error.message.includes("already exists")) {
        throw error;
      }
      throw new Error("Failed to update ranking");
    }
  },

  updateStatus: async (id: string, status: boolean) => {
    return db.update(rankings).set({ status }).where(eq(rankings.id, id)).returning();
  },

  // Get ranking by ID
  getById: async (id: string) => {
    return db.query.rankings.findFirst({
      where: eq(rankings.id, id),
    });
  },

  // Search rankings
  search: async (params: typeof zSearchRankingsSchema._type) => {
    const { query, page = 1, limit = 10, field, order } = params;
    const offset = (page - 1) * limit;

    // Build query conditions
    const conditions = [];

    if (query) {
      conditions.push(like(rankings.name, `%${query}%`));
    }

    // Build sort conditions
    const orderBy = [];
    if (field) {
      const orderDirection = order === "desc" ? desc : asc;
      if (field === "name") orderBy.push(orderDirection(rankings.name));
      if (field === "createdAt") orderBy.push(orderDirection(rankings.createdAt));
      if (field === "updatedAt") orderBy.push(orderDirection(rankings.updatedAt));
    } else {
      orderBy.push(desc(rankings.createdAt));
    }

    // Execute query
    const results = await db.query.rankings.findMany({
      where: conditions.length > 0 ? and(...conditions) : undefined,
      orderBy,
      limit,
      offset,
    });

    // Get total count
    const countResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(rankings)
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

  list: async (params: typeof zSearchRankingsSchema._type) => {
    const { query, page = 1, limit = 10, field, order } = params;
    const offset = (page - 1) * limit;

    const conditions = [];

    if (query) {
      conditions.push(like(rankings.name, `%${query}%`));
    }

    const orderBy = [];
    if (field) {
      const orderDirection = order === "desc" ? desc : asc;
      if (field === "name") orderBy.push(orderDirection(rankings.name));
      if (field === "createdAt") orderBy.push(orderDirection(rankings.createdAt));
      if (field === "updatedAt") orderBy.push(orderDirection(rankings.updatedAt));
    } else {
      orderBy.push(desc(rankings.createdAt));
    }

    const results = await db.query.rankings.findMany({
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

  getRankingAppsByRankingId: async (rankingId: string, limit?: number): Promise<RankingApp[]> => {
    const rankingRecordsWithApps = await db.query.rankingRecords.findMany({
      where: eq(rankingRecords.rankingId, rankingId),
      with: {
        app: {
          with: {
            tags: {
              with: {
                tag: true
              }
            }
          }
        },
      },
      orderBy: desc(rankingRecords.rank),
      limit: limit ? limit : 10,
    });

    return rankingRecordsWithApps.map(record => ({
      id: record.app.id,
      name: record.app.name,
      slug: record.app.slug,
      description: record.app.description,
      icon: record.app.icon || "",
      stars: record.app.stars || 0,
      watchers: record.app.watchers || 0,
      forks: record.app.forks || 0,
      primaryLanguage: record.app.primaryLanguage || "",
      languages: record.app.languages || [],
      license: record.app.license || "",
      tags: record.app.tags.map(t => ({
        id: t.tag.id,
        name: t.tag.name,
        slug: t.tag.slug,
        description: t.tag.description || "",
        type: t.tag.type,
        source: t.tag.source,
        totalApps: t.tag.totalApps || 0,
        createdAt: t.tag.createdAt,
      })),
      type: record.app.type,
      source: record.app.source,
      status: record.app.status,
      rank: record.rank || 0,
      createdAt: record.app.createdAt,
    }));
  },

  findOne: async (data: { type: "daily" | "weekly" | "monthly" | "yearly"; source: "github" | "openmcp" | "producthunt"; periodKey: string }) => {
    return db.query.rankings.findFirst({
      where: and(
        eq(rankings.type, data.type),
        eq(rankings.source, data.source),
        eq(rankings.periodKey, data.periodKey),
        eq(rankings.status, true)
      ),
    });
  },

  /**
   * 根据github的日排行，创建排行榜。
   * 首先创建apps，然后创建排行榜，最后创建排行榜记录
   * @param data 
   */
  createGithubAppSubmissionRank: async (data: CreateAppSubmission[], rankingType: RankingType) => {
    const rankingId = await db.transaction(async (tx) => {
      console.info("[api] [db] [rankings.ts] [createGithubAppSubmissionRank] data", data.map(item => ({
        github: item.github
      }))
      );
      const appDatas = data.map(item => ({
        name: item.name,
        slug: slugifyText(item.name as string),
        description: item.description ?? "",
        longDescription: item.longDescription,
        icon: item.favicon,
        banner: item.logo,
        type: item.type,
        docs: item.docs,
        website: item.website && item.website?.trim().length > 0 ? item.website : null,
        github: item.github,
        source: "automatic" as const,
        status: "approved" as const,
        publishStatus: "online" as const,
        userId: item.userId,
      }));
      let allAppIds = []
      for (const app of appDatas) {
        const existing = await tx.query.apps.findFirst({
          where: or(
            and(eq(apps.name, app.name), eq(apps.type, app.type)),
            app.website ? eq(apps.website, app.website) : undefined,
            app.github ? eq(apps.github, app.github) : undefined
          ),
        });
        console.info("[api] [db] [rankings.ts] [createGithubAppSubmissionRank] existing", existing ? existing.github : "not found")
        if (existing) {
          allAppIds.push(existing);
        } else {
          const [newApp] = await tx.insert(apps).values(app).returning();
          console.info("[api] [db] [rankings.ts] [createGithubAppSubmissionRank] newApp", newApp ? newApp.github : "not found")
          if (newApp) {
            allAppIds.push(newApp);
          }
        }
      }
      // console.info("[api] [db] [rankings.ts] [createGithubAppSubmissionRank] allAppIds", allAppIds)
      // 构建排行榜数据
      const rankingData = {
        name: `Github ${rankingType === "daily" ? "日" : rankingType === "weekly" ? "周" : rankingType === "monthly" ? "月" : "年"}排行`,
        type: rankingType,
        source: "github" as const,
        description: `Github ${rankingType} Rank`,
        periodKey: formatPeriodKey(rankingType, new Date()),
        status: true,
      };

      const [ranking] = await tx.insert(rankings).values(rankingData).onConflictDoUpdate({
        target: [rankings.type, rankings.source, rankings.periodKey],
        set: {
          updatedAt: new Date(),
        },
      }).returning();

      if (!ranking) {
        throw new Error("Failed to create or find ranking");
      }
      // 创建排行榜记录
      const records = allAppIds?.map((item, index) => ({
        rankingId: ranking.id,
        entityId: item?.id,
        entityName: item.name,
        entityType: "apps" as const,
        score: item?.stars || 0,
        link: "/apps/" + item?.slug,
        rank: index + 1,
      }));

      await tx.insert(rankingRecords).values(records).onConflictDoNothing();

      return allAppIds;
    });

    return rankingId;
  }
};

// Ranking Records data access module
export const rankingRecordsDataAccess = {
  // Create ranking record
  create: async (data: CreateRankingRecord) => {
    return db
      .insert(rankingRecords)
      .values({
        rankingId: data.rankingId,
        entityId: data.entityId,
        entityName: data.entityName ?? data.entityId,
        entityType: data.entityType,
        score: data.score,
        rank: data.rank,
      })
      .returning();
  },

  // Update ranking record
  update: async (data: UpdateRankingRecord) => {
    const { id, score, rank } = data;
    return db
      .update(rankingRecords)
      .set({
        score,
        rank,
        updatedAt: new Date(),
      })
      .where(eq(rankingRecords.id, id))
      .returning();
  },

  // Delete ranking record
  delete: async (id: string) => {
    return db
      .delete(rankingRecords)
      .where(eq(rankingRecords.id, id))
      .returning();
  },

  // Get ranking record by ID
  getById: async (id: string) => {
    return db.query.rankingRecords.findFirst({
      where: eq(rankingRecords.id, id),
    });
  },

  // Get ranking records by ranking ID
  getByRankingId: async (rankingId: string) => {
    return db.query.rankingRecords.findMany({
      where: eq(rankingRecords.rankingId, rankingId),
      orderBy: desc(rankingRecords.rank),
    });
  },

  // Batch create ranking records
  batchCreate: async (rankingId: string, records: CreateRankingRecord[]) => {
    return await db.transaction(async (tx) => {
      const [count] = await tx.select({ count: sql<number>`count(*)` }).from(rankingRecords).where(eq(rankingRecords.rankingId, rankingId));
      // 更新 rankings 表的记录数和更新时间
      await tx.update(rankings)
        .set({
          updatedAt: new Date(),
          recordsCount: records.length + (count ? count.count : 0),
        })
        .where(eq(rankings.id, rankingId));

      // 插入新的排行榜记录
      const newRecords = await tx
        .insert(rankingRecords)
        .values(records.map(record => ({
          ...record,
          entityName: record.entityName || record.entityId
        }))).onConflictDoNothing()
        .returning();

      return newRecords;
    });
  },

  // Batch update ranking records
  batchUpdate: async (updates: UpdateRankingRecord[]) => {
    const results = [];
    for (const update of updates) {
      const result = await rankingRecordsDataAccess.update(update);
      results.push(...result);
    }
    return results;
  },

  // Delete all records for a ranking
  deleteByRankingId: async (rankingId: string) => {
    return db
      .delete(rankingRecords)
      .where(eq(rankingRecords.rankingId, rankingId))
      .returning();
  }
};