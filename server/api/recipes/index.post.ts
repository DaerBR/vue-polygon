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
import { uploadRecipeImage } from '../../utils/cloudinary';
import { requireLogin } from '../../utils/requireLogin';

export default defineEventHandler(async (event) => {
  const user = await requireLogin(event);

  const body = await readBody<Record<string, unknown>>(event);
  const name = body.name;
  if (typeof name !== 'string' || !name.trim()) {
    return apiError(400, 'name is required');
  }

  const categoriesResult = parseRecipeCategories(body.categories);
  if (!categoriesResult.ok) return apiError(400, categoriesResult.error);
  const categoryIds = categoriesResult.value;

  const foundCategories = await db
    .select({ id: categories.id })
    .from(categories)
    .where(inArray(categories.id, categoryIds));
  if (foundCategories.length !== categoryIds.length) {
    return apiError(400, 'One or more categories do not exist');
  }

  const ingredientsResult = parseRecipeIngredients(body.ingredients);
  if (!ingredientsResult.ok) return apiError(400, ingredientsResult.error);

  const stepsResult = parseRecipeSteps(body.steps);
  if (!stepsResult.ok) return apiError(400, stepsResult.error);

  const sourceUrlRaw = body.sourceUrl;
  const sourceUrl = typeof sourceUrlRaw === 'string' && sourceUrlRaw.trim() ? sourceUrlRaw.trim() : undefined;

  const [created] = await db
    .insert(recipes)
    .values({
      name: name.trim(),
      description: typeof body.description === 'string' ? body.description.trim() : undefined,
      createdBy: user.id,
      sourceUrl,
    })
    .returning();

  if (!created) return apiError(500, 'Failed to create recipe');

  await db.insert(recipeCategories).values(categoryIds.map((categoryId) => ({ recipeId: created.id, categoryId })));

  if (ingredientsResult.value && ingredientsResult.value.length > 0) {
    await db
      .insert(recipeIngredients)
      .values(ingredientsResult.value.map((ingredient, index) => ({ recipeId: created.id, text: ingredient.text, position: index })));
  }

  await db
    .insert(recipeSteps)
    .values(stepsResult.value.map((step, index) => ({ recipeId: created.id, stepDescription: step.stepDescription, position: index })));

  const rawRecipeImage = body.recipeImage;
  if (rawRecipeImage !== undefined && rawRecipeImage !== null) {
    const imageParsed = parseRecipeImageUpload(rawRecipeImage);
    if (!imageParsed.ok) {
      await db.delete(recipes).where(eq(recipes.id, created.id));
      return apiError(400, imageParsed.error);
    }
    try {
      const uploaded = await uploadRecipeImage(created.id, imageParsed.data.dataUri);
      await db
        .update(recipes)
        .set({ recipeImagePublicId: uploaded.publicId, recipeImageSecureUrl: uploaded.secureUrl })
        .where(eq(recipes.id, created.id));
    } catch (err) {
      console.error(err);
      await db.delete(recipes).where(eq(recipes.id, created.id));
      return apiError(502, 'Image upload failed');
    }
  }

  const full = await db.query.recipes.findFirst({
    where: eq(recipes.id, created.id),
    with: {
      recipeCategories: { with: { category: true } },
      ingredients: { orderBy: asc(recipeIngredients.position) },
      steps: { orderBy: asc(recipeSteps.position) },
      createdByUser: true,
    },
  });

  setResponseStatus(event, 201);
  return toRecipeDetailModel(full!);
});
