import { int, sqliteTable, text } from 'drizzle-orm/sqlite-core';

export const usersTestTable = sqliteTable('usersTest', {
  id: int().primaryKey({ autoIncrement: true }),
  name: text().notNull(),
  email: text().notNull().unique(),
});
