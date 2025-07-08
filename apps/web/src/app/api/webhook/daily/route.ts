import { db } from "@repo/db";
import { slugifyText } from "@repo/db";
import { apps, appTags, repos, snapshots, snapshotsMonthly, snapshotsWeekly, tags } from "@repo/db/schema";
import { and, eq, or } from "drizzle-orm";
import fs from "fs";
import { NextRequest, NextResponse } from "next/server";
import path from "path";
import { z } from "zod";

// Webhook数据验证schema
const RepoWebhookDataSchema = z.object({
  // 基本信息
  id: z.string(),
  full_name: z.string(),
  name: z.string(),
  owner: z.string(),
  owner_id: z.number(),

  // 描述信息
  description: z.string().nullable().optional(),
  description_zh: z.string().nullable().optional(),
  homepage: z.string().nullable().optional(),

  // 统计信息
  stars: z.number().nullable().optional(),
  forks: z.number().nullable().optional(),
  contributor_count: z.number().nullable().optional(),
  mentionable_users_count: z.number().nullable().optional(),
  watchers_count: z.number().nullable().optional(),
  pull_requests_count: z.number().nullable().optional(),
  releases_count: z.number().nullable().optional(),
  commit_count: z.number().nullable().optional(),

  // 技术信息
  topics: z.array(z.string()).nullable().optional(),
  languages: z.any().nullable().optional(),
  license_spdx_id: z.string().nullable().optional(),
  default_branch: z.string().nullable().optional(),

  // 时间信息
  created_at: z.string(),
  pushed_at: z.string(),
  last_commit: z.string().nullable().optional(),
  added_at: z.string(),
  updated_at: z.string().nullable().optional(),

  // 状态信息
  archived: z.boolean().nullable().optional(),

  // 资源信息
  icon_url: z.string().nullable().optional(),
  open_graph_image_url: z.string().nullable().optional(),
  open_graph_image_oss_url: z.string().nullable().optional(),
  uses_custom_open_graph_image: z.boolean().nullable().optional(),

  // README内容
  readme_content: z.string().nullable().optional(),
  readme_content_zh: z.string().nullable().optional(),
  // 通过readme内容生成简介信息，用于app详情页
  long_description: z.string().nullable().optional(),

  // Release信息
  latest_release_name: z.string().nullable().optional(),
  latest_release_tag_name: z.string().nullable().optional(),
  latest_release_published_at: z.string().nullable().optional(),
  latest_release_url: z.string().nullable().optional(),
  latest_release_description: z.string().nullable().optional(),
  latest_release_description_zh: z.string().nullable().optional(),

  // 处理状态
  processing_status: z.object({
    icon_processed: z.boolean(),
    description_translated: z.boolean(),
    readme_translated: z.boolean(),
    og_image_processed: z.boolean(),
    release_note_translated: z.boolean(),
  }),

  // 元数据
  meta: z.object({
    task_name: z.string(),
    processed_at: z.string(),
    processing_time_ms: z.number(),
    success: z.boolean(),
    error_message: z.string().optional(),
  }),
});

const RepoWebhookRequestSchema = z.object({
  event_type: z.literal('repo_updated'),
  timestamp: z.string(),
  data: RepoWebhookDataSchema,
});

export const dynamic = "force-dynamic";

/**
 * 转换languages格式从对象数组到字符串数组
 */
function transformLanguages(languages: any): string[] | null {
  if (!languages || !Array.isArray(languages)) {
    return null;
  }

  return languages
    .map((lang: any) => lang?.name)
    .filter((name: string) => name && typeof name === 'string');
}

/**
 * 验证webhook请求头
 */
function validateWebhookHeaders(headers: Headers): boolean {
  const webhookSecret = process.env.WEBHOOK_SECRET;
  if (!webhookSecret) {
    console.warn("WEBHOOK_SECRET not configured");
    return true; // 如果没有配置secret，允许请求通过
  }

  const signature = headers.get('x-webhook-signature');
  const timestamp = headers.get('x-webhook-timestamp');

  if (!signature || !timestamp) {
    return false;
  }

  // 这里可以添加更复杂的签名验证逻辑
  // 目前简单检查是否存在
  return true;
}

/**
 * 处理topics作为tags
 */
