import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

import * as schema from "./schema";

// Runtime queries go through the Supabase *transaction* pooler (port 6543).
// Transaction-mode pooling does not support prepared statements, so
// `prepare: false` is required -- otherwise queries intermittently fail.
// Migrations use the session pooler (5432, `DATABASE_URL`) via drizzle-kit.
const client = postgres(process.env.DATABASE_POOL_URL, { prepare: false });

export const db = drizzle(client, { schema });

export { schema };
