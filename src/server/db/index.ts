import { drizzle } from "drizzle-orm/libsql";
import { createClient } from "@libsql/client";
import { env } from "@/env.js";

const client = createClient({
  url: env.DATABASE_URL,
  authToken: env.AUTH_TOKEN,
});

export const db = drizzle(client);
