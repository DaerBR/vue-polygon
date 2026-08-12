import { asc } from 'drizzle-orm';
import { db } from '../../utils/db';
import { categories } from '../../db/schema';
import { toCategoryModel } from '../../utils/serializers';

export default defineEventHandler(async () => {
  const rows = await db.select().from(categories).orderBy(asc(categories.name));
  return rows.map(toCategoryModel);
});
