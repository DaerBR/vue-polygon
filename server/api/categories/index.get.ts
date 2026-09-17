import { connectDB } from '../../utils/db';
import { Category } from '../../models/Category';
import { renameMongoIdsForClient } from '../../utils/renameMongoIdsForClient';
import { buildPaginationMeta, parsePagination } from '../../utils/pagination';
import { escapeRegex } from '../../utils/requestValidation';

export default defineEventHandler(async (event) => {
  await connectDB();

  const query = getQuery(event);
  const { page, limit, skip } = parsePagination(query);
  const search = typeof query.search === 'string' ? query.search.trim() : '';

  const filter = search ? { name: { $regex: escapeRegex(search), $options: 'i' } } : {};

  const [total, data] = await Promise.all([
    Category.countDocuments(filter),
    Category.find(filter).sort({ name: 1 }).skip(skip).limit(limit).lean(),
  ]);

  return {
    data: renameMongoIdsForClient(data),
    pagination: buildPaginationMeta(page, limit, total),
  };
});
