import { connectDB } from '../../utils/db';
import { Category } from '../../models/Category';
import { apiError } from '../../utils/apiError';
import { isDuplicateKeyError, parseCategoryImageUpload } from '../../utils/requestValidation';
import { isValidObjectId } from '../../utils/mongo';
import { destroyImageByPublicId, uploadCategoryImage } from '../../utils/cloudinary';
import { requireLogin } from '../../utils/requireLogin';

export default defineEventHandler(async (event) => {
  await requireLogin(event);
  await connectDB();

  const id = getRouterParam(event, 'id');
  if (!id || !isValidObjectId(id)) return apiError(400, 'Invalid category id');

  const existing = await Category.findById(id);
  if (!existing) return apiError(404, 'Category not found');

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

  if (body.categoryImage !== undefined && body.categoryImage !== null) {
    if (body.categoryImage === false) {
      if (existing.categoryImage?.publicId) {
        previousImagePublicId = existing.categoryImage.publicId;
      }
      $unset.categoryImage = '';
    } else {
      previousImagePublicId = existing.categoryImage?.publicId;
      const imageParsed = parseCategoryImageUpload(body.categoryImage);
      if (!imageParsed.ok) return apiError(400, imageParsed.error);
      try {
        const uploaded = await uploadCategoryImage(id, imageParsed.data.dataUri);
        orphanNewImagePublicId = uploaded.publicId;
        $set.categoryImage = { publicId: uploaded.publicId, secureUrl: uploaded.secureUrl };
      } catch (err) {
        console.error(err);
        return apiError(502, 'Image upload failed');
      }
    }
  }

  const mongoUpdate: Record<string, unknown> = {};
  if (Object.keys($set).length > 0) mongoUpdate.$set = $set;
  if (Object.keys($unset).length > 0) mongoUpdate.$unset = $unset;
  if (Object.keys(mongoUpdate).length === 0) {
    return apiError(400, 'No valid fields to update');
  }

  try {
    const doc = await Category.findByIdAndUpdate(id, mongoUpdate, { returnDocument: 'after', runValidators: true });
    if (!doc) {
      if (orphanNewImagePublicId) void destroyImageByPublicId(orphanNewImagePublicId);
      return apiError(404, 'Category not found');
    }
    if (previousImagePublicId) void destroyImageByPublicId(previousImagePublicId);
    return doc;
  } catch (err: unknown) {
    if (orphanNewImagePublicId) void destroyImageByPublicId(orphanNewImagePublicId);
    if (isDuplicateKeyError(err)) return apiError(409, 'A category with this name already exists');
    throw err;
  }
});
