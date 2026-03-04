import { categoriesDataAccess } from "@repo/db/database/admin";
import { publicProcedure, router } from "../../trpc";

/** 市场页 Skill/Persona 分类：从 categories 表按父级 slug（skills / persona）查一级子分类 */
export const marketplaceCategoriesRouter = router({
  listSkillCategories: publicProcedure.query(async () => {
    return categoriesDataAccess.getChildrenByParentSlug("skills");
  }),

  listPersonaCategories: publicProcedure.query(async () => {
    return categoriesDataAccess.getChildrenByParentSlug("persona");
  }),
});
