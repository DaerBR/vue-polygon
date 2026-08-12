import { and, asc, count, desc, eq, inArray, like } from 'drizzle-orm';
import { db } from '../../utils/db';
import { recipeCategories, recipes } from '../../db/schema';
import { toRecipeTableModel } from '../../utils/serializers';
import { buildPaginationMeta, parsePagination } from '../../utils/pagination';
import { apiError } from '../../utils/apiError';

export default defineEventHandler(async (event) => {
  const query = getQuery(event);
  const { page, limit, offset } = parsePagination(query);
  const search = typeof query.search === 'string' ? query.search.trim() : '';

  const categoriesQueryRaw = query.categories;
  const categoryIds =
    typeof categoriesQueryRaw === 'string' && categoriesQueryRaw.trim()
      ? [
          ...new Set(
            categoriesQueryRaw
              .split(',')
              .map((s) => s.trim())
              .filter(Boolean),
          ),
        ]
      : [];

  const orderRaw = typeof query.order === 'string' ? query.order.trim().toLowerCase() : '';
  if (orderRaw !== '' && orderRaw !== 'asc' && orderRaw !== 'desc') {
    return apiError(400, 'order must be asc or desc');
  }

  const recipeAuthor = typeof query.recipeAuthor === 'string' ? query.recipeAuthor.trim() : '';

  const conditions = [];
  if (search) conditions.push(like(recipes.name, `%${search}%`));
  if (categoryIds.length > 0) {
    conditions.push(
      inArray(
        recipes.id,
        db
          .select({ id: recipeCategories.recipeId })
          .from(recipeCategories)
          .where(inArray(recipeCategories.categoryId, categoryIds)),
      ),
    );
  }
  if (recipeAuthor) conditions.push(eq(recipes.createdBy, recipeAuthor));

  const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

  const [rows, totalRows] = await Promise.all([
    db.query.recipes.findMany({
      where: whereClause,
      with: { recipeCategories: { with: { category: true } } },
      orderBy: orderRaw === 'asc' ? asc(recipes.updatedAt) : desc(recipes.updatedAt),
      limit,
      offset,
    }),
    db.select({ total: count() }).from(recipes).where(whereClause),
  ]);

  return {
    data: rows.map(toRecipeTableModel),
    pagination: buildPaginationMeta(page, limit, totalRows[0]?.total ?? 0),
  };
});
