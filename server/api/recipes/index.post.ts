import { connectDB } from '../../utils/db';
import { Recipe } from '../../models/Recipe';
import { Category } from '../../models/Category';
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
  await connectDB();

  const body = await readBody<Record<string, unknown>>(event);
  const name = body.name;
  if (typeof name !== 'string' || !name.trim()) {
    return apiError(400, 'name is required');
  }

  const categoriesResult = parseRecipeCategories(body.categories);
  if (!categoriesResult.ok) return apiError(400, categoriesResult.error);
  const categoryIds = categoriesResult.value;
  const foundCount = await Category.countDocuments({ _id: { $in: categoryIds } });
  if (foundCount !== categoryIds.length) {
    return apiError(400, 'One or more categories do not exist');
  }

  const ingredientsResult = parseRecipeIngredients(body.ingredients);
  if (!ingredientsResult.ok) return apiError(400, ingredientsResult.error);
  const stepsResult = parseRecipeSteps(body.steps);
  if (!stepsResult.ok) return apiError(400, stepsResult.error);

  const sourceUrlRaw = body.sourceUrl;
  const sourceUrl = typeof sourceUrlRaw === 'string' && sourceUrlRaw.trim() ? sourceUrlRaw.trim() : undefined;

  const doc = await Recipe.create({
    name: name.trim(),
    categories: categoryIds,
    description: typeof body.description === 'string' ? body.description.trim() : undefined,
    ...(ingredientsResult.value !== undefined ? { ingredients: ingredientsResult.value } : {}),
    steps: stepsResult.value,
    createdBy: user.id,
    ...(sourceUrl !== undefined ? { sourceUrl } : {}),
  });

  const rawRecipeImage = body.recipeImage;
  if (rawRecipeImage !== undefined && rawRecipeImage !== null) {
    const imageParsed = parseRecipeImageUpload(rawRecipeImage);
    if (!imageParsed.ok) {
      await Recipe.findByIdAndDelete(doc._id);
      return apiError(400, imageParsed.error);
    }
    try {
      const uploaded = await uploadRecipeImage(String(doc._id), imageParsed.data.dataUri);
      doc.recipeImage = { publicId: uploaded.publicId, secureUrl: uploaded.secureUrl };
      await doc.save();
    } catch (err) {
      console.error(err);
      await Recipe.findByIdAndDelete(doc._id);
      return apiError(502, 'Image upload failed');
    }
  }

  setResponseStatus(event, 201);
  return doc;
});
