import {
  apps,
  appTags,
  categories,
  tags,
  personaSkills,
  personaMcpTools,
  skillMcpTools,
} from "@repo/db/schema";
import { and, eq, inArray, like, or, SQL, desc } from "drizzle-orm";
import { db } from "../../index";

const marketplaceBaseConditions = [
  eq(apps.status, "approved"),
  eq(apps.publishStatus, "online"),
  eq(apps.deleted, false),
] as const;

export type PersonaListRow = {
  id: string;
  slug: string;
  name: string;
  description: string;
  descriptionZh: string | null;
  features: string[] | null;
  verified: boolean | null;
  ownerName: string | null;
  category: { id: string; name: string; slug: string } | null;
  tags: { id: string; name: string }[];
};

export type SkillListRow = {
  id: string;
  slug: string;
  name: string;
  description: string;
  version: string | null;
  verified: boolean | null;
  ownerName: string | null;
  category: { id: string; name: string; slug: string } | null;
  tags: { id: string; name: string }[];
};

export type McpListRow = {
  id: string;
  slug: string;
  name: string;
  icon: string | null;
  description: string;
  descriptionZh: string | null;
  stars: number | null;
  contributors: number | null;
  primaryLanguage: string | null;
  languages: string[] | null;
  createdAt: Date;
  tags: { id: string; name: string }[];
};

type ListPersonasParams = {
  categorySlug?: string;
  tagSlug?: string;
  query?: string;
  limit?: number;
  offset?: number;
};

type ListSkillsParams = ListPersonasParams;

type ListMcpParams = {
  type: "client" | "server";
} & ListPersonasParams;

function buildAppFilterConditions(params: {
  type: string;
  categorySlug?: string;
  tagSlug?: string;
  query?: string;
}): SQL[] {
  const conditions: SQL[] = [
    eq(apps.type, params.type),
    ...marketplaceBaseConditions,
  ];
  if (params.categorySlug) {
    conditions.push(eq(categories.slug, params.categorySlug));
  }
  if (params.tagSlug) {
    conditions.push(eq(tags.slug, params.tagSlug));
  }
  if (params.query?.trim()) {
    const q = `%${params.query.trim()}%`;
    conditions.push(
      or(like(apps.name, q), like(apps.description, q)) as SQL
    );
  }
  return conditions;
}

async function getAppIdsWithFilters(params: {
  type: string;
  categorySlug?: string;
  tagSlug?: string;
  query?: string;
}): Promise<string[]> {
  const conditions = buildAppFilterConditions(params);
  if (params.categorySlug || params.tagSlug) {
    const rows = await db
      .selectDistinct({ id: apps.id, createdAt: apps.createdAt })
      .from(apps)
      .leftJoin(categories, eq(apps.categoryId, categories.id))
      .leftJoin(appTags, eq(apps.id, appTags.appId))
      .leftJoin(tags, eq(appTags.tagId, tags.id))
      .where(and(...conditions))
      .orderBy(desc(apps.createdAt));
    const seen = new Set<string>();
    return rows.filter((r) => !seen.has(r.id) && seen.add(r.id)).map((r) => r.id);
  }
  const rows = await db
    .select({ id: apps.id })
    .from(apps)
    .where(and(...conditions))
    .orderBy(desc(apps.createdAt));
  return rows.map((r) => r.id);
}

async function getTagsByAppIds(appIds: string[]): Promise<Record<string, { id: string; name: string }[]>> {
  if (appIds.length === 0) return {};
  const rows = await db
    .select({
      appId: appTags.appId,
      tagId: tags.id,
      tagName: tags.name,
    })
    .from(appTags)
    .innerJoin(tags, eq(appTags.tagId, tags.id))
    .where(inArray(appTags.appId, appIds));
  const byApp: Record<string, { id: string; name: string }[]> = {};
  for (const r of rows) {
    if (!byApp[r.appId]) byApp[r.appId] = [];
    byApp[r.appId].push({ id: r.tagId, name: r.tagName });
  }
  return byApp;
}

