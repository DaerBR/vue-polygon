import { eq } from 'drizzle-orm';
import { db } from '../../utils/db';
import { categories, recipeCategories } from '../../db/schema';
import { apiError } from '../../utils/apiError';
import { destroyImageByPublicId } from '../../utils/cloudinary';
import { requireLogin } from '../../utils/requireLogin';

export default defineEventHandler(async (event) => {
  await requireLogin(event);

  const id = getRouterParam(event, 'id');
  if (!id) return apiError(400, 'Invalid category id');

  const usage = await db.select().from(recipeCategories).where(eq(recipeCategories.categoryId, id));
  if (usage.length > 0) {
    return apiError(409, 'This category is used by one or more recipes and cannot be deleted', {
      recipeCount: usage.length,
    });
  }

  const existing = await db.query.categories.findFirst({ where: eq(categories.id, id) });
  if (!existing) return apiError(404, 'Category not found');

  await db.delete(categories).where(eq(categories.id, id));
  if (existing.categoryImagePublicId) void destroyImageByPublicId(existing.categoryImagePublicId);

  setResponseStatus(event, 204);
  return null;
});
