import { asc, eq } from 'drizzle-orm';
import { db } from '../../utils/db';
import { recipeIngredients, recipeSteps, recipes } from '../../db/schema';
import { toRecipeDetailModel } from '../../utils/serializers';
import { apiError } from '../../utils/apiError';

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id');
  if (!id) return apiError(400, 'Invalid recipe id');

  const row = await db.query.recipes.findFirst({
    where: eq(recipes.id, id),
    with: {
      recipeCategories: { with: { category: true } },
      ingredients: { orderBy: asc(recipeIngredients.position) },
      steps: { orderBy: asc(recipeSteps.position) },
      createdByUser: true,
    },
  });

  if (!row) return apiError(404, 'Recipe not found');

  return toRecipeDetailModel(row);
});
