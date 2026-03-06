import { categoriesDataAccess } from "@repo/db/database/admin";
import { publicProcedure, router } from "../../trpc";

/** 市场页分类：统一分类树，Skill/Persona 共用根级分类（见 TAGS_CATEGORIES_TYPE_ANALYSIS.md） */
export const marketplaceCategoriesRouter = router({
  /** 统一根级分类，Skill 与 Persona 页共用 */
  listUnifiedCategories: publicProcedure.query(async () => {
    return categoriesDataAccess.getRootCategories();
  }),

  /** @deprecated 与 listUnifiedCategories 相同，保留兼容 */
  listSkillCategories: publicProcedure.query(async () => {
    return categoriesDataAccess.getRootCategories();
  }),

  /** @deprecated 与 listUnifiedCategories 相同，保留兼容 */
  listPersonaCategories: publicProcedure.query(async () => {
    return categoriesDataAccess.getRootCategories();
  }),
});
