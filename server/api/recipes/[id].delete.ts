import { connectDB } from '../../utils/db';
import { Recipe } from '../../models/Recipe';
import { apiError } from '../../utils/apiError';
import { isValidObjectId } from '../../utils/mongo';
import { destroyImageByPublicId } from '../../utils/cloudinary';
import { requireLogin } from '../../utils/requireLogin';

export default defineEventHandler(async (event) => {
  await requireLogin(event);
  await connectDB();

  const id = getRouterParam(event, 'id');
  if (!id || !isValidObjectId(id)) return apiError(400, 'Invalid recipe id');

  const existing = await Recipe.findById(id).lean();
  if (!existing) return apiError(404, 'Recipe not found');

  await Recipe.findByIdAndDelete(id);
  const imagePublicId = existing.recipeImage?.publicId;
  if (imagePublicId) void destroyImageByPublicId(imagePublicId);

  setResponseStatus(event, 204);
  return null;
});
