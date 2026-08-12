import { asc, count, like } from 'drizzle-orm';
import { db } from '../../utils/db';
import { categories } from '../../db/schema';
import { toCategoryModel } from '../../utils/serializers';
import { buildPaginationMeta, parsePagination } from '../../utils/pagination';

export default defineEventHandler(async (event) => {
  const query = getQuery(event);
  const { page, limit, offset } = parsePagination(query);
  const search = typeof query.search === 'string' ? query.search.trim() : '';

  const whereClause = search ? like(categories.name, `%${search}%`) : undefined;

  const [rows, totalRows] = await Promise.all([
    db.select().from(categories).where(whereClause).orderBy(asc(categories.name)).limit(limit).offset(offset),
    db.select({ total: count() }).from(categories).where(whereClause),
  ]);

  return {
    data: rows.map(toCategoryModel),
    pagination: buildPaginationMeta(page, limit, totalRows[0]?.total ?? 0),
  };
});