async function processTopicsAsTags(tx: any, repoId: string, topics: string[] | null | undefined) {
  if (!topics || topics.length === 0) {
    console.log(`No topics to process for repo: ${repoId}`);
    return [];
  }

  try {
    const processedTags = [];

    // 第一步：无论是否有对应的apps，都先将所有topics写入tags
    for (const topicName of topics) {
      try {
        // 验证topic名称
        if (!topicName || typeof topicName !== 'string' || topicName.trim().length === 0) {
          console.warn(`Invalid topic name: ${topicName}, skipping`);
          continue;
        }

        const trimmedTopicName = topicName.trim();

        // 生成slug
        const slug = slugifyText(trimmedTopicName);

        // 尝试插入tag，如果已存在则忽略（onConflictDoNothing）
        const [tag] = await tx
          .insert(tags)
          .values({
            name: trimmedTopicName,
            slug: slug,
            source: 'user' as const, // 从GitHub topics自动生成的标签
            type: 'all' as const, // 默认类型
            description: `Tag automatically generated from GitHub topic: ${trimmedTopicName}`,
          })
          .onConflictDoNothing({
            target: tags.name,
          })
          .returning();

        // 获取最终的tag（新创建的或已存在的）
        let finalTag = tag;
        if (!finalTag) {
          // 如果tag已存在，获取现有tag
          finalTag = await tx.query.tags.findFirst({
            where: eq(tags.name, trimmedTopicName),
          });
        }

        if (finalTag) {
          processedTags.push(finalTag);
          if (tag) {
            console.log(`Created new tag: ${trimmedTopicName}`);
          } else {
            console.log(`Tag already exists: ${trimmedTopicName}`);
          }
        } else {
          console.warn(`Failed to get or create tag for topic: ${trimmedTopicName}`);
        }

      } catch (tagError) {
        console.error(`Error processing topic "${topicName}":`, tagError);
        // 继续处理其他topics，不中断整个流程
      }
    }

    // 第二步：查找通过repoId关联的apps，然后关联tags
    const relatedApps = await tx.query.apps.findMany({
      where: eq(apps.repoId, repoId),
    });

    if (relatedApps.length === 0) {
      console.log(`No apps found for repo: ${repoId}, but ${processedTags.length} tags were processed`);
      return processedTags;
    }

    // 第三步：为每个关联的app创建app-tag关联
    for (const finalTag of processedTags) {
      if (!finalTag || !finalTag.id) {
        continue;
      }

      for (const app of relatedApps) {
        try {
          // 确保app有有效的id
          if (!app || !app.id) {
            console.warn(`App object is invalid, skipping app-tag association for tag: ${finalTag.name}`);
            continue;
          }

          // 检查app-tag关联是否已存在
          const existingAppTag = await tx.query.appTags.findFirst({
            where: and(
              eq(appTags.appId, app.id),
              eq(appTags.tagId, finalTag.id)
            ),
          });

          if (!existingAppTag) {
            await tx
              .insert(appTags)
              .values({
                appId: app.id,
                tagId: finalTag.id,
              })
              .onConflictDoNothing({
                target: [appTags.appId, appTags.tagId],
              });

            console.log(`Created app-tag association: app ${app.name} -> tag ${finalTag.name}`);
          }
        } catch (appTagError) {
          console.error(`Error creating app-tag association for app ${app.name} and tag ${finalTag.name}:`, appTagError);
          // 继续处理其他app，不中断整个流程
        }
      }
    }

    console.log(`Successfully processed ${processedTags.length} topics as tags for repo: ${repoId}, associated with ${relatedApps.length} apps`);
    return processedTags;

  } catch (error) {
    console.error(`Error processing topics as tags for repo ${repoId}:`, error);
    throw error;
  }
}

/**
 * 更新或创建仓库记录
 */
