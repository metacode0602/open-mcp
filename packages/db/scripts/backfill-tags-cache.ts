/**
 * 回填 apps.tags_cache：根据当前 app_tags + tags 为每个 app 生成快照并写回。
 * 迁移添加列后运行一次即可。用法：pnpm exec tsx packages/db/scripts/backfill-tags-cache.ts
 * 见 docs/apps-tags-cache-implementation.md
 */
import { db } from "../index";
import { apps } from "../schema";
import { refreshAppTagsCache } from "../database/admin/app-tags-cache";

async function main() {
  const rows = await db.select({ id: apps.id }).from(apps);
  const total = rows.length;
  const batchSize = 100;
  let done = 0;
  for (let i = 0; i < rows.length; i += batchSize) {
    const batch = rows.slice(i, i + batchSize);
    for (const row of batch) {
      await refreshAppTagsCache(db, row.id);
      done++;
      if (done % 50 === 0) {
        console.log(`backfill-tags-cache: ${done}/${total}`);
      }
    }
  }
  console.log(`backfill-tags-cache: done ${total} apps`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
