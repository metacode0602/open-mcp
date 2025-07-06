import { drizzle } from "drizzle-orm/vercel-postgres";
import { sql } from "@vercel/postgres";
import { migrate } from "drizzle-orm/vercel-postgres/migrator";

const db = drizzle(sql);

export async function migratation() {
  console.log("Migration started");
  await migrate(db, { migrationsFolder: "./drizzle" });
  console.log("Migration completed");
  await sql.end();
}