async function upsertRepo(tx: any, data: z.infer<typeof RepoWebhookDataSchema>) {
  const repoData = {
    id: data.id,
    name: data.name,
    fullName: data.full_name,
    owner: data.owner,
    owner_id: data.owner_id,
    description: data.description,
    description_zh: data.description_zh,
    homepage: data.homepage,
    stars: data.stars,
    forks: data.forks,
    contributor_count: data.contributor_count,
    mentionable_users_count: data.mentionable_users_count,
    watchers_count: data.watchers_count,
    pull_requests_count: data.pull_requests_count,
    releases_count: data.releases_count,
    commit_count: data.commit_count,
    topics: data.topics,
    languages: transformLanguages(data.languages),
    license_spdx_id: data.license_spdx_id,
    default_branch: data.default_branch,
    created_at: new Date(data.created_at),
    pushed_at: new Date(data.pushed_at),
    last_commit: data.last_commit ? new Date(data.last_commit) : null,
    added_at: new Date(data.added_at),
    archived: data.archived,
    icon_url: data.icon_url,
    open_graph_image_url: data.open_graph_image_url,
    open_graph_image_oss_url: data.open_graph_image_oss_url,
    uses_custom_open_graph_image: data.uses_custom_open_graph_image,
    readme_content: data.readme_content,
    readme_content_zh: data.readme_content_zh,
    latest_release_name: data.latest_release_name,
    latest_release_tag_name: data.latest_release_tag_name,
    latest_release_published_at: data.latest_release_published_at ? new Date(data.latest_release_published_at) : null,
    latest_release_url: data.latest_release_url,
    latest_release_description: data.latest_release_description,
    latest_release_description_zh: data.latest_release_description_zh,
  };

  try {
    // 检查仓库是否已存在
    const existingRepo = await tx.query.repos.findFirst({
      where: or(
        eq(repos.id, data.id),
        eq(repos.fullName, data.full_name)
      ),
    });

    let repo;
    if (existingRepo) {
      // 更新现有仓库
      const [updatedRepo] = await tx
        .update(repos)
        .set(repoData)
        .where(eq(repos.id, existingRepo.id))
        .returning();

      if (!updatedRepo) {
        throw new Error(`Failed to update repo: ${data.full_name}, ${data.id}`);
      }

      console.log(`Updated repo: ${data.full_name}`);
      repo = updatedRepo;
    } else {
      // 创建新仓库
      const [newRepo] = await tx
        .insert(repos)
        .values(repoData)
        .returning();

      if (!newRepo) {
        throw new Error(`Failed to create new repo: ${data.full_name}`);
      }

      console.log(`Created new repo: ${data.full_name}`);
      repo = newRepo;
    }

    // 确保repo存在后再处理topics
    if (!repo || !repo.id) {
      throw new Error(`Repo object is invalid for: ${data.full_name}`);
    }

    // 处理topics作为tags
    if (data.topics && data.topics.length > 0) {
      try {
        await processTopicsAsTags(tx, repo.id, data.topics);
      } catch (topicsError) {
        console.error(`Error processing topics for repo ${data.full_name}:`, topicsError);
        // 不中断整个流程，继续执行
      }
    }

    return repo;

  } catch (error) {
    console.error(`Error in upsertRepo for ${data.full_name}:`, error);
    throw error;
  }
}

/**
 * 创建快照记录
 */
async function createSnapshot(tx: any, repoId: string, data: z.infer<typeof RepoWebhookDataSchema>) {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1;
  const day = now.getDate();

  const snapshotData = {
    repoId: repoId,
    year: year,
    month: month,
    day: day,
    forks: data.forks || 0,
    stars: data.stars || 0,
    watchers: data.watchers_count || 0,
    contributors: data.contributor_count || 0,
    pullRequests: data.pull_requests_count || 0,
    releases: data.releases_count || 0,
    commits: data.commit_count || 0,
    updatedAt: now,
  };

  const [snapshot] = await tx
    .insert(snapshots)
    .values(snapshotData)
    .returning();

  if (!snapshot) {
    throw new Error(`Failed to create snapshot for repo: ${data.full_name}`);
  }

  console.log(`Created snapshot for repo: ${data.full_name}, date: ${year}-${month}-${day}`);
  return snapshot;
}

/**
 * 创建或更新月度快照记录
 */
async function upsertMonthlySnapshot(tx: any, repoId: string, data: z.infer<typeof RepoWebhookDataSchema>) {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1;

  const monthlySnapshotData = {
    repoId: repoId,
    year: year,
    month: month,
    forks: data.forks || 0,
    stars: data.stars || 0,
    watchers: data.watchers_count || 0,
    contributors: data.contributor_count || 0,
    pullRequests: data.pull_requests_count || 0,
    releases: data.releases_count || 0,
    commits: data.commit_count || 0,
    updatedAt: now,
  };

  // 使用 onConflictDoUpdate 机制
  const [monthlySnapshot] = await tx
    .insert(snapshotsMonthly)
    .values(monthlySnapshotData)
    .onConflictDoUpdate({
      target: [snapshotsMonthly.repoId, snapshotsMonthly.year, snapshotsMonthly.month],
      set: monthlySnapshotData,
    })
    .returning();

  if (!monthlySnapshot) {
    throw new Error(`Failed to upsert monthly snapshot for repo: ${data.full_name}`);
  }

  console.log(`Upserted monthly snapshot for repo: ${data.full_name}, period: ${year}-${month}`);
  return monthlySnapshot;
}

