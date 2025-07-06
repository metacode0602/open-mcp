// import { drizzle } from "drizzle-orm/node-postgres"
import { drizzle } from "drizzle-orm/vercel-postgres";
import * as schema from "./schema";

import { sql } from "@vercel/postgres";

export const db = drizzle(sql, { schema, logger: true });
// const db = drizzle(pool, { logger: true, schema });
// export { db }

// Export utils functions
export { slugifyText, generateSlug, generateUniqueString } from "./utils/generate-string";
export { generateRandomName } from "./utils/random-name";