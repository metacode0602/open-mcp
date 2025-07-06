import { drizzle } from "drizzle-orm/node-postgres";
import { migrate } from "drizzle-orm/node-postgres/migrator";
import { Client } from "pg";

const pool = new Client({
  connectionString: process.env.DATABASE_URL ?? "",
});

const db = drizzle(pool);

export async function migratation() {
  console.log("Migration started");
  await migrate(db, { migrationsFolder: "./drizzle" });
  console.log("Migration completed");
  await pool.end();
}
