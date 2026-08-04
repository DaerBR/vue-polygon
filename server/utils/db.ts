import { drizzle } from 'drizzle-orm/libsql';
import { createClient } from '@libsql/client';
import * as schema from '../db/schema';

// Grab the connection string from environment variables
const client = createClient({
  url: process.env.DATABASE_URL || 'file:.data/local.db',
});

export const db = drizzle(client, { schema });