/**
 * 创建或更新周度快照记录
 */
async function upsertWeeklySnapshot(tx: any, repoId: string, data: z.infer<typeof RepoWebhookDataSchema>) {
  const now = new Date();
  const year = now.getFullYear();

  // 计算当前是第几周
  const startOfYear = new Date(year, 0, 1);
  const days = Math.floor((now.getTime() - startOfYear.getTime()) / (24 * 60 * 60 * 1000));
  const week = Math.ceil((days + startOfYear.getDay() + 1) / 7);

  const weeklySnapshotData = {
    repoId: repoId,
    year: year,
    week: week,
    forks: data.forks || 0,
    stars: data.stars || 0,
    watchers: data.watchers_count || 0,
    contributors: data.contributor_count || 0,
    pullRequests: data.pull_requests_count || 0,
    releases: data.releases_count || 0,
    commits: data.commit_count || 0,
    updatedAt: now,
  };

  // 使用 onConflictDoUpdate 机制
  const [weeklySnapshot] = await tx
    .insert(snapshotsWeekly)
    .values(weeklySnapshotData)
    .onConflictDoUpdate({
      target: [snapshotsWeekly.repoId, snapshotsWeekly.year, snapshotsWeekly.week],
      set: weeklySnapshotData,
    })
    .returning();

  if (!weeklySnapshot) {
    throw new Error(`Failed to upsert weekly snapshot for repo: ${data.full_name}`);
  }

  console.log(`Upserted weekly snapshot for repo: ${data.full_name}, period: ${year}-W${week}`);
  return weeklySnapshot;
}

/**
 * 保存webhook数据到指定目录
 */
function saveWebhookData(data: any, repoId: string) {
  try {
    // 创建webhook数据存储目录
    const webhookDataDir = path.join(process.cwd(), 'webhook-data');
    if (!fs.existsSync(webhookDataDir)) {
      fs.mkdirSync(webhookDataDir, { recursive: true });
    }

    // 创建按日期分类的子目录
    const now = new Date();
    const dateDir = path.join(webhookDataDir, `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`);
    if (!fs.existsSync(dateDir)) {
      fs.mkdirSync(dateDir, { recursive: true });
    }

    // 生成文件名：时间戳_repoId.json
    const timestamp = Date.now();
    const fileName = `${timestamp}_${repoId}.json`;
    const filePath = path.join(dateDir, fileName);

    // 保存数据
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
    console.log(`Webhook data saved to: ${filePath}`);

    return filePath;
  } catch (error) {
    console.error('Error saving webhook data:', error);
    throw error;
  }
}

/**
 * 更新或创建apps记录
 */
async function upsertApps(tx: any, repoId: string, data: z.infer<typeof RepoWebhookDataSchema>) {
  try {
    const githubUrl = `https://github.com/${data.full_name}`;

    // 查找通过repoId或github URL关联的apps
    const existingApps = await tx.query.apps.findMany({
      where: or(
        eq(apps.repoId, repoId),
        eq(apps.github, githubUrl)
      ),
    });

    // 准备apps数据
    const appData = {
      stars: data.stars || 0,
      forks: data.forks || 0,
      description: data.description,
      descriptionZh: data.description_zh,
      website: (data.homepage && data.homepage.trim().length > 0) ? data.homepage : null,
      icon: data.icon_url,
      languages: transformLanguages(data.languages),
      topics: data.topics,
      license: data.license_spdx_id,
      defaultBranch: data.default_branch,
      repoCreatedAt: new Date(data.created_at),
      version: data.latest_release_tag_name,
      watchers: data.watchers_count || 0,
      contributors: data.contributor_count || 0,
      pullRequests: data.pull_requests_count || 0,
      releases: data.releases_count || 0,
      commits: data.commit_count || 0,
      lastCommit: data.last_commit ? new Date(data.last_commit) : null,
      readme: data.readme_content,
      readmeZh: data.readme_content_zh,
      banner: data.open_graph_image_oss_url || data.open_graph_image_url,
      lastAnalyzedAt: new Date(),
      longDescription: data.long_description,
      updatedAt: new Date(),
      repoId: repoId, // 确保repoId被设置
    };

    if (existingApps.length > 0) {
      // 更新现有的apps
      const updatedApps = [];
      for (const app of existingApps) {
        const [updatedApp] = await tx
          .update(apps)
          .set(appData)
          .where(eq(apps.id, app.id))
          .returning();

        if (!updatedApp) {
          console.warn(`Failed to update app: ${app.name} (${app.id})`);
          continue;
        }

        updatedApps.push(updatedApp);
        console.log(`Updated app: ${app.name} (${app.id}) with repo data from: ${data.full_name}`);
      }
      return updatedApps;
    } else {
      // 创建新的app记录
      const newAppData = {
        ...appData,
        slug: slugifyText(data.name), // 生成slug
        name: data.name,
        type: 'application' as const, // 默认类型
        source: 'automatic' as const, // 自动创建
        status: 'pending' as const, // 默认状态
        publishStatus: 'offline' as const, // 默认发布状态
        analysed: false,
        featured: false,
        verified: false,
        deleted: false,
        github: githubUrl,
        createdAt: new Date(),
      };

      const [newApp] = await tx
        .insert(apps)
        .values(newAppData)
        .returning();

      if (!newApp) {
        throw new Error(`Failed to create new app for repo: ${data.full_name}`);
      }

      console.log(`Created new app: ${data.name} (${newApp.id}) for repo: ${data.full_name}`);
      return [newApp];
    }

  } catch (error) {
    console.error(`Error in upsertApps for repo ${data.full_name}:`, error);
    throw error;
  }
}

