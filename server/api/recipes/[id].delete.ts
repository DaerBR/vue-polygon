import { eq } from 'drizzle-orm';
import { db } from '../../utils/db';
import { recipes } from '../../db/schema';
import { apiError } from '../../utils/apiError';
import { destroyImageByPublicId } from '../../utils/cloudinary';
import { requireLogin } from '../../utils/requireLogin';

export default defineEventHandler(async (event) => {
  await requireLogin(event);

  const id = getRouterParam(event, 'id');
  if (!id) return apiError(400, 'Invalid recipe id');

  const existing = await db.query.recipes.findFirst({ where: eq(recipes.id, id) });
  if (!existing) return apiError(404, 'Recipe not found');

  await db.delete(recipes).where(eq(recipes.id, id));
  if (existing.recipeImagePublicId) void destroyImageByPublicId(existing.recipeImagePublicId);

  setResponseStatus(event, 204);
  return null;
});
