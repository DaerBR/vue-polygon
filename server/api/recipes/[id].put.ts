import { asc, eq, inArray } from 'drizzle-orm';
import { db } from '../../utils/db';
import { categories, recipeCategories, recipeIngredients, recipes, recipeSteps } from '../../db/schema';
import { toRecipeDetailModel } from '../../utils/serializers';
import { apiError } from '../../utils/apiError';
import {
  parseRecipeCategories,
  parseRecipeImageUpload,
  parseRecipeIngredients,
  parseRecipeSteps,
} from '../../utils/requestValidation';
import { destroyImageByPublicId, uploadRecipeImage } from '../../utils/cloudinary';
import { requireLogin } from '../../utils/requireLogin';

export default defineEventHandler(async (event) => {
  await requireLogin(event);

  const id = getRouterParam(event, 'id');
  if (!id) return apiError(400, 'Invalid recipe id');

  const existing = await db.query.recipes.findFirst({ where: eq(recipes.id, id) });
  if (!existing) return apiError(404, 'Recipe not found');

  const body = await readBody<Record<string, unknown>>(event);
  const updates: Partial<typeof recipes.$inferInsert> = {};
  let previousImagePublicId: string | undefined;

  if (body.name !== undefined) {
    if (typeof body.name !== 'string' || !body.name.trim()) {
      return apiError(400, 'name must be a non-empty string');
    }
    updates.name = body.name.trim();
  }

  let newCategoryIds: string[] | undefined;
  if (body.categories !== undefined) {
    const categoriesResult = parseRecipeCategories(body.categories);
    if (!categoriesResult.ok) return apiError(400, categoriesResult.error);
    newCategoryIds = categoriesResult.value;
    const foundCategories = await db
      .select({ id: categories.id })
      .from(categories)
      .where(inArray(categories.id, newCategoryIds));
    if (foundCategories.length !== newCategoryIds.length) {
      return apiError(400, 'One or more categories do not exist');
    }
  }

  if (body.description !== undefined) {
    updates.description = typeof body.description === 'string' ? body.description.trim() : '';
  }

  if (body.sourceUrl !== undefined) {
    if (body.sourceUrl === null) {
      updates.sourceUrl = null;
    } else if (typeof body.sourceUrl === 'string') {
      const trimmed = body.sourceUrl.trim();
      updates.sourceUrl = trimmed === '' ? null : trimmed;
    } else {
      return apiError(400, 'sourceUrl must be a string or null');
    }
  }

  let newSteps: { stepDescription: string }[] | undefined;
  if (body.steps !== undefined) {
    const stepsResult = parseRecipeSteps(body.steps);
    if (!stepsResult.ok) return apiError(400, stepsResult.error);
    newSteps = stepsResult.value;
  }

  let newIngredients: { text: string }[] | undefined | null;
  if (body.ingredients !== undefined) {
    if (body.ingredients === null) {
      newIngredients = null;
    } else {
      const ingredientsResult = parseRecipeIngredients(body.ingredients);
      if (!ingredientsResult.ok) return apiError(400, ingredientsResult.error);
      newIngredients = ingredientsResult.value ?? [];
    }
  }

  if (body.recipeImage !== undefined && body.recipeImage !== null) {
    if (body.recipeImage === false) {
      if (existing.recipeImagePublicId) previousImagePublicId = existing.recipeImagePublicId;
      updates.recipeImagePublicId = null;
      updates.recipeImageSecureUrl = null;
    } else {
      previousImagePublicId = existing.recipeImagePublicId ?? undefined;
      const imageParsed = parseRecipeImageUpload(body.recipeImage);
      if (!imageParsed.ok) return apiError(400, imageParsed.error);
      try {
        const uploaded = await uploadRecipeImage(id, imageParsed.data.dataUri);
        updates.recipeImagePublicId = uploaded.publicId;
        updates.recipeImageSecureUrl = uploaded.secureUrl;
      } catch (err) {
        console.error(err);
        return apiError(502, 'Image upload failed');
      }
    }
  }

  const hasAnyChange =
    Object.keys(updates).length > 0 ||
    newCategoryIds !== undefined ||
    newSteps !== undefined ||
    newIngredients !== undefined;
  if (!hasAnyChange) return apiError(400, 'No valid fields to update');

  updates.updatedAt = new Date();
  await db.update(recipes).set(updates).where(eq(recipes.id, id));

  if (newCategoryIds !== undefined) {
    await db.delete(recipeCategories).where(eq(recipeCategories.recipeId, id));
    await db.insert(recipeCategories).values(newCategoryIds.map((categoryId) => ({ recipeId: id, categoryId })));
  }

  if (newSteps !== undefined) {
    await db.delete(recipeSteps).where(eq(recipeSteps.recipeId, id));
    await db
      .insert(recipeSteps)
      .values(newSteps.map((step, index) => ({ recipeId: id, stepDescription: step.stepDescription, position: index })));
  }

  if (newIngredients !== undefined) {
    await db.delete(recipeIngredients).where(eq(recipeIngredients.recipeId, id));
    if (newIngredients && newIngredients.length > 0) {
      await db
        .insert(recipeIngredients)
        .values(newIngredients.map((ingredient, index) => ({ recipeId: id, text: ingredient.text, position: index })));
    }
  }

  if (previousImagePublicId) void destroyImageByPublicId(previousImagePublicId);

  const full = await db.query.recipes.findFirst({
    where: eq(recipes.id, id),
    with: {
      recipeCategories: { with: { category: true } },
      ingredients: { orderBy: asc(recipeIngredients.position) },
      steps: { orderBy: asc(recipeSteps.position) },
      createdByUser: true,
    },
  });

  return toRecipeDetailModel(full!);
});
