import { createId } from "@paralleldrive/cuid2";
import { db } from "@repo/db";
import { apps, repos } from "@repo/db/schema";
import { and, eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const SkillWebhookDataSchema = z.object({
  repo_full_name: z.string(),
  repo_name: z.string(),
  repo_owner: z.string(),
  skill_dir: z.string(),
  name: z.string(),
  description: z.string(),
  description_zh: z.string(),
  readme: z.string(),
  readme_zh: z.string(),
  version: z.string().nullable().optional(),
  category_id: z.string().nullable().optional(),
  features: z.array(z.string()).nullable().optional(),
  scenario: z.string().nullable().optional(),
  license: z.string().nullable().optional(),
  tools: z.array(z.string()).nullable().optional(),
});

const SkillWebhookRequestSchema = z.object({
  event_type: z.literal("skill_updated"),
  timestamp: z.string(),
  data: SkillWebhookDataSchema,
});

const SCENARIO_MAX_LENGTH = 50;

function validateWebhookHeaders(headers: Headers): boolean {
  const webhookSecret = process.env.WEBHOOK_SECRET;
  if (!webhookSecret) {
    return true;
  }
  const signature = headers.get("x-webhook-signature");
  const timestamp = headers.get("x-webhook-timestamp");
  if (!signature || !timestamp) {
    return false;
  }
  return true;
}

export const dynamic = "force-dynamic";

/**
 * POST /api/webhook/daily/skills
 * 接收外部处理好的 skill 数据，写入 repos（若需）与 apps（type='skill'）。
 * 统计字段（stars/forks/watchers 等）从 repos 表读取并写入 app。
 */
export async function POST(request: NextRequest) {
  try {
    if (!validateWebhookHeaders(request.headers)) {
      return NextResponse.json({ error: "Invalid webhook signature" }, { status: 401 });
    }

    const body = await request.json();
    const parsed = SkillWebhookRequestSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid webhook data format", details: parsed.error },
        { status: 400 }
      );
    }

    const { data } = parsed.data;

    const result = await db.transaction(async (tx) => {
      let repo = await tx.query.repos.findFirst({
        where: eq(repos.fullName, data.repo_full_name),
      });

      if (!repo) {
        const repoId = createId();
        const now = new Date();
        const [inserted] = await tx
          .insert(repos)
          .values({
            id: repoId,
            name: data.repo_name,
            fullName: data.repo_full_name,
            owner: data.repo_owner,
            owner_id: 0,
            added_at: now,
            pushed_at: now,
            created_at: now,
          })
          .returning();
        if (!inserted) throw new Error(`Failed to create repo: ${data.repo_full_name}`);
        repo = inserted;
      }

      const slug = `${data.repo_owner}/${data.repo_name}/${data.name}`;
      const scenario =
        data.scenario != null && data.scenario.length > SCENARIO_MAX_LENGTH
          ? data.scenario.slice(0, SCENARIO_MAX_LENGTH)
          : data.scenario ?? null;

      const appPayload = {
        slug,
        name: data.name,
        description: data.description,
        descriptionZh: data.description_zh,
        readme: data.readme,
        readmeZh: data.readme_zh,
        version: data.version ?? null,
        type: "skill" as const,
        source: "admin" as const,
        status: "approved" as const,
        publishStatus: "online" as const,
        repoId: repo.id,
        categoryId: data.category_id ?? null,
        features: data.features ?? null,
        scenario,
        license: data.license ?? null,
        updatedAt: new Date(),
        stars: repo.stars ?? 0,
        forks: repo.forks ?? 0,
        watchers: repo.watchers_count ?? 0,
        contributors: repo.contributor_count ?? 0,
        releases: repo.releases_count ?? 0,
        commits: repo.commit_count ?? 0,
        lastCommit: repo.last_commit ?? null,
      };

      const existing = await tx.query.apps.findFirst({
        where: and(eq(apps.slug, slug), eq(apps.type, "skill")),
      });

      let app;
      if (existing) {
        const [updated] = await tx
          .update(apps)
          .set(appPayload)
          .where(eq(apps.id, existing.id))
          .returning();
        if (!updated) throw new Error(`Failed to update app: ${slug}`);
        app = updated;
      } else {
        const [inserted] = await tx
          .insert(apps)
          .values({
            ...appPayload,
            id: createId(),
            analysed: false,
            featured: false,
            verified: false,
            deleted: false,
            createdAt: new Date(),
          })
          .returning();
        if (!inserted) throw new Error(`Failed to create app: ${slug}`);
        app = inserted;
      }

      return { repo, app, slug };
    });

    return NextResponse.json({
      success: true,
      message: "Skill webhook processed successfully",
      data: {
        repo_id: result.repo.id,
        app_id: result.app.id,
        slug: result.slug,
        processed_at: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error("Skills webhook error:", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Data validation failed", details: error.flatten().fieldErrors }, { status: 400 });
    }
    if (error instanceof Error) {
      return NextResponse.json({ error: "Internal server error", message: error.message }, { status: 500 });
    }
    return NextResponse.json({ error: "Unknown error occurred" }, { status: 500 });
  }
}