export async function POST(request: NextRequest) {
  try {
    // 1. 验证请求头
    if (!validateWebhookHeaders(request.headers)) {
      return NextResponse.json(
        { error: "Invalid webhook signature" },
        { status: 401 }
      );
    }

    // 2. 解析请求体
    const body = await request.json();
    console.log("body", body);

    // 3. 验证数据格式
    const validationResult = RepoWebhookRequestSchema.safeParse(body);
    if (!validationResult.success) {
      console.error("Invalid webhook data format:", validationResult.error);
      return NextResponse.json(
        { error: "Invalid webhook data format", details: validationResult.error },
        { status: 400 }
      );
    }

    const { data: repoData, event_type, timestamp } = validationResult.data;

    // 4. 验证事件类型
    if (event_type !== 'repo_updated') {
      return NextResponse.json(
        { error: "Unsupported event type" },
        { status: 400 }
      );
    }

    // 5. 保存webhook数据到文件，在serverless环境中无法写入本地文件，因此暂时注释掉
    // const savedFilePath = saveWebhookData(body, repoData.id);

    // 6. 数据库事务处理
    const result = await db.transaction(async (tx) => {
      // 更新或创建仓库记录
      const repo = await upsertRepo(tx, repoData);

      // 确保repo对象有效
      if (!repo || !repo.id) {
        throw new Error(`Failed to create or update repo: ${repoData.full_name}`);
      }

      // 创建日快照记录
      const dailySnapshot = await createSnapshot(tx, repo.id, repoData);

      // 创建或更新月度快照记录
      const monthlySnapshot = await upsertMonthlySnapshot(tx, repo.id, repoData);

      // 创建或更新周度快照记录
      const weeklySnapshot = await upsertWeeklySnapshot(tx, repo.id, repoData);

      // 更新或创建对应的apps记录
      const upsertedApps = await upsertApps(tx, repo.id, repoData);

      return { repo, dailySnapshot, monthlySnapshot, weeklySnapshot, upsertedApps };
    });

    // 7. 验证结果对象
    if (!result || !result.repo || !result.repo.id) {
      throw new Error("Invalid result object from database transaction");
    }

    // 8. 返回成功响应
    return NextResponse.json({
      success: true,
      message: "Webhook processed successfully",
      data: {
        repo_id: result.repo.id,
        daily_snapshot_id: result.dailySnapshot.id,
        monthly_snapshot_id: result.monthlySnapshot.id,
        weekly_snapshot_id: result.weeklySnapshot.id,
        apps_count: result.upsertedApps.length,
        // saved_file_path: savedFilePath,
        processed_at: new Date().toISOString(),
      },
    });

  } catch (error) {
    console.error("Webhook processing error:", error);

    // 根据错误类型返回不同的状态码
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Data validation failed", details: error.errors },
        { status: 400 }
      );
    }

    if (error instanceof Error) {
      return NextResponse.json(
        { error: "Internal server error", message: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { error: "Unknown error occurred" },
      { status: 500 }
    );
  }
}