export const marketplaceDataAccess = {
  listPersonasForMarket: async (
    params: ListPersonasParams
  ): Promise<{ items: PersonaListRow[]; total: number }> => {
    const appIds = await getAppIdsWithFilters({
      type: "persona",
      categorySlug: params.categorySlug,
      tagSlug: params.tagSlug,
      query: params.query,
    });
    const tagsByApp = await getTagsByAppIds(appIds);
    const total = appIds.length;
    if (appIds.length === 0) {
      return { items: [], total: 0 };
    }
    const limit = params.limit ?? 100;
    const offset = params.offset ?? 0;
    const ids = appIds.slice(offset, offset + limit);
    const items = await db
      .select({
        id: apps.id,
        slug: apps.slug,
        name: apps.name,
        description: apps.description,
        descriptionZh: apps.descriptionZh,
        features: apps.features,
        verified: apps.verified,
        ownerName: apps.ownerName,
        categoryId: categories.id,
        categoryName: categories.name,
        categorySlug: categories.slug,
      })
      .from(apps)
      .leftJoin(categories, eq(apps.categoryId, categories.id))
      .where(inArray(apps.id, ids))
      .orderBy(desc(apps.createdAt));
    const categoryById = new Map(
      items
        .filter((r) => r.categoryId)
        .map((r) => [
          r.id,
          {
            id: r.categoryId!,
            name: r.categoryName!,
            slug: r.categorySlug!,
          },
        ])
    );
    return {
      items: items.map((row) => ({
        id: row.id,
        slug: row.slug,
        name: row.name,
        description: row.description,
        descriptionZh: row.descriptionZh,
        features: row.features,
        verified: row.verified,
        ownerName: row.ownerName,
        category: row.categoryId
          ? categoryById.get(row.id) ?? null
          : null,
        tags: tagsByApp[row.id] ?? [],
      })),
      total,
    };
  },

  listSkillsForMarket: async (
    params: ListSkillsParams
  ): Promise<{ items: SkillListRow[]; total: number }> => {
    const appIds = await getAppIdsWithFilters({
      type: "skill",
      categorySlug: params.categorySlug,
      tagSlug: params.tagSlug,
      query: params.query,
    });
    const tagsByApp = await getTagsByAppIds(appIds);
    const total = appIds.length;
    if (appIds.length === 0) return { items: [], total: 0 };
    const limit = params.limit ?? 100;
    const offset = params.offset ?? 0;
    const ids = appIds.slice(offset, offset + limit);
    const items = await db
      .select({
        id: apps.id,
        slug: apps.slug,
        name: apps.name,
        description: apps.description,
        version: apps.version,
        verified: apps.verified,
        ownerName: apps.ownerName,
        categoryId: categories.id,
        categoryName: categories.name,
        categorySlug: categories.slug,
      })
      .from(apps)
      .leftJoin(categories, eq(apps.categoryId, categories.id))
      .where(inArray(apps.id, ids))
      .orderBy(desc(apps.createdAt));
    const categoryById = new Map(
      items
        .filter((r) => r.categoryId)
        .map((r) => [
          r.id,
          {
            id: r.categoryId!,
            name: r.categoryName!,
            slug: r.categorySlug!,
          },
        ])
    );
    return {
      items: items.map((row) => ({
        id: row.id,
        slug: row.slug,
        name: row.name,
        description: row.description,
        version: row.version,
        verified: row.verified,
        ownerName: row.ownerName,
        category: row.categoryId
          ? categoryById.get(row.id) ?? null
          : null,
        tags: tagsByApp[row.id] ?? [],
      })),
      total,
    };
  },

  listMcpForMarket: async (
    params: ListMcpParams
  ): Promise<{ items: McpListRow[]; total: number }> => {
    const appIds = await getAppIdsWithFilters({
      type: params.type,
      categorySlug: params.categorySlug,
      tagSlug: params.tagSlug,
      query: params.query,
    });
    const tagsByApp = await getTagsByAppIds(appIds);
    const total = appIds.length;
    if (appIds.length === 0) return { items: [], total: 0 };
    const limit = params.limit ?? 100;
    const offset = params.offset ?? 0;
    const ids = appIds.slice(offset, offset + limit);
    const items = await db
      .select({
        id: apps.id,
        slug: apps.slug,
        name: apps.name,
        icon: apps.icon,
        description: apps.description,
        descriptionZh: apps.descriptionZh,
        stars: apps.stars,
        contributors: apps.contributors,
        primaryLanguage: apps.primaryLanguage,
        languages: apps.languages,
        createdAt: apps.createdAt,
      })
      .from(apps)
      .where(inArray(apps.id, ids))
      .orderBy(desc(apps.createdAt));
    return {
      items: items.map((row) => ({
        id: row.id,
        slug: row.slug,
        name: row.name,
        icon: row.icon,
        description: row.description,
        descriptionZh: row.descriptionZh,
        stars: row.stars,
        contributors: row.contributors,
        primaryLanguage: row.primaryLanguage,
        languages: row.languages,
        createdAt: row.createdAt,
        tags: tagsByApp[row.id] ?? [],
      })),
      total,
    };
  },

  getPersonaById: async (id: string) => {
    const [app] = await db
      .select({
        id: apps.id,
        slug: apps.slug,
        name: apps.name,
        description: apps.description,
        descriptionZh: apps.descriptionZh,
        features: apps.features,
        tools: apps.tools,
        verified: apps.verified,
        ownerName: apps.ownerName,
        categoryId: categories.id,
        categoryName: categories.name,
        categorySlug: categories.slug,
      })
      .from(apps)
      .leftJoin(categories, eq(apps.categoryId, categories.id))
      .where(and(eq(apps.id, id), eq(apps.type, "persona"), ...marketplaceBaseConditions));
    if (!app) return null;
    const [tagRows, skillLinks, mcpLinks] = await Promise.all([
      db
        .select({ id: tags.id, name: tags.name })
        .from(appTags)
        .innerJoin(tags, eq(appTags.tagId, tags.id))
        .where(eq(appTags.appId, id)),
      db.select({ skillId: personaSkills.skillId }).from(personaSkills).where(eq(personaSkills.personaId, id)),
      db.select({ mcpAppId: personaMcpTools.mcpAppId }).from(personaMcpTools).where(eq(personaMcpTools.personaId, id)),
    ]);
    const skillIds = skillLinks.map((l) => l.skillId);
    const mcpAppIds = mcpLinks.map((l) => l.mcpAppId);
    const [skillsMinimal, mcpAppsMinimal] = await Promise.all([
      skillIds.length > 0
        ? db
            .select({ id: apps.id, name: apps.name, slug: apps.slug })
            .from(apps)
            .where(and(inArray(apps.id, skillIds), ...marketplaceBaseConditions))
        : Promise.resolve([]),
      mcpAppIds.length > 0
        ? db
            .select({ id: apps.id, name: apps.name, slug: apps.slug })
            .from(apps)
            .where(and(inArray(apps.id, mcpAppIds), ...marketplaceBaseConditions))
        : Promise.resolve([]),
    ]);
    return {
      ...app,
      category: app.categoryId
        ? { id: app.categoryId, name: app.categoryName!, slug: app.categorySlug! }
        : null,
      tags: tagRows,
      skillIds,
      mcpAppIds,
      skills: skillsMinimal,
      mcpApps: mcpAppsMinimal,
    };
  },

  getPersonaBySlug: async (slug: string) => {
    const [app] = await db
      .select({
        id: apps.id,
        slug: apps.slug,
        name: apps.name,
        description: apps.description,
        descriptionZh: apps.descriptionZh,
        features: apps.features,
        tools: apps.tools,
        verified: apps.verified,
        ownerName: apps.ownerName,
        categoryId: categories.id,
        categoryName: categories.name,
        categorySlug: categories.slug,
      })
      .from(apps)
      .leftJoin(categories, eq(apps.categoryId, categories.id))
      .where(and(eq(apps.slug, slug), eq(apps.type, "persona"), ...marketplaceBaseConditions));
    if (!app) return null;
    const id = app.id;
    const [tagRows, skillLinks, mcpLinks] = await Promise.all([
      db
        .select({ id: tags.id, name: tags.name })
        .from(appTags)
        .innerJoin(tags, eq(appTags.tagId, tags.id))
        .where(eq(appTags.appId, id)),
      db.select({ skillId: personaSkills.skillId }).from(personaSkills).where(eq(personaSkills.personaId, id)),
      db.select({ mcpAppId: personaMcpTools.mcpAppId }).from(personaMcpTools).where(eq(personaMcpTools.personaId, id)),
    ]);
    const skillIds = skillLinks.map((l) => l.skillId);
    const mcpAppIds = mcpLinks.map((l) => l.mcpAppId);
    const [skillsMinimal, mcpAppsMinimal] = await Promise.all([
      skillIds.length > 0
        ? db
            .select({ id: apps.id, name: apps.name, slug: apps.slug })
            .from(apps)
            .where(and(inArray(apps.id, skillIds), ...marketplaceBaseConditions))
        : Promise.resolve([]),
      mcpAppIds.length > 0
        ? db
            .select({ id: apps.id, name: apps.name, slug: apps.slug })
            .from(apps)
            .where(and(inArray(apps.id, mcpAppIds), ...marketplaceBaseConditions))
        : Promise.resolve([]),
    ]);
    return {
      ...app,
      category: app.categoryId
        ? { id: app.categoryId, name: app.categoryName!, slug: app.categorySlug! }
        : null,
      tags: tagRows,
      skillIds,
      mcpAppIds,
      skills: skillsMinimal,
      mcpApps: mcpAppsMinimal,
    };
  },

  getSkillById: async (id: string) => {
    const [app] = await db
      .select({
        id: apps.id,
        slug: apps.slug,
        name: apps.name,
        description: apps.description,
        descriptionZh: apps.descriptionZh,
        longDescription: apps.longDescription,
        version: apps.version,
        tools: apps.tools,
        verified: apps.verified,
        ownerName: apps.ownerName,
        categoryId: categories.id,
        categoryName: categories.name,
        categorySlug: categories.slug,
      })
      .from(apps)
      .leftJoin(categories, eq(apps.categoryId, categories.id))
      .where(and(eq(apps.id, id), eq(apps.type, "skill"), ...marketplaceBaseConditions));
    if (!app) return null;
    const [tagRows, mcpLinks, personaLinks] = await Promise.all([
      db
        .select({ id: tags.id, name: tags.name })
        .from(appTags)
        .innerJoin(tags, eq(appTags.tagId, tags.id))
        .where(eq(appTags.appId, id)),
      db.select({ mcpAppId: skillMcpTools.mcpAppId }).from(skillMcpTools).where(eq(skillMcpTools.skillId, id)),
      db.select({ personaId: personaSkills.personaId }).from(personaSkills).where(eq(personaSkills.skillId, id)),
    ]);
    const mcpAppIds = mcpLinks.map((l) => l.mcpAppId);
    const personaIds = personaLinks.map((l) => l.personaId);
    const [personasMinimal, mcpAppsMinimal] = await Promise.all([
      personaIds.length > 0
        ? db
            .select({ id: apps.id, name: apps.name, slug: apps.slug })
            .from(apps)
            .where(and(inArray(apps.id, personaIds), ...marketplaceBaseConditions))
        : Promise.resolve([]),
      mcpAppIds.length > 0
        ? db
            .select({ id: apps.id, name: apps.name, slug: apps.slug })
            .from(apps)
            .where(and(inArray(apps.id, mcpAppIds), ...marketplaceBaseConditions))
        : Promise.resolve([]),
    ]);
    return {
      ...app,
      category: app.categoryId
        ? { id: app.categoryId, name: app.categoryName!, slug: app.categorySlug! }
        : null,
      tags: tagRows,
      mcpAppIds,
      personaIds,
      personas: personasMinimal,
      mcpApps: mcpAppsMinimal,
    };
  },

  getSkillBySlug: async (slug: string) => {
    const [app] = await db
      .select({
        id: apps.id,
        slug: apps.slug,
        name: apps.name,
        description: apps.description,
        descriptionZh: apps.descriptionZh,
        longDescription: apps.longDescription,
        version: apps.version,
        tools: apps.tools,
        verified: apps.verified,
        ownerName: apps.ownerName,
        categoryId: categories.id,
        categoryName: categories.name,
        categorySlug: categories.slug,
      })
      .from(apps)
      .leftJoin(categories, eq(apps.categoryId, categories.id))
      .where(and(eq(apps.slug, slug), eq(apps.type, "skill"), ...marketplaceBaseConditions));
    if (!app) return null;
    const id = app.id;
    const [tagRows, mcpLinks, personaLinks] = await Promise.all([
      db
        .select({ id: tags.id, name: tags.name })
        .from(appTags)
        .innerJoin(tags, eq(appTags.tagId, tags.id))
        .where(eq(appTags.appId, id)),
      db.select({ mcpAppId: skillMcpTools.mcpAppId }).from(skillMcpTools).where(eq(skillMcpTools.skillId, id)),
      db.select({ personaId: personaSkills.personaId }).from(personaSkills).where(eq(personaSkills.skillId, id)),
    ]);
    const mcpAppIds = mcpLinks.map((l) => l.mcpAppId);
    const personaIds = personaLinks.map((l) => l.personaId);
    const [personasMinimal, mcpAppsMinimal] = await Promise.all([
      personaIds.length > 0
        ? db
            .select({ id: apps.id, name: apps.name, slug: apps.slug })
            .from(apps)
            .where(and(inArray(apps.id, personaIds), ...marketplaceBaseConditions))
        : Promise.resolve([]),
      mcpAppIds.length > 0
        ? db
            .select({ id: apps.id, name: apps.name, slug: apps.slug })
            .from(apps)
            .where(and(inArray(apps.id, mcpAppIds), ...marketplaceBaseConditions))
        : Promise.resolve([]),
    ]);
    return {
      ...app,
      category: app.categoryId
        ? { id: app.categoryId, name: app.categoryName!, slug: app.categorySlug! }
        : null,
      tags: tagRows,
      mcpAppIds,
      personaIds,
      personas: personasMinimal,
      mcpApps: mcpAppsMinimal,
    };
  },
};
