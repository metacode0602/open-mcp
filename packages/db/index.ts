import { drizzle } from "drizzle-orm/node-postgres"
import type { PgTransaction } from 'drizzle-orm/pg-core';
import type { NeonQueryResultHKT } from 'drizzle-orm/neon-serverless';
import type { ExtractTablesWithRelations } from 'drizzle-orm';

import * as schema from "./schema";

import { Pool } from "pg";
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const db = drizzle(pool, { logger: true, schema });
export { db }

// Export utils functions
export { slugifyText, generateSlug, generateUniqueString } from "./utils/generate-string";
export { generateRandomName } from "./utils/random-name";

type ExtractedRelations = ExtractTablesWithRelations<typeof schema>;

// This line may cause errors in certain versions of Drizzle ORM
// This is exported here to avoid leaking better-sqlite types outside of this package.
export type StarterDBTransaction = PgTransaction<NeonQueryResultHKT, typeof schema, ExtractedRelations>;
