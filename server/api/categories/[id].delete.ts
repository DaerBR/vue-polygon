import { connectDB } from '../../utils/db';
import { Category } from '../../models/Category';
import { Recipe } from '../../models/Recipe';
import { apiError } from '../../utils/apiError';
import { isValidObjectId } from '../../utils/mongo';
import { destroyImageByPublicId } from '../../utils/cloudinary';
import { requireLogin } from '../../utils/requireLogin';

export default defineEventHandler(async (event) => {
  await requireLogin(event);
  await connectDB();

  const id = getRouterParam(event, 'id');
  if (!id || !isValidObjectId(id)) return apiError(400, 'Invalid category id');

  const inUse = await Recipe.countDocuments({ categories: id });
  if (inUse > 0) {
    return apiError(409, 'This category is used by one or more recipes and cannot be deleted', {
      recipeCount: inUse,
    });
  }

  const existing = await Category.findById(id).lean();
  if (!existing) return apiError(404, 'Category not found');

  await Category.findByIdAndDelete(id);
  const imagePublicId = existing.categoryImage?.publicId;
  if (imagePublicId) void destroyImageByPublicId(imagePublicId);

  setResponseStatus(event, 204);
  return null;
});
