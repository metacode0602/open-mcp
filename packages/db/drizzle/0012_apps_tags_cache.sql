-- apps.tags_cache: tag 信息快照，与 app_tags 同步，列表/详情查询用
ALTER TABLE "apps" ADD COLUMN IF NOT EXISTS "tags_cache" jsonb DEFAULT NULL;
