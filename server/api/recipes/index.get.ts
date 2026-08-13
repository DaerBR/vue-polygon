import { connectDB } from '../../utils/db';
import { Recipe } from '../../models/Recipe';
import { renameMongoIdsForClient } from '../../utils/renameMongoIdsForClient';
import { buildPaginationMeta, parsePagination } from '../../utils/pagination';
import { escapeRegex } from '../../utils/requestValidation';
import { isValidObjectId } from '../../utils/mongo';
import { apiError } from '../../utils/apiError';

export default defineEventHandler(async (event) => {
  await connectDB();

  const query = getQuery(event);
  const { page, limit, skip } = parsePagination(query);
  const search = typeof query.search === 'string' ? query.search.trim() : '';

  const categoriesQueryRaw = query.categories;
  const categoryIdsFromQuery =
    typeof categoriesQueryRaw === 'string' && categoriesQueryRaw.trim()
      ? [...new Set(categoriesQueryRaw.split(',').map((s) => s.trim()).filter(Boolean))]
      : [];

  const orderRaw = typeof query.order === 'string' ? query.order.trim().toLowerCase() : '';
  let updatedAtSort: 1 | -1 = -1;
  if (orderRaw === '' || orderRaw === 'desc') {
    updatedAtSort = -1;
  } else if (orderRaw === 'asc') {
    updatedAtSort = 1;
  } else {
    return apiError(400, 'order must be asc or desc');
  }

  const recipeAuthorRaw = typeof query.recipeAuthor === 'string' ? query.recipeAuthor.trim() : '';

  const filter: Record<string, unknown> = {};
  if (search) {
    filter.name = { $regex: escapeRegex(search), $options: 'i' };
  }
  if (categoryIdsFromQuery.length > 0) {
    for (const cid of categoryIdsFromQuery) {
      if (!isValidObjectId(cid)) {
        return apiError(400, 'categories query must be comma-separated valid ObjectIds');
      }
    }
    filter.categories = { $in: categoryIdsFromQuery };
  }
  if (recipeAuthorRaw) {
    if (!isValidObjectId(recipeAuthorRaw)) {
      return apiError(400, 'recipeAuthor must be a valid user id');
    }
    filter.createdBy = recipeAuthorRaw;
  }

  const [total, rows] = await Promise.all([
    Recipe.countDocuments(filter),
    Recipe.find(filter)
      .select('_id name categories description recipeImage createdAt updatedAt')
      .populate('categories', 'name')
      .sort({ updatedAt: updatedAtSort })
      .skip(skip)
      .limit(limit)
      .lean(),
  ]);

  return {
    data: renameMongoIdsForClient(rows),
    pagination: buildPaginationMeta(page, limit, total),
  };
});
