import { connectDB } from '../../utils/db';
import { Recipe } from '../../models/Recipe';
import { apiError } from '../../utils/apiError';
import { isValidObjectId } from '../../utils/mongo';

export default defineEventHandler(async (event) => {
  await connectDB();

  const id = getRouterParam(event, 'id');
  if (!id || !isValidObjectId(id)) return apiError(400, 'Invalid recipe id');

  const doc = await Recipe.findById(id).populate('categories', 'name').populate('createdBy', 'displayName email');
  if (!doc) return apiError(404, 'Recipe not found');

  return doc;
});
