import { connectDB } from '../../utils/db';
import { Recipe } from '../../models/Recipe';
import { Category } from '../../models/Category';
import { apiError } from '../../utils/apiError';
import { isValidObjectId } from '../../utils/mongo';
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
  await connectDB();

  const id = getRouterParam(event, 'id');
  if (!id || !isValidObjectId(id)) return apiError(400, 'Invalid recipe id');

  const existing = await Recipe.findById(id);
  if (!existing) return apiError(404, 'Recipe not found');

  const body = await readBody<Record<string, unknown>>(event);
  const $set: Record<string, unknown> = {};
  const $unset: Record<string, ''> = {};
  let previousImagePublicId: string | undefined;
  let orphanNewImagePublicId: string | undefined;

  if (body.name !== undefined) {
    if (typeof body.name !== 'string' || !body.name.trim()) {
      return apiError(400, 'name must be a non-empty string');
    }
    $set.name = body.name.trim();
  }

  if (body.categories !== undefined) {
    const categoriesResult = parseRecipeCategories(body.categories);
    if (!categoriesResult.ok) return apiError(400, categoriesResult.error);
    const categoryIds = categoriesResult.value;
    const foundCount = await Category.countDocuments({ _id: { $in: categoryIds } });
    if (foundCount !== categoryIds.length) return apiError(400, 'One or more categories do not exist');
    $set.categories = categoryIds;
  }

  if (body.description !== undefined) {
    $set.description = typeof body.description === 'string' ? body.description.trim() : '';
  }

  if (body.sourceUrl !== undefined) {
    if (body.sourceUrl === null) {
      $unset.sourceUrl = '';
    } else if (typeof body.sourceUrl === 'string') {
      const trimmed = body.sourceUrl.trim();
      if (trimmed === '') $unset.sourceUrl = '';
      else $set.sourceUrl = trimmed;
    } else {
      return apiError(400, 'sourceUrl must be a string or null');
    }
  }

  if (body.steps !== undefined) {
    const stepsResult = parseRecipeSteps(body.steps);
    if (!stepsResult.ok) return apiError(400, stepsResult.error);
    $set.steps = stepsResult.value;
  }

  if (body.ingredients !== undefined) {
    if (body.ingredients === null) {
      $unset.ingredients = '';
    } else {
      const ingredientsResult = parseRecipeIngredients(body.ingredients);
      if (!ingredientsResult.ok) return apiError(400, ingredientsResult.error);
      if (ingredientsResult.value !== undefined) $set.ingredients = ingredientsResult.value;
    }
  }

  if (body.recipeImage !== undefined && body.recipeImage !== null) {
    if (body.recipeImage === false) {
      if (existing.recipeImage?.publicId) previousImagePublicId = existing.recipeImage.publicId;
      $unset.recipeImage = '';
    } else {
      previousImagePublicId = existing.recipeImage?.publicId;
      const imageParsed = parseRecipeImageUpload(body.recipeImage);
      if (!imageParsed.ok) return apiError(400, imageParsed.error);
      try {
        const uploaded = await uploadRecipeImage(id, imageParsed.data.dataUri);
        orphanNewImagePublicId = uploaded.publicId;
        $set.recipeImage = { publicId: uploaded.publicId, secureUrl: uploaded.secureUrl };
      } catch (err) {
        console.error(err);
        return apiError(502, 'Image upload failed');
      }
    }
  }

  if (Object.keys($set).length === 0 && Object.keys($unset).length === 0) {
    return apiError(400, 'No valid fields to update');
  }

  $set.updatedAt = new Date();

  const mongoUpdate: Record<string, unknown> = { $set };
  if (Object.keys($unset).length > 0) mongoUpdate.$unset = $unset;

  const doc = await Recipe.findByIdAndUpdate(id, mongoUpdate, { returnDocument: 'after', runValidators: true });
  if (!doc) {
    if (orphanNewImagePublicId) void destroyImageByPublicId(orphanNewImagePublicId);
    return apiError(404, 'Recipe not found');
  }

  if (previousImagePublicId) void destroyImageByPublicId(previousImagePublicId);

  return doc;
});
