import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@repo/db";
import { rankings, rankingRecords, repos, apps } from "@repo/db/schema";
import { eq, and } from "drizzle-orm";

// 验证请求数据的schema
const ProjectSchema = z.object({
  rank: z.number(),
  name: z.string(),
  full_name: z.string(),
  description: z.string().optional(),
  stars: z.number(),
  delta: z.number(),
  url: z.string().optional(),
  icon: z.string().optional(),
});

const WeeklyRankingSchema = z.object({
  year: z.number(),
  week: z.number(),
  projects: z.array(ProjectSchema),
  total_projects: z.number(),
  timestamp: z.string(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // 验证请求数据
    const validatedData = WeeklyRankingSchema.parse(body);
    const { year, week, projects, total_projects } = validatedData;

    // 生成periodKey，格式为 "YYYY-WNN" (例如: "2024-W01")
    const periodKey = `${year}-W${week.toString().padStart(2, '0')}`;

    // 直接插入或更新排行记录
    const [ranking] = await db
      .insert(rankings)
      .values({
        name: `GitHub Weekly Ranking ${periodKey}`,
        source: "github",
        description: `GitHub weekly trending repositories for ${periodKey}`,
        recordsCount: total_projects,
        type: "weekly",
        status: true,
        periodKey,
      })
      .onConflictDoUpdate({
        target: [rankings.source, rankings.type, rankings.periodKey],
        set: {
          recordsCount: total_projects,
          updatedAt: new Date(),
        },
      })
      .returning();

    if (!ranking) {
      throw new Error("Failed to create or update ranking");
    }

    const rankingId = ranking.id;

    // 删除现有的排行记录
    await db
      .delete(rankingRecords)
      .where(eq(rankingRecords.rankingId, rankingId));

    // 批量插入新的排行记录
    const rankingRecordsData = [];

    for (const project of projects) {
      // 从full_name中提取owner和name
      const [owner, name] = project.full_name.split('/');

      // 检查owner和name是否有效
      if (!owner || !name) {
        console.warn(`Invalid full_name format: ${project.full_name}`);
        continue;
      }

      // 通过owner和name查找repo
      const repo = await db
        .select()
        .from(repos)
        .where(
          and(
            eq(repos.owner, owner),
            eq(repos.name, name)
          )
        )
        .limit(1);

      if (repo.length > 0 && repo[0]?.id) {
        // 通过repoId查找app
        const app = await db
          .select()
          .from(apps)
          .where(eq(apps.repoId, repo[0].id))
          .limit(1);

        if (app.length > 0 && app[0]?.id) {
          rankingRecordsData.push({
            rankingId,
            entityId: app[0].id, // 使用app的id作为entityId
            entityName: project.name,
            entityType: "apps" as const,
            score: project.stars,
            rank: project.rank || rankingRecordsData.length + 1,
          });
        } else {
          console.warn(`No app found for repo: ${project.full_name}`);
        }
      } else {
        console.warn(`No repo found for: ${project.full_name}`);
      }
    }

    if (rankingRecordsData.length > 0) {
      await db.insert(rankingRecords).values(rankingRecordsData);
    }

    return NextResponse.json({
      success: true,
      message: "Weekly ranking data saved successfully",
      data: {
        rankingId,
        periodKey,
        totalProjects: total_projects,
        year,
        week,
      },
    });

  } catch (error) {
    console.error("Error processing weekly ranking data:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid data format",
          errors: error.errors,
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        message: "Internal server error",
      },
      { status: 500 }
    );
  }
}
