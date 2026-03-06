import { asc, eq } from "drizzle-orm";
import { apps, appTags, tags } from "../../schema";
import type { TagsCacheItem } from "../../mcp-schema";
import type { db } from "../../index";

/**
 * 根据当前 app_tags + tags 重新计算该 app 的 tags 快照并写回 apps.tags_cache。
 * 凡写 app_tags 的地方在同一事务内调用此方法，保证一致性。见 docs/apps-tags-cache-implementation.md
 */
export async function refreshAppTagsCache(
  dbOrTx: typeof db,
  appId: string
): Promise<void> {
  const rows = await dbOrTx
    .select({
      tagId: tags.id,
      tagName: tags.name,
      tagSlug: tags.slug,
    })
    .from(appTags)
    .innerJoin(tags, eq(appTags.tagId, tags.id))
    .where(eq(appTags.appId, appId))
    .orderBy(asc(appTags.createdAt));

  const cache: TagsCacheItem[] = rows.map((r, order) => ({
    id: r.tagId,
    name: r.tagName,
    slug: r.tagSlug,
    order,
  }));

  await dbOrTx
    .update(apps)
    .set({
      tagsCache: cache.length > 0 ? cache : null,
      updatedAt: new Date(),
    })
    .where(eq(apps.id, appId));
}
